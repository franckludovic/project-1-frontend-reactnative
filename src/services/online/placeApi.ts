import { supabase } from '../../config/supabaseClient';

export interface PlacePayload {
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  image_url?: string;
  user_id?: number;
  visibility?: 'private' | 'public';
}

export async function createPlace(payload: PlacePayload, token: string) {
  const { data, error } = await supabase
    .from('places')
    .insert({
      title: payload.title,
      description: payload.description,
      latitude: payload.latitude,
      longitude: payload.longitude,
      image_url: payload.image_url,
      user_id: payload.user_id,
      visibility: payload.visibility || 'private',
      synched: 1
    })
    .select()
    .single();

  if (error) {
    throw error;
  }
  return data;
}

export async function getPlaces(token: string, coords?: { latitude: number; longitude: number }) {
  if (coords) {
    // If coords are provided, trigger the PostgreSQL database function (RPC)
    // which calculates geodistances on the server using coordinate math.
    const { data, error } = await supabase.rpc('get_nearby_public_places', {
      lng: coords.longitude,
      lat: coords.latitude,
    });

    if (error) {
      throw error;
    }
    return data;
  }

  // Fetch standard feed
  const { data, error } = await supabase
    .from('places')
    .select('*, photos:place_photos(*)');

  if (error) {
    throw error;
  }
  return data;
}

export async function getPlaceById(placeId: number, token: string) {
  const { data, error } = await supabase
    .from('places')
    .select('*, photos:place_photos(*)')
    .eq('place_id', placeId)
    .single();

  if (error) {
    throw error;
  }
  return data;
}

export async function updatePlace(placeId: number, payload: Partial<PlacePayload>, token: string) {
  const { data, error } = await supabase
    .from('places')
    .update({
      title: payload.title,
      description: payload.description,
      latitude: payload.latitude,
      longitude: payload.longitude,
      image_url: payload.image_url,
      visibility: payload.visibility,
      updated_at: new Date().toISOString()
    })
    .eq('place_id', placeId)
    .select()
    .single();

  if (error) {
    throw error;
  }
  return data;
}

export async function deletePlace(placeId: number, token: string) {
  const { error } = await supabase
    .from('places')
    .delete()
    .eq('place_id', placeId);

  if (error) {
    throw error;
  }
  return { success: true };
}

export default {
  createPlace,
  getPlaces,
  getPlaceById,
  updatePlace,
  deletePlace,
};
