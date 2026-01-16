# AVB 2.0 签名工具 - Y700 四代专用

为 Android boot.img 添加 AVB 2.0 签名的单页 Web 应用，部署在 GitHub Pages 上。

## 功能特性

- ✅ 无需后端，所有逻辑在浏览器内完成（使用 Pyodide WASM）
- ✅ 内置 avbtool.py 的 Python 逻辑和标准的 testkey.pem
- ✅ 支持自定义分区大小，默认值 100663296（Y700 四代常用值）
- ✅ 专业的刷机工具界面，带进度条和状态日志
- ✅ 解决 GitHub Pages 上 WebWorker 跨域问题的补丁脚本

## 技术栈

- **Next.js 14** - React 框架
- **Tailwind CSS** - 样式框架
- **Pyodide** - 在浏览器中运行 Python (WASM)
- **TypeScript** - 类型安全

## 本地开发

### 前置要求

- Node.js 18+ 
- npm 或 yarn

### 安装依赖

```bash
npm install
```

如果遇到网络问题，可以使用国内镜像：

```bash
npm install --registry=https://registry.npmmirror.com
```

### 运行开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

**首次加载说明：**
- Pyodide 初始化需要下载 WASM 文件（约 10-20 MB）
- 可能需要 30 秒到 2 分钟，请耐心等待
- 后续加载会使用浏览器缓存，速度会更快

### 详细测试指南

查看 [TESTING.md](./TESTING.md) 获取完整的本地测试指南。

### 构建静态文件

```bash
npm run build
```

构建输出将在 `out/` 目录中。

## 部署到 GitHub Pages

### 自动部署（推荐）

1. 在 GitHub 仓库中创建 `.github/workflows/deploy.yml`（已包含）
2. 推送代码到 GitHub
3. GitHub Actions 会自动构建并部署到 `gh-pages` 分支

### 手动部署

1. 构建静态文件：
```bash
npm run build
```

2. 将 `out/` 目录内容推送到 `gh-pages` 分支

3. 在 GitHub 仓库设置中启用 GitHub Pages，选择 `gh-pages` 分支

### 配置仓库名称

项目已配置为使用仓库名 `y700-websigner`。

如果仓库名称不同，需要修改 `next.config.js` 中的 `basePath`：

```javascript
basePath: isProduction ? '/your-repo-name' : '',
```

**当前配置：** `/y700-websigner`

## 使用说明

1. 打开应用页面
2. 等待 Pyodide 环境初始化完成（首次加载可能需要一些时间）
3. 点击"选择文件"按钮，选择你的 `boot.img` 文件
4. 确认或调整分区大小（默认 100663296 字节，适用于 Y700 四代）
5. 点击"执行 AVB 签名"按钮
6. 等待处理完成，签名后的文件会自动下载

## 注意事项

- 首次加载 Pyodide 可能需要下载较大的 WASM 文件，请耐心等待
- 处理大型 boot.img 文件可能需要较长时间，请勿关闭页面
- 建议在 HTTPS 环境下使用（GitHub Pages 默认支持）
- 如果需要使用其他密钥，可以修改代码中的 testkey.pem 内容

## 项目结构

```
.
├── app/                    # Next.js App Router
│   ├── layout.tsx         # 根布局
│   ├── page.tsx           # 首页
│   └── globals.css        # 全局样式
├── components/            # React 组件
│   └── AVBSigner.tsx     # AVB 签名主组件
├── public/               # 静态资源
│   ├── scripts/          # Python 脚本
│   │   └── avbtool.py   # AVB 工具脚本
│   ├── coi-serviceworker.js  # COOP/COEP 补丁脚本
│   └── coi-sw.js        # Service Worker
├── next.config.js        # Next.js 配置
├── tailwind.config.js    # Tailwind 配置
└── package.json          # 项目依赖
```

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！