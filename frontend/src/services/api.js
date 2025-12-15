import axios from 'axios';

// FastAPI 서버 주소
const API_URL = 'http://127.0.0.1:8000';

// 1. PDF 업로드 API 함수 (변경 없음)
export const uploadPdf = (file) => {
  const formData = new FormData();
  formData.append('file', file); 

  return axios.post(`${API_URL}/api/documents/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// 2. 채팅 API 함수 (수정)
export const sendChatMessage = (question, chatHistory, mode) => { // 'mode' 인자 추가
  const requestBody = {
    question: question,
    chat_history: chatHistory,
    mode: mode // (신규) 현재 모드를 request body에 추가
  };

  return axios.post(`${API_URL}/api/chat/`, requestBody);
};