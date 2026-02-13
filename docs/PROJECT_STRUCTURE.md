# Audio Label Pro - 项目结构说明

## 目录结构

```
audio-label-pro/
├── frontend/                  # Vue 3 前端应用
│   ├── src/
│   │   ├── assets/           # 静态资源
│   │   │   └── styles/       # 全局样式
│   │   ├── components/       # 公共组件
│   │   ├── composables/      # 组合式函数
│   │   ├── layouts/          # 布局组件
│   │   ├── pages/            # 页面组件
│   │   │   ├── HomePage.vue         # 首页
│   │   │   ├── LoginPage.vue        # 登录页
│   │   │   ├── AudioListPage.vue    # 音频列表
│   │   │   ├── AnnotationPage.vue   # 标注界面
│   │   │   ├── ReviewPage.vue       # 审核界面
│   │   │   └── TaskListPage.vue     # 任务列表
│   │   ├── router/           # 路由配置
│   │   ├── services/         # API 服务
│   │   ├── stores/           # Pinia 状态管理
│   │   ├── types/            # TypeScript 类型定义
│   │   ├── utils/            # 工具函数
│   │   ├── App.vue           # 根组件
│   │   └── main.ts           # 应用入口
│   ├── public/               # 公共静态资源
│   ├── tailwind.config.js    # Tailwind CSS 配置
│   ├── postcss.config.js     # PostCSS 配置
│   ├── vite.config.ts        # Vite 配置
│   ├── tsconfig.json         # TypeScript 配置
│   ├── package.json          # 前端依赖
│   └── .env.example          # 环境变量模板
│
├── backend/                   # NestJS 后端服务
│   ├── src/
│   │   ├── auth/             # 认证模块
│   │   ├── users/            # 用户模块
│   │   ├── projects/         # 项目模块
│   │   ├── audio/            # 音频模块
│   │   ├── annotations/      # 标注模块
│   │   ├── ai/               # AI 模块
│   │   ├── collaboration/    # 协作模块
│   │   ├── tasks/            # 任务模块
│   │   ├── export/           # 导出模块
│   │   ├── notifications/    # 通知模块
│   │   ├── common/           # 公共模块
│   │   ├── config/           # 配置模块
│   │   ├── database/         # 数据库模块
│   │   ├── app.module.ts     # 应用模块
│   │   └── main.ts           # 应用入口
│   ├── database/             # 数据库相关
│   │   └── migrations/       # 数据库迁移文件
│   ├── test/                 # 测试文件
│   ├── nest-cli.json         # NestJS CLI 配置
│   ├── tsconfig.json         # TypeScript 配置
│   ├── package.json          # 后端依赖
│   └── .env.example          # 环境变量模板
│
├── ai-service/                # FastAPI AI 服务
│   ├── app/
│   │   ├── api/              # API 路由
│   │   │   ├── endpoints/    # API 端点
│   │   │   │   ├── asr.py                # ASR 端点
│   │   │   │   ├── speaker_diarization.py # 说话人分离端点
│   │   │   │   └── segmentation.py       # 分段端点
│   │   │   └── __init__.py
│   │   ├── core/             # 核心配置
│   │   │   ├── config.py     # 配置管理
│   │   │   └── __init__.py
│   │   ├── models/           # 模型定义
│   │   ├── services/         # 业务服务
│   │   ├── tasks/            # 异步任务
│   │   ├── utils/            # 工具函数
│   │   ├── __init__.py
│   │   └── main.py           # 应用入口
│   ├── requirements.txt      # Python 依赖
│   └── .env.example          # 环境变量模板
│
├── docker/                    # Docker 配置
│   ├── postgres/             # PostgreSQL 配置
│   │   └── init.sql          # 数据库初始化脚本
│   ├── redis/                # Redis 配置
│   └── minio/                # MinIO 配置
│
├── docs/                      # 项目文档
│   ├── design-system.json    # 设计系统配置
│   ├── design-system.md      # 设计系统文档
│   ├── requirements.md       # 需求文档
│   ├── technical-specification.md  # 技术方案
│   ├── component-design/     # 组件设计文档
│   ├── design-guidelines/    # 设计指南
│   ├── html-prototype/       # HTML 原型
│   ├── prd/                  # 产品需求文档
│   ├── prototype/            # 原型设计
│   └── PROJECT_STRUCTURE.md  # 项目结构说明（本文件）
│
├── scripts/                   # 脚本文件
│   ├── init.ps1              # 初始化脚本
│   └── start.ps1             # 启动脚本
│
├── .github/                   # GitHub 配置
│   └── workflows/            # GitHub Actions 工作流
│
├── .gitignore                 # Git 忽略文件
├── .iflow/                    # iFlow CLI 配置
├── docker-compose.yml         # Docker Compose 配置
├── package.json               # 项目根依赖
├── README.md                  # 项目说明
└── QUICKSTART.md              # 快速启动指南
```

## 模块说明

### 前端模块

| 目录 | 说明 |
|------|------|
| `assets/` | 静态资源（图片、样式、字体等） |
| `components/` | 可复用的 Vue 组件 |
| `composables/` | Vue 3 组合式函数 |
| `layouts/` | 页面布局组件 |
| `pages/` | 页面组件 |
| `router/` | 路由配置 |
| `services/` | API 请求服务 |
| `stores/` | Pinia 状态管理 |
| `types/` | TypeScript 类型定义 |
| `utils/` | 工具函数 |

### 后端模块

| 目录 | 说明 |
|------|------|
| `auth/` | 用户认证和授权 |
| `users/` | 用户管理 |
| `projects/` | 项目管理 |
| `audio/` | 音频文件管理 |
| `annotations/` | 标注管理 |
| `ai/` | AI 服务集成 |
| `collaboration/` | 实时协作 |
| `tasks/` | 任务管理 |
| `export/` | 数据导出 |
| `notifications/` | 通知系统 |
| `common/` | 公共工具和装饰器 |
| `config/` | 配置管理 |
| `database/` | 数据库配置和迁移 |

### AI 服务模块

| 目录 | 说明 |
|------|------|
| `api/` | API 路由定义 |
| `core/` | 核心配置和工具 |
| `models/` | AI 模型管理 |
| `services/` | 业务逻辑服务 |
| `tasks/` | Celery 异步任务 |
| `utils/` | 工具函数 |

## 技术栈对应关系

### 前端技术栈

| 技术 | 用途 | 配置文件 |
|------|------|----------|
| Vue 3 | 核心框架 | `vite.config.ts` |
| TypeScript | 类型系统 | `tsconfig.json` |
| Vite | 构建工具 | `vite.config.ts` |
| Tailwind CSS | CSS 框架 | `tailwind.config.js` |
| Pinia | 状态管理 | `src/stores/` |
| Vue Router | 路由管理 | `src/router/` |
| Element Plus | UI 组件库 | `main.ts` |

### 后端技术栈

| 技术 | 用途 | 配置文件 |
|------|------|----------|
| NestJS | 应用框架 | `nest-cli.json` |
| Fastify | HTTP 服务器 | `main.ts` |
| TypeORM | ORM | `src/database/` |
| PostgreSQL | 数据库 | `docker-compose.yml` |
| Redis | 缓存/队列 | `docker-compose.yml` |
| Socket.io | 实时通信 | `src/collaboration/` |
| Bull | 任务队列 | `src/common/` |

### AI 服务技术栈

| 技术 | 用途 | 配置文件 |
|------|------|----------|
| FastAPI | Web 框架 | `app/main.py` |
| PyTorch | 深度学习 | `requirements.txt` |
| Whisper | 语音识别 | `app/services/` |
| Pyannote.audio | 说话人分离 | `app/services/` |
| Celery | 任务队列 | `app/tasks/` |
| Redis | 消息代理 | `app/core/config.py` |

## 开发流程

### 1. 添加新功能

```bash
# 前端
frontend/src/pages/NewPage.vue
frontend/src/components/NewComponent.vue
frontend/src/services/newService.ts

# 后端
backend/src/new-feature/
backend/src/new-feature/new-feature.module.ts
backend/src/new-feature/new-feature.controller.ts
backend/src/new-feature/new-feature.service.ts
```

### 2. 添加新 API

```typescript
// 前端服务
frontend/src/services/api/newApi.ts

// 后端控制器
backend/src/api/new-api.controller.ts

// AI 服务端点
ai-service/app/api/endpoints/new_endpoint.py
```

### 3. 数据库变更

```bash
# 创建迁移文件
cd backend
npm run migration:generate -- --name=NewMigration

# 运行迁移
npm run migration:run
```

## 配置文件说明

### 根目录配置

| 文件 | 说明 |
|------|------|
| `package.json` | 项目依赖和脚本 |
| `docker-compose.yml` | Docker 服务配置 |
| `.gitignore` | Git 忽略规则 |

### 前端配置

| 文件 | 说明 |
|------|------|
| `vite.config.ts` | Vite 构建配置 |
| `tsconfig.json` | TypeScript 配置 |
| `tailwind.config.js` | Tailwind CSS 配置 |
| `postcss.config.js` | PostCSS 配置 |
| `.env.example` | 环境变量模板 |

### 后端配置

| 文件 | 说明 |
|------|------|
| `nest-cli.json` | NestJS CLI 配置 |
| `tsconfig.json` | TypeScript 配置 |
| `.env.example` | 环境变量模板 |

### AI 服务配置

| 文件 | 说明 |
|------|------|
| `requirements.txt` | Python 依赖 |
| `.env.example` | 环境变量模板 |

## 扩展阅读

- [README.md](../README.md) - 项目总览
- [QUICKSTART.md](../QUICKSTART.md) - 快速启动指南
- [需求文档](./requirements.md) - 功能需求
- [技术方案](./technical-specification.md) - 技术架构
- [设计系统](./design-system.md) - 设计规范