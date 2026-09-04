/** @type {import('next').NextConfig} */
const nextConfig = {
<<<<<<< HEAD
  // Server 模式：以 Node.js 服务方式运行（PM2 + Nginx），支持 /api/ai-analysis/stream 等
  // 真实 API 路由（AI 研判接入大模型）。若改回静态导出 output:'export' 将无法承载 API 路由。
  // 原静态导出配置：output: 'export' + trailingSlash: true（适用于纯 OSS 托管，已停用）
  // 静态托管无服务端图片优化，关闭 next/image 优化（本项目已用原生 <img>，双保险）
  images: {
    unoptimized: true,
    domains: ['localhost', 'res.cloudinary.com'],
  },
  env: {
    // 不再覆盖默认值，让 process.env.DEMO_MODE 直接透传
    DEMO_MODE: process.env.DEMO_MODE,
  },
  // 安全头（参照省级公安办公系统保密级别）
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
    ]
  },
=======
  images: {
    domains: ['localhost', 'res.cloudinary.com'],
  },
>>>>>>> a82e6ef3c0922919ec98651f9d917808aa28e81b
}

module.exports = nextConfig
