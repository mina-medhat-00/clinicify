// The tab saved under `key`, if it is still one of `options`.
export function readStoredChoice<T extends string>(
  key: string,
  options: readonly T[],
  fallback: T,
): T {
  let saved: string | null = null;
  try {
    saved = window.localStorage.getItem(key);
  } catch {
    // Storage can be blocked (private mode); use the default tab.
  }
  return (
    options.find(function (option) {
      return option === saved;
    }) ?? fallback
  );
}

export function storeChoice(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage can be blocked (private mode); the choice just isn't kept.
  }
}
