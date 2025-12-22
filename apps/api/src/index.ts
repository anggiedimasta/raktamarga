import { trpc } from '@elysiajs/trpc'
import { cors } from '@elysiajs/cors'
import { Elysia } from 'elysia'
import { auth } from '@raktamarga/auth'
import { appRouter } from './router'
import { notificationManager } from './shared/lib/notification-manager'

// Only allow localhost:8080
const ALLOWED_ORIGIN = 'http://localhost:8080'

// Get the allowed origin for response headers
const getAllowedOrigin = (origin: string | null): string => {
  if (origin === ALLOWED_ORIGIN) {
    return origin
  }
  return ALLOWED_ORIGIN
}

// Create app instance
const app = new Elysia({ name: 'raktamarga-api' })
  // Enable CORS for frontend (only localhost:8080)
  .use(
    cors({
      origin: ALLOWED_ORIGIN,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    })
  )
  // Handle BetterAuth routes - use .all() to catch all HTTP methods
  .all('/api/auth/*', async ({ request, set }) => {
    try {
      const response = await auth.handler(request)
      // Ensure CORS headers are set on the response
      if (response instanceof Response) {
        const origin = request.headers.get('origin')
        const allowedOrigin = getAllowedOrigin(origin)
        const url = new URL(request.url)
        const path = url.pathname

        const headers = new Headers(response.headers)
        headers.set('Access-Control-Allow-Origin', allowedOrigin)
        headers.set('Access-Control-Allow-Credentials', 'true')
        headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

        // Handle OAuth callback redirect - redirect to frontend instead of API server
        if (path.includes('/callback/') && response.status >= 300 && response.status < 400) {
          const location = response.headers.get('location')
          if (location && location.startsWith('http://localhost:3000/')) {
            // Replace API URL with frontend URL
            const frontendUrl = location.replace('http://localhost:3000', 'http://localhost:8080')
            headers.set('Location', frontendUrl)
          }
        }

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: headers,
        })
      }
      return response
    } catch (error) {
      console.error('BetterAuth handler error:', error)
      set.status = 500
      return {
        error: 'INTERNAL_SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  })
  // Register health endpoint
  .get('/health', () => {
    return { status: 'ok', timestamp: new Date().toISOString() }
  })
  // Register root endpoint
  .get('/', () => {
    return {
      message: 'Raktamarga API Server',
      tRPC: 'Available at /trpc',
      version: '0.1.0',
      endpoints: {
        health: '/health',
        trpc: '/trpc',
        auth: '/api/auth',
        example: '/trpc/auth.me',
      },
    }
  })
  // Register tRPC plugin with context
  .use(
    trpc(appRouter, {
      endpoint: '/trpc',
      createContext: ({ req }) => {
        return {
          headers: req.headers,
        }
      },
    })
  )
  // WebSocket for real-time notifications
  .ws('/ws/notifications', {
    async open(ws: any) {
      const userId = await notificationManager.getUserIdFromHeaders(ws.data.request.headers)
      if (!userId) {
        ws.send({ type: 'error', message: 'UNAUTHORIZED' })
        ws.close()
        return
      }
      ws.data.userId = userId
      notificationManager.subscribe(userId, ws)
      ws.send({ type: 'connected', data: { userId } })
    },
    close(ws: any) {
      if (ws.data.userId) {
        notificationManager.unsubscribe(ws.data.userId, ws)
      }
    },
    message(ws: any, message: any) {
      // Handle pong or other messages if needed
      if (message === 'ping') {
        ws.send('pong')
      }
    }
  })
  .onError(({ code, error, set }) => {
    // Log all errors for debugging
    console.error('Elysia error:', { code, error: error.message, stack: error.stack })

    if (code === 'NOT_FOUND') {
      set.status = 404
      return {
        error: 'NOT_FOUND',
        message: 'Endpoint not found',
        path: error.path || 'unknown',
        hint: 'Available endpoints: /, /health, /trpc/*',
      }
    }

    // Return detailed error in development
    set.status = code === 'INTERNAL_SERVER_ERROR' ? 500 : 400
    return {
      error: code,
      message: error.message,
      ...(process.env.NODE_ENV !== 'production' && { stack: error.stack }),
    }
  })
  .listen(3000)

console.log(`🦊 Server is running at ${app.server?.hostname}:${app.server?.port}`)
console.log(`📡 tRPC endpoint: http://${app.server?.hostname}:${app.server?.port}/trpc`)
console.log(`🏥 Health check: http://${app.server?.hostname}:${app.server?.port}/health`)

// Export AppRouter type for frontend
export type { AppRouter } from './router'
