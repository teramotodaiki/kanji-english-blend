import { useState } from 'react'
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
function App() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

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
    try {
      console.log('Making translation request...');
      const requestBody = { text: input };
      console.log('Request body:', requestBody);
      
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: input })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      if (!data.translated_text) {
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
