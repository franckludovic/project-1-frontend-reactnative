import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS } from '../../constants';

type Note = {
  note_id: number;
  title: string | undefined;
  content: string;
  created_at: string;
  latitude: number;
  longitude: number;
  photos?: Array<{
    photo_id: number;
    photo_url: string;
    local_path: string | null;
    display_order: number;
  }>;
};

type NotesSectionProps = {
  notes: Note[];
  loadingNotes: boolean;
  onAddNote: () => void;
};

const NotesSection: React.FC<NotesSectionProps> = ({ notes, loadingNotes, onAddNote }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitleLarge}>Your Notes</Text>
        <TouchableOpacity style={styles.addBtnSmall} onPress={onAddNote} activeOpacity={0.8}>
          <Ionicons name="add" size={18} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.notesScroll} contentContainerStyle={styles.notesContent}>
        {loadingNotes ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading notes...</Text>
          </View>
        ) : notes.length === 0 ? (
          <View style={styles.emptyNotesContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="document-text-outline" size={26} color={COLORS.textLight} />
            </View>
            <Text style={styles.emptyNotesText}>No notes yet</Text>
            <Text style={styles.emptyNotesSubtext}>Add photos and thoughts about this place!</Text>
          </View>
        ) : (
          notes.map((note) => (
            <TouchableOpacity
              key={note.note_id}
              style={note.photos && note.photos.length > 0 ? styles.noteCardPrimary : styles.noteCardWhite}
              onPress={() => {
                router.push({
                  pathname: "/note/[noteId]",
                  params: { noteId: note.note_id.toString() },
                });
              }}
              activeOpacity={0.9}
            >
              {note.photos && note.photos.length > 0 ? (
                <>
                  <Image
                    source={{ uri: note.photos[0].photo_url }}
                    style={styles.noteThumb}
                  />
                  <View style={styles.noteTextContainer}>
                    <Text style={styles.noteDate}>
                      {formatDate(note.created_at).toUpperCase()}
                    </Text>
                    {note.title && (
                      <Text style={styles.noteTitle} numberOfLines={1}>
                        {note.title}
                      </Text>
                    )}
                    <Text style={styles.noteBody} numberOfLines={2}>
                      {note.content}
                    </Text>
                    {note.photos.length > 1 && (
                      <Text style={styles.photoCountText}>
                        +{note.photos.length - 1} more photo{note.photos.length > 2 ? 's' : ''}
                      </Text>
                    )}
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.plainNoteHeader}>
                    <Ionicons name="document-text" size={20} color={COLORS.primary} />
                    <Text style={styles.noteDateGray}>
                      {formatDate(note.created_at)}
                    </Text>
                  </View>
                  {note.title && (
                    <Text style={styles.noteTitleText} numberOfLines={1}>
                      {note.title}
                    </Text>
                  )}
                  <Text style={styles.noteBodyGray} numberOfLines={3}>
                    {note.content}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 14,
  },
  sectionTitleLarge: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textMain,
    letterSpacing: -0.3,
  },
  addBtnSmall: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notesScroll: {
    paddingLeft: 24,
    marginBottom: 32,
  },
  notesContent: {
    paddingRight: 24,
  },
  noteCardPrimary: {
    width: 260,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 90, 54, 0.1)',
    flexDirection: 'row',
    gap: 12,
    marginRight: 14,
  },
  noteCardWhite: {
    width: 200,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    flexDirection: 'column',
    marginRight: 14,
  },
  noteThumb: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#ddd',
  },
  noteTextContainer: {
    flex: 1,
    gap: 3,
  },
  noteDate: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  noteTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  noteBody: {
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 15,
    fontWeight: '500',
  },
  plainNoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  noteTitleText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textMain,
    marginBottom: 4,
  },
  noteBodyGray: {
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 16,
    fontWeight: '500',
  },
  noteDateGray: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textLight,
  },
  photoCountText: {
    fontSize: 9,
    color: COLORS.textLight,
    fontWeight: '600',
    marginTop: 2,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  emptyNotesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    borderStyle: 'dashed',
    borderRadius: 16,
    marginRight: 24,
  },
  emptyIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyNotesText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  emptyNotesSubtext: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default NotesSection;
