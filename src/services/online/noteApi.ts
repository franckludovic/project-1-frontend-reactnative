import { supabase } from '../../config/supabaseClient';

export interface Note {
  note_id: number;
  user_id: number;
  place_id: number;
  title: string;
  content: string;
  latitude: number;
  longitude: number;
  created_at: string;
  updated_at: string;
  photos: Array<{
    photo_id: number;
    photo_url: string;
    local_path: string | null;
    display_order: number;
  }>;
  place?: {
    title: string;
    location: string;
  };
}

export interface CreateNoteData {
  user_id: number;
  place_id: number;
  title: string;
  content: string;
  latitude: number;
  longitude: number;
  photos?: Array<{
    photo_url: string;
    local_path?: string | null;
    display_order: number;
  }>;
}

export interface UpdateNoteData {
  title?: string;
  content?: string;
  latitude?: number;
  longitude?: number;
  photos?: Array<{
    photo_url: string;
    local_path?: string | null;
    display_order: number;
  }>;
}

export interface UploadImageResponse {
  success: boolean;
  message: string;
  imageUrl: string;
}

export async function getNotes(token: string): Promise<Note[]> {
  const { data, error } = await supabase
    .from('notes')
    .select('*, photos:note_photos(*)');

  if (error) {
    throw error;
  }
  return data as any[];
}

export async function getNotesByPlaceId(placeId: number, token: string): Promise<Note[]> {
  const { data, error } = await supabase
    .from('notes')
    .select('*, photos:note_photos(*)')
    .eq('place_id', placeId);

  if (error) {
    throw error;
  }
  return data as any[];
}

export async function getNoteById(noteId: number, token: string): Promise<Note> {
  const { data, error } = await supabase
    .from('notes')
    .select('*, photos:note_photos(*)')
    .eq('note_id', noteId)
    .single();

  if (error) {
    throw error;
  }
  return data as any;
}

export async function createNote(noteData: CreateNoteData, token: string): Promise<Note> {
  const { photos, ...noteFields } = noteData;

  // Insert the main note
  const { data: note, error: noteErr } = await supabase
    .from('notes')
    .insert({
      user_id: noteFields.user_id,
      place_id: noteFields.place_id,
      title: noteFields.title,
      content: noteFields.content,
      latitude: noteFields.latitude,
      longitude: noteFields.longitude,
      synched: 1
    })
    .select()
    .single();

  if (noteErr) {
    throw noteErr;
  }

  // Insert note photos if any
  let createdPhotos: any[] = [];
  if (photos && photos.length > 0) {
    const photoPayloads = photos.map(p => ({
      note_id: note.note_id,
      photo_url: p.photo_url,
      local_path: p.local_path || null,
      display_order: p.display_order
    }));

    const { data: photoData, error: photoErr } = await supabase
      .from('note_photos')
      .insert(photoPayloads)
      .select();

    if (photoErr) {
      throw photoErr;
    }
    createdPhotos = photoData || [];
  }

  return { ...note, photos: createdPhotos };
}

export async function updateNote(noteId: number, noteData: UpdateNoteData, token: string): Promise<Note> {
  const { photos, ...noteFields } = noteData;

  // Update note details
  const { data: note, error: noteErr } = await supabase
    .from('notes')
    .update({
      title: noteFields.title,
      content: noteFields.content,
      latitude: noteFields.latitude,
      longitude: noteFields.longitude,
      updated_at: new Date().toISOString()
    })
    .eq('note_id', noteId)
    .select()
    .single();

  if (noteErr) {
    throw noteErr;
  }

  // Fetch current note photos
  const { data: photoData, error: photoErr } = await supabase
    .from('note_photos')
    .select('*')
    .eq('note_id', noteId);

  if (photoErr) {
    throw photoErr;
  }

  return { ...note, photos: photoData || [] };
}

export async function deleteNote(noteId: number, token: string): Promise<void> {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('note_id', noteId);

  if (error) {
    throw error;
  }
}

export async function uploadImage(formData: FormData, token: string): Promise<UploadImageResponse> {
  try {
    const fileEntry: any = formData.get('image') || formData.get('file');
    if (!fileEntry) {
      throw new Error('No image file found in payload');
    }

    const uniquePath = `notes/upload_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;

    // Supabase upload
    const { data, error } = await supabase.storage
      .from('note-media')
      .upload(uniquePath, fileEntry, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) {
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('note-media')
      .getPublicUrl(uniquePath);

    return {
      success: true,
      message: 'Image uploaded successfully to Supabase Storage',
      imageUrl: publicUrl,
    };
  } catch (err: any) {
    console.error('Error inside noteApi.uploadImage:', err);
    return {
      success: false,
      message: err.message || 'Image upload failed',
      imageUrl: '',
    };
  }
}

export default {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  uploadImage,
};
