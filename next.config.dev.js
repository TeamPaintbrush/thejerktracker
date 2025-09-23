/** @type {import('next').NextConfig} */
// Development configuration for local hosting
const nextConfig = {
  trailingSlash: true,
  reactStrictMode: true,
  poweredByHeader: false,
  
  images: {
    unoptimized: true,
    domains: [],
  },

  // For local development - no static export
  // output: 'export', // Commented out for dev mode
};

module.exports = nextConfig;