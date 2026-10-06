from typing import Optional, List
from pydantic import BaseModel


class Source(BaseModel):
    """A source reference returned with the chat response."""
    id: int                          # Citation number (1, 2, 3...)
    document_id: Optional[int] = None
    filename: str                    # e.g. "report.pdf"
    source_type: str                 # "pdf", "docx", "text", "web"
    # Document location (for pdf/docx/text)
    page: Optional[int] = None
    section: Optional[str] = None
    line_start: Optional[int] = None
    line_end: Optional[int] = None
    paragraph_start: Optional[int] = None
    paragraph_end: Optional[int] = None
    # Web search result
    url: Optional[str] = None
    snippet: Optional[str] = None
    # Relevance
    relevance_score: Optional[float] = None


class ChatQuery(BaseModel):
    query: str
    model: Optional[str] = None
    provider: Optional[str] = None
    api_key: Optional[str] = None
    stream: bool = False
    search_internet: Optional[bool] = None
    conversation_id: Optional[int] = None


class ChatResponse(BaseModel):
    response: str
    context_used: Optional[bool] = True
    conversation_id: Optional[int] = None
    sources: Optional[List[Source]] = []
