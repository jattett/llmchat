"""
LLM 모델 다운로드 스크립트
M1 Pro MacBook에 최적화된 모델을 다운로드합니다.
"""
import os
import requests
from pathlib import Path

# 모델 다운로드 URL (Hugging Face에서 GGUF 형식 모델)
MODELS = {
    "llama-2-7b-chat": {
        "url": "https://huggingface.co/TheBloke/Llama-2-7B-Chat-GGUF/resolve/main/llama-2-7b-chat.Q4_K_M.gguf",
        "filename": "llama-2-7b-chat.Q4_K_M.gguf",
        "size": "~4GB",
        "description": "Llama 2 7B Chat 모델 (Q4_K_M 양자화)"
    },
    "mistral-7b": {
        "url": "https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.1-GGUF/resolve/main/mistral-7b-instruct-v0.1.Q4_K_M.gguf",
        "filename": "mistral-7b-instruct-v0.1.Q4_K_M.gguf",
        "size": "~4GB",
        "description": "Mistral 7B Instruct 모델 (Q4_K_M 양자화)"
    },
    "phi-2": {
        "url": "https://huggingface.co/TheBloke/phi-2-GGUF/resolve/main/phi-2.Q4_K_M.gguf",
        "filename": "phi-2.Q4_K_M.gguf",
        "size": "~2GB",
        "description": "Phi-2 모델 (Q4_K_M 양자화, 더 작고 빠름)"
    }
}

def download_file(url: str, filepath: Path, chunk_size: int = 8192):
    """파일 다운로드 (진행률 표시)"""
    response = requests.get(url, stream=True)
    total_size = int(response.headers.get('content-length', 0))
    
    with open(filepath, 'wb') as f:
        downloaded = 0
        for chunk in response.iter_content(chunk_size=chunk_size):
            if chunk:
                f.write(chunk)
                downloaded += len(chunk)
                if total_size > 0:
                    percent = (downloaded / total_size) * 100
                    print(f"\r다운로드 진행률: {percent:.1f}% ({downloaded / (1024*1024):.1f}MB / {total_size / (1024*1024):.1f}MB)", end="")
    
    print("\n다운로드 완료!")

def main():
    print("=" * 60)
    print("LLM 모델 다운로드 스크립트")
    print("=" * 60)
    print("\n사용 가능한 모델:")
    for i, (key, model) in enumerate(MODELS.items(), 1):
        print(f"{i}. {key}")
        print(f"   설명: {model['description']}")
        print(f"   크기: {model['size']}")
        print()
    
    choice = input("다운로드할 모델 번호를 선택하세요 (1-3): ").strip()
    
    try:
        model_key = list(MODELS.keys())[int(choice) - 1]
    except (ValueError, IndexError):
        print("잘못된 선택입니다.")
        return
    
    model_info = MODELS[model_key]
    models_dir = Path("models")
    models_dir.mkdir(exist_ok=True)
    
    filepath = models_dir / model_info["filename"]
    
    if filepath.exists():
        print(f"\n모델 파일이 이미 존재합니다: {filepath}")
        overwrite = input("덮어쓰시겠습니까? (y/n): ").strip().lower()
        if overwrite != 'y':
            print("다운로드를 취소했습니다.")
            return
    
    print(f"\n모델 다운로드 시작: {model_key}")
    print(f"URL: {model_info['url']}")
    print(f"저장 위치: {filepath}")
    print()
    
    try:
        download_file(model_info["url"], filepath)
        print(f"\n모델이 성공적으로 다운로드되었습니다!")
        print(f"경로: {filepath.absolute()}")
        print(f"\n.env 파일에 다음을 추가하세요:")
        print(f"MODEL_PATH={filepath}")
    except Exception as e:
        print(f"\n다운로드 중 오류 발생: {e}")

if __name__ == "__main__":
    main()
