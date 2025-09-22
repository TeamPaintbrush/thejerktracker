import { useState, useCallback } from 'react'
import { useToast } from '@/components/Toast'

export interface ApiError {
  message: string
  type?: string
  details?: Record<string, unknown>
  statusCode?: number
}

export interface UseErrorHandlerOptions {
  showToast?: boolean
  logError?: boolean
  defaultMessage?: string
}

export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const { 
    showToast = true, 
    logError = true, 
    defaultMessage = 'An unexpected error occurred' 
  } = options
  
  const { showToast: displayToast } = useToast()
  const [error, setError] = useState<ApiError | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleError = useCallback((error: unknown, context?: string) => {
    let apiError: ApiError

    if (error instanceof Error) {
      apiError = {
        message: error.message,
        type: 'CLIENT_ERROR'
      }
    } else if (typeof error === 'object' && error !== null) {
      // Handle API error responses
      const errorObj = error as Record<string, unknown>
      apiError = {
        message: (errorObj.error as string) || (errorObj.message as string) || defaultMessage,
        type: (errorObj.type as string) || 'API_ERROR',
        details: errorObj.details as Record<string, unknown>,
        statusCode: errorObj.statusCode as number
      }
    } else {
      apiError = {
        message: defaultMessage,
        type: 'UNKNOWN_ERROR'
      }
    }

    setError(apiError)

    if (logError) {
      console.error('Error handled:', {
        error: apiError,
        context,
        timestamp: new Date().toISOString()
      })
    }

    if (showToast) {
      displayToast({
        type: 'error',
        title: apiError.message,
        message: apiError.details ? JSON.stringify(apiError.details) : undefined
      })
    }

    return apiError
  }, [showToast, logError, defaultMessage, displayToast])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const asyncWrapper = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    context?: string
  ): Promise<T | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await asyncFn()
      return result
    } catch (error) {
      handleError(error, context)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [handleError])

  return {
    error,
    isLoading,
    handleError,
    clearError,
    asyncWrapper
  }
}

// Hook for API calls with built-in error handling
export function useApiCall<T = unknown>() {
  const errorHandler = useErrorHandler()

  const callApi = useCallback(async (
    url: string,
    options?: RequestInit,
    context?: string
  ): Promise<T | null> => {
    return errorHandler.asyncWrapper(async () => {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers
        },
        ...options
      })

      if (!response.ok) {
        let errorData: Record<string, unknown>
        try {
          errorData = await response.json()
        } catch {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` }
        }
        
        throw { 
          ...errorData, 
          statusCode: response.status 
        }
      }

      return await response.json()
    }, context || `API call to ${url}`)
  }, [errorHandler])

  return {
    ...errorHandler,
    callApi
  }
}

// Utility for handling form submission errors
export function useFormErrorHandler() {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const { handleError, clearError } = useErrorHandler()

  const handleFormError = useCallback((error: unknown) => {
    const apiError = handleError(error, 'Form submission')
    
    // Extract field-specific errors if available
    if (apiError?.details?.validationErrors) {
      const errors = apiError.details.validationErrors as Array<{
        field: string
        message: string
      }>
      
      const newFieldErrors: Record<string, string> = {}
      errors.forEach(err => {
        newFieldErrors[err.field] = err.message
      })
      setFieldErrors(newFieldErrors)
    }

    return apiError
  }, [handleError])

  const clearFieldErrors = useCallback(() => {
    setFieldErrors({})
    clearError()
  }, [clearError])

  const getFieldError = useCallback((fieldName: string) => {
    return fieldErrors[fieldName]
  }, [fieldErrors])

  return {
    fieldErrors,
    handleFormError,
    clearFieldErrors,
    getFieldError
  }
}