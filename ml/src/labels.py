from __future__ import annotations

from pathlib import Path

import numpy as np
import polars as pl

ML_ROOT = Path(__file__).resolve().parents[1]

PROCESSED_DATA_DIR = ML_ROOT / "data" / "processed"

INPUT_DATASET = PROCESSED_DATA_DIR / "cases.parquet"

TRAINING_PARQUET = PROCESSED_DATA_DIR / "training.parquet"
TRAINING_CSV = PROCESSED_DATA_DIR / "training.csv"

RANDOM_STATE = 42

CATEGORICAL_FEATURES = [
    "case_type",
    "court",
    "jurisdiction",
    "stage",
]

NUMERICAL_FEATURES = [
    "document_word_count",
    "document_sentence_count",
    "section_count",
    "judge_count",
    "act_count",
    "precedent_count",
]

FEATURE_COLUMNS = CATEGORICAL_FEATURES + NUMERICAL_FEATURES

TARGET_COLUMNS = [
    "complexity_score",
    "adjourned",
    "duration_days",
]


def LoadCases() -> pl.DataFrame:
    if not INPUT_DATASET.exists():
        raise FileNotFoundError(f"Dataset not found: {INPUT_DATASET}")

    df = pl.read_parquet(INPUT_DATASET)
    if df.height == 0:
        raise ValueError("cases.parquet contains no rows.")

    return df


def ValidateInput(df: pl.DataFrame) -> None:
    required = {
        "case_type",
        "court",
        "jurisdiction",
        "stage",
        "acts",
        "sections",
        "precedents",
        "judges",
        "document_word_count",
        "document_sentence_count",
    }
    missing = required - set(df.columns)

    if missing:
        raise ValueError("Missing required columns: " + ", ".join(sorted(missing)))


def Standardize(values: np.ndarray) -> np.ndarray:
    values = np.asarray(values, dtype=np.float64)
    mean = float(np.nanmean(values))
    std = float(np.nanstd(values))

    if not np.isfinite(std) or std < 1e-12:
        return np.zeros_like(values, dtype=np.float64)
    result = (values - mean) / std

    return np.nan_to_num(result, nan=0.0, posinf=0.0, neginf=0.0)


def Sigmoid(values: np.ndarray) -> np.ndarray:
    values = np.clip(values, -30.0, 30.0)

    return 1.0 / (1.0 + np.exp(-values))


def StableCategoryEffect(values: list[object], scale: float = 1.0) -> np.ndarray:
    effects: list[float] = []

    for value in values:
        if value is None:
            effects.append(0.0)
            continue
        text = str(value).strip().lower()
        if not text:
            effects.append(0.0)
            continue

        accumulator = 0
        for index, character in enumerate(
            text,
            start=1,
        ):
            accumulator += index * ord(character)

        normalized = (accumulator % 2001) / 1000.0 - 1.0
        effects.append(normalized * scale)

    return np.asarray(effects, dtype=np.float64)


# ============================================================================
# Categorical normalization
# ============================================================================


def NormalizeCategoricalColumns(df: pl.DataFrame) -> pl.DataFrame:
    expressions: list[pl.Expr] = []

    for column in CATEGORICAL_FEATURES:
        normalized = (
            pl.col(column)
            .cast(pl.String)
            .str.strip_chars()
            .str.to_lowercase()
            .str.to_titlecase()
        )

        expressions.append(
            pl.when(normalized.is_null() | (normalized.str.len_chars() == 0))
            .then(pl.lit("Unknown"))
            .otherwise(normalized)
            .alias(column)
        )

    return df.with_columns(expressions)


# ============================================================================
# Derived features
# ============================================================================


def AddDerivedFeatures(
    df: pl.DataFrame,
) -> pl.DataFrame:

    return df.with_columns(
        pl.col("sections")
        .list.len()
        .fill_null(0)
        .cast(pl.Int64)
        .alias("section_count"),
        pl.col("judges").list.len().fill_null(0).cast(pl.Int64).alias("judge_count"),
        pl.col("acts").list.len().fill_null(0).cast(pl.Int64).alias("act_count"),
        pl.col("precedents")
        .list.len()
        .fill_null(0)
        .cast(pl.Int64)
        .alias("precedent_count"),
    )


# ============================================================================
# Latent difficulty
# ============================================================================


def GenerateLatentDifficulty(
    df: pl.DataFrame,
    rng: np.random.Generator,
) -> np.ndarray:

    word_count = df["document_word_count"].to_numpy().astype(np.float64)

    sentence_count = df["document_sentence_count"].to_numpy().astype(np.float64)

    section_count = df["section_count"].to_numpy().astype(np.float64)

    judge_count = df["judge_count"].to_numpy().astype(np.float64)

    act_count = df["act_count"].to_numpy().astype(np.float64)

    precedent_count = df["precedent_count"].to_numpy().astype(np.float64)

    # Log transforms reduce the influence of extreme outliers.

    word_signal = Standardize(np.log1p(word_count))

    sentence_signal = Standardize(np.log1p(sentence_count))

    section_signal = Standardize(np.log1p(section_count))

    judge_signal = Standardize(np.log1p(judge_count))

    act_signal = Standardize(np.log1p(act_count))

    precedent_signal = Standardize(np.log1p(precedent_count))

    case_type_effect = StableCategoryEffect(
        df["case_type"].to_list(),
        scale=0.35,
    )

    court_effect = StableCategoryEffect(
        df["court"].to_list(),
        scale=0.25,
    )

    jurisdiction_effect = StableCategoryEffect(
        df["jurisdiction"].to_list(),
        scale=0.15,
    )

    stage_effect = StableCategoryEffect(
        df["stage"].to_list(),
        scale=0.20,
    )

    noise = rng.normal(
        loc=0.0,
        scale=0.40,
        size=df.height,
    )

    latent = (
        0.30 * word_signal
        + 0.15 * sentence_signal
        + 0.25 * section_signal
        + 0.08 * judge_signal
        + 0.05 * act_signal
        + 0.07 * precedent_signal
        + 0.04 * case_type_effect
        + 0.025 * court_effect
        + 0.015 * jurisdiction_effect
        + 0.02 * stage_effect
        + noise
    )

    return Standardize(latent)


# ============================================================================
# Complexity target
# ============================================================================


def GenerateComplexityScore(
    latent: np.ndarray,
    rng: np.random.Generator,
) -> np.ndarray:
    """
    Continuous complexity score:

        0 <= complexity_score <= 100
    """

    noise = rng.normal(
        loc=0.0,
        scale=0.30,
        size=len(latent),
    )

    raw = latent + noise

    complexity = Sigmoid(raw * 1.35) * 100.0

    return np.clip(
        complexity,
        0.0,
        100.0,
    ).astype(np.float64)


# ============================================================================
# Adjournment target
# ============================================================================


def GenerateAdjournment(
    df: pl.DataFrame,
    latent: np.ndarray,
    rng: np.random.Generator,
) -> np.ndarray:

    case_type_effect = StableCategoryEffect(
        df["case_type"].to_list(),
        scale=0.40,
    )

    court_effect = StableCategoryEffect(
        df["court"].to_list(),
        scale=0.30,
    )

    noise = rng.normal(
        loc=0.0,
        scale=0.35,
        size=df.height,
    )

    logit = (
        -0.20 + 0.75 * latent + 0.20 * case_type_effect + 0.15 * court_effect + noise
    )

    probability = Sigmoid(logit)

    adjourned = rng.binomial(
        n=1,
        p=probability,
        size=df.height,
    )

    return adjourned.astype(np.int8)


# ============================================================================
# Duration target
# ============================================================================


def GenerateDuration(
    df: pl.DataFrame,
    latent: np.ndarray,
    adjourned: np.ndarray,
    rng: np.random.Generator,
) -> np.ndarray:

    section_count = df["section_count"].to_numpy().astype(np.float64)

    judge_count = df["judge_count"].to_numpy().astype(np.float64)

    section_signal = Standardize(np.log1p(section_count))

    judge_signal = Standardize(np.log1p(judge_count))

    case_type_effect = StableCategoryEffect(
        df["case_type"].to_list(),
        scale=50.0,
    )

    court_effect = StableCategoryEffect(
        df["court"].to_list(),
        scale=35.0,
    )

    noise = rng.normal(
        loc=0.0,
        scale=85.0,
        size=df.height,
    )

    duration = (
        240.0
        + 115.0 * latent
        + 35.0 * section_signal
        + 15.0 * judge_signal
        + 75.0 * adjourned
        + case_type_effect
        + court_effect
        + noise
    )

    return np.clip(
        duration,
        1.0,
        3000.0,
    ).astype(np.float64)


# ============================================================================
# Build dataset
# ============================================================================


def BuildTrainingDataset(
    df: pl.DataFrame,
) -> pl.DataFrame:

    rng = np.random.default_rng(RANDOM_STATE)

    df = NormalizeCategoricalColumns(df)

    df = AddDerivedFeatures(df)

    latent = GenerateLatentDifficulty(
        df,
        rng,
    )

    complexity_score = GenerateComplexityScore(
        latent,
        rng,
    )

    adjourned = GenerateAdjournment(
        df,
        latent,
        rng,
    )

    duration_days = GenerateDuration(
        df,
        latent,
        adjourned,
        rng,
    )

    df = df.with_columns(
        pl.Series(
            "complexity_score",
            complexity_score,
            dtype=pl.Float64,
        ),
        pl.Series(
            "adjourned",
            adjourned,
            dtype=pl.Int8,
        ),
        pl.Series(
            "duration_days",
            duration_days,
            dtype=pl.Float64,
        ),
    )

    return df.select(FEATURE_COLUMNS + TARGET_COLUMNS)


# ============================================================================
# Output
# ============================================================================


def WriteTrainingDataset(
    df: pl.DataFrame,
) -> None:

    PROCESSED_DATA_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    df.write_parquet(
        TRAINING_PARQUET,
        compression="zstd",
    )

    df.write_csv(TRAINING_CSV)


# ============================================================================
# Report
# ============================================================================


def PrintReport(
    df: pl.DataFrame,
) -> None:

    print()
    print("=" * 72)
    print("DocketIQ Training Dataset")
    print("=" * 72)

    print(f"\nRows    : {df.height}")

    print(f"Columns : {df.width}")

    print("\nFeatures:")

    for column in FEATURE_COLUMNS:
        print(f"  X  {column}")

    print("\nTargets:")

    for column in TARGET_COLUMNS:
        print(f"  y  {column}")

    print("\n=== COMPLEXITY SCORE ===")

    print(df["complexity_score"].describe())

    print("\n=== ADJOURNMENT ===")

    print(df.group_by("adjourned").len().sort("adjourned"))

    # Explicit float conversion fixes the BasedPyright complaint.
    mean_value = df["adjourned"].cast(pl.Float64).mean()

    if mean_value is None:
        adjournment_rate = 0.0
    else:
        adjournment_rate = float(mean_value) * 100.0

    print(f"Adjournment rate: {adjournment_rate:.2f}%")

    print("\n=== DURATION DAYS ===")

    print(df["duration_days"].describe())

    print("\n=== NULL COUNTS ===")

    print(df.null_count())

    print(f"\nParquet : {TRAINING_PARQUET}")

    print(f"CSV     : {TRAINING_CSV}")

    print()
    print("NOTE: Targets are synthetic/proxy labels for prototype training.")

    print("=" * 72)


# ============================================================================
# Main
# ============================================================================


def main() -> None:

    print()
    print("Loading cases.parquet...")

    df = LoadCases()

    print(f"Loaded {df.height} cases.")

    print("Validating input...")

    ValidateInput(df)

    print("Generating training features and labels...")

    training_df = BuildTrainingDataset(df)

    print("Writing datasets...")

    WriteTrainingDataset(training_df)

    PrintReport(training_df)


if __name__ == "__main__":
    main()
