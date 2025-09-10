# Go-like TypeScript 生成AI指示書

## 基本ルール（必須遵守）

あなたはGo言語の設計哲学に従ってTypeScriptコードを生成してください。以下は絶対に守るべきルールです：

### 型安全性

- 全ての関数は明示的な戻り値型を定義する
- `any`型は絶対に使用しない
- `===`のみ使用、`==`は禁止
- 型変換は`Number()`, `String()`, `Boolean()`を明示的に使用

### エラーハンドリングパターン（重要）

```typescript
// 必須: この形式で戻り値を統一
interface IResult<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
}

// 成功時
return { success: true, data: result };

// エラー時
return { success: false, error: 'エラーメッセージ' };
```

### 関数定義パターン

```typescript
// 必須パターン
const functionName = (param: ParamType): IResult<ReturnType> => {
  // バリデーション
  if (!param) {
    return { success: false, error: 'Parameter is required' };
  }

  // 処理
  const result = processData(param);

  // 成功時の戻り値
  return { success: true, data: result };
};
```

### 禁止事項

- `try-catch`文の使用（明示的エラーハンドリングを使用）
- `throw`文の使用
- `!!`や`+`による暗黙的型変換
- `var`宣言（`const`/`let`のみ）
- オプショナルチェーニング`?.`（明示的null/undefinedチェックを優先）

### 必須使用パターン

- `const`/`let`のみ使用
- アロー関数式優先
- 明示的な型注釈
- 関数型プログラミングパターン

## コード例

### ユーザー作成関数

```typescript
interface IUser {
  readonly id: number;
  readonly name: string;
  readonly email: string;
}

interface IUserCreateRequest {
  readonly name: string;
  readonly email: string;
}

const createUser = (request: IUserCreateRequest): IResult<IUser> => {
  // バリデーション
  if (!request.name || request.name.length === 0) {
    return { success: false, error: 'Name is required' };
  }

  if (!request.email || request.email.length === 0) {
    return { success: false, error: 'Email is required' };
  }

  // 処理
  const user: IUser = {
    id: Date.now(),
    name: request.name,
    email: request.email
  };

  return { success: true, data: user };
};
```

### データ変換例

```typescript
const convertToNumber = (value: string): IResult<number> => {
  if (value.length === 0) {
    return { success: false, error: 'Empty string cannot be converted' };
  }

  const converted = Number(value);
  if (Number.isNaN(converted)) {
    return { success: false, error: `Cannot convert "${value}" to number` };
  }

  return { success: true, data: converted };
};
```

### 結果の使用例

```typescript
const processUserData = (userData: IUserCreateRequest): IResult<string> => {
  const createResult = createUser(userData);

  if (!createResult.success) {
    return { success: false, error: createResult.error };
  }

  const user = createResult.data;
  if (!user) {
    return { success: false, error: 'User data is undefined' };
  }

  return { success: true, data: `User ${user.name} created with ID ${String(user.id)}` };
};
```

## チェックリスト

生成したコードが以下を満たしているか確認してください：

- [ ] 全ての関数が`IResult<T>`型を返している
- [ ] `any`型を使用していない
- [ ] `===`のみ使用している
- [ ] `try-catch`を使用していない
- [ ] 型変換が明示的である
- [ ] `const`/`let`のみ使用している
- [ ] エラーメッセージが明確である
- [ ] null/undefinedチェックが明示的である

このルールに従って、予測可能で保守性の高いTypeScriptコードを生成してください。
