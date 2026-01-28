const { v4: uuidv4 } = require('uuid');
const { getDatabase } = require('../config/database');

class User {
  static create({ email, passwordHash, name }) {
    const db = getDatabase();
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO users (id, email, password_hash, name, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, email, passwordHash, name, now, now);

    return {
      id,
      email,
      name,
      createdAt: now,
      updatedAt: now,
    };
  }

  static findByEmail(email) {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT id, email, password_hash as passwordHash, name, created_at as createdAt, updated_at as updatedAt
      FROM users
      WHERE email = ?
    `);

    return stmt.get(email) || null;
  }

  static findById(id) {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT id, email, password_hash as passwordHash, name, created_at as createdAt, updated_at as updatedAt
      FROM users
      WHERE id = ?
    `);

    return stmt.get(id) || null;
  }
}

module.exports = User;
