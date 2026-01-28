const testUsers = {
  validUser: {
    email: 'test@example.com',
    password: 'password123',
    name: 'テストユーザー',
  },
  anotherUser: {
    email: 'another@example.com',
    password: 'password456',
    name: '別のユーザー',
  },
  invalidEmail: {
    email: 'invalid-email',
    password: 'password123',
    name: 'テスト',
  },
  shortPassword: {
    email: 'short@example.com',
    password: '123',
    name: 'テスト',
  },
};

const testPosts = {
  validPost: {
    title: 'テスト記事タイトル',
    content: 'これはテスト記事の本文です。',
  },
  publishedPost: {
    title: '公開済み記事',
    content: 'これは公開済みの記事です。',
    status: 'published',
  },
  draftPost: {
    title: '下書き記事',
    content: 'これは下書きの記事です。',
    status: 'draft',
  },
  invalidPost: {
    title: '',
    content: '',
  },
  longTitle: {
    title: 'a'.repeat(201),
    content: '本文',
  },
};

module.exports = {
  testUsers,
  testPosts,
};
