# backend/app/api/v1/endpoints/documents.py

from fastapi import APIRouter, UploadFile, File, HTTPException
import shutil # 파일 저장을 위해
import os
from app.services import pdf_processor, vector_store

router = APIRouter()

# 임시 파일 저장 경로
UPLOAD_DIR = "./data/uploads" 
os.makedirs(UPLOAD_DIR, exist_ok=True) # 폴더가 없으면 생성

@router.post("/upload", status_code=201)
async def upload_document(file: UploadFile = File(...)):
    """
    PDF 파일을 업로드하고 처리하여 Vector DB에 저장합니다.
    """
    # 1. 업로드된 파일을 임시로 디스크에 저장
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        print(f"파일 임시 저장 완료: {file_path}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"파일 저장 실패: {e}")

    # 2. PDF 처리 (pdf_processor 서비스 호출)
    splits = pdf_processor.process_pdf(file_path)
    if not splits:
        raise HTTPException(status_code=400, detail="PDF에서 텍스트를 추출하지 못했거나 파일이 비어있습니다.")

    # 3. Vector DB에 저장 (vector_store 서비스 호출)
    try:
        vector_store.add_documents_to_db(splits)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Vector DB 저장 실패: {e}")

    return {
        "filename": file.filename, 
        "message": "파일 업로드 및 Vector DB 저장 성공",
        "chunks_added": len(splits)
    }