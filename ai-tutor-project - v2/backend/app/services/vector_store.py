# backend/app/services/vector_store.py

from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import OllamaEmbeddings
from langchain_core.documents import Document
from typing import List
import logging # (신규) 1. logging 모듈 임포트

# --- 1. 설정 (수정) ---
DB_PATH = "./data/vector_db"
OLLAMA_BASE_URL = "http://127.0.0.1:11434"
# (중요!) 임베딩 전용 모델로 변경
OLLAMA_EMBED_MODEL = "nomic-embed-text" 

# --- 2. 임베딩 모델 및 Vector DB 로드 (전역) ---
try:
    # (수정) 임베딩 모델 (nomic-embed-text)
    embeddings = OllamaEmbeddings(model=OLLAMA_EMBED_MODEL, base_url=OLLAMA_BASE_URL)
    
    # ChromaDB (파일 기반)
    vectorstore = Chroma(
        persist_directory=DB_PATH, 
        embedding_function=embeddings
    )
    
    # RAG 검색기
    retriever = vectorstore.as_retriever(search_kwargs={'k': 3})
    
    print("✅ Vector Store 및 Retriever 로드 성공. (임베딩 모델: nomic-embed-text)")

except Exception as e:
    print(f"🚨 Vector Store 로드 실패: {e}")
    print("ChromaDB가 비어있어도 괜찮습니다. 업로드 시 생성됩니다.")
    vectorstore = None
    retriever = None

# --- (이하 add_documents_to_db, get_retriever 함수는 모두 동일) ---

def add_documents_to_db(documents: List[Document]):
    """
    분할된 Document 리스트를 ChromaDB에 추가(임베딩)합니다.
    """
    global vectorstore, retriever # 전역 변수 업데이트
    
    if not documents:
        print("DB에 추가할 문서가 없습니다.")
        return

    try:
        print(f"{len(documents)}개의 문서를 DB에 추가합니다...")
        if vectorstore is None:
            # DB가 비어있으면(최초 실행 시) 새로 생성
            vectorstore = Chroma.from_documents(
                documents=documents,
                embedding=embeddings, # nomic-embed-text 사용
                persist_directory=DB_PATH
            )
        else:
            # 기존 DB에 추가
            vectorstore.add_documents(documents) # nomic-embed-text 사용
        
        # DB가 업데이트되었으므로 Retriever도 다시 설정
        retriever = vectorstore.as_retriever(search_kwargs={'k': 3})
        print("✅ DB 업데이트 및 Retriever 재설정 완료.")
        
    except Exception as e:
        # (수정) 2. print(..., exc_info=True) -> logging.error(..., exc_info=True)
        logging.error(f"🚨 DB 문서 추가 실패: {e}", exc_info=True)

def get_retriever():
    """
    현재 로드된 RAG Retriever를 반환합니다.
    """
    return retriever