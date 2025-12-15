# backend/app/services/tutor_service.py

from langchain_community.llms import Ollama
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from typing import List, Dict, Any 

from app.services.vector_store import get_retriever, OLLAMA_BASE_URL

# 채팅 모델 정의
OLLAMA_CHAT_MODEL = "gemma3:4b" 

# --- 체인 구성 ---
try:
    print(f"Tutor Service: LLM 로드 중... ({OLLAMA_CHAT_MODEL})")
    llm = Ollama(model=OLLAMA_CHAT_MODEL, base_url=OLLAMA_BASE_URL)
    
    # (1) 답변 체인 (대화 모드용)
    # 역할: 사용자의 질문에 대해 친절하게 설명합니다.
    template_answer = """
    [역할] 친절한 AI 튜터 (대화 모드)
    [지시] 질문에 친절하게 답하세요.
    [정보] {chat_history} / {context} / {question}
    """
    rag_chain = (
        {"context": lambda x: get_retriever(), "question": lambda x: x["question"], "chat_history": lambda x: x["chat_history"]}
        | ChatPromptTemplate.from_template(template_answer) | llm | StrOutputParser()
    )

    # (2) 시험 문제 생성 체인 (실전 시험 모드용)
    # 역할: 요청받은 개수만큼의 문제를 JSON으로 생성합니다.
    template_exam = """
    [역할] 당신은 엄격한 시험 출제위원입니다.
    [지시]
    제공된 [컨텍스트] 내용을 바탕으로 **총 {num}개의 단답형 문제**를 출제하세요.
    반드시 아래의 **JSON 형식으로만** 출력해야 합니다. 다른 말은 절대 하지 마세요.

    [JSON 형식 예시]
    [
        {{"id": 1, "question": "질문 내용...", "answer": "정답"}},
        {{"id": 2, "question": "질문 내용...", "answer": "정답"}}
    ]

    [요청 사항]
    - 문제 개수: {num}개
    - 난이도: 핵심 내용을 다루는 중급 난이도
    - 정답: 명확한 단어 위주

    [컨텍스트]: {context}
    [JSON 출력]:
    """
    exam_chain = (
        {"context": lambda x: get_retriever(), "num": lambda x: x["question"]} 
        | ChatPromptTemplate.from_template(template_exam) | llm | StrOutputParser()
    )

    # (3) 암기 카드 생성 체인 (암기 카드 모드용)
    # 역할: 4개의 암기 카드를 JSON으로 생성합니다.
    template_flashcard = """
    [역할] 학습 도구 제작자
    [지시] 핵심 내용 복습용 암기 카드 4개를 생성하여 오직 JSON 형식으로만 출력하세요.
    [JSON 형식] [ {{"front": "...", "back": "..."}} ]
    [컨텍스트]: {context}
    """
    flashcard_chain = (
        {"context": lambda x: get_retriever(), "question": lambda x: x["question"]}
        | ChatPromptTemplate.from_template(template_flashcard) | llm | StrOutputParser()
    )

    print("✅ Tutor Service: 대화/시험/암기카드 체인 구성 성공.")

except Exception as e:
    print(f"🚨 Tutor Service 초기화 실패: {e}")
    rag_chain = None; exam_chain = None; flashcard_chain = None


# --- 메인 라우터 ---
def get_rag_response(question: str, chat_history: List[Dict[str, Any]], mode: str = 'chat') -> str:
    if rag_chain is None: return "오류: 초기화 실패"
    if get_retriever() is None: return "오류: PDF 없음"

    try:
        # 1. 암기 카드 모드
        if mode == 'flashcard':
            print("-> (F) 암기 카드 생성")
            result = flashcard_chain.invoke({"question": question})
            return result.replace("```json", "").replace("```", "").strip()

        # 2. 시험 생성 모드 (Exam Generation)
        if mode == 'exam':
            print(f"-> (E) 시험 문제 {question}개 생성 중...")
            result = exam_chain.invoke({"question": question})
            return result.replace("```json", "").replace("```", "").strip()

        # 3. 대화 모드 (기본값)
        print("-> (C) 일반 답변 (대화모드)")
        formatted_history = "\n".join([f"{msg['role']}: {msg['content']}" for msg in chat_history])
        return rag_chain.invoke({"question": question, "chat_history": formatted_history})
        
    except Exception as e:
        print(f"🚨 실행 오류: {e}")
        return f"오류 발생: {e}"