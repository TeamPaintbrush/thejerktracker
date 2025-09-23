/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  reactStrictMode: true,
  poweredByHeader: false,

  images: {
    unoptimized: true,
    domains: [],
  },

  // Netlify configuration - no static export needed
  // API routes will be handled by Netlify Functions
};

module.exports = nextConfig;