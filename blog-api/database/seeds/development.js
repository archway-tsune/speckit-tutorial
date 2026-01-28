const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { getDatabase, closeDatabase } = require('../../src/config/database');
const { runMigrations } = require('../migrate');

const SALT_ROUNDS = 10;

async function seed() {
  const db = getDatabase();

  console.log('Running migrations first...');
  runMigrations();

  console.log('Seeding development data...');

  try {
    // Create test users
    const users = [
      {
        id: uuidv4(),
        email: 'admin@example.com',
        password: 'password123',
        name: '管理者ユーザー',
      },
      {
        id: uuidv4(),
        email: 'user1@example.com',
        password: 'password123',
        name: '山田太郎',
      },
      {
        id: uuidv4(),
        email: 'user2@example.com',
        password: 'password123',
        name: '鈴木花子',
      },
    ];

    const userStmt = db.prepare(`
      INSERT OR REPLACE INTO users (id, email, password_hash, name, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const user of users) {
      const passwordHash = await bcrypt.hash(user.password, SALT_ROUNDS);
      const now = new Date().toISOString();
      userStmt.run(user.id, user.email, passwordHash, user.name, now, now);
      console.log(`  Created user: ${user.email}`);
    }

    // Create sample posts
    const posts = [
      {
        title: 'はじめてのブログ投稿',
        content: `# はじめに

これは最初のブログ投稿です。

## 内容

このAPIを使って、ブログ記事の作成、編集、削除ができます。

- 記事の作成
- 記事の一覧表示
- 記事の編集
- 記事の削除

よろしくお願いします！`,
        authorId: users[0].id,
        author: users[0].name,
        status: 'published',
      },
      {
        title: 'Express.jsでのAPI開発',
        content: `# Express.jsとは

Express.jsは、Node.jsのための軽量で柔軟なWebアプリケーションフレームワークです。

## 特徴

1. ミドルウェアベースのアーキテクチャ
2. ルーティングの簡単な設定
3. テンプレートエンジンのサポート
4. 豊富なエコシステム`,
        authorId: users[1].id,
        author: users[1].name,
        status: 'published',
      },
      {
        title: 'JWT認証の実装方法',
        content: `# JWT認証について

JSON Web Token (JWT) は、ステートレスな認証を実現するための標準規格です。

## 構成要素

- ヘッダー
- ペイロード
- 署名`,
        authorId: users[1].id,
        author: users[1].name,
        status: 'published',
      },
      {
        title: 'SQLiteの基礎',
        content: `# SQLiteとは

SQLiteは、サーバーレスで動作する軽量なリレーショナルデータベースです。

開発環境での使用に最適です。`,
        authorId: users[2].id,
        author: users[2].name,
        status: 'published',
      },
      {
        title: '下書き: 今後の計画',
        content: `# 計画中の機能

- コメント機能
- カテゴリ機能
- タグ機能

まだ公開していない下書きです。`,
        authorId: users[0].id,
        author: users[0].name,
        status: 'draft',
      },
    ];

    const postStmt = db.prepare(`
      INSERT OR REPLACE INTO posts (id, title, content, author, author_id, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const post of posts) {
      const id = uuidv4();
      const now = new Date().toISOString();
      postStmt.run(id, post.title, post.content, post.author, post.authorId, post.status, now, now);
      console.log(`  Created post: ${post.title} (${post.status})`);
    }

    console.log('Seeding completed successfully.');
    console.log('\nTest accounts:');
    console.log('  - admin@example.com / password123');
    console.log('  - user1@example.com / password123');
    console.log('  - user2@example.com / password123');

  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  } finally {
    closeDatabase();
  }
}

if (require.main === module) {
  seed();
}

module.exports = { seed };
