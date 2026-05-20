import React from 'react';
import { View, StyleSheet, FlatList, Dimensions, RefreshControl, RefreshControlProps } from 'react-native';

const { width } = Dimensions.get('window');

type GridProps<T> = {
  data: T[];
  renderItem: ({ item }: { item: T }) => React.ReactElement;
  keyExtractor: (item: T, index: number) => string;
  numColumns?: number;
  contentContainerStyle?: any;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
  ListEmptyComponent?: React.ComponentType<any> | React.ReactElement | null;
};

const Grid = <T,>({ data, renderItem, keyExtractor, numColumns = 2, contentContainerStyle, refreshControl, ListHeaderComponent, ListEmptyComponent }: GridProps<T>) => {
  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      numColumns={numColumns}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={contentContainerStyle || styles.gridContainer}
      refreshControl={refreshControl}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={ListEmptyComponent}
    />
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    padding: 8,
  },
});

export default Grid;
