from fastapi import APIRouter

from app.api.endpoints import asr, speaker_diarization, segmentation

api_router = APIRouter()

api_router.include_router(asr.router, prefix="/asr", tags=["ASR"])
api_router.include_router(speaker_diarization.router, prefix="/diarization", tags=["Speaker Diarization"])
api_router.include_router(segmentation.router, prefix="/segmentation", tags=["Segmentation"])