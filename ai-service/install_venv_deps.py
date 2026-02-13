#!/usr/bin/env python
# -*- coding: utf-8 -*-
import subprocess
import sys
import os

def run_cmd(cmd, venv_path):
    """在虚拟环境中运行命令"""
    if sys.platform == 'win32':
        pip_path = os.path.join(venv_path, 'Scripts', 'pip.exe')
    else:
        pip_path = os.path.join(venv_path, 'bin', 'pip')

    result = subprocess.run(
        [pip_path] + cmd,
        check=False
    )
    return result.returncode == 0

def install_dependencies(venv_path):
    """安装依赖"""
    print("Installing dependencies...")

    # 1. 升级 pip
    print("1. Upgrading pip...")
    run_cmd(['install', '--upgrade', 'pip'], venv_path)

    # 2. 安装 Web 框架
    print("2. Installing web framework...")
    run_cmd(['install', 'fastapi==0.109.0', 'uvicorn[standard]==0.27.0', 'python-multipart==0.0.6'], venv_path)

    # 3. 安装预编译的 PyTorch (CPU 版本)
    print("3. Installing PyTorch (pre-built CPU version)...")
    run_cmd(['install', 'torch==2.1.0', 'torchvision==0.16.0', '--index-url', 'https://download.pytorch.org/whl/cpu'], venv_path)

    # 4. 安装数据处理库
    print("4. Installing data processing libraries...")
    run_cmd(['install', 'numpy==1.26.0', 'pandas==2.1.0'], venv_path)

    # 5. 安装任务队列
    print("5. Installing task queue...")
    run_cmd(['install', 'celery==5.3.0', 'redis==5.0.0'], venv_path)

    # 6. 安装数据验证
    print("6. Installing data validation...")
    run_cmd(['install', 'pydantic==2.5.0', 'pydantic-settings==2.1.0'], venv_path)

    # 7. 安装 HTTP 客户端
    print("7. Installing HTTP client...")
    run_cmd(['install', 'httpx==0.26.0', 'aiofiles==23.2.0'], venv_path)

    # 8. 安装对象存储
    print("8. Installing object storage...")
    run_cmd(['install', 'minio==7.2.0'], venv_path)

    # 9. 安装日志和监控
    print("9. Installing logging and monitoring...")
    run_cmd(['install', 'python-json-logger==2.0.7', 'prometheus-client==0.19.0'], venv_path)

    # 10. 安装工具库
    print("10. Installing utilities...")
    run_cmd(['install', 'python-dotenv==1.0.0'], venv_path)

    # 11. 安装音频处理库
    print("11. Installing audio processing libraries...")
    run_cmd(['install', 'librosa==0.10.0', 'soundfile==0.12.0'], venv_path)

    # 12. 安装 Whisper (ASR)
    print("12. Installing OpenAI Whisper...")
    run_cmd(['install', 'openai-whisper==20231117'], venv_path)

    print("\n✓ All dependencies installed successfully!")

if __name__ == '__main__':
    venv_path = os.path.join(os.path.dirname(__file__), 'venv')
    install_dependencies(venv_path)
