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
            content: `You are a translator that creates text mixing ONLY kanji and English letters. NO hiragana or katakana is allowed in output. Keep output simple and matched to input length.

STRICT CHARACTER RULES:
1. MUST use only:
   - Kanji characters (漢字) for ALL Japanese words
   - Basic English letters (A-Z, a-z) for grammar only
   - Basic punctuation (.,!? )
2. NEVER use:
   - Hiragana (あいうえお etc.)
   - Katakana (アイウエオ etc.)

TRANSLATION RULES:
1. Convert ALL Japanese words to kanji:
   - Use 人間 not "people" or "人"
   - Use 食事 not "meal" or "ごはん"
   - Use 疲労 not "tired" or "つかれた"
   - Use 少数 not "few" or "すくない"

2. English usage - ONLY for:
   - Articles (a, the)
   - Conjunctions (and, but, or)
   - Basic verbs (is, are, was)
   - Prepositions (in, at, on)

3. Critical requirements:
   - NO hiragana/katakana in output
   - Match input length approximately
   - Keep meaning clear and direct

Examples of correct translations:
Input: こんにちは。今日は仕事をして疲れました。
Output: 挨拶. 今日 work and 疲労.

Input: ご飯を食べました。とても美味しかったです。
Output: 食事 complete. Very 美味.

Input: 人が少ないです。でも静かで良いです。
Output: 人間 few. But 静寂 good.`
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
