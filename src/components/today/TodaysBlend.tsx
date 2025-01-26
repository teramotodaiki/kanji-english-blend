import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function TodaysBlend() {
  return (
    <Card className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700">
      <CardHeader>
        <CardTitle className="text-xl font-bold">
          Today's Blend ✨
        </CardTitle>
        <CardDescription>
          毎日更新される漢字-English ブレンドの例文
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <blockquote className="text-lg font-medium border-l-4 border-purple-400 pl-4">
            "Life is like tea 茶, you never know what 味 you might get"
          </blockquote>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            - Forrest Gump風
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
