# 漢字英語ブレンド翻訳システム

日本語テキストを漢字と英語を組み合わせた形式に変換するシステムです。中国語と日本語の共通点を活かしながら、意味の違いに配慮して翻訳を行います。

## 特徴

- 漢字と英語の自然な組み合わせ
- ひらがな・カタカナの使用を避け、漢字を優先
- 中国語と日本語の意味の違いに配慮した翻訳
- DeepSeek APIを活用した高精度な翻訳

## 翻訳の基本方針

### 漢字の使用
- 核となる概念は漢字で表現
- 複合語は可能な限り漢字を使用（例：`日本語`、`中国語`、`文法`）
- 単漢字より複合漢字を優先

### 英語の使用
以下の場合は英語を使用します：
- 基本的な接続詞（and, but, or）
- 必須の前置詞（in, at, on）
- 数量表現（many, some, few）
- 程度を表す語（very, quite, too）

### 中国語との意味の違いに注意が必要な語
以下の語は中国語と日本語で意味や使用法が異なるため、英語での表現を推奨：

1. 状態・程度を表す語：
   - 困難 → "difficult"
   - 非常 → "very"
   - 少数 → "few"

2. 性質を表す語：
   - 美味 → "delicious"
   - 良好 → "good"

3. 動作を表す語：
   - 完了 → "finished"/"complete"

## テスト方式

本プロジェクトでは、閾値ベースのテスト方式を採用しています。

### スコアリング方式
- 必要な漢字パターンの一致：+1点
- 必要な英語パターンの一致：+1点
- 禁止文字（ひらがな・カタカナ）の使用：-5点

### 合格基準
- 総合スコアが閾値（最大スコアの70%）を超えること
- 禁止文字（ひらがな・カタカナ）を含まないこと

## 開発環境のセットアップ

1. リポジトリのクローン
```bash
git clone https://github.com/teramotodaiki/kanji-english-blend.git
cd kanji-english-blend
```

2. 依存パッケージのインストール
```bash
npm install
```

3. 環境変数の設定
- `.dev.vars`ファイルを作成し、必要な環境変数を設定
```
DEEPSEEK_API_KEY=your-api-key
```

4. 開発サーバーの起動
```bash
npm run pages:dev
```

## テストの実行

翻訳テストを実行するには：
```bash
npm run test:translations
```

テストでは以下が検証されます：
- 必要な漢字パターンの存在
- 必要な英語パターンの存在
- 禁止文字（ひらがな・カタカナ）の不在
- スコアが閾値を超えているか

## 良い翻訳例

入力：
```
我学過一点点中文 And 我発見 many 名詞 in
中国語 and 日本語 are 同一, but 文法 and 副詞 are 完全 different.
```

特徴：
- 核となる概念（中国語、日本語、文法）は漢字を使用
- 接続詞は英語（and, but）を使用
- 動詞は文脈に応じて英語（are）を使用
- 形容詞も適切に英語（different）を使用

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。
