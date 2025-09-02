from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from backend.rag_engine import answer_question

app = FastAPI()

# Allow frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace * with your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/ask")
async def ask_question(request: Request):
    body = await request.json()
    question = body.get("question")
    if not question:
        return {"answer": "Please provide a 'question'."}
    answer = answer_question(question)
    return {"answer": answer}