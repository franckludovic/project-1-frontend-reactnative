import { useMemo, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

// Components
import HeroSection from '../components/detailsPage/HeroSection';
import SheetHeader from '../components/detailsPage/SheetHeader';
import ActionButtons from '../components/detailsPage/ActionButtons';
import AboutSection from '../components/detailsPage/AboutSection';
import NotesSection from '../components/detailsPage/NotesSection';
import CommunityTipsSection from '../components/detailsPage/CommunityTipsSection';

// Colors extracted from the HTML Tailwind Config
const COLORS = {
  primary: '#fb923c',
  primaryDark: '#ea580c',
  backgroundLight: '#fafaf9',
  surfaceLight: '#ffffff',
  surfaceDark: '#292524',
  stone900: '#1c1917',
  stone600: '#57534e',
  stone400: '#a8a29e',
  stone200: '#e7e5e4',
  amber50: '#fffbeb',
  amber100: '#fef3c7',
  amber600: '#d97706',
  emerald50: '#ecfdf5',
  emerald100: '#d1fae5',
  emerald500: '#10b981',
  emerald600: '#059669',
  emerald700: '#047857',
};

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight,
    backgroundColor: COLORS.backgroundLight,
  },
  sheetContainer: {
    flex: 1,
    marginTop: -50,
    backgroundColor: COLORS.backgroundLight,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  navigatingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  navigatingText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

const PlaceDetailsScreen = () => {
  const { placeId } = useLocalSearchParams() as { placeId: any };
  const { tokens } = useAuth();
  const parsedPlace = useMemo(() => {
    return placeId ? JSON.parse(placeId) : null;
  }, [placeId]);
  const [navigating, setNavigating] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(true);

  useEffect(() => {
    if (parsedPlace?.id) {
      fetchNotes();
    }
  }, [parsedPlace]);

  const fetchNotes = async () => {
    // If no token, don't even try — and don't show loading spinner
    if (!tokens?.accessToken) {
      setLoadingNotes(false);
      return;
    }

    setLoadingNotes(true); // start spinner only when we attempt a fetch

    console.log('Fetching notes for place_id:', parsedPlace.id, 'type:', typeof parsedPlace.id);

    try {
      // Add a timeout guard
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out')), 10000)
      );

      const response = await Promise.race([
        api.get(`/notes?place_id=${parsedPlace.id}`, {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        }),
        timeoutPromise,
      ]);

      console.log('Notes response:', response);

      if (response.success) {
        setNotes(response.data);
      } else {
        Alert.alert('Error', 'Failed to load notes');
      }
    } catch (error) {
      console.log('Error loading notes:', error);
      if (error instanceof Error && error.message === 'Request timed out') {
        Alert.alert('Timeout', 'Failed to load notes: Request timed out');
      } else {
        Alert.alert('Error', 'Failed to load notes');
      }
    } finally {
      setLoadingNotes(false); // always stop spinner
    }
  };

  useEffect(() => {
    console.log('parsedPlace:', parsedPlace);
    if (parsedPlace?.id) {
      fetchNotes();
    } else {
      console.warn('No valid place_id found');
      setLoadingNotes(false);
    }
  }, [parsedPlace]);

  // Reset navigating state when screen comes back into focus
  useFocusEffect(
    useCallback(() => {
      setNavigating(false);
    }, [])
  );

  const handleAddNote = () => {
    setNavigating(true);
    router.push({
      pathname: '/AddNote',
      params: {
        place: JSON.stringify(parsedPlace),
      },
    });
  };

  if (!parsedPlace) {
    return <Text>Place not found</Text>;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent />

      {/* --- HERO SECTION --- */}
      <HeroSection place={parsedPlace} />

      {/* --- MAIN CONTENT SHEET --- */}
      <View style={styles.sheetContainer}>
        {/* Drag Handle & Online Status */}
        <SheetHeader place={parsedPlace} />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* --- ACTION BUTTONS --- */}
          <ActionButtons place={parsedPlace} onAddNote={handleAddNote} />

          {/* --- ABOUT SECTION --- */}
          <AboutSection place={parsedPlace} />

          {/* --- NOTES SECTION --- */}
          <NotesSection
            notes={notes}
            loadingNotes={loadingNotes}
            onAddNote={handleAddNote}
          />

          {/* --- COMMUNITY TIPS --- */}
          <CommunityTipsSection />

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>

      {/* Navigating Overlay */}
      {navigating && (
        <View style={styles.navigatingOverlay}>
          <Text style={styles.navigatingText}>Navigating...</Text>
        </View>
      )}
    </View>
  );
};

export default PlaceDetailsScreen;
