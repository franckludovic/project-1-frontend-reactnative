import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
} from 'react-native';
import { takePicture, selectFromGallery } from '../utils/cameraUtils';

interface ImagePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onImageSelected: (uri: string | string[]) => void;
  allowMultiple?: boolean;
}

const ImagePickerModal: React.FC<ImagePickerModalProps> = ({
  visible,
  onClose,
  onImageSelected,
  allowMultiple = false,
}) => {
  const handleTakePicture = async () => {
    try {
      const result = await takePicture();
      if (result.success && result.uri) {
        onImageSelected(result.uri);
        onClose();
      } else {
        Alert.alert('Error', result.error || 'Failed to take picture');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take picture');
    }
  };

  const handleSelectFromGallery = async () => {
    try {
      const result = await selectFromGallery(allowMultiple);
      if (result.success && result.uri) {
        if (allowMultiple && result.uri.includes(',')) {
          // Multiple images selected
          const uris = result.uri.split(',');
          onImageSelected(uris);
        } else {
          // Single image
          onImageSelected(result.uri);
        }
        onClose();
      } else {
        Alert.alert('Error', result.error || 'Failed to select image');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select image');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Choose Image Source</Text>

          <TouchableOpacity style={styles.option} onPress={handleTakePicture}>
            <Text style={styles.optionText}>Take Picture</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.option} onPress={handleSelectFromGallery}>
            <Text style={styles.optionText}>Select from Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  option: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  optionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ImagePickerModal;
