import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  TouchableWithoutFeedback,
} from "react-native";

const { width, height } = Dimensions.get("window");

export interface FeedItemProps {
  item: {
    id: string;
    place_id: number;
    title: string;
    description: string;
    distance: string;
    tags: string[];
    author: {
      name: string;
      avatarUrl: string;
    };
    mediaUrls: any[];
    mediaType: "image" | "video" | "carousel";
    likes: number;
    comments: number;
    saves: number;
    isFavorite: boolean;
  };
  isActive: boolean;
  onLike: () => void;
  onComment: () => void;
  onSave: () => void;
  onShare: () => void;
  onProfile: () => void;
}

const FeedItem: React.FC<FeedItemProps> = ({
  item,
  isActive,
  onLike,
  onComment,
  onSave,
  onShare,
  onProfile,
}) => {
  const carouselRef = useRef<FlatList>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  // Animated Action Button Component
  const AnimatedActionButton = ({ onPress, children, text }: { onPress: () => void, children: React.ReactNode, text?: string | number }) => {
    const scale = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
      Animated.spring(scale, {
        toValue: 0.85,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scale, {
        toValue: 1,
        friction: 3,
        tension: 100,
        useNativeDriver: true,
      }).start();
    };

    return (
      <TouchableWithoutFeedback onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={onPress}>
        <Animated.View style={[styles.actionButton, { transform: [{ scale }] }]}>
          {children}
          {text !== undefined && <Text style={styles.actionText}>{text}</Text>}
        </Animated.View>
      </TouchableWithoutFeedback>
    );
  };

  useEffect(() => {
    if (!isActive) setIsExpanded(false);
  }, [isActive]);

  // Setup expo-video player
  // useVideoPlayer accepts a string URI or a local asset require() (which is a number)
  const videoSource = item.mediaType === "video" ? item.mediaUrls[0] : null;
  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = true;
  });

  // Auto-play video based on active state
  useEffect(() => {
    if (item.mediaType === "video" && player) {
      if (isActive) {
        player.play();
      } else {
        player.pause();
      }
    }
  }, [isActive, player, item.mediaType]);

  // Auto-scroll carousel
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (
      item.mediaType === "carousel" &&
      isActive &&
      item.mediaUrls.length > 1
    ) {
      timer = setInterval(() => {
        setCurrentImageIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % item.mediaUrls.length;
          carouselRef.current?.scrollToIndex({
            index: nextIndex,
            animated: true,
          });
          return nextIndex;
        });
      }, 10000); // 10 seconds
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isActive, item.mediaType, item.mediaUrls.length]);

  // Reset carousel when not active
  useEffect(() => {
    if (!isActive && item.mediaType === "carousel") {
      setCurrentImageIndex(0);
      carouselRef.current?.scrollToIndex({ index: 0, animated: false });
    }
  }, [isActive, item.mediaType]);

  const renderMedia = () => {
    const getSource = (url: any) =>
      typeof url === "string" ? { uri: url } : url;

    if (item.mediaType === "video") {
      return (
        <VideoView
          style={styles.media}
          player={player}
          allowsFullscreen={false}
          allowsPictureInPicture={false}
          nativeControls={false}
          contentFit="cover"
        />
      );
    } else if (item.mediaType === "carousel" && item.mediaUrls.length > 1) {
      return (
        <View style={styles.media}>
          <FlatList
            ref={carouselRef}
            data={item.mediaUrls}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, index) => `img-${index}`}
            onMomentumScrollEnd={(e) => {
              const newIndex = Math.round(
                e.nativeEvent.contentOffset.x / width,
              );
              setCurrentImageIndex(newIndex);
            }}
            renderItem={({ item: url }) => (
              <Image source={getSource(url)} style={styles.media} />
            )}
          />
          {/* Pagination Indicators */}
          <View style={styles.paginationContainer}>
            {item.mediaUrls.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index === currentImageIndex && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>
        </View>
      );
    } else {
      // Fallback for single image
      return (
        <Image source={getSource(item.mediaUrls[0])} style={styles.media} />
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Media Layer */}
      {renderMedia()}

      {/* Dark Overlay for better text readability at the bottom */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.8)"]}
        style={styles.bottomGradient}
      />

      {/* Right Sidebar */}
      <View style={styles.rightSidebar}>
        {/* Like Button */}
        <AnimatedActionButton onPress={onLike} text={item.likes}>
          <View style={styles.iconCircle}>
            <LinearGradient
              colors={["rgba(255, 255, 255, 0.45)", "rgba(255, 255, 255, 0.12)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconCircleGradient}
            >
              <Ionicons
                name={item.isFavorite ? "heart" : "heart-outline"}
                size={22}
                color={item.isFavorite ? "#ff4040" : "white"}
              />
            </LinearGradient>
          </View>
        </AnimatedActionButton>

        {/* Comment Button */}
        <AnimatedActionButton onPress={onComment} text={item.comments}>
          <View style={styles.iconCircle}>
            <LinearGradient
              colors={["rgba(255, 255, 255, 0.45)", "rgba(255, 255, 255, 0.12)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconCircleGradient}
            >
              <Ionicons name="chatbubble-outline" size={22} color="white" />
            </LinearGradient>
          </View>
        </AnimatedActionButton>

        {/* Save Button */}
        <AnimatedActionButton onPress={onSave} text={item.saves}>
          <View style={styles.iconCircle}>
            <LinearGradient
              colors={["rgba(255, 255, 255, 0.45)", "rgba(255, 255, 255, 0.12)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconCircleGradient}
            >
              <Ionicons name="bookmark-outline" size={22} color="white" />
            </LinearGradient>
          </View>
        </AnimatedActionButton>

        {/* Share Button */}
        <AnimatedActionButton onPress={onShare}>
          <View style={styles.iconCircle}>
            <LinearGradient
              colors={["rgba(255, 255, 255, 0.45)", "rgba(255, 255, 255, 0.12)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconCircleGradient}
            >
              <Ionicons name="share-social-outline" size={22} color="white" />
            </LinearGradient>
          </View>
        </AnimatedActionButton>
      </View>

      {/* Bottom Info Section */}
      <View style={styles.bottomInfoContainer}>
        <View style={styles.bottomInfoLeft}>
          <Text style={styles.title}>{item.title}</Text>

          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color="white" />
            <Text style={styles.distanceText}>{item.distance}</Text>
          </View>

          {item.tags && item.tags.length > 0 && (
            <View style={styles.tagsRow}>
              {item.tags.map((tag, index) => (
                <Text key={index} style={styles.tagText}>
                  {tag}
                </Text>
              ))}
            </View>
          )}

          <Text
            style={styles.description}
            numberOfLines={isExpanded ? undefined : 2}
          >
            <Text style={styles.authorName}>{item.author.name} </Text>
            {item.description}
            {!isExpanded && (
              <Text style={styles.moreText} onPress={() => setIsExpanded(true)}>
                {" "}
                ...more
              </Text>
            )}
            {isExpanded && (
              <Text
                style={styles.moreText}
                onPress={() => setIsExpanded(false)}
              >
                {" "}
                less
              </Text>
            )}
          </Text>
        </View>

        <View style={styles.bottomInfoRight}>
          <TouchableOpacity onPress={onProfile}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: item.author.avatarUrl }}
                style={styles.avatar}
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width,
    height,
    backgroundColor: "black",
  },
  media: {
    width,
    height,
  },
  paginationContainer: {
    position: "absolute",
    bottom: 250, // Keep above the bottom info text
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.4)",
    marginHorizontal: 3,
  },
  paginationDotActive: {
    backgroundColor: "#fff",
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  bottomGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
  },
  rightSidebar: {
    position: 'absolute',
    right: 12,
    bottom: 160, // Moved up
    alignItems: 'center',
  },
  actionButton: {
    alignItems: "center",
    marginBottom: 20,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
    marginBottom: 4,
  },
  iconCircleGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  actionText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  avatarContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: 'white',
    overflow: 'hidden',
    marginBottom: 8,
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  bottomInfoContainer: {
    position: "absolute",
    bottom: 100, // Give space for bottom nav
    left: 16,
    right: 12, // Match rightSidebar to align with icons
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  bottomInfoLeft: {
    flex: 1,
    marginRight: 16, // Provide buffer between text and avatar
  },
  bottomInfoRight: {
    justifyContent: "flex-end",
    alignItems: "center",
  },
  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  distanceText: {
    color: "white",
    fontSize: 13,
    marginLeft: 4,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  tagText: {
    color: "#AB3500",
    fontWeight: "bold",
    fontSize: 14,
    marginRight: 8,
  },
  description: {
    color: "white",
    fontSize: 14,
    lineHeight: 20,
  },
  authorName: {
    fontWeight: "bold",
  },
  moreText: {
    color: "rgba(255,255,255,0.7)",
    fontWeight: "600",
  },
});

export default React.memo(FeedItem);
