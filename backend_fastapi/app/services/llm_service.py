import asyncio
import httpx
import json
from typing import List, Dict, Any, AsyncGenerator, Optional
from loguru import logger
from app.core.config import settings
from app.core.llm_errors import LLMProviderError, map_status

# Verified to actually complete (2026-10-06). Served only when probing fails.
NIM_FALLBACK_MODELS = [
    "meta/llama-3.2-11b-vision-instruct",
    "meta/llama-3.2-90b-vision-instruct",
    "nvidia/nemotron-3-super-120b-a12b",
    "nvidia/nemotron-3-ultra-550b-a55b",
    "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning",
    "openai/gpt-oss-20b",
    "google/diffusiongemma-26b-a4b-it",
    "meta/muse-glimmer-30b",
    "poolside/laguna-xs-2.1",
]

# Provisioned models that answer 400 but are not chat models (safety classifiers,
# parsers, translators...). Picking one in the dashboard gives nonsense replies.
_NON_CHAT_TOKENS = (
    "content-safety", "safety-guard", "nemoguard", "parse",
    "calibration", "translate", "detector",
)


def _is_non_chat_model(model_id: str) -> bool:
    lowered = model_id.lower()
    return any(token in lowered for token in _NON_CHAT_TOKENS)

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
            raise LLMProviderError("nvidia", "NVIDIA NIM API key is required", 401, "missing_api_key")
        return key

    @staticmethod
    def _status_error(provider: str, e: httpx.HTTPStatusError) -> LLMProviderError:
        detail = (e.response.text or "")[:500]
        logger.error(f"{provider} request failed ({e.response.status_code}): {detail}")
        return LLMProviderError(provider, detail, map_status(e.response.status_code), "provider_http_error")

    @staticmethod
    def _require_key(provider: str, api_key: Optional[str]) -> str:
        if not api_key:
            raise LLMProviderError(provider, f"{provider} API key is required", 401, "missing_api_key")
        return api_key

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
                message = data.get("choices", [{}])[0].get("message", {})
                content = message.get("content")
                if not (content or "").strip():
                    # Never hand None/"" to the caller: it would render as a
                    # blank chat bubble. Surface it as a real provider error.
                    raise LLMProviderError(
                        "nvidia",
                        f"Model '{target_model}' returned an empty response",
                        502,
                        "empty_response",
                    )
                return content
        except httpx.HTTPStatusError as e:
            raise self._status_error("nvidia", e)
        except LLMProviderError:
            raise
        except Exception as e:
            logger.error(f"NVIDIA NIM request failed ({type(e).__name__}): {str(e)}")
            raise LLMProviderError("nvidia", str(e), 504, "provider_unreachable")

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

        emitted = 0
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
                        emitted += 1
                        yield content
        if not emitted:
            raise LLMProviderError(
                "nvidia",
                f"Model '{target_model}' returned an empty response",
                502,
                "empty_response",
            )

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

    async def probe_nim_models(self, api_key: Optional[str] = None) -> List[str]:
        """
        Return the catalog model ids THIS NVIDIA account can actually call.

        `GET /models` returns NVIDIA's public catalog (~80 models), but only a
        subset is provisioned per account. A POST with an EMPTY `messages` array
        tells them apart without spending any tokens:

            400 -> provisioned             -> keep
            404 -> "not found for account" -> drop
            410 -> "end of life"           -> drop
            else (429/5xx/timeout)         -> keep (NVIDIA throttles hard; a
                                              transient miss must not hide a
                                              model that works)

        Every definitive answer lands in well under a second, so the whole sweep
        runs in ~5s. Content quality is NOT checked here on purpose: real
        completions trip NVIDIA's 16-requests-per-worker limit, which made the
        probe both slow and lossy. The caller's empty-response guard covers that.
        """
        key = self._resolve_nim_api_key(api_key)
        headers = {"Authorization": f"Bearer {key}"}

        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.get(f"{self.nim_base_url}/models", headers=headers)
            response.raise_for_status()
            ids = [m.get("id") for m in response.json().get("data", []) if m.get("id")]

        semaphore = asyncio.Semaphore(16)

        async def probe(model_id: str, client: httpx.AsyncClient) -> tuple:
            async with semaphore:
                try:
                    r = await client.post(
                        f"{self.nim_base_url}/chat/completions",
                        headers=headers,
                        json={"model": model_id, "messages": [], "stream": False},
                        timeout=5.0,
                    )
                    return model_id, r.status_code
                except Exception:
                    return model_id, None

        async with httpx.AsyncClient(timeout=6.0) as client:
            results = dict(await asyncio.gather(*(probe(m, client) for m in ids)))

        working = [
            m for m in ids
            if results.get(m) not in (404, 410) and not _is_non_chat_model(m)
        ]
        logger.info(
            f"NIM probe: {len(working)}/{len(ids)} models usable for this account "
            f"({len(ids) - len(working)} retired/non-chat)"
        )
        if not working:
            logger.warning("NIM probe returned no usable models; caller should use fallback list")
        return working

    async def generate_openrouter_response(
        self,
        prompt: str,
        system_prompt: str = "",
        model: str = None,
        api_key: Optional[str] = None,
    ) -> str:
        self._require_key("openrouter", api_key)

        target_model = model or "openai/gpt-3.5-turbo"
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": target_model,
            "messages": messages,
            "stream": False,
        }

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:5173", # Required by OpenRouter
            "X-Title": "ThoughtWeb Navigator", # Recommended by OpenRouter
        }
        url = "https://openrouter.ai/api/v1/chat/completions"

        logger.info(f"Sending request to OpenRouter: model={target_model}")
        try:
            async with httpx.AsyncClient(timeout=300.0) as client:
                response = await client.post(url, json=payload, headers=headers)
                response.raise_for_status()
                data = response.json()
                return data["choices"][0]["message"]["content"]
        except httpx.HTTPStatusError as e:
            raise self._status_error("openrouter", e)
        except LLMProviderError:
            raise
        except Exception as e:
            logger.error(f"OpenRouter request failed ({type(e).__name__}): {str(e)}")
            raise LLMProviderError("openrouter", str(e), 504, "provider_unreachable")

    async def stream_openrouter_response(
        self,
        prompt: str,
        system_prompt: str = "",
        model: str = None,
        api_key: Optional[str] = None,
    ) -> AsyncGenerator[str, None]:
        self._require_key("openrouter", api_key)

        target_model = model or "openai/gpt-3.5-turbo"
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": target_model,
            "messages": messages,
            "stream": True,
        }

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:5173",
            "X-Title": "ThoughtWeb Navigator",
        }
        url = "https://openrouter.ai/api/v1/chat/completions"

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

    async def get_openrouter_models(self, api_key: Optional[str] = None) -> List[Dict[str, Any]]:
        if not api_key:
            return []
            
        headers = {
            "Authorization": f"Bearer {api_key}",
        }
        url = "https://openrouter.ai/api/v1/models"
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.get(url, headers=headers)
                response.raise_for_status()
                data = response.json()
                return data.get("data", [])
        except Exception as e:
            logger.error(f"Failed to fetch OpenRouter models: {str(e)}")
            return []

    # ---- OpenAI (BYOK) ----

    def _openai_key(self, api_key: Optional[str] = None) -> str:
        return self._require_key("openai", api_key or settings.OPENAI_API_KEY)

    async def generate_openai_response(self, prompt: str, system_prompt: str = "", model: str = None, api_key: Optional[str] = None) -> str:
        payload = self._openai_payload(prompt, system_prompt, model)
        headers = {"Authorization": f"Bearer {self._openai_key(api_key)}", "Content-Type": "application/json"}
        url = f"{settings.OPENAI_BASE_URL}/chat/completions"
        logger.info(f"Sending request to OpenAI: model={payload['model']}")
        try:
            async with httpx.AsyncClient(timeout=300.0) as client:
                response = await client.post(url, json=payload, headers=headers)
                response.raise_for_status()
                return response.json()["choices"][0]["message"]["content"]
        except httpx.HTTPStatusError as e:
            raise self._status_error("openai", e)
        except LLMProviderError:
            raise
        except Exception as e:
            logger.error(f"OpenAI request failed ({type(e).__name__}): {str(e)}")
            raise LLMProviderError("openai", str(e), 504, "provider_unreachable")

    async def stream_openai_response(self, prompt: str, system_prompt: str = "", model: str = None, api_key: Optional[str] = None) -> AsyncGenerator[str, None]:
        payload = self._openai_payload(prompt, system_prompt, model, stream=True)
        headers = {"Authorization": f"Bearer {self._openai_key(api_key)}", "Content-Type": "application/json"}
        url = f"{settings.OPENAI_BASE_URL}/chat/completions"
        try:
            async with httpx.AsyncClient(timeout=300.0) as client:
                async with client.stream("POST", url, json=payload, headers=headers) as response:
                    response.raise_for_status()
                    async for line in response.aiter_lines():
                        if not line or not line.startswith("data: "):
                            continue
                        data_str = line[6:]
                        if data_str.strip() == "[DONE]":
                            break
                        delta = json.loads(data_str).get("choices", [{}])[0].get("delta", {})
                        if delta.get("content"):
                            yield delta["content"]
        except httpx.HTTPStatusError as e:
            raise self._status_error("openai", e)

    async def get_openai_models(self, api_key: Optional[str] = None) -> List[Dict[str, Any]]:
        headers = {"Authorization": f"Bearer {self._openai_key(api_key)}"}
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.get(f"{settings.OPENAI_BASE_URL}/models", headers=headers)
                response.raise_for_status()
                return response.json().get("data", [])
        except Exception as e:
            logger.error(f"Failed to fetch OpenAI models: {str(e)}")
            return []

    @staticmethod
    def _openai_payload(prompt: str, system_prompt: str, model: str, stream: bool = False) -> Dict[str, Any]:
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        return {"model": model or settings.OPENAI_MODEL, "messages": messages, "stream": stream}

    # ---- Anthropic / Claude (BYOK) ----

    def _anthropic_key(self, api_key: Optional[str] = None) -> str:
        return self._require_key("anthropic", api_key or settings.ANTHROPIC_API_KEY)

    @staticmethod
    def _anthropic_payload(prompt: str, system_prompt: str, model: str, stream: bool = False) -> Dict[str, Any]:
        payload = {
            "model": model or settings.ANTHROPIC_MODEL,
            "max_tokens": 2048,
            "messages": [{"role": "user", "content": prompt}],
            "stream": stream,
        }
        if system_prompt:
            payload["system"] = system_prompt
        return payload

    def _anthropic_headers(self, api_key: Optional[str]) -> Dict[str, str]:
        return {
            "x-api-key": self._anthropic_key(api_key),
            "anthropic-version": settings.ANTHROPIC_VERSION,
            "Content-Type": "application/json",
        }

    async def generate_anthropic_response(self, prompt: str, system_prompt: str = "", model: str = None, api_key: Optional[str] = None) -> str:
        payload = self._anthropic_payload(prompt, system_prompt, model)
        url = f"{settings.ANTHROPIC_BASE_URL}/messages"
        logger.info(f"Sending request to Anthropic: model={payload['model']}")
        try:
            async with httpx.AsyncClient(timeout=300.0) as client:
                response = await client.post(url, json=payload, headers=self._anthropic_headers(api_key))
                response.raise_for_status()
                blocks = response.json().get("content", [])
                return "".join(b.get("text", "") for b in blocks if b.get("type") == "text")
        except httpx.HTTPStatusError as e:
            raise self._status_error("anthropic", e)
        except LLMProviderError:
            raise
        except Exception as e:
            logger.error(f"Anthropic request failed ({type(e).__name__}): {str(e)}")
            raise LLMProviderError("anthropic", str(e), 504, "provider_unreachable")

    async def stream_anthropic_response(self, prompt: str, system_prompt: str = "", model: str = None, api_key: Optional[str] = None) -> AsyncGenerator[str, None]:
        payload = self._anthropic_payload(prompt, system_prompt, model, stream=True)
        url = f"{settings.ANTHROPIC_BASE_URL}/messages"
        try:
            async with httpx.AsyncClient(timeout=300.0) as client:
                async with client.stream("POST", url, json=payload, headers=self._anthropic_headers(api_key)) as response:
                    response.raise_for_status()
                    async for line in response.aiter_lines():
                        if not line.startswith("data: "):
                            continue
                        try:
                            data = json.loads(line[6:])
                        except json.JSONDecodeError:
                            continue
                        if data.get("type") == "content_block_delta":
                            yield data.get("delta", {}).get("text", "")
                        elif data.get("type") == "error":
                            raise LLMProviderError("anthropic", str(data.get("error", "stream error")), 502, "provider_error")
        except httpx.HTTPStatusError as e:
            raise self._status_error("anthropic", e)

    async def get_anthropic_models(self, api_key: Optional[str] = None) -> List[Dict[str, Any]]:
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.get(
                    f"{settings.ANTHROPIC_BASE_URL}/models",
                    headers=self._anthropic_headers(api_key),
                )
                response.raise_for_status()
                return response.json().get("data", [])
        except Exception as e:
            logger.error(f"Failed to fetch Anthropic models: {str(e)}")
            return [{"id": m} for m in settings.ANTHROPIC_FALLBACK_MODELS]

llm_service = LLMService()
