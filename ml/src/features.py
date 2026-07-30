from collections.abc import Callable

import polars as pl

FeatureTransform = Callable[[pl.DataFrame], pl.DataFrame]


def ApplyTransforms(
    df: pl.DataFrame,
    transforms: list[FeatureTransform],
) -> pl.DataFrame:
    for transform in transforms:
        df = transform(df)

    return df


def InferFeatures(
    df: pl.DataFrame,
    excluded: set[str] | None = None,
) -> tuple[list[str], list[str]]:
    excluded = excluded or set()
    numerical = []
    categorical = []

    for name, dtype in df.schema.items():
        if name in excluded:
            continue

        if dtype.is_numeric():
            numerical.append(name)
        elif dtype in (pl.String, pl.Categorical, pl.Enum):
            categorical.append(name)

    return numerical, categorical
