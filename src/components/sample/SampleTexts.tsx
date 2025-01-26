import { Button } from "@/components/ui/button"
import { trackEvent } from "@/lib/analytics"

interface SampleTextsProps {
  onSelect: (text: string) => void;
}

const samples = {
  japanese: [
    {
      text: "私は毎日コーヒーを飲みます。朝はパンも食べます。",
      label: "日常生活 🗾"
    },
    {
      text: "東京の桜は春に咲きます。とても美しいです。",
      label: "季節 🌸"
    }
  ],
  chinese: [
    {
      text: "我喜欢在北京吃饭。中国菜很好吃。",
      label: "美食 🍜"
    },
    {
      text: "上海的天气今天很好。我想去公园。",
      label: "天気 ☀️"
    }
  ],
  english: [
    {
      text: "I love watching movies on weekends with my friends.",
      label: "Hobby 🎬"
    },
    {
      text: "The weather is beautiful today. Let's go to the park!",
      label: "Weather 🌞"
    }
  ]
};

export function SampleTexts({ onSelect }: SampleTextsProps) {
  const handleSelect = (text: string, category: string, index: number) => {
    trackEvent('select_sample', 'interaction', `${category}_${index}`);
    onSelect(text);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 w-full">日本語のサンプル:</h3>
        {samples.japanese.map((sample, index) => (
          <Button
            key={`ja-${index}`}
            variant="outline"
            size="sm"
            onClick={() => handleSelect(sample.text, 'japanese', index)}
            className="text-sm"
          >
            {sample.label}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 w-full">中文样本:</h3>
        {samples.chinese.map((sample, index) => (
          <Button
            key={`zh-${index}`}
            variant="outline"
            size="sm"
            onClick={() => handleSelect(sample.text, 'chinese', index)}
            className="text-sm"
          >
            {sample.label}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 w-full">English samples:</h3>
        {samples.english.map((sample, index) => (
          <Button
            key={`en-${index}`}
            variant="outline"
            size="sm"
            onClick={() => handleSelect(sample.text, 'english', index)}
            className="text-sm"
          >
            {sample.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
