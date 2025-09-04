# rag_engine.py
import os
from pathlib import Path

from dotenv import load_dotenv
load_dotenv()

# LangChain / OpenAI
from langchain_openai import OpenAIEmbeddings, OpenAI
from langchain.chains import RetrievalQA
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import DirectoryLoader, PyPDFLoader
from langchain_community.vectorstores import FAISS

ROOT_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT_DIR / "data"
assert DATA_DIR.exists(), f"DATA_DIR not found: {DATA_DIR}"


def load_vectorstore():
    loader = DirectoryLoader(
        str(DATA_DIR),
        glob="**/*.pdf",
        loader_cls=PyPDFLoader,   # reliable PDF parsing
    )
    docs = loader.load()

    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1200, chunk_overlap=150)
    splits = text_splitter.split_documents(docs)

    embeddings = OpenAIEmbeddings(model="text-embedding-3-large")
    return FAISS.from_documents(splits, embeddings)

vectorstore = load_vectorstore()

qa_chain = RetrievalQA.from_chain_type(
    llm=OpenAI(temperature=0),
    retriever=vectorstore.as_retriever(search_kwargs={"k": 4}),
    return_source_documents=False,
)

def answer_question(question: str) -> str:
    # pre-check whether anything is retrievable
    docs = retriever.get_relevant_documents(question)
    if not docs:
        return "I couldn’t find an answer in your PDFs."

    out = qa_chain.invoke({"query": question})
    return out["result"] if isinstance(out, dict) and "result" in out else str(out)

