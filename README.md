# 文章转播客 - AI智能转换平台

一个现代化的在线文章转播客平台，使用AI技术将文章内容自动转换为专业的播客音频和精美封面图。

## 🚀 功能特性

- **智能转换**: 输入文章URL，AI自动生成播客音频和封面图
- **现代设计**: 采用苹果官网风格的简洁现代化设计
- **实时播放**: 支持在线播放生成的播客音频
- **一键下载**: 支持音频文件和封面图下载
- **响应式设计**: 完美适配各种设备屏幕
- **自动封面**: 根据文章内容自动生成精美的播客封面图
- **异步处理**: 支持长时间任务的异步处理，实时显示转换进度
- **持久化存储**: 使用 Supabase 数据库存储任务状态

## 🛠️ 技术栈

- **前端框架**: Next.js 15 (App Router)
- **开发语言**: TypeScript
- **UI组件库**: shadcn/ui
- **样式框架**: Tailwind CSS
- **包管理器**: pnpm
- **图标库**: Lucide React
- **数据库**: Supabase (PostgreSQL)

## 📦 安装和运行

### 环境要求

- Node.js 18+
- pnpm

### 安装依赖

```bash
pnpm install
```

### 环境变量配置

在项目根目录创建 `.env.local` 文件，并添加以下环境变量：

```bash
# Coze API 配置
COZE_API_TOKEN=your_coze_api_token_here
COZE_WORKFLOW_ID=your_workflow_id_here

# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# 应用配置 (可选)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**获取配置信息：**
1. `COZE_API_TOKEN`: 在 [Coze平台](https://www.coze.cn/) 获取API Token
2. `COZE_WORKFLOW_ID`: 创建工作流后获取的工作流ID
3. `NEXT_PUBLIC_SUPABASE_URL`: 项目设置 → API → Project URL
4. `NEXT_PUBLIC_SUPABASE_ANON_KEY`: 项目设置 → API → anon public key
5. `SUPABASE_SERVICE_ROLE_KEY`: 项目设置 → API → service_role secret key

### 启动开发服务器

```bash
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
pnpm build
```

### 启动生产服务器

```bash
pnpm start
```

## 🔧 配置

### API配置

项目使用Coze API进行文章转播客转换。API配置通过环境变量管理：

- `COZE_API_TOKEN`: Coze API的访问令牌
- `COZE_WORKFLOW_ID`: 文章转播客的工作流ID

**安全提示：**
- 请勿将 `.env.local` 文件提交到版本控制系统
- 生产环境请使用安全的环境变量管理方案

## 📁 项目结构

```
article_to_podcast/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── convert/
│   │   │   │   └── route.ts    # API路由
│   │   │   └── status/
│   │   │       └── [taskId]/
│   │   │           └── route.ts   # 状态查询端点
│   │   ├── globals.css             # 全局样式
│   │   ├── layout.tsx              # 根布局
│   │   └── page.tsx                # 主页面
│   ├── components/
│   │   └── ui/                     # shadcn/ui组件
│   └── lib/
│       └── utils.ts                # 工具函数
├── public/                         # 静态资源
├── .env.local                      # 环境变量（需要创建）
├── components.json                 # shadcn/ui配置
├── tailwind.config.ts              # Tailwind配置
└── package.json                    # 项目配置
```

## 🎨 设计特色

- **苹果风格**: 采用苹果官网的设计语言，简洁现代
- **渐变效果**: 精美的渐变色彩搭配
- **毛玻璃效果**: 现代化的背景模糊效果
- **响应式布局**: 完美适配桌面端和移动端

## 🔄 使用流程

1. 在输入框中粘贴文章URL
2. 点击"开始转换"按钮
3. 等待AI处理（显示进度提示）
4. 查看生成的封面图和播放音频
5. 下载音频文件和封面图

## 📝 API说明

### 转换接口

**POST** `/api/convert`

请求体：
```json
{
  "articleUrl": "https://example.com/article"
}
```

响应：
```json
{
  "taskId": "task_abc123",
  "status": "processing",
  "message": "任务已接受，正在处理中...",
  "statusUrl": "/api/convert/status/task_abc123"
}
```

### 查询状态接口

**GET** `/api/convert/status/[taskId]`

响应：
- 处理中：
```json
{
  "taskId": "task_abc123",
  "status": "processing",
  "message": "任务正在处理中，请稍后再试...",
  "createdAt": 1640995200000
}
```
- 完成：
```json
{
  "taskId": "task_abc123",
  "status": "completed",
  "result": {
    "success": true,
    "audio": "https://example.com/audio.mp3",
    "cover_url": "https://example.com/cover.png",
    "debug_url": "https://example.com/debug",
    "token": 1500
  },
  "createdAt": 1640995200000
}
```
- 失败：
```json
{
  "taskId": "task_abc123",
  "status": "failed",
  "error": "转换失败的具体原因",
  "createdAt": 1640995200000
}
```

### 环境变量

| 变量名 | 描述 | 必需 |
|--------|------|------|
| `COZE_API_TOKEN` | Coze API访问令牌 | ✅ |
| `COZE_WORKFLOW_ID` | 工作流ID | ✅ |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名密钥 | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 服务角色密钥 | ✅ |

## 🎯 部署

### Vercel部署

1. 将代码推送到GitHub
2. 在Vercel中导入项目
3. 在Vercel项目设置中添加环境变量：
   - `COZE_API_TOKEN`
   - `COZE_WORKFLOW_ID`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. 部署完成

### 其他平台

确保在部署平台的环境变量中设置：
- `COZE_API_TOKEN`
- `COZE_WORKFLOW_ID`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 🤝 贡献

欢迎提交Issue和Pull Request来改进项目。

## 📄 许可证

MIT License

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React框架
- [shadcn/ui](https://ui.shadcn.com/) - UI组件库
- [Tailwind CSS](https://tailwindcss.com/) - CSS框架
- [Lucide](https://lucide.dev/) - 图标库
- [Coze API](https://www.coze.cn/) - AI转换服务

## 开发说明

### 任务存储

使用 Supabase PostgreSQL 数据库存储任务状态，提供：

- **持久化存储**: 任务状态在服务器重启后仍然保持
- **高可用性**: Supabase 提供的托管数据库服务
- **实时查询**: 支持高并发的任务状态查询
- **自动清理**: 定期清理过期任务（24小时）

### Edge Functions

API 路由配置为 Edge Functions，提供更好的性能和全球分布。

### 错误处理

- 数据库连接错误处理
- 任务状态查询异常处理
- 自动重试机制
- 详细的错误信息
- 任务超时处理 (24小时)

### 数据库维护

#### 手动清理过期任务

```sql
-- 清理24小时前的任务
DELETE FROM public.tasks 
WHERE created_at < NOW() - INTERVAL '24 hours';
```

#### 查看任务统计

```sql
-- 查看各状态任务数量
SELECT status, COUNT(*) as count 
FROM public.tasks 
GROUP BY status;
```

#### 启用自动清理 (可选)

如果您的 Supabase 项目支持 pg_cron 扩展：

```sql
-- 每6小时清理一次过期任务
SELECT cron.schedule('cleanup-expired-tasks', '0 */6 * * *', 'SELECT public.cleanup_expired_tasks();');
```
