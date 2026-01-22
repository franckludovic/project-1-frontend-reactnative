import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { COLORS } from '../constants';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { getNotesByUserId } from '../services/noteService';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import FilterChips from '../components/notepage/FilterChips';
import NotesList from '../components/notepage/NotesList';

type Tag = {
  label: string;
  color: string;
};

type Note = {
  id: number;
  title: string;
  content: string;
  location: string;
  date: string;
  imageUrl?: string;
  tags: Tag[];
  attachmentsCount: number;
  synched: boolean;
};

type FilterType = 'all' | 'synched' | 'unsynched';

const NotesScreen: React.FC = () => {
  const { user, tokens, authMode } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    filterNotes();
  }, [notes, searchQuery, selectedFilter]);

  const getLocationName = async (latitude: number, longitude: number): Promise<string> => {
    try {
      const geocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      if (geocode.length > 0) {
        const address = geocode[0];
        const locationString = [
          address.city,
          address.country,
        ]
          .filter(Boolean)
          .join(', ');
        return locationString || 'Unknown location';
      } else {
        return 'Unknown location';
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return 'Unknown location';
    }
  };

  const fetchNotes = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      let notesData = [];

      if (authMode === 'offline') {
        // Use local service for offline mode
        const userId = typeof user === 'object' ? (user.user_id || user.id) : user;
        if (!userId) {
          setLoading(false);
          return;
        }
        notesData = await getNotesByUserId(Number(userId));
      } else {
        // Use API service for online mode
        if (!tokens?.accessToken) {
          setLoading(false);
          return;
        }

        const response = await api.get('/notes', {
          headers: {
            'Authorization': `Bearer ${tokens.accessToken}`
          }
        });

        if (response.data.success && response.data.data) {
          notesData = response.data.data;
        } else if (Array.isArray(response.data)) {
          notesData = response.data;
        }
      }

      // Transform data to component format
      const transformedNotes: Note[] = await Promise.all(notesData.map(async (note: any) => {
        const locationName = await getLocationName(note.latitude, note.longitude);
        return {
          id: note.note_id,
          title: note.place?.title || 'Unknown Place',
          content: note.content,
          location: locationName,
          date: new Date(note.created_at).toLocaleDateString(),
          imageUrl: note.photos?.length > 0 ? note.photos[0].photo_url : undefined,
          tags: generateTags(note),
          attachmentsCount: note.photos?.length || 0,
          synched: note.synched === 1,
        };
      }));
      setNotes(transformedNotes);
    } catch (error) {
      console.error('Failed to load notes', error);
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

  const generateTags = (note: any): Tag[] => {
    const tags: Tag[] = [];
    if (note.place?.title) {
      tags.push({ label: `#${note.place.title}`, color: '#FFA500' }); // Orange
    }
    // Add more tags based on data
    return tags;
  };

  const filterNotes = () => {
    let filtered = notes;

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply filter
    switch (selectedFilter) {
      case 'synched':
        filtered = filtered.filter(note => note.synched);
        break;
      case 'unsynched':
        filtered = filtered.filter(note => !note.synched);
        break;
      default:
        break;
    }

    setFilteredNotes(filtered);
  };

  const handleNotePress = (note: Note) => {
    router.push({
      pathname: "/note/[noteId]",
      params: { noteId: note.id.toString() },
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotes();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header centerContent={<Text style={styles.headerTitle}>My Notes</Text>} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.orange} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header centerContent={<Text style={styles.headerTitle}>Your Travel Notes</Text>} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <FilterChips
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
        />
        <NotesList
          notes={filteredNotes}
          onNotePress={handleNotePress}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textMain,
  },
  scrollView: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default NotesScreen;
