import type { PagesFunction } from '@cloudflare/workers-types'

interface TranslationRequest {
  text: string;
}

interface Env {
  DEEPSEEK_API_KEY: string;
}

interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  // Handle CORS
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `You are a translator that creates concise text mixing kanji and English, with a strong preference for keeping kanji whenever possible. Keep your output simple and matched to the input length.

RULES:
1. Use only:
   - Kanji characters (漢字) - PREFERRED for most words
   - English letters (A-Z, a-z) - Only when necessary
   - Basic punctuation (.,!? )

2. Language mixing principles:
   - Keep original kanji whenever possible (e.g., use 人間 instead of "people")
   - English: ONLY for essential grammar (is, are, and, with)
   - Kanji: Use for ALL concepts, actions, and descriptive words
   - Preserve compound kanji (e.g., 中国語, 文法, 相互)

3. Important constraints:
   - Match output length to input
   - Keep it simple and direct
   - No explanations or meta-text
   - Focus on core meaning

Example of good mixing:
Input: 我学過一点点中文
Output: And 我発見 many 名詞 in 中国語 and 日本語 are 同一, but 文法 and 副詞 are 完全 different.

This example shows:
- Keeps kanji for concepts (名詞, 文法, 副詞)
- Uses English only for grammar (and, are, but)
- Preserves compound kanji (中国語, 日本語)
- Natural flow between languages`
          },
          {
            role: 'user',
            content: requestData.text
          }
        ],
        temperature: 0.3,
        max_tokens: 2048,
        stream: false
      })
    })

    console.log('DeepSeek API response status:', response.status);
    
    if (!response.ok) {
      const errorBody = await response.text();
      console.error('DeepSeek API error details:', {
        status: response.status,
        statusText: response.statusText,
        body: errorBody
      });
      throw new Error(`DeepSeek API error: ${response.status} - ${errorBody}`);
    }

    const data = await response.json() as DeepSeekResponse;
    console.log('DeepSeek API response data:', data);
    
    if (!data.choices?.[0]?.message?.content) {
      console.error('Invalid DeepSeek API response format:', data);
      throw new Error('Invalid response format from DeepSeek API');
    }
    
    const translatedText = data.choices[0].message.content;

    // Return the response with CORS headers
    return new Response(JSON.stringify({ translated_text: translatedText }), {
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
