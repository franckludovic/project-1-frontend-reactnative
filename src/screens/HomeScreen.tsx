import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../constants';
import WelcomeHeader from '../components/WelcomeHeader';
import SyncStatus from '../components/SyncStatus';
import TravelNoteCard from '../components/TravelNoteCard';
import AttractionCard from '../components/AttractionCard';
import FavoritePlaceCard from '../components/FavoritePlaceCard';
import { Ionicons } from '@expo/vector-icons';

const localAvatar = require('../../src/assets/images/image 1.jpg');

type TravelNote = {
  id: string;
  title: string;
  date: string;
  imageUrl: string;
};

type Attraction = {
  id: string;
  title: string;
  description: string;
  distance: string;
  icon: string;
};

type FavoritePlace = {
  id: string;
  title: string;
  location: string;
  rating: number;
  imageUrl: string;
  savedDate: string;
};

type Props = {
  userName?: string;
  avatarUrl?: string;
  onLogout?: () => void;
  onAddPlace?: () => void;
};

const AuthenticatedHomeScreen: React.FC<Props> = ({ userName = 'Traveler', avatarUrl, onLogout, onAddPlace }) => {
  const router = useRouter();

  // Mock data (use local images from assets/images)
  const travelNotes: TravelNote[] = [
    {
      id: '1',
      title: 'Kyoto Autumn',
      date: 'Oct 12, 2023',
      imageUrl: '',
    },
    {
      id: '2',
      title: 'Hiking the Alps',
      date: 'Sept 05, 2023',
      imageUrl: '',
    },
  ];

  const attractions: Attraction[] = [
    {
      id: '1',
      title: 'Hidden Waterfall',
      description: 'A secret spot near the trail entrance.',
      distance: '0.5KM',
      icon: '🧭',
    },
  ];

  const favoritePlaces: FavoritePlace[] = [
    {
      id: '1',
      title: "Joe's Coffee",
      location: 'Seattle, WA',
      rating: 4.8,
      imageUrl: '',
      savedDate: '2 days ago',
    },
    {
      id: '2',
      title: 'Louvre Museum',
      location: 'Paris, France',
      rating: 5.0,
      imageUrl: '',
      savedDate: '1 year ago',
    },
    {
      id: '3',
      title: 'Taj Mahal',
      location: 'Agra, India',
      rating: 4.9,
      imageUrl: '',
      savedDate: '2 years ago',
    },
  ];

  const handleViewAllNotes = () => {
    router.push('/notes');
  };

  const handleDebugScreen = () => {
    router.push('/debug');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Welcome Header */}
        <WelcomeHeader userName={userName} avatar={localAvatar} avatarUrl={avatarUrl} />

        {/* Sync Status */}
        <SyncStatus />

        {/* Action Widgets */}
        <View style={styles.topActionsContainer}>
          <TouchableOpacity
            style={styles.debugPill}
            onPress={handleDebugScreen}
            activeOpacity={0.8}
          >
            <Ionicons name="construct-outline" size={14} color={COLORS.textMuted} style={styles.debugIcon} />
            <Text style={styles.debugText}>Developer Debug</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Travel Notes Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent travel notes</Text>
            <TouchableOpacity onPress={handleViewAllNotes} activeOpacity={0.7}>
              <Text style={styles.viewAllLink}>View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {travelNotes.map((note, idx) => (
              <TravelNoteCard
                key={note.id}
                title={note.title}
                date={note.date}
                imageSource={
                  idx === 0
                    ? require('../../src/assets/images/image 3.jpg')
                    : require('../../src/assets/images/image 4.jpg')
                }
                onPress={() => router.push(`/note/${note.id}`)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Nearby Attractions Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nearby attractions</Text>
          </View>
          {attractions.map((attraction) => (
            <AttractionCard key={attraction.id} {...attraction} />
          ))}
        </View>

        {/* Favorite Places Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Favorite places</Text>
          </View>
          {favoritePlaces.map((place, idx) => (
            <FavoritePlaceCard
              key={place.id}
              title={place.title}
              location={place.location}
              rating={place.rating}
              savedDate={place.savedDate}
              imageSource={
                idx === 0
                  ? require('../../src/assets/images/image 5.jpg')
                  : require('../../src/assets/images/image 3.jpg')
              }
              onPress={() => router.push(`/place/${place.id}`)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Add Place Floating Action Button */}
      {onAddPlace && (
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={onAddPlace}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={30} color="#fff" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  section: { 
    marginBottom: 28,
  },
  topActionsContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  debugPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9', // slate-100
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
  },
  debugIcon: {
    marginRight: 6,
  },
  debugText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '700',
  },
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 24, 
    marginBottom: 14 
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: '800', 
    color: COLORS.textMain,
    letterSpacing: -0.4,
  },
  viewAllLink: { 
    fontSize: 13, 
    color: COLORS.primary, 
    fontWeight: '800' 
  },
  horizontalScroll: { 
    paddingLeft: 24,
    paddingRight: 10,
  },
  floatingButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 24,
    right: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
});

export default AuthenticatedHomeScreen;
