import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { router } from 'expo-router';

// Colors extracted from the HTML Tailwind Config
const COLORS = {
  primary: '#fb923c',
  primaryDark: '#ea580c',
  backgroundLight: '#fafaf9',
  surfaceLight: '#ffffff',
  surfaceDark: '#292524',
  stone900: '#1c1917',
  stone600: '#57534e',
  stone400: '#a8a29e',
  stone200: '#e7e5e4',
  amber50: '#fffbeb',
  amber100: '#fef3c7',
  amber600: '#d97706',
  emerald50: '#ecfdf5',
  emerald100: '#d1fae5',
  emerald500: '#10b981',
  emerald600: '#059669',
  emerald700: '#047857',
};

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
      {/* --- NOTES SECTION --- */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitleLarge}>Your Notes</Text>
        <TouchableOpacity style={styles.addBtnSmall} onPress={onAddNote}>
          <Icon name="add" size={20} color={COLORS.primary} />
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
            <Icon name="note" size={48} color={COLORS.stone200} />
            <Text style={styles.emptyNotesText}>No notes yet</Text>
            <Text style={styles.emptyNotesSubtext}>Add your first note about this place!</Text>
          </View>
        ) : (
          notes.map((note) => (
            <TouchableOpacity
              key={note.note_id}
              style={note.photos && note.photos.length > 0 ? styles.noteCardAmber : styles.noteCardWhite}
              onPress={() => {
                router.push({
                  pathname: "/note/[noteId]",
                  params: { noteId: note.note_id.toString() },
                });
              }}
            >
              {note.photos && note.photos.length > 0 ? (
                <>
                  <Image
                    source={{ uri: note.photos[0].photo_url }}
                    style={styles.noteThumb}
                  />
                  <View style={styles.noteTextContainer}>
                    <Text style={styles.noteDate}>
                      NOTE • {formatDate(note.created_at).toUpperCase()}
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
                  <Icon name="note" size={24} color={COLORS.stone400} style={{ marginBottom: 8 }} />
                  <Text style={styles.noteBodyGray} numberOfLines={3}>
                    {note.content}
                  </Text>
                  <Text style={styles.noteDateGray}>
                    {formatDate(note.created_at)}
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
    marginBottom: 16,
  },
  sectionTitleLarge: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.stone900,
  },
  addBtnSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notesScroll: {
    paddingLeft: 24,
    marginBottom: 32,
  },
  notesContent: {
    paddingRight: 24, // End padding
  },
  noteCardAmber: {
    width: 260,
    backgroundColor: COLORS.amber50,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.amber100,
    flexDirection: 'row',
    gap: 12,
    marginRight: 16,
  },
  noteCardWhite: {
    width: 200,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.stone200,
    flexDirection: 'column',
    marginRight: 16,
  },
  noteThumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#ddd',
  },
  noteTextContainer: {
    flex: 1,
    gap: 4,
  },
  noteDate: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.amber600,
    textTransform: 'uppercase',
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.stone900,
  },
  noteBody: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.stone900,
  },
  noteBodyGray: {
    fontSize: 12,
    color: COLORS.stone600,
  },
  noteDateGray: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.stone400,
    textTransform: 'uppercase',
  },
  photoCountText: {
    fontSize: 10,
    color: COLORS.stone400,
    marginTop: 4,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.stone600,
  },
  emptyNotesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 8,
  },
  emptyNotesText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.stone600,
  },
  emptyNotesSubtext: {
    fontSize: 12,
    color: COLORS.stone400,
    textAlign: 'center',
  },
});

export default NotesSection;
