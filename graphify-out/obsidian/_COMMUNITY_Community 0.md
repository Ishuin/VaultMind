---
type: community
cohesion: 0.06
members: 50
---

# Community 0

**Cohesion:** 0.06 - loosely connected
**Members:** 50 nodes

## Members
- [[.__init__()]] - code - backend_fastapi/app/services/document_service.py
- [[.__init__()_1]] - code - backend_fastapi/app/services/embedding_service.py
- [[.__init__()_2]] - code - backend_fastapi/app/services/llm_service.py
- [[.add_chunks()]] - code - backend_fastapi/app/services/vector_service.py
- [[.chat_with_context()]] - code - backend_fastapi/app/services/chat_service.py
- [[.construct_prompt()]] - code - backend_fastapi/app/services/chat_service.py
- [[.delete_by_document_id()]] - code - backend_fastapi/app/services/vector_service.py
- [[.generate_embedding()]] - code - backend_fastapi/app/services/embedding_service.py
- [[.generate_response()]] - code - backend_fastapi/app/services/llm_service.py
- [[.get_available_models()]] - code - backend_fastapi/app/services/llm_service.py
- [[.get_context()]] - code - backend_fastapi/app/services/chat_service.py
- [[.get_count()]] - code - backend_fastapi/app/services/vector_service.py
- [[.get_table()]] - code - backend_fastapi/app/services/vector_service.py
- [[.process_upload()]] - code - backend_fastapi/app/services/document_service.py
- [[.search()]] - code - backend_fastapi/app/services/vector_service.py
- [[.stream_chat_with_context()]] - code - backend_fastapi/app/services/chat_service.py
- [[.stream_response()]] - code - backend_fastapi/app/services/llm_service.py
- [[Add chunks to the vector database.         chunks List of dicts matching Docum]] - rationale - backend_fastapi/app/services/vector_service.py
- [[Any_5]] - code - backend_fastapi/app/services/vector_service.py
- [[ChatService]] - code - backend_fastapi/app/services/chat_service.py
- [[Construct a prompt for the LLM using the retrieved context.]] - rationale - backend_fastapi/app/services/chat_service.py
- [[Delete all chunks associated with a document.]] - rationale - backend_fastapi/app/services/vector_service.py
- [[DocumentChunk]] - code - backend_fastapi/app/db/lancedb.py
- [[DocumentService]] - code - backend_fastapi/app/services/document_service.py
- [[EmbeddingService]] - code - backend_fastapi/app/services/embedding_service.py
- [[Fetch available models from the local Ollama instance.]] - rationale - backend_fastapi/app/services/llm_service.py
- [[Generate a non-streaming response from Ollama.]] - rationale - backend_fastapi/app/services/llm_service.py
- [[Generate embedding for a single string.]] - rationale - backend_fastapi/app/services/embedding_service.py
- [[Generate embeddings for a list of strings.]] - rationale - backend_fastapi/app/services/embedding_service.py
- [[Get total number of chunks in the table.]] - rationale - backend_fastapi/app/services/vector_service.py
- [[LLMService]] - code - backend_fastapi/app/services/llm_service.py
- [[LanceModel]] - code
- [[Perform the full RAG cycle with streaming response.]] - rationale - backend_fastapi/app/services/chat_service.py
- [[Perform the full RAG cycle Retrieve - Prompt - Generate.]] - rationale - backend_fastapi/app/services/chat_service.py
- [[Process an uploaded file         1. Extract text         2. Create document r]] - rationale - backend_fastapi/app/services/document_service.py
- [[Retrieve relevant context from the vector database.]] - rationale - backend_fastapi/app/services/chat_service.py
- [[Schema for document chunks in LanceDB.]] - rationale - backend_fastapi/app/db/lancedb.py
- [[Search for similar chunks in the vector database.]] - rationale - backend_fastapi/app/services/vector_service.py
- [[Session_8]] - code - backend_fastapi/app/services/document_service.py
- [[UploadFile_1]] - code - backend_fastapi/app/services/document_service.py
- [[VectorService]] - code - backend_fastapi/app/services/vector_service.py
- [[float]] - code - backend_fastapi/app/services/embedding_service.py
- [[float_1]] - code - backend_fastapi/app/services/vector_service.py
- [[int_4]] - code - backend_fastapi/app/services/chat_service.py
- [[int_5]] - code - backend_fastapi/app/services/document_service.py
- [[int_6]] - code - backend_fastapi/app/services/vector_service.py
- [[str_5]] - code - backend_fastapi/app/services/chat_service.py
- [[str_6]] - code - backend_fastapi/app/services/embedding_service.py
- [[str_7]] - code - backend_fastapi/app/services/llm_service.py
- [[str_8]] - code - backend_fastapi/app/services/vector_service.py

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Community_0
SORT file.name ASC
```

## Connections to other communities
- 2 edges to [[_COMMUNITY_Community 36]]
- 1 edge to [[_COMMUNITY_Community 50]]
- 1 edge to [[_COMMUNITY_Community 4]]

## Top bridge nodes
- [[VectorService]] - degree 10, connects to 1 community
- [[DocumentChunk]] - degree 8, connects to 1 community
- [[DocumentService]] - degree 6, connects to 1 community
- [[EmbeddingService]] - degree 6, connects to 1 community