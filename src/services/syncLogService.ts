import db from '../database/database';

export interface SyncLog {
  sync_id?: number;
  user_id: number;
  last_sync_time?: string;
  status?: string;
  message?: string;
  created_at?: string;
}

export const createSyncLog = (log: SyncLog): Promise<number> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx: any) => {
      tx.executeSql(
        `INSERT INTO sync_logs (user_id, last_sync_time, status, message, created_at) VALUES (?, ?, ?, ?, ?)`,
        [log.user_id, log.last_sync_time, log.status || 'success', log.message, log.created_at],
        (_: any, result: any) => resolve(result.insertId),
        (_: any, error: any) => reject(error)
      );
    });
  });
};

export const getSyncLogsByUserId = (userId: number): Promise<SyncLog[]> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx: any) => {
      tx.executeSql(
        `SELECT * FROM sync_logs WHERE user_id = ? ORDER BY created_at DESC`,
        [userId],
        (_: any, result: any) => {
          const logs: SyncLog[] = [];
          for (let i = 0; i < result.rows.length; i++) {
            logs.push(result.rows.item(i));
          }
          resolve(logs);
        },
        (_: any, error: any) => reject(error)
      );
    });
  });
};

export const getLastSyncLogByUserId = (userId: number): Promise<SyncLog | null> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx: any) => {
      tx.executeSql(
        `SELECT * FROM sync_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`,
        [userId],
        (_: any, result: any) => {
          if (result.rows.length > 0) {
            resolve(result.rows.item(0));
          } else {
            resolve(null);
          }
        },
        (_: any, error: any) => reject(error)
      );
    });
  });
};

export const updateSyncLog = (syncId: number, log: Partial<SyncLog>): Promise<void> => {
  return new Promise((resolve, reject) => {
    const fields: string[] = [];
    const values: any[] = [];
    if (log.last_sync_time !== undefined) { fields.push('last_sync_time = ?'); values.push(log.last_sync_time); }
    if (log.status !== undefined) { fields.push('status = ?'); values.push(log.status); }
    if (log.message !== undefined) { fields.push('message = ?'); values.push(log.message); }
    values.push(syncId);

    db.transaction((tx: any) => {
      tx.executeSql(
        `UPDATE sync_logs SET ${fields.join(', ')} WHERE sync_id = ?`,
        values,
        () => resolve(),
        (_: any, error: any) => reject(error)
      );
    });
  });
};

export const deleteSyncLog = (syncId: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx: any) => {
      tx.executeSql(
        `DELETE FROM sync_logs WHERE sync_id = ?`,
        [syncId],
        () => resolve(),
        (_: any, error: any) => reject(error)
      );
    });
  });
};
