import { supabase } from '../../config/supabaseClient';

export interface FavoritePayload {
  user_id: number;
  place_id: number;
}

export async function getFavorites(token: string) {
  const { data, error } = await supabase
    .from('favorites')
    .select('*, place:places(*)');

  if (error) {
    throw error;
  }
  return data;
}

export async function addFavorite(payload: FavoritePayload, token: string) {
  const { data, error } = await supabase
    .from('favorites')
    .insert({
      user_id: payload.user_id,
      place_id: payload.place_id,
      synched: 1
    })
    .select()
    .single();

  if (error) {
    throw error;
  }
  return { data };
}

export async function removeFavorite(favId: number, token: string) {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('fav_id', favId);

  if (error) {
    throw error;
  }
  return { success: true };
}

export async function updateFavorite(favId: number, payload: Partial<FavoritePayload>, token: string) {
  const { data, error } = await supabase
    .from('favorites')
    .update({
      user_id: payload.user_id,
      place_id: payload.place_id,
      updated_at: new Date().toISOString()
    })
    .eq('fav_id', favId)
    .select()
    .single();

  if (error) {
    throw error;
  }
  return { data };
}

export default {
  getFavorites,
  addFavorite,
  removeFavorite,
  updateFavorite,
};
