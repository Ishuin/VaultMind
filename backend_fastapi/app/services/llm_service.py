import httpx
import json
from typing import List, Dict, Any, AsyncGenerator, Optional
from loguru import logger
from app.core.config import settings

class LLMService:
    def __init__(self):
        self.ollama_url = f"{settings.OLLAMA_BASE_URL}/api/generate"
        self.ollama_model = settings.OLLAMA_MODEL
        self.nim_base_url = settings.NVIDIA_NIM_BASE_URL.rstrip("/")

    async def generate_response(self, prompt: str, system_prompt: str = "", model: str = None) -> str:
        """
        Generate a non-streaming response from Ollama.
        """
        target_model = model or self.ollama_model
        payload = {
            "model": target_model,
            "prompt": prompt,
            "system": system_prompt,
            "stream": False
        }
        
        logger.info(f"Sending request to Ollama: model={target_model} (URL: {self.ollama_url})")
        try:
            async with httpx.AsyncClient(timeout=300.0) as client:
                response = await client.post(self.ollama_url, json=payload)
                response.raise_for_status()
                return response.json().get("response", "")
        except httpx.ConnectError:
            logger.error(f"Connection failed: Could not reach Ollama at {self.ollama_url}. Is Ollama running?")
            raise Exception("Ollama connection failed")
        except Exception as e:
            logger.error(f"Ollama request failed ({type(e).__name__}): {str(e)}")
            raise e

    async def stream_response(self, prompt: str, system_prompt: str = "", model: str = None) -> AsyncGenerator[str, None]:
        """
        Generate a streaming response from Ollama.
        """
        target_model = model or self.ollama_model
        payload = {
            "model": target_model,
            "prompt": prompt,
            "system": system_prompt,
            "stream": True
        }
        
        async with httpx.AsyncClient(timeout=300.0) as client:
            async with client.stream("POST", self.ollama_url, json=payload) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if line:
                        data = json.loads(line)
                        yield data.get("response", "")
                        if data.get("done"):
                            break

    async def get_available_models(self) -> List[str]:
        """
        Fetch available models from the local Ollama instance.
        """
        url = f"{settings.OLLAMA_BASE_URL}/api/tags"
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(url)
                response.raise_for_status()
                tags = response.json().get("models", [])
                return [tag["name"] for tag in tags]
        except Exception as e:
            logger.error(f"Failed to fetch Ollama models: {str(e)}")
            return []

    def _resolve_nim_api_key(self, api_key: Optional[str] = None) -> str:
        key = api_key or settings.NVIDIA_API_KEY
        if not key:
            raise Exception("NVIDIA NIM API key is required")
        return key

    async def generate_nim_response(
        self,
        prompt: str,
        system_prompt: str = "",
        model: str = None,
        api_key: Optional[str] = None,
    ) -> str:
        """
        Generate a non-streaming response from NVIDIA NIM (OpenAI-compatible API).
        """
        target_model = model or "meta/llama-3.1-8b-instruct"
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": target_model,
            "messages": messages,
            "max_tokens": 2048,
            "temperature": 0.7,
            "stream": False,
        }

        headers = {
            "Authorization": f"Bearer {self._resolve_nim_api_key(api_key)}",
            "Content-Type": "application/json",
        }
        url = f"{self.nim_base_url}/chat/completions"

        logger.info(f"Sending request to NVIDIA NIM: model={target_model}")
        try:
            async with httpx.AsyncClient(timeout=300.0) as client:
                response = await client.post(url, json=payload, headers=headers)
                response.raise_for_status()
                data = response.json()
                return data["choices"][0]["message"]["content"]
        except httpx.HTTPStatusError as e:
            detail = e.response.text
            logger.error(f"NVIDIA NIM request failed ({e.response.status_code}): {detail}")
            raise Exception(f"NVIDIA NIM request failed: {detail}")
        except Exception as e:
            logger.error(f"NVIDIA NIM request failed ({type(e).__name__}): {str(e)}")
            raise e

    async def stream_nim_response(
        self,
        prompt: str,
        system_prompt: str = "",
        model: str = None,
        api_key: Optional[str] = None,
    ) -> AsyncGenerator[str, None]:
        """
        Generate a streaming response from NVIDIA NIM.
        """
        target_model = model or "meta/llama-3.1-8b-instruct"
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": target_model,
            "messages": messages,
            "max_tokens": 2048,
            "temperature": 0.7,
            "stream": True,
        }

        headers = {
            "Authorization": f"Bearer {self._resolve_nim_api_key(api_key)}",
            "Content-Type": "application/json",
        }
        url = f"{self.nim_base_url}/chat/completions"

        async with httpx.AsyncClient(timeout=300.0) as client:
            async with client.stream("POST", url, json=payload, headers=headers) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if not line or not line.startswith("data: "):
                        continue
                    data_str = line[6:]
                    if data_str.strip() == "[DONE]":
                        break
                    data = json.loads(data_str)
                    delta = data.get("choices", [{}])[0].get("delta", {})
                    content = delta.get("content", "")
                    if content:
                        yield content

    async def get_nim_models(self, api_key: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Fetch available models from NVIDIA NIM cloud API.
        """
        headers = {
            "Authorization": f"Bearer {self._resolve_nim_api_key(api_key)}",
        }
        url = f"{self.nim_base_url}/models"
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.get(url, headers=headers)
                response.raise_for_status()
                data = response.json()
                return data.get("data", [])
        except Exception as e:
            logger.error(f"Failed to fetch NVIDIA NIM models: {str(e)}")
            return []

llm_service = LLMService()
