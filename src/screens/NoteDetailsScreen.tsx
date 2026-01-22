import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { getNoteById, updateNote, deleteNote, uploadImage, Note } from '../services/noteApi';
import { getNoteById as getNoteByIdLocal, updateNote as updateNoteLocal, deleteNote as deleteNoteLocal } from '../services/noteService';
import { API_BASE_URL } from '../config/config';
import { useAuth } from '../context/AuthContext';

// Components
import ImageCarousel from '../components/noteDetails/ImageCarousel';
import TitleSection from '../components/noteDetails/TitleSection';
import MetadataChips from '../components/noteDetails/MetadataChips';
import ContentSection from '../components/noteDetails/ContentSection';
import MenuModal from '../components/noteDetails/MenuModal';
import DeleteImagesModal from '../components/noteDetails/DeleteImagesModal';
import EditContentSection from '../components/noteDetails/EditContentSection';
import EditButton from '../components/noteDetails/EditButton';
import Header from '../components/Header';
import Button from '../components/Button';

const NoteDetailsScreen: React.FC = () => {
  const { user, tokens, authMode } = useAuth();
  const { noteId } = useLocalSearchParams<{ noteId: string }>();

  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationName, setLocationName] = useState<string>('Loading location...');
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeletingImages, setIsDeletingImages] = useState(false);
  const [selectedImages, setSelectedImages] = useState<Set<number>>(new Set());
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showDeleteImageModal, setShowDeleteImageModal] = useState(false);

  useEffect(() => {
    if (!noteId) {
      Alert.alert('Error', 'No note ID provided');
      router.back();
      return;
    }

    fetchNoteDetails();
  }, [noteId]);

  useEffect(() => {
    if (note) {
      reverseGeocodeLocation();
    }
  }, [note]);

  const reverseGeocodeLocation = async () => {
    if (!note) return;

    try {
      const geocode = await Location.reverseGeocodeAsync({
        latitude: note.latitude,
        longitude: note.longitude,
      });
      if (geocode.length > 0) {
        const address = geocode[0];
        const locationString = [
          address.city,
          address.country,
        ]
          .filter(Boolean)
          .join(', ');
        setLocationName(locationString || 'Unknown location');
      } else {
        setLocationName('Unknown location');
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      setLocationName('Unknown location');
    }
  };

  const fetchNoteDetails = async () => {
    try {
      let noteData;

      if (authMode === 'offline') {
        // Use local service for offline mode
        noteData = await getNoteByIdLocal(parseInt(noteId));
      } else {
        // Use API service for online mode
        noteData = await getNoteById(parseInt(noteId), tokens?.accessToken || '');
      }

      if (!noteData) {
        Alert.alert('Error', 'Note not found');
        router.back();
        return;
      }
      setNote(noteData);
      setEditedContent(noteData.content || '');
    } catch (error) {
      console.error('Error fetching note details:', error);
      Alert.alert('Error', 'Failed to load note details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNote = async () => {
    if (!note) return;

    setIsUpdating(true);
    try {
      await updateNote(note.note_id, { content: editedContent }, tokens?.accessToken || '');
      setNote({ ...note, content: editedContent });
      setIsEditing(false);
      Alert.alert('Success', 'Note updated successfully');
    } catch (error) {
      console.error('Error updating note:', error);
      Alert.alert('Error', 'Failed to update note');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert('Permission required', 'Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setIsUploadingImage(true);
        const selectedImage = result.assets[0];

        const formData = new FormData();
        formData.append('image', {
          uri: selectedImage.uri,
          type: 'image/jpeg',
          name: 'photo.jpg',
        } as any);

        try {
          // First upload the image
          const uploadResponse = await uploadImage(formData, tokens?.accessToken || '');

          if (!uploadResponse.success) {
            throw new Error('Failed to upload image');
          }

          const imageUrl = uploadResponse.imageUrl;

          // Then update the note with the new image
          const updatedPhotos = [
            ...(note?.photos || []),
            {
              photo_url: imageUrl,
              local_path: selectedImage.uri,
              display_order: (note?.photos?.length || 0) + 1,
            },
          ];

          await updateNote(parseInt(noteId), {
            photos: updatedPhotos,
          }, tokens?.accessToken || '');

          // Update local state
          setNote({
            ...note!,
            photos: updatedPhotos.map((photo, index) => ({
              photo_id: Date.now() + index, // Temporary ID
              ...photo,
            })),
          });

          Alert.alert('Success', 'Image added successfully');
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          Alert.alert('Error', 'Failed to upload image');
        } finally {
          setIsUploadingImage(false);
        }
      }
    } catch (error) {
      console.error('Error adding image:', error);
      Alert.alert('Error', 'Failed to add image');
    }
  };

  const handleDeleteImages = async () => {
    if (selectedImages.size === 0) return;

    setIsDeletingImages(true);
    try {
      const updatedPhotos = note?.photos?.filter(
        (photo) => !selectedImages.has(photo.photo_id)
      ) || [];

      await updateNote(parseInt(noteId), {
        photos: updatedPhotos,
      }, tokens?.accessToken || '');

      setNote({
        ...note!,
        photos: updatedPhotos,
      });

      setSelectedImages(new Set());
      setShowDeleteImageModal(false);
      Alert.alert('Success', 'Images deleted successfully');
    } catch (error) {
      console.error('Error deleting images:', error);
      Alert.alert('Error', 'Failed to delete images');
    } finally {
      setIsDeletingImages(false);
    }
  };

  const handleDeleteNote = () => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteNote(parseInt(noteId), tokens?.accessToken || '');
              Alert.alert('Success', 'Note deleted successfully');
              router.back();
            } catch (error) {
              console.error('Error deleting note:', error);
              Alert.alert('Error', 'Failed to delete note');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <Header
          leftContent={<TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="#0f172a" />
          </TouchableOpacity>}
          centerContent={<Text style={{ fontSize: 18, fontWeight: '600', color: '#0f172a' }}>Note Details</Text>}
        />
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!note) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <Header
          leftContent={<TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="#0f172a" />
          </TouchableOpacity>}
          centerContent={<Text style={{ fontSize: 18, fontWeight: '600', color: '#0f172a' }}>Note Details</Text>}
        />
        <View style={styles.errorContainer}>
          <Text>Note not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <Header
        leftContent={<TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>}
        centerContent={<Text style={{ fontSize: 18, fontWeight: '600', color: '#0f172a' }}>Note Details</Text>}
        rightContent={<TouchableOpacity onPress={() => setShowMenu(true)}>
          <MaterialIcons name="more-vert" size={24} color="#0f172a" />
        </TouchableOpacity>}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <ImageCarousel photos={note.photos || []} />

        <TitleSection title={note.title || 'Untitled Note'} />

        <MetadataChips
          location={locationName}
          date={new Date(note.created_at).toLocaleDateString()}
        />

        {isEditing ? (
          <EditContentSection
            value={editedContent}
            onChangeText={setEditedContent}
          />
        ) : (
          <ContentSection content={note.content} />
        )}

        {isEditing && (
          <EditButton
            onSave={handleUpdateNote}
            onCancel={() => {
              setIsEditing(false);
              setEditedContent(note.content);
            }}
            isUpdating={isUpdating}
          />
        )}

        {!isEditing && (
          <View style={styles.actionButtons}>
            <Button
              title="Edit Note"
              onPress={() => setIsEditing(true)}
              style={styles.editButton}
            />
          </View>
        )}
      </ScrollView>

      {/* Menu Modal */}
      <MenuModal
        visible={showMenu}
        onClose={() => setShowMenu(false)}
        onAddImage={handleAddImage}
        onDeleteImages={() => setShowDeleteImageModal(true)}
        onDeleteNote={handleDeleteNote}
      />

      {/* Delete Images Modal */}
      <DeleteImagesModal
        visible={showDeleteImageModal}
        photos={note.photos || []}
        selectedImages={selectedImages}
        onToggleSelect={(photoId: number) => {
          const newSelected = new Set(selectedImages);
          if (newSelected.has(photoId)) {
            newSelected.delete(photoId);
          } else {
            newSelected.add(photoId);
          }
          setSelectedImages(newSelected);
        }}
        onDelete={handleDeleteImages}
        onClose={() => setShowDeleteImageModal(false)}
        isDeleting={isDeletingImages}
      />

      {isUploadingImage && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingBox}>
            <Text style={styles.loadingText}>Uploading image...</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    marginTop: StatusBar.currentHeight || 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtons: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  editButton: {
    marginBottom: 10,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBox: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#0f172a',
  },
});

export default NoteDetailsScreen;
