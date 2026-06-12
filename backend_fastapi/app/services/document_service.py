from loguru import logger
import io
import json
import re
from typing import List, Optional, Dict, Any
from fastapi import UploadFile
from sqlalchemy.orm import Session
from pypdf import PdfReader
from docx import Document as DocxDocument
from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.crud.document import document as crud_document
from app.services.embedding_service import embedding_service
from app.services.vector_service import vector_service

DOCX_CONTENT_TYPES = {
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
}

# Regex patterns for metadata markers embedded in extracted text
_PAGE_RE = re.compile(r"\[PAGE:(\d+)\]")
_LINE_RE = re.compile(r"\[LINE:(\d+)\]")
_PAR_RE = re.compile(r"\[PAR:(\d+)\]")
_SECTION_RE = re.compile(r"\[SECTION:(.*?)\]")
_MARKER_RE = re.compile(r"\[(?:PAGE|LINE|PAR|SECTION):[^\]]*\]")


def _is_readable_text(text: str, min_ratio: float = 0.85) -> bool:
    """Reject binary/garbage extractions before they pollute the vector store."""
    # Strip metadata markers before checking readability
    clean = _strip_markers(text)
    sample = clean[:2000]
    if len(sample.strip()) < 20:
        return False
    printable = sum(1 for c in sample if c.isprintable() or c in "\n\r\t")
    return (printable / len(sample)) >= min_ratio


def _strip_markers(text: str) -> str:
    """Remove all metadata markers from text before storing in vector DB."""
    return _MARKER_RE.sub("", text).strip()


def _extract_chunk_metadata(chunk_text: str) -> Dict[str, Any]:
    """Extract metadata markers from a chunk to determine source location."""
    meta: Dict[str, Any] = {}

    page_matches = _PAGE_RE.findall(chunk_text)
    if page_matches:
        meta["page_start"] = int(page_matches[0])
        meta["page_end"] = int(page_matches[-1])

    line_matches = _LINE_RE.findall(chunk_text)
    if line_matches:
        meta["line_start"] = int(line_matches[0])
        meta["line_end"] = int(line_matches[-1])

    par_matches = _PAR_RE.findall(chunk_text)
    if par_matches:
        meta["paragraph_start"] = int(par_matches[0])
        meta["paragraph_end"] = int(par_matches[-1])

    section_matches = _SECTION_RE.findall(chunk_text)
    if section_matches:
        # Use the last section heading that appears before this chunk's content
        meta["section"] = section_matches[-1]

    return meta


def _extract_pdf_text(content: bytes) -> str:
    pdf = PdfReader(io.BytesIO(content))
    parts: List[str] = []
    for i, page in enumerate(pdf.pages):
        page_text = page.extract_text()
        if page_text:
            parts.append(f"[PAGE:{i + 1}]{page_text}")
    return "\n".join(parts)


def _extract_docx_text(content: bytes) -> str:
    doc = DocxDocument(io.BytesIO(content))
    parts: List[str] = []
    current_section = ""
    for i, paragraph in enumerate(doc.paragraphs):
        if paragraph.text.strip():
            # Track headings as section markers
            style_name = paragraph.style.name if paragraph.style else ""
            if style_name.startswith("Heading"):
                current_section = paragraph.text.strip()
            parts.append(f"[PAR:{i + 1}][SECTION:{current_section}]{paragraph.text}")
    for table in doc.tables:
        for row in table.rows:
            row_text = " | ".join(cell.text.strip() for cell in row.cells if cell.text.strip())
            if row_text:
                parts.append(row_text)
    return "\n".join(parts)


def _extract_txt_text(content: bytes) -> str:
    text = content.decode("utf-8")
    lines = text.split("\n")
    return "\n".join(f"[LINE:{i + 1}]{line}" for i, line in enumerate(lines))


def _detect_content_type(filename: str, content_type: Optional[str]) -> str:
    if content_type and content_type not in ("application/octet-stream", "binary/octet-stream"):
        return content_type
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext == "pdf":
        return "application/pdf"
    if ext in ("docx", "doc"):
        return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    if ext == "txt":
        return "text/plain"
    return content_type or "application/octet-stream"


class DocumentService:
    def __init__(self):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=100,
            length_function=len,
        )

    def _extract_text(self, content: bytes, filename: str, content_type: str) -> str:
        resolved_type = _detect_content_type(filename, content_type)
        logger.info(f"Extracting text from {filename} (type={resolved_type})")

        if resolved_type == "application/pdf":
            text = _extract_pdf_text(content)
        elif resolved_type in DOCX_CONTENT_TYPES or filename.lower().endswith((".docx", ".doc")):
            if filename.lower().endswith(".doc") and not filename.lower().endswith(".docx"):
                raise Exception(
                    "Legacy .doc files are not supported. Please save as .docx or .pdf and re-upload."
                )
            text = _extract_docx_text(content)
        elif resolved_type == "text/plain" or filename.lower().endswith(".txt"):
            text = _extract_txt_text(content)
        else:
            raise Exception(
                f"Unsupported file type '{resolved_type}'. Upload PDF, DOCX, or TXT files."
            )

        text = re.sub(r"\n{3,}", "\n\n", text).strip()
        if not text:
            raise Exception("Document appears to be empty or contains no readable text.")
        if not _is_readable_text(text):
            raise Exception(
                "Could not extract readable text from this file. "
                "If this is a scanned PDF, try OCR first, or re-save as DOCX/TXT."
            )
        return text

    def _detect_source_type(self, filename: str, content_type: str) -> str:
        """Determine source type from file extension/content type."""
        resolved = _detect_content_type(filename, content_type)
        if resolved == "application/pdf":
            return "pdf"
        if resolved in DOCX_CONTENT_TYPES:
            return "docx"
        if resolved == "text/plain":
            return "text"
        return "file"

    async def process_upload(self, db: Session, file: UploadFile, user_id: int):
        """
        Process an uploaded file:
        1. Extract text (with embedded metadata markers)
        2. Create document record in SQL
        3. Chunk text
        4. Extract metadata from each chunk
        5. Generate embeddings
        6. Store in LanceDB with rich metadata
        """
        logger.info(f"Starting upload processing for file: {file.filename}")
        content = await file.read()
        content_type = _detect_content_type(file.filename, file.content_type or "")
        source_type = self._detect_source_type(file.filename, content_type)

        try:
            text = self._extract_text(content, file.filename, content_type)
            logger.info(f"Extracted {len(text)} readable characters.")
        except Exception as e:
            logger.error(f"Text extraction failed: {str(e)}")
            raise e

        db_doc = crud_document.create_with_owner(
            db,
            filename=file.filename,
            content_type=content_type,
            user_id=user_id,
        )
        logger.info(f"Created SQL record for document ID: {db_doc.id}")

        chunks = self.text_splitter.split_text(text)
        logger.info(f"Split document into {len(chunks)} chunks.")

        if chunks:
            logger.info("Generating embeddings for chunks...")
            embeddings = embedding_service.generate_embeddings(chunks)

            lancedb_chunks = []
            for i, (chunk_text, embedding) in enumerate(zip(chunks, embeddings)):
                # Extract metadata markers before stripping them
                chunk_meta = _extract_chunk_metadata(chunk_text)
                chunk_meta["filename"] = file.filename
                chunk_meta["chunk_index"] = i
                chunk_meta["source_type"] = source_type

                lancedb_chunks.append({
                    "id": f"doc_{db_doc.id}_chunk_{i}",
                    "document_id": db_doc.id,
                    "user_id": user_id,
                    "text": _strip_markers(chunk_text),
                    "vector": embedding,
                    "metadata": json.dumps(chunk_meta),
                })

            logger.info(f"Saving {len(lancedb_chunks)} vectors to LanceDB...")
            await vector_service.add_chunks(lancedb_chunks)
            logger.info("LanceDB storage complete.")

        return db_doc

document_service = DocumentService()
