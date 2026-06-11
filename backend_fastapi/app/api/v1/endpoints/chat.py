from typing import Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Header
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from loguru import logger

from app import models, schemas
from app.api import deps
from app.services.llm_service import llm_service
from app.services.chat_service import chat_service

router = APIRouter()

@router.get("/models")
async def get_models(
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get available Ollama models.
    """
    return await llm_service.get_available_models()

@router.get("/nim-models")
async def get_nim_models(
    x_nvidia_api_key: Optional[str] = Header(None),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get available NVIDIA NIM models.
    """
    models_list = await llm_service.get_nim_models(api_key=x_nvidia_api_key)
    return [
        {
            "id": m.get("id"),
            "name": m.get("id", "").split("/")[-1].replace("-", " ").title(),
        }
        for m in models_list
        if m.get("id")
    ]

@router.post("/query", response_model=schemas.ChatResponse)
async def query_knowledge_base(
    *,
    db: Session = Depends(deps.get_db),
    query_in: schemas.ChatQuery,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Query the knowledge base using RAG.
    """
    logger.info(f"API /chat/query reached by user {current_user.id}. Query: {query_in.query}")
    if query_in.stream:
        return StreamingResponse(
            chat_service.stream_chat_with_context(
                query_in.query,
                current_user.id,
                model=query_in.model,
                provider=query_in.provider,
                api_key=query_in.api_key,
            ),
            media_type="text/event-stream"
        )
    
    try:
        response_text = await chat_service.chat_with_context(
            query_in.query,
            current_user.id,
            model=query_in.model,
            provider=query_in.provider,
            api_key=query_in.api_key,
        )
        return {"response": response_text, "context_used": True}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating AI response: {str(e)}"
        )
