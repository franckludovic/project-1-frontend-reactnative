import api from './api';

export interface PlacePayload {
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  image_url?: string;
  user_id?: number;
}

export async function createPlace(payload: PlacePayload, token: string) {
  const response = await api.post('/places', payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

export async function getPlaces(token: string) {
  const response = await api.get('/places', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.data || response.data;
}

export async function getPlaceById(placeId: number, token: string) {
  const response = await api.get(`/places/${placeId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

export async function updatePlace(placeId: number, payload: Partial<PlacePayload>, token: string) {
  const response = await api.put(`/places/${placeId}`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

export async function deletePlace(placeId: number, token: string) {
  const response = await api.delete(`/places/${placeId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

export default {
  createPlace,
  getPlaces,
  getPlaceById,
  updatePlace,
  deletePlace,
};
