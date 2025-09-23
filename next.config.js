/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  reactStrictMode: true,
  poweredByHeader: false,
  
  images: {
    unoptimized: true,
    domains: [],
  },

  // GitHub Pages configuration
  output: 'export',
  basePath: '/thejerktracker',
  assetPrefix: '/thejerktracker/',
  
  // Disable server-side features for static export
  distDir: 'out',
};

module.exports = nextConfig;