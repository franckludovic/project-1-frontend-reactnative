import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

// Components
import Header from '../components/Header';
import ImageCarousel from '../components/noteDetails/ImageCarousel';
import TitleSection from '../components/noteDetails/TitleSection';
import MetadataChips from '../components/noteDetails/MetadataChips';
import ContentSection from '../components/noteDetails/ContentSection';
import Button from '../components/Button';

type Note = {
  note_id: number;
  title: string | undefined;
  content: string;
  created_at: string;
  latitude: number;
  longitude: number;
  photos?: Array<{
    photo_id: number;
    photo_url: string;
    local_path: string | null;
    display_order: number;
  }>;
};

const NoteDetailsScreen: React.FC = () => {
  const { user, tokens } = useAuth();
  const { noteId } = useLocalSearchParams<{ noteId: string }>();

  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!noteId) {
      Alert.alert('Error', 'No note ID provided');
      router.back();
      return;
    }

    fetchNoteDetails();
  }, [noteId]);

  const fetchNoteDetails = async () => {
    try {
      setLoading(true);
      console.log('Fetching note details for noteId:', noteId);
      console.log('Access token present:', !!tokens?.accessToken);

      const response = await api.get(`/notes/${noteId}`, {
        headers: {
          Authorization: `Bearer ${tokens?.accessToken}`,
        },
      });

      console.log('API response:', response);

      if (response.success) {
        console.log('✅ Note data received:', response.data);
        setNote(response.data);
      } else {
        console.log('❌ API returned success: false, message:', response.message);
        Alert.alert('Error', 'Failed to load note details');
        router.back();
      }
    } catch (error) {
      console.error('Error fetching note details:', error);
      console.error('Error details:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to load note details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleEditNote = () => {
    // TODO: Navigate to edit note screen
    Alert.alert('Edit Note', 'Edit functionality coming soon!');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading note details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!note) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text>Note not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f7f6" />

      {/* Header */}
      <Header
        leftContent={
          <TouchableOpacity onPress={() => router.back()}>
            <Icon name="arrow_back" size={24} color="#0f172a" />
          </TouchableOpacity>
        }
        rightContent={
          <TouchableOpacity onPress={() => Alert.alert('More Options', 'Options coming soon!')}>
            <Icon name="more_vert" size={24} color="#0f172a" />
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Image Carousel */}
        <ImageCarousel photos={note.photos || []} />

        {/* Title Section */}
        <TitleSection title={note.title || 'Untitled Note'} />

        {/* Metadata Chips */}
        <MetadataChips
          location="Kyoto, Japan" // TODO: Get from place data
          date={formatDate(note.created_at)}
        />

        {/* Content Section */}
        <ContentSection content={note.content} />

        {/* Edit Button */}
        <View style={styles.editButtonContainer}>
          <TouchableOpacity style={styles.editButton} onPress={handleEditNote}>
            <Icon name="edit_note" size={20} color="#0f172a" />
            <Text style={styles.editButtonText}>Edit Note</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f7f6',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButtonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    marginTop: 16,
  },
  editButton: {
    height: 48,
    backgroundColor: '#f1f5f9', // bg-slate-100
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a', // text-slate-900
  },
});

export default NoteDetailsScreen;
