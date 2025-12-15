# backend/app/models/chat.py

from pydantic import BaseModel
from typing import List, Dict, Any

# API가 받을 요청 (질문)
class ChatRequest(BaseModel):
    question: str
    chat_history: List[Dict[str, Any]] = []
    
    # (수정) ⬇️ 이 줄이 누락되었습니다.
    mode: str = 'chat' # 'chat' 또는 'test' 모드를 받음. 기본값 'chat'

# API가 보낼 응답
class ChatResponse(BaseModel):
    answer: str