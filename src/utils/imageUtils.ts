import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

export interface ImageUploadResult {
  localPath: string;
  success: boolean;
  error?: string;
}

/**
 * Uploads an image to the local file system for a specific table and record.
 * @param imageUri - The URI of the image to upload.
 * @param tableName - The name of the table (e.g., 'places', 'notes').
 * @param recordId - The ID of the record.
 * @param imageType - The type of image (e.g., 'main', 'photo').
 * @returns Promise<ImageUploadResult>
 */
export const uploadImageLocally = async (
  imageUri: string,
  tableName: string,
  recordId: number,
  imageType: string = 'photo'
): Promise<ImageUploadResult> => {
  try {
    // Create directory structure if it doesn't exist
    const baseDir = `${(FileSystem as any).documentDirectory}images/${tableName}/${recordId}/`;
    await FileSystem.makeDirectoryAsync(baseDir, { intermediates: true });

    // Generate unique filename
    const timestamp = Date.now();
    const extension = imageUri.split('.').pop() || 'jpg';
    const filename = `${imageType}_${timestamp}.${extension}`;
    const localPath = `${baseDir}${filename}`;

    // Copy the image to the local directory
    await FileSystem.copyAsync({
      from: imageUri,
      to: localPath,
    });

    return {
      localPath,
      success: true,
    };
  } catch (error) {
    console.error('Error uploading image locally:', error);
    return {
      localPath: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Deletes an image from the local file system.
 * @param localPath - The local path of the image to delete.
 * @returns Promise<boolean>
 */
export const deleteImageLocally = async (localPath: string): Promise<boolean> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(localPath);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(localPath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting image locally:', error);
    return false;
  }
};

/**
 * Gets the file size of an image.
 * @param localPath - The local path of the image.
 * @returns Promise<number | null> - File size in bytes, or null if error.
 */
export const getImageFileSize = async (localPath: string): Promise<number | null> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(localPath);
    return fileInfo.exists ? fileInfo.size : null;
  } catch (error) {
    console.error('Error getting image file size:', error);
    return null;
  }
};
