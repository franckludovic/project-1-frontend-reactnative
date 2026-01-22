import db from '../database/database';

export interface PlannedVisit {
  planned_visit_id?: number;
  user_id: number;
  place_id: number;
  planned_date?: string;
  synched?: number;
  is_completed?: number;
  created_at?: string;
  updated_at?: string;
}

export const createPlannedVisit = (visit: PlannedVisit): Promise<number> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx: any) => {
      tx.executeSql(
        `INSERT INTO planned_visits (user_id, place_id, planned_date, synched, is_completed, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [visit.user_id, visit.place_id, visit.planned_date, visit.synched || 0, visit.is_completed || 0, visit.created_at, visit.updated_at],
        (_: any, result: any) => resolve(result.insertId),
        (_: any, error: any) => reject(error)
      );
    });
  });
};

export const getPlannedVisitsByUserId = (userId: number): Promise<PlannedVisit[]> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx: any) => {
      tx.executeSql(
        `SELECT * FROM planned_visits WHERE user_id = ?`,
        [userId],
        (_: any, result: any) => {
          const visits: PlannedVisit[] = [];
          for (let i = 0; i < result.rows.length; i++) {
            visits.push(result.rows.item(i));
          }
          resolve(visits);
        },
        (_: any, error: any) => reject(error)
      );
    });
  });
};

export const getPlannedVisitsByPlaceId = (placeId: number): Promise<PlannedVisit[]> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx: any) => {
      tx.executeSql(
        `SELECT * FROM planned_visits WHERE place_id = ?`,
        [placeId],
        (_: any, result: any) => {
          const visits: PlannedVisit[] = [];
          for (let i = 0; i < result.rows.length; i++) {
            visits.push(result.rows.item(i));
          }
          resolve(visits);
        },
        (_: any, error: any) => reject(error)
      );
    });
  });
};

export const updatePlannedVisit = (visitId: number, visit: Partial<PlannedVisit>): Promise<void> => {
  return new Promise((resolve, reject) => {
    const fields: string[] = [];
    const values: any[] = [];
    if (visit.planned_date !== undefined) { fields.push('planned_date = ?'); values.push(visit.planned_date); }
    if (visit.synched !== undefined) { fields.push('synched = ?'); values.push(visit.synched); }
    if (visit.is_completed !== undefined) { fields.push('is_completed = ?'); values.push(visit.is_completed); }
    if (visit.updated_at !== undefined) { fields.push('updated_at = ?'); values.push(visit.updated_at); }
    values.push(visitId);

    db.transaction((tx: any) => {
      tx.executeSql(
        `UPDATE planned_visits SET ${fields.join(', ')} WHERE planned_visit_id = ?`,
        values,
        () => resolve(),
        (_: any, error: any) => reject(error)
      );
    });
  });
};

export const deletePlannedVisit = (visitId: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx: any) => {
      tx.executeSql(
        `DELETE FROM planned_visits WHERE planned_visit_id = ?`,
        [visitId],
        () => resolve(),
        (_: any, error: any) => reject(error)
      );
    });
  });
};
