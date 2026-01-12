import { get, post, patch, del } from './api';

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
  const response = await get('planned-visits', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data || [];
}

export async function getPlannedVisitById(id: number, accessToken: string): Promise<PlannedVisit> {
  const response = await get(`planned-visits/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data;
}

export async function createPlannedVisit(
  plannedVisitData: CreatePlannedVisitData,
  accessToken: string
): Promise<PlannedVisit> {
  const response = await post('planned-visits', plannedVisitData, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data;
}

export async function updatePlannedVisit(
  id: number,
  updateData: UpdatePlannedVisitData,
  accessToken: string
): Promise<void> {
  await patch(`planned-visits/${id}`, updateData, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function deletePlannedVisit(id: number, accessToken: string): Promise<void> {
  await del(`planned-visits/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}
