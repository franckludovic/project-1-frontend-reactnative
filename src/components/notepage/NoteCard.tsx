import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { COLORS } from '../../constants';

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
};

type Props = {
  note: Note;
  onPress?: () => void;
};

const NoteCard: React.FC<Props> = ({ note, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={2}>{note.title}</Text>
        </View>
        {note.content && (
          <Text style={styles.description} numberOfLines={2}>{note.content}</Text>
        )}
        <View style={[styles.syncBadge, note.synched ? styles.synchedBadge : styles.unsynchedBadge]}>
         <Text style={styles.syncBadgeText}>{note.synched ? 'synched' : 'Unsynched'}</Text>
        </View>
        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Text style={styles.icon}>📍</Text>
            <Text style={styles.metaText} numberOfLines={1}>{note.location}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.icon}>📅</Text>
            <Text style={styles.metaText}>{note.date}</Text>
          </View>
        </View>
      </View>
      <View style={styles.imageContainer}>
        {note.imageUrl ? (
          <Image source={{ uri: note.imageUrl }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderIcon}>📝</Text>
          </View>
        )}
        {note.attachmentsCount > 0 && (
          <View style={styles.attachmentsPill}>
            <Text style={styles.attachmentsText}>Attachemnts: {note.attachmentsCount}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 12,
    padding: 12,
    height: 150,
    marginHorizontal: 0,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  content: {
    flex: 1,
    paddingRight: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 0,
  },
  syncBadge: {
    paddingHorizontal: 4,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 4,
    marginLeft: 4,
  },
  synchedBadge: {
    backgroundColor: '#10b981', // green
    width: 70,
    alignItems: 'center',
  },
  unsynchedBadge: {
    backgroundColor: '#f50b1fff', // red
    width: 80,
    alignItems: 'center',
  },
  syncBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },

  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textMain,
    marginBottom: 4,
    lineHeight: 22,
  },
  description: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 4,
    lineHeight: 18,
  },
  meta: {
    marginTop: 'auto',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  icon: {
    fontSize: 14,
    marginRight: 6,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  placeholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 24,
    color: COLORS.textMuted,
  },
  attachmentsPill: {
    position: 'absolute',
    bottom: -4,
    right: 0,
    height: 30,
    backgroundColor: COLORS.orange,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 125,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachmentsCountText: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  attachmentsText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default NoteCard;
