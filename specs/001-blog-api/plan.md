# 実装計画書: ブログ記事管理API

**ブランチ**: `001-blog-api` | **作成日**: 2026-01-28 | **仕様書**: [spec.md](./spec.md)
**入力**: `/specs/001-blog-api/spec.md` の機能仕様書

## 概要

JWT認証を備えたRESTful ブログ記事管理APIを構築する。ユーザー登録・ログイン機能と、記事のCRUD操作（作成・読み取り・更新・削除）を提供し、MVCパターンに基づいた構造で実装する。

## 技術コンテキスト

**言語/バージョン**: Node.js (LTS)
**主要依存関係**: Express.js, jsonwebtoken, bcrypt, uuid
**ストレージ**: SQLite（開発）/ PostgreSQL（本番）
**テスト**: Jest
**ターゲットプラットフォーム**: Linux サーバー / Docker コンテナ
**プロジェクトタイプ**: 単一プロジェクト（APIサーバー）
**パフォーマンス目標**: 100同時ユーザー対応、記事一覧1秒以内応答
**制約**: レート制限（認証: 5リクエスト/分）、JWT有効期限（1時間）
**スケール/スコープ**: シングルテナント、初期100ユーザー規模

## 憲章チェック

*ゲート: フェーズ0リサーチの前に確認必須。フェーズ1設計後に再確認。*

| 原則 | 状態 | 対応内容 |
|------|------|----------|
| I. セキュリティファースト | ✅ 準拠 | bcryptハッシュ、JWT認証、入力バリデーション実装 |
| II. 明確なエラーハンドリング | ✅ 準拠 | 統一エラーフォーマット `{error: {code, message, details}}` |
| III. APIバージョニング | ✅ 準拠 | `/api/v1/` プレフィックス使用 |
| IV. HTTPステータスコード | ✅ 準拠 | 標準ステータスコード使用 |
| V. OpenAPIドキュメント | ✅ 準拠 | Swagger UI `/api-docs` 提供 |
| VI. テストカバレッジ | ✅ 準拠 | 80%以上のカバレッジ目標 |

## プロジェクト構造

### ドキュメント（本機能）

```text
specs/001-blog-api/
├── spec.md              # 機能仕様書（完了）
├── plan.md              # 本ファイル（実装計画）
├── research.md          # 技術調査結果
├── data-model.md        # データモデル定義
├── quickstart.md        # 開発クイックスタート
├── contracts/           # APIコントラクト定義
│   ├── auth.yaml        # 認証API
│   └── posts.yaml       # 記事API
├── checklists/          # 品質チェックリスト
│   └── requirements.md  # 要件チェックリスト（完了）
└── tasks.md             # タスク一覧（/speckit.tasks で生成）
```

### ソースコード（リポジトリルート）

```text
blog-api/
├── src/
│   ├── app.js                    # アプリケーションエントリーポイント
│   ├── server.js                 # サーバー起動
│   ├── config/
│   │   ├── index.js              # 設定管理
│   │   └── database.js           # DB接続設定
│   ├── models/                   # データモデル（Model層）
│   │   ├── User.js               # ユーザーモデル
│   │   ├── Post.js               # 記事モデル
│   │   └── RefreshToken.js       # リフレッシュトークンモデル
│   ├── controllers/              # コントローラー（Controller層）
│   │   ├── authController.js     # 認証コントローラー
│   │   └── postController.js     # 記事コントローラー
│   ├── services/                 # ビジネスロジック
│   │   ├── authService.js        # 認証サービス
│   │   └── postService.js        # 記事サービス
│   ├── routes/                   # ルーティング
│   │   ├── index.js              # ルートアグリゲーター
│   │   ├── auth.js               # 認証ルート
│   │   └── posts.js              # 記事ルート
│   ├── middlewares/              # ミドルウェア
│   │   ├── auth.js               # JWT認証ミドルウェア
│   │   ├── rateLimiter.js        # レート制限
│   │   ├── errorHandler.js       # エラーハンドリング
│   │   └── validator.js          # 入力バリデーション
│   ├── utils/                    # ユーティリティ
│   │   ├── errors.js             # カスタムエラークラス
│   │   ├── logger.js             # ロギング
│   │   └── pagination.js         # ページネーション
│   └── docs/                     # OpenAPI定義
│       └── swagger.js            # Swagger設定
├── tests/
│   ├── unit/                     # ユニットテスト
│   │   ├── services/
│   │   │   ├── authService.test.js
│   │   │   └── postService.test.js
│   │   └── utils/
│   │       └── pagination.test.js
│   ├── integration/              # 統合テスト
│   │   ├── auth.test.js          # 認証APIテスト
│   │   └── posts.test.js         # 記事APIテスト
│   └── fixtures/                 # テストデータ
│       └── testData.js
├── database/
│   ├── migrations/               # マイグレーション
│   │   ├── 001_create_users.js
│   │   ├── 002_create_posts.js
│   │   └── 003_create_refresh_tokens.js
│   └── seeds/                    # シードデータ
│       └── development.js
├── .env.example                  # 環境変数テンプレート
├── .eslintrc.js                  # ESLint設定
├── jest.config.js                # Jest設定
├── package.json                  # 依存関係
└── README.md                     # プロジェクト説明
```

**構造決定**: 単一プロジェクト構成を採用。MVCパターンをベースに、Service層を追加してビジネスロジックを分離。Controller層はHTTPリクエスト/レスポンスの処理に専念し、Service層がドメインロジックを担当する。

## 複雑性追跡

> **憲章チェックで違反がある場合のみ記入**

該当なし - すべての憲章原則に準拠。

---

## 実装フェーズ

### フェーズ 0: プロジェクト初期化

#### 0.1 プロジェクトセットアップ

- `npm init` でプロジェクト初期化
- 必要なパッケージのインストール:
  - 本番: `express`, `jsonwebtoken`, `bcrypt`, `uuid`, `better-sqlite3`, `express-rate-limit`, `swagger-ui-express`, `yamljs`, `cors`, `helmet`, `dotenv`
  - 開発: `jest`, `supertest`, `eslint`, `nodemon`
- ディレクトリ構造の作成
- ESLint設定
- 環境変数テンプレート作成

#### 0.2 基盤設定

- `src/config/index.js`: 環境変数の読み込みと設定オブジェクト
- `src/config/database.js`: SQLite接続設定
- `src/app.js`: Expressアプリケーション初期化
- `src/server.js`: サーバー起動

### フェーズ 1: データベース設計

#### 1.1 スキーマ設計

**users テーブル**
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,           -- UUID
  email TEXT UNIQUE NOT NULL,    -- メールアドレス
  password_hash TEXT NOT NULL,   -- bcryptハッシュ
  name TEXT NOT NULL,            -- ユーザー名（author用）
  created_at TEXT NOT NULL,      -- ISO8601形式
  updated_at TEXT NOT NULL       -- ISO8601形式
);
CREATE INDEX idx_users_email ON users(email);
```

**posts テーブル**
```sql
CREATE TABLE posts (
  id TEXT PRIMARY KEY,           -- UUID
  title TEXT NOT NULL,           -- タイトル（1-200文字）
  content TEXT NOT NULL,         -- 本文
  author TEXT NOT NULL,          -- 著者名（users.nameから自動設定）
  author_id TEXT NOT NULL,       -- 作成者ID（users.id）
  status TEXT NOT NULL DEFAULT 'draft',  -- draft/published
  created_at TEXT NOT NULL,      -- ISO8601形式
  updated_at TEXT NOT NULL,      -- ISO8601形式
  FOREIGN KEY (author_id) REFERENCES users(id)
);
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_created_at ON posts(created_at);
```

**refresh_tokens テーブル**
```sql
CREATE TABLE refresh_tokens (
  id TEXT PRIMARY KEY,           -- UUID
  user_id TEXT NOT NULL,         -- ユーザーID
  token TEXT UNIQUE NOT NULL,    -- リフレッシュトークン
  expires_at TEXT NOT NULL,      -- 有効期限
  created_at TEXT NOT NULL,      -- 作成日時
  FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
```

#### 1.2 マイグレーション実装

- `database/migrations/001_create_users.js`
- `database/migrations/002_create_posts.js`
- `database/migrations/003_create_refresh_tokens.js`

### フェーズ 2: モデル層

#### 2.1 Userモデル

```javascript
// src/models/User.js
class User {
  static async create({ email, passwordHash, name })
  static async findByEmail(email)
  static async findById(id)
}
```

#### 2.2 Postモデル

```javascript
// src/models/Post.js
class Post {
  static async create({ title, content, author, authorId })
  static async findById(id)
  static async findAll({ page, limit, status, sort })
  static async update(id, updates)
  static async delete(id)
  static async countByStatus(status)
}
```

#### 2.3 RefreshTokenモデル

```javascript
// src/models/RefreshToken.js
class RefreshToken {
  static async create({ userId, token, expiresAt })
  static async findByToken(token)
  static async deleteByToken(token)
  static async deleteByUserId(userId)
}
```

### フェーズ 3: ミドルウェア構成

#### 3.1 認証ミドルウェア

```javascript
// src/middlewares/auth.js
// - JWT検証
// - req.user にユーザー情報を設定
// - オプショナル認証（公開エンドポイント用）
```

#### 3.2 レート制限

```javascript
// src/middlewares/rateLimiter.js
// - 認証エンドポイント: 5リクエスト/分
// - 一般エンドポイント: 100リクエスト/分
```

#### 3.3 エラーハンドリング

```javascript
// src/middlewares/errorHandler.js
// - 統一エラーフォーマット
// - HTTPステータスコードマッピング
// - エラーログ出力
```

#### 3.4 バリデーション

```javascript
// src/middlewares/validator.js
// - リクエストボディ/パラメータのバリデーション
// - バリデーションルール定義
```

### フェーズ 4: サービス層

#### 4.1 認証サービス

```javascript
// src/services/authService.js
class AuthService {
  async register({ email, password, name })
  async login({ email, password })
  async refresh(refreshToken)
  async logout(refreshToken)
  generateTokens(user)
  verifyAccessToken(token)
}
```

#### 4.2 記事サービス

```javascript
// src/services/postService.js
class PostService {
  async create({ title, content }, user)
  async getById(id, currentUser)
  async getAll({ page, limit, status, sort }, currentUser)
  async update(id, updates, user)
  async delete(id, user)
}
```

### フェーズ 5: コントローラー層

#### 5.1 認証コントローラー

| メソッド | エンドポイント | 説明 |
|---------|---------------|------|
| register | POST /api/v1/auth/register | 新規登録 |
| login | POST /api/v1/auth/login | ログイン |
| refresh | POST /api/v1/auth/refresh | トークン更新 |
| logout | POST /api/v1/auth/logout | ログアウト |

#### 5.2 記事コントローラー

| メソッド | エンドポイント | 認証 | 説明 |
|---------|---------------|------|------|
| create | POST /api/v1/posts | 必須 | 記事作成 |
| getAll | GET /api/v1/posts | 不要 | 一覧取得 |
| getById | GET /api/v1/posts/:id | 不要 | 詳細取得 |
| update | PUT /api/v1/posts/:id | 必須 | 記事更新 |
| delete | DELETE /api/v1/posts/:id | 必須 | 記事削除 |

### フェーズ 6: ルーティング

```javascript
// src/routes/index.js
router.use('/api/v1/auth', authRoutes);
router.use('/api/v1/posts', postRoutes);
router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
```

### フェーズ 7: エラーハンドリング戦略

#### 7.1 カスタムエラークラス

```javascript
// src/utils/errors.js
class AppError extends Error {
  constructor(code, message, statusCode, details = null)
}

class ValidationError extends AppError { /* VALIDATION_ERROR, 400 */ }
class UnauthorizedError extends AppError { /* UNAUTHORIZED, 401 */ }
class ForbiddenError extends AppError { /* FORBIDDEN, 403 */ }
class NotFoundError extends AppError { /* NOT_FOUND, 404 */ }
class RateLimitError extends AppError { /* RATE_LIMIT_EXCEEDED, 429 */ }
class InternalError extends AppError { /* INTERNAL_ERROR, 500 */ }
```

#### 7.2 エラーレスポンス形式

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "タイトルは必須です",
    "details": [
      { "field": "title", "message": "1文字以上200文字以下で入力してください" }
    ]
  }
}
```

### フェーズ 8: テスト戦略

#### 8.1 ユニットテスト

- **対象**: Service層、ユーティリティ関数
- **モック**: データベース、外部依存
- **カバレッジ目標**: 90%以上

```
tests/unit/
├── services/
│   ├── authService.test.js
│   └── postService.test.js
└── utils/
    └── pagination.test.js
```

#### 8.2 統合テスト

- **対象**: APIエンドポイント
- **環境**: インメモリSQLite
- **カバレッジ目標**: 80%以上

```
tests/integration/
├── auth.test.js
└── posts.test.js
```

#### 8.3 テストシナリオ

**認証テスト**:
- 正常な登録フロー
- 重複メールアドレス登録の拒否
- 正常なログインフロー
- 不正な認証情報でのログイン失敗
- トークンリフレッシュ
- ログアウト

**記事テスト**:
- 認証ユーザーによる記事作成
- 未認証での記事作成失敗
- 公開記事一覧取得（ページネーション、フィルタ、ソート）
- 下書き記事のアクセス制御
- 自分の記事の更新/削除
- 他人の記事の更新/削除失敗

### フェーズ 9: APIドキュメント

#### 9.1 OpenAPI定義

- `src/docs/swagger.js`: Swagger設定
- `specs/001-blog-api/contracts/auth.yaml`: 認証APIスキーマ
- `specs/001-blog-api/contracts/posts.yaml`: 記事APIスキーマ

#### 9.2 ドキュメントエンドポイント

- `GET /api-docs`: Swagger UI

### フェーズ 10: デプロイメント

#### 10.1 環境設定

```bash
# .env.example
NODE_ENV=development
PORT=3000
DATABASE_URL=./database/blog.db
JWT_SECRET=your-secret-key
JWT_ACCESS_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
```

#### 10.2 Docker対応

```dockerfile
# Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "src/server.js"]
```

#### 10.3 本番環境考慮事項

- PostgreSQL への移行スクリプト
- 環境変数による設定切り替え
- ヘルスチェックエンドポイント (`GET /health`)
- グレースフルシャットダウン

---

## 依存関係図

```
┌─────────────────────────────────────────────────────────────┐
│                        Routes                                │
│  (auth.js, posts.js)                                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Middlewares                             │
│  (auth, rateLimiter, validator, errorHandler)               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Controllers                             │
│  (authController, postController)                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       Services                               │
│  (authService, postService)                                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        Models                                │
│  (User, Post, RefreshToken)                                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       Database                               │
│  (SQLite / PostgreSQL)                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 次のステップ

1. **`/speckit.tasks`** を実行してタスク一覧を生成
2. **`/speckit.implement`** を実行して実装を開始

## 参照ドキュメント

- [機能仕様書](./spec.md)
- [プロジェクト憲章](../../blog-api/.specify/memory/constitution.md)
- [要件チェックリスト](./checklists/requirements.md)
