from fastapi import APIRouter
from app.models.chat import ChatRequest, ChatResponse
# (수정) get_rag_response 함수 임포트
from app.services.tutor_service import get_rag_response

router = APIRouter() # ⬅️ 이 줄이 누락되었을 것입니다.

@router.post("/", response_model=ChatResponse)
def handle_chat(request: ChatRequest): # request 객체에 question, chat_history, mode가 모두 들어있음
    """
    RAG 기반 질의응답을 처리합니다. (모드 포함)
    """
    # (수정) question, chat_history, mode를 함께 전달
    answer = get_rag_response(request.question, request.chat_history, request.mode)
    return ChatResponse(answer=answer)