export const apiOrigin = import.meta.env.VITE_API_URL;

// The API returns ".../storage" (no file name) for users without a photo.
export function imageUrl(src?: string | null) {
  if (!src || /\/storage\/?$/.test(src)) return undefined;
  return src;
}
