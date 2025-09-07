# GroundedAgent
> Production-minded RAG + Agents in Python: grounded answers with citations, evals, and guardrails.

![python](https://img.shields.io/badge/Python-3.11+-blue)
![license](https://img.shields.io/badge/license-MIT-green)
![tests](https://img.shields.io/badge/tests-passing-brightgreen)
![style](https://img.shields.io/badge/style-ruff%20%7C%20black-black)

## Why
Most “chat with your docs” demos skip the hard parts. This repo shows how to build **grounded** retrieval-augmented agents with production concerns: relevance, citations, evals, and safety.

## What
- **RAG engine** (FAISS, OpenAI embeddings) with configurable prompts
- **Citations**: return source documents & pages
- **MMR retrieval** with tunable k/fetch_k
- **Pluggable model** (`ChatOpenAI`) and prompt templates
- **Unit tests + eval hooks** for answer quality (RAGAS/DeepEval ready)
=

## Quickstart
```bash
python -m venv .venv && source .venv/bin/activate  # on Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env   # add your API key
python -c "from rag_engine import answer_question; print(answer_question('What is zero trust?'))"

## Project Structure
.
├─ src/grounded_agent/        # package (rag_engine.py lives here)
├─ data/                      # your PDFs (gitignored); include sample in examples/
├─ examples/                  # tiny sample PDFs + example notebooks
├─ tests/                     # pytest tests
├─ docs/                      # README images, architecture diagram
└─ scripts/                   # build_index.py, eval.py

## Architecture
**Flow:**
- Ingestion → Split → Embed → FAISS  
- Retriever (MMR) → Prompt ({question}, {context}) → LLM  
- Citations returned alongside answers


## Configuration

- `TEXT_SPLIT_CHUNK_SIZE`, `CHUNK_OVERLAP`, `K`, `FETCH_K`  
  via **env** or `.yaml`  

- `MODEL` and `EMBEDDING_MODEL`  
  set in **.env**




This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
