# データモデル定義: ブログ記事管理API

**ブランチ**: `001-blog-api` | **作成日**: 2026-01-28

## 概要

本ドキュメントでは、ブログ記事管理APIで使用するデータモデルを定義する。

## エンティティ関係図

```
┌─────────────────┐       ┌─────────────────┐
│     users       │       │ refresh_tokens  │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │◄──────│ user_id (FK)    │
│ email           │       │ id (PK)         │
│ password_hash   │       │ token           │
│ name            │       │ expires_at      │
│ created_at      │       │ created_at      │
│ updated_at      │       └─────────────────┘
└─────────────────┘
        │
        │ 1:N
        ▼
┌─────────────────┐
│     posts       │
├─────────────────┤
│ id (PK)         │
│ title           │
│ content         │
│ author          │
│ author_id (FK)  │
│ status          │
│ created_at      │
│ updated_at      │
└─────────────────┘
```

## テーブル定義

### users テーブル

ブログシステムの登録ユーザーを管理する。

| カラム名 | データ型 | 制約 | 説明 |
|---------|---------|------|------|
| id | TEXT | PRIMARY KEY | UUID形式の一意識別子 |
| email | TEXT | UNIQUE, NOT NULL | メールアドレス（ログインID） |
| password_hash | TEXT | NOT NULL | bcryptでハッシュ化されたパスワード |
| name | TEXT | NOT NULL | ユーザー名（記事のauthorに使用） |
| created_at | TEXT | NOT NULL | 作成日時（ISO8601形式） |
| updated_at | TEXT | NOT NULL | 更新日時（ISO8601形式） |

**インデックス**:
- `idx_users_email`: emailカラムに対するインデックス（ログイン時の検索高速化）

**バリデーション**:
- email: 有効なメールアドレス形式
- password: 8文字以上（ハッシュ化前）
- name: 1文字以上100文字以下

---

### posts テーブル

ブログ記事を管理する。

| カラム名 | データ型 | 制約 | 説明 |
|---------|---------|------|------|
| id | TEXT | PRIMARY KEY | UUID形式の一意識別子 |
| title | TEXT | NOT NULL | 記事タイトル（1-200文字） |
| content | TEXT | NOT NULL | 記事本文 |
| author | TEXT | NOT NULL | 著者名（作成時にusers.nameから自動設定） |
| author_id | TEXT | NOT NULL, FK | 作成者のユーザーID |
| status | TEXT | NOT NULL, DEFAULT 'draft' | 公開ステータス（draft/published） |
| created_at | TEXT | NOT NULL | 作成日時（ISO8601形式） |
| updated_at | TEXT | NOT NULL | 更新日時（ISO8601形式） |

**インデックス**:
- `idx_posts_author_id`: author_idカラムに対するインデックス（ユーザーの記事取得）
- `idx_posts_status`: statusカラムに対するインデックス（フィルタリング高速化）
- `idx_posts_created_at`: created_atカラムに対するインデックス（ソート高速化）

**外部キー制約**:
- `author_id` → `users(id)`: ユーザーが削除された場合の動作は検討が必要（現時点ではCASCADE DELETE）

**バリデーション**:
- title: 1文字以上200文字以下、空白のみは不可
- content: 1文字以上、空白のみは不可
- status: 'draft' または 'published' のいずれか

---

### refresh_tokens テーブル

JWT認証のリフレッシュトークンを管理する。

| カラム名 | データ型 | 制約 | 説明 |
|---------|---------|------|------|
| id | TEXT | PRIMARY KEY | UUID形式の一意識別子 |
| user_id | TEXT | NOT NULL, FK | トークン所有者のユーザーID |
| token | TEXT | UNIQUE, NOT NULL | リフレッシュトークン文字列 |
| expires_at | TEXT | NOT NULL | 有効期限（ISO8601形式） |
| created_at | TEXT | NOT NULL | 作成日時（ISO8601形式） |

**インデックス**:
- `idx_refresh_tokens_token`: tokenカラムに対するインデックス（トークン検証高速化）
- `idx_refresh_tokens_user_id`: user_idカラムに対するインデックス（ログアウト時の削除）

**外部キー制約**:
- `user_id` → `users(id)`: CASCADE DELETE（ユーザー削除時にトークンも削除）

---

## APIレスポンス形式

### ユーザー（公開情報のみ）

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "name": "山田太郎",
  "createdAt": "2026-01-28T10:00:00.000Z"
}
```

### 記事

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "title": "ブログ記事のタイトル",
  "content": "記事の本文...",
  "author": "山田太郎",
  "authorId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "published",
  "createdAt": "2026-01-28T10:00:00.000Z",
  "updatedAt": "2026-01-28T10:00:00.000Z"
}
```

### 記事一覧（ページネーション付き）

```json
{
  "data": [
    { /* 記事オブジェクト */ }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### 認証トークン

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 3600,
  "tokenType": "Bearer"
}
```

---

## データ整合性ルール

### ユーザー関連

1. メールアドレスはシステム内で一意でなければならない
2. パスワードは平文で保存してはならない（bcryptハッシュ必須）
3. ユーザー名は記事作成時にauthorフィールドにコピーされる

### 記事関連

1. 記事は必ず作成者（authorId）と紐づく
2. authorフィールドは作成時に固定され、ユーザー名変更の影響を受けない
3. 下書き（draft）記事は作成者のみアクセス可能
4. 公開（published）記事は誰でも閲覧可能
5. 更新・削除は作成者のみ実行可能

### トークン関連

1. 1ユーザーに対して複数のリフレッシュトークンを発行可能（マルチデバイス対応）
2. ログアウト時は該当トークンのみ削除
3. 有効期限切れのトークンは無効として扱う
4. 新しいアクセストークン発行時、リフレッシュトークンは再利用可能

---

## マイグレーション

### 初期スキーマ作成順序

1. `001_create_users.js` - usersテーブル作成
2. `002_create_posts.js` - postsテーブル作成（usersへの外部キー）
3. `003_create_refresh_tokens.js` - refresh_tokensテーブル作成（usersへの外部キー）

### PostgreSQL移行時の考慮事項

| SQLite | PostgreSQL | 備考 |
|--------|------------|------|
| TEXT (UUID) | UUID | ネイティブUUID型使用 |
| TEXT (日時) | TIMESTAMPTZ | タイムゾーン対応 |
| AUTOINCREMENT | SERIAL | 必要に応じて |

---

## 参照

- [機能仕様書](./spec.md)
- [実装計画書](./plan.md)
