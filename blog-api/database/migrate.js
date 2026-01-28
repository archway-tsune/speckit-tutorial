const path = require('path');
const { getDatabase, closeDatabase } = require('../src/config/database');

const migrations = [
  require('./migrations/001_create_users'),
  require('./migrations/002_create_posts'),
  require('./migrations/003_create_refresh_tokens'),
];

function runMigrations() {
  const db = getDatabase();

  console.log('Running migrations...');

  try {
    for (let i = 0; i < migrations.length; i++) {
      console.log(`  Running migration ${i + 1}...`);
      migrations[i].up(db);
    }
    console.log('All migrations completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  } finally {
    closeDatabase();
  }
}

if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations, migrations };
