import { supabase } from '../../config/supabaseClient';

export interface PlannedVisit {
  planned_visit_id?: number;
  user_id: number;
  place_id: number;
  planned_date?: string;
  is_completed: number;
  created_at?: string;
  updated_at?: string;
  title?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  image_url?: string;
}

export interface CreatePlannedVisitData {
  place_id: number;
  planned_date?: string;
  is_completed?: number;
}

export interface UpdatePlannedVisitData {
  planned_date?: string;
  is_completed?: number;
}

export async function getUserPlannedVisits(accessToken: string): Promise<PlannedVisit[]> {
  const { data, error } = await supabase
    .from('planned_visits')
    .select('*, place:places(*)');

  if (error) {
    throw error;
  }

  // Flatten nested joint place data to keep absolute compatibility with the screens' expectations
  return (data || []).map(row => {
    const { place, ...visit } = row as any;
    return {
      ...visit,
      title: place?.title || '',
      description: place?.description || '',
      latitude: place?.latitude || 0,
      longitude: place?.longitude || 0,
      image_url: place?.image_url || '',
    };
  });
}

export async function getPlannedVisitById(id: number, accessToken: string): Promise<PlannedVisit> {
  const { data, error } = await supabase
    .from('planned_visits')
    .select('*, place:places(*)')
    .eq('planned_visit_id', id)
    .single();

  if (error) {
    throw error;
  }

  const { place, ...visit } = data as any;
  return {
    ...visit,
    title: place?.title || '',
    description: place?.description || '',
    latitude: place?.latitude || 0,
    longitude: place?.longitude || 0,
    image_url: place?.image_url || '',
  };
}

export async function createPlannedVisit(
  plannedVisitData: CreatePlannedVisitData,
  accessToken: string
): Promise<PlannedVisit> {
  // Retrieve user session to fetch their user_id
  const { data: { session } } = await supabase.auth.getSession();
  const userEmail = session?.user?.email;

  // Try to resolve sequential user_id from public.users table
  let resolvedUserId = 0;
  if (userEmail) {
    const { data: userRecord } = await supabase
      .from('users')
      .select('user_id')
      .eq('email', userEmail)
      .maybeSingle();
    if (userRecord) {
      resolvedUserId = userRecord.user_id;
    }
  }

  const { data, error } = await supabase
    .from('planned_visits')
    .insert({
      place_id: plannedVisitData.place_id,
      planned_date: plannedVisitData.planned_date,
      is_completed: plannedVisitData.is_completed || 0,
      user_id: resolvedUserId,
      synched: 1
    })
    .select()
    .single();

  if (error) {
    throw error;
  }
  return data as any;
}

export async function updatePlannedVisit(
  id: number,
  updateData: UpdatePlannedVisitData,
  accessToken: string
): Promise<void> {
  const { error } = await supabase
    .from('planned_visits')
    .update({
      planned_date: updateData.planned_date,
      is_completed: updateData.is_completed,
      updated_at: new Date().toISOString()
    })
    .eq('planned_visit_id', id);

  if (error) {
    throw error;
  }
}

export async function deletePlannedVisit(id: number, accessToken: string): Promise<void> {
  const { error } = await supabase
    .from('planned_visits')
    .delete()
    .eq('planned_visit_id', id);

  if (error) {
    throw error;
  }
}

export default {
  getUserPlannedVisits,
  getPlannedVisitById,
  createPlannedVisit,
  updatePlannedVisit,
  deletePlannedVisit,
};
