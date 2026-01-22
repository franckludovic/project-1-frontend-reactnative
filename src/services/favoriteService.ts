import db from '../database/database';

export interface Favorite {
  fav_id?: number;
  user_id: number;
  place_id: number;
  synched?: number;
  created_at?: string;
}

export const addFavorite = (favorite: Favorite): Promise<number> => {
  try {
    const result = db.runSync(
      `INSERT INTO favorites (user_id, place_id, synched, created_at) VALUES (?, ?, ?, ?)`,
      [favorite.user_id, favorite.place_id, favorite.synched || 0, favorite.created_at]
    );
    return Promise.resolve(result.lastInsertRowId);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getFavoritesByUserId = (userId: number): Promise<Favorite[]> => {
  try {
    const favorites = db.getAllSync<Favorite>(
      `SELECT * FROM favorites WHERE user_id = ?`,
      [userId]
    );
    return Promise.resolve(favorites);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const removeFavorite = (favId: number): Promise<void> => {
  try {
    db.runSync(
      `DELETE FROM favorites WHERE fav_id = ?`,
      [favId]
    );
    return Promise.resolve();
  } catch (error) {
    return Promise.reject(error);
  }
};

export const isFavorite = (userId: number, placeId: number): Promise<boolean> => {
  try {
    const result = db.getAllSync<Favorite>(
      `SELECT * FROM favorites WHERE user_id = ? AND place_id = ?`,
      [userId, placeId]
    );
    return Promise.resolve(result.length > 0);
  } catch (error) {
    return Promise.reject(error);
  }
};
