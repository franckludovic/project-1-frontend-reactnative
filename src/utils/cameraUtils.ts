import * as ImagePicker from 'expo-image-picker';

export interface CameraResult {
  uri: string;
  success: boolean;
  error?: string;
}

/**
 * Opens the camera to take a picture.
 * @returns Promise<CameraResult>
 */
export const takePicture = async (): Promise<CameraResult> => {
  try {
    // Request camera permissions
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      return {
        uri: '',
        success: false,
        error: 'Camera permission not granted',
      };
    }

    // Launch camera
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      return {
        uri: result.assets[0].uri,
        success: true,
      };
    } else {
      return {
        uri: '',
        success: false,
        error: 'Picture taking was cancelled',
      };
    }
  } catch (error) {
    console.error('Error taking picture:', error);
    return {
      uri: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Opens the image library to select a picture.
 * @param allowMultiple Whether to allow multiple image selection
 * @returns Promise<CameraResult>
 */
export const selectFromGallery = async (allowMultiple: boolean = false): Promise<CameraResult> => {
  try {
    // Request media library permissions
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      return {
        uri: '',
        success: false,
        error: 'Media library permission not granted',
      };
    }

    // Launch image library
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: !allowMultiple, // Disable editing when multiple selection is enabled
      aspect: allowMultiple ? undefined : [4, 3],
      quality: 0.8,
      allowsMultipleSelection: allowMultiple,
    });

    if (!result.canceled) {
      if (allowMultiple) {
        // Return comma-separated URIs for multiple images
        const uris = result.assets.map(asset => asset.uri).join(',');
        return {
          uri: uris,
          success: true,
        };
      } else {
        return {
          uri: result.assets[0].uri,
          success: true,
        };
      }
    } else {
      return {
        uri: '',
        success: false,
        error: 'Image selection was cancelled',
      };
    }
  } catch (error) {
    console.error('Error selecting image from gallery:', error);
    return {
      uri: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Shows an action sheet to choose between camera and gallery.
 * @returns Promise<CameraResult>
 */
export const chooseImageSource = async (): Promise<CameraResult> => {
  // This would typically use ActionSheetIOS or a custom modal
  // For simplicity, we'll return a placeholder - you can implement the UI choice
  // For now, default to camera
  return await takePicture();
};
