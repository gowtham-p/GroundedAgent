# GroundedAgent
> Production-minded RAG + Agents in Python: grounded answers with citations, evals, and guardrails.

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

---

## Quickstart
```bash
# 1) Create & activate a virtualenv
python -m venv .venv && source .venv/bin/activate
# on Windows: .venv\Scripts\activate

# 2) Install deps
pip install -r requirements.txt

# 3) Configure environment
cp .env.example .env   # add your OpenAI API key, etc.

# 4) Add a couple of PDFs to ./data (this dir is gitignored)

# 5) Run a smoke test (auto-builds/loads the FAISS index)
python -c "from grounded_agent.rag_engine import answer_question; print(answer_question('What is zero trust?'))"

---

## Project Structure
.
├─ src/grounded_agent/        # package (rag_engine.py lives here)
├─ data/                      # your PDFs (gitignored); include tiny samples in examples/
├─ examples/                  # example PDFs / notebooks
├─ tests/                     # pytest tests
├─ docs/                      # README images, architecture diagram
└─ scripts/                   # build_index.py, eval.py

## Architecture

Flow:
- Ingestion → Split → Embed → FAISS
- Retriever (MMR) → Prompt ({question}, {context}) → LLM
- Return answer with citations (source snippets/pages)

## Configuration

Set via **.env** (or a config `.yaml` if you prefer):

- `MODEL` — chat model (e.g., `gpt-4o-mini`)  
- `EMBEDDING_MODEL` — e.g., `text-embedding-3-large`  
- `TEXT_SPLIT_CHUNK_SIZE`, `CHUNK_OVERLAP`  
- `K`, `FETCH_K` for MMR retrieval  

---

**Tip:** The default code will build or load the **FAISS index** on startup.  
For large corpora, use `scripts/build_index.py` to prebuild.
