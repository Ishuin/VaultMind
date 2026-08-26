from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, HttpUrl
from app.services.youtube_analyzer import extract_video_analysis

router = APIRouter()


class YoutubeRequest(BaseModel):
    url: HttpUrl


@router.post("/youtube/analyze")
async def youtube_analyze(payload: YoutubeRequest):
    try:
        data = extract_video_analysis(str(payload.url))
        return data
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze video: {e}")
