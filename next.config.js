/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  reactStrictMode: true,
  poweredByHeader: false, // Remove X-Powered-By header for security
  
  images: {
    unoptimized: true,
    domains: [], // Restrict image domains for security
    dangerouslyAllowSVG: false,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'off'
          },
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
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), accelerometer=(), gyroscope=()'
          }
        ]
      }
    ];
  },

  // Security redirects for common attack vectors
  async redirects() {
    return [
      {
        source: '/wp-admin/:path*',
        destination: '/404',
        permanent: true,
      },
      {
        source: '/admin.php',
        destination: '/404', 
        permanent: true,
      },
      {
        source: '/wp-login.php',
        destination: '/404',
        permanent: true,
      },
      {
        source: '/.env',
        destination: '/404',
        permanent: true,
      },
      {
        source: '/config/:path*',
        destination: '/404',
        permanent: true,
      },
    ];
  },

  // Webpack configuration for security
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Client-side security configurations
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    
    return config;
  },
}

module.exports = nextConfig