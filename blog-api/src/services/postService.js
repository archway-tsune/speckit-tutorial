const Post = require('../models/Post');
const { NotFoundError, ForbiddenError } = require('../utils/errors');
const { normalizePaginationParams, createPaginationResponse } = require('../utils/pagination');

class PostService {
  async create({ title, content, status = 'draft' }, user) {
    const post = Post.create({
      title,
      content,
      author: user.name,
      authorId: user.id,
      status,
    });

    return post;
  }

  async getById(id, currentUser = null) {
    const post = Post.findById(id);

    if (!post) {
      throw new NotFoundError('指定された記事が見つかりません');
    }

    // If post is draft, only author can view
    if (post.status === 'draft') {
      if (!currentUser || currentUser.id !== post.authorId) {
        throw new NotFoundError('指定された記事が見つかりません');
      }
    }

    return post;
  }

  async getAll({ page, limit, status, sort } = {}, currentUser = null) {
    const pagination = normalizePaginationParams(page, limit);

    // Build query options
    const queryOptions = {
      page: pagination.page,
      limit: pagination.limit,
      sort: sort || '-createdAt',
    };

    let total;

    // If filtering by status
    if (status) {
      // Draft posts are only visible to authenticated authors
      if (status === 'draft') {
        if (!currentUser) {
          // Unauthenticated users can't see drafts
          return {
            data: [],
            pagination: createPaginationResponse(pagination.page, pagination.limit, 0),
          };
        }
        // Only show user's own drafts
        queryOptions.status = 'draft';
        queryOptions.authorId = currentUser.id;
        total = Post.countByAuthorId(currentUser.id, 'draft');
      } else {
        queryOptions.status = 'published';
        total = Post.countByStatus('published');
      }
    } else {
      // No status filter - show only published posts for public
      queryOptions.status = 'published';
      total = Post.countByStatus('published');
    }

    const posts = Post.findAll(queryOptions);

    return {
      data: posts,
      pagination: createPaginationResponse(pagination.page, pagination.limit, total),
    };
  }

  async update(id, updates, user) {
    const post = Post.findById(id);

    if (!post) {
      throw new NotFoundError('指定された記事が見つかりません');
    }

    // Check ownership
    if (post.authorId !== user.id) {
      throw new ForbiddenError('この記事を更新する権限がありません');
    }

    const updatedPost = Post.update(id, updates);
    return updatedPost;
  }

  async delete(id, user) {
    const post = Post.findById(id);

    if (!post) {
      throw new NotFoundError('指定された記事が見つかりません');
    }

    // Check ownership
    if (post.authorId !== user.id) {
      throw new ForbiddenError('この記事を削除する権限がありません');
    }

    Post.delete(id);
    return { success: true };
  }
}

module.exports = new PostService();
