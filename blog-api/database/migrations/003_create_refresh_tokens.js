function up(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
    CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
    CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
  `);
}

function down(db) {
  db.exec(`
    DROP INDEX IF EXISTS idx_refresh_tokens_user_id;
    DROP INDEX IF EXISTS idx_refresh_tokens_token;
    DROP TABLE IF EXISTS refresh_tokens;
  `);
}

module.exports = { up, down };
