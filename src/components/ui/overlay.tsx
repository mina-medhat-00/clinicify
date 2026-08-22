import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cx } from "@/components/ui/cx";

const placementClass: Record<string, string> = {
  top: "bottom-full left-1/2 mb-2 -translate-x-1/2",
  topLeft: "bottom-full left-0 mb-2",
  bottom: "top-full left-1/2 mt-2 -translate-x-1/2",
  bottomLeft: "top-full left-0 mt-2",
  right: "left-full top-1/2 ml-2 -translate-y-1/2",
  left: "right-full top-1/2 mr-2 -translate-y-1/2",
};

const namedColors: Record<string, string> = {
  green: "bg-green-600 text-white",
  red: "bg-red-600 text-white",
  cyan: "bg-cyan-700 text-white",
  gold: "bg-amber-500 text-white",
};

function Popover({
  children,
  content,
  trigger = "hover",
  open,
  placement = "top",
  color,
  className,
}: any) {
  const [internal, setInternal] = useState(false);
  const disabled = Array.isArray(trigger) && trigger.length === 0;
  const isClick = trigger === "click";
  const shown =
    open === false || disabled ? false : open === true ? true : internal;
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(
    function () {
      if (!isClick) return;
      function onDoc(event: MouseEvent) {
        if (!rootRef.current?.contains(event.target as Node)) {
          setInternal(false);
        }
      }
      document.addEventListener("mousedown", onDoc);
      return function () {
        document.removeEventListener("mousedown", onDoc);
      };
    },
    [isClick],
  );

  return (
    <div
      ref={rootRef}
      className="relative inline-flex"
      onMouseEnter={function () {
        if (!isClick && !disabled && open !== false) setInternal(true);
      }}
      onMouseLeave={function () {
        if (!isClick && !disabled && open !== true) setInternal(false);
      }}
    >
      <div
        onClick={function () {
          if (isClick && !disabled && open !== false) {
            setInternal(function (value) {
              return !value;
            });
          }
        }}
      >
        {children}
      </div>
      {shown ? (
        <div
          className={cx(
            "absolute z-40 whitespace-nowrap rounded-md px-3 py-1.5 text-sm shadow-lg",
            namedColors[color] || "bg-white text-black/85",
            placementClass[placement] || placementClass.top,
            className,
          )}
        >
          {content}
        </div>
      ) : null}
    </div>
  );
}

function Drawer({
  open,
  onClose,
  title,
  placement = "right",
  closable = true,
  className,
  classNames,
  children,
}: any) {
  if (!open) return null;
  const fromLeft = placement === "left";
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className={cx(
          "absolute top-0 flex h-full flex-col bg-white shadow-xl",
          fromLeft ? "left-0" : "right-0",
          classNames?.wrapper || "w-full max-w-md",
          className,
        )}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <div className="font-medium">{title}</div>
          {closable ? (
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-gray-500"
            >
              <X className="size-5" />
            </button>
          ) : null}
        </div>
        <div
          className={cx("min-h-0 flex-1 overflow-auto p-4", classNames?.body)}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export { Drawer, Popover };
