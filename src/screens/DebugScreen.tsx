import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { resetDatabase, resetDatabaseInPlace, getDatabaseStats } from '../utils/databaseReset';

const DebugScreen: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);

  const handleResetDatabase = async () => {
    Alert.alert(
      '⚠️ Reset Database',
      'This will permanently delete ALL your data (places, notes, photos, favorites, etc.). This action cannot be undone.\n\nAre you absolutely sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'DELETE EVERYTHING',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              const result = await resetDatabase();
              if (result.success) {
                Alert.alert('✅ Success', result.message || 'Database reset complete!');
                // Optionally navigate to login or restart app
                router.replace('/login');
              } else {
                Alert.alert('❌ Error', result.error || 'Failed to reset database');
              }
            } catch (error) {
              Alert.alert('❌ Error', 'An unexpected error occurred');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleResetInPlace = async () => {
    Alert.alert(
      '🔄 Reset Database (In Place)',
      'This will delete all data but keep the database file. Tables will be dropped and recreated.\n\nAre you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Data',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              const result = await resetDatabaseInPlace();
              if (result.success) {
                Alert.alert('✅ Success', result.message || 'Database reset complete!');
                // Refresh stats
                await loadStats();
              } else {
                Alert.alert('❌ Error', result.error || 'Failed to reset database');
              }
            } catch (error) {
              Alert.alert('❌ Error', 'An unexpected error occurred');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const loadStats = async () => {
    try {
      const dbStats = await getDatabaseStats();
      setStats(dbStats);
    } catch (error) {
      console.error('Error loading stats:', error);
      Alert.alert('Error', 'Failed to load database statistics');
    }
  };

  React.useEffect(() => {
    loadStats();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Debug Tools</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.warning}>
          ⚠️ These tools are for development only. Use with caution!
        </Text>

        {/* Database Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Database Statistics</Text>
          {stats ? (
            <View style={styles.statsContainer}>
              {Object.entries(stats).map(([table, count]) => (
                <View key={table} style={styles.statRow}>
                  <Text style={styles.statLabel}>{table}:</Text>
                  <Text style={styles.statValue}>{count as number}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.loadingText}>Loading statistics...</Text>
          )}

          <TouchableOpacity
            style={styles.refreshButton}
            onPress={loadStats}
          >
            <Icon name="refresh" size={20} color="#007AFF" />
            <Text style={styles.refreshText}>Refresh Stats</Text>
          </TouchableOpacity>
        </View>

        {/* Database Reset Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🗑️ Database Reset</Text>
          <Text style={styles.sectionDescription}>
            These operations will permanently delete data. Make sure you have backups if needed.
          </Text>

          <TouchableOpacity
            style={[styles.resetButton, styles.resetButtonDanger]}
            onPress={handleResetDatabase}
            disabled={isLoading}
          >
            <Icon name="delete-forever" size={20} color="white" />
            <Text style={styles.resetButtonText}>
              {isLoading ? 'Resetting...' : 'Complete Reset (Delete File)'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.resetButton, styles.resetButtonWarning]}
            onPress={handleResetInPlace}
            disabled={isLoading}
          >
            <Icon name="refresh" size={20} color="white" />
            <Text style={styles.resetButtonText}>
              {isLoading ? 'Resetting...' : 'Reset Data (Keep File)'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ Information</Text>
          <Text style={styles.infoText}>
            • Complete Reset: Deletes the entire database file and recreates it{'\n'}
            • Reset Data: Keeps the file but drops and recreates all tables{'\n'}
            • Statistics: Shows current record counts in each table{'\n'}
            • This screen is for development/testing only
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  warning: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffeaa7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  statsContainer: {
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statLabel: {
    fontSize: 14,
    color: '#333',
    textTransform: 'capitalize',
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingVertical: 20,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    alignSelf: 'center',
  },
  refreshText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 8,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 12,
  },
  resetButtonDanger: {
    backgroundColor: '#dc3545',
  },
  resetButtonWarning: {
    backgroundColor: '#ffc107',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default DebugScreen;
