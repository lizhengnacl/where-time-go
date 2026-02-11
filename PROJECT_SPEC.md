# 迹时 (Timary) 项目规范说明文档

本文档旨在梳理当前项目的技术栈、构建流程、代码规范及设计风格，为后续项目的快速复用提供参考。

---

## 1. 技术栈 (Technology Stack)

### **前端 (Frontend)**

- **框架**: [React 18](https://react.dev/) (TSX)
- **构建工具**: [Rsbuild](https://rsbuild.dev/) (基于 Rspack，极速编译)
- **UI 组件库**: [NextUI](https://nextui.org/) (基于 Tailwind CSS 的现代组件库)
- **样式**: [Tailwind CSS](https://tailwindcss.com/) (原子化 CSS)
- **状态管理**: React Context API (用于日程数据 `ScheduleContext` 和主题 `ThemeContext`)
- **路由**: [React Router 6](https://reactrouter.com/)
- **动画**: [Framer Motion](https://www.framer.com/motion/) (流畅的交互动画)
- **图标**: [Lucide React](https://lucide.dev/)

### **后端 (Backend)**

- **运行时**: Node.js (>=18)
- **Web 框架**: [Koa2](https://koajs.com/)
- **路由**: `@koa/router`
- **身份验证**: JWT (jsonwebtoken)
- **数据存储**: 本地 JSON 文件存储 (`server/data/*.json`)，实现轻量级持久化
- **AI 集成**: OpenAI SDK (支持 DeepSeek 等兼容 API)

---

## 2. 构建与部署 (Build & Deployment)

### **构建逻辑**

- **包管理器**: `pnpm` (强制要求，一致性高且速度快)
- **前端打包**: `npm run build` 生成 `dist` 目录。
  - 采用了分包策略 (Split Chunking)，针对大库 (Recharts, NextUI) 进行独立拆分。
  - 启用了多线程压缩和资源预加载优化。
- **后端服务**: 直接运行 `server/index.js`，通过 `koa-static` 托管前端生成的静态资源。

### **部署要求**

- **环境变量**: 依赖 `.env` 文件配置 API Key、JWT 密钥等敏感信息。
- **静态托管**: 后端通过根路径 `/` 托管前端 SPA，并处理了 HTML5 History 模式的 404 兜底。
- **路径适配**: 项目应支持直接部署在根域名下。

---

## 3. 代码规范 (Code Conventions)

### **通用原则**

- **语言**: 优先使用 **TypeScript** (前端) 和 **JavaScript** (后端)。
- **简洁性**: 鼓励使用简单的逻辑实现，避免过度设计或引入不必要的重型库。
- **注释**: 核心业务逻辑（如 AI 解析、同步算法）必须包含中文注释。

### **前端规范**

- **组件化**: 页面逻辑 (pages) 与 UI 组件 (components) 分离。
- **Hook 化**: 提取通用逻辑到 `src/lib` 或自定义 Hooks 中。
- **存储抽象**: 使用 `StorageDriver` 模式 (见 `src/lib/storage.ts`)，解耦 LocalStorage 与 API 存储逻辑。

### **后端规范**

- **中间件**: 鉴权、错误处理、频控 (Rate Limit) 必须作为独立中间件。
- **RESTful**: 接口遵循标准 REST 风格，返回格式统一为 `{ success: boolean, data?: any, message?: string }`。

---

## 4. 设计风格 (Design Style)

### **UI 视觉**

- **毛玻璃效果 (Glassmorphism)**: 广泛使用 `backdrop-blur` 和半透明背景。
- **圆角**: 采用大圆角设计 (`rounded-2xl`, `rounded-[2.5rem]`)，视觉感受更亲和。
- **配色**:
  - 主色: 亮蓝色 (Primary: `hsl(221 83% 53%)`)
  - 背景: 极简灰白 (Light) / 深邃蓝黑 (Dark)
- **适配**: 响应式设计，优先适配移动端（Max-width: 2xl）。

### **UX 交互**

- **微交互**: 使用 Framer Motion 实现按钮缩放、列表滑入等反馈。
- **反馈**:
  - AI 操作必须有 Loading 状态。
  - 游客模式需有醒目的注册同步提示。
- **一致性**: 全局使用 HSL 变量定义颜色，支持一键切换深色模式。

---

## 5. 项目启动指南 (Quick Start)

1. **克隆并安装**:
   ```bash
   pnpm install
   ```
2. **配置环境**:
   复制 `.env.example` 为 `.env` 并填写相关密钥。
3. **开发运行**:
   ```bash
   pnpm dev  # 同时启动前后端
   ```
4. **生产构建**:
   ```bash
   pnpm build
   npm start
   ```

---

_此规范由 Trae AI 助手基于 Timary 项目实践总结，建议作为后续项目的脚手架参考。_
