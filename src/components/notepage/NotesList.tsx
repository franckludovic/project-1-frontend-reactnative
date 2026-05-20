import React from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants';
import NoteCard from './NoteCard';
import SearchBar from '../SearchBar';
import FilterChips from './FilterChips';

type Tag = {
  label: string;
  color: string;
};

type Note = {
  id: number;
  title: string;
  content: string;
  location: string;
  date: string;
  imageUrl?: string;
  tags: Tag[];
  attachmentsCount: number;
  synched: boolean;
};

type FilterType = 'all' | 'synched' | 'unsynched';

type Props = {
  notes: Note[];
  onNotePress: (note: Note) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  refreshing: boolean;
  onRefresh: () => void;
};

const NotesList: React.FC<Props> = ({
  notes,
  onNotePress,
  searchQuery,
  onSearchChange,
  selectedFilter,
  onFilterChange,
  refreshing,
  onRefresh,
}) => {
  const renderItem = ({ item }: { item: Note }) => (
    <NoteCard note={item} onPress={() => onNotePress(item)} />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconCircle}>
        <Ionicons name="document-text-outline" size={32} color={COLORS.textLight} />
      </View>
      <Text style={styles.emptyTitle}>No Notes Found</Text>
      <Text style={styles.emptyDescription}>
        Start exploring destinations and write your first journal entry!
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <SearchBar value={searchQuery} onChangeText={onSearchChange} placeholder="Search journal entries..." />
      <FilterChips selectedFilter={selectedFilter} onFilterChange={onFilterChange} />
    </View>
  );

  return (
    <FlatList
      data={notes}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      ListEmptyComponent={renderEmpty}
      ListHeaderComponent={renderHeader}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh}
          tintColor={COLORS.primary}
          colors={[COLORS.primary]}
        />
      }
    />
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  headerContainer: {
    marginBottom: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textMain,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  emptyDescription: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '500',
  },
});

export default NotesList;
