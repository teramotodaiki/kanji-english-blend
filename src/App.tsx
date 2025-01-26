import { useState } from 'react'
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
function App() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleTranslate = async () => {
    setIsLoading(true)
    try {
      console.log('Sending request to DeepSeek API...');
      const requestBody = {
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: `You are a creative translator specializing in mixing kanji and English to create elegant, readable text for both Japanese and Chinese readers.

CORE REQUIREMENTS:
1. OUTPUT FORMAT:
   - Use ONLY kanji characters (漢字) and English letters (A-Z, a-z)
   - Basic punctuation and spaces are allowed (.,!? )
   - NO hiragana or katakana characters allowed

2. STYLE GUIDE:
   - Create natural-flowing text that preserves the original meaning
   - Mix kanji and English in a way that feels natural and elegant
   - Choose between kanji or English based on what reads most clearly
   - Use English for grammar words (is, are, and, but, in, at) 
   - Keep the style consistent throughout the text

Here are examples of the style we want:
✓ "I love studying Japanese"
  → "我 love study 日本語"

✓ "私は毎日日本語を勉強しています"
  → "我 daily study 日本語"

✓ "上手になりたいので、頑張って練習します"
  → "For 上達, 我 work hard practice"

✓ "中国と日本の文化が好きです"
  → "我 love 中国 and 日本 culture"

Remember: Focus on creating natural, flowing text that maintains meaning while being readable for both Japanese and Chinese speakers. Never use hiragana or katakana - only kanji and English are allowed.`
          },
          {
            role: "user",
            content: input
          }
        ],
        temperature: 0.8, // Increased for more creative language mixing
        max_tokens: 2048,
        stream: false
      };
      
      console.log('Request body:', requestBody);
      
      console.log('Making API request...');
      // Helper function to ensure output contains only kanji and English characters
      const cleanOutput = (text: string) => {
        let result = text;
        
        // Remove hiragana characters
        result = result.replace(/[\u3040-\u309F]/g, '');
        // Remove katakana characters
        result = result.replace(/[\u30A0-\u30FF]/g, '');
        // Clean up multiple spaces and line breaks
        result = result.replace(/\s+/g, ' ').trim();
        
        return result;
      };

      const response = await fetch('/api/deepseek/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify(requestBody)
      }).catch(error => {
        console.error('Network error:', error);
        throw error;
      });
      
      console.log('Response status:', response.status);
      let responseText;
      try {
        responseText = await response.text();
        console.log('Raw response:', responseText);
        const responseData = JSON.parse(responseText);
        console.log('Parsed response:', responseData);
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.status} - ${responseText}`);
        }
        
        if (!responseData.choices?.[0]?.message?.content) {
          throw new Error('Invalid response format from API');
        }
        
        // Apply the conversion to ensure only kanji and English characters
        const cleanedOutput = cleanOutput(responseData.choices[0].message.content);
        setOutput(cleanedOutput);
      } catch (error) {
        console.error('Error processing response:', error);
        throw error;
      }
    } catch (error) {
      console.error('Translation error:', error)
      setOutput('Error occurred during translation. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold">漢字-English Blend</CardTitle>
          <CardDescription className="text-base">Enter text in Japanese, English, or Chinese to create a kanji-English mixed version</CardDescription>
          <p className="text-sm text-gray-500 mt-2">Example output:
我学中文 And 我見 many 本 in 中国 and 日本...</p>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <Textarea
            placeholder="Enter your text here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[100px]"
          />
          <Button 
            onClick={handleTranslate}
            disabled={isLoading || !input}
            className="w-full"
          >
            {isLoading ? 'Translating...' : 'Translate'}
          </Button>
          {output && (
            <Textarea
              value={output}
              readOnly
              className="min-h-[100px]"
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default App
