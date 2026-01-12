import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '../../constants';
import NoteCard from './NoteCard';

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

type Props = {
  notes: Note[];
  onNotePress: (note: Note) => void;
};

const NotesList: React.FC<Props> = ({ notes, onNotePress }) => {
  if (notes.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📝</Text>
        <Text style={styles.emptyTitle}>No Notes Yet</Text>
        <Text style={styles.emptyDescription}>
          Start exploring places and create your first travel note!
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            onPress={() => onNotePress(note)}
          />
        ))}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textMain,
  },
  viewMap: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.orange,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textMain,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 20,
  },
  bottomSpacing: {
    height: 32,
  },
});

export default NotesList;
