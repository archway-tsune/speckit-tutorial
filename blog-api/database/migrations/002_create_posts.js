function up(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      author TEXT NOT NULL,
      author_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (author_id) REFERENCES users(id)
    );
    CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
    CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
    CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at);
  `);
}

function down(db) {
  db.exec(`
    DROP INDEX IF EXISTS idx_posts_created_at;
    DROP INDEX IF EXISTS idx_posts_status;
    DROP INDEX IF EXISTS idx_posts_author_id;
    DROP TABLE IF EXISTS posts;
  `);
}

module.exports = { up, down };
