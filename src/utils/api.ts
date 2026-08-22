export const apiOrigin = import.meta.env.VITE_API_URL;

export function apiUrl(path = "") {
  return `${apiOrigin}${path.startsWith("/") ? path : `/${path}`}`;
}
