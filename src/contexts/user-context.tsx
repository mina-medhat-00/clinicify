import { message } from "@/components/ui/message";
import { jwtDecode } from "jwt-decode";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createStrictContext } from "@/utils/create-strict-context";
import {
  apiGet,
  clearToken,
  errorStatus,
  getToken,
  sessionError,
  type LoadOptions,
} from "@/services/client";
import type { AuthTokenPayload, User } from "@/types/user";

// setTimeout fires immediately for delays above this.
const MAX_TIMEOUT = 2 ** 31 - 1;

// The signed-in user, or null when there is no token.
async function requestUser() {
  if (!getToken()) return null;
  return apiGet<User | null>("/user");
}

function useUserValue() {
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
      void navigateRef.current(
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
        function (err: unknown) {
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
      void settleUser(requestUser());
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
          void fetchUserData({ silent: true });
        },
        Math.min(Math.max(exp * 1000 - Date.now(), 0), MAX_TIMEOUT),
      );
      return function () {
        clearTimeout(timeId);
      };
    },
    [userId, fetchUserData],
  );

  return {
    value: {
      isLoading,
      userData,
      fetchUserData,
      setUserData,
      handleSessionError,
      isError,
      tokenExpired,
      messageApi,
    },
    contextHolder,
  };
}

const [UserData, useUserContext] =
  createStrictContext<ReturnType<typeof useUserValue>["value"]>("UserContext");
export { useUserContext };

export default function UserContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { value, contextHolder } = useUserValue();
  return (
    <UserData.Provider value={value}>
      {children}
      {contextHolder}
    </UserData.Provider>
  );
}
