import type { PagesFunction } from '@cloudflare/workers-types'

// This is the main function handler for all routes
export const onRequest: PagesFunction = async (context) => {
  // For API routes, delegate to the specific API handlers
  if (context.request.url.includes('/api/')) {
    // Dynamic import the specific API handler
    const module = await import('./api/translate')
    return module.onRequest(context)
  }

  // For all other routes, continue to the static assets
  return context.next()
}
