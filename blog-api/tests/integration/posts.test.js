const request = require('supertest');
const app = require('../../src/app');
const { testUsers, testPosts } = require('../fixtures/testData');

describe('Posts API', () => {
  let accessToken;
  let anotherUserToken;

  beforeEach(async () => {
    // Register and get token for test user
    const res1 = await request(app)
      .post('/api/v1/auth/register')
      .send(testUsers.validUser);
    accessToken = res1.body.accessToken;

    // Register another user
    const res2 = await request(app)
      .post('/api/v1/auth/register')
      .send(testUsers.anotherUser);
    anotherUserToken = res2.body.accessToken;
  });

  describe('POST /api/v1/posts', () => {
    it('should create a post with authentication', async () => {
      const res = await request(app)
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(testPosts.validPost);

      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.title).toBe(testPosts.validPost.title);
      expect(res.body.status).toBe('draft');
      expect(res.body.author).toBe(testUsers.validUser.name);
    });

    it('should create a published post', async () => {
      const res = await request(app)
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(testPosts.publishedPost);

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('published');
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .post('/api/v1/posts')
        .send(testPosts.validPost);

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 422 for empty title', async () => {
      const res = await request(app)
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(testPosts.invalidPost);

      expect(res.status).toBe(422);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 422 for title exceeding 200 characters', async () => {
      const res = await request(app)
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(testPosts.longTitle);

      expect(res.status).toBe(422);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/v1/posts', () => {
    beforeEach(async () => {
      // Create some posts
      await request(app)
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(testPosts.publishedPost);

      await request(app)
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ ...testPosts.publishedPost, title: 'Published 2' });

      await request(app)
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(testPosts.draftPost);
    });

    it('should return published posts without authentication', async () => {
      const res = await request(app)
        .get('/api/v1/posts');

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.length).toBe(2);
      expect(res.body.data.every(p => p.status === 'published')).toBe(true);
    });

    it('should return pagination info', async () => {
      const res = await request(app)
        .get('/api/v1/posts');

      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.total).toBe(2);
    });

    it('should support pagination parameters', async () => {
      const res = await request(app)
        .get('/api/v1/posts?page=1&limit=1');

      expect(res.body.data.length).toBe(1);
      expect(res.body.pagination.limit).toBe(1);
      expect(res.body.pagination.hasNext).toBe(true);
    });

    it('should filter by status', async () => {
      const res = await request(app)
        .get('/api/v1/posts?status=published');

      expect(res.body.data.every(p => p.status === 'published')).toBe(true);
    });

    it('should return empty for draft filter without auth', async () => {
      const res = await request(app)
        .get('/api/v1/posts?status=draft');

      expect(res.body.data.length).toBe(0);
    });

    it('should return user\'s drafts with auth', async () => {
      const res = await request(app)
        .get('/api/v1/posts?status=draft')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].status).toBe('draft');
    });

    it('should support sorting', async () => {
      const resAsc = await request(app)
        .get('/api/v1/posts?sort=title');

      const resDesc = await request(app)
        .get('/api/v1/posts?sort=-title');

      expect(resAsc.body.data[0].title).not.toBe(resDesc.body.data[0].title);
    });
  });

  describe('GET /api/v1/posts/:id', () => {
    let publishedPost;
    let draftPost;

    beforeEach(async () => {
      const res1 = await request(app)
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(testPosts.publishedPost);
      publishedPost = res1.body;

      const res2 = await request(app)
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(testPosts.draftPost);
      draftPost = res2.body;
    });

    it('should get published post without authentication', async () => {
      const res = await request(app)
        .get(`/api/v1/posts/${publishedPost.id}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(publishedPost.id);
    });

    it('should get draft post with author authentication', async () => {
      const res = await request(app)
        .get(`/api/v1/posts/${draftPost.id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(draftPost.id);
    });

    it('should return 404 for draft without authentication', async () => {
      const res = await request(app)
        .get(`/api/v1/posts/${draftPost.id}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 404 for draft accessed by non-author', async () => {
      const res = await request(app)
        .get(`/api/v1/posts/${draftPost.id}`)
        .set('Authorization', `Bearer ${anotherUserToken}`);

      expect(res.status).toBe(404);
    });

    it('should return 404 for non-existent post', async () => {
      const res = await request(app)
        .get('/api/v1/posts/550e8400-e29b-41d4-a716-446655440000');

      expect(res.status).toBe(404);
    });

    it('should return 422 for invalid UUID', async () => {
      const res = await request(app)
        .get('/api/v1/posts/invalid-id');

      expect(res.status).toBe(422);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('PUT /api/v1/posts/:id', () => {
    let post;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(testPosts.validPost);
      post = res.body;
    });

    it('should update post by owner', async () => {
      const res = await request(app)
        .put(`/api/v1/posts/${post.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: '更新されたタイトル' });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('更新されたタイトル');
    });

    it('should update status to published', async () => {
      const res = await request(app)
        .put(`/api/v1/posts/${post.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ status: 'published' });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('published');
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .put(`/api/v1/posts/${post.id}`)
        .send({ title: '更新' });

      expect(res.status).toBe(401);
    });

    it('should return 403 when non-owner tries to update', async () => {
      const res = await request(app)
        .put(`/api/v1/posts/${post.id}`)
        .set('Authorization', `Bearer ${anotherUserToken}`)
        .send({ title: '更新' });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('should return 404 for non-existent post', async () => {
      const res = await request(app)
        .put('/api/v1/posts/550e8400-e29b-41d4-a716-446655440000')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: '更新' });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/v1/posts/:id', () => {
    let post;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(testPosts.validPost);
      post = res.body;
    });

    it('should delete post by owner', async () => {
      const res = await request(app)
        .delete(`/api/v1/posts/${post.id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(204);

      // Verify post is deleted
      const getRes = await request(app)
        .get(`/api/v1/posts/${post.id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(getRes.status).toBe(404);
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .delete(`/api/v1/posts/${post.id}`);

      expect(res.status).toBe(401);
    });

    it('should return 403 when non-owner tries to delete', async () => {
      const res = await request(app)
        .delete(`/api/v1/posts/${post.id}`)
        .set('Authorization', `Bearer ${anotherUserToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('should return 404 for non-existent post', async () => {
      const res = await request(app)
        .delete('/api/v1/posts/550e8400-e29b-41d4-a716-446655440000')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(404);
    });
  });
});
