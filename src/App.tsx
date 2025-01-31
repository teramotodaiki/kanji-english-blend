import { useState } from 'react'
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShareButtons } from "@/components/share/ShareButtons"
import { SampleTexts } from "@/components/sample/SampleTexts"
import { CopyButton } from "@/components/output/CopyButton"
import { trackEvent } from "@/lib/analytics"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
function App() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

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

  const handleTranslate = async () => {
    setIsLoading(true);
    trackEvent('translate', 'interaction', 'text_input');
    try {
      console.log('Making translation request...');
      const requestBody = { text: input };
      console.log('Request body:', requestBody);
      
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ text: input })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      
      if (response.status === 401 || (data.error && data.error.includes('Authentication Fails'))) {
        throw new Error('API authentication failed. Please try again later.');
      }
      
      if (!data.translated_text) {
        if (data.error) {
          throw new Error(`API Error: ${data.error}`);
        }
        throw new Error('Invalid response format from API');
      }

      // Apply the conversion to ensure only kanji and English characters
      const cleanedOutput = cleanOutput(data.translated_text);
      setOutput(cleanedOutput);
    } catch (error) {
      console.error('Translation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setOutput(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-white dark:bg-gray-900 py-8 px-4">
      <Card className="max-w-2xl mx-auto shadow-lg dark:bg-gray-800">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold dark:text-white">漢字-English Blend</CardTitle>
          <div className="flex items-center justify-center space-x-4 text-base dark:text-gray-200">
            <span>🇯🇵</span>
            <span>➡️</span>
            <span>🇯🇵🇺🇸</span>
            <span>⬅️</span>
            <span>🇨🇳</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <SampleTexts onSelect={setInput} />
          <Textarea
            placeholder="Enter your text here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[100px] dark:bg-gray-700 dark:text-gray-100"
          />
          <div className="space-y-2">
            <Button 
              onClick={handleTranslate}
              disabled={isLoading || !input}
              className="w-full dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white"
            >
              {isLoading ? '🔄...' : '🔄'}
            </Button>
          </div>
          {output && (
            <>
              <div className="space-y-2">
                <Textarea
                  value={output}
                  readOnly
                  className="min-h-[100px] dark:bg-gray-700 dark:text-gray-100"
                />
                <div className="flex gap-2 items-center">
                  <CopyButton text={output} />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      trackEvent('feedback', 'user_input', `good: ${input} -> ${output}`);
                      toast({
                        description: 'ありがとうございます。評価を送信しました！',
                        duration: 3000
                      });
                    }}
                  >
                    👍 Good
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      trackEvent('feedback', 'user_input', `bad: ${input} -> ${output}`);
                      toast({
                        description: 'フィードバックをありがとうございます。',
                        duration: 3000
                      });
                    }}
                  >
                    👎 Bad
                  </Button>
                  <ShareButtons
                    text={`${output}\n\nCreated with 漢字-English Blend ✨\nTry it yourself: ${window.location.href}\n#漢字English #KanjiEnglish`}
                    url={window.location.href}
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
        <div className="text-center p-4 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <span>🔄</span>
            <span className="text-sm">Try the samples above!</span>
          </div>
          <p className="mb-2">© 2024 @teramotodaiki and Devin</p>
          <p className="text-xs">
            <a href="https://github.com/teramotodaiki/kanji-english-blend" className="underline hover:text-gray-700">GitHub</a>
            {" "}| 我 use {" "}
            <a href="https://deepseek.com" className="underline hover:text-gray-700">DeepSeek</a>
          </p>
        </div>
      </Card>
    </div>
      <Toaster />
    </>
  )
}

export default App
