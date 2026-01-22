# Database Reset Scripts

This directory contains scripts to reset the TravelBuddy database for development and testing purposes.

## Available Scripts

### 1. `reset-database-simple.js` - Recommended

A comprehensive script that properly handles Expo SQLite database reset.

**Features:**
- Deletes the existing database file
- Recreates all tables with proper schema
- Handles foreign key constraints
- Works within Expo/React Native environment

**Usage in your app:**

```javascript
import { resetDatabase, resetDatabaseInPlace } from '../scripts/reset-database-simple';

// Option 1: Complete reset (deletes file and recreates)
const result = await resetDatabase();
if (result.success) {
  console.log('Database reset successful!');
}

// Option 2: Reset in place (keeps file, drops and recreates tables)
const result = await resetDatabaseInPlace();
if (result.success) {
  console.log('Database reset in place successful!');
}
```

**Example: Add to a settings screen or development menu**

```javascript
// In your settings screen
import { resetDatabase } from '../../scripts/reset-database-simple';

const handleResetDatabase = async () => {
  Alert.alert(
    'Reset Database',
    'This will delete all your data. Are you sure?',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: async () => {
          const result = await resetDatabase();
          if (result.success) {
            Alert.alert('Success', 'Database reset complete!');
            // Optionally restart the app or navigate to login
          } else {
            Alert.alert('Error', 'Failed to reset database');
          }
        }
      }
    ]
  );
};
```

### 2. `reset-database.js` - Alternative

A more complex script with multiple approaches. Use this if the simple script doesn't work in your environment.

## Manual Reset (Alternative)

If the scripts don't work in your environment, you can manually reset the database:

### For Expo Development Build:
1. Close the Expo app completely
2. Clear app data/cache from device settings
3. Restart the app (database will be recreated automatically)

### For Simulator/Emulator:
1. Close the simulator/emulator
2. Delete the app from the simulator/emulator
3. Reinstall and run the app

## Database Tables Reset

The scripts will recreate these tables with proper relationships:

- `users` - User accounts
- `places` - Place/location data
- `place_photos` - Additional photos for places
- `favorites` - User favorite places
- `notes` - Travel notes
- `note_photos` - Photos attached to notes
- `planned_visits` - Planned visits to places
- `sync_logs` - Synchronization logs

## Important Notes

- **Data Loss**: These scripts will permanently delete all your data
- **Foreign Keys**: The database uses foreign key constraints for data integrity
- **Sync Status**: All sync flags are reset to 0 (not synced)
- **Testing**: Use these scripts for development testing only

## Troubleshooting

If you encounter issues:

1. Make sure you're running the script from within the Expo/React Native environment
2. Check that you have the necessary permissions to delete files
3. Try the "reset in place" option if file deletion fails
4. Restart your app after running the reset
