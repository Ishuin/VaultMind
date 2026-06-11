# Detailed Project Plan for Second Brain Application Backend (FastAPI - Commit-Level)

This document provides a highly granular, commit-level project plan for the development of a FastAPI backend for a Second Brain application. Each section corresponds to a major development phase, and within each phase, tasks are broken down into sub-tasks and user stories, designed to be implemented as individual commits or very small, atomic code changes. This structure aims to facilitate a synergistic development process, allowing for one-at-a-time execution by another LLM or an automation agent.

---

## Phase 1: Define Project Setup and Initial Backend Infrastructure (FastAPI)

**Objective:** To establish the foundational project structure, initialize the FastAPI backend environment, and set up basic configurations. This phase focuses on creating the necessary directories, installing core dependencies, and preparing the backend for service development.

**User Story:** As a backend developer, I want a well-structured project setup and a basic FastAPI backend infrastructure so that I can begin implementing core services efficiently.

### Task 1.1: Initialize Project Directory and Virtual Environment

**Description:** Create the root project directory and set up a Python virtual environment.

**Sub-tasks (Commit-level):**

*   **1.1.1: Create Root Project Directory**
    *   **Action:** Create a new directory named `second-brain-fastapi-backend`.
    *   **Commit Message:** `feat: Initialize root project directory`
    *   **Files Changed:** `second-brain-fastapi-backend/` (new directory)

*   **1.1.2: Initialize Git Repository**
    *   **Action:** Navigate into `second-brain-fastapi-backend` and run `git init`.
    *   **Commit Message:** `feat: Initialize git repository`
    *   **Files Changed:** `second-brain-fastapi-backend/.git/` (new directory)

*   **1.1.3: Create `.gitignore` File**
    *   **Action:** Create a `.gitignore` file in the root directory with common entries for Python, virtual environments, and OS-specific files (e.g., `__pycache__/`, `.venv/`, `.env`, `.DS_Store`).
    *   **Commit Message:** `feat: Add .gitignore file`
    *   **Files Changed:** `second-brain-fastapi-backend/.gitignore`

*   **1.1.4: Create Python Virtual Environment**
    *   **Action:** Run `python3 -m venv .venv` in the root directory.
    *   **Commit Message:** `feat: Create Python virtual environment`
    *   **Files Changed:** `second-brain-fastapi-backend/.venv/` (new directory)

*   **1.1.5: Activate Virtual Environment**
    *   **Action:** Run `source .venv/bin/activate`.
    *   **Commit Message:** `chore: Activate virtual environment`
    *   **Files Changed:** (No project files changed, environment activation)

### Task 1.2: Install Core FastAPI Dependencies

**Description:** Install FastAPI and its essential dependencies within the virtual environment.

**User Story:** As a backend developer, I want to install FastAPI and its required libraries so that I can start building the API.

**Sub-tasks (Commit-level):**

*   **1.2.1: Install FastAPI**
    *   **Action:** Run `pip install fastapi`.
    *   **Commit Message:** `feat: Install FastAPI`
    *   **Files Changed:** `second-brain-fastapi-backend/requirements.txt` (new file, if not existing, or updated), `second-brain-fastapi-backend/.venv/` (updated)

*   **1.2.2: Install Uvicorn (ASGI Server)**
    *   **Action:** Run `pip install uvicorn[standard]`.
    *   **Commit Message:** `feat: Install Uvicorn ASGI server`
    *   **Files Changed:** `second-brain-fastapi-backend/requirements.txt` (updated), `second-brain-fastapi-backend/.venv/` (updated)

*   **1.2.3: Create `requirements.txt`**
    *   **Action:** Run `pip freeze > requirements.txt` to capture installed dependencies.
    *   **Commit Message:** `feat: Generate requirements.txt`
    *   **Files Changed:** `second-brain-fastapi-backend/requirements.txt`

### Task 1.3: Create Basic FastAPI Application Structure

**Description:** Set up the initial FastAPI application file and a basic `main.py` to serve as the entry point.

**User Story:** As a backend developer, I want a basic FastAPI application file so that I can verify the setup.

**Sub-tasks (Commit-level):**

*   **1.3.1: Create `app` Directory**
    *   **Action:** Create a directory `app` in the root of the project.
    *   **Commit Message:** `feat: Create app directory`
    *   **Files Changed:** `second-brain-fastapi-backend/app/` (new directory)

*   **1.3.2: Create `main.py` Entry Point**
    *   **Action:** Create `second-brain-fastapi-backend/app/main.py` with a minimal FastAPI app instance and a root endpoint (e.g., `@app.get("/")`).
    *   **Commit Message:** `feat: Create main.py with basic FastAPI app`
    *   **Files Changed:** `second-brain-fastapi-backend/app/main.py`

*   **1.3.3: Verify FastAPI Application Run**
    *   **Action:** Run `uvicorn app.main:app --reload` from the root directory. Access `http://127.0.0.1:8000/` in a browser to verify the root endpoint response.
    *   **Commit Message:** `test: Verify FastAPI application starts and responds`
    *   **Files Changed:** (No code changes, verification step)

### Task 1.4: Implement Configuration Management

**Description:** Set up a system for managing application configurations using environment variables and Pydantic Settings.

**User Story:** As a developer, I want to manage configurations using environment variables so that sensitive data is not hardcoded and settings are flexible.

**Sub-tasks (Commit-level):**

*   **1.4.1: Install Pydantic Settings**
    *   **Action:** Run `pip install pydantic-settings`.
    *   **Commit Message:** `feat: Install pydantic-settings`
    *   **Files Changed:** `second-brain-fastapi-backend/requirements.txt` (updated), `second-brain-fastapi-backend/.venv/` (updated)

*   **1.4.2: Create `config.py`**
    *   **Action:** Create `second-brain-fastapi-backend/app/core/config.py` defining a `Settings` class inheriting from `BaseSettings` to load environment variables (e.g., `APP_NAME`, `DEBUG_MODE`).
    *   **Commit Message:** `feat: Create config.py for settings management`
    *   **Files Changed:** `second-brain-fastapi-backend/app/core/config.py`

*   **1.4.3: Create `.env` File for Environment Variables**
    *   **Action:** Create `second-brain-fastapi-backend/.env` with placeholder variables (e.g., `APP_NAME=SecondBrainBackend`, `DEBUG_MODE=True`). Add `.env` to `.gitignore`.
    *   **Commit Message:** `feat: Add .env for application settings`
    *   **Files Changed:** `second-brain-fastapi-backend/.env`

*   **1.4.4: Integrate Settings into `main.py`**
    *   **Action:** Import `Settings` from `app.core.config` into `app.main.py` and use an instance of `Settings` to access configuration values.
    *   **Commit Message:** `feat: Integrate settings into main.py`
    *   **Files Changed:** `second-brain-fastapi-backend/app/main.py`

### Task 1.5: Implement CORS Middleware

**Description:** Configure Cross-Origin Resource Sharing (CORS) to allow the React/JS frontend to communicate with the FastAPI backend.

**User Story:** As a frontend developer, I want the backend to accept requests from my frontend application so that I can integrate them without CORS errors.

**Sub-tasks (Commit-level):**

*   **1.5.1: Install `python-multipart`**
    *   **Action:** Run `pip install python-multipart` (required for some FastAPI middleware).
    *   **Commit Message:** `feat: Install python-multipart`
    *   **Files Changed:** `second-brain-fastapi-backend/requirements.txt` (updated), `second-brain-fastapi-backend/.venv/` (updated)

*   **1.5.2: Add CORS Middleware to `main.py`**
    *   **Action:** In `second-brain-fastapi-backend/app/main.py`, import `CORSMiddleware` and add it to the FastAPI app instance, configuring `allow_origins`, `allow_credentials`, `allow_methods`, and `allow_headers` (e.g., `allow_origins=[


"`http://localhost:3000`"] for development).
    *   **Commit Message:** `feat: Implement CORS middleware`
    *   **Files Changed:** `second-brain-fastapi-backend/app/main.py`

*   **1.5.3: Test CORS Configuration**
    *   **Action:** Attempt to make a request from the frontend (running on `http://localhost:3000`) to a backend endpoint. Verify no CORS errors occur.
    *   **Commit Message:** `test: Verify CORS configuration`
    *   **Files Changed:** (No code changes, verification step)

### Task 1.6: Implement Basic Logging

**Description:** Set up basic logging for the FastAPI application.

**User Story:** As a developer, I want to see application logs so that I can debug issues during development.

**Sub-tasks (Commit-level):**

*   **1.6.1: Configure Python Logging**
    *   **Action:** Create `second-brain-fastapi-backend/app/core/logging.py` to configure Python's `logging` module, setting up a basic console handler.
    *   **Commit Message:** `feat: Configure basic Python logging`
    *   **Files Changed:** `second-brain-fastapi-backend/app/core/logging.py`

*   **1.6.2: Integrate Logger into `main.py`**
    *   **Action:** Import and initialize the logger from `app.core.logging` in `app.main.py`.
    *   **Commit Message:** `feat: Integrate logger into main.py`
    *   **Files Changed:** `second-brain-fastapi-backend/app/main.py`

*   **1.6.3: Test Logging Output**
    *   **Action:** Add a sample log message to the root endpoint in `main.py`. Run the application and verify the log message appears in the console.
    *   **Commit Message:** `test: Verify logging output`
    *   **Files Changed:** `second-brain-fastapi-backend/app/main.py`

---

## Phase 2: Implement Core Backend Services and Database Schema (FastAPI)

**Objective:** To define and implement the core database schemas and backend services for user management and knowledge item storage, including authentication and basic data models, using SQLAlchemy with FastAPI.

**User Story:** As a backend developer, I want to implement the core services and database schema so that the application can securely manage users and their knowledge items.

### Task 2.1: Install Database Dependencies and Setup SQLAlchemy

**Description:** Install PostgreSQL driver and SQLAlchemy, and configure the database connection.

**User Story:** As a backend developer, I want to connect to a PostgreSQL database using SQLAlchemy so that I can persist application data.

**Sub-tasks (Commit-level):**

*   **2.1.1: Install PostgreSQL Driver (Psycopg2)**
    *   **Action:** Run `pip install psycopg2-binary`.
    *   **Commit Message:** `feat: Install psycopg2-binary for PostgreSQL`
    *   **Files Changed:** `second-brain-fastapi-backend/requirements.txt` (updated), `second-brain-fastapi-backend/.venv/` (updated)

*   **2.1.2: Install SQLAlchemy and Alembic**
    *   **Action:** Run `pip install sqlalchemy alembic`.
    *   **Commit Message:** `feat: Install SQLAlchemy and Alembic`
    *   **Files Changed:** `second-brain-fastapi-backend/requirements.txt` (updated), `second-brain-fastapi-backend/.venv/` (updated)

*   **2.1.3: Create Database Configuration**
    *   **Action:** Create `second-brain-fastapi-backend/app/db/database.py` to define `SQLAlchemy` engine, `SessionLocal`, and `Base` for declarative models. Update `app/core/config.py` with `DATABASE_URL`.
    *   **Commit Message:** `feat: Configure SQLAlchemy database connection`
    *   **Files Changed:** `second-brain-fastapi-backend/app/db/database.py`, `second-brain-fastapi-backend/app/core/config.py`

*   **2.1.4: Create `get_db` Dependency**
    *   **Action:** In `second-brain-fastapi-backend/app/db/database.py`, create a `get_db` function that yields a database session, to be used as a FastAPI dependency.
    *   **Commit Message:** `feat: Create get_db dependency for database sessions`
    *   **Files Changed:** `second-brain-fastapi-backend/app/db/database.py`

*   **2.1.5: Initialize Alembic for Migrations**
    *   **Action:** Run `alembic init alembic` from the root directory. Configure `alembic.ini` to point to `app/db/database.py` for metadata.
    *   **Commit Message:** `feat: Initialize Alembic for database migrations`
    *   **Files Changed:** `second-brain-fastapi-backend/alembic/`, `second-brain-fastapi-backend/alembic.ini`

### Task 2.2: Implement User Model and CRUD Operations

**Description:** Define the SQLAlchemy User model, Pydantic schemas for user data, and implement basic CRUD operations.

**User Story:** As a backend developer, I want a User model and associated CRUD operations so that I can manage user data in the database.

**Sub-tasks (Commit-level):**

*   **2.2.1: Create User SQLAlchemy Model**
    *   **Action:** Create `second-brain-fastapi-backend/app/models/user.py` defining the `User` SQLAlchemy model (id, email, hashed_password, username, created_at, updated_at, last_login, subscription_plan).
    *   **Commit Message:** `feat: Create User SQLAlchemy model`
    *   **Files Changed:** `second-brain-fastapi-backend/app/models/user.py`

*   **2.2.2: Create User Pydantic Schemas**
    *   **Action:** Create `second-brain-fastapi-backend/app/schemas/user.py` defining Pydantic schemas for `UserCreate`, `UserUpdate`, and `UserResponse`.
    *   **Commit Message:** `feat: Create User Pydantic schemas`
    *   **Files Changed:** `second-brain-fastapi-backend/app/schemas/user.py`

*   **2.2.3: Create User Repository/Service**
    *   **Action:** Create `second-brain-fastapi-backend/app/crud/user.py` with a class `CRUDUser` containing methods for creating, reading, updating, and deleting users.
    *   **Commit Message:** `feat: Create CRUDUser service for user operations`
    *   **Files Changed:** `second-brain-fastapi-backend/app/crud/user.py`

*   **2.2.4: Create User Router**
    *   **Action:** Create `second-brain-fastapi-backend/app/api/v1/endpoints/users.py` with a `APIRouter` for user-related endpoints (e.g., `GET /users/{user_id}`).
    *   **Commit Message:** `feat: Create users API router`
    *   **Files Changed:** `second-brain-fastapi-backend/app/api/v1/endpoints/users.py`

*   **2.2.5: Include User Router in `main.py`**
    *   **Action:** In `second-brain-fastapi-backend/app/main.py`, include the `users` router.
    *   **Commit Message:** `feat: Include users router in main app`
    *   **Files Changed:** `second-brain-fastapi-backend/app/main.py`

*   **2.2.6: Generate Initial Migration for User Model**
    *   **Action:** Run `alembic revision --autogenerate -m 


"`Initial User Model`" --autogenerate`.
    *   **Commit Message:** `feat: Generate initial migration for User model`
    *   **Files Changed:** `second-brain-fastapi-backend/alembic/versions/*.py` (new file)

*   **2.2.7: Apply Initial Migration**
    *   **Action:** Run `alembic upgrade head`.
    *   **Commit Message:** `feat: Apply initial migration`
    *   **Files Changed:** (No code changes, database schema updated)

*   **2.2.8: Test User CRUD Operations**
    *   **Action:** Use an API client (e.g., Postman, Insomnia) to test creating, retrieving, updating, and deleting users via the FastAPI endpoints. Verify data persistence in the PostgreSQL database.
    *   **Commit Message:** `test: Verify User CRUD operations`
    *   **Files Changed:** (No code changes, verification step)

### Task 2.3: Implement Authentication Logic (FastAPI)

**Description:** Develop the backend logic for user registration and login, including password hashing, JWT token generation, and authentication dependencies.

**User Story:** As a user, I want to securely register and log in to the application so that I can access my Second Brain.

**Sub-tasks (Commit-level):**

*   **2.3.1: Install Hashing Library (Passlib)**
    *   **Action:** Run `pip install passlib[bcrypt]`.
    *   **Commit Message:** `feat: Install passlib for password hashing`
    *   **Files Changed:** `second-brain-fastapi-backend/requirements.txt` (updated), `second-brain-fastapi-backend/.venv/` (updated)

*   **2.3.2: Install JWT Dependencies**
    *   **Action:** Run `pip install python-jose[cryptography]`.
    *   **Commit Message:** `feat: Install python-jose for JWT`
    *   **Files Changed:** `second-brain-fastapi-backend/requirements.txt` (updated), `second-brain-fastapi-backend/.venv/` (updated)

*   **2.3.3: Create Authentication Utility Functions**
    *   **Action:** Create `second-brain-fastapi-backend/app/core/security.py` with functions for password hashing, verification, and JWT token creation/decoding.
    *   **Commit Message:** `feat: Create security utilities for auth`
    *   **Files Changed:** `second-brain-fastapi-backend/app/core/security.py`

*   **2.3.4: Update `config.py` with JWT Settings**
    *   **Action:** Add `SECRET_KEY`, `ALGORITHM`, and `ACCESS_TOKEN_EXPIRE_MINUTES` to `app/core/config.py` and update `.env` with placeholder values.
    *   **Commit Message:** `feat: Add JWT settings to config`
    *   **Files Changed:** `second-brain-fastapi-backend/app/core/config.py`, `second-brain-fastapi-backend/.env`

*   **2.3.5: Create Authentication Schemas**
    *   **Action:** Create `second-brain-fastapi-backend/app/schemas/token.py` for `Token` and `TokenData` Pydantic models.
    *   **Commit Message:** `feat: Create token schemas`
    *   **Files Changed:** `second-brain-fastapi-backend/app/schemas/token.py`

*   **2.3.6: Create Authentication Router**
    *   **Action:** Create `second-brain-fastapi-backend/app/api/v1/endpoints/auth.py` with a `APIRouter` for authentication endpoints.
    *   **Commit Message:** `feat: Create auth API router`
    *   **Files Changed:** `second-brain-fastapi-backend/app/api/v1/endpoints/auth.py`

*   **2.3.7: Implement User Registration Endpoint**
    *   **Action:** In `app/api/v1/endpoints/auth.py`, add a `POST /auth/register` endpoint that takes `UserCreate` schema, hashes password, creates user via `CRUDUser`, and returns `UserResponse`.
    *   **Commit Message:** `feat: Implement user registration endpoint`
    *   **Files Changed:** `second-brain-fastapi-backend/app/api/v1/endpoints/auth.py`

*   **2.3.8: Implement User Login Endpoint**
    *   **Action:** In `app/api/v1/endpoints/auth.py`, add a `POST /auth/login` endpoint that takes username/password, verifies credentials, and returns a JWT `Token`.
    *   **Commit Message:** `feat: Implement user login endpoint with JWT`
    *   **Files Changed:** `second-brain-fastapi-backend/app/api/v1/endpoints/auth.py`

*   **2.3.9: Create Authentication Dependency**
    *   **Action:** Create `second-brain-fastapi-backend/app/api/deps.py` with `get_current_user` dependency that decodes JWT and retrieves the authenticated user.
    *   **Commit Message:** `feat: Create get_current_user authentication dependency`
    *   **Files Changed:** `second-brain-fastapi-backend/app/api/deps.py`

*   **2.3.10: Protect User Endpoints with Authentication Dependency**
    *   **Action:** Modify `app/api/v1/endpoints/users.py` to use `get_current_user` dependency for protected routes (e.g., `GET /users/me`).
    *   **Commit Message:** `feat: Protect user endpoints with auth dependency`
    *   **Files Changed:** `second-brain-fastapi-backend/app/api/v1/endpoints/users.py`

*   **2.3.11: Include Auth Router in `main.py`**
    *   **Action:** In `second-brain-fastapi-backend/app/main.py`, include the `auth` router.
    *   **Commit Message:** `feat: Include auth router in main app`
    *   **Files Changed:** `second-brain-fastapi-backend/app/main.py`

*   **2.3.12: Test User Registration and Login**
    *   **Action:** Use an API client to test `/auth/register` and `/auth/login`. Verify user creation, JWT token generation, and access to protected user endpoints.
    *   **Commit Message:** `test: Verify user registration and login flow`
    *   **Files Changed:** (No code changes, verification step)

### Task 2.4: Implement KnowledgeItem Model and CRUD Operations

**Description:** Define the SQLAlchemy KnowledgeItem model, Pydantic schemas, and implement basic CRUD operations for knowledge items.

**User Story:** As a backend developer, I want a KnowledgeItem model and associated CRUD operations so that I can manage knowledge item data in the database.

**Sub-tasks (Commit-level):**

*   **2.4.1: Create KnowledgeItem SQLAlchemy Model**
    *   **Action:** Create `second-brain-fastapi-backend/app/models/knowledge_item.py` defining the `KnowledgeItem` SQLAlchemy model (id, user_id, title, content, content_type, created_at, updated_at, last_accessed_at, is_archived, is_deleted, source_url, original_filename, word_count, para_type, parent_id).
    *   **Commit Message:** `feat: Create KnowledgeItem SQLAlchemy model`
    *   **Files Changed:** `second-brain-fastapi-backend/app/models/knowledge_item.py`

*   **2.4.2: Create KnowledgeItem Pydantic Schemas**
    *   **Action:** Create `second-brain-fastapi-backend/app/schemas/knowledge_item.py` defining Pydantic schemas for `KnowledgeItemCreate`, `KnowledgeItemUpdate`, and `KnowledgeItemResponse`.
    *   **Commit Message:** `feat: Create KnowledgeItem Pydantic schemas`
    *   **Files Changed:** `second-brain-fastapi-backend/app/schemas/knowledge_item.py`

*   **2.4.3: Create KnowledgeItem Repository/Service**
    *   **Action:** Create `second-brain-fastapi-backend/app/crud/knowledge_item.py` with a class `CRUDKnowledgeItem` containing methods for creating, reading, updating, and deleting knowledge items, ensuring user ownership.
    *   **Commit Message:** `feat: Create CRUDKnowledgeItem service`
    *   **Files Changed:** `second-brain-fastapi-backend/app/crud/knowledge_item.py`

*   **2.4.4: Create KnowledgeItem Router**
    *   **Action:** Create `second-brain-fastapi-backend/app/api/v1/endpoints/knowledge_items.py` with a `APIRouter` for knowledge item related endpoints.
    *   **Commit Message:** `feat: Create knowledge items API router`
    *   **Files Changed:** `second-brain-fastapi-backend/app/api/v1/endpoints/knowledge_items.py`

*   **2.4.5: Implement Knowledge Item CRUD Endpoints**
    *   **Action:** In `app/api/v1/endpoints/knowledge_items.py`, add `POST /knowledge_items`, `GET /knowledge_items`, `GET /knowledge_items/{item_id}`, `PUT /knowledge_items/{item_id}`, `DELETE /knowledge_items/{item_id}` endpoints. Ensure all are protected by `get_current_user` and enforce user ownership.
    *   **Commit Message:** `feat: Implement KnowledgeItem CRUD endpoints`
    *   **Files Changed:** `second-brain-fastapi-backend/app/api/v1/endpoints/knowledge_items.py`

*   **2.4.6: Include KnowledgeItem Router in `main.py`**
    *   **Action:** In `second-brain-fastapi-backend/app/main.py`, include the `knowledge_items` router.
    *   **Commit Message:** `feat: Include knowledge items router in main app`
    *   **Files Changed:** `second-brain-fastapi-backend/app/main.py`

*   **2.4.7: Generate Migration for KnowledgeItem Model**
    *   **Action:** Run `alembic revision --autogenerate -m "Add KnowledgeItem Model"`.
    *   **Commit Message:** `feat: Generate migration for KnowledgeItem model`
    *   **Files Changed:** `second-brain-fastapi-backend/alembic/versions/*.py` (new file)

*   **2.4.8: Apply KnowledgeItem Migration**
    *   **Action:** Run `alembic upgrade head`.
    *   **Commit Message:** `feat: Apply KnowledgeItem migration`
    *   **Files Changed:** (No code changes, database schema updated)

*   **2.4.9: Test KnowledgeItem CRUD Operations**
    *   **Action:** Use an API client to test creating, retrieving, updating, and deleting knowledge items, ensuring proper authentication and user ownership.
    *   **Commit Message:** `test: Verify KnowledgeItem CRUD operations`
    *   **Files Changed:** (No code changes, verification step)

---

## Phase 3: Set up Vector Database and Embedding Generation (FastAPI)

**Objective:** To integrate a vector database and establish the pipeline for generating and storing embeddings of knowledge item content, crucial for semantic search and RAG. This phase will also consider the Model Context Protocol (MCP) for efficient context management.

**User Story:** As a backend developer, I want to store vector embeddings of my knowledge items and manage their context efficiently so that I can perform semantic searches and power AI features.

### Task 3.1: Integrate Vector Database Client

**Description:** Install and configure the client library for the chosen vector database (e.g., Pinecone, Weaviate, Qdrant) in the backend.

**User Story:** As a backend developer, I want to connect to a vector database so that I can store and retrieve embeddings.

**Sub-tasks (Commit-level):**

*   **3.1.1: Install Vector Database Client Library**
    *   **Action:** Run `pip install pinecone-client` (or equivalent for Weaviate/Qdrant).
    *   **Commit Message:** `feat: Install Pinecone client library`
    *   **Files Changed:** `second-brain-fastapi-backend/requirements.txt` (updated), `second-brain-fastapi-backend/.venv/` (updated)

*   **3.1.2: Configure Vector Database Credentials**
    *   **Action:** Add environment variables for vector database API key, environment, and index name to `second-brain-fastapi-backend/.env`. Update `app/core/config.py` to load these settings.
    *   **Commit Message:** `feat: Add vector DB credentials to .env and config`
    *   **Files Changed:** `second-brain-fastapi-backend/.env`, `second-brain-fastapi-backend/app/core/config.py`

*   **3.1.3: Create Vector Database Client Class**
    *   **Action:** Create `second-brain-fastapi-backend/app/core/vector_db.py` with a class `VectorDBClient` to initialize and manage the connection to the vector database.
    *   **Commit Message:** `feat: Create VectorDBClient class`
    *   **Files Changed:** `second-brain-fastapi-backend/app/core/vector_db.py`

*   **3.1.4: Create Vector Database Dependency**
    *   **Action:** In `second-brain-fastapi-backend/app/api/deps.py`, create a `get_vector_db_client` function that yields an instance of `VectorDBClient`.
    *   **Commit Message:** `feat: Create get_vector_db_client dependency`
    *   **Files Changed:** `second-brain-fastapi-backend/app/api/deps.py`

### Task 3.2: Implement Text Chunking Logic

**Description:** Develop a utility to break down large text content into smaller, manageable chunks suitable for embedding.

**User Story:** As a backend developer, I want to chunk large documents so that they can be effectively processed for embeddings.

**Sub-tasks (Commit-level):**

*   **3.2.1: Create Text Chunking Utility Class**
    *   **Action:** Create `second-brain-fastapi-backend/app/core/text_splitter.py` with a class `TextSplitter` containing a method (e.g., `split_text`) that takes a string and returns a list of smaller strings, respecting a maximum chunk size and overlap.
    *   **Commit Message:** `feat: Implement TextSplitter utility class`
    *   **Files Changed:** `second-brain-fastapi-backend/app/core/text_splitter.py`

*   **3.2.2: Add Unit Tests for TextSplitter**
    *   **Action:** Create `second-brain-fastapi-backend/tests/core/test_text_splitter.py` and write unit tests for the `TextSplitter` class.
    *   **Commit Message:** `test: Add unit tests for TextSplitter`
    *   **Files Changed:** `second-brain-fastapi-backend/tests/core/test_text_splitter.py`

### Task 3.3: Implement Embedding Generation Service

**Description:** Create a service responsible for interacting with an embedding model to generate vector representations of text chunks.

**User Story:** As a backend developer, I want to generate embeddings for text chunks so that they can be stored in the vector database.

**Sub-tasks (Commit-level):**

*   **3.3.1: Install Embedding Model Client Library**
    *   **Action:** Run `pip install openai` (or equivalent for Google AI/Cohere).
    *   **Commit Message:** `feat: Install OpenAI embedding client`
    *   **Files Changed:** `second-brain-fastapi-backend/requirements.txt` (updated), `second-brain-fastapi-backend/.venv/` (updated)

*   **3.3.2: Configure Embedding Model Credentials**
    *   **Action:** Add environment variables for embedding model API key to `second-brain-fastapi-backend/.env`. Update `app/core/config.py` to load this setting.
    *   **Commit Message:** `feat: Add embedding model API key to .env and config`
    *   **Files Changed:** `second-brain-fastapi-backend/.env`, `second-brain-fastapi-backend/app/core/config.py`

*   **3.3.3: Create Embedding Service Class**
    *   **Action:** Create `second-brain-fastapi-backend/app/services/embedding_service.py` with a class `EmbeddingService` containing a method (e.g., `generate_embedding`) that takes a string and returns its vector embedding using the chosen model.
    *   **Commit Message:** `feat: Create EmbeddingService class`
    *   **Files Changed:** `second-brain-fastapi-backend/app/services/embedding_service.py`

*   **3.3.4: Create Embedding Service Dependency**
    *   **Action:** In `second-brain-fastapi-backend/app/api/deps.py`, create a `get_embedding_service` function that yields an instance of `EmbeddingService`.
    *   **Commit Message:** `feat: Create get_embedding_service dependency`
    *   **Files Changed:** `second-brain-fastapi-backend/app/api/deps.py`

### Task 3.4: Create Chunks Model and CRUD Operations

**Description:** Define the SQLAlchemy `Chunk` model, Pydantic schemas, and implement basic CRUD operations for text chunks.

**User Story:** As a backend developer, I want to store text chunks in the database so that I can manage them before embedding.

**Sub-tasks (Commit-level):**

*   **3.4.1: Create Chunk SQLAlchemy Model**
    *   **Action:** Create `second-brain-fastapi-backend/app/models/chunk.py` defining the `Chunk` SQLAlchemy model (id, knowledge_item_id, chunk_text, chunk_order, start_char_index, end_char_index, created_at, updated_at, embedding_needed).
    *   **Commit Message:** `feat: Create Chunk SQLAlchemy model`
    *   **Files Changed:** `second-brain-fastapi-backend/app/models/chunk.py`

*   **3.4.2: Create Chunk Pydantic Schemas**
    *   **Action:** Create `second-brain-fastapi-backend/app/schemas/chunk.py` defining Pydantic schemas for `ChunkCreate`, `ChunkUpdate`, and `ChunkResponse`.
    *   **Commit Message:** `feat: Create Chunk Pydantic schemas`
    *   **Files Changed:** `second-brain-fastapi-backend/app/schemas/chunk.py`

*   **3.4.3: Create Chunk Repository/Service**
    *   **Action:** Create `second-brain-fastapi-backend/app/crud/chunk.py` with a class `CRUDChunk` containing methods for creating, reading, updating, and deleting chunks.
    *   **Commit Message:** `feat: Create CRUDChunk service`
    *   **Files Changed:** `second-brain-fastapi-backend/app/crud/chunk.py`

*   **3.4.4: Generate Migration for Chunk Model**
    *   **Action:** Run `alembic revision --autogenerate -m "Add Chunk Model"`.
    *   **Commit Message:** `feat: Generate migration for Chunk model`
    *   **Files Changed:** `second-brain-fastapi-backend/alembic/versions/*.py` (new file)

*   **3.4.5: Apply Chunk Migration**
    *   **Action:** Run `alembic upgrade head`.
    *   **Commit Message:** `feat: Apply Chunk migration`
    *   **Files Changed:** (No code changes, database schema updated)

### Task 3.5: Implement Data Ingestion Pipeline (Chunking & Embedding)

**Description:** Create a background task system to automatically chunk new/updated knowledge items and generate/store their embeddings.

**User Story:** As a user, I want my new notes to be automatically processed for semantic search so that I can find them easily later.

**Sub-tasks (Commit-level):**

*   **3.5.1: Install Task Queue Library (Celery with Redis)**
    *   **Action:** Run `pip install celery redis`.
    *   **Commit Message:** `feat: Install Celery and Redis for task queue`
    *   **Files Changed:** `second-brain-fastapi-backend/requirements.txt` (updated), `second-brain-fastapi-backend/.venv/` (updated)

*   **3.5.2: Configure Celery and Redis**
    *   **Action:** Update `app/core/config.py` with `REDIS_BROKER_URL` and `REDIS_BACKEND_URL`. Create `second-brain-fastapi-backend/app/core/celery_app.py` to initialize Celery.
    *   **Commit Message:** `feat: Configure Celery and Redis`
    *   **Files Changed:** `second-brain-fastapi-backend/app/core/config.py`, `second-brain-fastapi-backend/app/core/celery_app.py`

*   **3.5.3: Create Embedding Task**
    *   **Action:** Create `second-brain-fastapi-backend/app/tasks/embedding_tasks.py` with a Celery task (e.g., `process_knowledge_item_for_embedding`) that:
        1.  Retrieves `KnowledgeItem` content.
        2.  Uses `TextSplitter` to chunk the content.
        3.  For each chunk, uses `EmbeddingService` to generate an embedding.
        4.  Stores the chunk in the `Chunks` table via `CRUDChunk`.
        5.  Stores the embedding and associated metadata in the Vector Database via `VectorDBClient`.
        6.  Updates `embedding_needed` flag in `Chunks` table to `false`.
    *   **Commit Message:** `feat: Create Celery task for chunking and embedding`
    *   **Files Changed:** `second-brain-fastapi-backend/app/tasks/embedding_tasks.py`

*   **3.5.4: Trigger Embedding Task on KnowledgeItem Creation/Update**
    *   **Action:** Modify `app/crud/knowledge_item.py` to dispatch the `process_knowledge_item_for_embedding` Celery task whenever a new `KnowledgeItem` is created or an existing one is updated.
    *   **Commit Message:** `feat: Trigger embedding task on knowledge item changes`
    *   **Files Changed:** `second-brain-fastapi-backend/app/crud/knowledge_item.py`

*   **3.5.5: Test Data Ingestion Pipeline**
    *   **Action:** Create a new knowledge item via the API. Start a Celery worker (`celery -A app.core.celery_app worker -l info`). Verify that chunks are created in the `Chunks` table and embeddings are stored in the vector database.
    *   **Commit Message:** `test: Verify data ingestion pipeline`
    *   **Files Changed:** (No code changes, verification step)

### Task 3.6: Integrate Model Context Protocol (MCP) Considerations

**Description:** Incorporate the Model Context Protocol (MCP) for efficient management and passing of context to LLMs, reducing direct backend load.

**User Story:** As a backend developer, I want to use MCP to manage LLM context efficiently so that the backend remains modular and performs optimally.

**Sub-tasks (Commit-level):**

*   **3.6.1: Research MCP Specifications and Best Practices**
    *   **Action:** Conduct a brief search on 


Model Context Protocol (MCP) specifications and best practices, especially for reducing backend load.
    *   **Commit Message:** `docs: Research MCP specifications and best practices`
    *   **Files Changed:** (No code changes, research step)

*   **3.6.2: Define MCP Server Interface for Embedding Generation**
    *   **Action:** Based on MCP specifications, define a conceptual interface for an MCP server that could handle embedding generation requests. This will guide the integration.
    *   **Commit Message:** `feat: Define MCP server interface for embedding generation`
    *   **Files Changed:** `second-brain-fastapi-backend/app/mcp/embedding_mcp_interface.py` (new file, conceptual definition)

*   **3.6.3: Implement MCP Client for Embedding Generation**
    *   **Action:** Modify `app/services/embedding_service.py` to act as an MCP client. Instead of directly calling the embedding model API, it will format requests according to MCP and send them to a hypothetical MCP server endpoint. If an MCP server is not available, it will fall back to direct API calls (integrated feature).
    *   **Commit Message:** `feat: Implement MCP client for embedding generation`
    *   **Files Changed:** `second-brain-fastapi-backend/app/services/embedding_service.py`

*   **3.6.4: Update Embedding Task to Use MCP Client**
    *   **Action:** Modify `app/tasks/embedding_tasks.py` to use the MCP-enabled `EmbeddingService`.
    *   **Commit Message:** `feat: Update embedding task to use MCP client`
    *   **Files Changed:** `second-brain-fastapi-backend/app/tasks/embedding_tasks.py`

*   **3.6.5: Test MCP Integration (Mock/Fallback)**
    *   **Action:** Test the embedding generation flow. Initially, this will likely use the fallback direct API calls. Once an MCP server is available, it can be switched.
    *   **Commit Message:** `test: Verify MCP integration (mock/fallback)`
    *   **Files Changed:** (No code changes, verification step)

---

## Phase 4: Implement Basic RAG and Semantic Search (FastAPI)

**Objective:** To enable users to perform semantic searches and receive AI-generated answers based on their knowledge base using the RAG pattern, prioritizing MCP where applicable.

**User Story:** As a user, I want to ask questions about my notes and get intelligent answers so that I can quickly find information and gain insights.

### Task 4.1: Implement Semantic Search API Endpoint

**Description:** Create a backend API endpoint that accepts a user query, generates its embedding (via MCP), and retrieves relevant chunks from the vector database.

**User Story:** As a user, I want to search my knowledge base semantically so that I can find relevant information even if I don't use exact keywords.

**Sub-tasks (Commit-level):**

*   **4.1.1: Create Search Schemas**
    *   **Action:** Create `second-brain-fastapi-backend/app/schemas/search.py` defining Pydantic schemas for `SemanticSearchQuery` and `SemanticSearchResult`.
    *   **Commit Message:** `feat: Create search Pydantic schemas`
    *   **Files Changed:** `second-brain-fastapi-backend/app/schemas/search.py`

*   **4.1.2: Create Search Service Class**
    *   **Action:** Create `second-brain-fastapi-backend/app/services/search_service.py` with a class `SearchService` containing a method (e.g., `semantic_search`) that takes a query, uses `EmbeddingService` (MCP client) to get query embedding, and `VectorDBClient` to perform similarity search.
    *   **Commit Message:** `feat: Create SearchService class`
    *   **Files Changed:** `second-brain-fastapi-backend/app/services/search_service.py`

*   **4.1.3: Create Search Router and Endpoint**
    *   **Action:** Create `second-brain-fastapi-backend/app/api/v1/endpoints/search.py` with a `APIRouter`. Add a `POST /search/semantic` endpoint that takes `SemanticSearchQuery`, uses `SearchService`, and returns `SemanticSearchResult`.
    *   **Commit Message:** `feat: Create search API router and semantic search endpoint`
    *   **Files Changed:** `second-brain-fastapi-backend/app/api/v1/endpoints/search.py`

*   **4.1.4: Protect Semantic Search Endpoint**
    *   **Action:** Apply `Depends(get_current_user)` to the semantic search endpoint to ensure only authenticated users can access it.
    *   **Commit Message:** `feat: Protect semantic search endpoint`
    *   **Files Changed:** `second-brain-fastapi-backend/app/api/v1/endpoints/search.py`

*   **4.1.5: Include Search Router in `main.py`**
    *   **Action:** In `second-brain-fastapi-backend/app/main.py`, include the `search` router.
    *   **Commit Message:** `feat: Include search router in main app`
    *   **Files Changed:** `second-brain-fastapi-backend/app/main.py`

*   **4.1.6: Test Semantic Search Endpoint**
    *   **Action:** Use an API client to send a query to the semantic search endpoint and verify that relevant chunks are returned (assuming embeddings are already generated).
    *   **Commit Message:** `test: Verify semantic search endpoint`
    *   **Files Changed:** (No code changes, verification step)

### Task 4.2: Integrate LLM for RAG (MCP-first approach)

**Description:** Connect the backend to an LLM and implement the RAG pattern to generate answers based on retrieved context, prioritizing MCP for LLM interaction.

**User Story:** As a user, I want the AI to answer my questions using my own knowledge so that I get personalized and accurate information.

**Sub-tasks (Commit-level):**

*   **4.2.1: Research MCP for LLM Interaction**
    *   **Action:** Research how MCP can be used to offload LLM inference and context management to an external MCP server.
    *   **Commit Message:** `docs: Research MCP for LLM interaction`
    *   **Files Changed:** (No code changes, research step)

*   **4.2.2: Define MCP Server Interface for LLM Inference**
    *   **Action:** Define a conceptual interface for an MCP server that could handle LLM inference requests, including context passing.
    *   **Commit Message:** `feat: Define MCP server interface for LLM inference`
    *   **Files Changed:** `second-brain-fastapi-backend/app/mcp/llm_mcp_interface.py` (new file, conceptual definition)

*   **4.2.3: Create LLM Service Class (MCP Client)**
    *   **Action:** Create `second-brain-fastapi-backend/app/services/llm_service.py` with a class `LLMService`. This service will act as an MCP client, formatting RAG requests according to MCP and sending them to a hypothetical MCP server. It will include a fallback to direct LLM API calls if an MCP server is not configured.
    *   **Commit Message:** `feat: Create LLMService class as MCP client`
    *   **Files Changed:** `second-brain-fastapi-backend/app/services/llm_service.py`

*   **4.2.4: Configure LLM Credentials (Fallback)**
    *   **Action:** Add environment variables for LLM API key (e.g., `OPENAI_API_KEY`, `GEMINI_API_KEY`) to `second-brain-fastapi-backend/.env`. Update `app/core/config.py` to load these settings for the fallback mechanism.
    *   **Commit Message:** `feat: Add fallback LLM API keys to .env and config`
    *   **Files Changed:** `second-brain-fastapi-backend/app/core/config.py`, `second-brain-fastapi-backend/.env`

*   **4.2.5: Create LLM Service Dependency**
    *   **Action:** In `second-brain-fastapi-backend/app/api/deps.py`, create a `get_llm_service` function that yields an instance of `LLMService`.
    *   **Commit Message:** `feat: Create get_llm_service dependency`
    *   **Files Changed:** `second-brain-fastapi-backend/app/api/deps.py`

*   **4.2.6: Implement RAG Logic in Search Service**
    *   **Action:** In `second-brain-fastapi-backend/app/services/search_service.py`, add a method (e.g., `rag_query`) that:
        1.  Performs semantic search to retrieve relevant chunks.
        2.  Constructs a prompt for the LLM, including the user query and the retrieved `chunk_text` as context.
        3.  Calls `LLMService.generate_response` with the constructed prompt (which will use MCP or fallback).
        4.  Returns the LLM's generated answer.
    *   **Commit Message:** `feat: Implement RAG logic in SearchService`
    *   **Files Changed:** `second-brain-fastapi-backend/app/services/search_service.py`

*   **4.2.7: Add RAG Endpoint to Search Router**
    *   **Action:** In `second-brain-fastapi-backend/app/api/v1/endpoints/search.py`, add a `POST /search/rag` endpoint that takes a query, uses `SearchService.rag_query`, and returns the LLM's response.
    *   **Commit Message:** `feat: Add RAG API endpoint`
    *   **Files Changed:** `second-brain-fastapi-backend/app/api/v1/endpoints/search.py`

*   **4.2.8: Protect RAG Endpoint**
    *   **Action:** Apply `Depends(get_current_user)` to the RAG endpoint.
    *   **Commit Message:** `feat: Protect RAG endpoint`
    *   **Files Changed:** `second-brain-fastapi-backend/app/api/v1/endpoints/search.py`

*   **4.2.9: Test RAG Endpoint (Mock/Fallback)**
    *   **Action:** Use an API client to send a query to the RAG endpoint and verify that the LLM returns an answer based on the provided context (initially using fallback direct API calls).
    *   **Commit Message:** `test: Verify RAG endpoint functionality (mock/fallback)`
    *   **Files Changed:** (No code changes, verification step)

---

## Phase 5: Develop Advanced Knowledge Organization Features (FastAPI)

**Objective:** To enhance the application with sophisticated features for organizing and connecting knowledge items, going beyond basic CRUD.

**User Story:** As a user, I want advanced ways to organize and link my notes so that I can build a richer and more interconnected knowledge base.

### Task 5.1: Implement Tagging System

**Description:** Allow users to associate multiple tags with knowledge items.

**User Story:** As a user, I want to add tags to my notes so that I can categorize them flexibly.

**Sub-tasks (Commit-level):**

*   **5.1.1: Create Tag SQLAlchemy Model**
    *   **Action:** Create `second-brain-fastapi-backend/app/models/tag.py` defining the `Tag` SQLAlchemy model (id, user_id, name).
    *   **Commit Message:** `feat: Create Tag SQLAlchemy model`
    *   **Files Changed:** `second-brain-fastapi-backend/app/models/tag.py`

*   **5.1.2: Create KnowledgeItemTag Association Model**
    *   **Action:** Create `second-brain-fastapi-backend/app/models/knowledge_item_tag.py` to define the association table for the many-to-many relationship between `KnowledgeItem` and `Tag`.
    *   **Commit Message:** `feat: Create KnowledgeItemTag association model`
    *   **Files Changed:** `second-brain-fastapi-backend/app/models/knowledge_item_tag.py`

*   **5.1.3: Update KnowledgeItem Model for Tags Relationship**
    *   **Action:** Modify `second-brain-fastapi-backend/app/models/knowledge_item.py` to include a relationship to `Tag` via the association table.
    *   **Commit Message:** `feat: Update KnowledgeItem model for tags relationship`
    *   **Files Changed:** `second-brain-fastapi-backend/app/models/knowledge_item.py`

*   **5.1.4: Create Tag Pydantic Schemas**
    *   **Action:** Create `second-brain-fastapi-backend/app/schemas/tag.py` defining Pydantic schemas for `TagCreate`, `TagUpdate`, and `TagResponse`.
    *   **Commit Message:** `feat: Create Tag Pydantic schemas`
    *   **Files Changed:** `second-brain-fastapi-backend/app/schemas/tag.py`

*   **5.1.5: Create Tag Repository/Service**
    *   **Action:** Create `second-brain-fastapi-backend/app/crud/tag.py` with a class `CRUDTag` for tag management.
    *   **Commit Message:** `feat: Create CRUDTag service`
    *   **Files Changed:** `second-brain-fastapi-backend/app/crud/tag.py`

*   **5.1.6: Create Tag Router and Endpoints**
    *   **Action:** Create `second-brain-fastapi-backend/app/api/v1/endpoints/tags.py` with a `APIRouter` for tag CRUD operations (e.g., `POST /tags`, `GET /tags`).
    *   **Commit Message:** `feat: Create tags API router and endpoints`
    *   **Files Changed:** `second-brain-fastapi-backend/app/api/v1/endpoints/tags.py`

*   **5.1.7: Implement Tag Association/Disassociation Endpoints**
    *   **Action:** Add endpoints to `app/api/v1/endpoints/knowledge_items.py` for associating and disassociating tags with knowledge items (e.g., `POST /knowledge_items/{item_id}/tags/{tag_id}`).
    *   **Commit Message:** `feat: Implement tag association endpoints`
    *   **Files Changed:** `second-brain-fastapi-backend/app/api/v1/endpoints/knowledge_items.py`

*   **5.1.8: Include Tag Router in `main.py`**
    *   **Action:** In `second-brain-fastapi-backend/app/main.py`, include the `tags` router.
    *   **Commit Message:** `feat: Include tags router in main app`
    *   **Files Changed:** `second-brain-fastapi-backend/app/main.py`

*   **5.1.9: Generate Migration for Tag Models**
    *   **Action:** Run `alembic revision --autogenerate -m "Add Tag and KnowledgeItemTag Models"`.
    *   **Commit Message:** `feat: Generate migration for Tag models`
    *   **Files Changed:** `second-brain-fastapi-backend/alembic/versions/*.py` (new file)

*   **5.1.10: Apply Tag Models Migration**
    *   **Action:** Run `alembic upgrade head`.
    *   **Commit Message:** `feat: Apply Tag models migration`
    *   **Files Changed:** (No code changes, database schema updated)

*   **5.1.11: Test Tagging System**
    *   **Action:** Use an API client to create tags, associate them with knowledge items, retrieve knowledge items with their tags, and disassociate tags. Verify persistence.
    *   **Commit Message:** `test: Verify tagging system functionality`
    *   **Files Changed:** (No code changes, verification step)

### Task 5.2: Implement Bidirectional Linking

**Description:** Allow users to create explicit links between knowledge items, enabling graph-like connections.

**User Story:** As a user, I want to link my notes together so that I can see how my ideas are connected.

**Sub-tasks (Commit-level):**

*   **5.2.1: Create Relationship SQLAlchemy Model**
    *   **Action:** Create `second-brain-fastapi-backend/app/models/relationship.py` defining the `Relationship` SQLAlchemy model (id, source_item_id, target_item_id, relationship_type).
    *   **Commit Message:** `feat: Create Relationship SQLAlchemy model`
    *   **Files Changed:** `second-brain-fastapi-backend/app/models/relationship.py`

*   **5.2.2: Create Relationship Pydantic Schemas**
    *   **Action:** Create `second-brain-fastapi-backend/app/schemas/relationship.py` defining Pydantic schemas for `RelationshipCreate`, `RelationshipUpdate`, and `RelationshipResponse`.
    *   **Commit Message:** `feat: Create Relationship Pydantic schemas`
    *   **Files Changed:** `second-brain-fastapi-backend/app/schemas/relationship.py`

*   **5.2.3: Create Relationship Repository/Service**
    *   **Action:** Create `second-brain-fastapi-backend/app/crud/relationship.py` with a class `CRUDRelationship` for managing relationships.
    *   **Commit Message:** `feat: Create CRUDRelationship service`
    *   **Files Changed:** `second-brain-fastapi-backend/app/crud/relationship.py`

*   **5.2.4: Create Relationship Router and Endpoints**
    *   **Action:** Create `second-brain-fastapi-backend/app/api/v1/endpoints/relationships.py` with a `APIRouter` for relationship CRUD operations.
    *   **Commit Message:** `feat: Create relationships API router and endpoints`
    *   **Files Changed:** `second-brain-fastapi-backend/app/api/v1/endpoints/relationships.py`

*   **5.2.5: Implement Endpoint to Get Linked Items**
    *   **Action:** Add an endpoint to `app/api/v1/endpoints/knowledge_items.py` (e.g., `GET /knowledge_items/{item_id}/links`) to retrieve all knowledge items linked to a given item.
    *   **Commit Message:** `feat: Implement endpoint to get linked knowledge items`
    *   **Files Changed:** `second-brain-fastapi-backend/app/api/v1/endpoints/knowledge_items.py`

*   **5.2.6: Include Relationship Router in `main.py`**
    *   **Action:** In `second-brain-fastapi-backend/app/main.py`, include the `relationships` router.
    *   **Commit Message:** `feat: Include relationships router in main app`
    *   **Files Changed:** `second-brain-fastapi-backend/app/main.py`

*   **5.2.7: Generate Migration for Relationship Model**
    *   **Action:** Run `alembic revision --autogenerate -m "Add Relationship Model"`.
    *   **Commit Message:** `feat: Generate migration for Relationship model`
    *   **Files Changed:** `second-brain-fastapi-backend/alembic/versions/*.py` (new file)

*   **5.2.8: Apply Relationship Model Migration**
    *   **Action:** Run `alembic upgrade head`.
    *   **Commit Message:** `feat: Apply Relationship model migration`
    *   **Files Changed:** (No code changes, database schema updated)

*   **5.2.9: Test Bidirectional Linking**
    *   **Action:** Use an API client to create relationships between knowledge items, and verify that linked items can be retrieved correctly.
    *   **Commit Message:** `test: Verify bidirectional linking functionality`
    *   **Files Changed:** (No code changes, verification step)

### Task 5.3: Implement PARA Method Classification

**Description:** Integrate the PARA method (Projects, Areas, Resources, Archives) for organizing knowledge items.

**User Story:** As a user, I want to classify my notes using the PARA method so that I can organize them based on actionability and purpose.

**Sub-tasks (Commit-level):**

*   **5.3.1: Update KnowledgeItem Model for PARA Type**
    *   **Action:** Ensure `para_type` column in `KnowledgeItem` SQLAlchemy model is correctly defined with an `Enum` or `String` type (e.g., `Project`, `Area`, `Resource`, `Archive`).
    *   **Commit Message:** `feat: Ensure KnowledgeItem model supports PARA type`
    *   **Files Changed:** `second-brain-fastapi-backend/app/models/knowledge_item.py`

*   **5.3.2: Update KnowledgeItem Schemas for PARA Type**
    *   **Action:** Update `KnowledgeItemCreate`, `KnowledgeItemUpdate`, and `KnowledgeItemResponse` Pydantic schemas to include `para_type`.
    *   **Commit Message:** `feat: Update KnowledgeItem schemas for PARA type`
    *   **Files Changed:** `second-brain-fastapi-backend/app/schemas/knowledge_item.py`

*   **5.3.3: Implement Endpoint to Filter by PARA Type**
    *   **Action:** Add a query parameter to `GET /knowledge_items` endpoint in `app/api/v1/endpoints/knowledge_items.py` to filter knowledge items by `para_type`.
    *   **Commit Message:** `feat: Implement filter by PARA type endpoint`
    *   **Files Changed:** `second-brain-fastapi-backend/app/api/v1/endpoints/knowledge_items.py`

*   **5.3.4: Generate Migration for PARA Type Update**
    *   **Action:** Run `alembic revision --autogenerate -m "Add PARA type to KnowledgeItem"`.
    *   **Commit Message:** `feat: Generate migration for PARA type`
    *   **Files Changed:** `second-brain-fastapi-backend/alembic/versions/*.py` (new file)

*   **5.3.5: Apply PARA Type Migration**
    *   **Action:** Run `alembic upgrade head`.
    *   **Commit Message:** `feat: Apply PARA type migration`
    *   **Files Changed:** (No code changes, database schema updated)

*   **5.3.6: Test PARA Classification**
    *   **Action:** Create several knowledge items with different PARA types and use the API to filter them, verifying correct classification.
    *   **Commit Message:** `test: Verify PARA classification functionality`
    *   **Files Changed:** (No code changes, verification step)

---

## Phase 6: Enhance AI Capabilities (GAN, AGI) and Integrations (FastAPI)

**Objective:** To integrate more advanced AI functionalities, including Generative Adversarial Networks (GANs) for content generation and initial steps towards Artificial General Intelligence (AGI) concepts, leveraging MCP where possible.

**User Story:** As a user, I want more intelligent assistance from my Second Brain, including automated summaries, advanced content generation, and smart insights, so that I can work more efficiently and creatively.

### Task 6.1: Implement AI-Powered Summarization (MCP-first approach)

**Description:** Add functionality to generate summaries of knowledge items using an LLM, primarily via MCP.

**User Story:** As a user, I want to get quick summaries of my long notes so that I can grasp key information without reading the entire content.

**Sub-tasks (Commit-level):**

*   **6.1.1: Define MCP Server Interface for Summarization**
    *   **Action:** Define a conceptual interface for an MCP server that could handle summarization requests.
    *   **Commit Message:** `feat: Define MCP server interface for summarization`
    *   **Files Changed:** `second-brain-fastapi-backend/app/mcp/summarization_mcp_interface.py` (new file, conceptual definition)

*   **6.1.2: Add Summarization Method to LLM Service (MCP Client)**
    *   **Action:** In `app/services/llm_service.py`, add a method (e.g., `summarize_text`) that takes text, formats an MCP request for summarization, and sends it to the MCP server. Include a fallback to direct LLM API calls.
    *   **Commit Message:** `feat: Add summarization method to LLMService (MCP client)`
    *   **Files Changed:** `second-brain-fastapi-backend/app/services/llm_service.py`

*   **6.1.3: Create Summarization Endpoint**
    *   **Action:** Create `second-brain-fastapi-backend/app/api/v1/endpoints/ai.py` with a `APIRouter`. Add a `POST /ai/summarize` endpoint that accepts a knowledge item ID or raw text, retrieves content, calls `LLMService.summarize_text`, and returns the summary.
    *   **Commit Message:** `feat: Create summarization API endpoint`
    *   **Files Changed:** `second-brain-fastapi-backend/app/api/v1/endpoints/ai.py`

*   **6.1.4: Protect Summarization Endpoint**
    *   **Action:** Apply `Depends(get_current_user)` to the summarization endpoint.
    *   **Commit Message:** `feat: Protect summarization endpoint`
    *   **Files Changed:** `second-brain-fastapi-backend/app/api/v1/endpoints/ai.py`

*   **6.1.5: Include AI Router in `main.py`**
    *   **Action:** In `second-brain-fastapi-backend/app/main.py`, include the `ai` router.
    *   **Commit Message:** `feat: Include AI router in main app`
    *   **Files Changed:** `second-brain-fastapi-backend/app/main.py`

*   **6.1.6: Test Summarization Functionality (Mock/Fallback)**
    *   **Action:** Use an API client to summarize a knowledge item and verify the LLM provides a coherent summary (initially using fallback direct API calls).
    *   **Commit Message:** `test: Verify summarization functionality (mock/fallback)`
    *   **Files Changed:** (No code changes, verification step)

### Task 6.2: Implement AI-Powered Content Generation (GAN/LLM via MCP)

**Description:** Allow users to generate new content (e.g., drafts, outlines) based on prompts and existing knowledge, potentially using GAN-like approaches or advanced LLM capabilities, primarily via MCP.

**User Story:** As a user, I want the AI to help me draft new content based on my ideas so that I can overcome writer's block and generate content faster.

**Sub-tasks (Commit-level):**

*   **6.2.1: Define MCP Server Interface for Content Generation**
    *   **Action:** Define a conceptual interface for an MCP server that could handle content generation requests, including context and style parameters.
    *   **Commit Message:** `feat: Define MCP server interface for content generation`
    *   **Files Changed:** `second-brain-fastapi-backend/app/mcp/content_gen_mcp_interface.py` (new file, conceptual definition)

*   **6.2.2: Add Content Generation Method to LLM Service (MCP Client)**
    *   **Action:** In `app/services/llm_service.py`, add a method (e.g., `generate_content`) that takes a prompt and optional context, formats an MCP request for content generation, and sends it to the MCP server. Include a fallback to direct LLM API calls.
    *   **Commit Message:** `feat: Add content generation method to LLMService (MCP client)`
    *   **Files Changed:** `second-brain-fastapi-backend/app/services/llm_service.py`

*   **6.2.3: Create Content Generation Endpoint**
    *   **Action:** In `app/api/v1/endpoints/ai.py`, add a `POST /ai/generate` endpoint that accepts a prompt and optionally a list of `knowledge_item_ids` for context, retrieves relevant chunks, calls `LLMService.generate_content`, and returns the generated text.
    *   **Commit Message:** `feat: Create content generation API endpoint`
    *   **Files Changed:** `second-brain-fastapi-backend/app/api/v1/endpoints/ai.py`

*   **6.2.4: Protect Content Generation Endpoint**
    *   **Action:** Apply `Depends(get_current_user)` to the content generation endpoint.
    *   **Commit Message:** `feat: Protect content generation endpoint`
    *   **Files Changed:** `second-brain-fastapi-backend/app/api/v1/endpoints/ai.py`

*   **6.2.5: Test Content Generation Functionality (Mock/Fallback)**
    *   **Action:** Use an API client to generate content based on a prompt and selected knowledge items, verifying the output.
    *   **Commit Message:** `test: Verify content generation functionality (mock/fallback)`
    *   **Files Changed:** (No code changes, verification step)

### Task 6.3: Implement Initial AGI Concepts (Integrated Feature)

**Description:** Begin integrating basic concepts related to Artificial General Intelligence (AGI), such as autonomous agents for knowledge organization or proactive insights. This will be an integrated feature, as full AGI is beyond current MCP scope.

**User Story:** As a user, I want my Second Brain to proactively organize my knowledge and suggest insights so that I can focus on higher-level thinking.

**Sub-tasks (Commit-level):**

*   **6.3.1: Research AGI-like Features for PKM**
    *   **Action:** Research current trends and feasible implementations of AGI-like features in Personal Knowledge Management (PKM) systems (e.g., autonomous tagging, intelligent linking suggestions, anomaly detection).
    *   **Commit Message:** `docs: Research AGI-like features for PKM`
    *   **Files Changed:** (No code changes, research step)

*   **6.3.2: Create `AgentService` Class**
    *   **Action:** Create `second-brain-fastapi-backend/app/services/agent_service.py` with a class `AgentService` to house initial AGI-like functionalities.
    *   **Commit Message:** `feat: Create AgentService class`
    *   **Files Changed:** `second-brain-fastapi-backend/app/services/agent_service.py`

*   **6.3.3: Implement Autonomous Tagging (Integrated Feature)**
    *   **Action:** In `AgentService`, add a method (e.g., `auto_tag_knowledge_item`) that uses an LLM (via `LLMService` fallback or direct call) to suggest relevant tags for a knowledge item. This will be triggered by a background task.
    *   **Commit Message:** `feat: Implement autonomous tagging in AgentService`
    *   **Files Changed:** `second-brain-fastapi-backend/app/services/agent_service.py`

*   **6.3.4: Create Background Task for Autonomous Tagging**
    *   **Action:** Create a Celery task (e.g., `auto_tag_task`) in `app/tasks/agent_tasks.py` that calls `AgentService.auto_tag_knowledge_item` for new or updated knowledge items.
    *   **Commit Message:** `feat: Create background task for autonomous tagging`
    *   **Files Changed:** `second-brain-fastapi-backend/app/tasks/agent_tasks.py`

*   **6.3.5: Trigger Autonomous Tagging Task**
    *   **Action:** Modify `app/crud/knowledge_item.py` to dispatch the `auto_tag_task` when a knowledge item is created or updated.
    *   **Commit Message:** `feat: Trigger auto-tagging task on knowledge item changes`
    *   **Files Changed:** `second-brain-fastapi-backend/app/crud/knowledge_item.py`

*   **6.3.6: Test Autonomous Tagging**
    *   **Action:** Create a new knowledge item and verify that relevant tags are automatically suggested and associated after the background task runs.
    *   **Commit Message:** `test: Verify autonomous tagging functionality`
    *   **Files Changed:** (No code changes, verification step)

### Task 6.4: Implement External Data Source Integration (e.g., Markdown Import)

**Description:** Allow users to import content from external files or services. This will be an integrated feature.

**User Story:** As a user, I want to import my existing notes from other formats so that I don't have to manually copy them.

**Sub-tasks (Commit-level):**

*   **6.4.1: Install File Processing Libraries**
    *   **Action:** Run `pip install python-markdown` (or other relevant libraries for PDF, DOCX parsing).
    *   **Commit Message:** `feat: Install markdown processing library`
    *   **Files Changed:** `second-brain-fastapi-backend/requirements.txt` (updated), `second-brain-fastapi-backend/.venv/` (updated)

*   **6.4.2: Create Import Service Class**
    *   **Action:** Create `second-brain-fastapi-backend/app/services/import_service.py` with a class `ImportService` containing methods for parsing different file types (e.g., `parse_markdown`).
    *   **Commit Message:** `feat: Create ImportService class`
    *   **Files Changed:** `second-brain-fastapi-backend/app/services/import_service.py`

*   **6.4.3: Create Import Router and Endpoint**
    *   **Action:** Create `second-brain-fastapi-backend/app/api/v1/endpoints/import_data.py` with a `APIRouter`. Add a `POST /import/markdown` endpoint that accepts a file upload, uses `ImportService` to parse it, and creates a new `KnowledgeItem`.
    *   **Commit Message:** `feat: Create import API router and markdown import endpoint`
    *   **Files Changed:** `second-brain-fastapi-backend/app/api/v1/endpoints/import_data.py`

*   **6.4.4: Protect Import Endpoint**
    *   **Action:** Apply `Depends(get_current_user)` to the import endpoint.
    *   **Commit Message:** `feat: Protect import endpoint`
    *   **Files Changed:** `second-brain-fastapi-backend/app/api/v1/endpoints/import_data.py`

*   **6.4.5: Include Import Router in `main.py`**
    *   **Action:** In `second-brain-fastapi-backend/app/main.py`, include the `import_data` router.
    *   **Commit Message:** `feat: Include import router in main app`
    *   **Files Changed:** `second-brain-fastapi-backend/app/main.py`

*   **6.4.6: Test Markdown Import**
    *   **Action:** Use an API client to upload a Markdown file and verify that a new knowledge item is created with the correct content.
    *   **Commit Message:** `test: Verify markdown import functionality`
    *   **Files Changed:** (No code changes, verification step)

---

## Phase 7: Implement Deployment and Monitoring Infrastructure (FastAPI)

**Objective:** To prepare the FastAPI application for production deployment and establish robust monitoring and logging systems.

**User Story:** As a DevOps engineer, I want to deploy and monitor the application reliably so that users have a stable and performant experience.

### Task 7.1: Containerize Backend Service

**Description:** Create a Dockerfile for the FastAPI backend application.

**User Story:** As a DevOps engineer, I want to containerize the backend so that it can be deployed consistently across environments.

**Sub-tasks (Commit-level):**

*   **7.1.1: Create Backend Dockerfile**
    *   **Action:** Create `second-brain-fastapi-backend/Dockerfile` with instructions to build and run the FastAPI application (e.g., using a multi-stage build with Gunicorn/Uvicorn).
    *   **Commit Message:** `feat: Create backend Dockerfile`
    *   **Files Changed:** `second-brain-fastapi-backend/Dockerfile`

*   **7.1.2: Add `.dockerignore` for Backend**
    *   **Action:** Create `second-brain-fastapi-backend/.dockerignore` to exclude unnecessary files from the Docker build context.
    *   **Commit Message:** `feat: Add backend .dockerignore`
    *   **Files Changed:** `second-brain-fastapi-backend/.dockerignore`

*   **7.1.3: Build Backend Docker Image Locally**
    *   **Action:** Run `docker build -t second-brain-fastapi-backend .` from the root directory.
    *   **Commit Message:** `test: Build backend Docker image locally`
    *   **Files Changed:** (No code changes, verification step)

### Task 7.2: Create Docker Compose Configuration

**Description:** Define a Docker Compose file to orchestrate the backend, database, and Redis services for local development and testing.

**User Story:** As a developer, I want a single command to spin up all backend services locally so that I can easily develop and test.

**Sub-tasks (Commit-level):**

*   **7.2.1: Create `docker-compose.yml`**
    *   **Action:** Create `second-brain-fastapi-backend/docker-compose.yml` defining services for `backend` (FastAPI), `database` (PostgreSQL), and `redis` (for Celery).
    *   **Commit Message:** `feat: Create docker-compose.yml`
    *   **Files Changed:** `second-brain-fastapi-backend/docker-compose.yml`

*   **7.2.2: Test Docker Compose Setup**
    *   **Action:** Run `docker-compose up --build` from the root directory. Verify all services start and the backend API is accessible.
    *   **Commit Message:** `test: Verify docker-compose setup`
    *   **Files Changed:** (No code changes, verification step)

### Task 7.3: Implement Logging and Monitoring

**Description:** Integrate structured logging and basic monitoring tools into the FastAPI backend service.

**User Story:** As a DevOps engineer, I want to see application logs and metrics so that I can diagnose issues and monitor performance.

**Sub-tasks (Commit-level):**

*   **7.3.1: Install Logging Libraries**
    *   **Action:** Run `pip install loguru` (or other structured logging library).
    *   **Commit Message:** `feat: Install loguru for structured logging`
    *   **Files Changed:** `second-brain-fastapi-backend/requirements.txt` (updated), `second-brain-fastapi-backend/.venv/` (updated)

*   **7.3.2: Configure Structured Logging**
    *   **Action:** Update `app/core/logging.py` to use `loguru` for enhanced structured logging, including request IDs and user context.
    *   **Commit Message:** `feat: Configure structured logging with loguru`
    *   **Files Changed:** `second-brain-fastapi-backend/app/core/logging.py`

*   **7.3.3: Integrate Logger into FastAPI App**
    *   **Action:** Modify `app/main.py` to integrate the structured logger, ensuring all requests and significant events are logged.
    *   **Commit Message:** `feat: Integrate structured logger into FastAPI app`
    *   **Files Changed:** `second-brain-fastapi-backend/app/main.py`

*   **7.3.4: Implement Basic Health Metrics (Optional)**
    *   **Action:** (Optional) Integrate a simple metrics library (e.g., `prometheus_client`) to expose basic application metrics (e.g., request count, latency) via an endpoint.
    *   **Commit Message:** `feat: Implement basic health metrics`
    *   **Files Changed:** `second-brain-fastapi-backend/app/api/v1/endpoints/metrics.py` (new file), `second-brain-fastapi-backend/app/main.py`

*   **7.3.5: Test Logging and Metrics**
    *   **Action:** Perform various actions via the API and verify that structured logs are generated correctly. If metrics are implemented, check the metrics endpoint.
    *   **Commit Message:** `test: Verify logging and metrics functionality`
    *   **Files Changed:** (No code changes, verification step)

---

## Phase 8: Compile Final Comprehensive Development Report (FastAPI)

**Objective:** To consolidate all findings, recommendations, and the detailed project plan into a final, comprehensive report.

**User Story:** As a project manager, I want a complete and detailed development report so that I can understand the project scope, architecture, and implementation plan.

### Task 8.1: Review and Refine Project Plan Content

**Description:** Review all previously generated content for accuracy, completeness, and consistency.

**User Story:** As a reviewer, I want the project plan to be accurate and well-structured so that it is easy to understand and follow.

**Sub-tasks (Commit-level):**

*   **8.1.1: Review Phase 1 Content**
    *   **Action:** Read through Phase 1 of `fastapi_project_plan.md` and make any necessary corrections or improvements.
    *   **Commit Message:** `refactor: Review and refine Phase 1 of project plan`
    *   **Files Changed:** `second-brain-fastapi-backend/fastapi_project_plan.md`

*   **8.1.2: Review Phase 2 Content**
    *   **Action:** Read through Phase 2 of `fastapi_project_plan.md` and make any necessary corrections or improvements.
    *   **Commit Message:** `refactor: Review and refine Phase 2 of project plan`
    *   **Files Changed:** `second-brain-fastapi-backend/fastapi_project_plan.md`

*   **8.1.3: Review Phase 3 Content**
    *   **Action:** Read through Phase 3 of `fastapi_project_plan.md` and make any necessary corrections or improvements, especially regarding MCP integration.
    *   **Commit Message:** `refactor: Review and refine Phase 3 of project plan (MCP)`
    *   **Files Changed:** `second-brain-fastapi-backend/fastapi_project_plan.md`

*   **8.1.4: Review Phase 4 Content**
    *   **Action:** Read through Phase 4 of `fastapi_project_plan.md` and make any necessary corrections or improvements, especially regarding RAG and MCP.
    *   **Commit Message:** `refactor: Review and refine Phase 4 of project plan (RAG/MCP)`
    *   **Files Changed:** `second-brain-fastapi-backend/fastapi_project_plan.md`

*   **8.1.5: Review Phase 5 Content**
    *   **Action:** Read through Phase 5 of `fastapi_project_plan.md` and make any necessary corrections or improvements.
    *   **Commit Message:** `refactor: Review and refine Phase 5 of project plan`
    *   **Files Changed:** `second-brain-fastapi-backend/fastapi_project_plan.md`

*   **8.1.6: Review Phase 6 Content**
    *   **Action:** Read through Phase 6 of `fastapi_project_plan.md` and make any necessary corrections or improvements, especially regarding GAN, AGI, and MCP.
    *   **Commit Message:** `refactor: Review and refine Phase 6 of project plan (GAN/AGI/MCP)`
    *   **Files Changed:** `second-brain-fastapi-backend/fastapi_project_plan.md`

*   **8.1.7: Review Phase 7 Content**
    *   **Action:** Read through Phase 7 of `fastapi_project_plan.md` and make any necessary corrections or improvements.
    *   **Commit Message:** `refactor: Review and refine Phase 7 of project plan`
    *   **Files Changed:** `second-brain-fastapi-backend/fastapi_project_plan.md`

### Task 8.2: Finalize Report and Deliver

**Description:** Add a concluding section and deliver the complete detailed project plan.

**User Story:** As a project manager, I want the final report to be complete and ready for distribution.

**Sub-tasks (Commit-level):**

*   **8.2.1: Add Conclusion to Report**
    *   **Action:** Add a concluding summary to `fastapi_project_plan.md`, reiterating the benefits of the proposed architecture, MCP integration, and phased approach.
    *   **Commit Message:** `docs: Add conclusion to detailed FastAPI project plan`
    *   **Files Changed:** `second-brain-fastapi-backend/fastapi_project_plan.md`

*   **8.2.2: Deliver Final Report**
    *   **Action:** Send the `fastapi_project_plan.md` file to the user.
    *   **Commit Message:** `docs: Deliver final detailed FastAPI project plan`
    *   **Files Changed:** (No code changes, delivery step)

---

This detailed plan provides a comprehensive, commit-level roadmap for developing the FastAPI backend of the Second Brain application. Each sub-task is designed to be atomic, allowing for precise tracking and execution by an LLM or automation agent. The phased approach ensures a logical progression of development, building complexity incrementally, with a strong emphasis on leveraging Model Context Protocol (MCP) for modularity and offloading where appropriate.


the Model Context Protocol (MCP) specifications and best practices, especially for reducing backend load.
    *   **Commit Message:** `docs: Research MCP specifications and best practices`
    *   **Files Changed:** (No code changes, research step)

*   **3.6.2: Define MCP Server Interface for Embedding Generation**
    *   **Action:** Based on MCP specifications, define a conceptual interface for an MCP server that could handle embedding generation requests. This will guide the integration.
    *   **Commit Message:** `feat: Define MCP server interface for embedding generation`
    *   **Files Changed:** `second-brain-fastapi-backend/app/mcp/embedding_mcp_interface.py` (new file, conceptual definition)

*   **3.6.3: Implement MCP Client for Embedding Generation**
    *   **Action:** Modify `app/services/embedding_service.py` to act as an MCP client. Instead of directly calling the embedding model API, it will format requests according to MCP and send them to a hypothetical MCP server endpoint. If an MCP server is not available, it will fall back to direct API calls (integrated feature).
    *   **Commit Message:** `feat: Implement MCP client for embedding generation`
    *   **Files Changed:** `second-brain-fastapi-backend/app/services/embedding_service.py`

*   **3.6.4: Update Embedding Task to Use MCP Client**
    *   **Action:** Modify `app/tasks/embedding_tasks.py` to use the MCP-enabled `EmbeddingService`.
    *   **Commit Message:** `feat: Update embedding task to use MCP client`
    *   **Files Changed:** `second-brain-fastapi-backend/app/tasks/embedding_tasks.py`

*   **3.6.5: Test MCP Integration (Mock/Fallback)**
    *   **Action:** Test the embedding generation flow. Initially, this will likely use the fallback direct API calls. Once an MCP server is available, it can be switched.
    *   **Commit Message:** `test: Verify MCP integration (mock/fallback)`
    *   **Files Changed:** (No code changes, verification step)

---

## Phase 4: Implement Basic RAG and Semantic Search (FastAPI)

**Objective:** To enable users to perform semantic searches and receive AI-generated answers based on their knowledge base using the RAG pattern, prioritizing MCP where applicable.

**User Story:** As a user, I want to ask questions about my notes and get intelligent answers so that I can quickly find information and gain insights.

### Task 4.1: Implement Semantic Search API Endpoint

**Description:** Create a backend API endpoint that accepts a user query, generates its embedding (via MCP), and retrieves relevant chunks from the vector database.

**User Story:** As a user, I want to search my knowledge base semantically so that I can find relevant information even if I don't use exact keywords.

**Sub-tasks (Commit-level):**

*   **4.1.1: Create Search Schemas**
    *   **Action:** Create `second-brain-fastapi-backend/app/schemas/search.py` defining Pydantic schemas for `SemanticSearchQuery` and `SemanticSearchResult`.
    *   **Commit Message:** `feat: Create search Pydantic schemas`
    *   **Files Changed:** `second-brain-fastapi-backend/app/schemas/search.py`

*   **4.1.2: Create Search Service Class**
    *   **Action:** Create `second-brain-fastapi-backend/app/services/search_service.py` with a class `SearchService` containing a method (e.g., `semantic_search`) that takes a query, uses `EmbeddingService` (MCP client) to get query embedding, and `VectorDBClient` to perform similarity search.
    *   **Commit Message:** `feat: Create SearchService class`
    *   **Files Changed:** `second-brain-fastapi-backend/app/services/search_service.py`

*   **4.1.3: Create Search Router and Endpoint**
    *   **Action:** Create `second-brain-fastapi-backend/app/api/v1/endpoints/search.py` with a `APIRouter`. Add a `POST /search/semantic` endpoint that takes `SemanticSearchQuery`, uses `SearchService`, and returns `SemanticSearchResult`.
    *   **Commit Message:** `feat: Create search API router and semantic search endpoint`
    *   **Files Changed:** `second-brain-fastapi-backend/app/api/v1/endpoints/search.py`

*   **4.1.4: Protect Semantic Search Endpoint**
    *   **Action:** Apply `Depends(get_current_user)` to the semantic search endpoint to ensure only authenticated users can access it.
    *   **Commit Message:** `feat: Protect semantic search endpoint`
    *   **Files Changed:** `second-brain-fastapi-backend/app/api/v1/endpoints/search.py`

*   **4.1.5: Include Search Router in `main.py`**
    *   **Action:** In `second-brain-fastapi-backend/app/main.py`, include the `search` router.
    *   **Commit Message:** `feat: Include search router in main app`
    *   **Files Changed:** `second-brain-fastapi-backend/app/main.py`

*   **4.1.6: Test Semantic Search Endpoint**
    *   **Action:** Use an API client to send a query to the semantic search endpoint and verify that relevant chunks are returned (assuming embeddings are already generated).
    *   **Commit Message:** `test: Verify semantic search endpoint`
    *   **Files Changed:** (No code changes, verification step)

### Task 4.2: Integrate LLM for RAG (MCP-first approach)

**Description:** Connect the backend to an LLM and implement the RAG pattern to generate answers based on retrieved context, prioritizing MCP for LLM interaction.

**User Story:** As a user, I want the AI to answer my questions using my own knowledge so that I get personalized and accurate information.

**Sub-tasks (Commit-level):**

*   **4.2.1: Research MCP for LLM Interaction**
    *   **Action:** Research how MCP can be used to offload LLM inference and context management to an external MCP server.
    *   **Commit Message:** `docs: Research MCP for LLM interaction`
    *   **Files Changed:** (No code changes, research step)

*   **4.2.2: Define MCP Server Interface for LLM Inference**
    *   **Action:** Define a conceptual interface for an MCP server that could handle LLM inference requests, including context passing.
    *   **Commit Message:** `feat: Define MCP server interface for LLM inference`
    *   **Files Changed:** `second-brain-fastapi-backend/app/mcp/llm_mcp_interface.py` (new file, conceptual definition)

*   **4.2.3: Create LLM Service Class (MCP Client)**
    *   **Action:** Create `second-brain-fastapi-backend/app/services/llm_service.py` with a class `LLMService`. This service will act as an MCP client, formatting RAG requests according to MCP and sending them to a hypothetical MCP server. It will include a fallback to direct LLM API calls if an MCP server is not configured.
    *   **Commit Message:** `feat: Create LLMService class as MCP client`
    *   **Files Changed:** `second-brain-fastapi-backend/app/services/llm_service.py`

*   **4.2.4: Configure LLM Credentials (Fallback)**
    *   **Action:** Add environment variables for LLM API key (e.g., `OPENAI_API_KEY`, `GEMINI_API_KEY`) to `second-brain-fastapi-backend/.env`. Update `app/core/config.py` to load these settings for the fallback mechanism.
    *   **Commit Message:** `feat: Add fallback LLM API keys to .env and config`
    *   **Files Changed:** `second-brain-fastapi-backend/app/core/config.py`, `second-brain-fastapi-backend/.env`

*   **4.2.5: Create LLM Service Dependency**
    *   **Action:** In `second-brain-fastapi-backend/app/api/deps.py`, create a `get_llm_service` function that yields an instance of `LLMService`.
    *   **Commit Message:** `feat: Create get_llm_service dependency`
    *   **Files Changed:** `second-brain-fastapi-backend/app/api/deps.py`

*   **4.2.6: Implement RAG Logic in Search Service**
    *   **Action:** In `second-brain-fastapi-backend/app/services/search_service.py`, add a method (e.g., `rag_query`) that:
        1.  Performs semantic search to retrieve relevant chunks.
        2.  Constructs a prompt for the LLM, including the user query and the retrieved `chunk_text` as context.
        3.  Calls `LLMService.generate_response` with the constructed prompt (which will use MCP or fallback).
        4.  Returns the LLM's generated answer.
    *   **Commit Message:** `feat: Implement RAG logic in SearchService`
    *   **Files Changed:** `second-brain-fastapi-backend/app/services/search_service.py`

*   **4.2.7: Add RAG Endpoint to Search Router**
    *   **Action:** In `second-brain-fastapi-backend/app/api/v1/endpoints/search.py`, add a `POST /search/rag` endpoint that takes a query, uses `SearchService.rag_query`, and returns the LLM's response.
    *   **Commit Message:** `feat: Add RAG API endpoint`
    *   **Files Changed:** `second-brain-fastapi-backend/app/api/v1/endpoints/search.py`

*   **4.2.8: Protect RAG Endpoint**
    *   **Action:** Apply `Depends(get_current_user)` to the RAG endpoint.
    *   **Commit Message:** `feat: Protect RAG endpoint`
    *   **Files Changed:** `second-brain-fastapi-backend/app/api/v1/endpoints/search.py`

*   **4.2.9: Test RAG Endpoint (Mock/Fallback)**
    *   **Action:** Use an API client to send a query to the RAG endpoint and verify that the LLM returns an answer based on the provided context (initially using fallback direct API calls).
    *   **Commit Message:** `test: Verify RAG endpoint functionality (mock/fallback)`
    *   **Files Changed:** (No code changes, verification step)

---

## Phase 5: Develop Advanced Knowledge Organization Features (FastAPI)

**Objective:** To enhance the application with sophisticated features for organizing and connecting knowledge items, going beyond basic CRUD.

**User Story:** As a user, I want advanced ways to organize and link my notes so that I can build a richer and more interconnected knowledge base.

### Task 5.1: Implement Tagging System

**Description:** Allow users to associate multiple tags with knowledge items.

**User Story:** As a user, I want to add tags to my notes so that I can categorize them flexibly.

**Sub-tasks (Commit-level):**

*   **5.1.1: Create Tag SQLAlchemy Model**
    *   **Action:** Create `second-brain-fastapi-backend/app/models/tag.py` defining the `Tag` SQLAlchemy model (id, user_id, name).
    *   **Commit Message:** `feat: Create Tag SQLAlchemy model`
    *   **Files Changed:** `second-brain-fastapi-backend/app/models/tag.py`

*   **5.1.2: Create KnowledgeItemTag Association Model**
    *   **Action:** Create `second-brain-fastapi-backend/app/models/knowledge_item_tag.py` to define the association table for the many-to-many relationship between `KnowledgeItem` and `Tag`.
    *   **Commit Message:** `feat: Create KnowledgeItemTag association model`
    *   **Files Changed:** `second-brain-fastapi-backend/app/models/knowledge_item_tag.py`

*   **5.1.3: Update KnowledgeItem Model for Tags Relationship**
    *   **Action:** Modify `second-brain-fastapi-backend/app/models/knowledge_item.py` to include a relationship to `Tag` via the association table.
    *   **Commit Message:** `feat: Update KnowledgeItem model for tags relationship`
    *   **Files Changed:** `second-brain-fastapi-backend/app/models/knowledge_item.py`

*   **5.1.4: Create Tag Pydantic Schemas**
    *   **Action:** Create `second-brain-fastapi-backend/app/schemas/tag.py` defining Pydantic schemas for `TagCreate`, `TagUpdate`, and `TagResponse`.
    *   **Commit Message:** `feat: Create Tag Pydantic schemas`
    *   **Files Changed:** `second-brain-fastapi-backend/app/schemas/tag.py`

*   **5.1.5: Create Tag Repository/Service**
    *   **Action:** Create `second-brain-fastapi-backend/app/crud/tag.py` with a class `CRUDTag` for tag management.
    *   **Commit Message:** `feat: Create CRUDTag service`
    *   **Files Changed:** `second-brain-fastapi-backend/app/crud/tag.py`

*   **5.1.6: Create Tag Router and Endpoints**
    *   **Action:** Create `second-brain-fastapi-backend/app/api/v1/endpoints/tags.py` with a `APIRouter` for tag CRUD operations (e.g., `POST /tags`, `GET /tags`).
    *   **Commit Message:** `feat: Create tags API router and endpoints`
    *   **Files Changed:** `second-brain-fastapi-backend/app/api/v1/endpoints/tags.py`

*   **5.1.7: Implement Tag Association/Disassociation Endpoints**
    *   **Action:** Add endpoints to `app/api/v1/endpoints/knowledge_items.py` for associating and disassociating tags with knowledge items (e.g., `POST /knowledge_items/{item_id}/tags/{tag_id}`).
    *   **Commit Message:** `feat: Implement tag association endpoints`
    *   **Files Changed:** `second-brain-fastapi-backend/app/api/v1/endpoints/knowledge_items.py`

*   **5.1.8: Include Tag Router in `main.py`**
    *   **Action:** In `second-brain-fastapi-backend/app/main.py`, include the `tags` router.
    *   **Commit Message:** `feat: Include tags router in main app`
    *   **Files Changed:** `second-brain-fastapi-backend/app/main.py`

*   **5.1.9: Generate Migration for Tag Models**
    *   **Action:** Run `alembic revision --autogenerate -m "Add Tag and KnowledgeItemTag Models"`.
    *   **Commit Message:** `feat: Generate migration for Tag models`
    *   **Files Changed:** `second-brain-fastapi-backend/alembic/versions/*.py` (new file)

*   **5.1.10: Apply Tag Models Migration**
    *   **Action:** Run `alembic upgrade head`.
    *   **Commit Message:** `feat: Apply Tag models migration`
    *   **Files Changed:** (No code changes, database schema updated)

*   **5.1.11: Test Tagging System**
    *   **Action:** Use an API client to create tags, associate them with knowledge items, retrieve knowledge items with their tags, and disassociate tags. Verify persistence.
    *   **Commit Message:** `test: Verify tagging system functionality`
    *   **Files Changed:** (No code changes, verification step)

### Task 5.2: Implement Bidirectional Linking

**Description:** Allow users to create explicit links between knowledge items, enabling graph-like connections.

**User Story:** As a user, I want to link my notes together so that I can see how my ideas are connected.

**Sub-tasks (Commit-level):**

*   **5.2.1: Create Relationship SQLAlchemy Model**
    *   **Action:** Create `second-brain-fastapi-backend/app/models/relationship.py` defining the `Relationship` SQLAlchemy model (id, source_item_id, target_item_id, relationship_type).
    *   **Commit Message:** `feat: Create Relationship SQLAlchemy model`
    *   **Files Changed:** `second-brain-fastapi-backend/app/models/relationship.py`

*   **5.2.2: Create Relationship Pydantic Schemas**
    *   **Action:** Create `second-brain-fastapi-backend/app/schemas/relationship.py` defining Pydantic schemas for `RelationshipCreate`, `RelationshipUpdate`, and `RelationshipResponse`.
    *   **Commit Message:** `feat: Create Relationship Pydantic schemas`
    *   **Files Changed:** `second-brain-fastapi-backend/app/schemas/relationship.py`

*   **5.2.3: Create Relationship Repository/Service**
    *   **Action:** Create `second-brain-fastapi-backend/app/crud/relationship.py` with a class `CRUDRelationship` for managing relationships.
    *   **Commit Message:** `feat: Create CRUDRelationship service`
    *   **Files Changed:** `second-brain-fastapi-backend/app/crud/relationship.py`

*   **5.2.4: Create Relationship Router and Endpoints**
    *   **Action:** Create `second-brain-fastapi-backend/app/api/v1/endpoints/relationships.py` with a `APIRouter` for relationship CRUD operations.
    *   **Commit Message:** `feat: Create relationships API router and endpoints`
    *   **Files Changed:** `second-brain-fastapi-backend/app/api/v1/endpoints/relationships.py`

*   **5.2.5: Implement Endpoint to Get Linked Items**
    *   **Action:** Add an endpoint to `app/api/v1/endpoints/knowledge_items.py` (e.g., `GET /knowledge_items/{item_id}/links`) to retrieve all knowledge items linked to a given item.
    *   **Commit Message:** `feat: Implement endpoint to get linked knowledge items`
    *   **Files Changed:** `second-brain-fastapi-backend/app/api/v1/endpoints/knowledge_items.py`

*   **5.2.6: Include Relationship Router in `main.py`**
    *   **Action:** In `second-brain-fastapi-backend/app/main.py`, include the `relationships` router.
    *   **Commit Message:** `feat: Include relationships router in main app`
    *   **Files Changed:** `second-brain-fastapi-backend/app/main.py`

*   **5.2.7: Generate Migration for Relationship Model**
    *   **Action:** Run `alembic revision --autogenerate -m "Add Relationship Model"`.
    *   **Commit Message:** `feat: Generate migration for Relationship model`
    *   **Files Changed:** `second-brain-fastapi-backend/alembic/versions/*.py` (new file)

*   **5.2.8: Apply Relationship Model Migration**
    *   **Action:** Run `alembic upgrade head`.
    *   **Commit Message:** `feat: Apply Relationship model migration`
    *   **Files Changed:** (No code changes, database schema updated)

*   **5.2.9: Test Bidirectional Linking**
    *   **Action:** Use an API client to create relationships between knowledge items, and verify that linked items can be retrieved correctly.
    *   **Commit Message:** `test: Verify bidirectional linking functionality`
    *   **Files Changed:** (No code changes, verification step)

### Task 5.3: Implement PARA Method Classification

**Description:** Integrate the PARA method (Projects, Areas, Resources, Archives) for organizing knowledge items.

**User Story:** As a user, I want to classify my notes using the PARA method so that I can organize them based on actionability and purpose.

**Sub-tasks (Commit-level):**

*   **5.3.1: Update KnowledgeItem Model for PARA Type**
    *   **Action:** Ensure `para_type` column in `KnowledgeItem` SQLAlchemy model is correctly defined with an `Enum` or `String` type (e.g., `Project`, `Area`, `Resource`, `Archive`).
    *   **Commit Message:** `feat: Ensure KnowledgeItem model supports PARA type`
    *   **Files Changed:** `second-brain-fastapi-backend/app/models/knowledge_item.py`

*   **5.3.2: Update KnowledgeItem Schemas for PARA Type**
    *   **Action:** Update `KnowledgeItemCreate`, `KnowledgeItemUpdate`, and `KnowledgeItemResponse` Pydantic schemas to include `para_type`.
    *   **Commit Message:** `feat: Update KnowledgeItem schemas for PARA type`
    *   **Files Changed:** `second-brain-fastapi-backend/app/schemas/knowledge_item.py`

*   **5.3.3: Implement Endpoint to Filter by PARA Type**
    *   **Action:** Add a query parameter to `GET /knowledge_items` endpoint in `app/api/v1/endpoints/knowledge_items.py` to filter knowledge items by `para_type`.
    *   **Commit Message:** `feat: Implement filter by PARA type endpoint`
    *   **Files Changed:** `second-brain-fastapi-backend/app/api/v1/endpoints/knowledge_items.py`

*   **5.3.4: Generate Migration for PARA Type Update**
    *   **Action:** Run `alembic revision --autogenerate -m "Add PARA type to KnowledgeItem"`.
    *   **Commit Message:** `feat: Generate migration for PARA type`
    *   **Files Changed:** `second-brain-fastapi-backend/alembic/versions/*.py` (new file)

*   **5.3.5: Apply PARA Type Migration**
    *   **Action:** Run `alembic upgrade head`.
    *   **Commit Message:** `feat: Apply PARA type migration`
    *   **Files Changed:** (No code changes, database schema updated)

*   **5.3.6: Test PARA Classification**
    *   **Action:** Create several knowledge items with different PARA types and use the API to filter them, verifying correct classification.
    *   **Commit Message:** `test: Verify PARA classification functionality`
    *   **Files Changed:** (No code changes, verification step)

---

## Phase 6: Enhance AI Capabilities (GAN, AGI) and Integrations (FastAPI)

**Objective:** To integrate more advanced AI functionalities, including Generative Adversarial Networks (GANs) for content generation and initial steps towards Artificial General Intelligence (AGI) concepts, leveraging MCP where possible.

**User Story:** As a user, I want more intelligent assistance from my Second Brain, including automated summaries, advanced content generation, and smart insights, so that I can work more efficiently and creatively.

### Task 6.1: Implement AI-Powered Summarization (MCP-first approach)

**Description:** Add functionality to generate summaries of knowledge items using an LLM, primarily via MCP.

**User Story:** As a user, I want to get quick summaries of my long notes so that I can grasp key information without reading the entire content.

**Sub-tasks (Commit-level):**

*   **6.1.1: Define MCP Server Interface for Summarization**
    *   **Action:** Define a conceptual interface for an MCP server that could handle summarization requests.
    *   **Commit Message:** `feat: Define MCP server interface for summarization`
    *   **Files Changed:** `second-brain-fastapi-backend/app/mcp/summarization_mcp_interface.py` (new file, conceptual definition)

*   **6.1.2: Add Summarization Method to LLM Service (MCP Client)**
    *   **Action:** In `app/services/llm_service.py`, add a method (e.g., `summarize_text`) that takes text, formats an MCP request for summarization, and sends it to the MCP server. Include a fallback to direct LLM API calls.
    *   **Commit Message:** `feat: Add summarization method to LLMService (MCP client)`
    *   **Files Changed:** `second-brain-fastapi-backend/app/services/llm_service.py`

*   **6.1.3: Create Summarization Endpoint**
    *   **Action:** Create `second-brain-fastapi-backend/app/api/v1/endpoints/ai.py` with a `APIRouter`. Add a `POST /ai/summarize` endpoint that accepts a knowledge item ID or raw text, retrieves content, calls `LLMService.summarize_text`, and returns the summary.
    *   **Commit Message:** `feat: Create summarization API endpoint`
    *   **Files Changed:** `second-brain-fastapi-backend/app/api/v1/endpoints/ai.py`

*   **6.1.4: Protect Summarization Endpoint**
    *   **Action:** Apply `Depends(get_current_user)` to the summarization endpoint.
    *   **Commit Message:** `feat: Protect summarization endpoint`
    *   **Files Changed:** `second-brain-fastapi-backend/app/api/v1/endpoints/ai.py`

*   **6.1.5: Include AI Router in `main.py`**
    *   **Action:** In `second-brain-fastapi-backend/app/main.py`, include the `ai` router.
    *   **Commit Message:** `feat: Include AI router in main app`
    *   **Files Changed:** `second-brain-fastapi-backend/app/main.py`

*   **6.1.6: Test Summarization Functionality (Mock/Fallback)**
    *   **Action:** Use an API client to summarize a knowledge item and verify the LLM provides a coherent summary (initially using fallback direct API calls).
    *   **Commit Message:** `test: Verify summarization functionality (mock/fallback)`
    *   **Files Changed:** (No code changes, verification step)

### Task 6.2: Implement AI-Powered Content Generation (GAN/LLM via MCP)

**Description:** Allow users to generate new content (e.g., drafts, outlines) based on prompts and existing knowledge, potentially using GAN-like approaches or advanced LLM capabilities, primarily via MCP.

**User Story:** As a user, I want the AI to help me draft new content based on my ideas so that I can overcome writer's block and generate content faster.

**Sub-tasks (Commit-level):**

*   **6.2.1: Define MCP Server Interface for Content Generation**
    *   **Action:** Define a conceptual interface for an MCP server that could handle content generation requests, including context and style parameters.
    *   **Commit Message:** `feat: Define MCP server interface for content generation`
    *   **Files Changed:** `second-brain-fastapi-backend/app/mcp/content_gen_mcp_interface.py` (new file, conceptual definition)

*   **6.2.2: Add Content Generation Method to LLM Service (MCP Client)**
    *   **Action:** In `app/services/llm_service.py`, add a method (e.g., `generate_content`) that takes a prompt and optional context, formats an MCP request for content generation, and sends it to the MCP server. Include a fallback to direct LLM API calls.
    *   **Commit Message:** `feat: Add content generation method to LLMService (MCP client)`
    *   **Files Changed:** `second-brain-fastapi-backend/app/services/llm_service.py`

*   **6.2.3: Create Content Generation Endpoint**
    *   **Action:** In `app/api/v1/endpoints/ai.py`, add a `POST /ai/generate` endpoint that accepts a prompt and optionally a list of `knowledge_item_ids` for context, retrieves relevant chunks, calls `LLMService.generate_content`, and returns the generated text.
    *   **Commit Message:** `feat: Create content generation API endpoint`
    *   **Files Changed:** `second-brain-fastapi-backend/app/api/v1/endpoints/ai.py`

*   **6.2.4: Protect Content Generation Endpoint**
    *   **Action:** Apply `Depends(get_current_user)` to the content generation endpoint.
    *   **Commit Message:** `feat: Protect content generation endpoint`
    *   **Files Changed:** `second-brain-fastapi-backend/app/api/v1/endpoints/ai.py`

*   **6.2.5: Test Content Generation Functionality (Mock/Fallback)**
    *   **Action:** Use an API client to generate content based on a prompt and selected knowledge items, verifying the output.
    *   **Commit Message:** `test: Verify content generation functionality (mock/fallback)`
    *   **Files Changed:** (No code changes, verification step)

### Task 6.3: Implement Initial AGI Concepts (Integrated Feature)

**Description:** Begin integrating basic concepts related to Artificial General Intelligence (AGI), such as autonomous agents for knowledge organization or proactive insights. This will be an integrated feature, as full AGI is beyond current MCP scope.

**User Story:** As a user, I want my Second Brain to proactively organize my knowledge and suggest insights so that I can focus on higher-level thinking.

**Sub-tasks (Commit-level):**

*   **6.3.1: Research AGI-like Features for PKM**
    *   **Action:** Research current trends and feasible implementations of AGI-like features in Personal Knowledge Management (PKM) systems (e.g., autonomous tagging, intelligent linking suggestions, anomaly detection).
    *   **Commit Message:** `docs: Research AGI-like features for PKM`
    *   **Files Changed:** (No code changes, research step)

*   **6.3.2: Create `AgentService` Class**
    *   **Action:** Create `second-brain-fastapi-backend/app/services/agent_service.py` with a class `AgentService` to house initial AGI-like functionalities.
    *   **Commit Message:** `feat: Create AgentService class`
    *   **Files Changed:** `second-brain-fastapi-backend/app/services/agent_service.py`

*   **6.3.3: Implement Autonomous Tagging (Integrated Feature)**
    *   **Action:** In `AgentService`, add a method (e.g., `auto_tag_knowledge_item`) that uses an LLM (via `LLMService` fallback or direct call) to suggest relevant tags for a knowledge item. This will be triggered by a background task.
    *   **Commit Message:** `feat: Implement autonomous tagging in AgentService`
    *   **Files Changed:** `second-brain-fastapi-backend/app/services/agent_service.py`

*   **6.3.4: Create Background Task for Autonomous Tagging**
    *   **Action:** Create a Celery task (e.g., `auto_tag_task`) in `app/tasks/agent_tasks.py` that calls `AgentService.auto_tag_knowledge_item` for new or updated knowledge items.
    *   **Commit Message:** `feat: Create background task for autonomous tagging`
    *   **Files Changed:** `second-brain-fastapi-backend/app/tasks/agent_tasks.py`

*   **6.3.5: Trigger Autonomous Tagging Task**
    *   **Action:** Modify `app/crud/knowledge_item.py` to dispatch the `auto_tag_task` when a knowledge item is created or updated.
    *   **Commit Message:** `feat: Trigger auto-tagging task on knowledge item changes`
    *   **Files Changed:** `second-brain-fastapi-backend/app/crud/knowledge_item.py`

*   **6.3.6: Test Autonomous Tagging**
    *   **Action:** Create a new knowledge item and verify that relevant tags are automatically suggested and associated after the background task runs.
    *   **Commit Message:** `test: Verify autonomous tagging functionality`
    *   **Files Changed:** (No code changes, verification step)

### Task 6.4: Implement External Data Source Integration (e.g., Markdown Import)

**Description:** Allow users to import content from external files or services. This will be an integrated feature.

**User Story:** As a user, I want to import my existing notes from other formats so that I don't have to manually copy them.

**Sub-tasks (Commit-level):**

*   **6.4.1: Install File Processing Libraries**
    *   **Action:** Run `pip install python-markdown` (or other relevant libraries for PDF, DOCX parsing).
    *   **Commit Message:** `feat: Install markdown processing library`
    *   **Files Changed:** `second-brain-fastapi-backend/requirements.txt` (updated), `second-brain-fastapi-backend/.venv/` (updated)

*   **6.4.2: Create Import Service Class**
    *   **Action:** Create `second-brain-fastapi-backend/app/services/import_service.py` with a class `ImportService` containing methods for parsing different file types (e.g., `parse_markdown`).
    *   **Commit Message:** `feat: Create ImportService class`
    *   **Files Changed:** `second-brain-fastapi-backend/app/services/import_service.py`

*   **6.4.3: Create Import Router and Endpoint**
    *   **Action:** Create `second-brain-fastapi-backend/app/api/v1/endpoints/import_data.py` with a `APIRouter`. Add a `POST /import/markdown` endpoint that accepts a file upload, uses `ImportService` to parse it, and creates a new `KnowledgeItem`.
    *   **Commit Message:** `feat: Create import API router and markdown import endpoint`
    *   **Files Changed:** `second-brain-fastapi-backend/app/api/v1/endpoints/import_data.py`

*   **6.4.4: Protect Import Endpoint**
    *   **Action:** Apply `Depends(get_current_user)` to the import endpoint.
    *   **Commit Message:** `feat: Protect import endpoint`
    *   **Files Changed:** `second-brain-fastapi-backend/app/api/v1/endpoints/import_data.py`

*   **6.4.5: Include Import Router in `main.py`**
    *   **Action:** In `second-brain-fastapi-backend/app/main.py`, include the `import_data` router.
    *   **Commit Message:** `feat: Include import router in main app`
    *   **Files Changed:** `second-brain-fastapi-backend/app/main.py`

*   **6.4.6: Test Markdown Import**
    *   **Action:** Use an API client to upload a Markdown file and verify that a new knowledge item is created with the correct content.
    *   **Commit Message:** `test: Verify markdown import functionality`
    *   **Files Changed:** (No code changes, verification step)

---

## Phase 7: Implement Deployment and Monitoring Infrastructure (FastAPI)

**Objective:** To prepare the FastAPI application for production deployment and establish robust monitoring and logging systems.

**User Story:** As a DevOps engineer, I want to deploy and monitor the application reliably so that users have a stable and performant experience.

### Task 7.1: Containerize Backend Service

**Description:** Create a Dockerfile for the FastAPI backend application.

**User Story:** As a DevOps engineer, I want to containerize the backend so that it can be deployed consistently across environments.

**Sub-tasks (Commit-level):**

*   **7.1.1: Create Backend Dockerfile**
    *   **Action:** Create `second-brain-fastapi-backend/Dockerfile` with instructions to build and run the FastAPI application (e.g., using a multi-stage build with Gunicorn/Uvicorn).
    *   **Commit Message:** `feat: Create backend Dockerfile`
    *   **Files Changed:** `second-brain-fastapi-backend/Dockerfile`

*   **7.1.2: Add `.dockerignore` for Backend**
    *   **Action:** Create `second-brain-fastapi-backend/.dockerignore` to exclude unnecessary files from the Docker build context.
    *   **Commit Message:** `feat: Add backend .dockerignore`
    *   **Files Changed:** `second-brain-fastapi-backend/.dockerignore`

*   **7.1.3: Build Backend Docker Image Locally**
    *   **Action:** Run `docker build -t second-brain-fastapi-backend .` from the root directory.
    *   **Commit Message:** `test: Build backend Docker image locally`
    *   **Files Changed:** (No code changes, verification step)

### Task 7.2: Create Docker Compose Configuration

**Description:** Define a Docker Compose file to orchestrate the backend, database, and Redis services for local development and testing.

**User Story:** As a developer, I want a single command to spin up all backend services locally so that I can easily develop and test.

**Sub-tasks (Commit-level):**

*   **7.2.1: Create `docker-compose.yml`**
    *   **Action:** Create `second-brain-fastapi-backend/docker-compose.yml` defining services for `backend` (FastAPI), `database` (PostgreSQL), and `redis` (for Celery).
    *   **Commit Message:** `feat: Create docker-compose.yml`
    *   **Files Changed:** `second-brain-fastapi-backend/docker-compose.yml`

*   **7.2.2: Test Docker Compose Setup**
    *   **Action:** Run `docker-compose up --build` from the root directory. Verify all services start and the backend API is accessible.
    *   **Commit Message:** `test: Verify docker-compose setup`
    *   **Files Changed:** (No code changes, verification step)

### Task 7.3: Implement Logging and Monitoring

**Description:** Integrate structured logging and basic monitoring tools into the FastAPI backend service.

**User Story:** As a DevOps engineer, I want to see application logs and metrics so that I can diagnose issues and monitor performance.

**Sub-tasks (Commit-level):**

*   **7.3.1: Install Logging Libraries**
    *   **Action:** Run `pip install loguru` (or other structured logging library).
    *   **Commit Message:** `feat: Install loguru for structured logging`
    *   **Files Changed:** `second-brain-fastapi-backend/requirements.txt` (updated), `second-brain-fastapi-backend/.venv/` (updated)

*   **7.3.2: Configure Structured Logging**
    *   **Action:** Update `app/core/logging.py` to use `loguru` for enhanced structured logging, including request IDs and user context.
    *   **Commit Message:** `feat: Configure structured logging with loguru`
    *   **Files Changed:** `second-brain-fastapi-backend/app/core/logging.py`

*   **7.3.3: Integrate Logger into FastAPI App**
    *   **Action:** Modify `app/main.py` to integrate the structured logger, ensuring all requests and significant events are logged.
    *   **Commit Message:** `feat: Integrate structured logger into FastAPI app`
    *   **Files Changed:** `second-brain-fastapi-backend/app/main.py`

*   **7.3.4: Implement Basic Health Metrics (Optional)**
    *   **Action:** (Optional) Integrate a simple metrics library (e.g., `prometheus_client`) to expose basic application metrics (e.g., request count, latency) via an endpoint.
    *   **Commit Message:** `feat: Implement basic health metrics`
    *   **Files Changed:** `second-brain-fastapi-backend/app/api/v1/endpoints/metrics.py` (new file), `second-brain-fastapi-backend/app/main.py`

*   **7.3.5: Test Logging and Metrics**
    *   **Action:** Perform various actions via the API and verify that structured logs are generated correctly. If metrics are implemented, check the metrics endpoint.
    *   **Commit Message:** `test: Verify logging and metrics functionality`
    *   **Files Changed:** (No code changes, verification step)

---

## Phase 8: Compile Final Comprehensive Development Report (FastAPI)

**Objective:** To consolidate all findings, recommendations, and the detailed project plan into a final, comprehensive report.

**User Story:** As a project manager, I want a complete and detailed development report so that I can understand the project scope, architecture, and implementation plan.

### Task 8.1: Review and Refine Project Plan Content

**Description:** Review all previously generated content for accuracy, completeness, and consistency.

**User Story:** As a reviewer, I want the project plan to be accurate and well-structured so that it is easy to understand and follow.

**Sub-tasks (Commit-level):**

*   **8.1.1: Review Phase 1 Content**
    *   **Action:** Read through Phase 1 of `fastapi_project_plan.md` and make any necessary corrections or improvements.
    *   **Commit Message:** `refactor: Review and refine Phase 1 of project plan`
    *   **Files Changed:** `second-brain-fastapi-backend/fastapi_project_plan.md`

*   **8.1.2: Review Phase 2 Content**
    *   **Action:** Read through Phase 2 of `fastapi_project_plan.md` and make any necessary corrections or improvements.
    *   **Commit Message:** `refactor: Review and refine Phase 2 of project plan`
    *   **Files Changed:** `second-brain-fastapi-backend/fastapi_project_plan.md`

*   **8.1.3: Review Phase 3 Content**
    *   **Action:** Read through Phase 3 of `fastapi_project_plan.md` and make any necessary corrections or improvements, especially regarding MCP integration.
    *   **Commit Message:** `refactor: Review and refine Phase 3 of project plan (MCP)`
    *   **Files Changed:** `second-brain-fastapi-backend/fastapi_project_plan.md`

*   **8.1.4: Review Phase 4 Content**
    *   **Action:** Read through Phase 4 of `fastapi_project_plan.md` and make any necessary corrections or improvements, especially regarding RAG and MCP.
    *   **Commit Message:** `refactor: Review and refine Phase 4 of project plan (RAG/MCP)`
    *   **Files Changed:** `second-brain-fastapi-backend/fastapi_project_plan.md`

*   **8.1.5: Review Phase 5 Content**
    *   **Action:** Read through Phase 5 of `fastapi_project_plan.md` and make any necessary corrections or improvements.
    *   **Commit Message:** `refactor: Review and refine Phase 5 of project plan`
    *   **Files Changed:** `second-brain-fastapi-backend/fastapi_project_plan.md`

*   **8.1.6: Review Phase 6 Content**
    *   **Action:** Read through Phase 6 of `fastapi_project_plan.md` and make any necessary corrections or improvements, especially regarding GAN, AGI, and MCP.
    *   **Commit Message:** `refactor: Review and refine Phase 6 of project plan (GAN/AGI/MCP)`
    *   **Files Changed:** `second-brain-fastapi-backend/fastapi_project_plan.md`

*   **8.1.7: Review Phase 7 Content**
    *   **Action:** Read through Phase 7 of `fastapi_project_plan.md` and make any necessary corrections or improvements.
    *   **Commit Message:** `refactor: Review and refine Phase 7 of project plan`
    *   **Files Changed:** `second-brain-fastapi-backend/fastapi_project_plan.md`

### Task 8.2: Finalize Report and Deliver

**Description:** Add a concluding section and deliver the complete detailed project plan.

**User Story:** As a project manager, I want the final report to be complete and ready for distribution.

**Sub-tasks (Commit-level):**

*   **8.2.1: Add Conclusion to Report**
    *   **Action:** Add a concluding summary to `fastapi_project_plan.md`, reiterating the benefits of the proposed architecture, MCP integration, and phased approach.
    *   **Commit Message:** `docs: Add conclusion to detailed FastAPI project plan`
    *   **Files Changed:** `second-brain-fastapi-backend/fastapi_project_plan.md`

*   **8.2.2: Deliver Final Report**
    *   **Action:** Send the `fastapi_project_plan.md` file to the user.
    *   **Commit Message:** `docs: Deliver final detailed FastAPI project plan`
    *   **Files Changed:** (No code changes, delivery step)

---

This detailed plan provides a comprehensive, commit-level roadmap for developing the FastAPI backend of the Second Brain application. Each sub-task is designed to be atomic, allowing for precise tracking and execution by an LLM or automation agent. The phased approach ensures a logical progression of development, building complexity incrementally, with a strong emphasis on leveraging Model Context Protocol (MCP) for modularity and offloading where appropriate.
