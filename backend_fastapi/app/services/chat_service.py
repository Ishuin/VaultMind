from loguru import logger
from typing import List, Dict, Any, AsyncGenerator, Optional
from app.services.embedding_service import embedding_service
from app.services.vector_service import vector_service
from app.services.llm_service import llm_service
from app.services.web_search_service import web_search_service

# Context budget: max tokens for retrieved context (leaving room for system prompt + query + output)
MAX_CONTEXT_TOKENS = 12000
# Rough estimate: 1 word ≈ 1.3 tokens, 1 token ≈ 4 chars
CHARS_PER_TOKEN = 4
MAX_CONTEXT_CHARS = MAX_CONTEXT_TOKENS * CHARS_PER_TOKEN


class ChatService:
    async def get_context(
        self, query: str, user_id: int, limit: int = 20
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

    async def get_web_context(self, query: str, doc_context: str = "", max_results: int = 20) -> tuple[str, List[Dict[str, Any]]]:
        """
        Retrieve supplementary context from web search.
        Prefer a source-derived search query when document context is available.
        """
        search_query = query
        if doc_context.strip():
            # Use the doc context to build a more focused web search query.
            # Heuristic: take the user's query as-is if it's specific;
            # otherwise, bias toward the document topic + query.
            doc_topic = doc_context.strip().split("\n")[0][:180]
            if len(query.strip()) <= 6:
                search_query = f"{doc_topic} {query}".strip()
            else:
                search_query = f"{doc_topic} about {query}".strip()

        results = await web_search_service.search(search_query, max_results=max_results)
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

    def _format_conversation_history(self, history: List[Dict[str, str]]) -> str:
        """
        Format conversation history into a readable string for context.
        """
        if not history:
            return ""
        parts = []
        for msg in history:
            role = "User" if msg["role"] == "user" else "Assistant"
            parts.append(f"{role}: {msg['content']}")
        return "\n".join(parts)

    @staticmethod
    def _is_conversational_query(query: str) -> bool:
        """
        Lightweight intent check to avoid unnecessary web search on greetings,
        small talk, or meta chat. Returns True if query looks conversational.
        """
        normalized = query.strip().lower()
        # Strip punctuation so "Hi," "Hello!" still match
        for ch in ".,!?;:\"'()[]{}":
            normalized = normalized.replace(ch, " ")
        normalized = " ".join(normalized.split())
        # Very short messages are usually conversational
        if len(normalized) <= 6:
            return True

        conversational_markers = [
            "hello", "hi", "hey", "how are you", "good morning", "good afternoon",
            "good evening", "thanks", "thank you", "bye", "goodbye", "take care",
            "nice to meet", "who are you", "what can you do", "what are you",
            "how do you do", "i'm fine", "i am fine", "not much", "same here",
            "good job", "great job", "well done", "awesome", "cool", "nice",
        ]
        if any(normalized.startswith(m) for m in conversational_markers):
            return True
        if normalized in {"hi", "hey", "hello", "bye", "ok", "okay", "yes", "no", "yep", "nope"}:
            return True
        return False

    def construct_prompt(
        self,
        query: str,
        context: str,
        web_context: str = "",
        has_doc_sources: bool = False,
        has_web_sources: bool = False,
        conversation_history: List[Dict[str, str]] = None,
    ) -> str:
        """
        Construct a prompt for the LLM using the retrieved context.
        Source labels are embedded in context as [1], [2], ... and [Web 1], [Web 2], ...
        
        Priority order:
        1. Documents + Web → use both (documents primary, web supplementary)
        2. Documents only → use documents
        3. History + Web → HYBRID: LLM arbitrates based on query type
        4. History only → use history
        5. Web only → use web
        6. Nothing → say "no documents found"
        """
        history_text = self._format_conversation_history(conversation_history or [])
        has_history = bool(history_text.strip())

        # Priority 1: Document sources + web — use both, but web wins on current facts when docs may be outdated
        if has_doc_sources and has_web_sources:
            return f"""You are a helpful assistant. Answer the user's question using both the user's personal document context AND current web search results.

RULES:
- Use the user's documents as the primary source for private/internal details, terminology, or specifics that only appear in their knowledge base.
- If the documents appear outdated, incomplete, or uncertain on factual claims, use the web results to correct or complete the answer.
- When documents and web results conflict on facts, prefer the more current/reliable source, usually the web results.
- Always cite claims with their labels: [1], [2] for documents or [Web 1], [Web 2] for web results.
- Include as many relevant citations as needed; do not artificially limit citations.
- Do NOT mention "context", "chunks", "embeddings", or technical retrieval details.

Context from user's documents:
{context}

Web search results:
{web_context}

User Question: {query}

Answer:"""

        # Priority 2: Document sources only — use documents
        if has_doc_sources:
            return f"""You are a helpful assistant. Answer the user's question using ONLY the context provided below from their personal knowledge base.

CRITICAL RULES:
- Answer ONLY from the provided context. Do NOT use any other knowledge.
- When referencing information, cite the source using its label like [1], [2], etc.
- Place citation markers immediately after the relevant sentence or claim.
- If multiple sources support a claim, include all relevant markers like [1][3].
- Do NOT mention "context", "chunks", "embeddings", or technical retrieval details.
- Write as if you are directly summarizing the documents themselves.
- Do NOT bring in outside knowledge about the topic.

Context from user's documents:
{context}

User Question: {query}

Answer:"""

        # Priority 3: History + Web — HYBRID MODE: LLM arbitrates
        # This handles: source deleted, user asks factual question that needs current info
        # OR user asks follow-up that should reference previous discussion
        if has_history and has_web_sources:
            return f"""You are a helpful assistant. The user is asking a question. Below is BOTH conversation history AND current web search results.

You must decide which source to use based on the question type:

USE CONVERSATION HISTORY WHEN:
- The user is asking a follow-up to something previously discussed (e.g., "explain that further", "what did you say about X")
- The user is asking about a concept or explanation from the previous answer
- Continuity with the previous response is important

USE WEB SEARCH RESULTS WHEN:
- The question asks for current/factual information (e.g., "who is the current PM", "what is the latest version")
- The question is unrelated to the previous conversation
- The web results contain more recent or accurate information than the history
- The history contains potentially outdated factual claims

RULES:
- For factual/current queries: Prefer web search results as they are more up-to-date
- For follow-up/conceptual queries: Prefer conversation history for continuity
- If web results and history conflict on facts, prefer web results
- When citing sources: Use [Web 1], [Web 2] for web results
- Do NOT mention "context", "history", "chunks", or technical details

Conversation History:
{history_text}

Web Search Results:
{web_context}

User Question: {query}

Answer:"""

        # Priority 4: History only — use history
        if has_history:
            return f"""You are a helpful assistant. The user is asking a follow-up question about a topic that was previously discussed in this conversation.

Below is the conversation history. Use ONLY the information from this history to answer the user's current question.

CRITICAL RULES:
- Answer ONLY from the conversation history below. Do NOT use any outside knowledge.
- If the history contains a relevant answer, summarize it clearly.
- If the history does NOT contain enough information to answer, say "I don't have enough information from our previous conversation to answer this question."
- Do NOT make up or infer information that is not explicitly stated in the history.
- Do NOT mention "context", "history", "chunks", or technical details.

Previous conversation:
{history_text}

Current Question: {query}

Answer:"""

        # Priority 5: Web sources only — first question, no prior context
        if has_web_sources:
            return f"""You are a helpful assistant. Answer the user's question using the web search results provided below.

RULES:
- Use all provided web results to give a complete, current, and accurate answer.
- When referencing information, cite the source using its label like [Web 1], [Web 2], etc.
- Include as many relevant citations as needed; do not artificially limit citations.
- Place citation markers immediately after the relevant sentence or claim.
- Do NOT mention "context", "chunks", "embeddings", or technical retrieval details in your response.

Web search results:
{web_context}

User Question: {query}

Answer:"""

        # Priority 6: No sources AND no history — tell user to upload
        return (
            "No relevant documents found in the user's knowledge base for this query.\n\n"
            f"User Query: {query}\n\n"
            "INSTRUCTIONS:\n"
            "- Tell the user that no matching documents were found.\n"
            "- Suggest they upload relevant files to their knowledge base.\n"
            "- Be brief — 1-2 sentences maximum.\n"
            "- Do NOT make up information. Do NOT answer the question from memory.\n"
            "- Do NOT mention 'context', 'chunks', 'embeddings', or technical details."
        )

    async def chat_with_context(
        self,
        query: str,
        user_id: int,
        model: str = None,
        provider: str = None,
        api_key: str = None,
        search_internet: bool = False,
        conversation_history: List[Dict[str, str]] = None,
    ) -> tuple[str, List[Dict[str, Any]]]:
        """
        Perform the full RAG cycle: Retrieve -> Prompt -> Generate.
        Returns (response_text, sources).
        """
        if self._is_conversational_query(query):
            return (
                "I'm doing well, thanks for asking! How can I help you today?",
                [],
            )

        doc_context, doc_sources = await self.get_context(query, user_id)

        web_context = ""
        web_sources: List[Dict[str, Any]] = []
        if search_internet:
            web_context, web_sources = await self.get_web_context(query, doc_context=doc_context)

        all_sources = doc_sources + web_sources

        prompt = self.construct_prompt(
            query, doc_context, web_context,
            has_doc_sources=bool(doc_sources),
            has_web_sources=bool(web_sources),
            conversation_history=conversation_history,
        )

        # Neutral system prompt — allow web-assisted answers when internet search is enabled
        system_prompt = (
            "You are a helpful AI assistant. "
            "If document context is provided, prioritize it and cite sources. "
            "If internet search is enabled and web results are provided, use them to answer accurately. "
            "If no context is available, you may answer from general knowledge. "
            "Do not mention 'context', 'chunks', 'embeddings', or technical details."
        )

        if provider and provider.lower() in ("nvidia", "nvidia nim"):
            response = await llm_service.generate_nim_response(
                prompt, system_prompt=system_prompt, model=model, api_key=api_key
            )
        elif provider and provider.lower() == "openrouter":
            response = await llm_service.generate_openrouter_response(
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
        conversation_history: List[Dict[str, str]] = None,
    ) -> AsyncGenerator[str, None]:
        """
        Perform the full RAG cycle with streaming response.
        Yields chunks; sources are attached via .sources attribute after stream completes.
        """
        if self._is_conversational_query(query):
            yield "I'm doing well, thanks for asking! How can I help you today?"
            stream_chat_with_context._last_sources = []
            return

        doc_context, doc_sources = await self.get_context(query, user_id)

        web_context = ""
        web_sources: List[Dict[str, Any]] = []
        if search_internet:
            web_context, web_sources = await self.get_web_context(query, doc_context=doc_context)

        # Attach sources to generator for caller to access
        all_sources = doc_sources + web_sources

        prompt = self.construct_prompt(
            query, doc_context, web_context,
            has_doc_sources=bool(doc_sources),
            has_web_sources=bool(web_sources),
            conversation_history=conversation_history,
        )

        # Neutral system prompt — allow web-assisted answers when internet search is enabled
        system_prompt = (
            "You are a helpful AI assistant. "
            "If document context is provided, prioritize it and cite sources. "
            "If internet search is enabled and web results are provided, use them to answer accurately. "
            "If no context is available, you may answer from general knowledge. "
            "Do not mention 'context', 'chunks', 'embeddings', or technical details."
        )

        # Store sources on generator for endpoint to retrieve
        stream_chat_with_context._last_sources = all_sources

        if provider and provider.lower() in ("nvidia", "nvidia nim"):
            async for chunk in llm_service.stream_nim_response(
                prompt, system_prompt=system_prompt, model=model, api_key=api_key
            ):
                yield chunk
            return
        elif provider and provider.lower() == "openrouter":
            async for chunk in llm_service.stream_openrouter_response(
                prompt, system_prompt=system_prompt, model=model, api_key=api_key
            ):
                yield chunk
            return
        async for chunk in llm_service.stream_response(prompt, system_prompt=system_prompt, model=model):
            yield chunk


chat_service = ChatService()
