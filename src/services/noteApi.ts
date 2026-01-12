import api from './api';

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
  const response = await api.get('/notes', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data;
}

export async function getNotesByPlaceId(placeId: number, token: string): Promise<Note[]> {
  const response = await api.get(`/notes?place_id=${placeId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data || response.data;
}

export async function getNoteById(noteId: number, token: string): Promise<Note> {
  const response = await api.get(`/notes/${noteId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  // Handle different response structures - some APIs return data directly, others in data.data
  return response.data.data || response.data;
}

export async function createNote(noteData: CreateNoteData, token: string): Promise<Note> {
  const response = await api.post('/notes', noteData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data;
}

export async function updateNote(noteId: number, noteData: UpdateNoteData, token: string): Promise<Note> {
  const response = await api.put(`/notes/${noteId}`, noteData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data;
}

export async function deleteNote(noteId: number, token: string): Promise<void> {
  await api.delete(`/notes/${noteId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function uploadImage(formData: FormData, token: string): Promise<UploadImageResponse> {
  const response = await api.post('/upload', formData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export default {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  uploadImage,
};
