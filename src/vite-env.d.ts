/// <reference types="vite/client" />

declare global {
  interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    readonly STRIPE_KEY?: string;
    readonly VITE_STRIPE_KEY?: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

declare module "currency-symbol-map" {
  function getSymbolFromCurrency(currencyCode: string): string | undefined;
  export default getSymbolFromCurrency;
}

export {};
