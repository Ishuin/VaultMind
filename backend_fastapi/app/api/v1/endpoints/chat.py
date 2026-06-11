from typing import Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Header
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from loguru import logger

from app import models, schemas
from app.api import deps
from app.services.llm_service import llm_service
from app.services.chat_service import chat_service
from app.crud.conversation import conversation as conversation_crud
from app.crud.chat_message import chat_message

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
    
    # Resolve search_internet: per-request override > user preference > default False
    search_internet = query_in.search_internet
    if search_internet is None:
        search_internet = getattr(current_user, "search_internet", False) or False
    
    # Resolve conversation_id: create new conversation if not provided
    conversation_id = query_in.conversation_id
    if conversation_id is None:
        new_convo = conversation_crud.create(db, current_user.id)
        conversation_id = new_convo.id
    
    # Save user message
    chat_message.create(db, conversation_id, "user", query_in.query)
    
    # Auto-title: if conversation has default title, set it from first message
    convo = conversation_crud.get_conversation(db, conversation_id, current_user.id)
    if convo and convo.title == "New Chat":
        title = query_in.query[:50].strip()
        if len(query_in.query) > 50:
            title += "..."
        conversation_crud.update_title(db, conversation_id, title)
    
    if query_in.stream:
        async def stream_and_save():
            full_response = ""
            async for chunk in chat_service.stream_chat_with_context(
                query_in.query,
                current_user.id,
                model=query_in.model,
                provider=query_in.provider,
                api_key=query_in.api_key,
                search_internet=search_internet,
            ):
                full_response += chunk
                yield chunk
            # Save assistant response after streaming completes
            chat_message.create(db, conversation_id, "assistant", full_response)
        
        return StreamingResponse(stream_and_save(), media_type="text/event-stream")
    
    try:
        response_text = await chat_service.chat_with_context(
            query_in.query,
            current_user.id,
            model=query_in.model,
            provider=query_in.provider,
            api_key=query_in.api_key,
            search_internet=search_internet,
        )
        
        # Save assistant response
        chat_message.create(db, conversation_id, "assistant", response_text)
        
        return {"response": response_text, "context_used": True, "conversation_id": conversation_id}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating AI response: {str(e)}"
        )
