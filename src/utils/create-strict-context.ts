import { createContext, useContext } from "react";

// A context whose hook throws when its provider is missing, so consumers
// never have to handle a null value.
export function createStrictContext<T>(name: string) {
  const Context = createContext<T | null>(null);
  Context.displayName = name;
  function useStrictContext() {
    const value = useContext(Context);
    if (value === null) {
      throw new Error(`${name} is used outside its provider`);
    }
    return value;
  }
  return [Context, useStrictContext] as const;
}
