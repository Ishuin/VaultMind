from loguru import logger
from typing import List, Dict, Any, AsyncGenerator
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
    async def get_context(self, query: str, user_id: int, limit: int = 10) -> str:
        """
        Retrieve relevant context from the vector database.
        Truncates to fit within context budget for the LLM.
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
        
        # Build context within token budget
        context_parts = []
        total_chars = 0
        for chunk in chunks:
            text = chunk.get("text", "")
            if not text:
                continue
            # Check if adding this chunk would exceed budget
            if total_chars + len(text) > MAX_CONTEXT_CHARS:
                # Add truncated version if there's room for at least 100 chars
                remaining = MAX_CONTEXT_CHARS - total_chars
                if remaining >= 100:
                    context_parts.append(text[:remaining] + "...")
                logger.info(f"Context truncated at {len(context_parts)} chunks (budget: {MAX_CONTEXT_TOKENS} tokens)")
                break
            context_parts.append(text)
            total_chars += len(text)
        
        context = "\n\n".join(context_parts)
        if not context.strip():
            logger.warning(f"No usable context retrieved for user_id={user_id}. Vault has {total_chunks} total chunks.")
        return context

    async def get_web_context(self, query: str, max_results: int = 5) -> str:
        """
        Retrieve supplementary context from web search.
        """
        results = await web_search_service.search(query, max_results=max_results)
        if not results:
            return ""
        
        formatted = []
        for i, r in enumerate(results, 1):
            formatted.append(f"[{i}] {r['title']}\n{r['snippet']}\nSource: {r['url']}")
        return "\n\n".join(formatted)

    def construct_prompt(self, query: str, context: str, web_context: str = "") -> str:
        """
        Construct a prompt for the LLM using the retrieved context.
        """
        has_docs = bool(context.strip())
        has_web = bool(web_context.strip())
        
        if not has_docs and not has_web:
            return (
                f"User Query: {query}\n\n"
                "No relevant context was found in the user's knowledge base for this query. "
                "Respond that no matching information was found in their uploaded sources, "
                "and suggest they verify the document was uploaded successfully and re-upload if needed."
            )
        
        if has_web and not has_docs:
            return f"""You are a helpful assistant. Answer the user's question using the web search results provided below.

RULES:
- Provide a clear, concise answer based on the web search results.
- Cite sources by name when referencing them (e.g., "according to [source name]").
- Do NOT mention "context", "chunks", "embeddings", or technical retrieval details in your response.

Web search results:
{web_context}

User Question: {query}

Answer:"""

        if has_web:
            return f"""You are a helpful assistant. Answer the user's question using the context provided below from the user's personal knowledge base AND supplementary web search results.

RULES:
- Prioritize information from the user's personal documents when available.
- Use web search results to fill gaps, provide current information, or add context not found in the user's documents.
- If the user's documents and web results conflict, prefer the user's documents.
- Summarize the ACTUAL CONTENT of the documents, not technical metadata or system descriptions.
- Do NOT mention "context", "chunks", "embeddings", or technical retrieval details.
- Cite web sources by name when referencing them (e.g., "according to [source name]").
- Write as if you are directly summarizing the documents themselves.

Context from user's documents:
{context}

Supplementary web search results:
{web_context}

User Question: {query}

Answer:"""

        return f"""You are a helpful assistant. Answer the user's question using ONLY the context provided below from their personal knowledge base.

IMPORTANT RULES:
- Summarize the ACTUAL CONTENT of the documents, not technical metadata or system descriptions.
- If the context contains technical details about chunking, embeddings, or system architecture, ignore those and focus on the SUBSTANCE of what the documents are about.
- Provide a clear, concise summary of the key points, topics, and information contained in the documents.
- Do NOT mention "context", "chunks", "embeddings", or technical retrieval details in your response.
- Write as if you are directly summarizing the documents themselves.

Context from user's documents:
{context}

User Question: {query}

Summary:"""

    async def chat_with_context(
        self,
        query: str,
        user_id: int,
        model: str = None,
        provider: str = None,
        api_key: str = None,
        search_internet: bool = False,
    ) -> str:
        """
        Perform the full RAG cycle: Retrieve -> Prompt -> Generate.
        """
        context = await self.get_context(query, user_id)
        
        web_context = ""
        if search_internet:
            web_context = await self.get_web_context(query)
        
        prompt = self.construct_prompt(query, context, web_context)
        
        system_prompt = "You are VaultMind, a helpful AI assistant that summarizes and answers questions about users' personal documents. Focus on the actual content and meaning of the documents, not technical implementation details. Provide clear, concise, and useful responses."
        
        if provider and provider.lower() in ("nvidia", "nvidia nim"):
            return await llm_service.generate_nim_response(
                prompt, system_prompt=system_prompt, model=model, api_key=api_key
            )
        return await llm_service.generate_response(prompt, system_prompt=system_prompt, model=model)

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
        """
        context = await self.get_context(query, user_id)
        
        web_context = ""
        if search_internet:
            web_context = await self.get_web_context(query)
        
        prompt = self.construct_prompt(query, context, web_context)
        
        system_prompt = "You are VaultMind, a helpful AI assistant that summarizes and answers questions about users' personal documents. Focus on the actual content and meaning of the documents, not technical implementation details. Provide clear, concise, and useful responses."
        
        if provider and provider.lower() in ("nvidia", "nvidia nim"):
            async for chunk in llm_service.stream_nim_response(
                prompt, system_prompt=system_prompt, model=model, api_key=api_key
            ):
                yield chunk
            return
        async for chunk in llm_service.stream_response(prompt, system_prompt=system_prompt, model=model):
            yield chunk

chat_service = ChatService()
