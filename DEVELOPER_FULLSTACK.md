# Full Stack Development - Guidelines

This document outlines the standard for end-to-end feature implementation in the ThoughtWeb Navigator ecosystem.

## 1. Backend Standards (FastAPI + SQLAlchemy)
- **Schema Design**: Use Pydantic for API contracts and SQLAlchemy for persistence.
- **Asynchronicity**: All I/O bound tasks (DB queries, LLM calls) must be `async`.
- **Security**: Implement strict ownership checks. Users must only access their own documents and chunks.
- **LanceDB**: Utilize LanceDB's `to_pydantic` integration for type-safe vector results.

## 2. Frontend Standards (React + TypeScript)
- **Context API**: Use `AppContext` for global application state (models, sources, queries).
- **API Fetching**: Always use the `apiFetch` utility to ensure JWT tokens are automatically included in headers.
- **Type Sharing**: Maintain parity between backend Pydantic models and frontend TypeScript interfaces.

## 3. RAG Pipeline Maintenance
- Periodically verify chunking quality.
- Monitor embedding generation times.
- Ensure similarity search results are correctly filtered by `user_id` before being passed to the LLM.

---
*Focus: Scalability, Security, and Speed.*
