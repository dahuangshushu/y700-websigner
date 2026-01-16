// 这个脚本用于将 testkey.pem 转换为 base64 字符串
// 可以在构建时使用，但为了简化，我们在代码中直接嵌入

// 标准的 Android testkey.pem (RSA4096) 应该是一个完整的私钥文件
// 在实际项目中，你可以通过以下方式获取：
// 1. 从 Android 源码中提取
// 2. 使用 OpenSSL 生成测试密钥
// 3. 从已有的 Android 设备中提取

// 注意：本项目中，testkey.pem 的内容直接嵌入在 AVBSigner.tsx 组件中
// 这样可以避免文件系统访问问题