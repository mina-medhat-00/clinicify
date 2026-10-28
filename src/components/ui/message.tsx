import { Check, CircleAlert, Info, Loader2 } from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cx } from "@/utils/cx";

export type MessageType = "loading" | "success" | "error" | "warning" | "info";

type ToastKey = string | number;

interface Toast {
  id: ToastKey;
  type: MessageType;
  content?: ReactNode;
}

export interface MessageConfig {
  key?: ToastKey;
  type?: MessageType;
  content?: ReactNode;
  duration?: number;
}

let toastCount = 0;

function createStore() {
  let toasts: Toast[] = [];
  const listeners = new Set<(next: Toast[]) => void>();

  function emit() {
    listeners.forEach(function (listener) {
      listener(toasts);
    });
  }

  function open(config: MessageConfig) {
    toastCount += 1;
    const id = config.key ?? `toast-${String(toastCount)}`;
    const toast: Toast = {
      id,
      type: config.type ?? "info",
      content: config.content,
    };
    toasts = toasts.filter(function (item) {
      return item.id !== id;
    });
    toasts = [...toasts, toast];
    emit();
    const duration = config.duration ?? 3;
    if (duration > 0) {
      setTimeout(function () {
        toasts = toasts.filter(function (item) {
          return item.id !== id;
        });
        emit();
      }, duration * 1000);
    }
  }

  return {
    open,
    subscribe: function (listener: (next: Toast[]) => void) {
      listeners.add(listener);
      listener(toasts);
      return function () {
        listeners.delete(listener);
      };
    },
  };
}

const staticStore = createStore();

function ToastViewport({ toasts }: { toasts: Toast[] }) {
  if (typeof document === "undefined" || !toasts.length) return null;
  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 top-3 z-50 flex flex-col items-center gap-2">
      {toasts.map(function (toast) {
        const Icon =
          toast.type === "success"
            ? Check
            : toast.type === "error"
              ? CircleAlert
              : toast.type === "loading"
                ? Loader2
                : toast.type === "warning"
                  ? CircleAlert
                  : Info;
        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex max-w-md items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm text-black/85 shadow-lg"
          >
            <Icon
              className={cx(
                "size-4 shrink-0",
                toast.type === "success" && "text-green-500",
                toast.type === "error" && "text-red-500",
                toast.type === "warning" && "text-amber-500",
                toast.type === "loading" && "animate-spin text-blue-500",
                toast.type === "info" && "text-blue-500",
              )}
            />
            <div>{toast.content}</div>
          </div>
        );
      })}
    </div>,
    document.body,
  );
}

function useToasts(store: ReturnType<typeof createStore>) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  useEffect(
    function () {
      return store.subscribe(setToasts);
    },
    [store],
  );
  return toasts;
}

function makeApi(store: ReturnType<typeof createStore>) {
  return {
    open: store.open,
    error: function (content?: ReactNode, duration?: number) {
      store.open({ type: "error", content, duration });
    },
    success: function (content?: ReactNode, duration?: number) {
      store.open({ type: "success", content, duration });
    },
    info: function (content?: ReactNode, duration?: number) {
      store.open({ type: "info", content, duration });
    },
    warning: function (content?: ReactNode, duration?: number) {
      store.open({ type: "warning", content, duration });
    },
    loading: function (content?: ReactNode, duration?: number) {
      store.open({ type: "loading", content, duration });
    },
  };
}

function useMessage(): [ReturnType<typeof makeApi>, ReactElement] {
  const [store] = useState(createStore);
  const toasts = useToasts(store);
  const api = useMemo(
    function () {
      return makeApi(store);
    },
    [store],
  );
  return [api, <ToastViewport key="holder" toasts={toasts} />];
}

function MessageRoot() {
  const toasts = useToasts(staticStore);
  return <ToastViewport toasts={toasts} />;
}

const message = {
  useMessage,
  ...makeApi(staticStore),
};

export { message, MessageRoot, useMessage };
export default message;
