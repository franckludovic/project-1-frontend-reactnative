import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../constants';
import WelcomeHeader from '../components/WelcomeHeader';
import SyncStatus from '../components/SyncStatus';
import TravelNoteCard from '../components/TravelNoteCard';
import AttractionCard from '../components/AttractionCard';
import FavoritePlaceCard from '../components/FavoritePlaceCard';
// require local assets at module top-level so Metro can discover them reliably
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
      savedDate: 'Saved 2 days ago',
    },
    {
      id: '2',
      title: 'Louvre Museum',
      location: 'Paris, France',
      rating: 5.0,
      imageUrl: '',
      savedDate: 'Saved 1 year ago',
    },
    {
      id: '3',
      title: 'Taj Mahal',
      location: 'Agra, India',
      rating: 4.9,
      imageUrl: '',
      savedDate: 'Saved 2 years ago',
    },
  ];

  const handleViewAllNotes = () => {
    console.log('Navigate to all travel notes');
  };

  const handleSettings = () => {
    console.log('Navigate to settings');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Welcome Header */}
        <WelcomeHeader userName={userName} avatar={localAvatar} avatarUrl={avatarUrl} />

        {/* Sync Status */}
        <SyncStatus icon="✓" label="ALL MEMORIES SYNCED" />

        {/* Recent Travel Notes Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent travel notes</Text>
            <TouchableOpacity onPress={handleViewAllNotes}>
              <Text style={styles.viewAllLink}>View All</Text>
            </TouchableOpacity>
          </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
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
              />
            ))}
          </ScrollView>
        </View>

        {/* Nearby Attractions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nearby attractions</Text>
          {attractions.map((attraction) => (
            <AttractionCard key={attraction.id} {...attraction} />
          ))}
        </View>

        {/* Favorite Places Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Favorite places</Text>
            <TouchableOpacity onPress={handleSettings}>
              <Text style={styles.optionsIcon}>⋯</Text>
            </TouchableOpacity>
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
            />
          ))}
        </View>

      {/* Add Place Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={onAddPlace}
        activeOpacity={0.8}
      >
        <Text style={styles.floatingButtonText}>+</Text>
      </TouchableOpacity>
    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  section: { marginBottom: 24, marginTop: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0A0A0A' },
  viewAllLink: { fontSize: 14, color: COLORS.orange, fontWeight: '600' },
  optionsIcon: { fontSize: 18, color: '#999' },
  horizontalScroll: { paddingLeft: 20 },
  floatingButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.orange,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 80,
    right: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  floatingButtonText: { fontSize: 28, color: '#fff', fontWeight: '300' },
});

export default AuthenticatedHomeScreen;
