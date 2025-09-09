# Go-like TypeScript Project Setup Guide

## 🚀 プロジェクト概要

このプロジェクトは、Go 言語の設計哲学を TypeScript に適用し、生成系 AI が理解しやすく、バグの少ないコードを生成するための包括的な開発環境を提供します。

## 📁 ディレクトリ構成

```
go-like-typescript/
├── .github/
│   └── workflows/
│       ├── ci.yml                    # CI/CDパイプライン
│       └── release.yml               # リリース自動化
├── .vscode/
│   ├── settings.json                 # VSCode設定
│   ├── tasks.json                    # タスク定義
│   ├── launch.json                   # デバッグ設定
│   └── extensions.json               # 推奨拡張機能
├── src/
│   ├── types/
│   │   └── go-like.ts               # Go風型定義とユーティリティ
│   ├── example/
│   │   └── user-service.ts          # 実装例
│   ├── custom-rules/
│   │   └── eslint-rules.ts          # カスタムESLintルール
│   ├── __tests__/
│   │   ├── user-service.test.ts     # テストファイル
│   │   └── type-converter.test.ts
│   ├── test-setup.ts                # テストセットアップ
│   └── index.ts                     # エントリーポイント
├── dist/                            # ビルド出力
├── coverage/                        # テストカバレッジ
├── node_modules/                    # 依存関係
├── .eslintrc.json                   # ESLint設定
├── .prettierrc.json                 # Prettier設定
├── tsconfig.json                    # TypeScript設定
├── jest.config.js                   # Jest設定
├── package.json                     # パッケージ情報
├── package-lock.json                # 依存関係ロック
├── .gitignore                      # Git除外設定
├── .husky/                         # Git hooks
│   ├── pre-commit                  # コミット前フック
│   └── pre-push                    # プッシュ前フック
└── README.md                       # プロジェクト説明
```

## 🛠️ セットアップ手順

### 1. 前提条件

- Node.js 18.x 以上
- npm 8.x 以上
- Git 2.x 以上

### 2. プロジェクト初期化

```bash
# プロジェクトディレクトリ作成
mkdir go-like-typescript
cd go-like-typescript

# package.jsonの初期化
npm init -y

# 依存関係のインストール
npm install --save-dev \
  typescript \
  @typescript-eslint/eslint-plugin \
  @typescript-eslint/parser \
  @typescript-eslint/utils \
  eslint \
  eslint-plugin-prefer-arrow \
  eslint-plugin-unicorn \
  prettier \
  jest \
  ts-jest \
  @types/jest \
  @types/node \
  husky \
  lint-staged \
  ts-node

# Git初期化
git init
git add .
git commit -m "Initial commit"

# Huskyセットアップ
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
npx husky add .husky/pre-push "npm run validate"
```

### 3. 設定ファイルの配置

各設定ファイルを前述の artifact の内容で作成してください：

- `tsconfig.json` - 厳格な TypeScript 設定
- `.eslintrc.json` - 包括的な ESLint 設定
- `.prettierrc.json` - Go 風フォーマット設定
- `jest.config.js` - テスト設定

### 4. ソースコード作成

```bash
# ディレクトリ構造作成
mkdir -p src/{types,example,custom-rules,__tests__}

# ソースファイル作成
touch src/index.ts
touch src/types/go-like.ts
touch src/example/user-service.ts
touch src/custom-rules/eslint-rules.ts
touch src/__tests__/user-service.test.ts
touch src/test-setup.ts
```

### 5. VSCode 設定

`.vscode/settings.json`を作成し、Go 風の開発体験を構築します。

## 🎯 開発フロー

### 日常的な開発コマンド

```bash
# 開発開始
npm run build:watch          # TypeScriptコンパイル監視
npm run test:watch          # テスト監視

# コード品質チェック
npm run type-check          # 型チェック
npm run lint               # ESLintチェック
npm run format:check       # Prettierフォーマットチェック

# 修正
npm run lint:fix           # ESLint自動修正
npm run format             # Prettier自動フォーマット

# 全体検証
npm run validate           # 全チェック実行
```

### コミット前の流れ

```bash
# 1. コード変更
# 2. 自動でpre-commitフックが実行
#    - lint-staged が変更ファイルをチェック
#    - Prettier自動フォーマット
#    - ESLint自動修正
# 3. コミット成功

git add .
git commit -m "feat: implement Go-like error handling"

# 4. プッシュ前にpre-pushフックが実行
#    - npm run validate (型チェック、テスト、リント)
# 5. プッシュ成功

git push origin feature/go-like-patterns
```

## 📋 品質基準

### 必須チェック項目

- ✅ **型安全性**: 100% - `any`型の使用禁止
- ✅ **テストカバレッジ**: 80%以上
- ✅ **ESLint**: エラーゼロ
- ✅ **Prettier**: フォーマット統一
- ✅ **Go 風パターン**: カスタムルール適用

### コード品質メトリクス

```bash
# テストカバレッジ確認
npm run test:coverage

# 複雑度チェック
npm run lint -- --rule complexity:10

# 型チェック詳細
npx tsc --noEmit --strict
```

## 🔧 カスタマイズガイド

### 新しい Go 風ルールの追加

```typescript
// src/custom-rules/新しいルール.ts
export const newGoLikeRule = createRule({
  name: "new-go-like-rule",
  meta: {
    type: "problem",
    docs: {
      description: "ルールの説明",
      recommended: "error",
    },
    // ...
  },
  create(context) {
    return {
      // AST処理ロジック
    };
  },
});
```

### 型定義の拡張

```typescript
// src/types/custom-types.ts
export interface ICustomResult<T> extends IResult<T> {
  readonly metadata?: Record<string, unknown>;
}
```

## 🚀 生成系 AI 活用のベストプラクティス

### プロンプト例

```
あなたは厳格なGo-like TypeScriptコードを生成してください。

必須ルール:
1. 全ての関数は IResult<T> 型で戻り値を返す
2. 型変換は TypeConverter クラスを使用
3. null/undefined チェックは GoLikeValidator を使用
4. エラーハンドリングは明示的に行う
5. === 演算子のみ使用

実装してください：ユーザー管理システムの検索機能
```

### 期待される出力の特徴

- **明示性**: 暗黙的な処理なし
- **予測可能性**: 一貫したパターン
- **型安全性**: 完全な型チェック
- **エラーハンドリング**: Go 風の明示的処理

## 🎉 成功指標

このプロジェクト構成により以下を実現：

1. **生成 AI の理解向上**: シンプルで一貫したパターン
2. **バグ削減**: 厳格な型チェックと明示的エラーハンドリング
3. **保守性向上**: Go 言語の設計哲学による構造化
4. **開発効率**: 自動化された CI/CD と品質チェック

## 📚 参考リソース

- [Go 言語仕様](https://golang.org/ref/spec)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)
