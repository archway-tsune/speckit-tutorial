const postService = require('../../../src/services/postService');
const authService = require('../../../src/services/authService');
const { testUsers, testPosts } = require('../../fixtures/testData');

describe('PostService', () => {
  let user;
  let anotherUser;

  beforeEach(async () => {
    const result1 = await authService.register(testUsers.validUser);
    user = result1.user;

    const result2 = await authService.register(testUsers.anotherUser);
    anotherUser = result2.user;
  });

  describe('create', () => {
    it('should create a post with default draft status', async () => {
      const post = await postService.create(testPosts.validPost, user);

      expect(post.id).toBeDefined();
      expect(post.title).toBe(testPosts.validPost.title);
      expect(post.content).toBe(testPosts.validPost.content);
      expect(post.author).toBe(user.name);
      expect(post.authorId).toBe(user.id);
      expect(post.status).toBe('draft');
    });

    it('should create a post with specified status', async () => {
      const post = await postService.create(testPosts.publishedPost, user);

      expect(post.status).toBe('published');
    });

    it('should auto-set author name from user', async () => {
      const post = await postService.create(testPosts.validPost, user);

      expect(post.author).toBe(user.name);
    });
  });

  describe('getById', () => {
    it('should get published post without authentication', async () => {
      const created = await postService.create(testPosts.publishedPost, user);
      const post = await postService.getById(created.id, null);

      expect(post.id).toBe(created.id);
    });

    it('should get draft post when accessed by author', async () => {
      const created = await postService.create(testPosts.draftPost, user);
      const post = await postService.getById(created.id, user);

      expect(post.id).toBe(created.id);
    });

    it('should throw NotFoundError for draft accessed by non-author', async () => {
      const created = await postService.create(testPosts.draftPost, user);

      await expect(postService.getById(created.id, anotherUser))
        .rejects
        .toThrow('指定された記事が見つかりません');
    });

    it('should throw NotFoundError for draft accessed without auth', async () => {
      const created = await postService.create(testPosts.draftPost, user);

      await expect(postService.getById(created.id, null))
        .rejects
        .toThrow('指定された記事が見つかりません');
    });

    it('should throw NotFoundError for non-existent post', async () => {
      await expect(postService.getById('550e8400-e29b-41d4-a716-446655440000', user))
        .rejects
        .toThrow('指定された記事が見つかりません');
    });
  });

  describe('getAll', () => {
    beforeEach(async () => {
      // Create some posts
      await postService.create(testPosts.publishedPost, user);
      await postService.create({ ...testPosts.publishedPost, title: 'Published 2' }, user);
      await postService.create(testPosts.draftPost, user);
      await postService.create(testPosts.draftPost, anotherUser);
    });

    it('should return only published posts for unauthenticated users', async () => {
      const result = await postService.getAll({}, null);

      expect(result.data.length).toBe(2);
      expect(result.data.every(p => p.status === 'published')).toBe(true);
    });

    it('should return pagination info', async () => {
      const result = await postService.getAll({ page: 1, limit: 10 }, null);

      expect(result.pagination).toBeDefined();
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
      expect(result.pagination.total).toBe(2);
    });

    it('should filter by published status', async () => {
      const result = await postService.getAll({ status: 'published' }, null);

      expect(result.data.every(p => p.status === 'published')).toBe(true);
    });

    it('should show user\'s own drafts when filtering by draft status', async () => {
      const result = await postService.getAll({ status: 'draft' }, user);

      expect(result.data.length).toBe(1);
      expect(result.data[0].authorId).toBe(user.id);
    });

    it('should return empty for draft filter without auth', async () => {
      const result = await postService.getAll({ status: 'draft' }, null);

      expect(result.data.length).toBe(0);
    });
  });

  describe('update', () => {
    let post;

    beforeEach(async () => {
      post = await postService.create(testPosts.validPost, user);
    });

    it('should update post by owner', async () => {
      // Wait a bit to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 10));

      const updated = await postService.update(post.id, { title: '更新タイトル' }, user);

      expect(updated.title).toBe('更新タイトル');
      expect(new Date(updated.updatedAt).getTime()).toBeGreaterThanOrEqual(
        new Date(post.updatedAt).getTime()
      );
    });

    it('should throw ForbiddenError when non-owner tries to update', async () => {
      await expect(postService.update(post.id, { title: '更新タイトル' }, anotherUser))
        .rejects
        .toThrow('この記事を更新する権限がありません');
    });

    it('should throw NotFoundError for non-existent post', async () => {
      await expect(postService.update('550e8400-e29b-41d4-a716-446655440000', { title: 'test' }, user))
        .rejects
        .toThrow('指定された記事が見つかりません');
    });

    it('should update status from draft to published', async () => {
      const updated = await postService.update(post.id, { status: 'published' }, user);

      expect(updated.status).toBe('published');
    });
  });

  describe('delete', () => {
    let post;

    beforeEach(async () => {
      post = await postService.create(testPosts.validPost, user);
    });

    it('should delete post by owner', async () => {
      const result = await postService.delete(post.id, user);

      expect(result.success).toBe(true);

      await expect(postService.getById(post.id, user))
        .rejects
        .toThrow('指定された記事が見つかりません');
    });

    it('should throw ForbiddenError when non-owner tries to delete', async () => {
      await expect(postService.delete(post.id, anotherUser))
        .rejects
        .toThrow('この記事を削除する権限がありません');
    });

    it('should throw NotFoundError for non-existent post', async () => {
      await expect(postService.delete('550e8400-e29b-41d4-a716-446655440000', user))
        .rejects
        .toThrow('指定された記事が見つかりません');
    });
  });
});
