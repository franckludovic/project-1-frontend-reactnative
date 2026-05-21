import db from '../../database/database';

export interface PlaceVideo {
  video_id?: number;
  place_id: number;
  video_url: string;
  thumbnail_url?: string;
  duration?: number;
  display_order?: number;
  synched?: number;
  created_at?: string;
}

export const addPlaceVideo = (video: PlaceVideo): Promise<number> => {
  try {
    const result = db.runSync(
      `INSERT INTO place_videos (place_id, video_url, thumbnail_url, duration, display_order, synched, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [video.place_id, video.video_url, video.thumbnail_url || null, video.duration || 0, video.display_order || 0, video.synched || 0, video.created_at || new Date().toISOString()]
    );
    return Promise.resolve(result.lastInsertRowId);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getPlaceVideos = (placeId: number): Promise<PlaceVideo[]> => {
  try {
    const videos = db.getAllSync<PlaceVideo>(
      `SELECT * FROM place_videos WHERE place_id = ? ORDER BY display_order`,
      [placeId]
    );
    return Promise.resolve(videos);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const deletePlaceVideo = (videoId: number): Promise<void> => {
  try {
    db.runSync(
      `DELETE FROM place_videos WHERE video_id = ?`,
      [videoId]
    );
    return Promise.resolve();
  } catch (error) {
    return Promise.reject(error);
  }
};
