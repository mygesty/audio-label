# Audio Label Pro

> 专业语音数据标注平台 - 支持团队协作、AI 辅助、实时同步

## 📋 项目简介

Audio Label Pro 是一个基于 Web 的语音数据标注平台，支持大规模语音数据的标注、审核和管理工作，为机器学习模型训练提供高质量标注数据。

### 核心功能

- **音频管理**: 支持批量上传、预览、文件夹管理
- **音频播放器**: 波形显示、变速播放、循环播放、快捷键控制
- **标注功能**: 时间区间选择、多层标注、文本转写、标签体系
- **AI 辅助**: 自动语音识别（ASR）、说话人分离、自动分段、智能标签推荐
- **热力图模块**: 标注密度、说话人分布、频谱热力图
- **实时协作**: 多人协作编辑、编辑锁定、协作者光标、评论系统
- **质量控制**: 审核流程、问题标记、质量评分
- **任务管理**: 任务创建、分配、进度跟踪、统计报表
- **数据导出**: 支持 JSON、CSV、TXT、SRT、VTT、XML 格式

## 🏗️ 项目架构

```
audio-label-pro/
├── frontend/          # Vue 3 前端应用
├── backend/           # NestJS 后端服务
├── ai-service/        # FastAPI AI 服务
├── docker/            # Docker 配置
├── docs/              # 项目文档
├── scripts/           # 脚本文件
└── .github/           # GitHub 配置
```

## 🛠️ 技术栈

### 前端
- **框架**: Vue 3 + TypeScript + Vite
- **状态管理**: Pinia
- **路由**: Vue Router
- **UI 组件**: Element Plus
- **样式**: Tailwind CSS
- **音频可视化**: WaveSurfer.js
- **图表**: ECharts
- **HTTP 客户端**: Axios
- **实时通信**: Socket.io Client

### 后端
- **框架**: NestJS + Fastify + TypeScript
- **ORM**: TypeORM
- **数据库**: PostgreSQL 16
- **缓存**: Redis 7
- **对象存储**: MinIO
- **实时通信**: Socket.io
- **任务队列**: Bull
- **认证**: JWT + Passport

### AI 服务
- **框架**: FastAPI + Python
- **深度学习**: PyTorch
- **语音识别**: OpenAI Whisper
- **说话人分离**: Pyannote.audio
- **音频处理**: Librosa
- **任务队列**: Celery

## 🚀 快速开始

### 前置要求

- Node.js >= 20.0.0
- Python >= 3.11
- Docker & Docker Compose (可选)

### 1. 克隆项目

```bash
git clone <repository-url>
cd audio-label-pro
```

### 2. 启动依赖服务（Docker）

```bash
npm run docker:up
```

这将启动以下服务：
- PostgreSQL (端口 5432)
- Redis (端口 6379)
- MinIO (端口 9000/9001)

### 3. 配置环境变量

#### 后端配置

```bash
cd backend
cp .env.example .env
# 编辑 .env 文件，配置数据库、Redis、MinIO 等连接信息
```

#### AI 服务配置

```bash
cd ai-service
cp .env.example .env
# 编辑 .env 文件，配置 Redis、MinIO 等连接信息
```

### 4. 安装依赖

```bash
# 安装所有依赖
npm run install:all

# 或分别安装
npm install
cd frontend && npm install
cd ../backend && npm install
cd ../ai-service && pip install -r requirements.txt
```

### 5. 启动开发服务器

#### 方式一：同时启动前后端

```bash
npm run dev
```

#### 方式二：分别启动

```bash
# 终端 1: 启动后端
npm run dev:backend

# 终端 2: 启动前端
npm run dev:frontend

# 终端 3: 启动 AI 服务
npm run dev:ai
```

### 6. 访问应用

- 前端: http://localhost:5173
- 后端 API: http://localhost:3000/api
- AI 服务: http://localhost:8000
- MinIO 控制台: http://localhost:9001

## 📦 项目脚本

| 命令 | 描述 |
|------|------|
| `npm run dev` | 同时启动前后端开发服务器 |
| `npm run dev:frontend` | 启动前端开发服务器 |
| `npm run dev:backend` | 启动后端开发服务器 |
| `npm run dev:ai` | 启动 AI 服务 |
| `npm run build` | 构建前后端项目 |
| `npm run docker:up` | 启动 Docker 服务 |
| `npm run docker:down` | 停止 Docker 服务 |
| `npm run clean` | 清理 node_modules 和构建产物 |

## 📚 文档

- [需求文档](./docs/requirements.md)
- [技术方案](./docs/technical-specification.md)
- [设计系统](./docs/design-system.md)
- [组件设计](./docs/component-design/)

## 🔐 环境变量说明

### 后端 (.env)

```env
# Application
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=audio_label

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=7d

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=audio-label

# AI Service
AI_SERVICE_URL=http://localhost:8000
```

### AI 服务 (.env)

```env
# Application
DEBUG=True
PORT=8000

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=audio-label

# AI Models
WHISPER_MODEL=base
WHISPER_DEVICE=cpu
```

## 🎨 设计系统

本项目采用极简主义 + 瑞士风格设计：

- **主色调**: #059669 (成功绿)
- **辅助色**: #10B981 (浅绿)
- **强调色**: #F97316 (紧急橙)
- **背景色**: #ECFDF5 (浅绿背景)
- **文本色**: #064E3B (深绿文本)
- **字体**: Poppins (主要)、Open Sans (次要)

详见 [设计系统文档](./docs/design-system.md)

## 🧪 测试

```bash
# 前端测试
cd frontend
npm run test

# 后端测试
cd backend
npm run test

# E2E 测试
npm run test:e2e
```

## 🚢 部署

### Docker 部署

```bash
# 构建镜像
docker-compose build

# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f
```

### 生产环境配置

1. 设置 `NODE_ENV=production`
2. 使用生产数据库
3. 配置 HTTPS
4. 设置 CORS 白名单
5. 使用强 JWT 密钥

## 📄 许可证

MIT License

## 👥 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 [GitHub Issue](../../issues)
- 发送邮件至: support@audiolabelpro.com

---

**Audio Label Pro** - 让语音标注更高效！