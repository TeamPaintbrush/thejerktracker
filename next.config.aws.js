/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  
  // AWS Amplify optimizations
  experimental: {
    outputFileTracingRoot: __dirname,
  },
  
  // Standalone output for better AWS compatibility
  output: 'standalone',
  
  // AWS-specific image optimization
  images: {
    unoptimized: true, // Amplify handles image optimization
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