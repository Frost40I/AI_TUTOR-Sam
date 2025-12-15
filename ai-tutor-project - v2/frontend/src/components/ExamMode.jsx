import React, { useState, useEffect } from 'react';
import { sendChatMessage } from '../services/api';
import '../App.css'; // 스타일 재사용

function ExamMode() {
  // 상태: 'setup' | 'loading' | 'taking' | 'result'
  const [step, setStep] = useState('setup');
  
  // 설정값
  const [numQuestions, setNumQuestions] = useState(3);
  const [timeLimit, setTimeLimit] = useState(60); // 초 단위 (기본 1분)

  // 시험 데이터
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({}); // { 0: "답1", 1: "답2" }
  const [timeLeft, setTimeLeft] = useState(0);

  // 타이머 로직
  useEffect(() => {
    let timer;
    if (step === 'taking' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (step === 'taking' && timeLeft === 0) {
      handleSubmit(); // 시간 종료 시 자동 제출
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  // 1. 시험 생성 요청
  const handleStartExam = async () => {
    setStep('loading');
    try {
      // mode='exam', question=문제개수
      const response = await sendChatMessage(String(numQuestions), [], 'exam');
      const parsedQuestions = JSON.parse(response.data.answer);
      
      if (Array.isArray(parsedQuestions)) {
        setQuestions(parsedQuestions);
        setTimeLeft(timeLimit);
        setStep('taking');
      } else {
        alert("문제 생성 형식이 올바르지 않습니다. 다시 시도해주세요.");
        setStep('setup');
      }
    } catch (error) {
      console.error(error);
      alert("문제 생성 중 오류가 발생했습니다. (PDF 내용을 확인해주세요)");
      setStep('setup');
    }
  };

  // 답안 입력 핸들러
  const handleAnswerChange = (qId, value) => {
    setUserAnswers(prev => ({ ...prev, [qId]: value }));
  };

  // 2. 시험 제출 (채점 화면으로 이동)
  const handleSubmit = () => {
    setStep('result');
  };

  // --- 화면 렌더링 ---

  // [1] 설정 화면
  if (step === 'setup') {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mt-4 text-center">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">📝 모의고사</h2>
        
        <div className="flex flex-col gap-4 max-w-sm mx-auto">
          <div>
            <label className="block text-left font-semibold mb-1">문제 개수</label>
            <select 
              value={numQuestions} 
              onChange={(e) => setNumQuestions(Number(e.target.value))}
              className="w-full p-2 border rounded"
            >
              <option value="3">3문제</option>
              <option value="5">5문제</option>
              <option value="10">10문제</option>
            </select>
          </div>

          <div>
            <label className="block text-left font-semibold mb-1">제한 시간</label>
            <select 
              value={timeLimit} 
              onChange={(e) => setTimeLimit(Number(e.target.value))}
              className="w-full p-2 border rounded"
            >
              <option value="60">1분</option>
              <option value="180">3분</option>
              <option value="300">5분</option>
              <option value="600">10분</option>
            </select>
          </div>

          <button 
            onClick={handleStartExam}
            className="mt-4 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition"
          >
            시험 시작하기
          </button>
        </div>
      </div>
    );
  }

  // [2] 로딩 화면
  if (step === 'loading') {
    return (
      <div className="text-center p-12">
        <div className="text-2xl animate-bounce mb-4">🤖</div>
        <p className="text-lg font-semibold text-gray-600">AI가 PDF 내용을 분석하여<br/>문제를 출제하고 있습니다...</p>
      </div>
    );
  }

  // [3] 시험 응시 화면
  if (step === 'taking') {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mt-4">
        {/* 헤더 (타이머) */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b">
          <span className="font-bold text-lg">총 {questions.length}문제</span>
          <div className={`font-mono text-xl font-bold ${timeLeft < 10 ? 'text-red-600' : 'text-blue-600'}`}>
            남은 시간: {Math.floor(timeLeft / 60)}분 {timeLeft % 60}초
          </div>
        </div>

        {/* 문제 리스트 */}
        <div className="space-y-8">
          {questions.map((q, index) => (
            <div key={index}>
              <p className="font-semibold text-lg mb-2">Q{index + 1}. {q.question}</p>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="답안을 입력하세요"
                value={userAnswers[index] || ''}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
              />
            </div>
          ))}
        </div>

        <button 
          onClick={handleSubmit}
          className="w-full mt-8 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700"
        >
          답안 제출하기
        </button>
      </div>
    );
  }

  // [4] 결과 화면
  if (step === 'result') {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mt-4">
        <h2 className="text-2xl font-bold mb-6 text-center">채점 결과</h2>
        
        <div className="space-y-6">
          {questions.map((q, index) => (
            <div key={index} className="border-b pb-4 last:border-0">
              <p className="font-semibold text-lg">Q{index + 1}. {q.question}</p>
              
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded">
                  <span className="text-xs text-gray-500 font-bold block">내 답안</span>
                  <p className="text-gray-800">{userAnswers[index] || "(미입력)"}</p>
                </div>
                <div className="bg-green-50 p-3 rounded border border-green-200">
                  <span className="text-xs text-green-600 font-bold block">AI 모범 답안</span>
                  <p className="text-green-900 font-medium">{q.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={() => setStep('setup')}
          className="w-full mt-8 bg-gray-800 text-white py-3 rounded-lg font-bold hover:bg-gray-900"
        >
          새로운 시험 보기
        </button>
      </div>
    );
  }
}

export default ExamMode;