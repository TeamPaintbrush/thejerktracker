// Environment configuration with validation
export const config = {
  // Database
  DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',

  // Application
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'TheJERKTracker',
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Authentication
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || (process.env.NODE_ENV === 'production' ? 'https://thejerktracker0.vercel.app' : 'http://localhost:3000'),
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'development-secret-key',

  // Security
  CSRF_SECRET: process.env.CSRF_SECRET || 'development-csrf-secret',

  // Feature flags
  ENABLE_ANALYTICS: process.env.ENABLE_ANALYTICS === 'true',
  ENABLE_NOTIFICATIONS: process.env.ENABLE_NOTIFICATIONS === 'true',
  ENABLE_MULTI_TENANT: process.env.ENABLE_MULTI_TENANT === 'true',

  // File upload limits
  UPLOAD_MAX_SIZE: parseInt(process.env.UPLOAD_MAX_SIZE || '5242880', 10), // 5MB default
  ALLOWED_FILE_TYPES: process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif',

  // External services (placeholders)
  SENTRY_DSN: process.env.SENTRY_DSN,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,

  // Email configuration
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD,

  // Redis (for future caching)
  REDIS_URL: process.env.REDIS_URL,

  // Production database
  POSTGRES_HOST: process.env.POSTGRES_HOST,
  POSTGRES_PORT: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  POSTGRES_USER: process.env.POSTGRES_USER,
  POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
  POSTGRES_DB: process.env.POSTGRES_DB,
}

// Validation function to check required environment variables
export function validateConfig() {
  const requiredVars = [
    'DATABASE_URL',
  ]

  const missing = requiredVars.filter(varName => {
    const value = process.env[varName]
    return !value || value.trim() === ''
  })

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file and ensure all required variables are set.'
    )
  }

  // Validate database URL format
  if (config.DATABASE_URL && !config.DATABASE_URL.startsWith('file:') && !config.DATABASE_URL.startsWith('postgresql:')) {
    throw new Error('DATABASE_URL must be a valid SQLite or PostgreSQL connection string')
  }

  // Validate app URL format
  try {
    new URL(config.APP_URL)
  } catch (error) {
    throw new Error('NEXT_PUBLIC_APP_URL must be a valid URL')
  }

  return true
}

// Development vs Production configuration checks
export function getEnvironmentInfo() {
  return {
    isDevelopment: config.NODE_ENV === 'development',
    isProduction: config.NODE_ENV === 'production',
    isTest: config.NODE_ENV === 'test',
    databaseType: config.DATABASE_URL.startsWith('file:') ? 'sqlite' : 'postgresql',
    featuresEnabled: {
      analytics: config.ENABLE_ANALYTICS,
      notifications: config.ENABLE_NOTIFICATIONS,
      multiTenant: config.ENABLE_MULTI_TENANT,
    }
  }
}

// Initialize configuration validation on import
if (typeof window === 'undefined') { // Only run on server side
  try {
    validateConfig()
  } catch (error) {
    console.error('Configuration validation failed:', error)
    if (config.NODE_ENV === 'production') {
      process.exit(1)
    }
  }
}