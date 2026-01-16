/** @type {import('next').NextConfig} */
const isProduction = process.env.NODE_ENV === 'production';

const nextConfig = {
  // 只在生产构建时使用静态导出
  ...(isProduction && { output: 'export' }),
  basePath: isProduction ? '/y700-websigner' : '',
  assetPrefix: isProduction ? '/y700-websigner' : '',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        // Pyodide 在浏览器环境下的依赖
        'node-fetch': false,
        'whatwg-fetch': false,
        'whatwg-url': false,
        'url': false,
        'stream': false,
        'util': false,
      };
    } else {
      // 服务端也需要处理某些依赖
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'node-fetch': false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;