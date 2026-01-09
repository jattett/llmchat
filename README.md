# llmchat

# LLM AI 서버 프로젝트

M1 Pro MacBook (32GB)에서 실행 가능한 오픈소스 LLM 모델을 사용한 AI 채팅 서버입니다.

## 🚀 기능

- **백엔드**: FastAPI 기반 LLM 서버
- **프론트엔드**: React 기반 채팅 인터페이스
- **모델 지원**: llama-cpp-python을 통한 GGUF 형식 모델 지원
- **M1 Pro 최적화**: Metal GPU 가속 지원

## 📋 사전 요구사항

- Python 3.9 이상
- Node.js 16 이상
- M1 Pro MacBook (32GB RAM 권장)

## 🛠️ 설치 및 실행

### 1. 백엔드 설정

```bash
# 백엔드 디렉토리로 이동
cd backend

# 가상환경 생성 및 활성화
python3 -m venv venv
source venv/bin/activate  # macOS/Linux

# 의존성 설치
pip install -r requirements.txt

# llama-cpp-python을 Metal GPU 지원으로 설치 (M1 Pro 최적화)
CMAKE_ARGS="-DLLAMA_METAL=on" pip install --upgrade --force-reinstall llama-cpp-python

# 모델 다운로드
python download_model.py

# .env 파일 생성
cp .env.example .env
# .env 파일에서 MODEL_PATH를 다운로드한 모델 경로로 수정

# 서버 실행
python main.py
# 또는
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

서버는 `http://localhost:8000`에서 실행됩니다.

### 2. 프론트엔드 설정

```bash
# 새 터미널에서 프론트엔드 디렉토리로 이동
cd frontend

# 의존성 설치
npm install

# 개발 서버 실행
npm start
```

프론트엔드는 `http://localhost:3000`에서 실행됩니다.

## 📦 추천 모델

M1 Pro 32GB에서 잘 작동하는 모델:

1. **Llama 2 7B Chat (Q4_K_M)** - 약 4GB
   - 균형잡힌 성능과 속도
   - 일반적인 대화에 적합

2. **Mistral 7B Instruct (Q4_K_M)** - 약 4GB
   - 우수한 성능
   - 지시사항 따르기에 특화

3. **Phi-2 (Q4_K_M)** - 약 2GB
   - 작고 빠름
   - 제한된 리소스에 적합

## 🔧 설정

### 백엔드 설정 (.env)

```env
MODEL_PATH=models/llama-2-7b-chat.Q4_K_M.gguf
HOST=0.0.0.0
PORT=8000
```

### 프론트엔드 설정

`.env` 파일을 생성하여 API URL을 설정할 수 있습니다:

```env
REACT_APP_API_URL=http://localhost:8000
```

## 📡 API 엔드포인트

### POST /chat

채팅 메시지를 전송합니다.

**Request:**
```json
{
  "message": "안녕하세요!",
  "max_tokens": 512,
  "temperature": 0.7,
  "top_p": 0.9
}
```

**Response:**
```json
{
  "response": "안녕하세요! 무엇을 도와드릴까요?",
  "tokens_used": 25
}
```

### GET /health

서버 상태를 확인합니다.

**Response:**
```json
{
  "status": "healthy",
  "model_loaded": true
}
```

## 🐛 문제 해결

### 모델 로딩 실패

- 모델 파일 경로가 올바른지 확인하세요
- 모델 파일이 완전히 다운로드되었는지 확인하세요
- `.env` 파일의 `MODEL_PATH`가 올바른지 확인하세요

### Metal GPU 가속이 작동하지 않음

- `CMAKE_ARGS="-DLLAMA_METAL=on"` 옵션으로 llama-cpp-python을 재설치하세요
- `n_gpu_layers=1` 이상으로 설정되어 있는지 확인하세요

### 메모리 부족

- 더 작은 모델을 사용하세요 (예: Phi-2)
- `n_ctx` 값을 줄이세요 (기본값: 2048)
- 다른 애플리케이션을 종료하세요

## 📝 라이선스

이 프로젝트는 오픈소스입니다. 사용하는 LLM 모델의 라이선스를 확인하세요.

## 🙏 참고 자료

- [llama.cpp](https://github.com/ggerganov/llama.cpp)
- [llama-cpp-python](https://github.com/abetlen/llama-cpp-python)
- [FastAPI](https://fastapi.tiangolo.com/)
- [React](https://react.dev/)
