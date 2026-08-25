from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from pathlib import Path
from loguru import logger

from app.services.pdf_service import pdf_service

router = APIRouter()


class Section(BaseModel):
    type: str = Field(default="text", pattern="^(text|mermaid)$")
    heading: str | None = None
    content: str | None = None


class PDFGenerateRequest(BaseModel):
    title: str
    sections: list[Section]
    filename: str | None = None


@router.post("/generate")
def generate_pdf(payload: PDFGenerateRequest):
    try:
        out_path = pdf_service.generate(
            title=payload.title,
            sections=[s.model_dump() for s in payload.sections],
            filename=payload.filename,
        )
        return FileResponse(
            out_path,
            media_type="application/pdf",
            filename=Path(out_path).name,
        )
    except Exception as exc:
        logger.exception("PDF generation failed")
        raise HTTPException(status_code=500, detail=str(exc))
