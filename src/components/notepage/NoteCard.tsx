import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
  synched: boolean;
};

type Props = {
  note: Note;
  onPress?: () => void;
};

const NoteCard: React.FC<Props> = ({ note, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>{note.title}</Text>
          <View style={[styles.syncBadge, note.synched ? styles.synchedBadge : styles.unsynchedBadge]}>
            <Text style={[styles.syncBadgeText, note.synched ? styles.synchedText : styles.unsynchedText]}>
              {note.synched ? 'Synced' : 'Local'}
            </Text>
          </View>
        </View>

        {note.content && (
          <Text style={styles.description} numberOfLines={2}>{note.content}</Text>
        )}

        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={12} color={COLORS.textLight} style={styles.metaIcon} />
            <Text style={styles.metaText} numberOfLines={1}>{note.location}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={12} color={COLORS.textLight} style={styles.metaIcon} />
            <Text style={styles.metaText}>{note.date}</Text>
          </View>
        </View>
      </View>

      <View style={styles.imageContainer}>
        {note.imageUrl ? (
          <Image source={{ uri: note.imageUrl }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="document-text-outline" size={20} color={COLORS.textLight} />
          </View>
        )}
        {note.attachmentsCount > 0 && (
          <View style={styles.attachmentsPill}>
            <Ionicons name="attach" size={12} color="#fff" />
            <Text style={styles.attachmentsText}>{note.attachmentsCount}</Text>
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
    borderRadius: 20,
    padding: 14,
    height: 130,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
  },
  content: {
    flex: 1,
    paddingRight: 12,
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textMain,
    letterSpacing: -0.2,
  },
  syncBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  synchedBadge: {
    backgroundColor: COLORS.emeraldLight,
    borderColor: 'rgba(16, 185, 129, 0.15)',
  },
  unsynchedBadge: {
    backgroundColor: COLORS.redLight,
    borderColor: 'rgba(239, 68, 68, 0.15)',
  },
  syncBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  synchedText: {
    color: COLORS.emeraldGreen,
  },
  unsynchedText: {
    color: COLORS.redAlert,
  },
  description: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 16,
    fontWeight: '500',
    marginVertical: 4,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaIcon: {
    marginTop: 1,
  },
  metaText: {
    fontSize: 11,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  imageContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  image: {
    width: 86,
    height: 86,
    borderRadius: 14,
  },
  placeholder: {
    width: 86,
    height: 86,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachmentsPill: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  attachmentsText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#fff',
  },
});

export default NoteCard;
