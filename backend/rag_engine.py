# rag_engine.py
import os
from pathlib import Path

from dotenv import load_dotenv
load_dotenv()

# LangChain / OpenAI
from langchain_openai import OpenAIEmbeddings, OpenAI, ChatOpenAI
from langchain.chains import RetrievalQA
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import DirectoryLoader, PyPDFLoader
from langchain_community.vectorstores import FAISS
from langchain.prompts import ChatPromptTemplate

ROOT_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT_DIR / "data"
assert DATA_DIR.exists(), f"DATA_DIR not found: {DATA_DIR}"
INDEX_DIR = ROOT_DIR / "faiss_index"


def build_vectorstore(data_dir: Path, index_dir: Path) -> FAISS:
    """Create FAISS from PDFs and persist it."""
    loader = DirectoryLoader(
        str(data_dir),
        glob="**/*.pdf",
        loader_cls=PyPDFLoader,
    )
    docs = loader.load()
    if not docs:
        raise RuntimeError(f"No PDFs found under {data_dir}")

    splitter = RecursiveCharacterTextSplitter(chunk_size=1200, chunk_overlap=150)
    splits = splitter.split_documents(docs)

    embeddings = OpenAIEmbeddings(model="text-embedding-3-large")
    vs = FAISS.from_documents(splits, embeddings)
    vs.save_local(str(index_dir))
    return vs

def load_vectorstore(index_dir: Path) -> FAISS:
    """Load FAISS from disk."""
    embeddings = OpenAIEmbeddings(model="text-embedding-3-large")
    return FAISS.load_local(
        str(index_dir),
        embeddings,
        allow_dangerous_deserialization=True
    )

def build_or_load_vectorstore() -> FAISS:
    """Load existing index if present; otherwise build and save."""
    faiss_files_present = (
        INDEX_DIR.exists()
        and (INDEX_DIR / "index.faiss").exists()
        and (INDEX_DIR / "index.pkl").exists()
    )
    if faiss_files_present:
        try:
            return load_vectorstore(INDEX_DIR)
        except Exception as e:
            # Corrupted/outdated index → rebuild
            print(f"Failed to load FAISS index, rebuilding. Reason: {e}")
    # Build fresh
    INDEX_DIR.mkdir(parents=True, exist_ok=True)
    return build_vectorstore(DATA_DIR, INDEX_DIR)

# --- use it ---
vectorstore = build_or_load_vectorstore()
retriever = vectorstore.as_retriever(
    search_type="mmr",
    search_kwargs={"k": 6, "fetch_k": 20, "lambda_mult": 0.5}
)

prompt = ChatPromptTemplate.from_messages([
    ("system",
    "You are an expert management consultant/mentor helping one prepare for interview. \
    Answer questions clearly and concisely. Use only information from the provided documents."),
    ("human", "Question: {question}\n\nContext:\n{context}")
])

qa_chain = RetrievalQA.from_chain_type(
    llm=ChatOpenAI(model="gpt-4o-mini", temperature=0.5),
    retriever=retriever,
        chain_type="stuff",
    chain_type_kwargs={
        "prompt": prompt,
        "document_variable_name": "context",  # must match {context} above
    },
    return_source_documents=True,  # turn on if you want citations
)

def answer_question(question: str) -> str:
    # pre-check whether anything is retrievable
    if not retriever.get_relevant_documents(question):
        return "I couldn’t find an answer in your PDFs."

    out = qa_chain.invoke({"query": question})
    return out["result"] if isinstance(out, dict) and "result" in out else str(out)

