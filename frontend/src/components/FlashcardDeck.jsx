import React, { useEffect, useState } from 'react';
import { sendChatMessage } from '../services/api';
import '../App.css'; 

function FlashcardDeck() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [flippedState, setFlippedState] = useState({});

  const fetchCards = async () => {
    setLoading(true);
    setError('');
    setCards([]);
    setFlippedState({});
    
    try {
      const response = await sendChatMessage("암기 카드 만들어줘", [], 'flashcard');
      const parsedData = JSON.parse(response.data.answer);
      
      if (Array.isArray(parsedData)) {
          setCards(parsedData);
      } else {
          setError("데이터 형식이 올바르지 않습니다.");
      }
    } catch (err) {
      console.error(err);
      setError("암기 카드를 생성하지 못했습니다. (PDF 내용을 확인해주세요)");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleFlip = (index) => {
    setFlippedState(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      {/* 헤더 영역 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
          🃏 AI 암기 카드
        </h3>
        <button 
          onClick={fetchCards} 
          disabled={loading}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#2563EB',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? '생성 중...' : '🔄 새로고침'}
        </button>
      </div>
      
      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'white', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔄</div>
            <p style={{ color: '#6b7280' }}>AI가 핵심 내용을 요약하여 새로운 카드를 만들고 있습니다...</p>
        </div>
      )}
      
      {error && <div style={{ textAlign: 'center', padding: '1rem', color: '#dc2626', backgroundColor: '#fef2f2', borderRadius: '0.5rem' }}>{error}</div>}

      {!loading && !error && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {cards.map((card, index) => (
            <div 
              key={index} 
              className={`flashcard-container ${flippedState[index] ? 'flipped' : ''}`}
              style={{ height: '18rem' }}
              onClick={() => handleFlip(index)}
            >
              <div className="flashcard-inner">
                
                {/* --- [앞면] --- */}
                <div className="flashcard-front">
                  <div className="flashcard-header">
                    <span className="flashcard-label">Q. QUESTION</span>
                  </div>
                  
                  <div className="flashcard-content">
                    {card.front}
                  </div>

                  <div className="flashcard-footer">
                    👆 클릭해서 정답 보기
                  </div>
                </div>

                {/* --- [뒷면] --- */}
                <div className="flashcard-back">
                  <div className="flashcard-header" style={{ borderBottomColor: 'rgba(255,255,255,0.2)' }}>
                    <span className="flashcard-label">A. ANSWER</span>
                  </div>

                  <div className="flashcard-content">
                    {card.back}
                  </div>

                  <div className="flashcard-footer">
                    👆 클릭해서 질문 보기
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FlashcardDeck;