export function readStoredChoice<T extends string>(
  key: string,
  options: readonly T[],
  fallback: T,
): T {
  let saved: string | null = null;
  saved = window.localStorage.getItem(key);

  return (
    options.find(function (option) {
      return option === saved;
    }) ?? fallback
  );
}

export function storeChoice(key: string, value: string) {
  window.localStorage.setItem(key, value);
}
