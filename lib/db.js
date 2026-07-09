const { createClient } = require('@libsql/client');

const TURSO_URL = process.env.TURSO_URL;
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;

let client;

function getDb() {
  if (!client) {
    if (TURSO_URL && TURSO_AUTH_TOKEN) {
      // Production: Turso (cloud SQLite)
      client = createClient({ url: TURSO_URL, authToken: TURSO_AUTH_TOKEN });
    } else {
      // Local dev: local SQLite file via Turso's local mode
      client = createClient({ url: 'file:local.db' });
    }
  }
  return client;
}

async function initDb() {
  const db = getDb();
  await db.execute(`
    CREATE TABLE IF NOT EXISTS deliveries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      driver_id INTEGER NOT NULL,
      driver_name TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'delivery',
      branch_id INTEGER NOT NULL,
      branch_name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      driver_lat REAL,
      driver_lng REAL,
      distance REAL,
      created_at TEXT NOT NULL,
      confirmed_at TEXT,
      confirmed_by_id INTEGER,
      confirmed_by_name TEXT,
      reject_reason TEXT
    )
  `);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS managers (
      chat_id INTEGER PRIMARY KEY,
      username TEXT,
      first_name TEXT,
      branch_id INTEGER
    )
  `);
}

module.exports = { getDb, initDb };
