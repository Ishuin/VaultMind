from pathlib import Path
from typing import List, Optional
from pydantic import BaseModel, Field


class GoldenSource(BaseModel):
    filename: str
    source_type: str = Field(default="file", description="file, web, or chat")
    snippet: Optional[str] = None
    url: Optional[str] = None


class GoldenExample(BaseModel):
    id: str
    query: str
    subject_hint: Optional[str] = Field(default=None, description="Expected extracted subject for web search")
    expected_doc_source_ids: List[int] = Field(default_factory=list, description="Expected doc citation IDs")
    expected_web_source_ids: List[int] = Field(default_factory=list, description="Expected web citation IDs")
    must_have_phrases: List[str] = Field(default_factory=list, description="Required phrases in answer")
    must_not_have_phrases: List[str] = Field(default_factory=list, description="Forbidden phrases in answer")
    internet_required: bool = Field(default=False)
    category: str = Field(default="general")
    notes: Optional[str] = None
