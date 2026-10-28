import axios, { isAxiosError } from "axios";
import Cookies from "universal-cookie";
import type { MessageConfig, MessageType } from "@/components/ui/message";
import { apiOrigin } from "@/utils/api";

const TOKEN_COOKIE = "accessToken";

export function getToken() {
  return new Cookies().get<string | undefined>(TOKEN_COOKIE);
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

// Every API response wraps its payload in `data`.
export interface ApiResponse<T> {
  state?: string;
  message?: string;
  data: T;
}

export async function apiGet<T>(url: string) {
  const response = await api.get<ApiResponse<T>>(url);
  return response.data.data;
}

export async function apiPost<T = unknown>(url: string, body?: unknown) {
  const response = await api.post<ApiResponse<T>>(url, body);
  return response.data.data;
}

export type { MessageType };

export interface MessageApi {
  open: (config: MessageConfig) => void;
}

export interface LoadOptions {
  // Refresh in the background without showing a loading state.
  silent?: boolean;
}

// What every service needs to report progress and recover from an expired session.
export interface ServiceContext {
  messageApi: MessageApi;
  fetchUserData: (options?: LoadOptions) => unknown;
}

export function errorStatus(err: unknown) {
  return isAxiosError(err) ? err.response?.status : undefined;
}

// The `data` of an error response, e.g. { isBooked: true }.
export function errorData(err: unknown) {
  return isAxiosError<
    Partial<ApiResponse<Record<string, unknown>>> | undefined
  >(err)
    ? err.response?.data?.data
    : undefined;
}

// The API marks an expired or invalid token with these error names.
export type SessionError = "TokenExpiredError" | "JsonWebTokenError";

export function sessionError(err: unknown): SessionError | undefined {
  const name = errorData(err)?.name;
  return name === "TokenExpiredError" || name === "JsonWebTokenError"
    ? name
    : undefined;
}

export function notify(
  { messageApi }: Pick<ServiceContext, "messageApi">,
  type: MessageType,
  content: MessageConfig["content"],
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

export interface Socket {
  emit: (event: string, ...args: unknown[]) => unknown;
}
