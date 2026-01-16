/** @type {import('next').NextConfig} */
const isProduction = process.env.NODE_ENV === 'production';

const nextConfig = {
  // 只在生产构建时使用静态导出
  ...(isProduction && { output: 'export' }),
  basePath: isProduction ? '/websigner' : '',
  assetPrefix: isProduction ? '/websigner' : '',
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
      };
    }
    return config;
  },
};

module.exports = nextConfig;