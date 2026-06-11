from loguru import logger
from typing import List, Dict, Any, AsyncGenerator
from app.services.embedding_service import embedding_service
from app.services.vector_service import vector_service
from app.services.llm_service import llm_service

class ChatService:
    async def get_context(self, query: str, user_id: int, limit: int = 10) -> str:
        """
        Retrieve relevant context from the vector database.
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
        
        context = "\n\n".join([chunk.get("text", "") for chunk in chunks if chunk.get("text")])
        if not context.strip():
            logger.warning(f"No usable context retrieved for user_id={user_id}. Vault has {total_chunks} total chunks.")
        return context

    def construct_prompt(self, query: str, context: str) -> str:
        """
        Construct a prompt for the LLM using the retrieved context.
        """
        if not context.strip():
            return (
                f"User Query: {query}\n\n"
                "No relevant context was found in the user's knowledge base for this query. "
                "Respond that no matching information was found in their uploaded sources, "
                "and suggest they verify the document was uploaded successfully and re-upload if needed."
            )

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
    ) -> str:
        """
        Perform the full RAG cycle: Retrieve -> Prompt -> Generate.
        """
        context = await self.get_context(query, user_id)
        prompt = self.construct_prompt(query, context)
        
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
    ) -> AsyncGenerator[str, None]:
        """
        Perform the full RAG cycle with streaming response.
        """
        context = await self.get_context(query, user_id)
        prompt = self.construct_prompt(query, context)
        
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
