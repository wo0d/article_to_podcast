# 文章转播客 - AI智能转换平台

一个现代化的在线文章转播客平台，使用AI技术将文章内容自动转换为专业的播客音频和精美封面图。

## 🚀 功能特性

- **智能转换**: 输入文章URL，AI自动生成播客音频和封面图
- **现代设计**: 采用苹果官网风格的简洁现代化设计
- **实时播放**: 支持在线播放生成的播客音频
- **一键下载**: 支持音频文件和封面图下载
- **响应式设计**: 完美适配各种设备屏幕

## 🛠️ 技术栈

- **前端框架**: Next.js 15 (App Router)
- **开发语言**: TypeScript
- **UI组件库**: shadcn/ui
- **样式框架**: Tailwind CSS
- **包管理器**: pnpm
- **图标库**: Lucide React

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
```

**获取配置信息：**
1. `COZE_API_TOKEN`: 在 [Coze平台](https://www.coze.cn/) 获取API Token
2. `COZE_WORKFLOW_ID`: 创建工作流后获取的工作流ID

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
│   │   ├── api/convert/route.ts    # API路由
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
  "success": true,
  "audio": "音频文件URL",
  "cover_url": "封面图URL",
  "debug_url": "调试URL",
  "token": 消耗的token数量
}
```

### 环境变量

| 变量名 | 描述 | 必需 |
|--------|------|------|
| `COZE_API_TOKEN` | Coze API访问令牌 | ✅ |
| `COZE_WORKFLOW_ID` | 工作流ID | ✅ |

## 🚀 部署

### Vercel部署

1. 将代码推送到GitHub
2. 在Vercel中导入项目
3. 在Vercel项目设置中添加环境变量：
   - `COZE_API_TOKEN`
   - `COZE_WORKFLOW_ID`
4. 部署完成

### 其他平台

确保在部署平台的环境变量中设置：
- `COZE_API_TOKEN`
- `COZE_WORKFLOW_ID`

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
