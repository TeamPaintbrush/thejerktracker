import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Basic health check
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'thejerktracker',
      version: '1.0.0'
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed'
      },
      { status: 503 }
    )
  }
}