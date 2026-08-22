/// <reference types="vite/client" />

import "react";

interface ImportMetaEnv {
  readonly STRIPE_KEY?: string;
  readonly VITE_STRIPE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "react" {
  // Type parameter must stay `T` so this merges with React's HTMLAttributes.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface HTMLAttributes<T> {
    specialty?: string;
  }
}

declare module "currency-symbol-map" {
  function getSymbolFromCurrency(currencyCode: string): string | undefined;
  export default getSymbolFromCurrency;
}
