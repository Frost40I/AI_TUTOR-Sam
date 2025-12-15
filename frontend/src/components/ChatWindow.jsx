import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../services/api';
import '../App.css';

function ChatWindow({ mode }) {
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  // 자동 스크롤
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleInputChange = (e) => {
    setCurrentMessage(e.target.value);
  };

  const handleSend = async () => {
    if (!currentMessage.trim()) return;

    // 1. 사용자 메시지 UI 즉시 추가
    const userMessage = { sender: 'user', text: currentMessage };
    setMessages((prev) => [...prev, userMessage]);

    // 2. API 전송용 데이터 준비
    const questionToSend = currentMessage;
    const historyToSend = messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text
    }));

    setCurrentMessage('');
    setIsLoading(true);

    try {
      // 3. 백엔드 요청 (mode 전달)
      const response = await sendChatMessage(questionToSend, historyToSend, mode);

      // 4. AI 응답 UI 추가
      const aiMessage = { sender: 'ai', text: response.data.answer };
      setMessages((prev) => [...prev, aiMessage]);

    } catch (error) {
      const errorMessage = { sender: 'ai', text: '오류가 발생했습니다. ' + (error.response?.data?.detail || error.message) };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-window-container">
      <h2 className="chat-window-header">
        🎓 대화 모드
      </h2>

      <div className="chat-box">
        {messages.map((msg, index) => (
          <div key={index} className={`message-bubble-container ${msg.sender}`}>
            <div className={`message-bubble ${msg.sender} ${msg.text.startsWith('오류') ? 'error' : ''}`}>
              {msg.text}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message-bubble-container ai">
            <div className="loading-bubble">
              AI가 생각 중...
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="chat-input-container">
        <input
          type="text"
          value={currentMessage}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
          className="chat-input"
          placeholder="PDF 내용에 대해 질문하세요..."
        />
        <button
          onClick={handleSend}
          disabled={isLoading}
          className="chat-send-button"
        >
          {isLoading ? '...' : '전송'}
        </button>
      </div>
    </div>
  );
}

export default ChatWindow;