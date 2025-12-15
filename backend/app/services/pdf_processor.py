# backend/app/services/pdf_processor.py

from langchain_community.document_loaders import PyMuPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from typing import List
from langchain_core.documents import Document
import logging

# 텍스트 분할기 (미리 설정)
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)

def process_pdf(file_path: str) -> List[Document]:
    """
    주어진 PDF 파일 경로에서 텍스트를 로드하고 분할하여 Document 리스트로 반환합니다.
    """
    try:
        print(f"PDF 처리 시작: {file_path}")
        loader = PyMuPDFLoader(file_path)
        docs = loader.load()
        
        if not docs:
            logging.warning(f"PDF에서 문서를 로드하지 못했습니다: {file_path}")
            return []

        splits = text_splitter.split_documents(docs)
        print(f"PDF 처리 완료. 분할된 청크 수: {len(splits)}")
        return splits
        
    except Exception as e:
        logging.error(f"PDF 처리 중 오류 발생: {e}", exc_info=True)
        return []