# AI 挑战中心 · 真人 vs AI 聊天辨别游戏

> 一款 iOS 风格的「你能识破 AI 吗？」网页游戏。通过真实 iMessage 风格的聊天室对话，判断对方是真人还是 AI。内置 5 种 AI 人格（高冷/活泼/幽默/理性/情绪化）、等级系统、连胜记录、成就系统。

## 技术栈

- **前端**：React 19 + TypeScript + Vite + Tailwind CSS + Framer Motion + React Router
- **后端**：Node.js + Express + TypeScript + JWT + DeepSeek AI
- **安全层**（服务器端）：
  - 防机器人（限流 / 设备指纹 / 验证码 / 行为节奏检测）
  - 聊天内容审核（敏感词 / 违规分类 / 自动封禁）
  - 用户安全（举报 / 拉黑 / 风险评分）
  - AI 安全（提示词注入检测 / 输出审核 / 系统安全 prompt）
  - 数据安全（AES 加解密 / 密码哈希 / API Key 只存于环境变量）

## 快速开始（本地开发）

### 1. 准备 DeepSeek API Key

在 [platform.deepseek.com](https://platform.deepseek.com/) 创建 API Key（`sk-` 开头）。

### 2. 配置后端环境变量

复制模板（注意：`server/.env` 已加入 .gitignore，不会被提交）：

```bash
cp server/.env.example server/.env
```

然后编辑 `server/.env`，至少填入：

```
API_KEY_DEEPSEEK=sk-你的真实key
JWT_SECRET=随便一串很长的随机字符串
ENCRYPTION_KEY=32字符的任意字符串
```

### 3. 安装依赖并启动

```bash
# 前端
npm install
npm run dev      # 打开 http://localhost:5173

# 后端（新开一个终端）
cd server
npm install
npm run dev      # 监听 3001 端口
```

前端的 `/api` 请求会通过 Vite proxy 自动转发到后端 3001，本地无需处理跨域。

## 给别人用：公网部署

### 方案 A：零成本（Vercel + Render）

> 适合个人分享。Render 免费版 15 分钟无流量会休眠，冷启动约 10-30 秒。

#### 第一步：把代码推到 GitHub

```bash
git add .
git commit -m "deploy: 准备部署到 Vercel + Render"
git push
```

#### 第二步：部署后端到 Render

1. 登录 <https://render.com/>，用 GitHub 账号登录
2. New → **Web Service** → 选你的仓库
3. 配置：
   - **Name**: `ai-challenge-server`（随便起）
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: 选 Free
4. 点击「Advanced」→ 添加环境变量（Environment Variables）：

   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `JWT_SECRET` | 一串长随机字符串（可用 `openssl rand -hex 32` 生成）|
   | `ENCRYPTION_KEY` | 32 字符任意字符串 |
   | `API_KEY_DEEPSEEK` | `sk-` 开头的真实 DeepSeek Key |

5. 点 Create，等待构建完成。Render 会给你一个公网地址，比如 `https://ai-challenge-server-xxx.onrender.com`
6. 测一下：访问 `https://你的后端地址/health`，能返回 `{"status":"ok"}` 就成功了。

#### 第三步：部署前端到 Vercel

1. 登录 <https://vercel.com/>，用 GitHub 账号登录
2. Add New → **Project** → 选你的仓库 → Import
3. 配置：
   - **Framework Preset**: 会自动识别为 Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Root Directory**: 留空（项目根目录）
4. **Environment Variables** 里加：

   | Key | Value |
   |---|---|
   | `VITE_API_BASE` | 上一步你拿到的 Render 后端地址，例如 `https://ai-challenge-server-xxx.onrender.com` |

5. 点 Deploy，等 1-2 分钟构建完成。
6. 访问 Vercel 给你的地址，进入游戏 → 开始匹配 → 发送消息，能收到 AI 回复就算成功！

### 方案 B：一台云服务器（≈ ¥20/月，更稳定）

> 适合 100+ 用户同时玩。推荐阿里云/腾讯云 2C2G 轻量服务器。

服务器上装好 Docker 和 docker compose，然后：

```bash
# 1. 克隆代码
git clone <你的仓库地址>
cd ai-chat-game

# 2. 填环境变量
cat > .env <<EOF
JWT_SECRET=$(openssl rand -hex 32)
ENCRYPTION_KEY=$(openssl rand -hex 16)
API_KEY_DEEPSEEK=sk-你的真实key
EOF

# 3. 一键启动（前端 nginx + 后端 node）
docker compose up -d --build

# 4. 访问 http://你的服务器IP:8080
```

Nginx 已配置：
- 8080 端口对外
- `/api/*` 反代到后端 3001
- 其他路径走 SPA 路由
- 支持 WebSocket（后续聊天室功能）

如需 HTTPS，在服务器上配 Caddy 或 Nginx 监听 443 + Let's Encrypt 证书，把 8080 反向代理出去即可。

### 方案 C：发安装包（本地桌面应用）

后续支持 Electron 打包，待补全 WebSocket 聊天室后再做。

## 给懂技术的朋友：发源码自己跑

把仓库地址发给朋友，让他们按「快速开始」操作即可。**不要把 server/.env 里的真实 Key 发给别人**，每个人应该用自己的 DeepSeek Key。

## 后续路线图

- [x] 游戏核心逻辑 + iMessage 风格 UI
- [x] 5 种 AI 人格 + DeepSeek 对接
- [x] 评分/等级/连胜/成就
- [x] 服务器端安全防护系统
- [ ] **WebSocket 实时聊天室（60% AI / 40% 真人混合匹配）** ← 下一项
- [ ] 排行榜
- [ ] 移动端 PWA 离线支持
- [ ] Electron 桌面安装包

## 目录结构

```
ai-chat-game/
├── src/                        # 前端源码
│   ├── components/             # UI 组件
│   ├── context/GameContext.tsx # 游戏状态管理
│   ├── pages/                  # 页面（首页/匹配/聊天/判断/结算/个人/设置）
│   ├── utils/                  # 工具：API 封装、AI 响应生成
│   └── types/                  # 全局 TS 类型
├── server/                     # 后端源码
│   ├── src/
│   │   ├── ai/deepseek.ts      # DeepSeek AI 调用（5 种人格提示词）
│   │   ├── security/           # 安全防护（5 个子模块）
│   │   └── index.ts            # Express 入口 + 路由
│   ├── .env.example            # 环境变量模板（可提交）
│   └── Dockerfile
├── vercel.json                 # Vercel 部署配置
├── render.yaml                 # Render 部署配置
├── docker-compose.yml          # 云服务器一键启动
├── Dockerfile                  # 前端 Dockerfile（nginx 托管）
└── nginx.conf                  # 前端生产环境 nginx 配置
```

## 安全提醒

- `server/.env` **绝不能**提交到 git（已加 .gitignore）
- DeepSeek Key **只能存在服务器环境变量中**，不要写进前端代码或拼到 URL 里
- 部署到公网后建议开启 CORS 白名单（后端 `CORS_ORIGIN` 环境变量，逗号分隔多个域名）
