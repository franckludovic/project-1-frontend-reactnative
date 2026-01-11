import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { COLORS } from '../constants';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import TravelNoteCard from '../components/TravelNoteCard';
import Header from '../components/Header';

type Note = {
  note_id: number;
  content: string;
  created_at: string;
  latitude: number;
  longitude: number;
  photos: Array<{
    photo_id: number;
    photo_url: string;
    local_path: string | null;
    display_order: number;
  }>;
  place?: {
    title: string;
    location: string;
  };
};

const NotesScreen: React.FC = () => {
  const { user, tokens } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    if (!tokens?.accessToken) return;
    try {
      const response = await api.get('/notes', {
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`
        }
      });
      if (response.data.success) {
        setNotes(response.data.data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header
          centerContent={<Text style={styles.headerTitle}>My Notes</Text>}
        />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header
        centerContent={<Text style={styles.headerTitle}>My Notes</Text>}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {notes.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.icon}>📝</Text>
              <Text style={styles.title}>No Notes Yet</Text>
              <Text style={styles.description}>
                Start exploring places and create your first travel note!
              </Text>
            </View>
          ) : (
            <View style={styles.notesGrid}>
              {notes.map((note) => (
                <TravelNoteCard
                  key={note.note_id}
                  title={note.place?.title || 'Unknown Place'}
                  date={formatDate(note.created_at)}
                  imageUrl={note.photos.length > 0 ? note.photos[0].photo_url : undefined}
                  onPress={() => {
                    // TODO: Navigate to note details
                    Alert.alert('Note', note.content);
                  }}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundLight },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textMain,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.textMain, marginBottom: 8 },
  description: { fontSize: 16, color: COLORS.textMuted, textAlign: 'center', marginBottom: 20 },
  notesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});

export default NotesScreen;
