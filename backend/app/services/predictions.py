from app.schemas.predictions import (
    CaseInfo,
    CasePrediction,
    PredictionResponse,
)
from backend.app.services.case_parser import ParsedCase


class PredictionService:
    @staticmethod
    def BuildCaseInfo(
        case: ParsedCase,
    ) -> CaseInfo:
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

    def Predict(
        self,
        case: ParsedCase,
    ) -> CasePrediction:
        # TODO:
        # Replace with actual model inference.

        return CasePrediction(
            complexity="Medium",
            adjournment_probability=50.0,
            predicted_duration_days=180.0,
        )

    def BuildResponse(
        self,
        case: ParsedCase,
    ) -> PredictionResponse:

        return PredictionResponse(
            case=self.BuildCaseInfo(case),
            prediction=self.Predict(case),
        )
