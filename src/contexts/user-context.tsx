import { message } from "@/components/ui";
import { jwtDecode } from "jwt-decode";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  api,
  clearToken,
  errorStatus,
  getToken,
  sessionError,
  type LoadOptions,
} from "@/services/client";
import type { AuthTokenPayload, User } from "@/types";

// setTimeout fires immediately for delays above this.
const MAX_TIMEOUT = 2 ** 31 - 1;

// The signed-in user, or null when there is no token.
async function requestUser() {
  if (!getToken()) return null;
  const { data } = await api.get("/user");
  return (data?.data ?? null) as User | null;
}

const UserData = createContext<any>(null);
export default function UserContextProvider({ children }: any) {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [tokenExpired, setTokenExpired] = useState(false);
  const [userData, setUserData] = useState<User | null>(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [messageApi, contextHolder] = message.useMessage();

  // Read inside callbacks without making them change on every navigation.
  const pathnameRef = useRef(pathname);
  const userDataRef = useRef(userData);
  const navigateRef = useRef(navigate);
  const messageApiRef = useRef(messageApi);
  useEffect(
    function () {
      pathnameRef.current = pathname;
      userDataRef.current = userData;
      navigateRef.current = navigate;
      messageApiRef.current = messageApi;
    },
    [pathname, userData, navigate, messageApi],
  );

  // The token expired: drop it, and if someone was signed in, tell them and
  // send them to login so they can come back to the same page.
  const expireSession = useCallback(function () {
    clearToken();
    if (!userDataRef.current || pathnameRef.current.includes("login")) return;
    setTokenExpired(true);
    messageApiRef.current.open({
      key: 1,
      type: "error",
      content: "your time has expired, redirecting to login page ...",
      duration: 3,
    });
    setTimeout(function () {
      setUserData(null);
      navigateRef.current(
        `/login?redirect=${encodeURIComponent(pathnameRef.current)}`,
      );
    }, 3000);
  }, []);

  // Returns true when the error meant "your session is over" and was handled.
  const handleSessionError = useCallback(
    function (err: unknown) {
      // Most protected routes answer a bad or expired token with a bare 401
      // ("Unauthenticated."), so treat any 401 like an expired session.
      const name =
        sessionError(err) ??
        (errorStatus(err) === 401 ? "TokenExpiredError" : undefined);
      if (name === "TokenExpiredError") expireSession();
      else if (name === "JsonWebTokenError") {
        clearToken();
        setUserData(null);
      }
      return Boolean(name);
    },
    [expireSession],
  );

  // Store the outcome of a /user request.
  const settleUser = useCallback(
    function (pending: Promise<User | null>) {
      return pending.then(
        function (user) {
          setUserData(user);
          setIsError(false);
          setIsLoading(false);
          return user;
        },
        function (err) {
          if (!handleSessionError(err)) {
            setIsError(true);
            setUserData(null);
          }
          setIsLoading(false);
          return null;
        },
      );
    },
    [handleSessionError],
  );

  const fetchUserData = useCallback(
    function ({ silent }: LoadOptions = {}) {
      if (!silent) setIsLoading(true);
      return settleUser(requestUser());
    },
    [settleUser],
  );

  useEffect(
    function () {
      settleUser(requestUser());
    },
    [settleUser],
  );

  // Re-check the session the moment the current token expires.
  const userId = userData?.user_id;
  useEffect(
    function () {
      const token = getToken();
      if (!userId || !token) return;
      let exp: number | undefined;
      try {
        exp = jwtDecode<AuthTokenPayload>(token).exp;
      } catch {
        return;
      }
      if (!exp) return;
      const timeId = setTimeout(
        function () {
          fetchUserData({ silent: true });
        },
        Math.min(Math.max(exp * 1000 - Date.now(), 0), MAX_TIMEOUT),
      );
      return function () {
        clearTimeout(timeId);
      };
    },
    [userId, fetchUserData],
  );

  return (
    <UserData.Provider
      value={{
        isLoading,
        userData,
        fetchUserData,
        setUserData,
        handleSessionError,
        isError,
        tokenExpired,
        messageApi,
      }}
    >
      {children}
      {contextHolder}
    </UserData.Provider>
  );
}

export function useUserContext() {
  return useContext(UserData);
}
