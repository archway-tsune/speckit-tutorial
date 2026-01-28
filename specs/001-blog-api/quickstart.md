# クイックスタートガイド: ブログ記事管理API

**ブランチ**: `001-blog-api` | **作成日**: 2026-01-28

## 前提条件

- Node.js 20 LTS 以上
- npm 9 以上
- Git

## セットアップ手順

### 1. リポジトリのクローンとブランチ切り替え

```bash
cd blog-api
git checkout 001-blog-api
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

```bash
cp .env.example .env
```

`.env` ファイルを編集:

```bash
NODE_ENV=development
PORT=3000
DATABASE_URL=./database/blog.db
JWT_SECRET=your-super-secret-key-change-in-production
JWT_ACCESS_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
```

### 4. データベースの初期化

```bash
npm run db:migrate
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

サーバーが `http://localhost:3000` で起動します。

---

## APIエンドポイント一覧

### 認証API

| メソッド | エンドポイント | 認証 | 説明 |
|---------|---------------|------|------|
| POST | /api/v1/auth/register | 不要 | 新規ユーザー登録 |
| POST | /api/v1/auth/login | 不要 | ログイン |
| POST | /api/v1/auth/refresh | 不要 | トークン更新 |
| POST | /api/v1/auth/logout | 必要 | ログアウト |

### 記事API

| メソッド | エンドポイント | 認証 | 説明 |
|---------|---------------|------|------|
| GET | /api/v1/posts | 不要 | 記事一覧取得 |
| GET | /api/v1/posts/:id | 不要 | 記事詳細取得 |
| POST | /api/v1/posts | 必要 | 記事作成 |
| PUT | /api/v1/posts/:id | 必要 | 記事更新 |
| DELETE | /api/v1/posts/:id | 必要 | 記事削除 |

### ドキュメント

| エンドポイント | 説明 |
|---------------|------|
| /api-docs | Swagger UI |
| /health | ヘルスチェック |

---

## 使用例

### ユーザー登録

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "山田太郎"
  }'
```

レスポンス:
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "山田太郎",
    "createdAt": "2026-01-28T10:00:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 3600,
  "tokenType": "Bearer"
}
```

### ログイン

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### 記事作成

```bash
curl -X POST http://localhost:3000/api/v1/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {accessToken}" \
  -d '{
    "title": "初めてのブログ記事",
    "content": "これは記事の本文です。"
  }'
```

### 記事一覧取得

```bash
# 基本的な取得
curl http://localhost:3000/api/v1/posts

# ページネーション付き
curl "http://localhost:3000/api/v1/posts?page=1&limit=10"

# ステータスフィルタリング
curl "http://localhost:3000/api/v1/posts?status=published"

# ソート（新しい順）
curl "http://localhost:3000/api/v1/posts?sort=-createdAt"
```

### 記事更新

```bash
curl -X PUT http://localhost:3000/api/v1/posts/{id} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {accessToken}" \
  -d '{
    "title": "更新されたタイトル",
    "status": "published"
  }'
```

### 記事削除

```bash
curl -X DELETE http://localhost:3000/api/v1/posts/{id} \
  -H "Authorization: Bearer {accessToken}"
```

---

## テストの実行

### 全テスト実行

```bash
npm test
```

### ユニットテストのみ

```bash
npm run test:unit
```

### 統合テストのみ

```bash
npm run test:integration
```

### カバレッジレポート

```bash
npm run test:coverage
```

---

## npm スクリプト一覧

| スクリプト | 説明 |
|-----------|------|
| `npm start` | 本番モードでサーバー起動 |
| `npm run dev` | 開発モードでサーバー起動（ホットリロード） |
| `npm test` | 全テスト実行 |
| `npm run test:unit` | ユニットテスト実行 |
| `npm run test:integration` | 統合テスト実行 |
| `npm run test:coverage` | カバレッジ付きテスト実行 |
| `npm run lint` | ESLintによるコード検証 |
| `npm run lint:fix` | ESLintによる自動修正 |
| `npm run db:migrate` | マイグレーション実行 |
| `npm run db:seed` | シードデータ投入 |

---

## トラブルシューティング

### ポートが使用中

```bash
# ポートを使用しているプロセスを確認
lsof -i :3000

# または別のポートを使用
PORT=3001 npm run dev
```

### データベースエラー

```bash
# データベースファイルを削除して再作成
rm -f database/blog.db
npm run db:migrate
```

### JWT関連エラー

- `JWT_SECRET` が設定されているか確認
- トークンの有効期限が切れていないか確認
- `Authorization` ヘッダーの形式が `Bearer {token}` か確認

---

## 参照

- [機能仕様書](./spec.md)
- [実装計画書](./plan.md)
- [データモデル定義](./data-model.md)
- [API仕様書](http://localhost:3000/api-docs)
