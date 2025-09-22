import { NextApiRequest, NextApiResponse } from 'next';
import { z, ZodIssue } from 'zod';

/**
 * Validates request body against a Zod schema
 */
export function validateBody<T>(schema: z.ZodSchema<T>) {
  return (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
    try {
      const result = schema.safeParse(req.body);
      
      if (!result.success) {
        const errors = result.error.issues.map((err: ZodIssue) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        return res.status(400).json({
          error: 'Validation failed',
          details: errors,
        });
      }
      
      // Attach validated data to request
      (req as ValidatedRequest).validatedBody = result.data;
      next();
    } catch (error) {
      console.error('Validation middleware error:', error);
      return res.status(500).json({
        error: 'Internal server error during validation',
      });
    }
  };
}

/**
 * Validates query parameters against a Zod schema
 */
export function validateQuery<T>(schema: z.ZodSchema<T>) {
  return (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
    try {
      const result = schema.safeParse(req.query);
      
      if (!result.success) {
        const errors = result.error.issues.map((err: ZodIssue) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        return res.status(400).json({
          error: 'Query validation failed',
          details: errors,
        });
      }
      
      // Attach validated data to request
      (req as ValidatedRequest).validatedQuery = result.data;
      next();
    } catch (error) {
      console.error('Query validation middleware error:', error);
      return res.status(500).json({
        error: 'Internal server error during query validation',
      });
    }
  };
}

/**
 * Validates URL parameters against a Zod schema
 */
export function validateParams<T>(schema: z.ZodSchema<T>) {
  return (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
    try {
      const result = schema.safeParse(req.query);
      
      if (!result.success) {
        const errors = result.error.issues.map((err: ZodIssue) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        return res.status(400).json({
          error: 'Parameter validation failed',
          details: errors,
        });
      }
      
      // Attach validated data to request
      (req as ValidatedRequest).validatedParams = result.data;
      next();
    } catch (error) {
      console.error('Parameter validation middleware error:', error);
      return res.status(500).json({
        error: 'Internal server error during parameter validation',
      });
    }
  };
}

/**
 * Helper function to run middleware in sequence
 */
export function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: (req: NextApiRequest, res: NextApiResponse, next: (result?: unknown) => void) => void
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

/**
 * Composes multiple middleware functions
 */
export function composeMiddleware(
  ...middlewares: Array<(req: NextApiRequest, res: NextApiResponse, next: () => void) => void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    for (const middleware of middlewares) {
      try {
        await runMiddleware(req, res, middleware);
      } catch {
        // If any middleware fails, stop execution
        return;
      }
    }
  };
}

/**
 * Validates and sanitizes input data
 */
export function sanitizeInput(data: unknown): unknown {
  if (typeof data === 'string') {
    // Basic string sanitization
    return data.trim().replace(/[<>]/g, '');
  }
  
  if (typeof data === 'object' && data !== null) {
    if (Array.isArray(data)) {
      return data.map(sanitizeInput);
    }
    
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return data;
}

/**
 * Extended request type with validated data
 */
export interface ValidatedRequest extends NextApiRequest {
  validatedBody?: unknown;
  validatedQuery?: unknown;
  validatedParams?: unknown;
}