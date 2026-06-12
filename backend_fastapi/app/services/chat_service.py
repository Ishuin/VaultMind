from loguru import logger
from typing import List, Dict, Any, AsyncGenerator, Optional
from app.services.embedding_service import embedding_service
from app.services.vector_service import vector_service
from app.services.llm_service import llm_service
from app.services.web_search_service import web_search_service

# Context budget: max tokens for retrieved context (leaving room for system prompt + query + output)
MAX_CONTEXT_TOKENS = 3000
# Rough estimate: 1 word ≈ 1.3 tokens, 1 token ≈ 4 chars
CHARS_PER_TOKEN = 4
MAX_CONTEXT_CHARS = MAX_CONTEXT_TOKENS * CHARS_PER_TOKEN


class ChatService:
    async def get_context(
        self, query: str, user_id: int, limit: int = 10
    ) -> tuple[str, List[Dict[str, Any]]]:
        """
        Retrieve relevant context from the vector database.
        Returns (context_text, sources) where sources contain metadata for citations.
        """
        total_chunks = vector_service.get_count()
        logger.info(f"Retrieving context. Total chunks in Vault: {total_chunks}")
        logger.info(f"Retrieving context for user_id={user_id}, query='{query}'")
        query_vector = embedding_service.generate_embedding(query)
        chunks = await vector_service.search(query_vector, user_id, limit=limit)

        logger.info(f"Found {len(chunks)} relevant chunks in Vault.")
        if len(chunks) > 0:
            for i, chunk in enumerate(chunks):
                logger.debug(f"Chunk {i} score match: {chunk.get('_distance', 'N/A')}")

        # Build context with source labels and collect source metadata
        context_parts: List[str] = []
        sources: List[Dict[str, Any]] = []
        total_chars = 0
        source_counter = 0

        for chunk in chunks:
            text = chunk.get("text", "")
            if not text:
                continue

            # Parse metadata
            raw_meta = chunk.get("metadata", "{}")
            if isinstance(raw_meta, str):
                try:
                    meta = __import__("json").loads(raw_meta)
                except Exception:
                    meta = {}
            else:
                meta = raw_meta

            # Determine source label
            source_counter += 1
            filename = meta.get("filename", "Unknown")
            source_type = meta.get("source_type", "file")

            # Build location description
            location_parts = []
            if source_type == "pdf":
                page = meta.get("page_start")
                page_end = meta.get("page_end")
                if page:
                    location_parts.append(f"Page {page}" + (f"–{page_end}" if page_end and page_end != page else ""))
            elif source_type == "docx":
                section = meta.get("section")
                if section:
                    location_parts.append(section)
                par = meta.get("paragraph_start")
                if par:
                    location_parts.append(f"¶{par}")
            elif source_type == "text":
                line_start = meta.get("line_start")
                line_end = meta.get("line_end")
                if line_start:
                    location_parts.append(f"Lines {line_start}" + (f"–{line_end}" if line_end and line_end != line_start else ""))

            location_str = ", ".join(location_parts) if location_parts else ""
            source_label = f"[{source_counter}] {filename}"
            if location_str:
                source_label += f" ({location_str})"

            # Check if adding this chunk would exceed budget
            labeled_text = f"{source_label}:\n{text}"
            if total_chars + len(labeled_text) > MAX_CONTEXT_CHARS:
                remaining = MAX_CONTEXT_CHARS - total_chars
                if remaining >= 100:
                    context_parts.append(labeled_text[:remaining] + "...")
                logger.info(f"Context truncated at {source_counter} chunks (budget: {MAX_CONTEXT_TOKENS} tokens)")
                break

            context_parts.append(labeled_text)
            total_chars += len(labeled_text)

            # Build source record
            distance = chunk.get("_distance", 0)
            source_record: Dict[str, Any] = {
                "id": source_counter,
                "document_id": chunk.get("document_id"),
                "filename": filename,
                "source_type": source_type,
                "relevance_score": round(1 - distance, 4) if distance else None,
            }
            if source_type == "pdf":
                source_record["page"] = meta.get("page_start")
            elif source_type == "docx":
                source_record["section"] = meta.get("section")
                source_record["paragraph_start"] = meta.get("paragraph_start")
                source_record["paragraph_end"] = meta.get("paragraph_end")
            elif source_type == "text":
                source_record["line_start"] = meta.get("line_start")
                source_record["line_end"] = meta.get("line_end")

            sources.append(source_record)

        context = "\n\n".join(context_parts)
        if not context.strip():
            logger.warning(f"No usable context retrieved for user_id={user_id}. Vault has {total_chunks} total chunks.")
        return context, sources

    async def get_web_context(self, query: str, max_results: int = 5) -> tuple[str, List[Dict[str, Any]]]:
        """
        Retrieve supplementary context from web search.
        Returns (context_text, sources).
        """
        results = await web_search_service.search(query, max_results=max_results)
        if not results:
            return "", []

        formatted = []
        sources = []
        for i, r in enumerate(results, 1):
            formatted.append(f"[Web {i}] {r['title']}\n{r['snippet']}\nSource: {r['url']}")
            sources.append({
                "id": i,
                "filename": r["title"],
                "source_type": "web",
                "url": r["url"],
                "snippet": r["snippet"],
            })
        return "\n\n".join(formatted), sources

    def construct_prompt(
        self,
        query: str,
        context: str,
        web_context: str = "",
        has_doc_sources: bool = False,
        has_web_sources: bool = False,
    ) -> str:
        """
        Construct a prompt for the LLM using the retrieved context.
        Source labels are embedded in context as [1], [2], ... and [Web 1], [Web 2], ...
        """
        if not has_doc_sources and not has_web_sources:
            return (
                f"IMPORTANT: The user's knowledge base is EMPTY — no documents have been uploaded yet, or no uploaded documents match this query.\n\n"
                f"User Query: {query}\n\n"
                "INSTRUCTIONS:\n"
                "- You MUST tell the user that no documents were found matching their query.\n"
                "- Do NOT make up information. Do NOT talk about VaultMind, knowledge bases, or the system itself.\n"
                "- Simply say you couldn't find any matching documents and suggest they upload relevant files first.\n"
                "- Be brief — 1-2 sentences maximum."
            )

        if has_web_sources and not has_doc_sources:
            return f"""You are a helpful assistant. Answer the user's question using the web search results provided below.

RULES:
- Provide a clear, concise answer based on the web search results.
- When referencing information, cite the source using its label like [Web 1], [Web 2], etc.
- Place citation markers immediately after the relevant sentence or claim.
- Do NOT mention "context", "chunks", "embeddings", or technical retrieval details in your response.

Web search results:
{context}

User Question: {query}

Answer:"""

        if has_web_sources:
            return f"""You are a helpful assistant. Answer the user's question using the context provided below from the user's personal knowledge base AND supplementary web search results.

RULES:
- Prioritize information from the user's personal documents when available.
- Use web search results to fill gaps, provide current information, or add context not found in the user's documents.
- When referencing information, cite the source using its label like [1], [2] for documents or [Web 1], [Web 2] for web results.
- Place citation markers immediately after the relevant sentence or claim.
- If the user's documents and web results conflict, prefer the user's documents.
- Do NOT mention "context", "chunks", "embeddings", or technical retrieval details.

Context from user's documents:
{context}

Supplementary web search results:
{web_context}

User Question: {query}

Answer:"""

        return f"""You are a helpful assistant. Answer the user's question using ONLY the context provided below from their personal knowledge base.

RULES:
- When referencing information, cite the source using its label like [1], [2], etc.
- Place citation markers immediately after the relevant sentence or claim.
- If multiple sources support a claim, include all relevant markers like [1][3].
- Do NOT mention "context", "chunks", "embeddings", or technical retrieval details.
- Write as if you are directly summarizing the documents themselves.

Context from user's documents:
{context}

User Question: {query}

Answer:"""

    async def chat_with_context(
        self,
        query: str,
        user_id: int,
        model: str = None,
        provider: str = None,
        api_key: str = None,
        search_internet: bool = False,
    ) -> tuple[str, List[Dict[str, Any]]]:
        """
        Perform the full RAG cycle: Retrieve -> Prompt -> Generate.
        Returns (response_text, sources).
        """
        doc_context, doc_sources = await self.get_context(query, user_id)

        web_context = ""
        web_sources: List[Dict[str, Any]] = []
        if search_internet:
            web_context, web_sources = await self.get_web_context(query)

        all_sources = doc_sources + web_sources

        prompt = self.construct_prompt(
            query, doc_context, web_context,
            has_doc_sources=bool(doc_sources),
            has_web_sources=bool(web_sources),
        )

        system_prompt = "You are VaultMind, a helpful AI assistant that summarizes and answers questions about users' personal documents. Focus on the actual content and meaning of the documents, not technical implementation details. Provide clear, concise, and useful responses."

        if provider and provider.lower() in ("nvidia", "nvidia nim"):
            response = await llm_service.generate_nim_response(
                prompt, system_prompt=system_prompt, model=model, api_key=api_key
            )
        else:
            response = await llm_service.generate_response(prompt, system_prompt=system_prompt, model=model)

        return response, all_sources

    async def stream_chat_with_context(
        self,
        query: str,
        user_id: int,
        model: str = None,
        provider: str = None,
        api_key: str = None,
        search_internet: bool = False,
    ) -> AsyncGenerator[str, None]:
        """
        Perform the full RAG cycle with streaming response.
        Yields chunks; sources are attached via .sources attribute after stream completes.
        """
        doc_context, doc_sources = await self.get_context(query, user_id)

        web_context = ""
        web_sources: List[Dict[str, Any]] = []
        if search_internet:
            web_context, web_sources = await self.get_web_context(query)

        # Attach sources to generator for caller to access
        all_sources = doc_sources + web_sources

        prompt = self.construct_prompt(
            query, doc_context, web_context,
            has_doc_sources=bool(doc_sources),
            has_web_sources=bool(web_sources),
        )

        system_prompt = "You are VaultMind, a helpful AI assistant that summarizes and answers questions about users' personal documents. Focus on the actual content and meaning of the documents, not technical implementation details. Provide clear, concise, and useful responses."

        # Store sources on generator for endpoint to retrieve
        stream_chat_with_context._last_sources = all_sources

        if provider and provider.lower() in ("nvidia", "nvidia nim"):
            async for chunk in llm_service.stream_nim_response(
                prompt, system_prompt=system_prompt, model=model, api_key=api_key
            ):
                yield chunk
            return
        async for chunk in llm_service.stream_response(prompt, system_prompt=system_prompt, model=model):
            yield chunk


chat_service = ChatService()
