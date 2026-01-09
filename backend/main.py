from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from llama_cpp import Llama
import os
from dotenv import load_dotenv
import uvicorn
from contextlib import asynccontextmanager

load_dotenv()

# 전역 모델 변수
llm = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """서버 시작/종료 시 실행되는 lifespan 이벤트"""
    # 시작 시 모델 로드
    global llm
    try:
        load_model()
    except Exception as e:
        print(f"모델 로딩 실패: {e}")
        print("서버는 시작되지만 /chat 엔드포인트는 작동하지 않습니다.")
    yield
    # 종료 시 정리 작업 (필요시)

app = FastAPI(title="LLM AI Server", version="1.0.0", lifespan=lifespan)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    max_tokens: int = 512
    temperature: float = 0.7
    top_p: float = 0.9

class ChatResponse(BaseModel):
    response: str
    tokens_used: int

def find_model_file():
    """models 디렉토리에서 .gguf 파일 자동 검색"""
    models_dir = "models"
    if os.path.exists(models_dir):
        for file in os.listdir(models_dir):
            if file.endswith(".gguf"):
                return os.path.join(models_dir, file)
    return None

def load_model():
    """LLM 모델 로드"""
    global llm
    model_path = os.getenv("MODEL_PATH")
    
    # MODEL_PATH가 설정되지 않았거나 파일이 없으면 자동 검색
    if not model_path or not os.path.exists(model_path):
        print("MODEL_PATH가 설정되지 않았거나 파일을 찾을 수 없습니다. models 디렉토리에서 자동 검색 중...")
        auto_found = find_model_file()
        if auto_found:
            model_path = auto_found
            print(f"모델 파일을 자동으로 찾았습니다: {model_path}")
        else:
            raise FileNotFoundError(
                "모델 파일을 찾을 수 없습니다.\n"
                "다음 중 하나를 수행해주세요:\n"
                "1. python download_model.py로 모델을 다운로드하세요\n"
                "2. .env 파일에 MODEL_PATH=models/모델파일명.gguf를 설정하세요"
            )
    
    if not os.path.exists(model_path):
        raise FileNotFoundError(
            f"모델 파일을 찾을 수 없습니다: {model_path}\n"
            "모델을 다운로드하거나 MODEL_PATH 환경변수를 설정해주세요."
        )
    
    print(f"모델 로딩 중: {model_path}")
    llm = Llama(
        model_path=model_path,
        n_ctx=2048,  # 컨텍스트 길이
        n_threads=8,  # M1 Pro의 성능 코어 수
        n_gpu_layers=1,  # Metal GPU 가속 (M1 Pro)
        verbose=False
    )
    print("모델 로딩 완료!")

@app.get("/")
async def root():
    return {
        "message": "LLM AI Server",
        "status": "running",
        "model_loaded": llm is not None
    }

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "model_loaded": llm is not None
    }

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """채팅 메시지 처리"""
    if llm is None:
        raise HTTPException(
            status_code=503,
            detail="모델이 로드되지 않았습니다. 서버 로그를 확인해주세요."
        )
    
    try:
        # 프롬프트 생성
        prompt = f"Human: {request.message}\nAssistant:"
        
        # 모델 추론
        response = llm(
            prompt,
            max_tokens=request.max_tokens,
            temperature=request.temperature,
            top_p=request.top_p,
            stop=["Human:", "\n\n"],
            echo=False
        )
        
        generated_text = response["choices"][0]["text"].strip()
        tokens_used = response.get("usage", {}).get("total_tokens", 0)
        
        return ChatResponse(
            response=generated_text,
            tokens_used=tokens_used
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"추론 중 오류 발생: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
