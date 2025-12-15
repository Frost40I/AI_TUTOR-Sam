# backend/test_core_logic.py

import os
from langchain_community.llms import Ollama
from langchain_community.embeddings import OllamaEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_community.document_loaders import PyMuPDFLoader  # PDF 로더
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

# --- 1. 설정 (Ollama, ChromaDB) ---
PDF_FILE_PATH = "test.pdf"  # ⚠️ backend 폴더에 준비한 PDF 파일 이름
DB_PATH = "./data/vector_db" # ChromaDB를 저장할 로컬 경로
OLLAMA_BASE_URL = "http://127.0.0.1:11434"
OLLAMA_MODEL = "exaone3.5:2.4b"

# --- 2. Ollama 모델 및 임베딩 로드 ---
try:
    llm = Ollama(model=OLLAMA_MODEL, base_url=OLLAMA_BASE_URL)
    embeddings = OllamaEmbeddings(model=OLLAMA_MODEL, base_url=OLLAMA_BASE_URL)
    print("✅ Ollama 연결 성공.")
except Exception as e:
    print(f"🚨 Ollama 연결 실패! 🚨")
    print(f"오류: {e}")
    print("터미널 1번에서 'ollama serve'가 실행 중인지 확인하세요.")
    exit()

# --- 3. (테스트) 간단한 LLM 호출 ---
try:
    print("\n--- 1. 간단한 LLM 호출 테스트 ---")
    response = llm.invoke("안녕하세요, 1+1은 무엇인가요?")
    print(f"Ollama 응답: {response}\n")
except Exception as e:
    print(f"🚨 LLM 호출 실패: {e}")
    exit()

# --- 4. RAG 파이프라인 (PDF 로드, 분할, 저장) ---
print("--- 2. RAG 파이프라인 테스트 ---")

if not os.path.exists(PDF_FILE_PATH):
    print(f"🚨 오류: '{PDF_FILE_PATH}' 파일을 찾을 수 없습니다.")
    print("backend 폴더에 테스트용 PDF 파일을 준비하세요.")
    exit()

try:
    # 1. 로드 (PDF)
    print(f"'{PDF_FILE_PATH}' 로드 중...")
    loader = PyMuPDFLoader(PDF_FILE_PATH)
    docs = loader.load()

    # 2. 분할 (Text Chunks)
    print("텍스트 분할 중...")
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    splits = text_splitter.split_documents(docs)

    # 3. 저장 (ChromaDB에 임베딩하여 저장)
    print(f"'{DB_PATH}' 경로에 ChromaDB 생성 및 저장 중...")
    # (참고: 이미 저장했다면 이 코드는 기존 DB를 사용합니다)
    vectorstore = Chroma.from_documents(
        documents=splits,
        embedding=embeddings,
        persist_directory=DB_PATH # 파일 기반으로 저장
    )
    
    # 4. 검색기(Retriever) 생성
    retriever = vectorstore.as_retriever(
        search_type="similarity",
        search_kwargs={'k': 3} # 관련성 높은 3개 조각 검색
    )
    print("✅ RAG 파이프라인 준비 완료.")

except Exception as e:
    print(f"🚨 RAG 파이프라인 구축 실패: {e}")
    exit()

# --- 5. RAG 기반 질의응답 테스트 ---
print("\n--- 3. RAG 기반 질의응답 테스트 ---")

# (1) RAG 프롬프트 템플릿
template = """
당신은 친절한 AI 튜터입니다.
제시된 [컨텍스트] 내용을 바탕으로 [질문]에 대해 답변해주세요.
컨텍스트에 없는 내용은 답변하지 마세요.

[컨텍스트]:
{context}

[질문]:
{question}
"""
prompt = ChatPromptTemplate.from_template(template)

# (2) LangChain 체인(Chain) 구성
#    {context} 에는 검색된 문서를, {question} 에는 원래 질문을 넣음
chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)

# (3) RAG 실행
try:
    # ⚠️ PDF 내용과 관련된 질문을 입력하세요
    question = "PDF 파일의 핵심 내용은 무엇인가요?" 
    print(f"\n[RAG 테스트 질문]: {question}")
    
    response = chain.invoke(question)
    
    print(f"\n[RAG 응답]:\n{response}\n")
    print("✅ RAG 테스트 성공!")

except Exception as e:
    print(f"🚨 RAG 실행 실패: {e}")