# Audio Label Pro - 快速启动指南

## 一、环境要求

- Node.js >= 20.0.0
- Python >= 3.11
- Docker & Docker Compose（推荐）

## 二、快速启动（推荐）

### 1. 启动 Docker 服务

```powershell
npm run docker:up
```

等待所有服务启动完成。

### 2. 运行初始化脚本

```powershell
.\scripts\init.ps1
```

按照脚本提示完成环境配置和依赖安装。

### 3. 启动所有服务

```powershell
.\scripts\start.ps1
```

这将在新的终端窗口中启动后端、前端和 AI 服务。

### 4. 访问应用

- 前端: http://localhost:5173
- 后端 API: http://localhost:3000/api
- AI 服务: http://localhost:8000
- MinIO 控制台: http://localhost:9001

## 三、手动启动

### 1. 启动 Docker 服务

```powershell
npm run docker:up
```

### 2. 配置环境变量

```powershell
# 后端
cd backend
Copy-Item .env.example .env

# AI 服务
cd ..\ai-service
Copy-Item .env.example .env

# 前端
cd ..\frontend
Copy-Item .env.example .env
```

### 3. 安装依赖

```powershell
# 安装所有依赖
npm run install:all

# 或分别安装
npm install
cd frontend && npm install
cd ..\backend && npm install
cd ..\ai-service && pip install -r requirements.txt
```

### 4. 启动服务

打开三个终端窗口，分别运行：

**终端 1 - 后端:**
```powershell
npm run dev:backend
```

**终端 2 - 前端:**
```powershell
npm run dev:frontend
```

**终端 3 - AI 服务:**
```powershell
npm run dev:ai
```

## 四、常见问题

### 1. Docker 服务启动失败

检查端口是否被占用：
```powershell
netstat -ano | findstr "5432"
netstat -ano | findstr "6379"
netstat -ano | findstr "9000"
```

### 2. 依赖安装失败

尝试清理缓存后重新安装：
```powershell
npm run clean
npm run install:all
```

### 3. Python 依赖安装失败

确保 Python 版本 >= 3.11，然后：
```powershell
cd ai-service
pip install --upgrade pip
pip install -r requirements.txt
```

### 4. 端口被占用

修改对应服务的环境变量中的端口配置。

## 五、停止服务

### 停止 Docker 服务

```powershell
npm run docker:down
```

### 停止开发服务器

在各个终端窗口按 `Ctrl + C`

## 六、更多命令

```powershell
# 构建项目
npm run build

# 清理项目
npm run clean

# 查看日志
npm run docker:logs

# 查看服务状态
npm run docker:ps
```

## 七、下一步

- 阅读 [README.md](./README.md) 了解项目详情
- 查看 [需求文档](./docs/requirements.md) 了解功能需求
- 查看 [技术方案](./docs/technical-specification.md) 了解技术架构
- 查看 [设计系统](./docs/design-system.md) 了解设计规范

---

**需要帮助？** 请查看项目文档或提交 Issue。