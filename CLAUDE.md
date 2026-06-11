# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ThoughtWeb Navigator is a full-stack knowledge management application with AI-powered features. The system consists of:
- Frontend: React/TypeScript application (in `thoughtweb-navigator/`)
- Backend: FastAPI Python application (in `backend_fastapi/`)

## Architecture

### Frontend Architecture
- Built with React, TypeScript, and Vite
- Uses Supabase for authentication (but is being phased out for FastAPI auth)
- Implements a context-based state management pattern with React Context
- UI components use shadcn/ui and Tailwind CSS
- Communicates with the backend via REST API

### Backend Architecture
- FastAPI server with PostgreSQL for user data and document metadata
- LanceDB for vector storage of document chunks
- Implements a Retrieval-Augmented Generation (RAG) system for querying documents
- Uses Ollama for local LLM inference
- Document processing pipeline: PDF/text extraction → chunking → embedding → vector storage

## Common Development Commands

### Running the Application

To start both the frontend and backend in development mode:
```bash
# Option 1: Use the provided PowerShell script (Windows)
.\run-product.ps1

# Option 2: Start services separately
# Terminal 1 - Backend:
cd backend_fastapi
# Create virtual environment and install dependencies
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
# Start the server
python -m uvicorn app.main:app --reload --port 8000 --host 127.0.0.1

# Terminal 2 - Frontend:
cd thoughtweb-navigator
npm install
npm run dev
```

### Building for Production
```bash
# Frontend build
cd thoughtweb-navigator
npm run build
```

### Running Tests
```bash
# Frontend (add test scripts to package.json as needed)
npm run test

# Backend (add pytest configuration as needed)
cd backend_fastapi
python -m pytest
```

### Linting
```bash
# Frontend
cd thoughtweb-navigator
npm run lint

# Backend
cd backend_fastapi
# Add linting configuration as needed
```

## Key Files and Directories

### Frontend (`thoughtweb-navigator/`)
- `src/` - Main source code
  - `components/` - React components organized by feature
  - `context/` - React context providers (AuthContext, AppContext)
  - `lib/` - Utility functions and API clients
  - `pages/` - Page components
- `src/lib/api.ts` - Main API client for communicating with backend
- `src/context/AuthContext.tsx` - Authentication logic (migrating from Supabase to FastAPI)
- `src/lib/supabase.ts` - Legacy Supabase client (stubbed)

### Backend (`backend_fastapi/`)
- `app/main.py` - FastAPI application entry point
- `app/api/v1/` - API endpoints (users, login, sources, chat)
- `app/services/` - Core business logic
  - `document_service.py` - Document processing (upload, chunking, embedding)
  - `chat_service.py` - RAG implementation
  - `llm_service.py` - Ollama integration
  - `vector_service.py` - LanceDB integration
- `app/models/` - SQLAlchemy data models
- `app/schemas/` - Pydantic schemas for API validation
- `app/crud/` - Data access layer

## Environment Configuration

### Frontend
- `thoughtweb-navigator/.env` - API URL configuration
- `thoughtweb-navigator/.env.example` - Template with all required variables

### Backend
- `backend_fastapi/.env` - Database and CORS configuration
- `backend_fastapi/.env.example` - Template with all required variables

## API Endpoints

The backend provides the following key endpoints:
- `/login/access-token` - Authentication
- `/users/` - User management
- `/sources/` - Document sources
- `/chat/` - Chat interface with RAG capabilities

## Development Workflow

1. **Authentication Flow**: 
   - Frontend uses FastAPI for authentication instead of Supabase
   - Token-based auth with localStorage storage

2. **Document Processing Pipeline**:
   - Upload document via `/sources/upload`
   - Text extraction and chunking
   - Embedding generation
   - Vector storage in LanceDB

3. **Query Processing Pipeline**:
   - User submits query via chat interface
   - Context retrieval from LanceDB
   - Prompt construction with context
   - LLM response generation

## Key Services

### Document Service (`document_service.py`)
- Handles document upload and processing
- Text extraction from PDFs and text files
- Text chunking with RecursiveCharacterTextSplitter
- Embedding generation and storage

### Chat Service (`chat_service.py`)
- Context retrieval from vector database
- Prompt construction with retrieved context
- LLM response generation via `llm_service`

### LLM Service (`llm_service.py`)
- Integration with Ollama for local LLM inference
- Handles both streaming and non-streaming responses

### Vector Service (`vector_service.py`)
- Integration with LanceDB for vector storage and retrieval
- Search functionality for relevant document chunks

## Data Models

### User Management
- Users are stored in PostgreSQL with SQLAlchemy
- Authentication uses JWT tokens
- Passwords are hashed with passlib

### Document Storage
- Document metadata stored in PostgreSQL
- Document chunks stored in LanceDB as vectors
- Each chunk has metadata linking it to the source document

## Testing

Currently, there are no configured test suites. When adding tests:
1. For frontend: Add Jest/React Testing Library tests
2. For backend: Add pytest unit and integration tests

## Deployment

The application can be deployed separately:
- Frontend: Build and deploy to Vercel/Netlify/other static hosting
- Backend: Deploy to any cloud provider that supports Python applications with PostgreSQL and Ollama