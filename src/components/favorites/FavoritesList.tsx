import React from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import PlaceCard from '../PlaceCard';
import Grid from '../Grid';
import { COLORS } from '../../constants';

const { width } = Dimensions.get('window');
const cardWidth = (width - 24) / 1.95;

type FavoriteItem = {
  id: number;        // place_id
  favId: number;     // fav_id
  title: string;
  location?: string;
  imageUrl?: string;
  isFavorite: boolean;
  date?: string;
  synched?: boolean;
};

type Props = {
  favorites: FavoriteItem[];
  onToggleFavorite: (favId: number) => void;
  onPress: (placeId: number) => void;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
  refreshControl?: any;
};

const FavoriteCardWrapper: React.FC<{ item: FavoriteItem; onPress: () => void; onFavoritePress: () => void }> = ({
  item,
  onPress,
  onFavoritePress,
}) => (
  <View style={styles.cardContainer}>
    <PlaceCard
      key={item.id}
      title={item.title}
      location={item.location}
      imageUrl={item.imageUrl}
      onPress={onPress}
      onFavoritePress={onFavoritePress}
      isFavorite={item.isFavorite}
      placeId={item.id}
      synched={item.synched}
    />
    {item.date && <Text style={styles.dateText}>{item.date}</Text>}
  </View>
);

const FavoritesList: React.FC<Props> = ({ favorites, onToggleFavorite, onPress, ListHeaderComponent, refreshControl }) => {
  const renderItem = ({ item }: { item: FavoriteItem }) => (
    <FavoriteCardWrapper
      item={item}
      onPress={() => onPress(item.id)}
      onFavoritePress={() => onToggleFavorite(item.favId)}
    />
  );

  return (
    <View style={styles.container}>
      <Grid
        data={favorites}
        renderItem={renderItem}
        keyExtractor={(item) => item.favId.toString()}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={ListHeaderComponent}
        refreshControl={refreshControl}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
  cardContainer: {
    width: cardWidth,
    marginBottom: 16,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default FavoritesList;
