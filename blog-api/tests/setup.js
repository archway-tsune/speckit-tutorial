const { getDatabase, resetDatabase } = require('../src/config/database');
const { migrations } = require('../database/migrate');

beforeAll(() => {
  // Set test environment
  process.env.NODE_ENV = 'test';
});

beforeEach(() => {
  // Reset database for each test
  resetDatabase();

  // Get fresh database connection and run migrations
  const db = getDatabase();
  for (const migration of migrations) {
    migration.up(db);
  }
});

afterAll(() => {
  resetDatabase();
});
