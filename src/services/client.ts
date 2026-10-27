import axios, { isAxiosError } from "axios";
import type { ReactNode } from "react";
import Cookies from "universal-cookie";
import { apiOrigin } from "@/utils/api";

const TOKEN_COOKIE = "accessToken";

export function getToken(): string | undefined {
  return new Cookies().get(TOKEN_COOKIE);
}

export function setToken(token: string) {
  new Cookies().set(TOKEN_COOKIE, token, { path: "/" });
}

export function clearToken() {
  new Cookies().remove(TOKEN_COOKIE, { path: "/" });
}

// Every request carries the current session token, read at send time so it
// is never stale after login or logout.
export const api = axios.create({ baseURL: apiOrigin, timeout: 10000 });
api.interceptors.request.use(function (config) {
  const token = getToken();
  if (token && !config.headers.Authorization)
    config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export type MessageType = "loading" | "success" | "error" | "warning" | "info";

export type MessageApi = {
  open(config: {
    key?: string | number;
    type?: MessageType;
    content?: ReactNode;
    duration?: number;
  }): void;
};

export type LoadOptions = {
  // Refresh in the background without showing a loading state.
  silent?: boolean;
};

// What every service needs to report progress and recover from an expired session.
export type ServiceContext = {
  messageApi: MessageApi;
  fetchUserData: (options?: LoadOptions) => unknown;
};

export function errorStatus(err: unknown) {
  return isAxiosError(err) ? err.response?.status : undefined;
}

export function errorData<T = Record<string, unknown>>(err: unknown) {
  return isAxiosError(err)
    ? (err.response?.data?.data as T | undefined)
    : undefined;
}

// The API marks an expired or invalid token with these error names.
export type SessionError = "TokenExpiredError" | "JsonWebTokenError";

export function sessionError(err: unknown): SessionError | undefined {
  const name = errorData<{ name?: string }>(err)?.name;
  return name === "TokenExpiredError" || name === "JsonWebTokenError"
    ? name
    : undefined;
}

export function notify(
  { messageApi }: Pick<ServiceContext, "messageApi">,
  type: MessageType,
  content: ReactNode,
  duration = 3,
) {
  messageApi.open({ key: 1, type, content, duration });
}

// 401 means the session ended: re-check the user, which handles the redirect.
// Anything else gets a generic error toast.
export function handleFailure(
  err: unknown,
  ctx: ServiceContext,
  message = "there's some issues, please try again later",
) {
  if (errorStatus(err) === 401) ctx.fetchUserData({ silent: true });
  else notify(ctx, "error", message);
}

export type Socket = {
  emit(event: string, ...args: unknown[]): unknown;
};
