import db from '../database/database';

export interface PlacePhoto {
  photo_id?: number;
  place_id: number;
  photo_url?: string;
  local_path?: string;
  display_order?: number;
  synched?: number;
  created_at?: string;
}

export interface NotePhoto {
  photo_id?: number;
  note_id: number;
  photo_url?: string;
  local_path?: string;
  display_order?: number;
  synched?: number;
  created_at?: string;
}

export const addPlacePhoto = (photo: PlacePhoto): Promise<number> => {
  try {
    const result = db.runSync(
      `INSERT INTO place_photos (place_id, photo_url, local_path, display_order, synched, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
      [photo.place_id, photo.photo_url, photo.local_path, photo.display_order || 0, photo.synched || 0, photo.created_at]
    );
    return Promise.resolve(result.lastInsertRowId);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getPlacePhotos = (placeId: number): Promise<PlacePhoto[]> => {
  try {
    const photos = db.getAllSync<PlacePhoto>(
      `SELECT * FROM place_photos WHERE place_id = ? ORDER BY display_order`,
      [placeId]
    );
    return Promise.resolve(photos);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const addNotePhoto = (photo: NotePhoto): Promise<number> => {
  try {
    const result = db.runSync(
      `INSERT INTO note_photos (note_id, photo_url, local_path, display_order, synched, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
      [photo.note_id, photo.photo_url, photo.local_path, photo.display_order || 0, photo.synched || 0, photo.created_at]
    );
    return Promise.resolve(result.lastInsertRowId);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getNotePhotos = (noteId: number): Promise<NotePhoto[]> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx: any) => {
      tx.executeSql(
        `SELECT * FROM note_photos WHERE note_id = ? ORDER BY display_order`,
        [noteId],
        (_: any, result: any) => {
          const photos: NotePhoto[] = [];
          for (let i = 0; i < result.rows.length; i++) {
            photos.push(result.rows.item(i));
          }
          resolve(photos);
        },
        (_: any, error: any) => reject(error)
      );
    });
  });
};

export const deletePlacePhoto = (photoId: number): Promise<void> => {
  try {
    db.runSync(
      `DELETE FROM place_photos WHERE photo_id = ?`,
      [photoId]
    );
    return Promise.resolve();
  } catch (error) {
    return Promise.reject(error);
  }
};

export const deleteNotePhoto = (photoId: number): Promise<void> => {
  try {
    db.runSync(
      `DELETE FROM note_photos WHERE photo_id = ?`,
      [photoId]
    );
    return Promise.resolve();
  } catch (error) {
    return Promise.reject(error);
  }
};
