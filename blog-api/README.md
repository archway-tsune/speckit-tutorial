# ブログ記事管理API

JWT認証を備えたRESTful ブログ記事管理APIです。

## 機能

- ユーザー登録・ログイン（JWT認証）
- ブログ記事のCRUD操作
- ページネーション・フィルタリング・ソート
- 下書き・公開ステータス管理
- レート制限

## 技術スタック

- Node.js (LTS)
- Express.js
- SQLite (better-sqlite3)
- JWT (jsonwebtoken)
- bcrypt

## セットアップ

### 前提条件

- Node.js 20.x 以上
- npm

### インストール

```bash
# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env
# .env ファイルを編集してJWT_SECRETを設定

# データベースマイグレーション
npm run db:migrate

# 開発用シードデータ（オプション）
npm run db:seed
```

### 開発サーバー起動

```bash
npm run dev
```

サーバーは `http://localhost:3000` で起動します。

### テスト

```bash
# テスト実行
npm test

# カバレッジ付きテスト
npm run test:coverage

# ウォッチモード
npm run test:watch
```

## APIエンドポイント

### 認証

| メソッド | エンドポイント | 説明 | 認証 |
|---------|---------------|------|------|
| POST | /api/v1/auth/register | 新規登録 | 不要 |
| POST | /api/v1/auth/login | ログイン | 不要 |
| POST | /api/v1/auth/refresh | トークン更新 | リフレッシュトークン |
| POST | /api/v1/auth/logout | ログアウト | リフレッシュトークン |

### 記事

| メソッド | エンドポイント | 説明 | 認証 |
|---------|---------------|------|------|
| GET | /api/v1/posts | 記事一覧取得 | 不要 |
| GET | /api/v1/posts/:id | 記事詳細取得 | 不要（下書きは作成者のみ） |
| POST | /api/v1/posts | 記事作成 | 必須 |
| PUT | /api/v1/posts/:id | 記事更新 | 必須（作成者のみ） |
| DELETE | /api/v1/posts/:id | 記事削除 | 必須（作成者のみ） |

### ドキュメント

- Swagger UI: `http://localhost:3000/api-docs`
- ヘルスチェック: `GET /health`

## 環境変数

| 変数名 | 説明 | デフォルト値 |
|--------|------|-------------|
| NODE_ENV | 実行環境 | development |
| PORT | サーバーポート | 3000 |
| DATABASE_URL | データベースパス | ./database/blog.db |
| JWT_SECRET | JWT署名キー | - |
| JWT_ACCESS_EXPIRES_IN | アクセストークン有効期限 | 1h |
| JWT_REFRESH_EXPIRES_IN | リフレッシュトークン有効期限 | 7d |

## ディレクトリ構造

```
blog-api/
├── src/
│   ├── app.js              # Expressアプリケーション
│   ├── server.js           # サーバー起動
│   ├── config/             # 設定
│   ├── controllers/        # コントローラー
│   ├── services/           # ビジネスロジック
│   ├── models/             # データモデル
│   ├── routes/             # ルーティング
│   ├── middlewares/        # ミドルウェア
│   └── utils/              # ユーティリティ
├── tests/
│   ├── unit/               # ユニットテスト
│   ├── integration/        # 統合テスト
│   └── fixtures/           # テストデータ
└── database/
    ├── migrations/         # マイグレーション
    └── seeds/              # シードデータ
```

## ライセンス

ISC
