import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.api.router import api_router

app = FastAPI(
    title="DocketIQ API",
    description="Case intelligence and scheduling API for DocketIQ",
    version="0.1.0",
)

FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "http://localhost:3000",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        FRONTEND_URL,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")
