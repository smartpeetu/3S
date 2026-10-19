import { supabase } from "./supabase.js";

export const PHOTOS_BUCKET = "team-member-photos";

/**
 * Extracts the storage object path relative to the bucket from a given photo URL or path.
 */
export function getStoragePathFromPhotoUrl(photoUrl, bucketName = PHOTOS_BUCKET) {
  if (!photoUrl || typeof photoUrl !== "string") {
    return null;
  }

  try {
    const cleanUrl = photoUrl.split(/[?#]/)[0].trim();
    if (!cleanUrl) return null;

    const decodedUrl = decodeURIComponent(cleanUrl);

    const bucketMarker = `${bucketName}/`;
    const markerIndex = decodedUrl.indexOf(bucketMarker);
    if (markerIndex !== -1) {
      const extractedPath = decodedUrl.substring(markerIndex + bucketMarker.length).trim();
      return extractedPath || null;
    }

    if (decodedUrl.startsWith("team-members/")) {
      return decodedUrl;
    }

    const normalized = decodedUrl.replace(/^\/+/, "");
    if (normalized.startsWith(bucketMarker)) {
      return normalized.substring(bucketMarker.length).trim() || null;
    }

    return null;
  } catch (err) {
    console.error("Error extracting storage path from photo URL:", err);
    return null;
  }
}

/**
 * Deletes a photo from the Supabase Storage bucket.
 * If excludeMemberId is provided, checks if another team member also references
 * this exact photo URL before deleting, preventing accidental deletion of shared assets.
 */
export async function deletePhotoFromStorage(photoUrl, excludeMemberId = null) {
  const storagePath = getStoragePathFromPhotoUrl(photoUrl);
  if (!storagePath) {
    return { success: true, deleted: false, storagePath: null };
  }

  try {
    if (excludeMemberId && photoUrl) {
      const { data: sharedMembers, error: checkError } = await supabase
        .from("team_members")
        .select("id")
        .eq("photo_url", photoUrl)
        .neq("id", excludeMemberId)
        .limit(1);

      if (!checkError && sharedMembers && sharedMembers.length > 0) {
        return {
          success: true,
          deleted: false,
          isShared: true,
          storagePath,
        };
      }
    }

    const { data, error } = await supabase.storage
      .from(PHOTOS_BUCKET)
      .remove([storagePath]);

    if (error) {
      console.error("Supabase storage remove failed:", error);
      return { success: false, deleted: false, error, storagePath };
    }

    return { success: true, deleted: true, data, storagePath };
  } catch (err) {
    console.error("Exception during storage delete:", err);
    return { success: false, deleted: false, error: err, storagePath };
  }
}