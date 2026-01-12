import api from './api';

export interface Place {
  place_id: number;
  user_id: number;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
  is_favorite?: number;
}

export async function getPlaceById(placeId: number, token?: string): Promise<Place> {
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const response = await api.get(`/places/${placeId}`, { headers });
  return response.data.data || response.data;
}

export async function getPlacesByUser(token: string): Promise<Place[]> {
  const response = await api.get('/places/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function createPlace(
  placeData: {
    title: string;
    description?: string;
    latitude: number;
    longitude: number;
    image_url?: string;
  },
  token: string
): Promise<Place> {
  const response = await api.post('/places', placeData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function updatePlace(
  placeId: number,
  placeData: Partial<{
    title: string;
    description: string;
    latitude: number;
    longitude: number;
    image_url: string;
  }>,
  token: string
): Promise<Place> {
  const response = await api.put(`/places/${placeId}`, placeData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function deletePlace(placeId: number, token: string): Promise<void> {
  await api.delete(`/places/${placeId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
