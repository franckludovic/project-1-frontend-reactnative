import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface Photo {
  photo_id: number;
  photo_url: string;
  local_path: string | null;
  display_order: number;
}

interface DeleteImagesModalProps {
  visible: boolean;
  photos: Photo[];
  selectedImages: Set<number>;
  onToggleSelect: (photoId: number) => void;
  onDelete: () => void;
  onClose: () => void;
  isDeleting: boolean;
}

const DeleteImagesModal: React.FC<DeleteImagesModalProps> = ({
  visible,
  photos,
  selectedImages,
  onToggleSelect,
  onDelete,
  onClose,
  isDeleting,
}) => {
  const handleDelete = () => {
    if (selectedImages.size === 0) {
      Alert.alert('No images selected', 'Please select at least one image to delete.');
      return;
    }

    Alert.alert(
      'Delete Images',
      `Are you sure you want to delete ${selectedImages.size} image(s)? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: onDelete,
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.deleteModalContainer}>
          <Text style={styles.deleteModalTitle}>Select Images to Delete</Text>

          <ScrollView style={styles.imagesScrollView}>
            {photos.map((photo) => (
              <TouchableOpacity
                key={photo.photo_id}
                style={[
                  styles.imageItem,
                  selectedImages.has(photo.photo_id) && styles.selectedImageItem,
                ]}
                onPress={() => onToggleSelect(photo.photo_id)}
              >
                <View style={styles.imageThumbnail}>
                  <MaterialIcons
                    name={selectedImages.has(photo.photo_id) ? 'check-circle' : 'radio-button-unchecked'}
                    size={20}
                    color={selectedImages.has(photo.photo_id) ? '#3b82f6' : '#64748b'}
                  />
                </View>
                <View style={styles.imageInfo}>
                  <Text style={styles.imageName}>Image {photo.display_order}</Text>
                  <Text style={styles.imageDate}>
                    ID: {photo.photo_id}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.deleteModalActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={isDeleting}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.deleteButton,
                selectedImages.size === 0 && styles.disabledButton,
              ]}
              onPress={handleDelete}
              disabled={selectedImages.size === 0 || isDeleting}
            >
              <Text style={styles.deleteButtonText}>
                {isDeleting ? 'Deleting...' : `Delete (${selectedImages.size})`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  deleteModalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    maxHeight: '70%',
  },
  deleteModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 16,
  },
  imagesScrollView: {
    maxHeight: 300,
    marginBottom: 16,
  },
  imageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f8f7f6',
    marginBottom: 8,
  },
  selectedImageItem: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
    borderWidth: 1,
  },
  imageThumbnail: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  imageInfo: {
    flex: 1,
  },
  imageName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0f172a',
  },
  imageDate: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  deleteModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    height: 44,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
  },
  deleteButton: {
    flex: 1,
    height: 44,
    backgroundColor: '#dc2626',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#fca5a5',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default DeleteImagesModal;
