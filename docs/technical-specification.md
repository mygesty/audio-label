# 语音标注工具 - 详细技术方案

## 目录

1. [技术栈选型](#技术栈选型)
2. [系统架构设计](#系统架构设计)
3. [数据库设计](#数据库设计)
4. [API 接口设计](#api-接口设计)
5. [实时协作方案](#实时协作方案)
6. [AI 服务设计](#ai-服务设计)
7. [前端架构设计](#前端架构设计)
8. [性能优化方案](#性能优化方案)
9. [安全方案](#安全方案)
10. [部署方案](#部署方案)
11. [开发计划](#开发计划)
12. [风险与应对](#风险与应对)
13. [长音频场景优化方案](#长音频场景优化方案)

---

## 技术栈选型

### 前端技术栈

| 技术 | 版本 | 用途 | 理由 |
|------|------|------|------|
| Vue 3 | 3.4+ | 核心框架 | Composition API、响应式系统优秀 |
| TypeScript | 5.3+ | 类型系统 | 类型安全、开发体验好 |
| Vite | 5.0+ | 构建工具 | 极速热更新、原生 ESM |
| Pinia | 2.1+ | 状态管理 | Vue 3 官方推荐、轻量 |
| Vue Router | 4.2+ | 路由管理 | 官方路由方案 |
| VueUse | 10.7+ | 工具库 | 组合式工具函数库 |
| WaveSurfer.js | 7.7+ | 波形可视化 | 音频波形渲染 |
| Socket.io Client | 4.6+ | 实时通信 | WebSocket 封装 |
| Axios | 1.6+ | HTTP 客户端 | 请求拦截、错误处理 |
| TanStack Vue Query | 5.17+ | 数据请求 | 缓存、状态同步 |
| Element Plus | 2.5+ | UI 组件库 | 企业级组件、中文友好 |
| Tailwind CSS | 3.4+ | CSS 框架 | 原子化 CSS、快速开发 |
| ECharts | 5.4+ | 图表可视化 | 热力图、统计图表 |
| Day.js | 1.11+ | 日期处理 | 轻量级日期库 |
| lru-cache | 10.0+ | LRU 缓存 | 前端缓存管理 |

**前端技术栈补充说明**：
- **UI 框架备选**：Ant Design Vue、Naive UI
- **富文本编辑器**：Tiptap（基于 ProseMirror）
- **拖拽组件**：Vue-Draggable Plus
- **文件上传**：Vue-Upload-Component

**完整依赖列表（package.json）：**

```json
{
  "name": "audio-label-frontend",
  "version": "1.0.0",
  "dependencies": {
    "vue": "^3.4.0",
    "vue-router": "^4.2.0",
    "pinia": "^2.1.0",
    "axios": "^1.6.0",
    "socket.io-client": "^4.6.0",
    "@tanstack/vue-query": "^5.17.0",
    "vueuse": "^10.7.0",
    "dayjs": "^1.11.0",
    "lru-cache": "^10.0.0",
    "wavesurfer.js": "^7.7.0",
    "echarts": "^5.4.0",
    "element-plus": "^2.5.0",
    "vue-virtual-scroller": "^2.0.0",
    "tiptap": "^2.1.0",
    "@tiptap/starter-kit": "^2.1.0",
    "vue-draggable-plus": "^0.3.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "vite": "^5.0.0",
    "typescript": "^5.3.0",
    "vue-tsc": "^1.8.0",
    "@types/node": "^20.10.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "@typescript-eslint/eslint-plugin": "^6.15.0",
    "@typescript-eslint/parser": "^6.15.0",
    "eslint": "^8.56.0",
    "eslint-plugin-vue": "^9.19.0",
    "prettier": "^3.1.0"
  }
}
```

**依赖分类说明：**

| 分类 | 依赖 | 用途 |
|------|------|------|
| **核心框架** | vue, vue-router, pinia | Vue 3 生态系统 |
| **HTTP & WebSocket** | axios, socket.io-client | 网络通信 |
| **状态管理 & 数据** | @tanstack/vue-query, vueuse | 状态和数据管理 |
| **工具库** | dayjs, lru-cache | 日期处理、缓存 |
| **可视化** | wavesurfer.js, echarts | 波形、图表 |
| **UI 组件** | element-plus | 企业级 UI |
| **编辑器** | tiptap, @tiptap/starter-kit | 富文本编辑 |
| **性能优化** | vue-virtual-scroller | 虚拟滚动 |
| **交互增强** | vue-draggable-plus | 拖拽功能 |
| **开发工具** | vite, typescript, tailwindcss | 构建和开发 |

---

### 后端技术栈

| 技术 | 版本 | 用途 | 理由 |
|------|------|------|------|
| Node.js | 20 LTS | 运行时 | LTS 版本、性能稳定 |
| NestJS | 10.3+ | 应用框架 | 模块化架构、依赖注入、TypeScript 原生支持 |
| Fastify | 4.25+ | HTTP 服务器 | 高性能、低开销、插件生态 |
| TypeORM | 0.3+ | ORM | TypeScript 友好、支持多种数据库 |
| PostgreSQL | 16+ | 关系数据库 | JSON 支持、全文搜索、性能优秀 |
| Redis | 7.2+ | 缓存/队列 | 高性能、支持数据结构 |
| Socket.io | 4.6+ | 实时通信 | 房间管理、自动重连 |
| Bull | 4.12+ | 任务队列 | 基于 Redis 的队列系统 |
| MinIO | RELEASE.2024-01-16+ | 对象存储 | S3 兼容、自托管 |
| JWT | - | 认证 | 无状态认证 |
| Passport | 0.7+ | 认证中间件 | 认证策略可插拔 |
| Class Validator | 0.14+ | 参数验证 | 装饰器式验证 |
| Winston | 3.11+ | 日志管理 | 结构化日志、多传输 |
| audio-decode | 1.0+ | 音频解码 | Node.js 端音频解码 |

**NestJS + Fastify 优势**：
- NestJS 的模块化架构与 Fastify 的高性能结合
- 依赖注入、装饰器、中间件等企业级特性
- 性能比 Express 高 20-30%
- 天然支持 TypeScript

**后端完整依赖列表（package.json）：**

```json
{
  "name": "audio-label-backend",
  "version": "1.0.0",
  "dependencies": {
    "@nestjs/common": "^10.3.0",
    "@nestjs/core": "^10.3.0",
    "@nestjs/platform-fastify": "^10.3.0",
    "@nestjs/typeorm": "^10.0.0",
    "@nestjs/jwt": "^10.2.0",
    "@nestjs/passport": "^10.0.0",
    "@nestjs/websockets": "^10.3.0",
    "@nestjs/platform-socket.io": "^10.3.0",
    "@nestjs/config": "^3.1.0",
    "@nestjs/schedule": "^4.0.0",
    "@nestjs/bull": "^10.1.0",
    "typeorm": "^0.3.17",
    "pg": "^8.11.0",
    "redis": "^4.6.0",
    "socket.io": "^4.6.0",
    "bull": "^4.12.0",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "bcrypt": "^5.1.1",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1",
    "winston": "^3.11.0",
    "minio": "^7.1.0",
    "audio-decode": "^1.0.0",
    "pako": "^2.1.0",
    "ioredis": "^5.3.0"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.3.0",
    "@nestjs/schematics": "^10.1.0",
    "@nestjs/testing": "^10.3.0",
    "@types/express": "^4.17.0",
    "@types/jest": "^29.5.0",
    "@types/node": "^20.10.0",
    "@types/passport-jwt": "^4.0.0",
    "@types/bcrypt": "^5.0.0",
    "typescript": "^5.3.0",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.0",
    "ts-loader": "^9.5.0",
    "ts-node": "^10.9.0",
    "eslint": "^8.56.0",
    "prettier": "^3.1.0"
  }
}
```

**后端依赖分类说明：**

| 分类 | 依赖 | 用途 |
|------|------|------|
| **NestJS 核心** | @nestjs/* | NestJS 框架核心模块 |
| **数据库** | typeorm, pg, ioredis | PostgreSQL 和 Redis 连接 |
| **实时通信** | @nestjs/websockets, socket.io | WebSocket 支持 |
| **任务队列** | @nestjs/bull, bull | 异步任务处理 |
| **认证授权** | @nestjs/jwt, passport, passport-jwt | JWT 认证 |
| **验证转换** | class-validator, class-transformer | 数据验证和转换 |
| **日志管理** | winston | 结构化日志 |
| **对象存储** | minio | S3 兼容存储 |
| **音频处理** | audio-decode | Node.js 音频解码 |
| **数据压缩** | pako | 数据压缩 |
| **密码加密** | bcrypt | 密码哈希 |

---

### AI 服务技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Python | 3.11+ | 主语言 |
| FastAPI | 0.109+ | Web 框架 |
| PyTorch | 2.1+ | 深度学习框架 |
| Whisper (OpenAI) | 20231117 | ASR 语音识别 |
| Pyannote.audio | 3.1+ | 说话人分离 |
| Librosa | 0.10+ | 音频处理 |
| NumPy | 1.26+ | 数值计算 |
| Celery | 5.3+ | 异步任务队列 |
| Redis | 7.2+ | 消息代理 |
| Pydantic | 2.5+ | 数据验证 |

**AI 服务完整依赖列表（requirements.txt）：**

```txt
# Web 框架
fastapi==0.109.0
uvicorn[standard]==0.27.0
python-multipart==0.0.6

# 深度学习
torch==2.1.0
torchvision==0.16.0

# ASR 和语音处理
openai-whisper==20231117
pyannote.audio==3.1.0
librosa==0.10.0
soundfile==0.12.0

# 数据处理
numpy==1.26.0
pandas==2.1.0

# 任务队列
celery==5.3.0
redis==5.0.0

# 数据验证
pydantic==2.5.0
pydantic-settings==2.1.0

# HTTP 客户端
httpx==0.26.0
aiofiles==23.2.0

# 对象存储
minio==7.2.0

# 日志
python-json-logger==2.0.7

# 监控
prometheus-client==0.19.0

# 工具库
python-dotenv==1.0.0
```

**AI 服务依赖分类说明：**

| 分类 | 依赖 | 用途 |
|------|------|------|
| **Web 框架** | fastapi, uvicorn | ASGI 服务器和 Web 框架 |
| **深度学习** | torch, torchvision | PyTorch 深度学习框架 |
| **ASR 和语音处理** | openai-whisper, pyannote.audio, librosa | 语音识别和处理 |
| **数据处理** | numpy, pandas | 数值计算和数据处理 |
| **任务队列** | celery, redis | 异步任务处理 |
| **数据验证** | pydantic, pydantic-settings | 数据验证和配置管理 |
| **HTTP 客户端** | httpx, aiofiles | 异步 HTTP 请求 |
| **对象存储** | minio | S3 兼容存储客户端 |
| **日志** | python-json-logger | 结构化 JSON 日志 |
| **监控** | prometheus-client | Prometheus 指标导出 |
| **工具库** | python-dotenv | 环境变量管理 |

**AI 模型选择**：

| 模型 | 大小 | 准确率 | 速度 | 推荐场景 |
|------|------|--------|------|----------|
| Whisper Tiny | 39MB | 中 | 极快 | 快速预览 |
| Whisper Base | 74MB | 中高 | 快 | 一般场景 |
| Whisper Small | 244MB | 高 | 中 | 标准场景 |
| Whisper Medium | 769MB | 很高 | 慢 | 高质量场景 |
| Whisper Large-v3 | 1550MB | 最高 | 很慢 | 精确场景 |

---

## 系统架构设计

### 整体架构图

```
┌─────────────────────────────────────────────────────────────────────┐
│                           客户端层 (Web)                             │
│  Vue 3 + TypeScript + Vite + WaveSurfer.js + Socket.io Client      │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ HTTPS/WSS
┌─────────────────────────────────────────────────────────────────────┐
│                           负载均衡层 (Nginx)                         │
│                    SSL 终止、静态资源、反向代理                       │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                ┌───────────────────┼───────────────────┐
                ▼                   ▼                   ▼
┌───────────────────────┐ ┌───────────────────────┐ ┌───────────────────────┐
│    后端服务集群        │ │   AI 服务集群          │ │   WebSocket 集群      │
│   NestJS + Fastify    │ │   Python + FastAPI    │ │   Socket.io           │
│   (多实例)            │ │   (多实例)            │ │   (Redis Adapter)     │
└───────────────────────┘ └───────────────────────┘ └───────────────────────┘
                │                   │                   │
                └───────────────────┼───────────────────┘
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                           数据层                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │ PostgreSQL  │  │    Redis    │  │  MinIO / S3 │  │  Bull 队列   │ │
│  │  主数据      │  │  缓存/锁     │  │  音频存储    │  │  任务队列    │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### 微服务划分

```
audio-label-system/
├── auth-service          # 认证服务（JWT、OAuth）
├── user-service          # 用户服务（用户、角色、权限）
├── project-service       # 项目服务（项目、团队）
├── audio-service         # 音频服务（上传、元数据）
├── annotation-service    # 标注服务（CRUD、层管理）
├── ai-service            # AI 服务（ASR、说话人分离）
├── collaboration-service # 协作服务（实时同步、锁）
├── task-service          # 任务服务（分配、进度）
├── export-service        # 导出服务（多格式导出）
└── notification-service  # 通知服务（消息推送）
```

---

## 数据库设计

### 核心表结构

#### 1. 用户表 (users)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(500),
  role VARCHAR(50) NOT NULL, -- 'annotator', 'reviewer', 'project_admin', 'system_admin'
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'inactive', 'suspended'
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
```

#### 2. 团队表 (teams)

```sql
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES users(id),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_teams_owner ON teams(owner_id);
```

#### 3. 团队成员表 (team_members)

```sql
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL, -- 'member', 'admin'
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(team_id, user_id)
);

CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_team_members_user ON team_members(user_id);
```

#### 4. 项目表 (projects)

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  settings JSONB DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'archived', 'deleted'
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_projects_team ON projects(team_id);
CREATE INDEX idx_projects_status ON projects(status);
```

#### 5. 音频文件表 (audio_files)

```sql
CREATE TABLE audio_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  storage_path VARCHAR(1000) NOT NULL, -- 文件存储路径，如：'会议记录/2024/Q1/会议001.mp3'
  file_size BIGINT NOT NULL,
  format VARCHAR(50) NOT NULL, -- 'mp3', 'wav', 'flac', etc.
  duration DECIMAL(10,3), -- 时长（秒）
  sample_rate INTEGER, -- 采样率
  channels INTEGER, -- 声道数
  metadata JSONB DEFAULT '{}', -- 额外元数据
  storage_key VARCHAR(500) NOT NULL, -- MinIO 存储键
  upload_status VARCHAR(50) DEFAULT 'completed', -- 'uploading', 'completed', 'failed'
  ai_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_audio_files_project ON audio_files(project_id);
CREATE INDEX idx_audio_files_path ON audio_files(project_id, storage_path); -- 用于路径查询
CREATE INDEX idx_audio_files_status ON audio_files(ai_status);
CREATE INDEX idx_audio_files_created ON audio_files(created_at DESC);
```

**说明**：
- 移除了 `folder_id` 字段，音频不再与文件夹表关联
- 添加了 `storage_path` 字段，用于存储文件在项目中的虚拟路径
- 前端根据 `storage_path` 字段构建虚拟文件夹树
- 支持多级路径嵌套，路径分隔符为 `/`
- 例如：`storage_path = '会议记录/2024/Q1/会议001.mp3'`

#### 6. 标注表 (annotations)

```sql
CREATE TABLE annotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audio_id UUID NOT NULL REFERENCES audio_files(id) ON DELETE CASCADE,
  layer_id UUID REFERENCES annotation_layers(id) ON DELETE SET NULL,
  speaker_id UUID REFERENCES speakers(id) ON DELETE SET NULL,
  start_time DECIMAL(10,3) NOT NULL, -- 开始时间（秒）
  end_time DECIMAL(10,3) NOT NULL, -- 结束时间（秒）
  text TEXT, -- 转写文本
  text_raw TEXT, -- 原始 AI 转写文本
  confidence DECIMAL(5,2), -- AI 置信度
  is_manual BOOLEAN DEFAULT false, -- 是否人工标注
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'submitted', 'approved', 'rejected'
  metadata JSONB DEFAULT '{}', -- 额外信息
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_annotations_audio ON annotations(audio_id);
CREATE INDEX idx_annotations_layer ON annotations(layer_id);
CREATE INDEX idx_annotations_speaker ON annotations(speaker_id);
CREATE INDEX idx_annotations_time ON annotations(audio_id, start_time);
CREATE INDEX idx_annotations_status ON annotations(status);
```

#### 8. 标注层表 (annotation_layers)

```sql
CREATE TABLE annotation_layers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audio_id UUID NOT NULL REFERENCES audio_files(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'transcript', 'speaker', 'emotion', 'event', 'noise'
  color VARCHAR(7) NOT NULL, -- HEX 颜色
  is_visible BOOLEAN DEFAULT true,
  is_locked BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_layers_audio ON annotation_layers(audio_id);
```

#### 9. 说话人表 (speakers)

```sql
CREATE TABLE speakers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) NOT NULL,
  gender VARCHAR(50), -- 'male', 'female', 'unknown'
  age_range VARCHAR(50),
  description TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_speakers_project ON speakers(project_id);
```

#### 10. 标签表 (tags)

```sql
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'emotion', 'scene', 'custom'
  color VARCHAR(7),
  description TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tags_project ON tags(project_id);
CREATE INDEX idx_tags_parent ON tags(parent_id);
CREATE INDEX idx_tags_type ON tags(type);
```

#### 11. 标注标签关联表 (annotation_tags)

```sql
CREATE TABLE annotation_tags (
  annotation_id UUID NOT NULL REFERENCES annotations(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  confidence DECIMAL(5,2), -- AI 推荐置信度
  is_suggested BOOLEAN DEFAULT false, -- 是否 AI 推荐
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(annotation_id, tag_id)
);

CREATE INDEX idx_annotation_tags_annotation ON annotation_tags(annotation_id);
CREATE INDEX idx_annotation_tags_tag ON annotation_tags(tag_id);
```

#### 12. 评论表 (comments)

```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  annotation_id UUID REFERENCES annotations(id) ON DELETE CASCADE,
  audio_id UUID NOT NULL REFERENCES audio_files(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  start_time DECIMAL(10,3), -- 评论时间点
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_comments_annotation ON comments(annotation_id);
CREATE INDEX idx_comments_audio ON comments(audio_id);
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_comments_parent ON comments(parent_id);
```

#### 13. 版本历史表 (annotation_versions)

```sql
CREATE TABLE annotation_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  annotation_id UUID NOT NULL REFERENCES annotations(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  data JSONB NOT NULL, -- 版本数据快照
  change_description TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_versions_annotation ON annotation_versions(annotation_id);
CREATE INDEX idx_versions_number ON annotation_versions(annotation_id, version_number);
```

#### 14. 任务表 (tasks)

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  audio_ids UUID[] NOT NULL, -- 音频文件 ID 数组
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'submitted', 'reviewing', 'approved', 'rejected', 'completed'
  priority VARCHAR(50) DEFAULT 'medium', -- 'low', 'medium', 'high'
  due_date TIMESTAMP,
  progress DECIMAL(5,2) DEFAULT 0, -- 完成进度百分比
  estimated_hours DECIMAL(5,2),
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due ON tasks(due_date);
```

#### 15. 通知表 (notifications)

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'comment', 'mention', 'task_assigned', 'task_completed', 'version_change'
  title VARCHAR(255) NOT NULL,
  content TEXT,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
```

#### 16. AI 处理任务表 (ai_jobs)

```sql
CREATE TABLE ai_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audio_id UUID NOT NULL REFERENCES audio_files(id) ON DELETE CASCADE,
  job_type VARCHAR(50) NOT NULL, -- 'asr', 'speaker_diarization', 'segmentation', 'noise_detection'
  model_name VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  result_summary JSONB, -- 处理结果摘要（用于快速查询）
  error_message TEXT,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_jobs_audio ON ai_jobs(audio_id);
CREATE INDEX idx_ai_jobs_status ON ai_jobs(status);
CREATE INDEX idx_ai_jobs_type ON ai_jobs(job_type);
```

**说明**：完整处理结果存储在 `ai_result_chunks` 表中，`result_summary` 仅存储统计信息（如总段数、识别语言等），避免数据冗余。

#### 17. AI 任务进度表 (ai_job_progress)

```sql
CREATE TABLE ai_job_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES ai_jobs(id) ON DELETE CASCADE,
  stage VARCHAR(50) NOT NULL, -- 'downloading', 'segmentation', 'asr', 'diarization', 'postprocessing'
  current_segment INTEGER DEFAULT 0,
  total_segments INTEGER DEFAULT 0,
  stage_progress DECIMAL(5,2) DEFAULT 0, -- 当前阶段进度 0-100
  overall_progress DECIMAL(5,2) DEFAULT 0, -- 总体进度 0-100
  estimated_time_remaining INTEGER, -- 预计剩余时间（秒）
  current_operation TEXT, -- 当前操作描述
  metadata JSONB DEFAULT '{}',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(job_id, stage)
);

CREATE INDEX idx_job_progress_job ON ai_job_progress(job_id);
CREATE INDEX idx_job_progress_stage ON ai_job_progress(job_id, stage);
```

#### 18. AI 结果分片表 (ai_result_chunks)

```sql
CREATE TABLE ai_result_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES ai_jobs(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  chunk_type VARCHAR(50) NOT NULL, -- 'segment', 'transcript', 'speaker'
  start_time DECIMAL(10,3) NOT NULL,
  end_time DECIMAL(10,3) NOT NULL,
  data JSONB NOT NULL, -- 分片数据
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(job_id, chunk_index)
);

CREATE INDEX idx_result_chunks_job ON ai_result_chunks(job_id);
CREATE INDEX idx_result_chunks_index ON ai_result_chunks(job_id, chunk_index);
```

#### 19. 音频分段表 (audio_segments)

```sql
CREATE TABLE audio_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audio_id UUID NOT NULL REFERENCES audio_files(id) ON DELETE CASCADE,
  segment_index INTEGER NOT NULL,
  start_time DECIMAL(10,3) NOT NULL,
  end_time DECIMAL(10,3) NOT NULL,
  duration DECIMAL(10,3) NOT NULL,
  silence_score DECIMAL(5,2) DEFAULT 0, -- 静音评分 0-100
  speaker_change BOOLEAN DEFAULT false,
  has_music BOOLEAN DEFAULT false,
  summary TEXT, -- AI 生成的分段摘要
  metadata JSONB DEFAULT '{}',
  UNIQUE(audio_id, segment_index)
);

CREATE INDEX idx_segments_audio ON audio_segments(audio_id);
CREATE INDEX idx_segments_index ON audio_segments(audio_id, segment_index);
CREATE INDEX idx_segments_time ON audio_segments(audio_id, start_time);
```

#### 20. 分段导航目录表 (segment_navigation)

```sql
CREATE TABLE segment_navigation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audio_id UUID NOT NULL REFERENCES audio_files(id) ON DELETE CASCADE,
  segment_id UUID NOT NULL REFERENCES audio_segments(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES segment_navigation(id) ON DELETE CASCADE,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_nav_audio ON segment_navigation(audio_id);
CREATE INDEX idx_nav_parent ON segment_navigation(parent_id);
```

#### 21. 分段书签表 (segment_bookmarks)

```sql
CREATE TABLE segment_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audio_id UUID NOT NULL REFERENCES audio_files(id) ON DELETE CASCADE,
  segment_id UUID REFERENCES audio_segments(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  time_position DECIMAL(10,3) NOT NULL,
  title VARCHAR(255) NOT NULL,
  note TEXT,
  color VARCHAR(7),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bookmarks_audio ON segment_bookmarks(audio_id);
CREATE INDEX idx_bookmarks_user ON segment_bookmarks(user_id);
```

#### 22. 波形缓存表 (waveform_cache)

```sql
CREATE TABLE waveform_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audio_id UUID NOT NULL REFERENCES audio_files(id) ON DELETE CASCADE,
  zoom_level VARCHAR(20) NOT NULL, -- 'overview', 'detail', 'zoom'
  segment_start INTEGER NOT NULL, -- 块起始索引
  segment_size INTEGER NOT NULL, -- 块大小（像素数）
  data BYTEA NOT NULL, -- 压缩的波形数据（使用 pako 或 lz4）
  samples_per_pixel DECIMAL(10,2) NOT NULL, -- 每像素对应的采样数
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(audio_id, zoom_level, segment_start)
);

CREATE INDEX idx_waveform_audio ON waveform_cache(audio_id);
CREATE INDEX idx_waveform_level ON waveform_cache(audio_id, zoom_level);
```

#### 17. 会话表 (sessions)

```sql
CREATE TABLE sessions (
  id VARCHAR(255) PRIMARY KEY, -- Session ID
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);
```

---

### 数据生命周期管理

#### 数据清理策略

为了防止数据无限增长，系统采用分层清理策略：

| 数据类型 | 保留期限 | 清理频率 | 清理方式 | 归档策略 |
|---------|----------|----------|----------|----------|
| 会话数据 | 30天 | 每日 | 自动删除 | - |
| 通知数据 | 90天 | 每周 | 自动删除 | - |
| AI 结果分片 | 30天 | 每日 | 自动删除 | 可选归档 |
| AI 任务进度 | 7天 | 每日 | 自动删除 | - |
| 版本历史 | 90天 | 每周 | 自动删除 | 可选归档 |
| 波形缓存 | 永久 | 按需 | 手动清理 | - |
| 分段数据 | 永久 | - | 不清理 | - |
| 核心业务数据 | 永久 | - | 不清理 | - |

#### 自动清理任务

**清理任务表：**

```sql
CREATE TABLE cleanup_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  records_deleted INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cleanup_tasks_type ON cleanup_tasks(task_type);
CREATE INDEX idx_cleanup_tasks_status ON cleanup_tasks(status);
CREATE INDEX idx_cleanup_tasks_created ON cleanup_tasks(created_at DESC);
```

**清理存储过程：**

```sql
-- 清理会话数据（30天前）
CREATE OR REPLACE FUNCTION cleanup_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM sessions
  WHERE expires_at < NOW() - INTERVAL '30 days';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 清理AI结果分片（30天前）
CREATE OR REPLACE FUNCTION cleanup_ai_result_chunks()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM ai_result_chunks
  WHERE created_at < NOW() - INTERVAL '30 days';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 清理AI任务进度（7天前）
CREATE OR REPLACE FUNCTION cleanup_ai_job_progress()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM ai_job_progress
  WHERE updated_at < NOW() - INTERVAL '7 days';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 清理通知数据（90天前）
CREATE OR REPLACE FUNCTION cleanup_notifications()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM notifications
  WHERE created_at < NOW() - INTERVAL '90 days';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 清理版本历史（90天前）
CREATE OR REPLACE FUNCTION cleanup_annotation_versions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM annotation_versions
  WHERE created_at < NOW() - INTERVAL '90 days';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;
```

**清理任务调度器（NestJS）：**

```typescript
@Injectable()
export class CleanupScheduler {
  private readonly logger = new Logger(CleanupScheduler.name);

  constructor(
    private dataSource: DataSource,
    private cleanupTasksRepo: Repository<CleanupTask>
  ) {}

  @Cron('0 2 * * *') // 每天凌晨2点执行
  async cleanupSessions() {
    await this.executeCleanup('cleanup_sessions', 'sessions');
  }

  @Cron('0 3 * * 0') // 每周日凌晨3点执行
  async cleanupNotifications() {
    await this.executeCleanup('cleanup_notifications', 'notifications');
  }

  @Cron('0 4 * * 0') // 每周日凌晨4点执行
  async cleanupAnnotationVersions() {
    await this.executeCleanup('cleanup_annotation_versions', 'annotation_versions');
  }

  @Cron('0 1 * * *') // 每天凌晨1点执行
  async cleanupAIResults() {
    await this.executeCleanup('cleanup_ai_result_chunks', 'ai_result_chunks');
    await this.executeCleanup('cleanup_ai_job_progress', 'ai_job_progress');
  }

  private async executeCleanup(functionName: string, taskType: string) {
    const task = this.cleanupTasksRepo.create({
      task_type: taskType,
      status: 'running',
      started_at: new Date()
    });
    await this.cleanupTasksRepo.save(task);

    try {
      const result = await this.dataSource.query(
        `SELECT ${functionName}() as deleted_count`
      );

      const deletedCount = result[0].deleted_count;

      await this.cleanupTasksRepo.save({
        ...task,
        status: 'completed',
        completed_at: new Date(),
        records_deleted: deletedCount
      });

      this.logger.log(`Cleanup task ${taskType} completed. Deleted ${deletedCount} records.`);

    } catch (error) {
      await this.cleanupTasksRepo.save({
        ...task,
        status: 'failed',
        completed_at: new Date(),
        error_message: error.message
      });

      this.logger.error(`Cleanup task ${taskType} failed:`, error);
    }
  }

  // 手动触发清理（管理后台）
  async triggerCleanup(taskType: string): Promise<{ success: boolean; deletedCount: number }> {
    const functionMap: Record<string, string> = {
      'sessions': 'cleanup_sessions',
      'notifications': 'cleanup_notifications',
      'annotation_versions': 'cleanup_annotation_versions',
      'ai_result_chunks': 'cleanup_ai_result_chunks',
      'ai_job_progress': 'cleanup_ai_job_progress'
    };

    const functionName = functionMap[taskType];
    if (!functionName) {
      throw new Error(`Unknown cleanup task type: ${taskType}`);
    }

    const result = await this.executeCleanup(functionName, taskType);
    return { success: result.status === 'completed', deletedCount: result.records_deleted };
  }
}
```

#### 数据归档策略

对于需要长期保存但不再频繁访问的数据，可以启用归档功能：

**归档表定义：**

```sql
-- 归档表（结构与原表相同）
CREATE TABLE annotation_versions_archive (
  LIKE annotation_versions INCLUDING ALL
);

CREATE INDEX idx_archive_annotation ON annotation_versions_archive(annotation_id);
CREATE INDEX idx_archive_created ON annotation_versions_archive(created_at DESC);

CREATE TABLE ai_result_chunks_archive (
  LIKE ai_result_chunks INCLUDING ALL
);

CREATE INDEX idx_archive_job ON ai_result_chunks_archive(job_id);
CREATE INDEX idx_archive_created ON ai_result_chunks_archive(created_at DESC);
```

**归档任务：**

```sql
-- 归档版本历史数据
CREATE OR REPLACE FUNCTION archive_annotation_versions()
RETURNS INTEGER AS $$
DECLARE
  archived_count INTEGER;
BEGIN
  -- 复制数据到归档表
  INSERT INTO annotation_versions_archive
  SELECT * FROM annotation_versions
  WHERE created_at < NOW() - INTERVAL '90 days';

  GET DIAGNOSTICS archived_count = ROW_COUNT;

  -- 删除原表数据
  DELETE FROM annotation_versions
  WHERE created_at < NOW() - INTERVAL '90 days';

  RETURN archived_count;
END;
$$ LANGUAGE plpgsql;
```

#### 手动清理 API

```
POST   /api/v1/admin/cleanup/{taskType}       # 手动触发清理任务
GET    /api/v1/admin/cleanup/history          # 查看清理历史
```

**权限要求：** 仅 system_admin 角色可访问

#### 数据清理监控

**清理任务统计 API：**

```
GET    /api/v1/admin/cleanup/stats           # 获取清理统计信息
```

**响应示例：**

```json
{
  "success": true,
  "data": {
    "sessions": {
      "totalRecords": 1500000,
      "recordsToClean": 50000,
      "lastCleanupAt": "2026-02-13T02:00:00Z",
      "nextCleanupAt": "2026-02-14T02:00:00Z"
    },
    "ai_result_chunks": {
      "totalRecords": 500000,
      "recordsToClean": 20000,
      "lastCleanupAt": "2026-02-13T01:00:00Z",
      "nextCleanupAt": "2026-02-14T01:00:00Z"
    },
    "diskUsage": {
      "total": "500 GB",
      "used": "300 GB",
      "free": "200 GB"
    }
  }
}
```

---

## API 接口设计

### RESTful API 规范

#### 基础规范

| 规范 | 说明 |
|------|------|
| 基础路径 | `/api/v1` |
| 认证方式 | Bearer Token (JWT) |
| 数据格式 | JSON |
| 分页 | `?page=1&limit=20` |
| 排序 | `?sort=created_at&order=desc` |
| 过滤 | `?status=active&role=admin` |
| 响应格式 | `{ success: boolean, data: any, message?: string }` |

**API 版本策略：**

| 版本 | 用途 | 向后兼容 | 主要特性 |
|------|------|----------|----------|
| `/api/v1` | 基础功能 | 保证 | 用户认证、项目管理、音频上传、基础标注、AI 处理 |
| `/api/v2` | 长音频优化 | 保证 | 音频分块、多级波形、流式 AI 推送、时间范围标注加载 |

**说明：**
- `/api/v1` 保持完全向后兼容，现有客户端无需修改
- `/api/v2` 提供针对长音频场景的优化功能，新客户端优先使用
- 两个版本共享相同的认证和基础架构
- `/api/v2` 的所有端点也遵循统一的响应格式规范

#### 响应状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 204 | 无内容（删除成功） |
| 400 | 请求参数错误 |
| 401 | 未认证 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 409 | 资源冲突 |
| 422 | 验证失败 |
| 429 | 请求过多 |
| 500 | 服务器错误 |

#### 标准响应格式

**基础响应（单一资源或操作结果）**

```typescript
interface StandardResponse<T = any> {
  success: boolean;           // 请求是否成功
  data: T;                    // 响应数据
  message?: string;           // 可选的消息或错误描述
  timestamp: string;          // 服务器时间戳（ISO 8601）
}
```

**示例：**
```json
{
  "success": true,
  "data": {
    "id": "uuid-123",
    "name": "项目 A",
    "status": "active"
  },
  "message": "创建成功",
  "timestamp": "2026-02-13T10:30:00Z"
}
```

**错误响应：**
```json
{
  "success": false,
  "data": null,
  "message": "用户不存在",
  "timestamp": "2026-02-13T10:30:00Z"
}
```

#### 分页响应格式

**Offset 分页响应（适用于数据量不大的场景）**

```typescript
interface OffsetPaginationResponse<T = any> {
  success: boolean;
  data: {
    items: T[];               // 当前页数据
    pagination: {
      page: number;           // 当前页码（从1开始）
      limit: number;          // 每页数量
      total: number;          // 总记录数
      totalPages: number;     // 总页数
      hasNext: boolean;       // 是否有下一页
      hasPrev: boolean;       // 是否有上一页
    };
  };
  message?: string;
  timestamp: string;
}
```

**示例：**
```json
{
  "success": true,
  "data": {
    "items": [
      { "id": "1", "name": "项目 A" },
      { "id": "2", "name": "项目 B" }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  },
  "timestamp": "2026-02-13T10:30:00Z"
}
```

**游标分页响应（适用于大数据量场景，避免深分页性能问题）**

```typescript
interface CursorPaginationResponse<T = any> {
  success: boolean;
  data: {
    items: T[];               // 当前页数据
    pagination: {
      cursor: string;         // 当前页游标（Base64编码）
      nextCursor?: string;    // 下一页游标（没有下一页时为空）
      limit: number;          // 每页数量
      hasMore: boolean;       // 是否有更多数据
    };
  };
  message?: string;
  timestamp: string;
}
```

**示例：**
```json
{
  "success": true,
  "data": {
    "items": [
      { "id": "101", "start_time": 120.5, "end_time": 125.0 },
      { "id": "102", "start_time": 125.5, "end_time": 130.0 }
    ],
    "pagination": {
      "cursor": "eyJpZCI6IjEwMCIsInN0YXJ0VGltZSI6MTIwfQ==",
      "nextCursor": "eyJpZCI6IjEwMiIsInN0YXJ0VGltZSI6MTMwfQ==",
      "limit": 100,
      "hasMore": true
    }
  },
  "timestamp": "2026-02-13T10:30:00Z"
}
```

**游标分页使用说明：**
- 游标是 Base64 编码的 JSON 字符串，包含最后一条记录的位置信息
- 请求时使用 `cursor` 参数获取下一页
- 游标分页不支持跳页，只能顺序加载
- 适用于时间序列数据、无限滚动等场景

#### 批量操作响应格式

```typescript
interface BatchOperationResponse {
  success: boolean;
  data: {
    succeeded: string[];      // 成功的资源ID列表
    failed: {
      id: string;
      error: string;
    }[];
    total: number;            // 总操作数
    successCount: number;     // 成功数
    failCount: number;        // 失败数
  };
  message?: string;
  timestamp: string;
}
```

**示例：**
```json
{
  "success": true,
  "data": {
    "succeeded": ["uuid-1", "uuid-2"],
    "failed": [
      { "id": "uuid-3", "error": "资源不存在" }
    ],
    "total": 3,
    "successCount": 2,
    "failCount": 1
  },
  "message": "批量操作完成",
  "timestamp": "2026-02-13T10:30:00Z"
}
```

#### 响应格式规范总结

| 场景 | 响应格式 | 使用示例 |
|------|----------|----------|
| 单一资源查询 | StandardResponse | `GET /api/v1/projects/:id` |
| 资源创建 | StandardResponse | `POST /api/v1/projects` |
| 资源更新 | StandardResponse | `PUT /api/v1/projects/:id` |
| 资源删除 | StandardResponse（data为null） | `DELETE /api/v1/projects/:id` |
| 列表查询（小数据量） | OffsetPaginationResponse | `GET /api/v1/projects?page=1&limit=20` |
| 列表查询（大数据量） | CursorPaginationResponse | `GET /api/v2/audio/:id/annotations/range` |
| 批量操作 | BatchOperationResponse | `POST /api/v1/annotations/batch` |

---

### API 使用场景与最佳实践

#### API 版本选择指南

| 场景 | 推荐版本 | 说明 |
|------|----------|------|
| **短音频标注**（< 30分钟） | `/api/v1` | 使用标准标注 API，完整加载所有数据 |
| **长音频标注**（≥ 30分钟） | `/api/v2` | 使用分块加载、时间范围查询，提升性能 |
| **波形显示** | `/api/v2` | 使用多级波形 API，支持缩放和按需加载 |
| **AI 处理进度** | `/api/v2` | 使用流式推送 API，实时反馈进度 |
| **快速预览** | `/api/v1` | 使用简单 API，减少复杂度 |
| **批量导出** | `/api/v1` | 使用标准批量 API |
| **移动端访问** | `/api/v1` | 使用轻量级 API，减少数据传输 |

#### 标注查询 API 选择

**场景 1：短音频或需要全部数据**
```
GET /api/v1/annotations?audioId=xxx
```
- 返回该音频的所有标注
- 适合短音频（< 30分钟）
- 数据量小，一次性加载无压力

**场景 2：长音频时间范围查询**
```
GET /api/v2/audio/:id/annotations/range?startTime=0&endTime=600&limit=100
```
- 返回指定时间范围内的标注
- 支持游标分页，避免深分页性能问题
- 适合长音频（≥ 30分钟）
- 结合前端虚拟滚动，只渲染可见区域

**场景 3：按图层过滤**
```
GET /api/v2/audio/:id/annotations/range?layers=transcript,speaker&startTime=0&endTime=600
```
- 只返回指定图层的标注
- 减少数据传输量

#### 最佳实践

**1. 渐进式加载策略**
```typescript
// 前端实现示例
if (audioDuration < 1800) { // 30分钟
  // 短音频：一次性加载
  await loadAllAnnotations(audioId);
} else {
  // 长音频：按需加载
  await loadAnnotationsInRange(audioId, { start: 0, end: 300 });
  // 监听播放位置，动态加载
  watch(currentTime, (time) => {
    loadAnnotationsInRange(audioId, {
      start: time - 120,
      end: time + 120
    });
  });
}
```

**2. 智能缓存策略**
```typescript
// 前端缓存
const cache = new LRUCache({
  max: 100, // 最多缓存 100 个时间范围
  ttl: 1000 * 60 * 10 // 10分钟过期
});

// 先检查缓存
const cacheKey = `${audioId}-${startTime}-${endTime}`;
if (cache.has(cacheKey)) {
  return cache.get(cacheKey);
}

// 缓存未命中，从服务器加载
const data = await api.loadAnnotations();
cache.set(cacheKey, data);
```

**3. 错误降级处理**
```typescript
// API v2 不可用时降级到 v1
try {
  return await apiV2.loadAnnotationsInRange(audioId, range);
} catch (error) {
  console.warn('API v2 失败，降级到 v1:', error);
  return await apiV1.loadAllAnnotations(audioId);
}
```

---

### 核心 API 端点

#### 1. 认证模块 (`/auth`)

```
POST   /api/v1/auth/register                     # 用户注册
POST   /api/v1/auth/login                        # 用户登录
POST   /api/v1/auth/logout                       # 用户登出
POST   /api/v1/auth/refresh                      # 刷新 Token
POST   /api/v1/auth/request-password-reset       # 请求密码重置
POST   /api/v1/auth/reset-password               # 重置密码
GET    /api/v1/auth/verify-email                 # 验证邮箱
```

#### 2. 用户模块 (`/users`)

```
GET    /api/v1/users                  # 用户列表（分页）
GET    /api/v1/users/:id              # 获取用户详情
PUT    /api/v1/users/:id              # 更新用户信息
DELETE /api/v1/users/:id              # 删除用户
PUT    /api/v1/users/:id/password     # 修改密码
GET    /api/v1/users/me               # 获取当前用户信息
```

#### 3. 团队模块 (`/teams`)

```
GET    /api/v1/teams                  # 团队列表
POST   /api/v1/teams                  # 创建团队
GET    /api/v1/teams/:id              # 获取团队详情
PUT    /api/v1/teams/:id              # 更新团队
DELETE /api/v1/teams/:id              # 删除团队
GET    /api/v1/teams/:id/members      # 获取成员列表
POST   /api/v1/teams/:id/members      # 添加成员
PUT    /api/v1/teams/:id/members/:uid # 更新成员角色
DELETE /api/v1/teams/:id/members/:uid # 移除成员
```

#### 4. 项目模块 (`/projects`)

```
GET    /api/v1/projects               # 项目列表
POST   /api/v1/projects               # 创建项目
GET    /api/v1/projects/:id           # 获取项目详情
PUT    /api/v1/projects/:id           # 更新项目
DELETE /api/v1/projects/:id           # 删除项目
GET    /api/v1/projects/:id/stats     # 项目统计
```

#### 5. 音频文件模块 (`/audio`)

```
GET    /api/v1/audio                  # 音频文件列表
POST   /api/v1/audio/upload           # 上传音频
GET    /api/v1/audio/:id              # 获取音频详情
PUT    /api/v1/audio/:id              # 更新音频信息
DELETE /api/v1/audio/:id              # 删除音频
GET    /api/v1/audio/:id/metadata     # 获取元数据
PUT    /api/v1/audio/:id/metadata     # 更新元数据
GET    /api/v1/audio/:id/waveform     # 获取波形数据
POST   /api/v1/audio/:id/ai-process   # 触发 AI 处理
GET    /api/v1/audio/:id/ai-status    # 获取 AI 处理状态
```

#### 6. 标注模块 (`/annotations`)

```
GET    /api/v1/annotations            # 标注列表
POST   /api/v1/annotations            # 创建标注
GET    /api/v1/annotations/:id        # 获取标注详情
PUT    /api/v1/annotations/:id        # 更新标注
DELETE /api/v1/annotations/:id        # 删除标注
GET    /api/v1/annotations/:id/versions # 获取版本历史
POST   /api/v1/annotations/:id/submit  # 提交审核
POST   /api/v1/annotations/batch      # 批量操作
```

#### 8. 标注层模块 (`/layers`)

```
GET    /api/v1/layers                 # 标注层列表
POST   /api/v1/layers                 # 创建标注层
GET    /api/v1/layers/:id             # 获取标注层详情
PUT    /api/v1/layers/:id             # 更新标注层
DELETE /api/v1/layers/:id             # 删除标注层
PUT    /api/v1/layers/:id/visibility  # 切换可见性
PUT    /api/v1/layers/:id/lock        # 锁定/解锁
```

#### 9. 说话人模块 (`/speakers`)

```
GET    /api/v1/speakers               # 说话人列表
POST   /api/v1/speakers               # 创建说话人
GET    /api/v1/speakers/:id           # 获取说话人详情
PUT    /api/v1/speakers/:id           # 更新说话人
DELETE /api/v1/speakers/:id           # 删除说话人
```

#### 10. 标签模块 (`/tags`)

```
GET    /api/v1/tags                   # 标签列表
POST   /api/v1/tags                   # 创建标签
GET    /api/v1/tags/:id               # 获取标签详情
PUT    /api/v1/tags/:id               # 更新标签
DELETE /api/v1/tags/:id               # 删除标签
GET    /api/v1/tags/tree              # 获取标签树
```

#### 11. 评论模块 (`/comments`)

```
GET    /api/v1/comments               # 评论列表
POST   /api/v1/comments               # 创建评论
GET    /api/v1/comments/:id           # 获取评论详情
PUT    /api/v1/comments/:id           # 更新评论
DELETE /api/v1/comments/:id           # 删除评论
POST   /api/v1/comments/:id/reply     # 回复评论
```

#### 12. 任务模块 (`/tasks`)

```
GET    /api/v1/tasks                  # 任务列表
POST   /api/v1/tasks                  # 创建任务
GET    /api/v1/tasks/:id              # 获取任务详情
PUT    /api/v1/tasks/:id              # 更新任务
DELETE /api/v1/tasks/:id              # 删除任务
POST   /api/v1/tasks/:id/assign       # 分配任务
POST   /api/v1/tasks/:id/submit       # 提交审核
POST   /api/v1/tasks/:id/approve      # 审核通过
POST   /api/v1/tasks/:id/reject       # 审核驳回
GET    /api/v1/tasks/:id/progress     # 获取任务进度
```

#### 13. 导出模块 (`/export`)

```
POST   /api/v1/export                 # 导出标注
GET    /api/v1/export/:id             # 获取导出任务状态
GET    /api/v1/export/:id/download    # 下载导出文件
POST   /api/v1/export/batch           # 批量导出
```

#### 14. 通知模块 (`/notifications`)

```
GET    /api/v1/notifications          # 通知列表
PUT    /api/v1/notifications/:id/read # 标记已读
PUT    /api/v1/notifications/read-all # 全部标记已读
DELETE /api/v1/notifications/:id      # 删除通知
```

#### 15. 统计模块 (`/stats`)

```
GET    /api/v1/stats/overview         # 概览统计
GET    /api/v1/stats/workload         # 工作量统计
GET    /api/v1/stats/quality          # 质量统计
GET    /api/v1/stats/heatmaps         # 热力图数据
```

---

### WebSocket 事件设计

#### 连接事件

```typescript
// 客户端 → 服务器
socket.emit('join-audio', { audioId: string });
socket.emit('leave-audio', { audioId: string });

// 服务器 → 客户端
socket.emit('joined', { userId: string, users: User[] });
socket.emit('user-joined', { user: User });
socket.emit('user-left', { userId: string });
```

#### 协作事件

```typescript
// 标注变更
socket.emit('annotation-created', { annotation: Annotation });
socket.emit('annotation-updated', { annotationId: string, changes: Partial<Annotation> });
socket.emit('annotation-deleted', { annotationId: string });

// 光标同步
socket.emit('cursor-moved', { userId: string, position: { time: number } });

// 选择同步
socket.emit('selection-changed', { userId: string, selection: { start: number, end: number } });

// 播放同步
socket.emit('playback-started', { userId: string, time: number });
socket.emit('playback-paused', { userId: string, time: number });
socket.emit('playback-seeked', { userId: string, time: number });
```

#### 锁定事件

```typescript
// 服务器 → 客户端
socket.emit('lock-acquired', { annotationId: string, userId: string });
socket.emit('lock-released', { annotationId: string });

// 客户端 → 服务器
socket.emit('acquire-lock', { annotationId: string });
socket.emit('release-lock', { annotationId: string });
```

#### 评论事件

```typescript
socket.emit('comment-added', { comment: Comment });
socket.emit('comment-updated', { commentId: string, content: string });
socket.emit('comment-deleted', { commentId: string });
```

#### 通知事件

```typescript
socket.emit('notification', { notification: Notification });
socket.emit('mention', { commentId: string, userId: string });
```

---

## 实时协作方案

### 架构设计

```
┌─────────────────┐     Socket.io     ┌─────────────────┐
│   客户端 A       │ ←─────────────→   │  Socket.io      │
│   Vue 3         │     WebSocket     │  Server         │
└─────────────────┘                     └─────────────────┘
                                              │
                                              │ Redis Pub/Sub
                                              ▼
                                    ┌─────────────────┐
                                    │  Redis Adapter  │
                                    └─────────────────┘
                                              │
                                              ▼
┌─────────────────┐     Socket.io     ┌─────────────────┐
│   客户端 B       │ ←─────────────→   │  Socket.io      │
│   Vue 3         │     WebSocket     │  Server         │
└─────────────────┘                     └─────────────────┘
```

### 编辑锁定机制

**Redis 锁设计**：

```typescript
// 锁 Key 格式
lock:annotation:{annotationId}

// 锁值
{
  userId: string,
  acquiredAt: timestamp,
  ttl: 300000 // 5 分钟
}

// 获取锁
await redis.set(lockKey, lockValue, 'PX', ttl, 'NX');

// 释放锁
await redis.del(lockKey);

// 续期锁
await redis.expire(lockKey, ttl);
```

### 冲突解决策略

| 场景 | 解决策略 |
|------|----------|
| 同时编辑同一标注 | 后提交者收到冲突提示，可选择合并或覆盖 |
| 删除正在编辑的标注 | 强制释放锁，删除后通知所有用户 |
| 同时修改同一层 | 层级操作串行化，基于时间戳最后操作生效 |

### 数据同步策略

```
1. 本地操作乐观更新
2. 发送变更到服务器
3. 服务器验证并广播
4. 其他客户端接收并应用
5. 冲突时提示用户
```

### 房间管理

**房间命名规范**

| 房间类型 | 命名格式 | 说明 | 示例 |
|---------|----------|------|------|
| 音频协作 | `audio:{audioId}` | 音频文件实时协作 | `audio:uuid-123` |
| AI 任务进度 | `ai-job:{jobId}` | AI 处理进度订阅 | `ai-job:uuid-456` |
| 项目通知 | `project:{projectId}` | 项目级通知推送 | `project:uuid-789` |
| 用户私聊 | `user:{userId}` | 用户私信 | `user:uuid-abc` |
| 全局广播 | `global` | 系统级广播 | `global` |

**房间管理 API**

```typescript
// 客户端加入房间
socket.emit('join-room', {
  roomId: 'audio:uuid-123',
  roomType: 'audio'
});

// 客户端离开房间
socket.emit('leave-room', {
  roomId: 'audio:uuid-123',
  roomType: 'audio'
});

// 批量加入多个房间
socket.emit('join-rooms', {
  rooms: [
    { roomId: 'audio:uuid-123', roomType: 'audio' },
    { roomId: 'ai-job:uuid-456', roomType: 'ai-job' }
  ]
});
```

**服务器端房间管理**

```typescript
@Injectable()
export class RoomManager {
  // 记录用户加入的房间
  private userRooms = new Map<string, Set<string>>(); // userId -> Set<roomId>

  joinRoom(socket: Socket, roomId: string, userId: string) {
    socket.join(roomId);

    // 记录用户加入的房间
    if (!this.userRooms.has(userId)) {
      this.userRooms.set(userId, new Set());
    }
    this.userRooms.get(userId)!.add(roomId);

    // 通知房间内其他用户
    socket.to(roomId).emit('user-joined-room', {
      userId,
      roomId,
      timestamp: Date.now()
    });
  }

  leaveRoom(socket: Socket, roomId: string, userId: string) {
    socket.leave(roomId);

    // 移除用户房间记录
    const rooms = this.userRooms.get(userId);
    if (rooms) {
      rooms.delete(roomId);
      if (rooms.size === 0) {
        this.userRooms.delete(userId);
      }
    }

    // 通知房间内其他用户
    socket.to(roomId).emit('user-left-room', {
      userId,
      roomId,
      timestamp: Date.now()
    });
  }

  // 用户断开连接时，清理所有房间
  async disconnectUser(socket: Socket, userId: string) {
    const rooms = this.userRooms.get(userId);
    if (rooms) {
      for (const roomId of rooms) {
        socket.leave(roomId);
        socket.to(roomId).emit('user-disconnected', {
          userId,
          roomId,
          timestamp: Date.now()
        });
      }
      this.userRooms.delete(userId);
    }
  }

  // 获取用户加入的所有房间
  getUserRooms(userId: string): string[] {
    return Array.from(this.userRooms.get(userId) || []);
  }

  // 获取房间内的所有用户
  async getRoomUsers(roomId: string): Promise<string[]> {
    const sockets = await this.server.in(roomId).allSockets();
    // 需要通过 socket 关联 userId，此处为简化示例
    return Array.from(sockets) as string[];
  }
}
```

**WebSocket Gateway 实现**

```typescript
@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/ws'
})
export class CollaborationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private roomManager: RoomManager) {}

  async handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    client.data.userId = userId;

    console.log(`User ${userId} connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    await this.roomManager.disconnectUser(client, userId);

    console.log(`User ${userId} disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(
    client: Socket,
    payload: { roomId: string; roomType: string }
  ) {
    const userId = client.data.userId;
    this.roomManager.joinRoom(client, payload.roomId, userId);

    client.emit('room-joined', {
      roomId: payload.roomId,
      success: true
    });
  }

  @SubscribeMessage('leave-room')
  handleLeaveRoom(
    client: Socket,
    payload: { roomId: string; roomType: string }
  ) {
    const userId = client.data.userId;
    this.roomManager.leaveRoom(client, payload.roomId, userId);

    client.emit('room-left', {
      roomId: payload.roomId,
      success: true
    });
  }

  @SubscribeMessage('join-rooms')
  handleJoinRooms(
    client: Socket,
    payload: { rooms: Array<{ roomId: string; roomType: string }> }
  ) {
    const userId = client.data.userId;
    const results: Array<{ roomId: string; success: boolean }> = [];

    for (const room of payload.rooms) {
      try {
        this.roomManager.joinRoom(client, room.roomId, userId);
        results.push({ roomId: room.roomId, success: true });
      } catch (error) {
        results.push({ roomId: room.roomId, success: false });
      }
    }

    client.emit('rooms-joined', {
      results,
      total: results.length,
      succeeded: results.filter(r => r.success).length
    });
  }
}
```

**房间使用最佳实践**

1. **按需加入**：用户只加入当前需要接收消息的房间
2. **及时退出**：离开页面时主动退出相关房间
3. **房间复用**：多个 AI 任务可以复用同一个房间监听
4. **错误处理**：房间操作失败时提供降级方案
5. **超时清理**：定期清理无人使用的房间

**示例：前端使用**

```typescript
// 使用 useWebSocket 加入房间
const { send, close } = useWebSocket('ws://localhost:3000/ws', {
  autoConnect: true,
  onConnected(ws) {
    // 连接后加入音频协作房间
    send('join-room', {
      roomId: `audio:${audioId}`,
      roomType: 'audio'
    });

    // 如果有正在进行的 AI 任务，加入任务房间
    if (aiJobId) {
      send('join-room', {
        roomId: `ai-job:${aiJobId}`,
        roomType: 'ai-job'
      });
    }
  },
  onDisconnected(ws) {
    console.log('WebSocket disconnected');
  }
});

// 页面卸载时退出房间
onUnmounted(() => {
  send('leave-room', { roomId: `audio:${audioId}`, roomType: 'audio' });
  close();
});
```

---

## AI 服务设计

### 服务架构

```
┌─────────────────────────────────────────────────────────┐
│                    FastAPI Gateway                      │
│              请求路由、认证、限流                         │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│  ASR Worker   │   │  Speaker DIAR  │   │  Segmentation │
│   Whisper     │   │  Pyannote     │   │  Librosa      │
└───────────────┘   └───────────────┘   └───────────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            ▼
                    ┌───────────────┐
                    │  Result Store │
                    │  PostgreSQL   │
                    └───────────────┘
```

### AI 处理流程

```
1. 用户上传音频
   ↓
2. 保存到 MinIO
   ↓
3. 创建 AI 任务（写入数据库）
   ↓
4. 推送到 Celery 队列
   ↓
5. Worker 接收任务
   ↓
6. 下载音频 → 处理 → 保存结果
   ↓
7. 更新任务状态
   ↓
8. WebSocket 通知前端
```

### API 端点

```python
# AI 服务 API
POST   /api/v1/ai/asr              # 语音识别
POST   /api/v1/ai/speaker          # 说话人分离
POST   /api/v1/ai/segment          # 自动分段
POST   /api/v1/ai/noise            # 噪音检测
POST   /api/v1/ai/tags             # 标签推荐
GET    /api/v1/ai/jobs/:id         # 获取任务状态
GET    /api/v1/ai/jobs             # 任务列表
```

### 返回数据格式

```typescript
// ASR 结果
{
  jobId: string,
  status: 'completed',
  result: {
    segments: [
      {
        id: string,
        start: number,
        end: number,
        text: string,
        confidence: number,
        words: [
          { word: string, start: number, end: number, confidence: number }
        ]
      }
    ],
    language: string,
    duration: number
  }
}

// 说话人分离结果
{
  jobId: string,
  status: 'completed',
  result: {
    speakers: [
      { id: string, name: string, segments: number }
    ],
    diarization: [
      { start: number, end: number, speaker: string }
    ]
  }
}
```

---

## 前端架构设计

### 项目结构

```
frontend/
├── src/
│   ├── assets/                 # 静态资源
│   │   ├── images/
│   │   ├── icons/
│   │   └── styles/
│   ├── components/             # 通用组件
│   │   ├── common/            # 通用组件
│   │   │   ├── Button.vue
│   │   │   ├── Input.vue
│   │   │   ├── Modal.vue
│   │   │   └── ...
│   │   ├── audio/             # 音频相关组件
│   │   │   ├── AudioPlayer.vue
│   │   │   ├── WaveformView.vue
│   │   │   ├── WaveformCanvas.vue
│   │   │   ├── MultiLevelWaveform.vue    # 多级波形渲染
│   │   │   ├── WaveformTile.vue         # 波形瓦片
│   │   │   └── ...
│   │   ├── annotation/        # 标注相关组件
│   │   │   ├── AnnotationEditor.vue
│   │   │   ├── AnnotationList.vue
│   │   │   ├── LayerManager.vue
│   │   │   ├── AnnotationTimeline.vue    # 标注时间轴
│   │   │   └── ...
│   │   ├── segment/           # 分段相关组件（长音频优化）
│   │   │   ├── SegmentNavigator.vue      # 分段导航
│   │   │   ├── SegmentList.vue           # 分段列表
│   │   │   ├── BookmarkPanel.vue         # 书签面板
│   │   │   └── ...
│   │   ├── collaboration/     # 协作相关组件
│   │   │   ├── CollaboratorCursor.vue
│   │   │   ├── CommentPanel.vue
│   │   │   └── ...
│   │   ├── ai/                # AI 相关组件
│   │   │   ├── AIProgressPanel.vue       # AI 进度面板
│   │   │   ├── SegmentPreview.vue        # 分段结果预览
│   │   │   └── ...
│   │   └── heatmap/           # 热力图组件
│   │       ├── DensityHeatmap.vue
│   │       ├── SpeakerHeatmap.vue
│   │       └── SpectrumHeatmap.vue
│   ├── composables/           # 组合式函数
│   │   ├── useAudioPlayer.ts
│   │   ├── useAnnotation.ts
│   │   ├── useCollaboration.ts
│   │   ├── useWebSocket.ts
│   │   ├── useHeatmap.ts
│   │   ├── useSegmentLoader.ts       # 长音频分段加载
│   │   ├── useWaveformTiles.ts       # 波形瓦片加载
│   │   ├── useAnnotationRange.ts     # 时间范围标注加载
│   │   ├── useAIStream.ts            # AI 流式进度
│   │   └── ...
│   ├── layouts/               # 布局组件
│   │   ├── MainLayout.vue
│   │   ├── AuthLayout.vue
│   │   └── EmptyLayout.vue
│   ├── pages/                 # 页面
│   │   ├── auth/
│   │   │   ├── Login.vue
│   │   │   ├── Register.vue
│   │   │   └── ForgotPassword.vue
│   │   ├── dashboard/
│   │   │   ├── Dashboard.vue
│   │   │   └── Stats.vue
│   │   ├── projects/
│   │   │   ├── ProjectList.vue
│   │   │   ├── ProjectDetail.vue
│   │   │   └── ProjectSettings.vue
│   │   ├── audio/
│   │   │   ├── AudioList.vue
│   │   │   ├── AudioUpload.vue
│   │   │   └── AudioDetail.vue
│   │   ├── annotation/
│   │   │   ├── AnnotationWorkspace.vue
│   │   │   └── AnnotationHistory.vue
│   │   ├── tasks/
│   │   │   ├── TaskList.vue
│   │   │   └── TaskDetail.vue
│   │   └── settings/
│   │       ├── Profile.vue
│   │       └── Preferences.vue
│   ├── router/                # 路由配置
│   │   ├── index.ts
│   │   └── routes.ts
│   ├── stores/                # Pinia 状态
│   │   ├── user.ts
│   │   ├── project.ts
│   │   ├── audio.ts
│   │   ├── annotation.ts
│   │   ├── collaboration.ts
│   │   └── ...
│   ├── services/              # API 服务
│   │   ├── api.ts             # Axios 实例
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   ├── audio.service.ts
│   │   ├── annotation.service.ts
│   │   ├── segment.service.ts          # 分段服务（/api/v2）
│   │   ├── waveform.service.ts         # 波形服务（/api/v2）
│   │   ├── aiStream.service.ts         # AI 流式服务
│   │   └── ...
│   ├── types/                 # TypeScript 类型
│   │   ├── index.ts
│   │   ├── user.ts
│   │   ├── audio.ts
│   │   ├── annotation.ts
│   │   ├── segment.ts                 # 分段类型
│   │   ├── waveform.ts                # 波形类型
│   │   ├── ai.ts                      # AI 相关类型
│   │   ├── api.ts                     # API 响应类型
│   │   └── ...
│   ├── utils/                 # 工具函数
│   │   ├── format.ts
│   │   ├── validation.ts
│   │   ├── storage.ts
│   │   └── ...
│   ├── constants/             # 常量
│   │   ├── config.ts
│   │   ├── enums.ts
│   │   └── ...
│   ├── App.vue
│   └── main.ts
├── public/
│   ├── favicon.ico
│   └── robots.txt
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
└── package.json
```

### 核心组件设计

#### AudioPlayer 组件

```vue
<template>
  <div class="audio-player">
    <!-- 波形显示 -->
    <WaveformCanvas 
      :audio="audio"
      :annotations="annotations"
      :currentTime="currentTime"
      :selection="selection"
      @waveform-click="handleWaveformClick"
      @waveform-drag="handleWaveformDrag"
    />
    
    <!-- 播放控制 -->
    <PlaybackControls
      :isPlaying="isPlaying"
      :playbackRate="playbackRate"
      :volume="volume"
      :loop="loop"
      @play="play"
      @pause="pause"
      @stop="stop"
      @seek="seek"
      @set-rate="setPlaybackRate"
      @set-volume="setVolume"
      @toggle-loop="toggleLoop"
    />
    
    <!-- 时间显示 -->
    <TimeDisplay
      :currentTime="currentTime"
      :duration="duration"
    />
  </div>
</template>
```

#### AnnotationEditor 组件

```vue
<template>
  <div class="annotation-editor">
    <!-- 标注层管理 -->
    <LayerManager
      :layers="layers"
      :activeLayer="activeLayer"
      @select-layer="selectLayer"
      @create-layer="createLayer"
      @toggle-visibility="toggleLayerVisibility"
    />
    
    <!-- 标注列表 -->
    <AnnotationList
      :annotations="annotations"
      :activeAnnotation="activeAnnotation"
      @select="selectAnnotation"
      @create="createAnnotation"
      @update="updateAnnotation"
      @delete="deleteAnnotation"
    />
    
    <!-- 编辑面板 -->
    <AnnotationPanel
      v-if="activeAnnotation"
      :annotation="activeAnnotation"
      :speakers="speakers"
      :tags="tags"
      @update="updateAnnotation"
      @add-tag="addTag"
      @remove-tag="removeTag"
    />
  </div>
</template>
```

### 状态管理 (Pinia)

```typescript
// stores/audio.ts
export const useAudioStore = defineStore('audio', {
  state: () => ({
    currentAudio: null as Audio | null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    playbackRate: 1,
    volume: 100,
    loop: false,
    loopStart: 0,
    loopEnd: 0,
  }),
  actions: {
    async loadAudio(audioId: string) { },
    play() { },
    pause() { },
    seek(time: number) { },
    setPlaybackRate(rate: number) { },
    setVolume(volume: number) { },
    toggleLoop() { },
  },
});

// stores/collaboration.ts
export const useCollaborationStore = defineStore('collaboration', {
  state: () => ({
    connected: false,
    users: [] as User[],
    cursors: {} as Record<string, Cursor>,
    locks: {} as Record<string, Lock>,
  }),
  actions: {
    connect() { },
    disconnect() { },
    sendCursor(position: number) { },
    acquireLock(annotationId: string) { },
    releaseLock(annotationId: string) { },
  },
});
```

### Composables 组合式函数

#### 基础 Composables

```typescript
// composables/useAudioPlayer.ts - 音频播放器
export function useAudioPlayer(audioElement: HTMLAudioElement) {
  const isPlaying = ref(false);
  const currentTime = ref(0);
  const duration = ref(0);
  const volume = ref(100);

  const play = () => audioElement.play();
  const pause = () => audioElement.pause();
  const seek = (time: number) => { currentTime.value = time; audioElement.currentTime = time; };

  return { isPlaying, currentTime, duration, volume, play, pause, seek };
}

// composables/useAnnotation.ts - 标注管理
export function useAnnotation(audioId: string) {
  const annotations = ref<Annotation[]>([]);
  const loading = ref(false);

  const loadAnnotations = async () => {
    loading.value = true;
    const response = await annotationService.list(audioId);
    annotations.value = response.data.items;
    loading.value = false;
  };

  const createAnnotation = async (data: Partial<Annotation>) => {
    const response = await annotationService.create(data);
    annotations.value.push(response.data);
    return response.data;
  };

  return { annotations, loading, loadAnnotations, createAnnotation };
}
```

#### 长音频优化 Composables

```typescript
// composables/useSegmentLoader.ts - 分段加载器
export function useSegmentLoader(audioId: string) {
  const segments = ref<AudioSegment[]>([]);
  const currentSegment = ref<AudioSegment | null>(null);
  const segmentCache = new Map<string, AudioSegment>();

  const loadSegmentsAroundTime = async (currentTime: number) => {
    // 加载当前分段
    const current = await segmentService.findByTime(audioId, currentTime);
    if (current) currentSegment.value = current;

    // 预加载相邻分段
    const neighbors = await segmentService.getNeighbors(audioId, current.segment_index, 2);
    neighbors.forEach(seg => segmentCache.set(seg.id, seg));

    return [current, ...neighbors];
  };

  return { segments, currentSegment, loadSegmentsAroundTime };
}

// composables/useWaveformTiles.ts - 波形瓦片加载器
export function useWaveformTiles(audioId: string) {
  const tiles = ref<Map<string, WaveformTile>>(new Map());
  const zoomLevel = ref<'overview' | 'detail' | 'zoom'>('detail');

  const loadVisibleTiles = async (viewWindow: { start: number; end: number }) => {
    const config = WAVEFORM_ZOOM_LEVELS[zoomLevel.value];
    const startTile = Math.floor(viewWindow.start * config.pixelsPerSecond / 1000);
    const endTile = Math.ceil(viewWindow.end * config.pixelsPerSecond / 1000);

    const promises: Promise<WaveformTile>[] = [];
    for (let i = startTile; i <= endTile; i++) {
      const key = `${zoomLevel.value}-${i}`;
      if (!tiles.value.has(key)) {
        promises.push(waveformService.getTile(audioId, zoomLevel.value, i));
      }
    }

    const loadedTiles = await Promise.all(promises);
    loadedTiles.forEach(tile => {
      tiles.value.set(`${zoomLevel.value}-${tile.index}`, tile);
    });
  };

  return { tiles, zoomLevel, loadVisibleTiles };
}

// composables/useAnnotationRange.ts - 时间范围标注加载器
export function useAnnotationRange(audioId: string) {
  const audioStore = useAudioStore();
  const annotations = ref<Annotation[]>([]);
  const cache = new LRUCache<string, Annotation[]>({ max: 100, ttl: 600000 });

  const loadRange = async (range: { start: number; end: number }) => {
    const key = `${audioId}-${range.start}-${range.end}`;

    if (cache.has(key)) {
      annotations.value = cache.get(key)!;
      return;
    }

    const response = await annotationService.getByRange(audioId, range);
    annotations.value = response.data.annotations;
    cache.set(key, annotations.value);
  };

  // 自动加载当前播放位置附近的标注
  watch(() => audioStore.currentTime, (time) => {
    loadRange({
      start: Math.max(0, time - 60), // 前1分钟
      end: Math.min(audioStore.currentAudio.duration, time + 60) // 后1分钟
    });
  });

  return { annotations, loadRange };
}

// composables/useAIStream.ts - AI 流式进度
export function useAIStream(jobId: string) {
  const progress = ref<AIProgress | null>(null);
  const results = ref<AISegmentResult[]>([]);
  const error = ref<string | null>(null);

  const { send, close } = useWebSocket(`ws://localhost:3000?jobId=${jobId}`, {
    onMessage(_ws, event) {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case 'ai-job-progress':
          progress.value = message.data;
          break;
        case 'ai-segment-result':
          results.value.push(message.data.segment);
          break;
        case 'ai-job-completed':
          progress.value = null;
          break;
        case 'ai-job-failed':
          error.value = message.data.error;
          break;
      }
    }
  });

  const cancel = () => {
    close();
  };

  return { progress, results, error, cancel };
}
```

### TypeScript 类型定义

#### 核心类型

```typescript
// types/index.ts
export interface Audio {
  id: string;
  projectId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  format: string;
  duration: number;
  sampleRate: number;
  channels: number;
  metadata: Record<string, any>;
  storageKey: string;
  uploadStatus: 'uploading' | 'completed' | 'failed';
  aiStatus: 'pending' | 'processing' | 'completed' | 'failed';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Annotation {
  id: string;
  audioId: string;
  layerId?: string;
  speakerId?: string;
  startTime: number;
  endTime: number;
  text?: string;
  textRaw?: string;
  confidence?: number;
  isManual: boolean;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  metadata: Record<string, any>;
  createdBy: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnnotationLayer {
  id: string;
  audioId: string;
  name: string;
  type: 'transcript' | 'speaker' | 'emotion' | 'event' | 'noise';
  color: string;
  isVisible: boolean;
  isLocked: boolean;
  orderIndex: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### 长音频优化类型

```typescript
// types/segment.ts
export interface AudioSegment {
  id: string;
  audioId: string;
  segmentIndex: number;
  startTime: number;
  endTime: number;
  duration: number;
  silenceScore: number;
  speakerChange: boolean;
  hasMusic: boolean;
  summary?: string;
  metadata: Record<string, any>;
}

export interface SegmentNavigation {
  id: string;
  audioId: string;
  segmentId: string;
  title: string;
  description?: string;
  parentId?: string;
  level: number;
  createdAt: Date;
}

export interface SegmentBookmark {
  id: string;
  audioId: string;
  segmentId?: string;
  userId: string;
  timePosition: number;
  title: string;
  note?: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

```typescript
// types/waveform.ts
export interface WaveformData {
  audioId: string;
  zoomLevel: 'overview' | 'detail' | 'zoom';
  startTime: number;
  endTime: number;
  samplesPerPixel: number;
  data: number[];
  totalSamples: number;
}

export interface WaveformTile {
  index: number;
  zoomLevel: string;
  data: number[];
  samplesPerPixel: number;
  startTime: number;
  endTime: number;
}

export const WAVEFORM_ZOOM_LEVELS = {
  overview: {
    samplesPerPixel: 1000,
    segmentSize: 1000,
    pixelsPerSecond: 10
  },
  detail: {
    samplesPerPixel: 100,
    segmentSize: 500,
    pixelsPerSecond: 100
  },
  zoom: {
    samplesPerPixel: 10,
    segmentSize: 200,
    pixelsPerSecond: 1000
  }
} as const;
```

```typescript
// types/ai.ts
export interface AIJob {
  id: string;
  audioId: string;
  jobType: 'asr' | 'speaker_diarization' | 'segmentation' | 'noise_detection';
  modelName?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  resultSummary?: Record<string, any>;
  errorMessage?: string;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
}

export interface AIJobProgress {
  id: string;
  jobId: string;
  stage: 'downloading' | 'segmentation' | 'asr' | 'diarization' | 'postprocessing';
  currentSegment: number;
  totalSegments: number;
  stageProgress: number;
  overallProgress: number;
  estimatedTimeRemaining?: number;
  currentOperation: string;
  metadata: Record<string, any>;
  updatedAt: Date;
}

export interface AISegmentResult {
  id: string;
  jobId: string;
  chunkIndex: number;
  chunkType: 'segment' | 'transcript' | 'speaker';
  startTime: number;
  endTime: number;
  data: {
    transcript?: string;
    speaker?: string;
    confidence?: number;
    words?: Array<{
      word: string;
      start: number;
      end: number;
      confidence: number;
    }>;
  };
  createdAt: Date;
}

export interface AIStreamProgress {
  type: 'ai-job-progress';
  data: {
    jobId: string;
    audioId: string;
    stage: string;
    currentSegment: number;
    totalSegments: number;
    stageProgress: number;
    overallProgress: number;
    estimatedTimeRemaining: number;
    currentOperation: string;
  };
}

export interface AISegmentResultEvent {
  type: 'ai-segment-result';
  data: {
    jobId: string;
    audioId: string;
    segmentIndex: number;
    segment: {
      id: string;
      startTime: number;
      endTime: number;
      transcript?: string;
      speaker?: string;
      confidence?: number;
    };
  };
}
```

```typescript
// types/api.ts
export interface StandardResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface OffsetPaginationResponse<T = any> {
  success: boolean;
  data: {
    items: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  message?: string;
  timestamp: string;
}

export interface CursorPaginationResponse<T = any> {
  success: boolean;
  data: {
    items: T[];
    pagination: {
      cursor: string;
      nextCursor?: string;
      limit: number;
      hasMore: boolean;
    };
  };
  message?: string;
  timestamp: string;
}

export interface BatchOperationResponse {
  success: boolean;
  data: {
    succeeded: string[];
    failed: Array<{ id: string; error: string }>;
    total: number;
    successCount: number;
    failCount: number;
  };
  message?: string;
  timestamp: string;
}
```

---

## 性能优化方案

### 前端优化

| 优化项 | 方案 |
|--------|------|
| 路由懒加载 | `defineAsyncComponent` |
| 组件懒加载 | `v-if` + 动态导入 |
| 图片懒加载 | `IntersectionObserver` |
| 虚拟滚动 | `vue-virtual-scroller` |
| 防抖节流 | Lodash 或自实现 |
| 请求缓存 | TanStack Query |
| Web Worker | 波形数据处理 |
| CDN 加速 | 静态资源 CDN |
| Gzip 压缩 | Nginx/Vite 配置 |
| 代码分割 | Vite 动态导入 |

### 缓存策略

**多层级缓存架构**

```
┌─────────────────────────────────────────────────────────┐
│                    前端缓存层                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ LRU Cache   │  │ TanStack    │  │ 浏览器      │    │
│  │ (短期数据)   │  │ Query       │  │ Storage     │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼ 请求未命中
┌─────────────────────────────────────────────────────────┐
│                    Redis 缓存层                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ 热数据缓存   │  │ 会话数据     │  │ 锁管理      │    │
│  │ (高频访问)   │  │ (用户状态)   │  │ (分布式锁)   │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼ 请求未命中
┌─────────────────────────────────────────────────────────┐
│                    数据库持久层                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ PostgreSQL  │  │ Waveform    │  │ AI Result   │    │
│  │ (主数据)     │  │ Cache Table │  │ Chunks      │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────┘
```

**缓存策略说明**

| 数据类型 | 主缓存 | 备份/冷存储 | TTL | 使用场景 |
|---------|--------|-------------|-----|----------|
| **用户信息** | Redis | - | 1小时 | 认证、权限检查 |
| **音频元数据** | Redis | PostgreSQL | 30分钟 | 列表查询、详情查看 |
| **标注数据（短音频）** | TanStack Query | PostgreSQL | 10分钟 | 实时编辑 |
| **标注数据（长音频）** | LRU Cache | PostgreSQL | 5分钟 | 时间范围查询 |
| **波形数据（Overview）** | waveform_cache 表 | - | 永久 | 长期缓存，按需清理 |
| **波形数据（Detail/Zoom）** | Redis | waveform_cache 表 | 1小时 | 频繁访问的波形 |
| **分段数据** | Redis | audio_segments 表 | 30分钟 | 分段导航、跳转 |
| **AI 进度** | Redis | ai_job_progress 表 | 实时 | 实时进度展示 |
| **AI 结果（分片）** | ai_result_chunks 表 | - | 永久 | 持久化存储，定期归档 |

**Redis 缓存 Key 设计规范**

```
# 格式：{namespace}:{resource}:{identifier}:{attribute}

用户信息:
  - user:{userId}:profile
  - user:{userId}:permissions

音频数据:
  - audio:{audioId}:metadata
  - audio:{audioId}:duration

波形数据:
  - waveform:{audioId}:{zoomLevel}:{tileIndex}

分段数据:
  - segment:{audioId}:{segmentIndex}
  - segment:navigation:{audioId}

标注数据:
  - annotation:{audioId}:range:{start}:{end}

AI 数据:
  - ai:job:{jobId}:progress
  - ai:job:{jobId}:result:{chunkIndex}
```

**缓存失效策略**

| 失效场景 | 失效策略 | 实现方式 |
|---------|----------|----------|
| 数据更新 | 立即失效 | 更新操作后删除相关缓存 Key |
| 定时过期 | TTL 自动失效 | 设置合理的过期时间 |
| 内存压力 | LRU 淘汰 | 缓存达到上限时淘汰最久未使用的数据 |
| 数据删除 | 级联失效 | 删除操作时清理所有关联缓存 |

**缓存最佳实践**

1. **读多写少**：优先使用缓存，减少数据库查询
2. **写多读少**：直接写数据库，缓存失效即可
3. **热点数据**：使用 Redis + LRU 双层缓存
4. **冷数据**：只存数据库，按需查询
5. **大文件**：存储到数据库表，缓存文件路径
6. **实时数据**：使用 Redis + WebSocket 推送

**示例代码**

```typescript
// 后端：Redis 缓存示例
@Injectable()
export class AudioService {
  async getAudioMetadata(audioId: string): Promise<Audio> {
    // 1. 尝试从 Redis 获取
    const cacheKey = `audio:${audioId}:metadata`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    // 2. 缓存未命中，从数据库查询
    const audio = await this.audioRepo.findOne({ where: { id: audioId } });

    // 3. 写入缓存，30分钟过期
    await this.redis.setex(cacheKey, 1800, JSON.stringify(audio));

    return audio;
  }

  async updateAudio(audioId: string, data: Partial<Audio>): Promise<Audio> {
    // 1. 更新数据库
    const audio = await this.audioRepo.save({ id: audioId, ...data });

    // 2. 立即失效缓存
    await this.redis.del(`audio:${audioId}:metadata`);

    return audio;
  }
}
```

### 后端优化

| 优化项 | 方案 |
|--------|------|
| 数据库索引 | 为查询字段建立索引 |
| 连接池 | TypeORM 连接池配置 |
| 缓存策略 | 多层级缓存（Redis + 数据库表）详见[缓存策略](#缓存策略) |
| 查询优化 | 避免 N+1 查询 |
| 分页查询 | 大数据分页（游标分页） |
| 异步处理 | Bull 队列处理耗时任务 |
| 负载均衡 | 多实例部署 |
| 响应压缩 | Fastify 压缩插件 |
| 限流保护 | IP 限流、用户限流 |

### 音频处理优化

| 优化项 | 方案 |
|--------|------|
| 波形数据缓存 | 多级缓存（Redis + waveform_cache 表）详见[缓存策略](#缓存策略) |
| 渐进式加载 | 按需加载波形数据 |
| 音频分片 | 大文件分片上传/处理 |
| GPU 加速 | AI 模型使用 GPU |
| 批量处理 | Celery 批量任务 |
| 预处理 | 上传时生成波形 |

---

## 安全方案

### 认证与授权

```
1. JWT 认证
   - Access Token: 15 分钟
   - Refresh Token: 7 天

2. RBAC 权限控制
   - 角色权限表
   - 路由守卫
   - API 中间件

3. 会话管理
   - 单点登录控制
   - 异常登录检测
```

### 数据安全

| 安全项 | 方案 |
|--------|------|
| 密码加密 | bcrypt |
| 敏感数据加密 | AES-256 |
| SQL 注入防护 | TypeORM 参数化查询 |
| XSS 防护 | Vue 自动转义、CSP 头 |
| CSRF 防护 | CSRF Token |
| 文件上传限制 | 类型、大小、格式验证 |

### 通信安全

| 安全项 | 方案 |
|--------|------|
| HTTPS | SSL/TLS 加密 |
| WSS | WebSocket 加密 |
| API 签名 | 请求签名验证 |
| 限流保护 | 请求频率限制 |

### 数据备份

| 备份项 | 方案 |
|--------|------|
| 数据库备份 | 每日自动备份 |
| 对象存储备份 | 跨区域复制 |
| 增量备份 | 每小时增量 |
| 恢复测试 | 定期恢复演练 |

---

## 部署方案

### 开发环境

```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: audio_label_dev
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    volumes:
      - minio_data:/data

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://dev:dev_password@postgres:5432/audio_label_dev
      REDIS_URL: redis://redis:6379
      MINIO_ENDPOINT: minio:9000
    depends_on:
      - postgres
      - redis
      - minio

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    depends_on:
      - backend

  ai-service:
    build: ./ai-service
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://dev:dev_password@postgres:5432/audio_label_dev
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

### 生产环境

#### Docker Compose

```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend

  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: always

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    restart: always

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_USER}
      MINIO_ROOT_PASSWORD: ${MINIO_PASSWORD}
    volumes:
      - minio_data:/data
    restart: always

  backend:
    build: 
      context: ./backend
      dockerfile: Dockerfile.prod
    replicas: 3
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
      MINIO_ENDPOINT: minio:9000
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - postgres
      - redis
      - minio
    restart: always

  ai-service:
    build: 
      context: ./ai-service
      dockerfile: Dockerfile.prod
    replicas: 2
    environment:
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
    depends_on:
      - postgres
      - redis
    restart: always

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

#### Kubernetes (可选)

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: audio-label/backend:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: database-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: backend
spec:
  selector:
    app: backend
  ports:
  - port: 3000
  type: ClusterIP
```

### 监控与日志

| 工具 | 用途 |
|------|------|
| Prometheus | 指标收集 |
| Grafana | 可视化监控 |
| ELK Stack | 日志收集分析 |
| Sentry | 错误追踪 |
| Uptime Robot | 可用性监控 |

---

## 开发计划

### 第一阶段 (4周)

| 任务 | 工作量 |
|------|--------|
| 项目初始化、环境搭建 | 3天 |
| 用户认证模块 | 3天 |
| 音频上传功能 | 4天 |
| 音频播放器 + 波形显示 | 5天 |
| 基础标注功能 | 5天 |
| AI ASR 集成 | 4天 |
| 测试与修复 | 2天 |

### 第二阶段 (3周)

| 任务 | 工作量 |
|------|--------|
| 实时协作基础功能 | 5天 |
| 标注密度热力图 | 3天 |
| 任务管理模块 | 4天 |
| 评论系统 | 2天 |
| 导出功能 | 2天 |
| 测试与修复 | 1天 |

### 第三阶段 (2周)

| 任务 | 工作量 |
|------|--------|
| 质量控制模块 | 3天 |
| 高级热力图（说话人、频谱） | 3天 |
| 统计报表 | 2天 |
| 性能优化 | 3天 |
| 测试与修复 | 2天 |

---

## 风险与应对

| 风险 | 应对策略 |
|------|----------|
| AI 模型准确率不达标 | 提供手动标注兜底、模型微调 |
| 实时协作延迟高 | 使用 Redis Adapter、优化网络传输 |
| 大文件上传失败 | 分片上传、断点续传 |
| 并发用户数限制 | 水平扩展、负载均衡 |
| 数据安全泄露 | 加密存储、权限控制、审计日志 |

---

## 长音频场景优化方案

针对 1 小时以上的长音频标注场景，本方案提供四个核心优化方向，确保系统在处理大规模音频时保持高性能和良好用户体验。

### 1. 音频分块架构

#### 1.1 设计目标

- 支持 10+ 小时音频文件的流畅标注
- 快速定位和跳转到音频任意段落
- 分段并行处理，提升 AI 处理效率
- 分段级元数据管理（静音检测、说话人切换等）

#### 1.2 数据库设计

**说明**：音频分块架构相关的数据库表定义详见 [数据库设计](#数据库设计) 章节：
- `audio_segments`（第19节）
- `segment_navigation`（第20节）
- `segment_bookmarks`（第21节）

#### 1.3 API 设计

```
GET    /api/v2/audio/:id/segments                    # 获取分段列表
GET    /api/v2/audio/:id/segments/:segmentId          # 获取分段详情
POST   /api/v2/audio/:id/segments                    # 手动创建分段
DELETE /api/v2/audio/:id/segments/:segmentId          # 删除分段
PUT    /api/v2/audio/:id/segments/merge              # 合并多个分段
PUT    /api/v2/audio/:id/segments/:segmentId/split    # 拆分分段
GET    /api/v2/audio/:id/navigation                   # 获取导航目录
GET    /api/v2/audio/:id/bookmarks                    # 获取书签列表
POST   /api/v2/audio/:id/bookmarks                    # 创建书签
DELETE /api/v2/audio/:id/bookmarks/:bookmarkId        # 删除书签
```

**获取分段列表请求示例：**

```typescript
interface GetSegmentsRequest {
  audioId: string;
  page?: number;
  limit?: number;
  hasSpeakerChange?: boolean;
  hasMusic?: boolean;
  sortBy?: 'index' | 'duration' | 'startTime';
  sortOrder?: 'asc' | 'desc';
}
```

#### 1.4 前端实现

**分段导航组件：**

- 显示分段列表，支持点击跳转
- 高亮当前播放位置所在分段
- 显示分段元数据（静音评分、说话人切换等）
- 支持书签管理

**分段加载策略：**

```typescript
class SegmentLoader {
  private segmentCache = new Map<string, AudioSegment>();
  private preloadDistance = 2; // 预加载前后各2个分段

  async loadSegmentsAroundTime(audioId: string, currentTime: number) {
    // 1. 获取当前时间所属分段
    const currentSegment = await this.findSegmentByTime(audioId, currentTime);
    
    // 2. 加载相邻分段
    const segmentsToLoad = await this.getNeighboringSegments(
      audioId,
      currentSegment.segment_index,
      this.preloadDistance
    );

    // 3. 更新缓存
    segmentsToLoad.forEach(segment => {
      this.segmentCache.set(segment.id, segment);
    });

    return segmentsToLoad;
  }
}
```

#### 1.5 智能分段策略

**上传时自动分段：**

1. **静音检测分段**：使用 Librosa 进行 VAD（Voice Activity Detection）
2. **说话人切换分段**：结合 Pyannote.audio 检测说话人切换点
3. **主题切分分段**：基于转写文本的主题变化（可选）

**分段参数配置：**

```json
{
  "segmentation": {
    "method": "vad",
    "silence_threshold": 0.3,
    "min_segment_duration": 5,
    "max_segment_duration": 300,
    "speaker_change_enabled": true
  }
}
```

---

### 2. 波形多级渲染

#### 2.1 设计目标

- 支持超长音频的波形显示（10+ 小时）
- 按需加载波形数据，减少初始加载时间
- 支持缩放功能，从全局概览到细节查看
- 渲染性能优化，保持 60fps 流畅度

#### 2.2 数据库设计

**说明**：波形缓存相关的数据库表定义详见 [数据库设计](#数据库设计) 章节：
- `waveform_cache`（第22节）

**缩放级别配置：**

| 级别 | samplesPerPixel | 用途 | 像素/秒 |
|------|-----------------|------|---------|
| overview | 1000 | 全局概览 | 10px/s |
| detail | 100 | 标准视图 | 100px/s |
| zoom | 10 | 细节查看 | 1000px/s |

#### 2.3 API 设计

```
GET    /api/v2/audio/:id/waveform                      # 获取波形数据
POST   /api/v2/audio/:id/waveform/generate             # 触发波形生成
DELETE /api/v2/audio/:id/waveform                      # 清除波形缓存
```

**获取波形数据请求示例：**

```typescript
interface GetWaveformDataRequest {
  audioId: string;
  zoomLevel: 'overview' | 'detail' | 'zoom';
  startTime?: number;
  endTime?: number;
  width?: number; // 请求的像素宽度
}
```

#### 2.4 后端实现

**波形服务核心逻辑：**

```typescript
@Injectable()
export class WaveformService {
  private readonly ZOOM_LEVELS = {
    overview: { samplesPerPixel: 1000, segmentSize: 1000 },
    detail: { samplesPerPixel: 100, segmentSize: 500 },
    zoom: { samplesPerPixel: 10, segmentSize: 200 }
  };

  async getWaveformData(
    audioId: string,
    zoomLevel: 'overview' | 'detail' | 'zoom',
    startTime: number,
    endTime: number,
    width: number
  ): Promise<WaveformData> {
    const config = this.ZOOM_LEVELS[zoomLevel];
    const segmentStart = Math.floor(startTime / config.segmentSize);
    
    // 1. 尝试从缓存获取
    const cached = await this.waveformRepo.findOne({
      where: {
        audio_id: audioId,
        zoom_level: zoomLevel,
        segment_start: segmentStart
      }
    });

    if (cached) {
      return this.decompressWaveformData(cached.data);
    }

    // 2. 缓存未命中，生成波形
    return await this.generateWaveformData(
      audioId,
      zoomLevel,
      startTime,
      endTime,
      width
    );
  }

  private async generateWaveformData(
    audioId: string,
    zoomLevel: string,
    startTime: number,
    endTime: number,
    width: number
  ): Promise<WaveformData> {
    // 1. 从 MinIO 下载音频
    const audioBuffer = await this.minioService.getAudio(audioId);

    // 2. 解码音频（使用 Node.js 兼容的音频解码库）
    // 注意：需要在后端技术栈中添加 audio-decode 或类似库
    const { decodeAudio } = require('audio-decode');
    const audioDecoded = await decodeAudio(audioBuffer);

    // 3. 提取波形数据
    // audio-decode 返回格式: { sampleRate, channelData: [[channel0...], [channel1...]] }
    const channelData = audioDecoded.channelData[0]; // 使用第一声道
    const samplesPerPixel = Math.floor(channelData.length / width);

    const waveform: number[] = [];
    for (let i = 0; i < width; i++) {
      const start = i * samplesPerPixel;
      const end = start + samplesPerPixel;
      let min = 1;
      let max = -1;

      for (let j = start; j < end; j++) {
        if (channelData[j] < min) min = channelData[j];
        if (channelData[j] > max) max = channelData[j];
      }

      waveform.push(max, min);
    }

    // 4. 压缩并缓存
    const compressed = this.compressWaveformData(waveform);
    await this.saveWaveformCache(audioId, zoomLevel, startTime, compressed);

    return {
      audioId,
      zoomLevel,
      startTime,
      endTime,
      samplesPerPixel,
      data: waveform,
      totalSamples: channelData.length
    };
  }

  private compressWaveformData(data: number[]): Buffer {
    const pako = require('pako');
    const json = JSON.stringify(data);
    return Buffer.from(pako.deflate(json));
  }
}
```

#### 2.5 前端实现

**多级波形渲染组件特性：**

- 瓦片加载策略，只渲染可见区域
- 鼠标滚轮缩放，自动切换缩放级别
- Web Worker 进行波形数据处理
- 支持拖拽、点击跳转

**关键实现：**

```typescript
class WaveformTileManager {
  private tiles = new Map<string, WaveformTile>();
  private tileWidth = 1000; // 每个瓦片 1000 像素
  private loadingTiles = new Set<string>(); // 正在加载的瓦片

  async loadVisibleTiles(zoomLevel: string, viewWindow: { start: number; end: number }) {
    const config = ZOOM_LEVELS[zoomLevel];
    const startTile = Math.floor(viewWindow.start * config.pixelsPerSecond / this.tileWidth);
    const endTile = Math.ceil(viewWindow.end * config.pixelsPerSecond / this.tileWidth);

    const tilesToLoad: number[] = [];
    for (let i = startTile; i <= endTile; i++) {
      const key = `${zoomLevel}-${i}`;
      if (!this.tiles.has(key) && !this.loadingTiles.has(key)) {
        tilesToLoad.push(i);
      }
    }

    if (tilesToLoad.length === 0) {
      return;
    }

    try {
      const results = await Promise.allSettled(
        tilesToLoad.map(async (tileIndex) => {
          return this.loadTile(zoomLevel, tileIndex);
        })
      );

      results.forEach((result, index) => {
        const tileIndex = tilesToLoad[index];
        const key = `${zoomLevel}-${tileIndex}`;

        if (result.status === 'fulfilled') {
          this.tiles.set(key, result.value);
        } else {
          console.error(`Failed to load tile ${key}:`, result.reason);
        }
        this.loadingTiles.delete(key);
      });
    } catch (error) {
      console.error('Error loading waveform tiles:', error);
      throw error;
    }
  }

  private async loadTile(zoomLevel: string, tileIndex: number): Promise<WaveformTile> {
    const key = `${zoomLevel}-${tileIndex}`;
    this.loadingTiles.add(key);

    try {
      // 从服务端加载波形瓦片
      const tileData = await waveformService.getTile(audioId, zoomLevel, tileIndex);

      return {
        index: tileIndex,
        zoomLevel,
        data: tileData.data,
        samplesPerPixel: tileData.samplesPerPixel,
        startTime: tileIndex * this.tileWidth / ZOOM_LEVELS[zoomLevel].pixelsPerSecond,
        endTime: (tileIndex + 1) * this.tileWidth / ZOOM_LEVELS[zoomLevel].pixelsPerSecond
      };
    } catch (error) {
      console.error(`Error loading tile ${key}:`, error);
      throw error;
    }
  }

  getTile(zoomLevel: string, tileIndex: number): WaveformTile | undefined {
    return this.tiles.get(`${zoomLevel}-${tileIndex}`);
  }

  clearTiles(zoomLevel?: string) {
    if (zoomLevel) {
      this.tiles.forEach((_, key) => {
        if (key.startsWith(`${zoomLevel}-`)) {
          this.tiles.delete(key);
        }
      });
    } else {
      this.tiles.clear();
    }
    this.loadingTiles.clear();
  }
}

// 波形缩放级别配置
const ZOOM_LEVELS = {
  overview: {
    samplesPerPixel: 1000,
    segmentSize: 1000,
    pixelsPerSecond: 10
  },
  detail: {
    samplesPerPixel: 100,
    segmentSize: 500,
    pixelsPerSecond: 100
  },
  zoom: {
    samplesPerPixel: 10,
    segmentSize: 200,
    pixelsPerSecond: 1000
  }
};

interface WaveformTile {
  index: number;
  zoomLevel: string;
  data: number[]; // 波形数据
  samplesPerPixel: number;
  startTime: number;
  endTime: number;
}
```

---

### 3. AI 流式推送

#### 3.1 设计目标

- 实时推送 AI 处理进度，用户可边等边看
- 支持断点续传，处理失败可从断点恢复
- 细粒度进度反馈（下载、分段、转写、后处理）
- 流式推送处理结果，无需等待全部完成

#### 3.2 数据库设计

**说明**：AI 流式推送相关的数据库表定义详见 [数据库设计](#数据库设计) 章节：
- `ai_job_progress`（第17节）
- `ai_result_chunks`（第18节）
- `ai_jobs.result_summary`（第16节，存储处理结果摘要）

**数据存储策略**：
- `ai_jobs.result_summary`：存储统计信息（总段数、识别语言、平均置信度等），用于快速查询
- `ai_result_chunks`：存储完整的分片处理结果，支持流式推送和断点续传
- `ai_job_progress`：存储多阶段处理进度，支持细粒度进度反馈

#### 3.3 WebSocket 事件设计

```typescript
// AI 进度推送事件
interface AIProgressEvent {
  type: 'ai-job-progress';
  data: {
    jobId: string;
    audioId: string;
    stage: 'downloading' | 'segmentation' | 'asr' | 'diarization' | 'postprocessing';
    currentSegment: number;
    totalSegments: number;
    stageProgress: number; // 0-100
    overallProgress: number; // 0-100
    estimatedTimeRemaining: number;
    currentOperation: string;
  };
}

// 分段结果推送事件
interface AISegmentResultEvent {
  type: 'ai-segment-result';
  data: {
    jobId: string;
    audioId: string;
    segmentIndex: number;
    segment: {
      id: string;
      startTime: number;
      endTime: number;
      transcript?: string;
      speaker?: string;
      confidence?: number;
    };
  };
}

// 任务完成事件
interface AIJobCompletedEvent {
  type: 'ai-job-completed';
  data: {
    jobId: string;
    audioId: string;
    jobType: string;
    result: any;
    duration: number;
  };
}

// 任务失败事件
interface AIJobFailedEvent {
  type: 'ai-job-failed';
  data: {
    jobId: string;
    audioId: string;
    error: string;
    stage: string;
  };
}
```

#### 3.4 后端实现

**AI 流式推送服务：**

```typescript
@Injectable()
export class AIStreamService {
  async updateJobProgress(
    jobId: string,
    stage: string,
    currentSegment: number,
    totalSegments: number,
    stageProgress: number,
    overallProgress: number,
    estimatedTimeRemaining?: number,
    currentOperation?: string
  ) {
    // 1. 更新数据库
    await this.progressRepo.upsert({
      job_id: jobId,
      stage,
      current_segment: currentSegment,
      total_segments: totalSegments,
      stage_progress: stageProgress,
      overall_progress: overallProgress,
      estimated_time_remaining: estimatedTimeRemaining,
      current_operation: currentOperation
    }, ['job_id', 'stage']);

    // 2. 推送到前端
    this.webSocketGateway.server.to(`job-${jobId}`).emit('ai-job-progress', {
      jobId,
      stage,
      currentSegment,
      totalSegments,
      stageProgress,
      overallProgress,
      estimatedTimeRemaining,
      currentOperation
    });
  }

  async pushSegmentResult(
    jobId: string,
    audioId: string,
    segmentIndex: number,
    segmentData: any
  ) {
    // 1. 保存分片结果
    await this.aiResultRepo.save({
      job_id: jobId,
      chunk_index: segmentIndex,
      chunk_type: 'segment',
      start_time: segmentData.start_time,
      end_time: segmentData.end_time,
      data: segmentData
    });

    // 2. 推送到前端
    this.webSocketGateway.server.to(`job-${jobId}`).emit('ai-segment-result', {
      jobId,
      audioId,
      segmentIndex,
      segment: segmentData
    });
  }
}
```

#### 3.5 Python AI 服务实现

**流式 ASR Worker：**

```python
class StreamingASRWorker:
    def __init__(self, model_name: str):
        self.model = whisper.load_model(model_name)
        
    async def process_audio_streaming(
        self, 
        audio_path: str,
        job_id: str,
        progress_callback: callable
    ) -> AsyncGenerator[dict, None]:
        """流式处理音频，实时推送结果"""
        
        # 阶段 1: 下载音频
        await progress_callback(
            job_id=job_id,
            stage='downloading',
            current_segment=0,
            total_segments=1,
            stage_progress=0,
            overall_progress=5,
            current_operation='正在下载音频文件'
        )
        
        # 模拟下载
        await asyncio.sleep(1)
        
        # 阶段 2: 分段
        segments = self.vad_segment(audio_path)
        total_segments = len(segments)
        
        await progress_callback(
            job_id=job_id,
            stage='segmentation',
            current_segment=total_segments,
            total_segments=total_segments,
            stage_progress=100,
            overall_progress=20,
            current_operation=f'检测到 {total_segments} 个语音片段'
        )
        
        # 阶段 3: ASR 转写（流式推送结果）
        for i, segment in enumerate(segments):
            start_time = time.time()
            
            await progress_callback(
                job_id=job_id,
                stage='asr',
                current_segment=i,
                total_segments=total_segments,
                stage_progress=(i / total_segments) * 100,
                overall_progress=20 + (i / total_segments) * 60,
                current_operation=f'正在转写第 {i + 1}/{total_segments} 段'
            )
            
            # 处理该段音频
            result = self.model.transcribe(
                segment['audio'],
                language='zh',
                word_timestamps=True
            )
            
            # 推送结果
            yield {
                'type': 'segment_result',
                'segment_index': i,
                'start_time': segment['start'],
                'end_time': segment['end'],
                'transcript': result['text'],
                'words': result['segments'][0]['words'],
                'confidence': self.calculate_confidence(result)
            }
            
            # 计算剩余时间
            elapsed = time.time() - start_time
            remaining = elapsed * (total_segments - i - 1)
            
            await progress_callback(
                job_id=job_id,
                stage='asr',
                current_segment=i + 1,
                total_segments=total_segments,
                stage_progress=((i + 1) / total_segments) * 100,
                overall_progress=20 + ((i + 1) / total_segments) * 60,
                estimated_time_remaining=remaining,
                current_operation=f'第 {i + 1}/{total_segments} 段转写完成'
            )
```

#### 3.6 前端实现

**AI 进度面板组件：**

- 显示多阶段进度（下载、分段、转写、后处理）
- 实时显示当前操作和剩余时间
- 实时结果预览，支持点击跳转
- 支持断点续传

**关键实现：**

```typescript
const { status, data, send, close, open } = useWebSocket(
  `ws://localhost:3000?jobId=${props.jobId}`,
  {
    onMessage(ws, event) {
      const message = JSON.parse(event.data);
      
      switch (message.type) {
        case 'ai-job-progress':
          progress.value = message.data;
          break;
          
        case 'ai-segment-result':
          segmentResults.value.push(message.data.segment);
          break;
          
        case 'ai-job-completed':
          progress.value = null;
          // 通知用户处理完成
          break;
          
        case 'ai-job-failed':
          // 显示错误信息
          console.error('AI 任务失败:', message.data.error);
          break;
      }
    },
    autoReconnect: true
  }
);
```

---

### 4. 时间范围标注加载

#### 4.1 设计目标

- 只加载当前可视时间范围内的标注
- 减少初始加载时间，提升响应速度
- 支持游标分页，避免深分页性能问题
- 智能预加载，提供流畅体验

#### 4.2 API 设计

```
GET    /api/v2/audio/:id/annotations/range            # 按时间范围获取标注
```

**请求参数：**

```typescript
interface GetAnnotationsByTimeRangeRequest {
  audioId: string;
  startTime: number;
  endTime: number;
  layers?: string[]; // 指定加载哪些层
  includeDeleted?: boolean;
  limit?: number;
  cursor?: string; // 游标分页
}
```

**响应格式：**

```typescript
interface GetAnnotationsByTimeRangeResponse {
  success: true;
  data: {
    annotations: Annotation[];
    totalCount: number;
    hasNext: boolean;
    nextCursor?: string;
    timeRange: {
      startTime: number;
      endTime: number;
    };
  };
}
```

**游标分页设计：**

```typescript
interface AnnotationCursor {
  lastAnnotationId: string;
  lastStartTime: number;
}
```

#### 4.3 后端实现

**标注服务时间范围查询：**

```typescript
async getAnnotationsByTimeRange(
  audioId: string,
  startTime: number,
  endTime: number,
  options: {
    layers?: string[];
    includeDeleted?: boolean;
    limit?: number;
    cursor?: string;
  } = {}
): Promise<GetAnnotationsByTimeRangeResponse> {
  const { layers, includeDeleted, limit = 100, cursor } = options;
  
  // 1. 构建查询
  const queryBuilder = this.annotationRepo
    .createQueryBuilder('annotation')
    .where('annotation.audio_id = :audioId', { audioId })
    .andWhere('annotation.start_time < :endTime', { endTime })
    .andWhere('annotation.end_time > :startTime', { startTime });
  
  if (!includeDeleted) {
    queryBuilder.andWhere('annotation.deleted_at IS NULL');
  }
  
  if (layers && layers.length > 0) {
    queryBuilder.andWhere('annotation.layer_id IN (:...layers)', { layers });
  }
  
  // 游标分页
  if (cursor) {
    const cursorData: AnnotationCursor = JSON.parse(
      Buffer.from(cursor, 'base64').toString()
    );
    
    queryBuilder.andWhere(
      '(annotation.start_time > :lastStartTime OR ' +
      '(annotation.start_time = :lastStartTime AND annotation.id > :lastId))',
      {
        lastStartTime: cursorData.lastStartTime,
        lastId: cursorData.lastAnnotationId
      }
    );
  }
  
  queryBuilder
    .orderBy('annotation.start_time', 'ASC')
    .addOrderBy('annotation.id', 'ASC')
    .limit(limit + 1); // 多取一条判断是否有下一页
  
  // 2. 执行查询
  const annotations = await queryBuilder.getMany();
  
  // 3. 处理分页
  const hasNext = annotations.length > limit;
  const resultAnnotations = hasNext ? annotations.slice(0, -1) : annotations;
  
  // 4. 生成下一页游标
  let nextCursor: string | undefined;
  if (hasNext && resultAnnotations.length > 0) {
    const lastAnnotation = resultAnnotations[resultAnnotations.length - 1];
    const cursorData: AnnotationCursor = {
      lastAnnotationId: lastAnnotation.id,
      lastStartTime: lastAnnotation.start_time
    };
    nextCursor = Buffer.from(JSON.stringify(cursorData)).toString('base64');
  }
  
  return {
    success: true,
    data: {
      annotations: resultAnnotations,
      totalCount: await this.getCountByTimeRange(audioId, startTime, endTime, options),
      hasNext,
      nextCursor,
      timeRange: {
        startTime,
        endTime
      }
    };
  }

  // 计算时间范围内的标注总数
  private async getCountByTimeRange(
    audioId: string,
    startTime: number,
    endTime: number,
    options: { includeDeleted?: boolean; layers?: string[] } = {}
  ): Promise<number> {
    const { includeDeleted, layers } = options;

    const queryBuilder = this.annotationRepo
      .createQueryBuilder('annotation')
      .where('annotation.audio_id = :audioId', { audioId })
      .andWhere('annotation.start_time < :endTime', { endTime })
      .andWhere('annotation.end_time > :startTime', { startTime });

    if (!includeDeleted) {
      queryBuilder.andWhere('annotation.deleted_at IS NULL');
    }

    if (layers && layers.length > 0) {
      queryBuilder.andWhere('annotation.layer_id IN (:...layers)', { layers });
    }

    return await queryBuilder.getCount();
  }
}
```

#### 4.4 前端实现

**标注范围加载器：**

```typescript
export function useAnnotationRangeLoader(audioId: string) {
  const audioStore = useAudioStore();
  
  const annotations = ref<Annotation[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const cursor = ref<string | null>(null);
  const hasNext = ref(false);
  
  // 缓存管理
  const cache = new Map<string, Annotation[]>();
  const cacheKey = (start: number, end: number) => `${start}-${end}`;
  
  // 预加载配置
  const PRELOAD_SECONDS = 120; // 前后各预加载 2 分钟
  const CACHE_TTL = 10 * 60 * 1000; // 缓存 10 分钟
  
  // 计算当前可视时间范围
  const visibleRange = computed(() => {
    const currentTime = audioStore.currentTime;
    return {
      start: Math.max(0, currentTime - 30), // 前 30 秒
      end: Math.min(audioStore.currentAudio.duration, currentTime + 30) // 后 30 秒
    };
  });
  
  // 计算需要加载的时间范围（包含预加载）
  const loadRange = computed(() => ({
    start: Math.max(0, visibleRange.value.start - PRELOAD_SECONDS),
    end: Math.min(
      audioStore.currentAudio.duration,
      visibleRange.value.end + PRELOAD_SECONDS
    )
  }));
  
  // 加载标注
  async function loadAnnotations(range: { start: number; end: number }) {
    const key = cacheKey(range.start, range.end);
    
    // 检查缓存
    if (cache.has(key)) {
      annotations.value = cache.get(key)!;
      return;
    }
    
    loading.value = true;
    error.value = null;
    
    try {
      const response = await annotationService.getAnnotationsByTimeRange(
        audioId,
        range.start,
        range.end,
        {
          limit: 500,
          cursor: cursor.value || undefined
        }
      );
      
      annotations.value = response.data.annotations;
      hasNext.value = response.data.hasNext;
      cursor.value = response.data.nextCursor || null;
      
      // 缓存结果
      cache.set(key, annotations.value);
      
      // 清理过期缓存
      setTimeout(() => {
        cache.delete(key);
      }, CACHE_TTL);
      
    } catch (e: any) {
      error.value = e.message;
      console.error('加载标注失败:', e);
    } finally {
      loading.value = false;
    }
  }
  
  // 监听播放位置变化，自动加载
  watch(
    () => [visibleRange.value.start, visibleRange.value.end],
    async ([start, end]) => {
      // 只有当需要加载的范围与当前加载范围差异较大时才重新加载
      const currentKey = cacheKey(loadRange.value.start, loadRange.value.end);
      const newKey = cacheKey(
        Math.max(0, start - PRELOAD_SECONDS),
        Math.min(audioStore.currentAudio.duration, end + PRELOAD_SECONDS)
      );

      if (currentKey !== newKey) {
        await loadAnnotations({
          start: Math.max(0, start - PRELOAD_SECONDS),
          end: Math.min(audioStore.currentAudio.duration, end + PRELOAD_SECONDS)
        });
      }
    },
    { immediate: true }
  );

  // 加载更多标注（游标分页）
  async function loadMore() {
    if (!hasNext.value || loading.value) {
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      const response = await annotationService.getAnnotationsByTimeRange(
        audioId,
        loadRange.value.start,
        loadRange.value.end,
        {
          limit: 500,
          cursor: cursor.value || undefined
        }
      );

      // 追加新数据
      annotations.value = [...annotations.value, ...response.data.annotations];
      hasNext.value = response.data.hasNext;
      cursor.value = response.data.nextCursor || null;

    } catch (e: any) {
      error.value = e.message;
      console.error('加载更多标注失败:', e);
    } finally {
      loading.value = false;
    }
  }

  // 重置加载状态
  function reset() {
    annotations.value = [];
    cursor.value = null;
    hasNext.value = false;
    error.value = null;
    cache.clear();
  }

  return {
    annotations,
    loading,
    error,
    hasNext,
    loadMore,
    loadAnnotations,
    reset
  };
}

// 类型定义补充
interface AnnotationRange {
  start: number;
  end: number;
}

interface AnnotationCursor {
  lastAnnotationId: string;
  lastStartTime: number;
}
```

**标注时间轴组件：**

- 显示时间轴标尺
- 按图层显示标注块
- 播放指针跟随
- 支持点击跳转、拖拽选择
- 滚动加载更多标注

**性能优化：**

- 只渲染可视区域的标注块
- 使用虚拟滚动技术
- 标注块合并显示（过短标注）
- LRU 缓存策略限制内存占用

---

### 优化效果预期

| 优化项 | 优化前 | 优化后 | 提升 |
|--------|--------|--------|------|
| 10小时音频初始加载 | 30s+ | 2s | 15x |
| 波形渲染 | 卡顿、内存溢出 | 流畅 60fps | - |
| AI 处理反馈 | 无反馈，等待10分钟+ | 实时进度，可预览 | 用户体验大幅提升 |
| 标注列表加载 | 5s（全部） | 0.5s（可视范围） | 10x |
| 内存占用 | 500MB+ | 150MB | 3x |