# ThoughtWeb Navigator - Project Instructions

This document provides foundational mandates and architectural guidance for the **ThoughtWeb Navigator** project.

## Strategic Architecture: RAG-First FastAPI
The project has migrated to a high-performance **Python FastAPI** backend with an embedded **LanceDB** vector store.
- **Primary Backend**: `backend_fastapi/` (Python 3.10+).
- **Vector Database**: **LanceDB** (Local serverless storage in `.lancedb/`).
- **Embeddings**: Local CPU-based generation via `sentence-transformers` (`all-MiniLM-L6-v2`).
- **LLM Engine**: **Ollama** for local inference (e.g., Llama 3.2, Qwen).
- **Relational Data**: PostgreSQL for metadata and user management.

## Development Mandates

### 1. Zero-Docker Development
- Core RAG features must not depend on Docker. Use LanceDB for vector search.
- Local PostgreSQL should be used for metadata.

### 2. High-Performance RAG Pipeline
- **Ingestion**: Extract -> Chunk (1000 chars) -> Embed (Local) -> Store (LanceDB).
- **Retrieval**: Query Embed -> Similarity Search -> Contextual Prompt -> LLM Generation.
- **Filtering**: Always use `prefilter=True` in LanceDB to ensure user data isolation.

### 3. Frontend Excellence (React + Framer Motion)
- Use **Framer Motion** for all transitions, loading states, and interactive feedback.
- Maintain a "glassmorphism" aesthetic with consistent cyan/purple gradients.
- **API First**: All frontend interactions must go through the FastAPI `/api/v1/` endpoints.

## Operational Guidelines

### Role: Full Stack Developer
- Implement end-to-end features from DB schema to UI components.
- Ensure type safety across both Python (Pydantic) and TypeScript.
- Optimize the RAG pipeline for speed and accuracy.

### Role: Frontend & UI Specialist
- Prioritize visual polish and smooth animations.
- Use `shadcn/ui` for base components, customized with project-specific glass styles.
- Implement robust error handling with toast notifications.

---
*Last Updated: May 8, 2026*

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- ALWAYS read graphify-out/GRAPH_REPORT.md before reading any source files, running grep/glob searches, or answering codebase questions. The graph is your primary map of the codebase.
- IF graphify-out/wiki/index.md EXISTS, navigate it instead of reading raw files
- For cross-module "how does X relate to Y" questions, prefer `graphify query "<question>"`, `graphify path "<A>" "<B>"`, or `graphify explain "<concept>"` over grep — these traverse the graph's EXTRACTED + INFERRED edges instead of scanning files
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
