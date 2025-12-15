# backend/app/main.py
from fastapi import FastAPI
from app.api.v1.api import api_router # v1 API 라우터 임포트

# 1. (추가) CORSMiddleware 임포트
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="AI Tutor API",
    description="Ollama와 RAG를 이용한 AI 튜터 API 서버입니다.",
    version="0.1.0"
)

# 2. (추가) CORS 미들웨어 설정
origins = [
    "http://localhost:3000", # React 개발 서버 주소
    "http://127.0.0.1:3000", # (혹시 모를 경우)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       # origins 리스트에 있는 주소의 요청을 허용
    allow_credentials=True,
    allow_methods=["*"],         # 모든 HTTP 메소드 허용
    allow_headers=["*"],         # 모든 HTTP 헤더 허용
)
# API 라우터 포함
app.include_router(api_router, prefix="/api") # /api/v1/...

@app.get("/")
def read_root():
    return {"message": "AI Tutor API 서버가 실행 중입니다."}