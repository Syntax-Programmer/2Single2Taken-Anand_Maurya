from typing import Literal

from pydantic import BaseModel, Field


class CaseInfo(BaseModel):
    case_title: str | None = None
    case_number: str | None = None
    case_type: str | None = None

    court: str | None = None
    status: str | None = None
    stage: str | None = None

    acts: list[str] = Field(default_factory=list)
    sections: list[str] = Field(default_factory=list)
    precedents: list[str] = Field(default_factory=list)


class CasePrediction(BaseModel):
    complexity: Literal[
        "Low",
        "Medium",
        "High",
    ]

    adjournment_probability: float = Field(
        ge=0.0,
        le=100.0,
    )

    predicted_duration_days: float = Field(
        ge=0.0,
    )


class PredictionResponse(BaseModel):
    case: CaseInfo
    prediction: CasePrediction
