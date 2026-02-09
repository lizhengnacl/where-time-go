# Where Time Go (时光流转)

一个简约高效的个人时间记录与分析工具，支持 AI 辅助标签推荐和多维度可视化分析。

## 🚀 快速启动

### 1. 环境准备

- Node.js >= 18
- pnpm >= 8

### 2. 安装依赖

```bash
pnpm install
```

### 3. 配置环境变量

复制 `.env.example` 为 `.env` 并配置必要的变量（如 OpenAI Key）：

```bash
cp .env.example .env
```

### 4. 生产模式启动

构建前端静态资源并启动后端托管服务：

```bash
pnpm build
pnpm start
```

启动后，可以通过控制台显示的 `Local` 或 `Network` (局域网) 地址访问应用。

---

## 🛠 开发与调试

### 1. 开启开发模式

同时启动前端开发服务器（带热更新）和后端 API 服务：

```bash
pnpm dev
```

- **前端地址**: `http://localhost:3001`
- **后端地址**: `http://localhost:3000`
- **代理逻辑**: 前端请求 `/api/*` 会自动代理到后端服务，无需担心跨域问题。

### 2. 存储方式切换

应用支持本地存储和远端存储切换，可在 `src/lib/storage.ts` 中修改：

```typescript
// src/lib/storage.ts

// 选项 A: 仅本地存储 (LocalStorage)
export const storage = localStorageDriver;

// 选项 B: 远端同步存储 (Server API)
// export const storage = apiStorageDriver;
```

### 3. 局域网调试

在运行 `pnpm start` 或 `pnpm dev` 时，控制台会输出 `Network` 地址。你可以使用手机扫描或直接访问该 IP 地址，在真实设备上调试交互体验。

---

## 📂 项目结构

- `src/`: React 前端源码
  - `components/`: 复用组件（时间轴、卡片等）
  - `context/`: 状态管理 (ScheduleContext)
  - `lib/storage.ts`: 存储层抽象（支持 Local/Remote 切换）
  - `pages/`: 页面组件（主页、分析页、历史页）
- `server/`: Node.js (Koa) 后端源码
  - `routes/`: API 路由定义
  - `data.json`: 远端存储模式下的数据文件
- `dist/`: 前端构建产物（由 `pnpm build` 生成）

---

## 📝 技术栈

- **前端**: React, Rsbuild, Tailwind CSS, NextUI, Framer Motion, Recharts
- **后端**: Koa, Node.js
- **工具**: Concurrently, Typescript
