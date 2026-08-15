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
  interface HTMLAttributes<T> {
    specialty?: string;
  }
}
