import api from './api';

export interface FavoritePayload {
  user_id: number;
  place_id: number;
}


export async function getFavorites(token: string) {
  const response = await api.get('/favorites', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.data || response.data;
}


export function addFavorite(payload: FavoritePayload, token: string) {
  return api.post('/favorites', payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function removeFavorite(favId: number, token: string) {
  return api.delete(`/favorites/${favId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}


export function updateFavorite(favId: number, payload: Partial<FavoritePayload>, token: string) {
  return api.put(`/favorites/${favId}`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export default {
  getFavorites,
  addFavorite,
  removeFavorite,
  updateFavorite,
};
