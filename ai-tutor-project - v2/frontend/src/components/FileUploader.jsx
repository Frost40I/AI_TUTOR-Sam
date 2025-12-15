import React, { useState } from 'react';
import { uploadPdf } from '../services/api';
// (신규) App.css를 임포트 (모든 스타일이 여기에 있음)
import '../App.css'; 

function FileUploader() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setMessage('');
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage('먼저 파일을 선택해주세요.');
      return;
    }
    setMessage('업로드 중입니다...');

    try {
      const response = await uploadPdf(selectedFile);
      setMessage(`성공: ${response.data.message} (${response.data.filename})`);
      setSelectedFile(null); 
    } catch (error) {
      if (error.response) {
        setMessage(`오류: ${error.response.data.detail}`);
      } else {
        setMessage(`업로드 오류: ${error.message}`);
      }
    }
  };

  return (
    // (수정) className 적용
    <div className="uploader-container">
      <h2 className="uploader-header">1. PDF 파일 업로드</h2>
      <div className="uploader-input-group">
        
        {/* (참고) 파일 입력(input)은 기본 스타일을 사용합니다. */}
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
        />

        <button
          onClick={handleUpload}
          className="upload-button" // (수정)
          disabled={!selectedFile || message.includes('업로드 중')}
        >
          업로드
        </button>
      </div>
      
      {message && (
        // (수정) 동적 className
        <p className={`uploader-message ${message.startsWith('오류') ? 'error' : 'success'}`}>
          {message}
        </p>
      )}
    </div>
  );
}

export default FileUploader;