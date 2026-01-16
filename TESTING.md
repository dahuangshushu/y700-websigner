# 本地测试指南

本指南将帮助你进行本地测试和开发。

## 前置要求

### 1. 检查 Node.js 版本

确保已安装 Node.js 18 或更高版本：

```bash
node --version
```

如果没有安装或版本过低，请访问 [Node.js 官网](https://nodejs.org/) 下载安装。

### 2. 检查 npm 版本

```bash
npm --version
```

## 快速开始

### 步骤 1: 安装依赖

在项目根目录执行：

```bash
npm install
```

这将安装所有必需的依赖包，包括：
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Pyodide

**预期输出：**
```
added 234 packages in 30s
```

如果遇到网络问题，可以使用国内镜像：

```bash
npm install --registry=https://registry.npmmirror.com
```

### 步骤 2: 启动开发服务器

```bash
npm run dev
```

**预期输出：**
```
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
  - Ready in 2.5s
```

### 步骤 3: 打开浏览器

访问 [http://localhost:3000](http://localhost:3000)

## 功能测试

### 1. 页面加载测试

- ✅ 页面应正常加载，显示 "AVB 2.0 签名工具" 标题
- ✅ 看到初始化进度条（首次加载时）
- ✅ 状态日志区域正常显示

### 2. Pyodide 初始化测试

**正常流程：**
1. 页面加载后，应该看到 "正在初始化 Pyodide 环境..." 的日志
2. 进度条从 0% 逐渐增加到 100%
3. 最终显示 "Pyodide 环境初始化完成！"

**注意事项：**
- 首次加载需要从 CDN 下载 Pyodide WASM 文件（约 10-20 MB）
- 可能需要 30 秒到 2 分钟，取决于网络速度
- 后续加载会使用浏览器缓存，会快很多

### 3. 文件上传测试

1. **点击"选择文件"按钮**
   - 应该能打开文件选择对话框
   - 只接受 `.img` 文件

2. **选择一个测试文件**
   - 可以使用任意 `.img` 文件进行测试
   - 文件大小应在合理范围内（建议 < 100 MB）
   - 文件选择后应显示文件名和大小

3. **检查日志**
   - 应该看到 "已选择文件: [文件名]" 的日志

### 4. 分区大小设置测试

- ✅ 默认值应为 `100663296`
- ✅ 可以修改为其他数值
- ✅ 只能输入数字

### 5. AVB 签名功能测试

1. **上传文件后，点击"执行 AVB 签名"按钮**

2. **观察日志输出：**
   ```
   [时间] INFO: 开始处理 boot.img 文件...
   [时间] INFO: 文件大小: X 字节
   [时间] INFO: 分区大小: 100663296 字节
   [时间] INFO: 正在执行 AVB 签名...
   [时间] SUCCESS: AVB 签名完成！文件已准备好下载。
   ```

3. **检查下载：**
   - 浏览器应该自动下载签名后的文件
   - 文件名应该是 `原文件名_signed.img`

### 6. 错误处理测试

测试各种错误情况：

1. **未选择文件就点击签名**
   - 应该显示错误日志："请先选择 boot.img 文件"

2. **选择非 .img 文件**
   - 应该显示错误日志："请选择 .img 文件"

3. **网络问题（模拟）**
   - 在开发者工具中禁用网络
   - 应该看到相应的错误日志

## 开发工具使用

### 浏览器开发者工具

打开开发者工具（F12 或右键 > 检查）进行调试：

1. **Console 标签**
   - 查看 JavaScript 日志和错误
   - 查看 Pyodide 的执行状态

2. **Network 标签**
   - 监控文件加载情况
   - 查看 Pyodide WASM 文件的下载进度

3. **Application 标签 > Service Workers**
   - 查看 Service Worker 注册状态
   - 确认 `coi-sw.js` 是否正常注册

### 验证 Service Worker

在浏览器控制台中执行：

```javascript
// 检查 cross-origin isolated 状态
console.log('Cross-Origin Isolated:', window.crossOriginIsolated);

// 检查 Service Worker 注册
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Service Workers:', registrations);
});
```

**预期结果：**
- `crossOriginIsolated` 应为 `true`（在 HTTPS 或 localhost 环境下）
- 应该有至少一个 Service Worker 注册

## 常见问题排查

### 问题 1: 依赖安装失败

**症状：**
```
npm ERR! code ETIMEDOUT
```

**解决方案：**
- 使用国内镜像：`npm install --registry=https://registry.npmmirror.com`
- 检查网络连接
- 清除 npm 缓存：`npm cache clean --force`

### 问题 2: 端口被占用

**症状：**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**解决方案：**
- 关闭占用 3000 端口的其他程序
- 或使用其他端口：`PORT=3001 npm run dev`

### 问题 3: Pyodide 加载失败

**症状：**
- 进度条卡住不动
- 日志显示 "初始化失败"

**解决方案：**
1. 检查网络连接
2. 检查浏览器控制台是否有 CORS 错误
3. 尝试清除浏览器缓存
4. 检查防火墙设置

### 问题 4: Service Worker 未注册

**症状：**
- `window.crossOriginIsolated` 为 `false`

**解决方案：**
1. 确保使用 HTTPS 或 localhost
2. 检查 `public/coi-serviceworker.js` 文件是否存在
3. 尝试手动刷新页面（F5）
4. 清除浏览器缓存和 Service Worker

### 问题 5: 文件签名失败

**症状：**
- 签名过程中出现 Python 错误

**解决方案：**
1. 检查浏览器控制台的详细错误信息
2. 确认 `public/scripts/avbtool.py` 文件存在且完整
3. 检查文件大小是否超过分区大小
4. 验证 testkey.pem 格式是否正确

## 性能测试

### 测试不同文件大小

准备几个不同大小的测试文件：
- 小文件：< 10 MB
- 中等文件：10-50 MB
- 大文件：> 50 MB

观察处理时间和内存使用情况。

### 监控资源使用

在开发者工具中：
1. **Performance 标签** - 记录性能
2. **Memory 标签** - 监控内存使用
3. **Network 标签** - 查看网络请求时间

## 测试检查清单

在提交代码前，确保：

- [ ] 页面在 Chrome、Firefox、Edge 中都能正常加载
- [ ] Pyodide 初始化成功
- [ ] 可以正常上传 .img 文件
- [ ] 分区大小可以修改
- [ ] AVB 签名功能正常
- [ ] 签名后的文件可以下载
- [ ] 错误处理正常工作
- [ ] 日志输出清晰可读
- [ ] Service Worker 正常注册
- [ ] `crossOriginIsolated` 为 `true`

## 下一步

完成本地测试后：
1. 运行构建测试：`npm run build`
2. 检查 `out/` 目录是否生成
3. 准备部署到 GitHub Pages

## 获取帮助

如果遇到问题：
1. 查看浏览器控制台的错误信息
2. 检查 `README.md` 文档
3. 查看项目 Issues（如果有）