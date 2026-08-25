from pathlib import Path
from typing import Optional

from mcp.server.lowlevel import Server
from mcp.server.models import InitializationOptions
from mcp.server.stdio import stdio_server
from mcp.types import Tool, TextContent
from loguru import logger

from app.services.pdf_service import PDFService

TMP_DIR = Path("/tmp/vaultmind_pdfs")
TMP_DIR.mkdir(parents=True, exist_ok=True)

mcp = Server("pdf")
pdf_service = PDFService()

PDF_TOOL = Tool(
    name="generate_pdf",
    description=(
        "Generate a PDF document from structured sections. "
        "Each section is either markdown text or an embedded image. "
        "This tool is deterministic: it only uses the provided content, not LLM interpretation."
    ),
    inputSchema={
        "type": "object",
        "properties": {
            "title": {
                "type": "string",
                "description": "Document title shown at the top.",
            },
            "sections": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "type": {
                            "type": "string",
                            "enum": ["text", "diagram", "image"],
                            "description": "text for markdown content, diagram for mermaid-like diagrams, image to embed a PNG/SVG/JPG",
                        },
                        "heading": {
                            "type": "string",
                            "description": "Optional section heading.",
                        },
                        "content": {
                            "type": "string",
                            "description": "Markdown content for text sections, diagram definition for diagram sections.",
                        },
                        "image_path": {
                            "type": "string",
                            "description": "Absolute filesystem path for image sections.",
                        },
                    },
                    "required": ["type"],
                    "oneOf": [
                        {"required": ["type", "content"], "properties": {"type": {"const": "text"}}},
                        {"required": ["type", "content"], "properties": {"type": {"const": "diagram"}}},
                        {"required": ["type", "image_path"], "properties": {"type": {"const": "image"}}},
                    ],
                },
                "minItems": 1,
            },
            "filename": {
                "type": "string",
                "description": "Optional output filename. Defaults to '<title>.pdf'.",
            },
        },
        "required": ["title", "sections"],
    },
)


@mcp.list_tools()
async def list_tools() -> list[Tool]:
    return [PDF_TOOL]


@mcp.call_tool()
async def call_tool(name: str, arguments: dict) -> list[TextContent]:
    if name != "generate_pdf":
        raise ValueError(f"Unknown tool: {name}")

    title = arguments.get("title") or "Document"
    sections = arguments.get("sections") or []
    filename = arguments.get("filename")

    try:
        out_path = pdf_service.generate(
            title=title,
            sections=sections,
            filename=filename,
        )
        return [TextContent(type="text", text=str(out_path))]
    except Exception as exc:
        logger.exception("MCP PDF generation failed")
        return [TextContent(type="text", text=f"ERROR: {exc}")]


async def main() -> None:
    async with stdio_server() as (read_stream, write_stream):
        await mcp.run(
            read_stream,
            write_stream,
            InitializationOptions(
                server_name="pdf",
                server_version="0.1.0",
                capabilities=mcp.get_capabilities(
                    notification_options=None,
                    experimental_capabilities={},
                ),
            ),
        )


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
