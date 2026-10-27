type QueryValue = string | number | boolean | null | undefined;

// Builds "?a=1&b=2" from an object, skipping empty values and encoding the rest.
export function toQuery(params?: Record<string, QueryValue> | null) {
  if (!params) return "";
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (
      value === undefined ||
      value === null ||
      value === "" ||
      value === false
    )
      continue;
    search.append(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}
