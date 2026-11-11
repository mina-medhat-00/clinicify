import type { MessageConfig } from "@/types/ui";

export interface RemoteDataOptions<Q> {
  // Skip the request when nobody is signed in
  requiresAuth?: boolean;
  // Load on mount and when the query changes or omit to load manually
  autoLoad?: { query?: Q } | false;
  // Statuses meaning empty rather than an error like 400 for not found
  emptyOn?: number[];
  initialLoading?: boolean;
}

// Every API response wraps its payload in data
export interface ApiResponse<T> {
  state?: string;
  message?: string;
  data: T;
}

export interface MessageApi {
  open: (config: MessageConfig) => void;
}

export interface LoadOptions {
  // Refresh in the background without a loading state
  silent?: boolean;
}

// What every service needs to report progress and handle an expired session
export interface ServiceContext {
  messageApi: MessageApi;
  fetchUserData: (options?: LoadOptions) => unknown;
}

// Error names the API uses for an expired or invalid token
export type SessionError = "TokenExpiredError" | "JsonWebTokenError";

export interface Socket {
  emit: (event: string, ...args: unknown[]) => unknown;
}

export type QueryValue = string | number | boolean | null | undefined;
