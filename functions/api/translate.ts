import type { PagesFunction } from '@cloudflare/workers-types'
import { translateText, TranslationRequest } from './translation-service'

interface Env {
  DEEPSEEK_API_KEY: string;
}

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  // Handle CORS
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  }

  try {
    console.log('Function environment check:', {
      hasApiKey: !!env.DEEPSEEK_API_KEY,
      keyLength: env.DEEPSEEK_API_KEY?.length || 0,
      keyFormat: env.DEEPSEEK_API_KEY?.startsWith('sk-') || false,
      keyPrefix: env.DEEPSEEK_API_KEY?.substring(0, 10) + '...' || 'undefined'
    });

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    const requestData: TranslationRequest = await request.json()
    if (!requestData.text) {
      return new Response('Text is required', { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const result = await translateText(requestData.text, env.DEEPSEEK_API_KEY);
    
    if (result.error) {
      return new Response(JSON.stringify({ error: result.error }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      })
    }

    return new Response(JSON.stringify({ translated_text: result.translated_text }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error('Translation error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }
}
