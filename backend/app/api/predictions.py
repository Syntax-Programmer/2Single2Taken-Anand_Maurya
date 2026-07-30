from fastapi import (
    APIRouter,
    File,
    HTTPException,
    UploadFile,
)

from backend.app.schemas.predictions import PredictionResponse
from backend.app.services.case_parser import CaseParser
from backend.app.services.document import DocumentService
from backend.app.services.predictions import PredictionService

router = APIRouter()

prediction_service = PredictionService()


@router.post(
    "/case",
    response_model=PredictionResponse,
)
async def PredictCase(
    file: UploadFile = File(...),
) -> PredictionResponse:

    #
    # Validate upload
    #

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="Missing filename.",
        )
    if not file.filename.lower().endswith(".docx"):
        raise HTTPException(
            status_code=415,
            detail="Only DOCX files are supported.",
        )

    #
    # Read document
    #

    content = await file.read()
    if not content:
        raise HTTPException(
            status_code=400,
            detail="Uploaded document is empty.",
        )

    #
    # Parse document
    #
    try:
        document = DocumentService.ExtractDOCX(content)
        case = CaseParser.Parse(document)

    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail="Unable to parse case document.",
        ) from exc

    #
    # Prediction
    #

    return prediction_service.BuildResponse(case)
