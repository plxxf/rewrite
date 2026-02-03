# Rewrite - 在线文本格式转换工具

**Rewrite** 是一个功能强大的在线文档格式转换平台，基于 Pandoc 引擎，支持 15 种主流文档格式的相互转换。无论是 Markdown、Word、PDF、HTML 还是 LaTeX，Rewrite 都能帮助您快速完成格式转换，完美支持中文内容，无需安装任何软件。

## ✨ 核心特性

Rewrite 提供了完整的文档转换解决方案，满足从个人用户到专业团队的各种需求。平台采用现代化的 Web 技术栈构建，确保转换速度快、质量高、体验流畅。

### 格式支持

平台支持 15 种主流文档格式的相互转换，覆盖了绝大多数日常使用场景。所有格式都经过严格测试，确保转换质量和兼容性。支持的格式包括：

| 类别 | 格式 | 说明 |
|------|------|------|
| **标记语言** | Markdown, HTML, LaTeX, reStructuredText | 适用于技术文档、博客文章、学术论文 |
| **办公文档** | DOCX, ODT, RTF | Microsoft Word、LibreOffice 等办公软件格式 |
| **出版格式** | PDF, EPUB | 电子书、报告、演示文稿等出版物格式 |
| **其他格式** | Plain Text, Textile, Org, MediaWiki, Jupyter Notebook, PowerPoint | 覆盖维基、笔记、演示等多种场景 |

### 转换模式

**文本转换模式**：直接在浏览器中输入或粘贴文本内容进行转换，适合快速处理小段文字或代码片段。文本模式支持最大 5 MB 的内容，转换结果可以直接在页面上预览或下载。

**文件转换模式**：上传本地文件进行转换，支持单文件最大 10 MB。系统会自动识别文件格式，转换完成后提供下载链接。对于二进制格式（如 DOCX、PDF），系统会显示友好的下载提示界面。

**批量转换模式**：一次性上传多个文件进行批量转换，总大小限制为 50 MB。转换完成后可以逐个下载或打包下载全部文件，大幅提升工作效率。

### 用户体验

**智能重试机制**：转换失败时自动重试最多 3 次，确保网络波动不会影响转换成功率。系统会显示重试进度，让用户清楚了解当前状态。

**转换历史记录**：自动保存所有转换记录，包括输入格式、输出格式、转换时间和文件大小。用户可以随时查看历史记录，重新下载之前的转换结果。

**配额管理系统**：为每位用户提供合理的使用配额，包括每小时限制、每天限制和批量转换限制。配额信息实时显示在页面右侧，帮助用户合理安排转换任务。

**错误处理与提示**：详细的错误信息和友好的提示文案，帮助用户快速定位问题。对于不支持的格式组合，系统会提前提示，避免无效操作。

## 🛠️ 技术栈

Rewrite 采用现代化的全栈技术架构，确保高性能、高可用和良好的开发体验。

### 前端技术

前端采用 React 19 生态系统，结合 Tailwind CSS 4 和 shadcn/ui 组件库，构建了响应式、高性能的用户界面。Vite 作为构建工具，提供了极速的开发体验和优化的生产构建。

| 技术 | 版本 | 用途 |
|------|------|------|
| **React** | 19 | 用户界面框架 |
| **TypeScript** | 5.x | 类型安全的开发语言 |
| **Tailwind CSS** | 4.x | 原子化 CSS 框架 |
| **shadcn/ui** | Latest | 高质量 UI 组件库 |
| **Vite** | 6.x | 前端构建工具 |
| **tRPC** | 11.x | 端到端类型安全的 API |
| **Wouter** | Latest | 轻量级路由库 |

### 后端技术

后端基于 Node.js 和 Express 构建，使用 tRPC 实现类型安全的 API 通信。Drizzle ORM 提供了优雅的数据库操作接口，支持 MySQL/TiDB 数据库。

| 技术 | 版本 | 用途 |
|------|------|------|
| **Node.js** | 22.x | 服务器运行时 |
| **Express** | 4.x | Web 应用框架 |
| **tRPC** | 11.x | API 层 |
| **Drizzle ORM** | Latest | 数据库 ORM |
| **MySQL/TiDB** | - | 关系型数据库 |
| **Pandoc** | 3.x | 文档转换引擎 |
| **WeasyPrint** | Latest | PDF 生成引擎 |

### 核心依赖

**Pandoc**：业界领先的文档转换工具，支持超过 40 种格式的相互转换。Rewrite 使用 Pandoc 3.x 版本，确保转换质量和格式兼容性。

**WeasyPrint**：用于生成高质量 PDF 文件的 Python 库。相比传统的 LaTeX 引擎，WeasyPrint 更轻量、更快速，且对中文支持更好。

## 📦 项目结构

```
rewrite/
├── client/                 # 前端代码
│   ├── public/            # 静态资源
│   └── src/
│       ├── components/    # React 组件
│       ├── pages/         # 页面组件
│       ├── hooks/         # 自定义 Hooks
│       ├── lib/           # 工具库
│       └── contexts/      # React Context
├── server/                # 后端代码
│   ├── routers.ts         # tRPC 路由定义
│   ├── db.ts              # 数据库查询
│   ├── pandocService.ts   # Pandoc 转换服务
│   ├── fileUtils.ts       # 文件工具函数
│   └── _core/             # 核心功能（认证、配置等）
├── drizzle/               # 数据库 Schema 和迁移
│   └── schema.ts          # 数据表定义
├── shared/                # 前后端共享代码
│   └── fileConfig.ts      # 文件配置常量
└── storage/               # S3 存储集成
```

## 🚀 快速开始

### 环境要求

在开始之前，请确保您的系统满足以下要求：

- **Node.js**：22.x 或更高版本
- **pnpm**：8.x 或更高版本
- **Pandoc**：3.x 或更高版本
- **Python**：3.11+ （用于 WeasyPrint）
- **MySQL/TiDB**：数据库服务

### 安装依赖

首先克隆项目仓库，然后安装所有依赖包。项目使用 pnpm 作为包管理器，确保更快的安装速度和更小的磁盘占用。

```bash
# 克隆项目
git clone <repository-url>
cd rewrite

# 安装 Node.js 依赖
pnpm install

# 安装 Pandoc（Ubuntu/Debian）
sudo apt-get install pandoc

# 安装 WeasyPrint
sudo pip3 install weasyprint
```

### 配置环境变量

项目使用环境变量管理配置信息。在 Manus 平台上部署时，这些变量会自动注入。本地开发时，您需要创建 `.env` 文件。

```env
# 数据库连接
DATABASE_URL=mysql://user:password@localhost:3306/rewrite

# JWT 密钥
JWT_SECRET=your-secret-key

# OAuth 配置（Manus 平台自动提供）
VITE_APP_ID=your-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# S3 存储配置（Manus 平台自动提供）
BUILT_IN_FORGE_API_URL=https://forge.manus.im
BUILT_IN_FORGE_API_KEY=your-api-key
```

### 数据库迁移

在首次运行项目前，需要执行数据库迁移来创建必要的数据表。项目使用 Drizzle ORM 管理数据库 Schema。

```bash
# 生成迁移文件并应用到数据库
pnpm db:push
```

### 启动开发服务器

完成上述配置后，即可启动开发服务器。Vite 会自动监听文件变化并热重载，提供流畅的开发体验。

```bash
# 启动开发服务器
pnpm dev

# 服务器将在以下地址运行：
# - 前端：http://localhost:5173
# - 后端：http://localhost:3000
```

## 📖 使用指南

### 文本转换

文本转换模式适合快速处理小段内容，无需上传文件即可完成转换。操作流程如下：

1. 在首页选择"文本转换"标签页
2. 从下拉菜单中选择输入格式（如 Markdown）
3. 选择期望的输出格式（如 HTML）
4. 在左侧文本框中输入或粘贴内容
5. 点击"开始转换"按钮
6. 转换完成后，结果会显示在右侧文本框
7. 对于文本格式，可以直接复制结果；对于二进制格式（DOCX、PDF），点击"下载"按钮获取文件

### 文件转换

文件转换模式支持上传本地文件进行转换，适合处理完整的文档。操作流程如下：

1. 在首页选择"文件转换"标签页
2. 选择输入格式和输出格式
3. 点击上传区域或拖拽文件到上传区域
4. 系统会自动开始转换
5. 转换完成后，点击"下载"按钮获取转换后的文件

### 批量转换

批量转换功能允许一次性处理多个文件，大幅提升工作效率。操作流程如下：

1. 点击顶部导航栏的"批量转换"
2. 选择输入格式和输出格式
3. 点击"选择文件"或拖拽多个文件到上传区域
4. 系统会显示所有待转换文件的列表
5. 点击"开始批量转换"按钮
6. 转换完成后，可以逐个下载或打包下载全部文件

### 查看历史记录

所有转换记录都会自动保存，方便您随时查看和下载之前的转换结果。操作流程如下：

1. 点击顶部导航栏的"历史记录"
2. 浏览转换历史列表，包含时间、格式、文件大小等信息
3. 点击任意记录可以重新下载转换结果
4. 使用搜索和筛选功能快速找到特定记录

## 🔧 开发指南

### 添加新的转换格式

如果需要添加 Pandoc 支持但项目中尚未启用的格式，可以按照以下步骤操作：

1. 在 `server/pandocService.ts` 中的 `SUPPORTED_INPUT_FORMATS` 或 `SUPPORTED_OUTPUT_FORMATS` 数组中添加新格式
2. 在 `server/fileUtils.ts` 的 `getFileExtension` 函数中添加格式到文件扩展名的映射
3. 如果格式需要特殊的 Pandoc 参数，在 `pandocService.ts` 的 `convertWithPandoc` 函数中添加相应逻辑
4. 运行测试确保新格式转换正常工作

### 修改配额限制

配额限制在 `shared/fileConfig.ts` 中定义，包括文件大小限制和转换次数限制。修改这些常量即可调整配额。

```typescript
export const FILE_SIZE_LIMITS = {
  SINGLE_FILE_MAX: 10 * 1024 * 1024,      // 单文件最大 10 MB
  TEXT_CONVERSION_MAX: 5 * 1024 * 1024,   // 文本转换最大 5 MB
  BATCH_TOTAL_MAX: 50 * 1024 * 1024,      // 批量转换总大小 50 MB
};
```

### 运行测试

项目使用 Vitest 作为测试框架，提供了完整的单元测试和集成测试。运行测试可以确保代码质量和功能正确性。

```bash
# 运行所有测试
pnpm test

# 运行特定测试文件
pnpm test server/pandocService.test.ts

# 以监听模式运行测试
pnpm test --watch
```

### 代码规范

项目遵循 TypeScript 和 React 的最佳实践，使用 ESLint 和 Prettier 保持代码风格一致。提交代码前请确保：

- 所有 TypeScript 类型检查通过
- 代码格式符合 Prettier 规范
- 所有测试用例通过
- 新功能包含相应的测试用例

## 📊 格式兼容性

Rewrite 支持 15 种格式的相互转换，总计 **225 种转换组合**。经过系统测试，**96%+ 的转换组合**都能正常工作。详细的兼容性信息请参考 `FORMAT_COMPATIBILITY.md` 文档。

### 已知限制

虽然 Pandoc 是功能强大的转换工具，但某些格式组合可能会有限制或质量损失：

- **复杂排版**：包含复杂表格、多栏布局、自定义样式的文档在转换时可能无法完全保留原始排版
- **嵌入媒体**：图片、视频等嵌入媒体在某些格式转换中可能需要手动处理
- **字体和样式**：不同格式对字体和样式的支持程度不同，转换后可能需要调整
- **数学公式**：LaTeX 数学公式在转换到非技术格式（如 Plain Text）时会丢失

### 推荐转换路径

对于常见的转换需求，以下是推荐的转换路径，可以获得最佳的转换质量：

| 源格式 | 目标格式 | 推荐路径 | 质量评级 |
|--------|----------|----------|----------|
| Markdown | HTML | 直接转换 | ⭐⭐⭐⭐⭐ |
| Markdown | DOCX | 直接转换 | ⭐⭐⭐⭐⭐ |
| Markdown | PDF | 直接转换 | ⭐⭐⭐⭐ |
| DOCX | Markdown | 直接转换 | ⭐⭐⭐⭐ |
| HTML | Markdown | 直接转换 | ⭐⭐⭐⭐ |
| LaTeX | PDF | 直接转换 | ⭐⭐⭐⭐⭐ |

## 🚢 部署指南

### Manus 平台部署

Rewrite 原生支持 Manus 平台部署，所有配置都已预先设置好。部署流程如下：

1. 在 Manus 平台创建新项目，选择"Web App with Database"模板
2. 将代码推送到项目仓库
3. 平台会自动构建和部署应用
4. 所有环境变量（数据库、OAuth、S3）都会自动注入
5. 访问平台提供的 URL 即可使用应用

### 自托管部署

如果您希望在自己的服务器上部署 Rewrite，需要手动配置环境变量和依赖服务。

```bash
# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start

# 使用 PM2 管理进程（推荐）
pm2 start npm --name "rewrite" -- start
```

部署前请确保：

- 已安装 Pandoc 和 WeasyPrint
- 数据库已创建并执行了迁移
- 所有环境变量已正确配置
- 服务器防火墙允许访问应用端口

## 📝 许可证

本项目采用 MIT 许可证。您可以自由使用、修改和分发本项目，但请保留原始许可证声明。

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request 来改进 Rewrite。在提交代码前，请确保：

1. 代码通过所有测试
2. 遵循项目的代码规范
3. 提供清晰的提交信息
4. 对于新功能，请添加相应的测试用例和文档

## 📧 联系方式

如有任何问题或建议，请通过以下方式联系我们：

- **Issue Tracker**：在 GitHub 上提交 Issue
- **Email**：support@manus.im
- **官方网站**：https://manus.im

---

**Rewrite** - 让文档格式转换变得简单高效 🚀
