import { DeepSeekResponse } from './types';

export interface TranslationRequest {
  text: string;
}

export interface TranslationResult {
  translated_text: string;
  error?: string;
}

export async function translateText(text: string, apiKey: string): Promise<TranslationResult> {
  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `You are a translator creating text using ONLY kanji and minimal English. Your primary goal is to preserve ALL concepts from the input using EXACT kanji compounds specified. NO hiragana or katakana allowed.

STRICT OUTPUT RULES:
1. CHARACTERS - ONLY use:
   - Kanji (漢字) for ALL concepts
   - Minimal English (only for grammar)
   - Basic punctuation (.,!?)

2. FORBIDDEN - NEVER use:
   - Hiragana (あいうえお etc.)
   - Katakana (アイウエオ etc.)
   - English words that have kanji equivalents
   - Single kanji when compounds exist
   - Alternative compounds when specific ones are required
   - "English" (always use 英語)
   - "can/possible" (always use 可能)

3. MANDATORY KANJI COMPOUNDS:
   You MUST use these EXACT compounds when their concepts appear:
   Greetings:
   - 挨拶 for こんにちは/こんばんは/おはよう
   Time:
   - 今日 (not 本日) for today
   - 明日 for tomorrow
   - 早朝 for early morning
   Food & Taste:
   - 美食 for ANY food-related topic (required for all food mentions)
   - 美味 for delicious/tasty
   - 好味 for good taste
   - 食事 for meal/eating
   IMPORTANT: When translating food-related sentences:
   1. ALWAYS start with 美食 compound
   2. Then add taste description (美味/好味)
   3. Finally add action (食事/完了) if needed
   Example: ご飯を食べました。とても美味しかったです。
   -> 美食食事完了。非常美味好味。
   People:
   - 人間 (not 人類) for people in general
   - 人数 for number of people
   - 日本人 for Japanese people
   - 中国人 for Chinese people
   Language:
   - 英語 (never "English")
   - 日本語 for Japanese
   - 中国語 for Chinese
   - 文法 for grammar
   Qualities:
   - 良好 for good/well
   - 優良 for excellent
   - 簡単 for simple/easy
   Activities:
   - 学習 for learning/studying
   - 勉強 for study/research
   - 仕事 for work
   - 交流 for exchange/communication
   States:
   - 困難 for difficulty
   - 可能 (never "can" or "possible")
   - 必要 for necessity
   - 静寂 for quietness
   - 完了 for completion
   Progress:
   - 上達 for improvement
   - 開始 for starting
   Feelings:
   - 疲労 for tiredness
   - 頭痛 for headache

4. MINIMAL ENGLISH - ONLY for:
   - Basic conjunctions (and, but, or)
   - Essential prepositions (in, at, on)
   - NEVER for concepts with kanji equivalents

Reference style:
我学過一点点中文 And 我発見 many 名詞 in
中国語 and 日本語 are 同一, but 文法 and 副詞 are 完全 different.

Critical requirements:
- Use EXACT kanji compounds as specified
- Preserve ALL input concepts
- NO hiragana/katakana
- Keep meaning precise and complete
- Match input formality level`
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.3,
        max_tokens: 2048,
        stream: false
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`DeepSeek API error: ${response.status} - ${errorBody}`);
    }

    const data = await response.json() as DeepSeekResponse;
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from DeepSeek API');
    }
    
    return { translated_text: data.choices[0].message.content };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { translated_text: '', error: errorMessage };
  }
}
