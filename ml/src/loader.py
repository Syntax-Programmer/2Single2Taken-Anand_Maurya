from pathlib import Path

import polars as pl


def LoadCSV(path: Path) -> pl.DataFrame:
    if not path.exists():
        raise FileNotFoundError(f"Dataset file: {path}, not found.")

    return pl.read_csv(path)


def LoadParquet(path: Path) -> pl.DataFrame:
    if not path.exists():
        raise FileNotFoundError(f"Dataset file: {path}, not found.")

    return pl.read_parquet(path)


def LoadDataset(path: Path) -> pl.DataFrame:
    suffix = path.suffix.lower()

    match suffix:
        case ".csv":
            return LoadCSV(path)
        case ".parquet":
            return LoadParquet(path)
        case _:
            raise ValueError(f"Unsupported dataset format: {suffix}")
