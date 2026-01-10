import { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
  Image,
  StatusBar,
  SafeAreaView,
  Platform,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');

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

const PlaceDetailsScreen = () => {
  const { placeId } = useLocalSearchParams() as { placeId: any };
  const parsedPlace = useMemo(() => {
    return placeId ? JSON.parse(placeId) : null;
  }, [placeId]);
  const [navigating, setNavigating] = useState(false);

  if (!parsedPlace) {
    return <Text>Place not found</Text>;
  }

  return (
    <View style={styles.container as ViewStyle}>
      <StatusBar barStyle="light-content" translucent />

      {/* --- HERO SECTION --- */}
      <View style={styles.heroContainer as ViewStyle}>
        <ImageBackground
          source={parsedPlace.image}
          style={styles.heroImage as ViewStyle}
          resizeMode="cover"
        >
          {/* Gradient Overlay */}
          <LinearGradient
            colors={['rgba(0,0,0,0.9)', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.3)']}
            start={{ x: 0, y: 1 }}
            end={{ x: 0, y: 0 }}
            style={styles.heroOverlay as ViewStyle}
          />

          {/* Top Bar (Back & Share) */}
          <SafeAreaView style={styles.topBarSafe as ViewStyle}>
            <View style={styles.topBar as ViewStyle}>
              <TouchableOpacity style={styles.glassButton as ViewStyle} onPress={() => router.back()}>
                <Icon name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.glassButton as ViewStyle}>
                <Icon name="ios-share" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          {/* Bottom Hero Content */}
          <View style={styles.heroContent as ViewStyle}>
            <View style={styles.tagsRow as ViewStyle}>
              <View style={styles.tagBadge as ViewStyle}>
                <Text style={styles.tagText as TextStyle}>{parsedPlace.category}</Text>
              </View>
              <View style={styles.ratingContainer as ViewStyle}>
                <Icon name="star" size={16} color="#fbbf24" />
                <Text style={styles.ratingText as TextStyle}>{parsedPlace.rating}</Text>
              </View>
            </View>
            <Text style={styles.heroTitle as TextStyle}>{parsedPlace.title}</Text>
            <Text style={styles.heroSubtitle as TextStyle} numberOfLines={2}>
              {parsedPlace.location}
            </Text>
          </View>
        </ImageBackground>
      </View>

      {/* --- MAIN CONTENT SHEET --- */}
      <View style={styles.sheetContainer as ViewStyle}>
        {/* Drag Handle & Online Status */}
        <View style={styles.sheetHeader as ViewStyle}>
          <View style={styles.dragHandle as ViewStyle} />
          <View style={styles.statusBadge as ViewStyle}>
            <View style={styles.statusDot as ViewStyle} />
            <Text style={styles.statusText as TextStyle}>{parsedPlace.synched === 1 ? 'Synced' : 'Not synced'}</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent as ViewStyle}>

          {/* --- ACTION BUTTONS --- */}
          <View style={styles.actionRow as ViewStyle}>
            <TouchableOpacity
              style={styles.actionBtnWhite as ViewStyle}
              onPress={() => {
                setNavigating(true);
                router.push({
                  pathname: '/AddNote',
                  params: {
                    place: JSON.stringify(parsedPlace),
                  },
                });
              }}
            >
              <Icon name="edit" size={26} color={COLORS.primary} />
              <Text style={styles.actionBtnTextGray as TextStyle}>Add Note</Text>
            </TouchableOpacity>


            <TouchableOpacity style={styles.actionBtnWhite as ViewStyle}>
              <Icon name="favorite-border" size={26} color={COLORS.stone400} />
              <Text style={styles.actionBtnTextGray as TextStyle}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtnDark as ViewStyle}>
              <Icon name="directions" size={26} color="#fff" />
              <Text style={styles.actionBtnTextWhite as TextStyle}>Directions</Text>
            </TouchableOpacity>
          </View>

          {/* --- ABOUT SECTION --- */}
          <View style={styles.sectionContainer as ViewStyle}>
            <View style={styles.card as ViewStyle}>
              <Text style={styles.sectionTitle as TextStyle}>About this place</Text>
              <Text style={styles.descriptionText as TextStyle}>
                {parsedPlace.subtitle || "No description available."}
              </Text>

              {/* Coordinates Grid */}
              <View style={styles.infoGrid as ViewStyle}>
                <View style={styles.infoItem as ViewStyle}>
                  <View style={styles.iconCircle as ViewStyle}>
                    <Icon name="near-me" size={18} color={COLORS.stone600} />
                  </View>
                  <View>
                    <Text style={styles.infoLabel as TextStyle}>COORDINATES</Text>
                    <Text style={styles.infoValue as TextStyle}>{parsedPlace.latitude}° N, {parsedPlace.longitude}° W</Text>
                  </View>
                </View>

                <View style={styles.infoItem as ViewStyle}>
                  <View style={styles.iconCircle as ViewStyle}>
                    <Icon name="schedule" size={18} color={COLORS.stone600} />
                  </View>
                  <View>
                    <Text style={styles.infoLabel as TextStyle}>STATUS</Text>
                    <Text style={[styles.infoValue as TextStyle, { color: COLORS.emerald600 }]}>Open Now</Text>
                  </View>
                </View>
              </View>

              {/* Map Preview */}
              <View style={styles.mapContainer as ViewStyle}>
                <ImageBackground
                  source={{
                    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCbR3lbYtux5NJN37woD7XKvk0eFNhj7YeA_sOYmlOwtz7wLg9lJ8EYUaDFEZ8fwW59otcPxgaDz8ZV3ClerU6Z_4Noz2wmVSR-uLnm0urDf2ZIdS2ysk4jw5ejIywjzRF9XjSNnsIwClAJ1HLyOuh0u0ANtK5wIsqo_EBjrGZgeVbjNlk8y3oNnhFFVXDBYrlZtBAIxyIjQTwWqFD-RDBLwlZ_sdeP_dVIPsL6vRGbb2d9x7I-A2ryuqH6UDyH5yGrVUsx_m6dD9hL',
                  }}
                  style={styles.mapImage as ViewStyle}
                  imageStyle={{ opacity: 0.8 }}
                >
                  <View style={styles.mapPin as ViewStyle}>
                    <Icon name="location-pin" size={14} color="#fff" />
                  </View>
                  <TouchableOpacity style={styles.viewMapBtn as ViewStyle}>
                    <Text style={styles.viewMapText as TextStyle}>View Full Map</Text>
                  </TouchableOpacity>
                </ImageBackground>
              </View>
            </View>
          </View>

          {/* --- NOTES SECTION --- */}
          <View style={styles.sectionHeaderRow as ViewStyle}>
            <Text style={styles.sectionTitleLarge as TextStyle}>Your Notes</Text>
            <TouchableOpacity style={styles.addBtnSmall as ViewStyle}>
              <Icon name="add" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.notesScroll as ViewStyle} contentContainerStyle={styles.notesContent as ViewStyle}>
            {/* Note Card 1 (Journal) */}
            <View style={styles.noteCardAmber as ViewStyle}>
              <Image
                source={{
                  uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDuGp1nGpek6WFPtqBzKklZR2hGsjIcsaEooz7gfWjm-Tz2J20dooLQDYRaG-XhnlLRjdhoFCAYk1mLAR6dVNBVOMEfhQ8-hWP8N5cnSIuo1Mpi97WKl_tzaIXtdeKgDiH_-d4-ucmXxr6tjK14r4DQmfiRkkdOhPLw6lsw7QI7TvTP6eMiQaMZZgbpXsjxl0cAxhVXfn2jKq5U6QgoAdhDMDT7vhEkDlMIV9Vwit_qRIDovIStR8rnI9OKrx8I3PkF_TsS88wodL10',
                }}
                style={styles.noteThumb as ImageStyle}
              />
              <View style={styles.noteTextContainer as ViewStyle}>
                <Text style={styles.noteDate as TextStyle}>JOURNAL • OCT 12</Text>
                <Text style={styles.noteBody as TextStyle} numberOfLines={2}>
                  The silica mask was amazing! Remember to wash hair before entering...
                </Text>
              </View>
            </View>

            {/* Note Card 2 (Simple) */}
            <View style={styles.noteCardWhite as ViewStyle}>
              <Icon name="note" size={24} color={COLORS.stone400} style={{ marginBottom: 8 }} />
              <Text style={styles.noteBodyGray as TextStyle} numberOfLines={3}>
                Note to self: The reservation needs to be booked 2 weeks in advance next time.
              </Text>
            </View>
          </ScrollView>

          {/* --- COMMUNITY TIPS --- */}
          <View style={styles.sectionHeaderRow as ViewStyle}>
            <Text style={styles.sectionTitleLarge as TextStyle}>Community Tips</Text>
            <Text style={styles.newTipsText as TextStyle}>12 new</Text>
          </View>

          <View style={styles.tipsContainer as ViewStyle}>
            {/* Tip 1 */}
            <View style={styles.tipCard as ViewStyle}>

              <View style={{ flex: 1 }}>
                <View style={styles.tipHeader as ViewStyle}>
                  <Text style={styles.tipName as TextStyle}>mamami</Text>
                  <Text style={styles.tipTime as TextStyle}>N/A</Text>
                </View>
                <Text style={styles.tipText as TextStyle}>
                  None for now
                </Text>
              </View>
            </View>
          </View>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight,
    backgroundColor: COLORS.backgroundLight,
  },
  // HERO
  heroContainer: {
    height: height * 0.4,
    width: '100%',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  topBarSafe: {
    zIndex: 10,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: Platform.OS === 'android' ? 20 : 0,
  },
  glassButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  heroContent: {
    position: 'absolute',
    bottom: 70, // Pushed up slightly to accommodate sheet overlap
    left: 24,
    right: 24,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  tagBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  tagText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
    // fontFamily: 'Plus Jakarta Sans', // Ensure font is linked
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#e7e5e4',
    fontWeight: '500',
    lineHeight: 20,
    maxWidth: '90%',
  },

  // SHEET
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
  sheetHeader: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
    position: 'relative',
    height: 40,
  },
  dragHandle: {
    width: 48,
    height: 6,
    backgroundColor: COLORS.stone200,
    borderRadius: 3,
  },
  statusBadge: {
    position: 'absolute',
    right: 24,
    top: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.emerald50,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.emerald100,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.emerald500,
    marginRight: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.emerald700,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // ACTIONS
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    gap: 12,
  },
  actionBtnWhite: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.stone200,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  actionBtnDark: {
    flex: 1,
    backgroundColor: COLORS.stone900,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  actionBtnTextGray: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.stone600,
  },
  actionBtnTextWhite: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },

  // SECTIONS
  sectionContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  card: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.stone200, // stone-100 equivalent
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.stone900,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: COLORS.stone600,
    lineHeight: 22,
    marginBottom: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 16,
  },
  infoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.stone400,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.stone600,
  },

  // MAP
  mapContainer: {
    height: 128,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.stone200,
  },
  mapImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  viewMapBtn: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  viewMapText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.stone900,
  },

  // NOTES HEADER
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitleLarge: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.stone900,
  },
  addBtnSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notesScroll: {
    paddingLeft: 24,
    marginBottom: 32,
  },
  notesContent: {
    paddingRight: 24, // End padding
  },
  noteCardAmber: {
    width: 260,
    backgroundColor: COLORS.amber50,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.amber100,
    flexDirection: 'row',
    gap: 12,
    marginRight: 16,
  },
  noteCardWhite: {
    width: 200,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.stone200,
    flexDirection: 'column',
    marginRight: 16,
  },
  noteThumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#ddd',
  },
  noteTextContainer: {
    flex: 1,
    gap: 4,
  },
  noteDate: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.amber600,
    textTransform: 'uppercase',
  },
  noteBody: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.stone900,
  },
  noteBodyGray: {
    fontSize: 12,
    color: COLORS.stone600,
  },

  // TIPS
  newTipsText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.stone400,
  },
  tipsContainer: {
    paddingHorizontal: 24,
    gap: 12,
  },
  tipCard: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.stone200,
    gap: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.stone200,
    marginTop: 4,
  },
  tipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  tipName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.stone900,
  },
  tipTime: {
    fontSize: 10,
    color: COLORS.stone400,
  },
  tipText: {
    fontSize: 12,
    color: COLORS.stone600,
    lineHeight: 18,
  },

  // NAVIGATING OVERLAY
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

export default PlaceDetailsScreen;