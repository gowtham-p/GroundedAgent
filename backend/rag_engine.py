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
retriever=vectorstore.as_retriever(
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
    llm=ChatOpenAI(model="gpt-4o-mini", temperature=0.1),
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

