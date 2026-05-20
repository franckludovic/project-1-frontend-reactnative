import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  FlatList,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - 48;
const CARD_GAP = 16;

type Attraction = {
  id: string;
  title: string;
  subtitle: string;
  distance: string;
  rating: number;
  reviews: string;
  tag: string;
  image: any;
};

const attractionsData: Attraction[] = [
  {
    id: "1",
    title: "Tower Bridge",
    subtitle: "London, UK",
    distance: "1.2 km",
    rating: 4.8,
    reviews: "1.2k",
    tag: "Landmark",
    image: require("../assets/images/image 5.jpg"),
  },
  {
    id: "2",
    title: "Hidden Waterfall",
    subtitle: "Valley Trail",
    distance: "0.5 km",
    rating: 4.6,
    reviews: "230",
    tag: "Nature",
    image: require("../assets/images/image 3.jpg"),
  },
  {
    id: "3",
    title: "Louvre Museum",
    subtitle: "Paris, France",
    distance: "2.4 km",
    rating: 4.9,
    reviews: "8.5k",
    tag: "Museum",
    image: require("../assets/images/image 4.jpg"),
  },
  {
    id: "4",
    title: "Taj Mahal",
    subtitle: "Agra, India",
    distance: "4.1 km",
    rating: 5.0,
    reviews: "12.4k",
    tag: "Heritage",
    image: require("../assets/images/image 5.jpg"),
  },
  {
    id: "5",
    title: "Kyoto Forest",
    subtitle: "Arashiyama",
    distance: "3.7 km",
    rating: 4.7,
    reviews: "3.1k",
    tag: "Nature",
    image: require("../assets/images/image 3.jpg"),
  },
];

// Tag color map for variety
const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  Landmark: { bg: "rgba(99, 102, 241, 0.85)", text: "#fff" },
  Nature: { bg: "rgba(16, 185, 129, 0.85)", text: "#fff" },
  Museum: { bg: "rgba(245, 158, 11, 0.85)", text: "#fff" },
  Heritage: { bg: "rgba(239, 68, 68, 0.85)", text: "#fff" },
};

// ─── Card Component ────────────────────────────────────────────────────────────
function AttractionCard({
  item,
  isSaved,
  onToggleSave,
}: {
  item: Attraction;
  isSaved: boolean;
  onToggleSave: () => void;
}) {
  const saveScale = useRef(new Animated.Value(1)).current;
  const tagColor = TAG_COLORS[item.tag] ?? {
    bg: "rgba(30,30,30,0.75)",
    text: "#fff",
  };

  const handleSave = () => {
    Animated.sequence([
      Animated.timing(saveScale, {
        toValue: 0.78,
        duration: 110,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      }),
      Animated.spring(saveScale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 4,
        tension: 200,
      }),
    ]).start();
    onToggleSave();
  };

  return (
    <View style={styles.card}>
      <ImageBackground
        source={item.image}
        style={styles.imageBackground}
        imageStyle={styles.imageStyle}
        resizeMode="cover"
      >
        {/* Deep cinematic gradient */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.18)", "rgba(0,0,0,0.72)"]}
          locations={[0.3, 0.6, 1]}
          style={StyleSheet.absoluteFill}
        />

        {/* Top row: tag + bookmark */}
        <View style={styles.cardTopRow}>
          {/* Category tag */}
          <View style={[styles.tagPill, { backgroundColor: tagColor.bg }]}>
            <Text style={[styles.tagText, { color: tagColor.text }]}>
              {item.tag}
            </Text>
          </View>

          {/* Bookmark button with animated press */}
          <Animated.View style={{ transform: [{ scale: saveScale }] }}>
            <TouchableOpacity
              style={[
                styles.bookmarkButton,
                isSaved && styles.bookmarkButtonActive,
              ]}
              activeOpacity={0.85}
              onPress={handleSave}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={isSaved ? "bookmark" : "bookmark-outline"}
                size={16}
                color={isSaved ? "#FF5A36" : "#fff"}
              />
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Bottom content */}
        <View style={styles.cardBottom}>
          {/* Rating pill — floats above title */}
          <View style={styles.ratingPill}>
            <Ionicons name="star" size={11} color="#FBBF24" />
            <Text style={styles.ratingPillText}>{item.rating.toFixed(1)}</Text>
            <Text style={styles.ratingPillDivider}>·</Text>
            <Text style={styles.ratingPillReviews}>{item.reviews} reviews</Text>
          </View>

          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title}
          </Text>

          {/* Subtitle + distance on one row */}
          <View style={styles.cardMeta}>
            <View style={styles.metaLeft}>
              <Ionicons
                name="location-outline"
                size={12}
                color="rgba(255,255,255,0.65)"
              />
              <Text style={styles.metaSubtitle}>{item.subtitle}</Text>
            </View>

            <View style={styles.distanceBadge}>
              <Ionicons name="navigate-outline" size={11} color="#FF5A36" />
              <Text style={styles.distanceText}>{item.distance}</Text>
            </View>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

// ─── Animated Indicator ────────────────────────────────────────────────────────
function Indicator({
  count,
  activeIndex,
}: {
  count: number;
  activeIndex: number;
}) {
  // Each dot's width animates between inactive (6) and active (22)
  const widths = useRef(
    Array.from(
      { length: count },
      (_, i) => new Animated.Value(i === 0 ? 22 : 6),
    ),
  ).current;

  useEffect(() => {
    widths.forEach((anim, i) => {
      Animated.spring(anim, {
        toValue: i === activeIndex ? 22 : 6,
        useNativeDriver: false,
        friction: 7,
        tension: 120,
      }).start();
    });
  }, [activeIndex]);

  return (
    <View style={styles.indicatorContainer}>
      {widths.map((anim, i) => (
        <Animated.View
          key={i}
          style={[
            styles.dot,
            { width: anim },
            i === activeIndex ? styles.dotActive : styles.dotInactive,
          ]}
        />
      ))}
    </View>
  );
}

// ─── Main Carousel ─────────────────────────────────────────────────────────────
export default function NearbyAttractionsCarousel() {
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [savedMap, setSavedMap] = useState<Record<string, boolean>>({});
  const currentOffset = useRef(0);
  const activeAnim = useRef<Animated.CompositeAnimation | null>(null);
  const isProgrammaticScroll = useRef(false);

  const ITEM_SIZE = CARD_WIDTH + CARD_GAP;

  useEffect(() => {
    const interval = setInterval(() => {
      if (attractionsData.length === 0) return;
      const nextIndex = (currentIndex + 1) % attractionsData.length;
      scrollToIndex(nextIndex);
    }, 5000);

    return () => {
      clearInterval(interval);
      activeAnim.current?.stop();
    };
  }, [currentIndex]);

  const scrollToIndex = (index: number) => {
    const targetOffset = index * ITEM_SIZE;
    if (activeAnim.current) activeAnim.current.stop();

    isProgrammaticScroll.current = true;

    const animVal = new Animated.Value(currentOffset.current);
    const id = animVal.addListener(({ value }) => {
      flatListRef.current?.scrollToOffset({ offset: value, animated: false });
      currentOffset.current = value;
    });

    const anim = Animated.timing(animVal, {
      toValue: targetOffset,
      duration: 700,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: false,
    });

    activeAnim.current = anim;
    anim.start((result) => {
      animVal.removeListener(id);
      isProgrammaticScroll.current = false;
      if (result.finished) {
        setCurrentIndex(index);
      }
    });
  };

  const toggleSave = (id: string) =>
    setSavedMap((prev) => ({ ...prev, [id]: !prev[id] }));

  const onScroll = (event: any) => {
    const x = event.nativeEvent.contentOffset.x;
    currentOffset.current = x;

    // Only compute layout index shifts for manual swipes
    if (!isProgrammaticScroll.current) {
      const index = Math.round(x / ITEM_SIZE);
      if (
        index !== currentIndex &&
        index >= 0 &&
        index < attractionsData.length
      ) {
        setCurrentIndex(index);
      }
    }
  };

  const onScrollBeginDrag = () => {
    activeAnim.current?.stop();
    isProgrammaticScroll.current = false;
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={attractionsData}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_SIZE}
        decelerationRate="fast"
        snapToAlignment="start"
        contentContainerStyle={styles.listContent}
        clipToPadding={false}
        onScroll={onScroll}
        onScrollBeginDrag={onScrollBeginDrag}
        scrollEventThrottle={16}
        getItemLayout={(_, index) => ({
          length: ITEM_SIZE,
          offset: ITEM_SIZE * index,
          index,
        })}
        renderItem={({ item }) => (
          <AttractionCard
            item={item}
            isSaved={!!savedMap[item.id]}
            onToggleSave={() => toggleSave(item.id)}
          />
        )}
      />

      <Indicator count={attractionsData.length} activeIndex={currentIndex} />
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },

  listContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
  },

  // ── Card ──────────────────────────────────────────────────────────────────
  card: {
    width: CARD_WIDTH,
    marginRight: CARD_GAP,
    borderRadius: 24,
    backgroundColor: "#111",
    // Elevated shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },

  imageBackground: {
    height: 240,
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 24,
    overflow: "hidden",
  },

  imageStyle: {
    borderRadius: 24,
  },

  // ── Card top row ──────────────────────────────────────────────────────────
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  tagPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    // Frosted effect via opacity on bg color (set per item)
  },

  tagText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  bookmarkButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },

  bookmarkButtonActive: {
    backgroundColor: "rgba(255,90,54,0.15)",
    borderColor: "rgba(255,90,54,0.4)",
  },

  // ── Card bottom ───────────────────────────────────────────────────────────
  cardBottom: {
    gap: 6,
  },

  ratingPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(0,0,0,0.35)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
    marginBottom: 2,
  },

  ratingPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FBBF24",
  },

  ratingPillDivider: {
    fontSize: 12,
    color: "rgba(255,255,255,0.35)",
  },

  ratingPillReviews: {
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    fontWeight: "500",
  },

  cardTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
    // Subtle text shadow for legibility over bright images
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },

  cardMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
  },

  metaLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  metaSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.65)",
    fontWeight: "500",
  },

  distanceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  distanceText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1A1A1A",
  },

  // ── Indicator ─────────────────────────────────────────────────────────────
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
    gap: 5,
  },

  dot: {
    height: 6,
    borderRadius: 3,
  },

  dotActive: {
    backgroundColor: "#FF5A36",
  },

  dotInactive: {
    backgroundColor: "rgba(92,78,77,0.2)",
  },
});
