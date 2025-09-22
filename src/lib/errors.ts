import { NextApiResponse, NextApiRequest } from 'next'
import { ZodError } from 'zod'

// Error types enum
export enum ErrorType {
  VALIDATION = 'VALIDATION_ERROR',
  AUTHENTICATION = 'AUTHENTICATION_ERROR',
  AUTHORIZATION = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT_ERROR',
  RATE_LIMIT = 'RATE_LIMIT_ERROR',
  DATABASE = 'DATABASE_ERROR',
  EXTERNAL_API = 'EXTERNAL_API_ERROR',
  INTERNAL = 'INTERNAL_ERROR'
}

// Custom error classes
export class AppError extends Error {
  public readonly type: ErrorType
  public readonly statusCode: number
  public readonly isOperational: boolean
  public readonly details?: Record<string, unknown>

  constructor(
    message: string,
    type: ErrorType,
    statusCode: number,
    isOperational = true,
    details?: Record<string, unknown>
  ) {
    super(message)
    this.type = type
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.details = details

    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, ErrorType.VALIDATION, 400, true, details)
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, ErrorType.AUTHENTICATION, 401)
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, ErrorType.AUTHORIZATION, 403)
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, ErrorType.NOT_FOUND, 404)
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, ErrorType.CONFLICT, 409)
  }
}

export class DatabaseError extends AppError {
  constructor(message = 'Database operation failed') {
    super(message, ErrorType.DATABASE, 500, false)
  }
}

// Error logger
export class ErrorLogger {
  static log(error: Error | AppError, context?: Record<string, unknown>) {
    const timestamp = new Date().toISOString()
    const errorInfo = {
      timestamp,
      message: error.message,
      stack: error.stack,
      type: error instanceof AppError ? error.type : 'UNKNOWN',
      statusCode: error instanceof AppError ? error.statusCode : 500,
      isOperational: error instanceof AppError ? error.isOperational : false,
      details: error instanceof AppError ? error.details : undefined,
      context
    }

    if (error instanceof AppError && error.isOperational) {
      console.warn('Operational Error:', JSON.stringify(errorInfo, null, 2))
    } else {
      console.error('System Error:', JSON.stringify(errorInfo, null, 2))
    }

    // In production, you might want to send this to a logging service
    // like Winston, Sentry, or CloudWatch
  }
}

// API Error handler
export function handleApiError(
  error: Error | AppError,
  res: NextApiResponse,
  context?: Record<string, unknown>
) {
  ErrorLogger.log(error, context)

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: error.message,
      type: error.type,
      details: error.details
    })
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const validationErrors = error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
      code: issue.code
    }))

    return res.status(400).json({
      error: 'Validation failed',
      type: ErrorType.VALIDATION,
      details: { validationErrors }
    })
  }

  // Handle Prisma errors
  if (error.message.includes('Unique constraint')) {
    return res.status(409).json({
      error: 'Resource already exists',
      type: ErrorType.CONFLICT
    })
  }

  if (error.message.includes('Record to update not found')) {
    return res.status(404).json({
      error: 'Resource not found',
      type: ErrorType.NOT_FOUND
    })
  }

  // Default to internal server error
  return res.status(500).json({
    error: 'Internal server error',
    type: ErrorType.INTERNAL
  })
}

// Async wrapper for API routes
export function asyncHandler(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await handler(req, res)
    } catch (error) {
      handleApiError(error as Error, res, {
        method: req.method,
        url: req.url,
        userAgent: req.headers['user-agent']
      })
    }
  }
}

// Validation helper that throws proper errors
export function validateAndThrow<T>(
  schema: { safeParse: (data: unknown) => { success: boolean; data?: T; error?: ZodError } },
  data: unknown,
  errorMessage = 'Validation failed'
): T {
  const result = schema.safeParse(data)
  if (!result.success) {
    const validationErrors = result.error!.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
      code: issue.code
    }))
    
    throw new ValidationError(errorMessage, { validationErrors })
  }
  return result.data!
}