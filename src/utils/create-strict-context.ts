import { createContext, useContext } from "react";

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
