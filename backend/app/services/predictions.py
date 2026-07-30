from pathlib import Path
from typing import Any, ClassVar

import joblib
import pandas as pd

from backend.app.schemas.predictions import (
    CaseInfo,
    CasePrediction,
    PredictionResponse,
)
from backend.app.services.case_parser import ParsedCase

# ============================================================================
# Model paths
# ============================================================================

# backend/app/services/predictions.py
# parents[3] -> repository root
PROJECT_ROOT = Path(__file__).resolve().parents[3]

MODEL_DIR = PROJECT_ROOT / "ml" / "models"

COMPLEXITY_MODEL_PATH = MODEL_DIR / "complexity.joblib"
ADJOURNMENT_MODEL_PATH = MODEL_DIR / "adjournment.joblib"
DURATION_MODEL_PATH = MODEL_DIR / "duration.joblib"


# ============================================================================
# Feature contract
# ============================================================================

FEATURE_COLUMNS = [
    "case_type",
    "court",
    "jurisdiction",
    "stage",
    "document_word_count",
    "document_sentence_count",
    "section_count",
    "judge_count",
    "act_count",
    "precedent_count",
]


# ============================================================================
# Prediction service
# ============================================================================


class PredictionService:
    # joblib loads arbitrary Python objects at runtime, so their concrete
    # sklearn types are intentionally represented as Any here.
    _complexity_model: ClassVar[Any | None] = None
    _adjournment_model: ClassVar[Any | None] = None
    _duration_model: ClassVar[Any | None] = None

    # ------------------------------------------------------------------------
    # Model loading
    # ------------------------------------------------------------------------

    @classmethod
    def LoadModels(cls) -> None:
        if (
            cls._complexity_model is not None
            and cls._adjournment_model is not None
            and cls._duration_model is not None
        ):
            return

        model_paths = (
            COMPLEXITY_MODEL_PATH,
            ADJOURNMENT_MODEL_PATH,
            DURATION_MODEL_PATH,
        )
        for path in model_paths:
            if not path.is_file():
                raise FileNotFoundError(f"Model file not found: {path}")

        cls._complexity_model = joblib.load(COMPLEXITY_MODEL_PATH)
        cls._adjournment_model = joblib.load(ADJOURNMENT_MODEL_PATH)
        cls._duration_model = joblib.load(DURATION_MODEL_PATH)

    @staticmethod
    def BuildCaseInfo(case: ParsedCase) -> CaseInfo:
        return CaseInfo(
            case_title=case.case_title,
            case_number=case.case_number,
            case_type=case.case_type,
            court=case.court,
            status=case.status,
            stage=case.stage,
            acts=case.acts,
            sections=case.sections,
            precedents=case.precedents,
        )

    @staticmethod
    def BuildFeatures(case: ParsedCase) -> pd.DataFrame:
        features = {
            "case_type": case.case_type or "Unknown",
            "court": case.court or "Unknown",
            "jurisdiction": case.jurisdiction or "Unknown",
            "stage": case.stage or "Unknown",
            "document_word_count": int(case.document_word_count or 0),
            "document_sentence_count": int(case.document_sentence_count or 0),
            "section_count": len(case.sections or []),
            "judge_count": len(case.judges or []),
            "act_count": len(case.acts or []),
            "precedent_count": len(case.precedents or []),
        }

        return pd.DataFrame(
            [features],
            columns=FEATURE_COLUMNS,
        )

    def Predict(self, case: ParsedCase) -> CasePrediction:
        self.LoadModels()

        # Explicit assertions narrow Optional[Any] for static type checkers
        # and protect against an invalid model-loading state.
        assert self._complexity_model is not None
        assert self._adjournment_model is not None
        assert self._duration_model is not None

        features = self.BuildFeatures(case)

        complexity = float(self._complexity_model.predict(features)[0])
        complexity = max(0.0, min(100.0, complexity))

        probabilities = self._adjournment_model.predict_proba(features)[0]

        # Training convention:
        # 0 = not adjourned
        # 1 = adjourned
        adjournment_probability = float(probabilities[1]) * 100.0
        adjournment_probability = max(0.0, min(100.0, adjournment_probability))

        predicted_duration_days = float(self._duration_model.predict(features)[0])
        predicted_duration_days = max(0.0, predicted_duration_days)

        return CasePrediction(
            complexity=round(complexity, 2),
            adjournment_probability=round(adjournment_probability, 2),
            predicted_duration_days=round(predicted_duration_days, 2),
        )

    def BuildResponse(self, case: ParsedCase) -> PredictionResponse:
        return PredictionResponse(
            case=self.BuildCaseInfo(case),
            prediction=self.Predict(case),
        )
