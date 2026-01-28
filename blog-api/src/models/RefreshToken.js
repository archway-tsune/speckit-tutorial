const { v4: uuidv4 } = require('uuid');
const { getDatabase } = require('../config/database');

class RefreshToken {
  static create({ userId, token, expiresAt }) {
    const db = getDatabase();
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO refresh_tokens (id, user_id, token, expires_at, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(id, userId, token, expiresAt, now);

    return {
      id,
      userId,
      token,
      expiresAt,
      createdAt: now,
    };
  }

  static findByToken(token) {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT id, user_id as userId, token, expires_at as expiresAt, created_at as createdAt
      FROM refresh_tokens
      WHERE token = ?
    `);

    return stmt.get(token) || null;
  }

  static deleteByToken(token) {
    const db = getDatabase();
    const stmt = db.prepare(`
      DELETE FROM refresh_tokens
      WHERE token = ?
    `);

    const result = stmt.run(token);
    return result.changes > 0;
  }

  static deleteByUserId(userId) {
    const db = getDatabase();
    const stmt = db.prepare(`
      DELETE FROM refresh_tokens
      WHERE user_id = ?
    `);

    const result = stmt.run(userId);
    return result.changes;
  }
}

module.exports = RefreshToken;
