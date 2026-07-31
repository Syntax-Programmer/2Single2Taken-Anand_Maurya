from __future__ import annotations

import os
import sys
from concurrent.futures import (
    ProcessPoolExecutor,
    as_completed,
)
from dataclasses import asdict
from pathlib import Path
from typing import Any

import polars as pl

# ============================================================================
# Configuration
# ============================================================================

ML_ROOT = Path(__file__).resolve().parents[1]
PROJECT_ROOT = ML_ROOT.parent
BACKEND_ROOT = PROJECT_ROOT / "backend"

RAW_DOCS_DIR = ML_ROOT / "data" / "raw" / "docs"
PROCESSED_DATA_DIR = ML_ROOT / "data" / "processed"

PARQUET_OUTPUT = PROCESSED_DATA_DIR / "cases.parquet"
CSV_OUTPUT = PROCESSED_DATA_DIR / "cases.csv"
FAILURES_OUTPUT = PROCESSED_DATA_DIR / "failed_documents.csv"


# ============================================================================
# Processing configuration
# ============================================================================

# None = process the complete corpus.
#
# For testing:
#
# TEST_LIMIT = 100
#
# For production:
#
# TEST_LIMIT = None

TEST_LIMIT: int | None = None


# Number of worker processes.
#
# Leave two logical CPUs available for the OS and other programs.
#
# Example:
#
# 16 logical CPUs -> 14 workers
#
CPU_COUNT = os.cpu_count() or 1

WORKERS = max(1, CPU_COUNT - 2)


# Print progress every N completed documents.

PROGRESS_INTERVAL = 100


# ============================================================================
# Backend imports
# ============================================================================

# backend internally imports:
#
#     from app.services...
#
# Therefore backend/ must be available on sys.path.

if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))


from backend.app.services.case_parser import CaseParser, ParsedCase
from backend.app.services.document import DocumentService


def FindDocuments(root: Path) -> list[Path]:
    """
    Recursively discover every DOCX document.

    Microsoft Word temporary files beginning with '~$' are ignored.
    """
    if not root.exists():
        raise FileNotFoundError(f"Raw document directory does not exist: {root}")
    if not root.is_dir():
        raise NotADirectoryError(f"Raw document path is not a directory: {root}")

    documents = [
        path
        for path in root.rglob("*")
        if (
            path.is_file()
            and path.suffix.lower() == ".docx"
            and not path.name.startswith("~$")
        )
    ]
    documents.sort()

    return documents


def ParseDocument(path: Path) -> ParsedCase:
    """
    Parse one DOCX document into ParsedCase.

    IMPORTANT:

    Keep the implementation here identical to the version that successfully
    parsed your five-document test.

    If your working implementation uses different calls than the two below,
    replace ONLY the body of this function with your already-working version.
    """
    content = path.read_bytes()
    document = DocumentService.ExtractDOCX(content)

    parsed = CaseParser.Parse(document)
    if not isinstance(parsed, ParsedCase):
        raise TypeError(
            f"CaseParser returned {type(parsed).__name__}, expected ParsedCase."
        )

    return parsed


def NormalizeValue(value: Any) -> Any:
    """
    Convert ParsedCase values into serialization-friendly values.
    """
    if value is None:
        return None

    # date / datetime
    if hasattr(value, "isoformat"):
        try:
            return value.isoformat()
        except (TypeError, ValueError):
            pass
    if isinstance(value, tuple):
        return list(value)
    if isinstance(value, set):
        return sorted(value)

    return value


def ParsedCaseToRecord(parsed: ParsedCase, source_path: Path) -> dict[str, Any]:
    """
    Convert ParsedCase into one canonical dataset row.

    dataclasses.asdict() makes this resilient to additional ParsedCase fields.
    """
    raw_record = asdict(parsed)
    record = {key: NormalizeValue(value) for key, value in raw_record.items()}

    try:
        relative_path = source_path.relative_to(RAW_DOCS_DIR)
        record["_source_file"] = str(relative_path)
        if relative_path.parts:
            record["_source_year"] = relative_path.parts[0]
        else:
            record["_source_year"] = None
    except ValueError:
        record["_source_file"] = str(source_path)
        record["_source_year"] = None

    return record


def ProcessOneDocument(
    path: Path,
) -> tuple[dict[str, Any] | None, dict[str, str] | None]:
    """
    Process exactly one document.

    This function runs inside a worker process.

    Returns:

        (record, None)

    on success, or:

        (None, failure)

    on failure.
    """
    try:
        parsed = ParseDocument(path)
        record = ParsedCaseToRecord(parsed=parsed, source_path=path)

        return (record, None)

    except Exception as exc:
        failure = {
            "source_file": str(path),
            "error_type": type(exc).__name__,
            "error": str(exc),
        }

        return (None, failure)


def ProcessCorpus(
    documents: list[Path],
) -> tuple[list[dict[str, Any]], list[dict[str, str]]]:
    """
    Parse the complete corpus using multiple worker processes.
    """
    records: list[dict[str, Any]] = []
    failures: list[dict[str, str]] = []

    total = len(documents)
    completed = 0

    print()
    print(f"Logical CPUs detected : {CPU_COUNT}")
    print(f"Worker processes      : {WORKERS}")
    print()

    with ProcessPoolExecutor(max_workers=WORKERS) as executor:
        # Submit every document.
        #
        # Each document can be processed independently.
        future_to_path = {
            executor.submit(ProcessOneDocument, path): path for path in documents
        }

        for future in as_completed(future_to_path):
            path = future_to_path[future]
            try:
                (record, failure) = future.result()
                if record is not None:
                    records.append(record)
                if failure is not None:
                    failures.append(failure)

            except Exception as exc:
                # This catches failures in the worker process itself,
                # rather than normal document/parser failures.
                failures.append(
                    {
                        "source_file": str(path),
                        "error_type": type(exc).__name__,
                        "error": str(exc),
                    }
                )

            completed += 1
            if (
                completed == 1
                or completed % PROGRESS_INTERVAL == 0
                or completed == total
            ):
                percentage = completed / total * 100.0
                print(
                    f"[{completed:>6}/{total}] "
                    f"{percentage:>6.2f}% | "
                    f"parsed={len(records):>6} | "
                    f"failed={len(failures):>6}"
                )

    return (records, failures)


def BuildDataFrame(records: list[dict[str, Any]]) -> pl.DataFrame:
    """
    Build the canonical Polars dataset.
    """
    if not records:
        raise RuntimeError("No documents were successfully parsed.")

    return pl.from_dicts(records, infer_schema_length=None)


def PrepareForCSV(df: pl.DataFrame) -> pl.DataFrame:
    """
    Convert list columns into pipe-separated strings.

    Parquet retains actual list columns.

    Example:

        ["IPC", "CrPC"]

    becomes:

        IPC | CrPC

    in the CSV representation.
    """

    expressions: list[pl.Expr] = []
    for name, dtype in df.schema.items():
        if isinstance(dtype, pl.List):
            expressions.append(
                pl.col(name)
                .list.eval(pl.element().cast(pl.String))
                .list.join(" | ")
                .alias(name)
            )

        else:
            expressions.append(pl.col(name))

    return df.select(expressions)


def WriteDataset(df: pl.DataFrame) -> None:
    """
    Write Parquet and CSV datasets.
    """
    PROCESSED_DATA_DIR.mkdir(parents=True, exist_ok=True)

    print()
    print("Writing canonical Parquet dataset...")

    df.write_parquet(
        PARQUET_OUTPUT,
        compression="zstd",
    )

    print(f"Wrote: {PARQUET_OUTPUT}")
    print()
    print("Preparing CSV representation...")

    csv_df = PrepareForCSV(df)
    csv_df.write_csv(CSV_OUTPUT)

    print(f"Wrote: {CSV_OUTPUT}")


def WriteFailures(failures: list[dict[str, str]]) -> None:
    """
    Write information about documents that failed processing.
    """

    PROCESSED_DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not failures:
        if FAILURES_OUTPUT.exists():
            FAILURES_OUTPUT.unlink()
        return

    failure_df = pl.from_dicts(failures)
    failure_df.write_csv(FAILURES_OUTPUT)

    print()
    print("Failure report written:")
    print(f"  {FAILURES_OUTPUT}")


def PrintSummary(df: pl.DataFrame, document_count: int, failure_count: int) -> None:
    """
    Print final processing statistics.
    """
    success_count = df.height
    success_rate = success_count / document_count * 100.0 if document_count else 0.0

    print()
    print("=" * 70)
    print("DocketIQ dataset processing complete")
    print("=" * 70)
    print()
    print(f"Documents attempted : {document_count}")
    print(f"Successfully parsed : {success_count}")
    print(f"Failed              : {failure_count}")
    print(f"Success rate        : {success_rate:.2f}%")
    print()
    print(f"Rows                : {df.height}")
    print(f"Columns             : {df.width}")
    print()
    print("Parquet:")
    print(f"  {PARQUET_OUTPUT}")
    print()
    print("CSV:")
    print(f"  {CSV_OUTPUT}")

    if failure_count:
        print()
        print("Failures:")
        print(f"  {FAILURES_OUTPUT}")

    print()
    print("Dataset schema:")
    print()

    for name, dtype in df.schema.items():
        print(f"  {name:<32} {dtype}")

    print()
    print("=" * 70)


def main() -> None:
    """
    Dataset processing entry point.
    """

    print()
    print("=" * 70)
    print("DocketIQ Parallel Dataset Processor")
    print("=" * 70)
    print()
    print(f"Input: {RAW_DOCS_DIR}")
    print()

    all_documents = FindDocuments(RAW_DOCS_DIR)
    if not all_documents:
        print("ERROR: No DOCX documents found.")
        return

    print(f"Found {len(all_documents)} DOCX documents.")
    if TEST_LIMIT is not None:
        documents = all_documents[:TEST_LIMIT]
        print()
        print("TEST MODE")
        print(f"Processing first {len(documents)} documents.")
    else:
        documents = all_documents
        print()
        print("FULL CORPUS MODE")
        print(f"Processing all {len(documents)} documents.")

    records, failures = ProcessCorpus(documents)
    WriteFailures(failures)
    if not records:
        print()
        print("=" * 70)
        print("DATASET PROCESSING FAILED")
        print("=" * 70)
        print()
        print("No documents were successfully parsed.")
        print(f"Failures: {len(failures)}")

        if failures:
            first = failures[0]
            print()
            print("First failure:")
            print(f"  File  : {first['source_file']}")
            print(f"  Type  : {first['error_type']}")
            print(f"  Error : {first['error']}")

        return

    print()
    print("Constructing Polars DataFrame...")
    df = BuildDataFrame(records)
    WriteDataset(df)
    PrintSummary(
        df=df,
        document_count=len(documents),
        failure_count=len(failures),
    )


if __name__ == "__main__":
    main()
