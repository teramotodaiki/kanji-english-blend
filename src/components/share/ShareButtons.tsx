import { Button } from "@/components/ui/button"
import { trackShare } from "@/lib/analytics"

interface ShareButtonsProps {
  text: string;
  url: string;
}

export function ShareButtons({ text, url }: ShareButtonsProps) {
  // X (Twitter) Share
  const handleXShare = () => {
    const shareText = encodeURIComponent(text);
    const shareUrl = encodeURIComponent(url);
    trackShare('twitter');
    window.open(
      `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`,
      '_blank'
    );
  };

  // Facebook Share
  const handleFacebookShare = () => {
    const shareUrl = encodeURIComponent(url);
    trackShare('facebook');
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
      '_blank'
    );
  };

  // LINE Share
  const handleLineShare = () => {
    const shareText = encodeURIComponent(text);
    const shareUrl = encodeURIComponent(url);
    trackShare('line');
    window.open(
      `https://social-plugins.line.me/lineit/share?url=${shareUrl}&text=${shareText}`,
      '_blank'
    );
  };

  return (
    <div className="flex flex-wrap gap-2 mt-4 justify-center">
      {/* X (Twitter) Share Button */}
      <Button
        onClick={handleXShare}
        className="bg-black hover:bg-gray-800 text-white"
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        Share on X
      </Button>

      {/* Facebook Share Button */}
      <Button
        onClick={handleFacebookShare}
        className="bg-[#1877f2] hover:bg-[#166fe5] text-white"
      >
        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
        </svg>
        Share
      </Button>

      {/* LINE Share Button */}
      <Button
        onClick={handleLineShare}
        className="bg-[#06c755] hover:bg-[#05b54c] text-white"
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5.85 5.85l-1.07 1.07c-.47.47-1.23.47-1.7 0l-1.07-1.07c-.47-.47-1.23-.47-1.7 0l-1.07 1.07c-.47.47-1.23.47-1.7 0l-1.07-1.07c-.47-.47-1.23-.47-1.7 0l-1.07 1.07c-.47.47-1.23.47-1.7 0l-1.07-1.07c-.47-.47-1.23-.47-1.7 0l-1.07 1.07c-.47.47-1.23.47-1.7 0l-1.07-1.07c-.47-.47-1.23-.47-1.7 0l-1.07 1.07c-.47.47-1.23.47-1.7 0l-1.07-1.07" />
        </svg>
        LINE
      </Button>
    </div>
  );
}
