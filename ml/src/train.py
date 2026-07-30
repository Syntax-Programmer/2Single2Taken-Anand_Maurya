from __future__ import annotations

from collections.abc import Sequence
from pathlib import Path
from typing import Any, Literal

import joblib
import polars as pl
from sklearn.base import BaseEstimator
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

from .config import RANDOM_STATE, TEST_SIZE
from .evaluate import (
    EvaluateClassification,
    EvaluateRegression,
)
from .features import (
    ApplyTransforms,
    FeatureTransform,
    InferFeatures,
)
from .pipeline import CreatePreprocessor

TaskType = Literal["regression", "classification"]


def ValidateTrainingConfig(
    df: pl.DataFrame,
    target: str,
    task: TaskType,
) -> None:
    if target not in df.columns:
        raise ValueError(f"Target column '{target}' does not exist in dataset.")

    if task not in ("regression", "classification"):
        raise ValueError(
            f"Unsupported task type: '{task}'. "
            "Expected 'regression' or 'classification'."
        )

    if df.height == 0:
        raise ValueError("Cannot train on an empty dataset.")

    if df.get_column(target).null_count() == df.height:
        raise ValueError(f"Target column '{target}' contains only null values.")


def PrepareTrainingData(
    df: pl.DataFrame,
    target: str,
    excluded: set[str] | None = None,
    transforms: Sequence[FeatureTransform] | None = None,
) -> tuple[Any, Any, list[str], list[str]]:
    """
    Prepare a Polars DataFrame for scikit-learn training.

    Returns:
        X
        y
        numerical_features
        categorical_features
    """

    # Never mutate the caller's exclusion set.
    excluded = set(excluded or ())
    excluded.add(target)
    # Remove rows without a target value.
    df = df.filter(pl.col(target).is_not_null())

    if df.height == 0:
        raise ValueError(
            f"No training samples remain after removing "
            f"null values from target '{target}'."
        )
    # Optional feature engineering.
    if transforms:
        df = ApplyTransforms(
            df,
            list(transforms),
        )
    numerical_features, categorical_features = InferFeatures(
        df,
        excluded=excluded,
    )
    features = numerical_features + categorical_features
    if not features:
        raise ValueError(
            "No usable numerical or categorical features were found for training."
        )

    X = df.select(features).to_pandas()
    y = df.get_column(target).to_numpy()

    return (X, y, numerical_features, categorical_features)


def SplitTrainingData(
    X,
    y,
    task: TaskType,
    test_size: float = TEST_SIZE,
    random_state: int = RANDOM_STATE,
):
    """
    Split data into training and testing sets.

    Classification tasks use stratification when possible.
    """

    if not 0.0 < test_size < 1.0:
        raise ValueError(f"test_size must be between 0 and 1, got {test_size}.")

    stratify = None
    if task == "classification":
        stratify = y
    try:
        return train_test_split(
            X,
            y,
            test_size=test_size,
            random_state=random_state,
            stratify=stratify,
        )

    except ValueError as exc:
        if task != "classification":
            raise

        # Very small or highly imbalanced datasets may not
        # contain enough samples to stratify correctly.
        raise ValueError(
            "Unable to perform a stratified classification split. "
            "Check whether every class has enough samples."
        ) from exc


def CreateTrainingPipeline(
    estimator: BaseEstimator,
    numerical_features: list[str],
    categorical_features: list[str],
) -> Pipeline:
    """
    Construct the complete preprocessing + estimator pipeline.
    """

    preprocessor = CreatePreprocessor(
        numerical_features=numerical_features,
        categorical_features=categorical_features,
    )

    return Pipeline(steps=[("preprocessor", preprocessor), ("model", estimator)])


def EvaluateModel(
    pipeline: Pipeline, X_test, y_test, task: TaskType
) -> dict[str, float]:
    """
    Evaluate a fitted pipeline.
    """

    predictions = pipeline.predict(X_test)
    if task == "regression":
        return EvaluateRegression(
            y_test,
            predictions,
        )

    probabilities = None
    if hasattr(pipeline, "predict_proba"):
        probability_matrix = pipeline.predict_proba(X_test)

        # Binary classification only.
        if probability_matrix.shape[1] == 2:
            probabilities = probability_matrix[:, 1]

    return EvaluateClassification(
        y_test,
        predictions,
        probabilities,
    )


def TrainModel(
    df: pl.DataFrame,
    target: str,
    estimator: BaseEstimator,
    task: TaskType,
    excluded: set[str] | None = None,
    transforms: Sequence[FeatureTransform] | None = None,
    test_size: float = TEST_SIZE,
    random_state: int = RANDOM_STATE,
) -> tuple[Pipeline, dict[str, float], dict[str, Any]]:
    """
    Train and evaluate an arbitrary scikit-learn estimator
    against a tabular Polars DataFrame.

    The returned Pipeline contains both preprocessing and
    the fitted estimator, allowing the same object to be
    used directly for inference.
    """

    ValidateTrainingConfig(df=df, target=target, task=task)

    (X, y, numerical_features, categorical_features) = PrepareTrainingData(
        df=df, target=target, excluded=excluded, transforms=transforms
    )

    (X_train, X_test, y_train, y_test) = SplitTrainingData(
        X=X, y=y, task=task, test_size=test_size, random_state=random_state
    )

    pipeline = CreateTrainingPipeline(
        estimator=estimator,
        numerical_features=numerical_features,
        categorical_features=categorical_features,
    )
    pipeline.fit(X_train, y_train)
    metrics = EvaluateModel(pipeline=pipeline, X_test=X_test, y_test=y_test, task=task)

    metadata = {
        "task": task,
        "target": target,
        "estimator": type(estimator).__name__,
        "numerical_features": numerical_features,
        "categorical_features": categorical_features,
        "feature_count": (len(numerical_features) + len(categorical_features)),
        "sample_count": len(X),
        "training_sample_count": len(X_train),
        "test_sample_count": len(X_test),
        "test_size": test_size,
        "random_state": random_state,
    }

    return (pipeline, metrics, metadata)


def SaveModel(
    pipeline: Pipeline,
    path: Path,
    metadata: dict[str, Any] | None = None,
) -> None:
    """
    Serialize a fitted pipeline and optional metadata.

    The complete sklearn Pipeline is saved rather than only
    the estimator so preprocessing remains identical during
    training and inference.
    """

    path.parent.mkdir(parents=True, exist_ok=True)
    artifact = {"pipeline": pipeline, "metadata": metadata or {}}

    joblib.dump(artifact, path)


def LoadModel(
    path: Path,
) -> tuple[Pipeline, dict[str, Any]]:
    """
    Load a model artifact produced by SaveModel().
    """

    if not path.exists():
        raise FileNotFoundError(f"Model file '{path}' does not exist.")

    artifact = joblib.load(path)
    if not isinstance(artifact, dict):
        raise ValueError("Invalid model artifact.")
    if "pipeline" not in artifact:
        raise ValueError("Model artifact does not contain a pipeline.")

    return (artifact["pipeline"], artifact.get("metadata", {}))
