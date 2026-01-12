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
import { getPlaceById } from '../services/placeApi';
import { getNotesByPlaceId } from '../services/noteApi';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config/config';

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
  const { placeId } = useLocalSearchParams() as { placeId: string };
  const { tokens } = useAuth();
  const [parsedPlace, setParsedPlace] = useState<any>(null);
  const [navigating, setNavigating] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [loadingPlace, setLoadingPlace] = useState(true);

  // Fetch place data on mount
  useEffect(() => {
    const fetchPlace = async () => {
      if (!placeId) {
        setLoadingPlace(false);
        return;
      }

      try {
        const placeData = await getPlaceById(parseInt(placeId), tokens?.accessToken);
        // Transform the place data to match the expected format for components
        const transformedPlace = {
          ...placeData,
          image: { uri: placeData.image_url ? (placeData.image_url.startsWith('http') ? placeData.image_url : `${API_URL}${placeData.image_url}`) : "https://picsum.photos/400" },
        };
        setParsedPlace(transformedPlace);
      } catch (error) {
        console.error('Error fetching place:', error);
        Alert.alert('Error', 'Failed to load place details');
      } finally {
        setLoadingPlace(false);
      }
    };

    fetchPlace();
  }, [placeId, tokens?.accessToken]);

  useEffect(() => {
    if (parsedPlace?.place_id || parsedPlace?.id) {
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

    const placeIdToUse = parsedPlace.place_id || parsedPlace.id;
    console.log('Fetching notes for place_id:', placeIdToUse, 'type:', typeof placeIdToUse);

    try {
      const notesData = await getNotesByPlaceId(placeIdToUse, tokens.accessToken);
      setNotes(notesData);
    } catch (error) {
      console.log('Error loading notes:', error);
      Alert.alert('Error', 'Failed to load notes');
    } finally {
      setLoadingNotes(false); // always stop spinner
    }
  };

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

  const handlePlanVisit = () => {
    // TODO: Implement plan visit functionality
    Alert.alert('Plan Visit', 'This feature is coming soon!');
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
          <ActionButtons place={parsedPlace} onAddNote={handleAddNote} onPlanVisit={handlePlanVisit} />

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
