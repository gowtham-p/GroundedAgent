# GroundedAgent
> Production-minded RAG + Agents with a Next.js (React) frontend and a FastAPI (Python) backend. Grounded answers with citations, evals, and guardrails.

![python](https://img.shields.io/badge/Python-3.11+-blue)
![license](https://img.shields.io/badge/license-MIT-green)
![tests](https://img.shields.io/badge/tests-passing-brightgreen)
![style](https://img.shields.io/badge/style-ruff%20%7C%20black-black)

## Why
Most “chat with your docs” demos skip the hard parts. This repo shows how to build **grounded** retrieval-augmented agents with production concerns: relevance, citations, evals, and safety.

## What
- **RAG engine** (FAISS + OpenAI embeddings) with configurable prompts  
- **Citations** (returns source documents & page hints)  
- **MMR retrieval** with tunable `k` / `fetch_k`  
- **Pluggable models** (`ChatOpenAI`) and prompt templates  
- **Unit tests & eval hooks** (RAGAS/DeepEval ready)

## Architecture

Browser ── POST /api/ask ─▶ Next.js route (app/api/ask/route.ts)
                             └──▶ FastAPI (http://127.0.0.1:8000/api/ask)
                                   └──▶ RAG (FAISS, LLM) → JSON (answer + citations)
                                   
Flow:
- Ingestion → Split → Embed → FAISS
- Retriever (MMR) → Prompt ({question}, {context}) → LLM
- Return answer with citations (source snippets/pages)


## Project Structure
.
├─ app/ # Next.js (App Router)
│ └─ api/
│ └─ ask/
│ └─ route.ts # proxy -> FastAPI /api/ask
├─ components/ # React UI
├─ backend/ # FastAPI app (main.py, rag_engine.py, etc.)
├─ data/ # PDFs (gitignored)
├─ public/ # static assets
├─ .env.local # Next server env (PYTHON_BASE_URL only)
├─ .env # Python env (OpenAI keys, etc.)
└─ requirements.txt # Python deps

## Quickstart

### Backend (FastAPI)

1) Create & activate a virtualenv
```bash
python -m venv .venv
source .venv/bin/activate    # macOS/Linux
# .venv\Scripts\Activate.ps1 # Windows PowerShell
```

2) Install dependencies

```bash
pip install -r requirements.txt
# If anything is missing locally, you can add:
# pip install fastapi "uvicorn[standard]" faiss-cpu
```

3) Backend env (.env)

Create a file named .env in the repo root:
```
OPENAI_API_KEY=sk-...
MODEL=gpt-4o-mini
EMBEDDING_MODEL=text-embedding-3-large
```

4) Run FastAPI on port 8000
```
python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```
Verify: http://127.0.0.1:8000/docs

### Frontend (Next.js)

1) Next server env (.env.local)

Server-only variable (do not prefix with NEXT_PUBLIC_).
```
PYTHON_BASE_URL=http://127.0.0.1:8000
```

2) Install and run
```
npm install
npm run dev
```
Visit: http://localhost:3000

Health proxy test: http://localhost:3000/api/health
 → should return {"status":"ok"}


## Configuration

Set via **.env** (or a config `.yaml` if you prefer):

- `MODEL` — chat model (e.g., `gpt-4o-mini`)  
- `EMBEDDING_MODEL` — e.g., `text-embedding-3-large`  
- `TEXT_SPLIT_CHUNK_SIZE`, `CHUNK_OVERLAP`  
- `K`, `FETCH_K` for MMR retrieval  

---

### (Optional) Streaming
- FastAPI: return SSE or chunked responses as tokens are generated
- Next route: pass Response.body through with Content-Type: text/event-stream
- UI: read stream (EventSource / ReadableStream) for ChatGPT-style typing

Deploy notes
- Deploy Next (e.g., Vercel).
- Deploy FastAPI (Render/Fly/EC2).
- Set PYTHON_BASE_URL in Vercel to your FastAPI URL.
- The browser still calls only /api/* on your Next domain.

**Tip:** The default code will build or load the **FAISS index** on startup.  
For large corpora, use `scripts/build_index.py` to prebuild.
