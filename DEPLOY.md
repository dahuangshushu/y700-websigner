# 部署指南 - y700-websigner

本指南将帮助你将项目部署到 GitHub Pages 仓库 `y700-websigner`。

## 快速部署步骤

### 方法 1: 自动部署（推荐）

1. **将代码推送到 GitHub 仓库**

   如果还没有创建仓库，先在 GitHub 上创建名为 `y700-websigner` 的仓库。

   然后执行：
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/y700-websigner.git
   git push -u origin main
   ```

   注意：将 `YOUR_USERNAME` 替换为你的 GitHub 用户名。

2. **启用 GitHub Pages**

   - 进入仓库设置页面：`Settings` > `Pages`
   - 在 `Source` 部分，选择 `GitHub Actions`
   - 保存设置

3. **触发部署**

   - 推送代码到 `main` 分支会自动触发 GitHub Actions 构建
   - 或者进入 `Actions` 标签，手动触发工作流

4. **等待部署完成**

   - 在 `Actions` 标签中查看部署进度
   - 部署完成后，访问：`https://YOUR_USERNAME.github.io/y700-websigner/`

### 方法 2: 手动部署

1. **构建静态文件**

   ```bash
   npm run build
   ```

   这会生成 `out/` 目录，包含所有静态文件。

2. **部署到 gh-pages 分支**

   ```bash
   # 安装 gh-pages 工具（如果还没有）
   npm install --save-dev gh-pages

   # 添加部署脚本到 package.json
   # "deploy": "gh-pages -d out"

   # 执行部署
   npm run deploy
   ```

   或者手动推送到 `gh-pages` 分支：
   ```bash
   git checkout --orphan gh-pages
   git rm -rf .
   cp -r out/* .
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin gh-pages
   ```

3. **在 GitHub 设置中启用 Pages**

   - 进入仓库设置：`Settings` > `Pages`
   - 选择 `gh-pages` 分支作为源
   - 保存设置

## 配置说明

### basePath 配置

项目已配置为使用仓库名作为 basePath：
- 生产环境：`/y700-websigner`
- 开发环境：空（直接使用根路径）

配置文件位置：`next.config.js`

```javascript
basePath: isProduction ? '/y700-websigner' : '',
```

**重要：** 如果你更改了仓库名称，记得同时更新 `next.config.js` 中的 `basePath`。

## 验证部署

部署成功后，你应该能够：

1. 访问页面：`https://YOUR_USERNAME.github.io/y700-websigner/`
2. 看到 "AVB 2.0 签名工具" 标题
3. Pyodide 正常初始化（首次加载需要一些时间）
4. 所有静态资源正常加载（脚本、样式等）

## 故障排查

### 问题 1: 页面 404 或空白

**可能原因：**
- basePath 配置不正确
- GitHub Pages 设置错误

**解决方案：**
1. 确认仓库名称是 `y700-websigner`
2. 检查 `next.config.js` 中的 basePath 配置
3. 重新构建并推送代码

### 问题 2: 资源加载失败（CSS/JS 文件 404）

**可能原因：**
- basePath 配置错误导致资源路径不正确

**解决方案：**
1. 检查浏览器控制台的网络请求
2. 确认请求路径包含 `/y700-websigner` 前缀
3. 检查 `next.config.js` 中的 `assetPrefix` 配置

### 问题 3: Service Worker 未注册

**可能原因：**
- Service Worker 脚本路径错误
- HTTPS 要求

**解决方案：**
1. GitHub Pages 自动使用 HTTPS，这应该没问题
2. 检查 `public/coi-serviceworker.js` 和 `public/coi-sw.js` 是否存在
3. 在浏览器开发者工具中检查 Application > Service Workers

### 问题 4: Pyodide 加载失败

**可能原因：**
- CDN 访问问题
- 跨域限制

**解决方案：**
1. 确认 `window.crossOriginIsolated` 为 `true`
2. 检查 Service Worker 是否正常注册
3. 查看浏览器控制台的错误信息

## 自定义域名（可选）

如果你有自定义域名：

1. 在仓库设置中添加 `CNAME` 文件（内容为你的域名）
2. 在域名 DNS 设置中添加 CNAME 记录指向 `YOUR_USERNAME.github.io`
3. 更新 `next.config.js` 中的 basePath 为空字符串

## 持续部署

配置完成后，每次推送到 `main` 分支都会自动触发构建和部署：

```bash
git add .
git commit -m "Update feature"
git push origin main
```

GitHub Actions 会自动：
1. 构建 Next.js 应用
2. 生成静态文件
3. 部署到 GitHub Pages

## 相关链接

- [GitHub Pages 文档](https://docs.github.com/en/pages)
- [Next.js 静态导出](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
