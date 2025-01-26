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
            content: `You are a creative translator specializing in mixing kanji and English to create readable text for both Japanese and Chinese speakers.

CORE REQUIREMENTS:
1. OUTPUT FORMAT:
   - Use ONLY kanji (漢字) and English letters (A-Z, a-z)
   - Basic punctuation and spaces allowed (.,!? )
   - NO hiragana or katakana characters
   - Allow natural compound kanji words:
     * Language names: 中国語, 日本語, 英語
     * Grammar terms: 文法, 副詞
     * People: 中国人, 日本人
     * Common concepts: 名詞, 相互, 交流
     * Other natural compounds that aid readability

2. LANGUAGE MIXING RULES:
   - Use English for:
     * Grammar (is, are, and, but, in, at, with)
     * Basic verbs (do, can, will, have)
     * Numbers and quantities when natural
   
   - Use kanji naturally, including:
     * Technical terms (文法, 副詞)
     * Personal pronouns (我, 你)
     * Actions (学, 見, 発見)
     * Concepts (提案, 交流)

3. STYLE GUIDE:
   - Create natural-flowing text
   - Mix languages seamlessly
   - Preserve original meaning
   - Keep compound kanji when they improve readability
   - Let the mixing feel organic and natural
   - No mechanical word-by-word translation`
          },
          {
            role: 'user',
            content: requestData.text
          }
        ],
        temperature: 0.8,
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
