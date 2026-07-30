# Apple Community - 高级 iOS 风格社区 App

一款参考 **Apple iOS 原生设计规范 (HIG)** 打造的高级社区应用，视觉风格对标苹果设置 App，使用玻璃拟态、圆角卡片、大量留白等元素，给你真正的 iOS App 使用体验。

> ✨ 设计灵感：Apple Settings / App Store / Apple Music

---

## 🎨 设计亮点

| 特性 | 说明 |
|------|------|
| **iOS 原生配色** | 苹果蓝 `#007AFF`、系统灰阶、绿/紫/橙/红辅助色 |
| **玻璃拟态** | `backdrop-blur + saturate` 打造毛玻璃效果 |
| **圆角卡片** | 14px / 18px / 24px 多级圆角系统 |
| **多层次阴影** | iOS 风格阴影（双图层 + 微妙透明度）|
| **深色模式** | 完整深色适配，遵循 iOS Dynamic System Colors |
| **丝滑动画** | Framer Motion 实现 iOS 级弹性动画 |
| **安全区域适配** | `env(safe-area-inset-*)` |

---

## 🏗️ 项目结构

```
apple-community/
├── frontend/                  # Next.js 14 前端
│   ├── src/
│   │   ├── app/               # App Router 页面
│   │   │   ├── home/          # 首页 (社区大厅)
│   │   │   ├── profile/       # 个人中心
│   │   │   ├── settings/      # 设置页面
│   │   │   ├── search/        # 搜索 / 发现
│   │   │   ├── messages/      # 私信列表
│   │   │   ├── post/          # 发布动态 / 帖子详情
│   │   │   └── globals.css    # 全局样式 + iOS 设计 tokens
│   │   ├── components/
│   │   │   ├── ui/            # 基础 UI 组件库
│   │   │   │   ├── Avatar         # 头像
│   │   │   │   ├── Button         # 按钮（弹性缩放）
│   │   │   │   ├── Card           # 卡片（玻璃/阴影/悬浮）
│   │   │   │   ├── Switch         # iOS 开关
│   │   │   │   ├── ListItem       # 设置项 + ListGroup
│   │   │   │   ├── IconBadge      # 图标徽章 + 等级徽章
│   │   │   │   ├── Skeleton       # 骨架屏
│   │   │   │   ├── Navigation     # NavBar + TabBar
│   │   │   │   ├── PostCard       # 帖子卡片
│   │   │   │   └── PageTransition # 页面切换动画
│   │   │   └── ThemeProvider.tsx  # 深色模式 Provider
│   │   ├── context/AppContext.tsx # 全局状态（用户/帖子/设置）
│   │   ├── lib/
│   │   │   ├── utils.ts           # 工具函数（数字/日期/等级）
│   │   │   └── mockData.ts        # 前端 Mock 数据
│   │   └── types/index.ts         # TypeScript 类型
│   ├── tailwind.config.ts         # 定制 iOS 设计 tokens
│   └── next.config.js
│
└── server/                    # Express 后端 API
    └── src/
        ├── index.ts               # 服务入口
        ├── middleware/errorHandler.ts
        ├── routes/                # API 路由
        │   ├── userRoutes.ts      # 用户系统（登录/注册/关注）
        │   ├── postRoutes.ts      # 帖子（CRUD/点赞/评论/收藏）
        │   ├── topicRoutes.ts     # 话题
        │   ├── messageRoutes.ts   # 私信
        │   ├── notificationRoutes.ts # 通知
        │   └── uploadRoutes.ts    # 文件上传
        └── data/mockData.ts       # Mock 数据
```

---

## ⚡ 功能清单

### 📱 社区大厅 (首页)
- [x] 用户 Hero 卡片（头像、等级、经验进度条、三围数据）
- [x] 快捷功能（排行榜 / 活动 / 找人 / 签到）
- [x] 社区活动横向卡片（报名、进度）
- [x] 热门话题横向 Chip
- [x] 推荐用户横向卡片（一键关注）
- [x] **Feed 分类 Tab**：热门 / 最新 / 关注
- [x] 刷新按钮 + 模拟请求
- [x] 骨架屏加载状态

### 👤 个人中心 (参考 iOS 设置)
- [x] 资料卡（头像编辑、UID 一键复制、等级进度条）
- [x] 四宫格数据面板（帖子/粉丝/关注/积分）
- [x] 设置风格功能列表：我的帖子 / 点赞 / 收藏 / 评论 / 签到
- [x] **帖子/点赞/收藏 Tab 切换展示**
- [x] 空状态友好提示

### ⚙️ 设置页面 (完全复刻 iOS Settings)
- [x] 账号资料 / 账号安全 / 绑定邮箱
- [x] 通知设置（5 项独立 Switch：点赞/评论/关注/@提及/系统）
- [x] **深色模式** 开关（实时切换）
- [x] **自动跟随系统** 外观
- [x] **字体大小** 4 档调节 (S/M/L/XL)
- [x] 减少动态效果
- [x] 隐私权限（可见范围/关注列表/私信权限/黑名单）
- [x] 关于应用（协议/政策/帮助/评分）
- [x] 退出登录

### 🛠️ 社区核心功能
- [x] 发布动态（话题选择 / 图片九宫格 / AI 帮写 / 可见范围）
- [x] 帖子详情页（沉浸式大图 + 评论区 + 评论输入框）
- [x] 点赞（爱心弹跳动画） / 收藏（星星）/ 分享 / 评论
- [x] 二级评论回复嵌套
- [x] 搜索页：**最近搜索 / 热搜榜（排名配色） / 发现话题 / 结果分 Tab**
- [x] 消息页：置顶会话 / 未读红点 / 群组 / 官方账号 / 新朋友 / AI 助手

### 🎬 交互效果
- [x] 卡片点击弹性缩放 `whileTap`
- [x] 列表项点击按压高亮
- [x] 页面切场 Spring 动画
- [x] 按钮/图标 交互动效
- [x] 数据滚动渐入 `staggerChildren`
- [x] TabBar 悬浮毛玻璃 + 中央凸起发布按钮
- [x] 顶部大标题 滚动渐隐过渡为 NavBar 小标题

---

## 🚀 快速开始

```bash
# 1. 进入项目
cd /workspace/apple-community

# 2. 安装全部依赖（前端 + 后端）
npm run install:all

# 3. 启动开发模式（前端 3000，后端 4000，同时启动）
npm run dev

# 或单独启动：
npm run dev:frontend   # http://localhost:3000
npm run dev:server     # http://localhost:4000
```

打开浏览器访问：**http://localhost:3000**

---

## 🔌 后端 API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/health` | 健康检查 |
| POST | `/api/users/login` | 登录（测试账号任意用户名 + 密码 `123456`）|
| POST | `/api/users/register` | 注册 |
| GET | `/api/users/:id` | 获取用户详情 |
| GET | `/api/posts` | 帖子列表（`?sort=hot/latest&topicId=&authorId=`）|
| POST | `/api/posts` | 创建帖子 |
| POST | `/api/posts/:id/like` | 点赞切换 |
| POST | `/api/posts/:id/bookmark` | 收藏切换 |
| GET | `/api/posts/:id/comments` | 评论列表 |
| POST | `/api/posts/:id/comments` | 发表评论 |
| GET | `/api/topics` | 话题列表 |
| GET | `/api/messages/conversations` | 会话列表 |
| GET | `/api/notifications` | 通知列表 |
| POST | `/api/upload/single` | 单文件上传 |
| POST | `/api/upload/multiple` | 多文件上传（最多 9 张）|

---

## 🧭 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | **Next.js 14 (App Router) + React 18** |
| 样式 | **Tailwind CSS 3** (自定义 iOS 设计 tokens) |
| 动画 | **Framer Motion 11** (spring / stagger / layout) |
| 图标 | **Lucide React** (iOS 风格线性图标) |
| 后端 | **Node.js + Express 4** |
| 类型系统 | **TypeScript 5** |
| 深色模式 | **next-themes** |
| 文件上传 | **multer** |

---

## 📱 后续扩展为 iOS App 的建议

1. **Capacitor**：直接把 Next.js 构建产物 (`frontend/out/`) 包进 Capacitor，即可上架 App Store
2. **Expo Router**：迁移到 Expo，几乎 1:1 复用组件 + 页面结构
3. **SwiftUI 原生重写**：本项目的设计 tokens（颜色 / 圆角 / 间距）与 SwiftUI 完全对齐，1:1 翻译即可

---

## 📸 界面截图预览

启动后访问以下 URL 查看各个页面：

- 🏠 首页（社区大厅）：`/home`
- 👤 我的（个人中心）：`/profile`
- ⚙️ 设置：`/settings`
- 🔍 搜索/发现：`/search`
- 💬 消息：`/messages`
- ✏️ 发布动态：`/post`
- 📄 帖子详情：`/post/1`

---

> **Designed with 🍎 in Cupertino style.**  
> 如果你觉得这个项目漂亮，欢迎给它一个 ⭐️
