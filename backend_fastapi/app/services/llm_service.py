import httpx
import json
from typing import List, Dict, Any, AsyncGenerator, Optional
from loguru import logger
from app.core.config import settings


class _FallbackLLM:
    async def generate_response(self, prompt: str, system_prompt: str = "", model: str = None) -> str:
        return "Fallback response: LLM backend is disabled in this environment."

    async def stream_response(self, prompt: str, system_prompt: str = "", model: str = None):
        yield "Fallback response: LLM backend is disabled in this environment."

    async def get_available_models(self):
        return ["fallback-model"]

    async def generate_nim_response(self, *args, **kwargs):
        raise Exception("NVIDIA NIM is disabled in fallback mode.")

    async def stream_nim_response(self, *args, **kwargs):
        yield "Fallback response: LLM backend is disabled in this environment."

    async def get_nim_models(self, *args, **kwargs):
        return []

    async def generate_openrouter_response(self, *args, **kwargs):
        raise Exception("OpenRouter is disabled in fallback mode.")

    async def stream_openrouter_response(self, *args, **kwargs):
        yield "Fallback response: LLM backend is disabled in this environment."

    async def get_openrouter_models(self, *args, **kwargs):
        return []


llm_service = _FallbackLLM()
