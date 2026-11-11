export const apiOrigin = import.meta.env.VITE_API_URL;

export function imageUrl(src?: string | null) {
  if (!src || /\/storage\/?$/.test(src)) return undefined;
  return src;
}
