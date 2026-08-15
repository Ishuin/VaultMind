# Phase 1: RAG Implementation Plan - ThoughtWeb Navigator

This document outlines the strategy for implementing the Phase 1 features, focusing on core RAG (Retrieval-Augmented Generation) capabilities, user management, and AI integration.

## 1. Core Objectives
- **Secure Authentication**: Robust Sign-in/Sign-up/Sign-out using FastAPI.
- **pgvector Integration**: Vector database setup for efficient knowledge retrieval.
- **RAG Pipeline**: Document ingestion (PDF/Text) and similarity-based retrieval.
- **AI Chat**: Interactive query interface using LLMs (starting with Ollama).
- **Profile Management**: Basic user details and activity tracking.

---

## 2. Infrastructure: Database & Vector Search
We will leverage **LanceDB** for storing and searching embeddings.

### LanceDB Strategy
LanceDB is a serverless, embedded vector database that stores data in local files.
- **Why**: Zero background resource consumption, extremely fast, and requires no Docker.
- **Storage**: Data will be stored in a `.lancedb` directory within the `backend_fastapi` folder.
- **Integration**: Uses a local embedding model to convert document chunks into vectors.

---

## 3. Backend Implementation (FastAPI)

### Phase 1 API Endpoints
- `POST /api/v1/sources/upload`: Handle file uploads and trigger the ingestion pipeline.
- `GET /api/v1/sources/`: List user's knowledge sources.
- `POST /api/v1/chat/query`: Process user queries, retrieve context, and generate AI response.
- `GET /api/v1/users/me`: Retrieve and update basic profile details.

### The RAG Pipeline
1.  **Ingestion**:
    - Extract text from uploaded documents (PDF/Markdown/Text).
    - Chunk text into manageable segments (e.g., 500-1000 characters with overlap).
    - Generate embeddings for each chunk using an embedding model (e.g., `sentence-transformers` or Ollama).
    - Store chunks and embeddings in PostgreSQL.
2. **Retrieval**:
    - Generate embedding for the user's query.
    - Perform a similarity search in LanceDB to find the most relevant chunks.
3.  **Generation**:
    - Pass retrieved context and user query to the LLM (Ollama).
    - Stream or return the final response.

---

## 4. Frontend Integration (React/Vite)

### UI Components to Implement/Migrate
- **Auth Flow**: Complete the migration of `Auth.tsx` and `AuthContext.tsx`.
- **Sources Interface**: Update `Sources.tsx` to handle real file uploads to the FastAPI backend.
- **Query Interface**: Connect `QueryInterface.tsx` to the `/chat/query` endpoint.
- **Profile Page**: Update `Profile.tsx` to display real data from `/users/me`.

---

## 5. Implementation Roadmap (Phase 1)

### Task 1: LanceDB Integration
- [ ] Initialize LanceDB in `backend_fastapi/.lancedb`.
- [ ] Create schemas for `documents` and `document_chunks`.

### Task 2: Document Ingestion Service
- [ ] Add `python-multipart`, `pypdf`, and `lancedb` dependencies.
- [ ] Implement text extraction and chunking service.
- [ ] Integrate local embedding generation.

### Task 3: Retrieval & Chat Service
- [ ] Implement vector similarity search in LanceDB.
- [ ] Build the prompt construction logic (Context + Query).
- [ ] Connect to Ollama API for response generation.


### Task 4: Frontend "Wiring"
- [ ] Update `SourcesList` to fetch from FastAPI.
- [ ] Update `QueryInterface` to display AI responses.
- [ ] Finalize Profile detail synchronization.

---

*Note: This document will be updated as we complete tasks and refine the architecture.*
