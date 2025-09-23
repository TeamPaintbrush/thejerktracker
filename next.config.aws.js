/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  
  // AWS ECS deployment optimizations
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: __dirname,
  },
  
  // AWS-specific image optimization
  images: {
    unoptimized: true, // ECS handles image optimization
  },
  
  // Security headers for AWS deployment
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          }
        ]
      }
    ];
  },

  // Environment variables
  env: {
    DEPLOYMENT_PLATFORM: 'aws-amplify'
  }
}

module.exports = nextConfig