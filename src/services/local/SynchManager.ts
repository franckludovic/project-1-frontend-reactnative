import db from "../../database/database";
import * as FileSystem from "expo-file-system";
import { supabase } from "../../config/supabaseClient";

/**
 * Upload a local file to a Supabase Storage Bucket
 */
const uploadFileToSupabase = async (localUri: string, bucketName: string, path: string): Promise<string> => {
  try {
    const response = await fetch(localUri);
    const blob = await response.blob();

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(path, blob, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) {
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(path);

    return publicUrl;
  } catch (err) {
    console.error(`Error uploading file to Supabase Storage (${bucketName}/${path}):`, err);
    throw err;
  }
};

/**
 * Generic sync function for a table using modern expo-sqlite Sync API
 */
const syncTable = async (
  tableName: string, 
  uploadHandler?: (row: any) => Promise<string>
): Promise<void> => {
  try {
    // 1. Query rows that need syncing
    const rows = db.getAllSync<any>(`SELECT * FROM ${tableName} WHERE synched = 0`);
    
    for (const row of rows) {
      const primaryKeyName = `${tableName.slice(0, -1)}_id`;
      const actualPrimaryKey = tableName === "favorites" ? "fav_id" : primaryKeyName;

      try {
        let cloudUrl: string | undefined;

        // If this table has a local_path and an upload handler, upload to Supabase Storage
        if (uploadHandler && row.local_path) {
          cloudUrl = await uploadHandler(row);
        }

        // Format correct payload matching the Supabase PostgreSQL schema
        let payload: any = {};
        if (tableName === "places") {
          payload = {
            place_id: row.place_id,
            title: row.title,
            description: row.description,
            latitude: row.latitude,
            longitude: row.longitude,
            image_url: cloudUrl || row.image_url,
            user_id: row.user_id,
            visibility: row.visibility,
            created_at: row.created_at,
            synched: 1
          };
        } else if (tableName === "place_photos") {
          payload = {
            photo_id: row.photo_id,
            place_id: row.place_id,
            photo_url: cloudUrl || row.photo_url,
            local_path: row.local_path,
            display_order: row.display_order,
            created_at: row.created_at
          };
        } else if (tableName === "favorites") {
          payload = {
            fav_id: row.fav_id,
            user_id: row.user_id,
            place_id: row.place_id,
            created_at: row.created_at,
            synched: 1
          };
        } else if (tableName === "notes") {
          payload = {
            note_id: row.note_id,
            user_id: row.user_id,
            place_id: row.place_id,
            title: row.title,
            content: row.content,
            latitude: row.latitude,
            longitude: row.longitude,
            created_at: row.created_at,
            synched: 1
          };
        } else if (tableName === "note_photos") {
          payload = {
            photo_id: row.photo_id,
            note_id: row.note_id,
            photo_url: cloudUrl || row.photo_url,
            local_path: row.local_path,
            display_order: row.display_order,
            created_at: row.created_at
          };
        } else if (tableName === "planned_visits") {
          payload = {
            planned_visit_id: row.planned_visit_id,
            user_id: row.user_id,
            place_id: row.place_id,
            planned_date: row.planned_date,
            is_completed: row.is_completed,
            created_at: row.created_at,
            synched: 1
          };
        }

        // Direct upsert to Supabase
        const { error } = await supabase
          .from(tableName)
          .upsert(payload);

        if (error) {
          throw error;
        }

        // 2. Update local SQLite to mark as synched
        const updates: string[] = ["synched = 1"];
        const params: any[] = [];

        if (cloudUrl) {
          updates.push("photo_url = ?");
          params.push(cloudUrl);
        }

        params.push(row[actualPrimaryKey]);

        db.runSync(
          `UPDATE ${tableName} SET ${updates.join(", ")} WHERE ${actualPrimaryKey} = ?`,
          params
        );

      } catch (err) {
        console.error(`Failed to sync row from ${tableName}:`, err);
      }
    }
  } catch (error) {
    console.error(`Failed to query sync rows for table ${tableName}:`, error);
  }
};

/**
 * Run sync for all tables with synched attribute
 */
export const runSync = async () => {
  console.log("Starting full sync to Supabase...");

  // 1. Places (may have local_path for main image)
  await syncTable("places", async row =>
    uploadFileToSupabase(row.local_path, 'place-media', `${row.place_id}_main.jpg`)
  );

  // 2. Place Photos
  await syncTable("place_photos", async row =>
    uploadFileToSupabase(row.local_path, 'place-media', `${row.place_id}_photos_${row.photo_id}.jpg`)
  );

  // 3. Favorites (no files, just metadata)
  await syncTable("favorites");

  // 4. Notes
  await syncTable("notes");

  // 5. Note Photos
  await syncTable("note_photos", async row =>
    uploadFileToSupabase(row.local_path, 'note-media', `${row.note_id}_photos_${row.photo_id}.jpg`)
  );

  // 6. Planned Visits
  await syncTable("planned_visits");

  console.log("Sync complete");
};
