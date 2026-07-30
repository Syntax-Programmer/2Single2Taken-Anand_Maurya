from fastapi import APIRouter

from app.api.health import router as health_router
from app.api.predictions import router as predictions_router

api_router = APIRouter()

api_router.include_router(health_router, prefix="/health", tags=["Health"])
api_router.include_router(
    predictions_router, prefix="/predictions", tags=["Predictions"]
)
