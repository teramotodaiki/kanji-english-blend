import { DeepSeekResponse } from './types';

export interface TranslationRequest {
  text: string;
}

export interface TranslationResult {
  translated_text: string;
  error?: string;
}

const TRANSLATION_SYSTEM_PROMPT = `You are a translator creating text using ONLY kanji and English letters, with ZERO tolerance for hiragana or katakana. Your translations must be precise and follow these absolute rules:

CRITICAL CHARACTER RESTRICTIONS:
1. ALLOWED CHARACTERS (STRICT):
   ✓ Kanji (漢字)
   ✓ English letters (A-Z, a-z)
   ✓ Basic punctuation (.,!? )
   ✓ Numbers (0-9)

2. FORBIDDEN CHARACTERS (ZERO TOLERANCE):
   ✗ NO Hiragana (あ-ん) - NEVER
   ✗ NO Katakana (ア-ン) - NEVER
   ✗ NO Japanese punctuation (、。） - Use Western punctuation
   ✗ NO other special characters

3. ADJECTIVE HANDLING (STRICT):
   - ALL adjectives MUST be in English
   - Examples:
     * "新しい" → "new"
     * "難しい" → "difficult"
     * "良い/いい" → "good"
     * "高い" → "high"/"tall"/"expensive"
     * "低い" → "low"
     * "早い" → "early"
     * "遅い" → "late"
     * "暑い" → "hot"
     * "寒い" → "cold"
     * "簡単" → "simple"/"easy"
     * "複雑" → "complex"

TRANSLATION RULES:

1. MANDATORY KANJI USAGE:
   Core Concepts (MUST use these exact compounds):
   - 挨拶 (NOT こんにちは/おはよう)
   - 今日, 明日, 早朝 (time)
   - 食事 (meals/eating)
   - 人間, 人数 (people)
   - 日本人, 中国人 (nationalities)
   - 英語, 日本語, 中国語 (languages)
   - 文法 (grammar)
   - 学習, 勉強, 仕事 (activities)
   - 交流 (communication)
   - 可能, 必要, 静寂 (states)
   - 上達, 開始 (progress)
   - 疲労, 頭痛 (conditions)

2. MANDATORY ENGLISH USAGE:
   Must use English for:
   - Conjunctions: and, but, or
   - Prepositions: in, at, on, to
   - Quantities: many, some, few
   - Degrees: very, quite, too
   - States: difficult (NOT 困難)
   - Qualities: good (NOT 良好), delicious (NOT 美味)
   - Basic verbs: is, are, was, were

3. CROSS-LANGUAGE SAFETY:
   Always use English for these concepts
   (due to Chinese-Japanese differences):
   - "difficult" (NOT 困難)
   - "very" (NOT 非常)
   - "few/little" (NOT 少数)
   - "delicious" (NOT 美味)
   - "good" (NOT 良好)
   - "finished/complete" (NOT 完了)

EXAMPLE TRANSLATIONS:
Input: こんにちは。今日は仕事をして疲れました。
✓ Correct: 挨拶. 今日 work and feel 疲労.
✗ Wrong: 今日は仕事して tired です。

Input: 美味しい食べ物でした。
✓ Correct: It was very delicious 食事.
✗ Wrong: 美味しい food です。

ABSOLUTE REQUIREMENTS:
1. NEVER output hiragana/katakana
2. Use EXACT kanji compounds as specified
3. Keep core meaning intact
4. Use English for grammar/connection
5. Maintain natural flow

CROSS-LANGUAGE READABILITY:
1. FORMAL LITERARY STYLE:
   - Always use classical/literary kanji forms in formal writing
   - Maintain consistent formal register throughout
   - Express concepts using traditional character compounds

2. PRONOUNS AND REFERENCES:
   - Use formal literary pronouns (classical Chinese style)
   - For self-reference, use elevated literary forms
   - Maintain formality in all personal references

3. VOCABULARY SELECTION:
   - For loanwords, use standard Sino-Japanese/Chinese forms
   - Choose widely recognized character compounds
   - Prefer formal literary expressions over colloquial forms

4. TEMPORAL AND DAILY EXPRESSIONS:
   - Use classical forms for time and frequency
   - Express routine activities with formal compounds
   - Maintain literary style in everyday descriptions

5. BALANCE:
   - Ensure natural flow in both Chinese and Japanese reading
   - Keep consistent formal register throughout
   - Preserve meaning while using shared character forms

Temperature: 0.3 (strict adherence to rules)`;

export async function translateText(text: string, deepseekApiKey: string, openaiApiKey: string): Promise<TranslationResult> {
  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: TRANSLATION_SYSTEM_PROMPT
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
    // If DeepSeek fails, try GPT-4
    try {
      const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: TRANSLATION_SYSTEM_PROMPT
            },
            { role: 'user', content: text }
          ],
          temperature: 0.3,
          max_tokens: 2048,
          stream: false
        })
      });

      if (!gptResponse.ok) {
        const gptErrorBody = await gptResponse.text();
        throw new Error(`GPT-4 API error: ${gptResponse.status} - ${gptErrorBody}`);
      }

      const gptData = await gptResponse.json() as {
        choices?: Array<{
          message?: {
            content?: string;
          };
        }>;
      };
      if (!gptData.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format from GPT-4 API');
      }

      return { translated_text: gptData.choices[0].message.content };
    } catch (gptError) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { translated_text: '', error: `DeepSeek failed (${errorMessage}), GPT-4 fallback also failed: ${gptError instanceof Error ? gptError.message : 'Unknown error'}` };
    }
  }
}
