/** @type {import('next').NextConfig} */
// Static export configuration for S3 deployment
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  reactStrictMode: true,
  poweredByHeader: false,
  
  images: {
    unoptimized: true,
    domains: [],
  },

  // No base path for S3 - serve from root
  basePath: '',
  assetPrefix: '',
  distDir: 'out',
};

module.exports = nextConfig;