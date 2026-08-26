from mcp.server.lowlevel import Server
from mcp.types import Tool, TextContent
from pydantic import BaseModel
from fastapi import HTTPException
import mcp.server.stdio
import asyncio
import logging

from app.services.youtube_analyzer import extract_video_analysis

logger = logging.getLogger(__name__)


class YoutubeAnalyzeInput(BaseModel):
    url: str


server = Server("youtube-analyzer")


@server.list_tools()
async def list_tools():
    return [
        Tool(
            name="youtube_analyze",
            description=(
                "Analyze a YouTube video for notes, summaries, and content understanding. "
                "Extracts transcript, OCR from key frames, scene changes, hook analysis, top comments, "
                "and structured sections. Returns structured data the LLM can use to create notes, "
                "bullet points, or summaries."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "url": {
                        "type": "string",
                        "description": "YouTube video URL or video ID",
                    }
                },
                "required": ["url"],
            },
        )
    ]


@server.call_tool()
async def call_tool(name: str, arguments: dict):
    if name != "youtube_analyze":
        raise ValueError(f"Unknown tool: {name}")

    url = arguments.get("url")
    if not url:
        raise ValueError("Missing required argument: url")

    try:
        result = extract_video_analysis(url)
        return [TextContent(type="text", text=json.dumps(result, ensure_ascii=False))]
    except ValueError as e:
        raise ValueError(f"Invalid input: {e}")
    except Exception as e:
        logger.exception("youtube_analyze failed")
        raise ValueError(f"Analysis failed: {e}")


async def run():
    async with mcp.server.stdio.stdio_server() as (read_stream, write_stream):
        await server.run(read_stream, write_stream, server.create_initialization_options())


if __name__ == "__main__":
    asyncio.run(run())
