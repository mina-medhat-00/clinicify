export const apiOrigin =
  import.meta.env.VITE_API_URL ||
  `http://${typeof window !== "undefined" ? window.location.hostname : "localhost"}:5000`;

export const apiUrl = (path = "") =>
  `${apiOrigin}${path.startsWith("/") ? path : `/${path}`}`;
