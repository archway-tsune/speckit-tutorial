const Database = require('better-sqlite3');
const path = require('path');
const config = require('./index');

let db = null;

function getDatabase() {
  if (db) {
    return db;
  }

  const dbPath = config.env === 'test'
    ? ':memory:'
    : path.resolve(config.database.url);

  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  return db;
}

function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

function resetDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = {
  getDatabase,
  closeDatabase,
  resetDatabase,
};
