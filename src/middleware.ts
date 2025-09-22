import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Security headers configuration
const securityHeaders = {
  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'none'",
    "form-action 'self'",
  ].join('; '),
  
  // Strict Transport Security
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  
  // X-Frame-Options
  'X-Frame-Options': 'DENY',
  
  // X-Content-Type-Options
  'X-Content-Type-Options': 'nosniff',
  
  // Referrer Policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // X-DNS-Prefetch-Control
  'X-DNS-Prefetch-Control': 'off',
  
  // Permissions Policy
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'accelerometer=()',
    'gyroscope=()',
  ].join(', '),
  
  // Cross-Origin Embedder Policy
  'Cross-Origin-Embedder-Policy': 'credentialless',
  
  // Cross-Origin Opener Policy
  'Cross-Origin-Opener-Policy': 'same-origin',
  
  // Cross-Origin Resource Policy
  'Cross-Origin-Resource-Policy': 'same-origin',
};

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Apply security headers to all routes
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // CSRF Protection for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    
    // Check if it's a state-changing method
    const isStateChanging = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method);
    
    if (isStateChanging) {
      // Check Origin header for CSRF protection
      if (!origin || !host) {
        return new NextResponse('Missing required headers', { status: 403 });
      }
      
      // In development, allow localhost origins
      const allowedOrigins = process.env.NODE_ENV === 'development' 
        ? [`http://${host}`, `https://${host}`, 'http://localhost:3000', 'http://127.0.0.1:3000']
        : [`https://${host}`];
      
      if (!allowedOrigins.includes(origin)) {
        console.warn('CSRF protection triggered:', { origin, host, method: request.method });
        return new NextResponse('Invalid origin', { status: 403 });
      }
    }
  }

  // Rate limiting for API routes (basic implementation)
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
    
    // In a production environment, you would use Redis or similar for rate limiting
    // This is a simplified example for demonstration
    const userAgent = request.headers.get('user-agent') || '';
    if (userAgent.includes('bot') || userAgent.includes('crawler')) {
      // More restrictive for bots
      response.headers.set('X-RateLimit-Limit', '10');
    } else {
      response.headers.set('X-RateLimit-Limit', '100');
    }
    
    // Add rate limit headers for client awareness
    response.headers.set('X-RateLimit-IP', ip);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};