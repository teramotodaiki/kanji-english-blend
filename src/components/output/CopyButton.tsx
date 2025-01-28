import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { trackEvent } from "@/lib/analytics"

interface CopyButtonProps {
  text: string;
}

export function CopyButton({ text }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      trackEvent('copy', 'interaction', 'output_text');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <Button
      variant="default"
      size="lg"
      onClick={handleCopy}
      className="gap-2 px-6 py-2 font-semibold"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" />
          コピーしました
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" />
          コピー
        </>
      )}
    </Button>
  );
}
