import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';

export interface ResetResult {
  success: boolean;
  error?: string;
  message?: string;
}

/**
 * Completely resets the TravelBuddy database by deleting the file and recreating it
 */
export const resetDatabase = async (): Promise<ResetResult> => {
  try {
    console.log('🔄 Starting complete database reset...');

    // Close any existing connections
    const db = SQLite.openDatabaseSync('travelbuddy.db');
    db.closeSync();

    // Note: Expo SQLite manages the database file internally
    // We can't directly delete the file, so we'll use the in-place reset approach
    console.log('🗑️  Using in-place reset (dropping and recreating tables)...');

    // Use the in-place reset logic instead
    return await resetDatabaseInPlace();

    // Reinitialize the database
    console.log('🏗️  Recreating database tables...');
    await initializeDatabase();

    console.log('✅ Database reset complete!');
    return {
      success: true,
      message: 'Database completely reset and recreated'
    };

  } catch (error) {
    console.error('❌ Error during database reset:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Resets database in place by dropping and recreating all tables
 */
export const resetDatabaseInPlace = async (): Promise<ResetResult> => {
  try {
    console.log('🔄 Starting in-place database reset...');

    const db = SQLite.openDatabaseSync('travelbuddy.db');

    // Drop all tables in reverse order (to handle foreign keys)
    console.log('🗑️  Dropping existing tables...');

    const tables = [
      'sync_logs',
      'planned_visits',
      'note_photos',
      'notes',
      'place_photos',
      'favorites',
      'places',
      'users'
    ];

    for (const table of tables) {
      try {
        db.runSync(`DROP TABLE IF EXISTS ${table}`);
        console.log(`✅ Dropped table: ${table}`);
      } catch (error) {
        console.log(`⚠️  Could not drop table ${table}:`, error);
      }
    }

    // Recreate all tables
    console.log('🏗️  Recreating database tables...');
    await initializeDatabase();

    console.log('✅ In-place database reset complete!');
    return {
      success: true,
      message: 'Database tables dropped and recreated'
    };

  } catch (error) {
    console.error('❌ Error during in-place reset:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Initialize the database with all required tables
 */
const initializeDatabase = async (): Promise<void> => {
  const db = SQLite.openDatabaseSync('travelbuddy.db');

  // Enable foreign keys
  db.execSync('PRAGMA foreign_keys = ON;');

  // Users table
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

  // Places table
  db.execSync(`
    CREATE TABLE IF NOT EXISTS places (
      place_id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      image_url TEXT,
      local_path TEXT,
      synched INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT,
      user_id INTEGER,
      FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE SET NULL ON UPDATE CASCADE
    );
  `);

  // Place Photos table
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

  // Favorites table
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

  // Notes table
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

  // Note Photos table
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

  // Planned Visits table
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

  // Sync Logs table
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

  console.log('✅ All database tables created successfully');
};

/**
 * Get database statistics (for debugging)
 */
export const getDatabaseStats = async (): Promise<any> => {
  try {
    const db = SQLite.openDatabaseSync('travelbuddy.db');

    const tables = ['users', 'places', 'place_photos', 'favorites', 'notes', 'note_photos', 'planned_visits', 'sync_logs'];
    const stats: any = {};

    for (const table of tables) {
      const result = db.getFirstSync(`SELECT COUNT(*) as count FROM ${table}`);
      stats[table] = result.count;
    }

    return stats;
  } catch (error) {
    console.error('Error getting database stats:', error);
    return null;
  }
};
