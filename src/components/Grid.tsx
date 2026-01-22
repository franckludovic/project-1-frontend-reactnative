import React from 'react';
import { View, StyleSheet, FlatList, Dimensions, RefreshControl } from 'react-native';

const { width } = Dimensions.get('window');

type GridProps<T> = {
  data: T[];
  renderItem: ({ item }: { item: T }) => React.ReactElement;
  keyExtractor: (item: T, index: number) => string;
  numColumns?: number;
  contentContainerStyle?: any;
  refreshControl?: React.ReactElement<RefreshControl>;
};

const Grid = <T,>({ data, renderItem, keyExtractor, numColumns = 2, contentContainerStyle }: GridProps<T>) => {
  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      numColumns={numColumns}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={contentContainerStyle || styles.gridContainer}
    />
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    padding: 8,
  },
});

export default Grid;
