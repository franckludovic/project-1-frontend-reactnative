import db from '../database/database';

export interface Place {
  place_id?: number;
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  image_url?: string;
  local_path?: string;
  synched?: number;
  created_at?: string;
  updated_at?: string;
  user_id?: number;
}

export const createPlace = (place: Place): Promise<number> => {
  try {
    const result = db.runSync(
      `INSERT INTO places (title, description, latitude, longitude, synched, created_at, updated_at, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        place.title,
        place.description || null,
        place.latitude,
        place.longitude,
        place.synched || 0,
        place.created_at || new Date().toISOString(),
        place.updated_at || new Date().toISOString(),
        place.user_id || null
      ]
    );
    return Promise.resolve(result.lastInsertRowId);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getAllPlaces = (): Promise<Place[]> => {
  try {
    const places = db.getAllSync<Place>(
      `SELECT * FROM places`,
      []
    );
    return Promise.resolve(places);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getPlaceById = (placeId: number): Promise<Place | null> => {
  try {
    const places = db.getAllSync<Place>(
      `SELECT * FROM places WHERE place_id = ?`,
      [placeId]
    );
    return Promise.resolve(places.length > 0 ? places[0] : null);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getPlacesByUserId = (userId: number): Promise<Place[]> => {
  try {
    const places = db.getAllSync<Place>(
      `SELECT * FROM places WHERE user_id = ?`,
      [userId]
    );
    return Promise.resolve(places);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const updatePlace = (placeId: number, place: Partial<Place>): Promise<void> => {
  try {
    const fields: string[] = [];
    const values: any[] = [];
    if (place.title !== undefined) { fields.push('title = ?'); values.push(place.title); }
    if (place.description !== undefined) { fields.push('description = ?'); values.push(place.description); }
    if (place.latitude !== undefined) { fields.push('latitude = ?'); values.push(place.latitude); }
    if (place.longitude !== undefined) { fields.push('longitude = ?'); values.push(place.longitude); }
    if (place.synched !== undefined) { fields.push('synched = ?'); values.push(place.synched); }
    if (place.updated_at !== undefined) { fields.push('updated_at = ?'); values.push(place.updated_at); }
    if (place.user_id !== undefined) { fields.push('user_id = ?'); values.push(place.user_id); }
    values.push(placeId);

    db.runSync(
      `UPDATE places SET ${fields.join(', ')} WHERE place_id = ?`,
      values
    );
    return Promise.resolve();
  } catch (error) {
    return Promise.reject(error);
  }
};

export const deletePlace = (placeId: number): Promise<void> => {
  try {
    db.runSync(
      `DELETE FROM places WHERE place_id = ?`,
      [placeId]
    );
    return Promise.resolve();
  } catch (error) {
    return Promise.reject(error);
  }
};
