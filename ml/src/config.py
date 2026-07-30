from pathlib import Path

ML_ROOT = Path(__file__).resolve().parents[1]

DATA_DIR = ML_ROOT / "data"
RAW_DATA_DIR = DATA_DIR / "raw"
PROCESSED_DATA_DIR = DATA_DIR / "processed"

MODELS_DIR = ML_ROOT / "models"
REPORTS_DIR = ML_ROOT / "reports"

RANDOM_STATE = 42
TEST_SIZE = 0.20
