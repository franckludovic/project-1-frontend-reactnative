import db from '../database/database';

export interface Note {
  note_id?: number;
  user_id: number;
  place_id: number;
  title?: string;
  content?: string;
  latitude?: number;
  longitude?: number;
  synched?: number;
  created_at?: string;
  updated_at?: string;
}

export const createNote = (note: Note): Promise<number> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx: any) => {
      tx.executeSql(
        `INSERT INTO notes (user_id, place_id, title, content, latitude, longitude, synched, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [note.user_id, note.place_id, note.title, note.content, note.latitude, note.longitude, note.synched || 0, note.created_at, note.updated_at],
        (_: any, result: any) => resolve(result.insertId),
        (_: any, error: any) => reject(error)
      );
    });
  });
};

export const getNotesByUserId = (userId: number): Promise<Note[]> => {
  try {
    const notes = db.getAllSync<Note>(
      `SELECT * FROM notes WHERE user_id = ?`,
      [userId]
    );
    return Promise.resolve(notes);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getNotesByPlaceId = (placeId: number): Promise<Note[]> => {
  try {
    const notes = db.getAllSync<Note>(
      `SELECT * FROM notes WHERE place_id = ?`,
      [placeId]
    );
    return Promise.resolve(notes);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const updateNote = (noteId: number, note: Partial<Note>): Promise<void> => {
  try {
    const fields: string[] = [];
    const values: any[] = [];
    if (note.title !== undefined) { fields.push('title = ?'); values.push(note.title); }
    if (note.content !== undefined) { fields.push('content = ?'); values.push(note.content); }
    if (note.latitude !== undefined) { fields.push('latitude = ?'); values.push(note.latitude); }
    if (note.longitude !== undefined) { fields.push('longitude = ?'); values.push(note.longitude); }
    if (note.synched !== undefined) { fields.push('synched = ?'); values.push(note.synched); }
    if (note.updated_at !== undefined) { fields.push('updated_at = ?'); values.push(note.updated_at); }
    values.push(noteId);

    db.runSync(
      `UPDATE notes SET ${fields.join(', ')} WHERE note_id = ?`,
      values
    );
    return Promise.resolve();
  } catch (error) {
    return Promise.reject(error);
  }
};

export const deleteNote = (noteId: number): Promise<void> => {
  try {
    db.runSync(
      `DELETE FROM notes WHERE note_id = ?`,
      [noteId]
    );
    return Promise.resolve();
  } catch (error) {
    return Promise.reject(error);
  }
};
