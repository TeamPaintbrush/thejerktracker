import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X, RefreshCw, Info } from 'lucide-react'
import { ApiError } from '@/hooks/useErrorHandler'

interface ErrorDisplayProps {
  error: ApiError | Error | string | null
  onDismiss?: () => void
  onRetry?: () => void
  showRetry?: boolean
  className?: string
}

export function ErrorDisplay({ 
  error, 
  onDismiss, 
  onRetry, 
  showRetry = false,
  className = ''
}: ErrorDisplayProps) {
  if (!error) return null

  const getErrorMessage = () => {
    if (typeof error === 'string') return error
    if (error instanceof Error) return error.message
    return error.message
  }

  const getErrorType = () => {
    if (typeof error === 'string' || error instanceof Error) return 'error'
    return error.type || 'error'
  }

  const getIcon = () => {
    const type = getErrorType()
    switch (type) {
      case 'VALIDATION_ERROR':
        return <Info className="w-5 h-5" />
      case 'NOT_FOUND':
        return <AlertTriangle className="w-5 h-5" />
      default:
        return <AlertTriangle className="w-5 h-5" />
    }
  }

  const getColorClasses = () => {
    const type = getErrorType()
    switch (type) {
      case 'VALIDATION_ERROR':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'NOT_FOUND':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      default:
        return 'bg-red-50 border-red-200 text-red-800'
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`p-4 border rounded-lg ${getColorClasses()} ${className}`}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="font-medium">
              {getErrorMessage()}
            </p>
            
            {typeof error === 'object' && 'details' in error && error.details && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm opacity-75 hover:opacity-100">
                  Technical Details
                </summary>
                <pre className="mt-2 text-xs opacity-75 whitespace-pre-wrap overflow-auto">
                  {JSON.stringify(error.details, null, 2)}
                </pre>
              </details>
            )}
          </div>

          <div className="flex items-center gap-2">
            {showRetry && onRetry && (
              <button
                onClick={onRetry}
                className="p-1 rounded hover:bg-black/10 transition-colors"
                title="Retry"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
            
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="p-1 rounded hover:bg-black/10 transition-colors"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// Loading state with error fallback
interface LoadingStateProps {
  isLoading: boolean
  error: ApiError | Error | string | null
  onRetry?: () => void
  children: React.ReactNode
  loadingText?: string
}

export function LoadingState({ 
  isLoading, 
  error, 
  onRetry, 
  children, 
  loadingText = 'Loading...' 
}: LoadingStateProps) {
  if (error) {
    return (
      <ErrorDisplay 
        error={error} 
        onRetry={onRetry}
        showRetry={!!onRetry}
        className="my-4"
      />
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-3 text-gray-600">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
          <span>{loadingText}</span>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Form field error display
interface FieldErrorProps {
  error?: string
  className?: string
}

export function FieldError({ error, className = '' }: FieldErrorProps) {
  if (!error) return null

  return (
    <motion.p
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`text-sm text-red-600 mt-1 ${className}`}
    >
      {error}
    </motion.p>
  )
}

// Global error banner for critical errors
interface ErrorBannerProps {
  isVisible: boolean
  onDismiss: () => void
  title?: string
  description?: string
}

export function ErrorBanner({ 
  isVisible, 
  onDismiss, 
  title = 'System Error',
  description = 'We are experiencing technical difficulties. Please try again later.'
}: ErrorBannerProps) {
  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -100 }}
      className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white shadow-lg"
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5" />
            <div>
              <p className="font-medium">{title}</p>
              <p className="text-sm text-red-100">{description}</p>
            </div>
          </div>
          
          <button
            onClick={onDismiss}
            className="p-1 rounded hover:bg-red-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}