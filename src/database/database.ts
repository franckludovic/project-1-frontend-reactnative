import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("travelbuddy.db");

// Enable foreign keys globally
db.execSync("PRAGMA foreign_keys = ON;");
console.log("Foreign keys enabled");

export const initDb = () => {
  // Users
  db.execSync(`
    CREATE TABLE IF NOT EXISTS users (
      user_id INTEGER PRIMARY KEY AUTOINCREMENT,
      firebase_uid TEXT,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      role TEXT DEFAULT 'user',
      password_hash TEXT,
      created_at TEXT,
      updated_at TEXT
    );
  `);

  // Places - Drop and recreate if schema changed
  try {
    // Check if old columns exist and drop table if they do
    const tableInfo = db.getAllSync("PRAGMA table_info(places)");
    const hasImageUrl = tableInfo.some((col: any) => col.name === 'image_url');
    const hasLocalPath = tableInfo.some((col: any) => col.name === 'local_path');

    if (hasImageUrl || hasLocalPath) {
      console.log("Dropping places table due to schema change...");
      db.execSync("DROP TABLE IF EXISTS places");
    }
  } catch (error) {
    // Table doesn't exist yet, which is fine
  }

  db.execSync(`
    CREATE TABLE IF NOT EXISTS places (
      place_id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      synched INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT,
      user_id INTEGER,
      FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE SET NULL ON UPDATE CASCADE
    );
  `);

  // Place Photos
  db.execSync(`
    CREATE TABLE IF NOT EXISTS place_photos (
      photo_id INTEGER PRIMARY KEY AUTOINCREMENT,
      place_id INTEGER NOT NULL,
      photo_url TEXT,
      local_path TEXT,
      display_order INTEGER DEFAULT 0,
      synched INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(place_id) REFERENCES places(place_id) ON DELETE CASCADE ON UPDATE CASCADE
    );
  `);

  // Favorites
  db.execSync(`
    CREATE TABLE IF NOT EXISTS favorites (
      fav_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      place_id INTEGER NOT NULL,
      synched INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
      FOREIGN KEY(place_id) REFERENCES places(place_id) ON DELETE CASCADE ON UPDATE CASCADE
    );
  `);

  // Notes
  db.execSync(`
    CREATE TABLE IF NOT EXISTS notes (
      note_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      place_id INTEGER NOT NULL,
      title TEXT,
      content TEXT,
      latitude REAL,
      longitude REAL,
      synched INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT,
      FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
      FOREIGN KEY(place_id) REFERENCES places(place_id) ON DELETE CASCADE ON UPDATE CASCADE
    );
  `);

  // Note Photos
  db.execSync(`
    CREATE TABLE IF NOT EXISTS note_photos (
      photo_id INTEGER PRIMARY KEY AUTOINCREMENT,
      note_id INTEGER NOT NULL,
      photo_url TEXT NOT NULL,
      local_path TEXT,
      display_order INTEGER DEFAULT 0,
      synched INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(note_id) REFERENCES notes(note_id) ON DELETE CASCADE ON UPDATE CASCADE
    );
  `);

  // Planned Visits
  db.execSync(`
    CREATE TABLE IF NOT EXISTS planned_visits (
      planned_visit_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      place_id INTEGER NOT NULL,
      planned_date TEXT,
      synched INTEGER DEFAULT 0,
      is_completed INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT,
      FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
      FOREIGN KEY(place_id) REFERENCES places(place_id) ON DELETE CASCADE ON UPDATE CASCADE
    );
  `);

  // Sync Logs
  db.execSync(`
    CREATE TABLE IF NOT EXISTS sync_logs (
      sync_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      last_sync_time TEXT DEFAULT (datetime('now')),
      status TEXT DEFAULT 'success',
      message TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE
    );
  `);
};

export default db;
