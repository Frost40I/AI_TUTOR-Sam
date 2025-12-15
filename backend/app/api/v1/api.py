# backend/app/api/v1/api.py
from fastapi import APIRouter
from app.api.v1.endpoints import chat, documents # 1. documents 임포트

api_router = APIRouter()
api_router.include_router(chat.router, prefix="/chat", tags=["Chat"])
api_router.include_router(documents.router, prefix="/documents", tags=["Documents"]) # 2. 라우터 추가