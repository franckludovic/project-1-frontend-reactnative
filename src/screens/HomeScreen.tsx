import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../constants';
import WelcomeHeader from '../components/WelcomeHeader';
import SyncStatus from '../components/SyncStatus';
import TravelNoteCard from '../components/TravelNoteCard';
import FavoritePlaceCard from '../components/FavoritePlaceCard';
import NearbyAttractionsCarousel from '../components/NearbyAttractionsCarousel';
import { Ionicons } from '@expo/vector-icons';

const localAvatar = require('../../src/assets/images/image 1.jpg');

type TravelNote = {
  id: string;
  title: string;
  date: string;
  imageUrl: string;
};

type FavoritePlace = {
  id: string;
  title: string;
  location: string;
  rating: number;
  imageUrl: string;
  savedDate: string;
};

type Stats = {
  posts: number;
  planned: number;
  saved: number;
  synced: string;
};

type Props = {
  userName?: string;
  avatarUrl?: string;
  onLogout?: () => void;
  onAddPlace?: () => void;
  stats?: Stats;
};

const AuthenticatedHomeScreen: React.FC<Props> = ({ userName = 'Traveler', avatarUrl, onLogout, onAddPlace, stats }) => {
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

  const renderStats = () => {
    if (!stats) return null;

    return (
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          {/* Card 1: Posts */}
          <View style={styles.statsCard}>
            <View style={[styles.statsIconFrame, { backgroundColor: '#FFECE8' }]}>
              <Ionicons name="document-text-outline" size={18} color="#FF5A36" />
            </View>
            <Text style={styles.statsValue}>{stats.posts}</Text>
            <Text style={styles.statsLabel}>Total Posts</Text>
          </View>

          {/* Card 2: Planned Trips */}
          <View style={styles.statsCard}>
            <View style={[styles.statsIconFrame, { backgroundColor: '#EEF2FF' }]}>
              <Ionicons name="calendar-outline" size={18} color="#4F46E5" />
            </View>
            <Text style={styles.statsValue}>{stats.planned}</Text>
            <Text style={styles.statsLabel}>Planned Trips</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          {/* Card 3: Saved Posts */}
          <View style={styles.statsCard}>
            <View style={[styles.statsIconFrame, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="bookmark-outline" size={18} color="#10B981" />
            </View>
            <Text style={styles.statsValue}>{stats.saved}</Text>
            <Text style={styles.statsLabel}>Saved Posts</Text>
          </View>

          {/* Card 4: Synced Status */}
          <View style={styles.statsCard}>
            <View style={[styles.statsIconFrame, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="cloud-done-outline" size={18} color="#F59E0B" />
            </View>
            <Text style={styles.statsValue}>{stats.synced}</Text>
            <Text style={styles.statsLabel}>Synced Posts</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
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

        {/* Stats Grid */}
        {renderStats()}

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

        {/* Nearby Attractions Carousel Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nearby attractions</Text>
          </View>
          <NearbyAttractionsCarousel />
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
  scrollContent: {
    paddingBottom: 110, // Added padding so screen contents scroll cleanly beneath the absolute tab bar overlay
  },
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
    bottom: 100, // Shifted up so it stays clear of the custom bottom tab bar
    right: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  statsContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statsCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  statsIconFrame: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statsValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textMain,
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  statsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
});

export default AuthenticatedHomeScreen;
