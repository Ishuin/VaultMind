# VaultMind — Product Demo Pitch Script

**ThoughtWeb Navigator | VaultMind**
*Estimated read time: 3–4 minutes*

---

## 1. Hook (15s)

You have notes in Notion, PDFs on your desktop, bookmarks you'll never open again, and ChatGPT conversations that actually had great answers — buried somewhere. The average knowledge worker uses 12+ tools to manage information, and none of them talk to each other. Your second brain isn't a brain. It's a junk drawer. VaultMind fixes that.

---

## 2. Architecture Walkthrough (45s)

VaultMind is a full-stack, local-first RAG system. Here's what that means in plain English:

You upload documents — PDFs, Word files, plain text. The backend runs entirely on your machine. It extracts the text, splits it into intelligently-sized chunks using a recursive text splitter, and generates vector embeddings locally using MiniLM-L6-v2 — a 384-dimension sentence transformer that runs on CPU. No API calls. No data leaving your network.

Those embeddings go into LanceDB, a lightweight vector database that lives right alongside your PostgreSQL metadata store. When you ask a question, VaultMind performs semantic search across your document chunks, finds the most relevant passages, constructs a grounded prompt, and sends it to an LLM.

And here's where it gets powerful: you choose the LLM. We support Ollama for fully local inference — zero cloud dependency. But we also support OpenAI, Anthropic, Google, Mistral, NVIDIA NIM, OpenRouter, and Hugging Face. Bring your own API keys. Use the model that fits your budget, your privacy requirements, and your use case. No lock-in. No markup. Your keys, your data, your choice.

---

## 3. Live Demo (90s)

*Start with the app running locally.*

Let me show you how this works end-to-end.

**Upload a document.** I'm dropping in a PDF — say, a product spec or a research paper. Watch what happens behind the scenes: the system extracts the text, validates it's readable, creates a document record in PostgreSQL, then chunks it into roughly 1,000-character segments with 100-character overlap for context continuity. Each chunk gets embedded locally and stored in LanceDB with metadata linking back to the source file. Done. The document is now part of my knowledge vault.

**Now I ask a question.** I type something into the chat interface — maybe a specific detail from that document. VaultMind takes my query, generates an embedding for it, searches LanceDB for the closest matching chunks, retrieves the top results, and builds a prompt that includes only the relevant context from my actual documents. No hallucination territory. The LLM is forced to ground its answer in what my documents actually say.

The response comes back with the answer, and I can see exactly which source it came from through the source management panel. I can upload multiple documents, ask cross-document questions, and the system weaves together context from across my entire vault.

I can also switch models on the fly — from a local Ollama model for free, private queries, to GPT-4o for complex reasoning, to Claude for nuanced analysis. The interface doesn't change. The privacy model does.

*End demo.*

---

## 4. Differentiators (30s)

Three things that set VaultMind apart:

**First — local-first by design.** Your documents are processed on your machine. Your embeddings are generated locally. Your vector database is local. Your data never touches a cloud server unless you explicitly choose to use a cloud LLM. This isn't a privacy promise. It's an architecture decision.

**Second — multi-provider BYOK.** OpenAI, Anthropic, Google, Mistral, NVIDIA, OpenRouter, Hugging Face — plus fully local Ollama. You own your API keys. We never mark up your inference costs. Use one provider. Use five. Switch based on the task. No vendor lock-in.

**Third — founder-first pricing.** We're launching with three founding tiers, strictly limited slots, and a lifetime price lock. Lock in your rate now, and it stays yours — even as we add features and scale. Early adopters shouldn't pay more for being early.

---

## 5. Close (15s)

The vision is simple: your entire digital knowledge base, queryable in natural language, running on your terms. Not on someone else's cloud. Not locked into someone else's model. Yours.

Founding slots are limited. Once they're claimed, the price goes up.

**Claim your slot at vaultmind.app.**

---

## Quick Reference — Key Talking Points

| Section | Key Point | Detail |
|---------|-----------|--------|
| Hook | Problem | 12+ tools, zero interoperability, knowledge scattered across silos |
| Architecture | Local-first RAG | Documents processed locally, no data leaves your machine by default |
| Architecture | Vector storage | LanceDB — lightweight, local vector DB alongside PostgreSQL |
| Architecture | Embeddings | MiniLM-L6-v2 (384-dim), runs on CPU via sentence-transformers |
| Architecture | BYOK | Bring your own API keys — no markups, no vendor lock-in |
| Architecture | Multi-provider | OpenAI, Anthropic, Google, Mistral, NVIDIA NIM, OpenRouter, Hugging Face, Ollama |
| Demo | Upload flow | PDF/DOCX/TXT → text extraction → chunking (1000 chars, 100 overlap) → embedding → LanceDB |
| Demo | Query flow | Query embedding → semantic search → context retrieval → grounded prompt → LLM response |
| Demo | Source mgmt | Every answer traced back to its source document |
| Differentiator | Privacy | Architecture-level data sovereignty, not just a privacy policy |
| Differentiator | Flexibility | Switch LLM providers per task — local for speed/privacy, cloud for capability |
| Differentiator | Pricing | 3 founding tiers, limited slots, lifetime price lock, no post-launch rate hikes |
| Close | CTA | Founding slots are limited — claim yours now |
