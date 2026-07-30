# AI Challenge - 安全防护服务器

正式上线标准的**服务器端安全防护系统**。所有安全检测在服务器完成，不暴露给客户端。

## 架构

```
server/
├── .env                          # 密钥与配置（仅服务器可见）
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts                  # Express 入口，挂载所有安全中间件 + API 路由
    └── security/
        ├── types.ts              # 共享类型定义
        ├── sensitiveWords.ts     # 敏感词库 + 提示词注入模式
        ├── riskStore.ts          # 内存安全数据存储（限流/设备/违规/举报/封禁）
        ├── antiBot.ts           # 防机器人系统
        ├── contentModeration.ts  # 聊天内容安全
        ├── userSafety.ts         # 用户安全系统
        ├── aiSafety.ts           # AI 聊天安全
        ├── dataSecurity.ts       # 数据安全
        └── middleware.ts        # 安全中间件组合导出
```

## 五大安全系统

### 1. 防机器人系统 (`antiBot.ts`)
| 功能 | 实现 |
|---|---|
| IP 频率限制 | 滑动窗口限流，可配置窗口/阈值 |
| 请求限流 | 全局 + 路由级限流，超限触发验证码 |
| 设备指纹 | SHA-256(UA+IP+Accept-Language) 生成唯一指纹 |
| 异常操作检测 | 识别 bot/crawler/selenium/puppeteer 等 UA |
| 防自动化脚本 | 请求间隔标准差检测，识别脚本均匀请求节奏 |
| 验证码机制 | 触发式验证码（算术题），限流超限自动弹出 |
| Token 管理 | JWT 24h 有效期，过期自动失效 |
| 登录尝试限制 | 5 次失败锁定 30 分钟 |
| 注册行为检测 | 注册必须通过验证码 |

### 2. 聊天内容安全 (`contentModeration.ts`)
| 功能 | 实现 |
|---|---|
| 辱骂/脏话 | 敏感词库 6 大分类匹配 |
| 色情/暴力 | 高危级别直接拦截 |
| 广告/诈骗 | URL/联系方式/转账关键词检测 |
| 敏感词库 | 中英文双语，按严重程度分级 |
| AI 内容审核 | 模拟 AI Moderation，检测色情/诈骗/广告/骚扰 |
| 违规拦截 | 高危内容直接拦截，中危自动过滤后放行 |
| 自动记录 | 每次违规自动写入用户档案，累积风险分 |

### 3. 用户安全 (`userSafety.ts`)
| 功能 | 实现 |
|---|---|
| 举报 | 6 类举报（骚扰/垃圾/不当/诈骗/其他），被 3 人举报自动临时封禁 |
| 拉黑 | 双向拉黑，拉黑后双方无法匹配 |
| 违规记录 | 完整违规历史，含类型/严重程度/时间/内容 |
| 自动封禁 | 违规 5 次或风险分 ≥70 自动封禁 24h |
| 风险评分 | 0-100 动态评分，违规递增，举报递增 |

### 4. AI 聊天安全 (`aiSafety.ts`)
| 功能 | 实现 |
|---|---|
| 提示词注入检测 | 15 种注入模式（忽略指令/DAN/越狱/系统提示泄露等） |
| 注入分级 | 高危拒绝 / 中危清洗 / 低危警告 |
| AI 输出审核 | 敏感词扫描 + 越狱指标检测 + 系统提示泄露检测 |
| 防诱导 | 系统 Safety Prompt 约束 AI 不泄露指令 |

### 5. 数据安全 (`dataSecurity.ts`)
| 功能 | 实现 |
|---|---|
| HTTPS | Helmet + HSTS + Nginx 终止 TLS |
| 数据加密 | AES-256 加解密 |
| 密码存储 | bcrypt 12 轮哈希 |
| API Key | 仅存于 .env 环境变量，绝不返回客户端 |
| 权限控制 | user/moderator/admin 三级 RBAC |
| 数据脱敏 | 日志中手机/邮箱/Token 自动脱敏 |

## 运行

```bash
cd server
npm install
npm run dev      # 开发模式（热重载）
npm run build    # 编译
npm start        # 生产模式
```

## API 端点

| 方法 | 路径 | 安全层 | 说明 |
|---|---|---|---|
| POST | /api/auth/register | 限流+验证码 | 注册 |
| POST | /api/auth/login | 限流+登录锁定 | 登录 |
| GET | /api/captcha | - | 获取验证码 |
| POST | /api/chat/send | 认证+限流+内容审核 | 发送聊天消息 |
| POST | /api/ai/chat | 认证+限流+AI安全 | AI 对话 |
| POST | /api/safety/report | 认证+限流 | 举报 |
| POST | /api/safety/block | 认证 | 拉黑 |
| GET | /api/safety/risk/:id | 认证 | 风险评分 |
| POST | /api/admin/ban | 认证 | 管理员封禁 |
| GET | /api/admin/stats | 认证 | 安全统计 |

> 生产环境将 `riskStore.ts` 内存存储替换为 Redis + PostgreSQL。
