import crypto from 'crypto';

/**
 * Generate a CSRF token
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Verify a CSRF token
 */
export function verifyCSRFToken(token: string, sessionToken: string): boolean {
  if (!token || !sessionToken) {
    return false;
  }
  
  try {
    // Constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(token, 'hex'),
      Buffer.from(sessionToken, 'hex')
    );
  } catch {
    return false;
  }
}

/**
 * Get CSRF token from request headers or body
 */
export function getCSRFTokenFromRequest(req: { headers: Record<string, string | undefined>; body?: Record<string, unknown> }): string | null {
  return (
    req.headers['x-csrf-token'] ||
    req.headers['csrf-token'] ||
    (req.body?.csrfToken as string) ||
    null
  );
}

/**
 * Middleware to add CSRF token to session
 */
export function addCSRFTokenToSession(session: Record<string, unknown>): Record<string, unknown> {
  if (!session.csrfToken) {
    session.csrfToken = generateCSRFToken();
  }
  return session;
}

/**
 * Client-side helper to get CSRF token from meta tag
 */
export function getCSRFTokenFromMeta(): string | null {
  if (typeof document === 'undefined') return null;
  
  const metaTag = document.querySelector('meta[name="csrf-token"]');
  return metaTag ? metaTag.getAttribute('content') : null;
}

/**
 * Add CSRF token to fetch requests
 */
export function createSecureFetch() {
  return async (url: string, options: RequestInit = {}) => {
    const csrfToken = getCSRFTokenFromMeta();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };
    
    if (csrfToken && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method?.toUpperCase() || 'GET')) {
      headers['X-CSRF-Token'] = csrfToken;
    }
    
    return fetch(url, {
      ...options,
      headers,
    });
  };
}

/**
 * React hook for secure API calls
 */
export function useSecureFetch() {
  const secureFetch = createSecureFetch();
  
  return {
    get: (url: string, options?: RequestInit) => 
      secureFetch(url, { ...options, method: 'GET' }),
    
    post: (url: string, data?: Record<string, unknown>, options?: RequestInit) => 
      secureFetch(url, { 
        ...options, 
        method: 'POST', 
        body: data ? JSON.stringify(data) : undefined 
      }),
    
    put: (url: string, data?: Record<string, unknown>, options?: RequestInit) => 
      secureFetch(url, { 
        ...options, 
        method: 'PUT', 
        body: data ? JSON.stringify(data) : undefined 
      }),
    
    delete: (url: string, options?: RequestInit) => 
      secureFetch(url, { ...options, method: 'DELETE' }),
  };
}