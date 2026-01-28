const { v4: uuidv4 } = require('uuid');
const { getDatabase } = require('../config/database');

class Post {
  static create({ title, content, author, authorId, status = 'draft' }) {
    const db = getDatabase();
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO posts (id, title, content, author, author_id, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, title, content, author, authorId, status, now, now);

    return {
      id,
      title,
      content,
      author,
      authorId,
      status,
      createdAt: now,
      updatedAt: now,
    };
  }

  static findById(id) {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT id, title, content, author, author_id as authorId, status, created_at as createdAt, updated_at as updatedAt
      FROM posts
      WHERE id = ?
    `);

    return stmt.get(id) || null;
  }

  static findAll({ page = 1, limit = 10, status, sort = '-createdAt', authorId } = {}) {
    const db = getDatabase();
    const offset = (page - 1) * limit;

    let whereClause = '1=1';
    const params = [];

    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }

    if (authorId) {
      whereClause += ' AND author_id = ?';
      params.push(authorId);
    }

    // Parse sort parameter
    const sortOrder = sort.startsWith('-') ? 'DESC' : 'ASC';
    let sortField = sort.replace('-', '');

    // Map camelCase to snake_case
    const fieldMap = {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      title: 'title',
    };

    sortField = fieldMap[sortField] || 'created_at';

    const query = `
      SELECT id, title, content, author, author_id as authorId, status, created_at as createdAt, updated_at as updatedAt
      FROM posts
      WHERE ${whereClause}
      ORDER BY ${sortField} ${sortOrder}
      LIMIT ? OFFSET ?
    `;

    params.push(limit, offset);
    const stmt = db.prepare(query);

    return stmt.all(...params);
  }

  static countByStatus(status = null) {
    const db = getDatabase();

    let query = 'SELECT COUNT(*) as count FROM posts';
    const params = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    const stmt = db.prepare(query);
    const result = stmt.get(...params);

    return result.count;
  }

  static countByAuthorId(authorId, status = null) {
    const db = getDatabase();

    let query = 'SELECT COUNT(*) as count FROM posts WHERE author_id = ?';
    const params = [authorId];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    const stmt = db.prepare(query);
    const result = stmt.get(...params);

    return result.count;
  }

  static update(id, updates) {
    const db = getDatabase();
    const now = new Date().toISOString();

    const allowedFields = ['title', 'content', 'status'];
    const setClauses = [];
    const params = [];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        setClauses.push(`${field} = ?`);
        params.push(updates[field]);
      }
    }

    if (setClauses.length === 0) {
      return this.findById(id);
    }

    setClauses.push('updated_at = ?');
    params.push(now);
    params.push(id);

    const query = `
      UPDATE posts
      SET ${setClauses.join(', ')}
      WHERE id = ?
    `;

    const stmt = db.prepare(query);
    stmt.run(...params);

    return this.findById(id);
  }

  static delete(id) {
    const db = getDatabase();
    const stmt = db.prepare('DELETE FROM posts WHERE id = ?');
    const result = stmt.run(id);

    return result.changes > 0;
  }
}

module.exports = Post;
