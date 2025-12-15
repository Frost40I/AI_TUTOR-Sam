import React, { useState } from 'react';
import FileUploader from './components/FileUploader';
import ChatWindow from './components/ChatWindow';
import ExamMode from './components/ExamMode';
import FlashcardDeck from './components/FlashcardDeck';
import './App.css'; 

function App() {
  const [mode, setMode] = useState('chat');
  
  // (신규) 채팅 기록을 App에서 관리 (모드가 바뀌어도 유지됨)
  const [chatMessages, setChatMessages] = useState([]);

  return (
    <div className="app-container">
      <div className="app-content">
        
        <h1 className="app-header">
          AI 튜터: Sam
        </h1>
        
        <FileUploader />
        
        <hr className="app-divider" />

        {/* 탭 메뉴 */}
        <div className="mode-button-container" style={{ flexWrap: 'wrap' }}>
          <button 
            onClick={() => setMode('chat')}
            className={`mode-button ${mode === 'chat' ? 'chat-active' : 'inactive'}`}
          >
            💬 대화 모드
          </button>
          <button 
            onClick={() => setMode('exam')}
            className={`mode-button ${mode === 'exam' ? 'test-active' : 'inactive'}`}
            style={{ backgroundColor: mode === 'exam' ? '#16A34A' : undefined, color: mode === 'exam' ? 'white' : undefined }}
          >
            📝 실전 시험
          </button>
          <button 
            onClick={() => setMode('flashcard')}
            className={`mode-button ${mode === 'flashcard' ? 'chat-active' : 'inactive'}`}
            style={{ backgroundColor: mode === 'flashcard' ? '#F59E0B' : undefined, color: mode === 'flashcard' ? 'white' : undefined }}
          >
            🃏 암기 카드
          </button>
        </div>
        
        {/* 모드에 따른 화면 전환 */}
        
        {/* 1. 대화 모드 */}
        {mode === 'chat' && (
          <ChatWindow 
            mode="chat" 
            // (신규) 부모의 상태와 변경 함수를 자식에게 전달
            messages={chatMessages} 
            setMessages={setChatMessages} 
          />
        )}
        
        {/* 2. 실전 시험 모드 */}
        {mode === 'exam' && <ExamMode />}
        
        {/* 3. 암기 카드 모드 */}
        {mode === 'flashcard' && <FlashcardDeck />}
        
      </div>
    </div>
  );
}

export default App;