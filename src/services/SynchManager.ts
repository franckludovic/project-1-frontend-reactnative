import db from "../database/database";
import * as FileSystem from "expo-file-system";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../config/firebaseConfig";
import api from "../services/api";

/**
 * Upload a local file to Firebase Storage
 */
const uploadFileToFirebase = async (localUri: string, path: string) => {
  const response = await fetch(localUri);
  const blob = await response.blob();

  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, blob);

  return await getDownloadURL(storageRef);
};

/**
 * Generic sync function for a table
 */
const syncTable = async (tableName: string, uploadHandler?: (row: any) => Promise<string>) => {
  return new Promise<void>((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM ${tableName} WHERE synched = 0`,
        [],
        async (_, { rows }) => {
          for (let i = 0; i < rows.length; i++) {
            const row = rows.item(i);

            try {
              let cloudUrl: string | undefined;

              // If this table has a local_path and an upload handler, upload to Firebase
              if (uploadHandler && row.local_path) {
                cloudUrl = await uploadHandler(row);
              }

              // Update local SQLite
              db.transaction(innerTx => {
                const updates: string[] = ["synched = 1"];
                const params: any[] = [];

                if (cloudUrl) {
                  updates.push("photo_url = ?");
                  params.push(cloudUrl);
                }

                params.push(row[`${tableName.slice(0, -1)}_id`]); // e.g. place_id, note_id, etc.

                innerTx.executeSql(
                  `UPDATE ${tableName} SET ${updates.join(", ")} WHERE ${tableName.slice(0, -1)}_id = ?`,
                  params
                );
              });

              // Push metadata to backend/MySQL
              await api.post(`/${tableName}/sync`, row);
            } catch (err) {
              console.error(`Failed to sync ${tableName}`, err);
            }
          }
          resolve();
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

/**
 * Run sync for all tables with synched attribute
 */
export const runSync = async () => {
  console.log("Starting full sync...");

  // Places (may have local_path for main image)
  await syncTable("places", async row =>
    uploadFileToFirebase(row.local_path, `places/${row.place_id}/main.jpg`)
  );

  // Place Photos
  await syncTable("place_photos", async row =>
    uploadFileToFirebase(row.local_path, `places/${row.place_id}/photos/${row.photo_id}.jpg`)
  );

  // Favorites (no files, just metadata)
  await syncTable("favorites");

  // Notes
  await syncTable("notes");

  // Note Photos
  await syncTable("note_photos", async row =>
    uploadFileToFirebase(row.local_path, `notes/${row.note_id}/photos/${row.photo_id}.jpg`)
  );

  // Planned Visits
  await syncTable("planned_visits");

  console.log("Sync complete");
};
