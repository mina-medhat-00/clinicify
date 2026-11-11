import axios, { isAxiosError } from "axios";
import Cookies from "universal-cookie";
import { apiOrigin } from "@/utils/api";
import type { ApiResponse, ServiceContext, SessionError } from "@/types/api";
import type { MessageType, MessageConfig } from "@/types/ui";

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

// Read the token at send time so it is never stale after login or logout
export const api = axios.create({ baseURL: apiOrigin, timeout: 10000 });
api.interceptors.request.use(function (config) {
  const token = getToken();
  if (token && !config.headers.Authorization)
    config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function apiGet<T>(url: string) {
  const response = await api.get<ApiResponse<T>>(url);
  return response.data.data;
}

export async function apiPost<T = unknown>(url: string, body?: unknown) {
  const response = await api.post<ApiResponse<T>>(url, body);
  return response.data.data;
}

export type { MessageType };

export function errorStatus(err: unknown) {
  return isAxiosError(err) ? err.response?.status : undefined;
}

// Error response data like isBooked
export function errorData(err: unknown) {
  return isAxiosError<
    Partial<ApiResponse<Record<string, unknown>>> | undefined
  >(err)
    ? err.response?.data?.data
    : undefined;
}

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

// 401 re-checks the user which handles the redirect and anything else shows an error toast
export function handleFailure(
  err: unknown,
  ctx: ServiceContext,
  message = "there's some issues, please try again later",
) {
  if (errorStatus(err) === 401) ctx.fetchUserData({ silent: true });
  else notify(ctx, "error", message);
}
