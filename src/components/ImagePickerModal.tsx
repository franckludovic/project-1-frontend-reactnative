import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { takePicture, selectFromGallery, recordVideo } from '../utils/cameraUtils';

const { width } = Dimensions.get('window');

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
  const [rememberChoice, setRememberChoice] = useState(false);

  const handleTakePicture = async () => {
    try {
      const result = await takePicture();
      if (result.success && result.uri) {
        onImageSelected(result.uri);
        onClose();
      } else {
        if (result.error && result.error !== 'Picture taking was cancelled') {
          Alert.alert('Error', result.error || 'Failed to take picture');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take picture');
    }
  };

  const handleRecordVideo = async () => {
    try {
      const result = await recordVideo();
      if (result.success && result.uri) {
        onImageSelected(result.uri);
        onClose();
      } else {
        if (result.error && result.error !== 'Video recording was cancelled') {
          Alert.alert('Error', result.error || 'Failed to record video');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to record video');
    }
  };

  const handleSelectFromGallery = async () => {
    try {
      const result = await selectFromGallery(allowMultiple);
      if (result.success && result.uri) {
        if (allowMultiple && result.uri.includes(',')) {
          // Multiple items selected
          const uris = result.uri.split(',');
          onImageSelected(uris);
        } else {
          // Single item
          onImageSelected(result.uri);
        }
        onClose();
      } else {
        if (result.error && result.error !== 'Image selection was cancelled') {
          Alert.alert('Error', result.error || 'Failed to select media');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select media');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header Row */}
          <View style={styles.header}>
            <Text style={styles.title}>Source from</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.7}>
              <Ionicons name="close" size={22} color="#111718" />
            </TouchableOpacity>
          </View>
          <View style={styles.divider} />

          {/* Option Card: Take Photo */}
          <TouchableOpacity style={styles.optionCard} onPress={handleTakePicture} activeOpacity={0.85}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="camera-aperture" size={22} color="#FF5A36" />
            </View>
            <Text style={styles.optionText}>Take Photo</Text>
          </TouchableOpacity>

          {/* Option Card: Record Video */}
          <TouchableOpacity style={styles.optionCard} onPress={handleRecordVideo} activeOpacity={0.85}>
            <View style={styles.iconCircle}>
              <Ionicons name="videocam" size={22} color="#FF5A36" />
            </View>
            <Text style={styles.optionText}>Record Video</Text>
          </TouchableOpacity>

          {/* Option Card: Choose from Gallery */}
          <TouchableOpacity style={styles.optionCard} onPress={handleSelectFromGallery} activeOpacity={0.85}>
            <View style={styles.iconCircle}>
              <Ionicons name="image" size={22} color="#FF5A36" />
            </View>
            <Text style={styles.optionText}>Choose from Gallery</Text>
          </TouchableOpacity>

          {/* Remember Choice Checkbox */}
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setRememberChoice(!rememberChoice)}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, rememberChoice && styles.checkboxChecked]}>
              {rememberChoice && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
            </View>
            <Text style={styles.checkboxLabel}>Remember my choice for this post</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)', // beautiful dark soft overlay
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    width: width * 0.85,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111718',
    letterSpacing: -0.3,
  },
  closeButton: {
    padding: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0ECE8',
    width: '100%',
    marginBottom: 16,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF8F7',
    borderWidth: 1,
    borderColor: '#F0ECE8',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    gap: 14,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFF0EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3C302E',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: 4,
    gap: 10,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#FFD4C9', // light pinkish peach border matching mockup
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#FF5A36',
    borderColor: '#FF5A36',
  },
  checkboxLabel: {
    fontSize: 12,
    color: '#5C4E4D',
    fontWeight: '600',
  },
});

export default ImagePickerModal;
