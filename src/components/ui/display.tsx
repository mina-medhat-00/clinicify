import { Inbox, Pencil, Star, X } from "lucide-react";
import { useState } from "react";
import SkeletonLib from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { cx } from "@/components/ui/cx";

const avatarSize = {
  small: 24,
  default: 32,
  large: 40,
};

function Avatar({
  src,
  size = "default",
  shape = "circle",
  icon,
  children,
  className,
  alt,
  ...props
}: any) {
  const [failed, setFailed] = useState(false);
  const px =
    typeof size === "number" ? size : avatarSize[size] || avatarSize.default;
  const showImg = src && !failed;
  return (
    <span
      className={cx(
        "inline-flex items-center justify-center overflow-hidden bg-gray-300 text-white",
        shape === "square" ? "rounded-md" : "rounded-full",
        className,
      )}
      style={{ width: px, height: px, fontSize: px * 0.45 }}
      {...props}
    >
      {showImg ? (
        <img
          src={src}
          alt={alt || ""}
          className="size-full object-cover"
          onError={function () {
            setFailed(true);
          }}
        />
      ) : (
        icon || children || null
      )}
    </span>
  );
}

function Empty({ description, className, children }: any) {
  return (
    <div
      className={cx(
        "flex flex-col items-center justify-center gap-2 py-8 text-gray-400",
        className,
      )}
    >
      <Inbox className="size-16" />
      <div>{description ?? "No data"}</div>
      {children}
    </div>
  );
}

const tagColors: Record<string, string> = {
  blue: "bg-blue-100 text-blue-700",
  red: "bg-red-100 text-red-700",
  gold: "bg-amber-100 text-amber-700",
  green: "bg-green-100 text-green-700",
  cyan: "bg-cyan-100 text-cyan-700",
};

function Tag({ color, className, children }: any) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded px-2 py-0.5 text-sm font-medium",
        tagColors[color] || "bg-gray-100 text-gray-700",
        className,
      )}
    >
      {children}
    </span>
  );
}

function Alert({ description, closable, className, type = "error" }: any) {
  const [closed, setClosed] = useState(false);
  if (closed) return null;
  const closeIcon = closable?.closeIcon;
  return (
    <div
      className={cx(
        "relative flex items-start gap-2 rounded-md border px-3 py-2",
        type === "error" && "border-red-200 bg-red-50 text-red-700",
        type === "warning" && "border-amber-200 bg-amber-50 text-amber-800",
        type === "success" && "border-green-200 bg-green-50 text-green-700",
        type === "info" && "border-blue-200 bg-blue-50 text-blue-700",
        className,
      )}
    >
      <div className="grow">{description}</div>
      {closable ? (
        <button
          type="button"
          className="shrink-0"
          onClick={function () {
            closable?.onClose?.();
            setClosed(true);
          }}
        >
          {closeIcon || <X className="size-4" />}
        </button>
      ) : null}
    </div>
  );
}

function Result({ status, title, subTitle, extra, className }: any) {
  return (
    <div
      className={cx(
        "flex flex-col items-center gap-3 py-10 text-center",
        className,
      )}
    >
      <div className="text-6xl font-semibold text-gray-300">{status}</div>
      <div className="text-2xl font-medium">{title}</div>
      <div>{subTitle}</div>
      {extra}
    </div>
  );
}

function Skeleton({ className, active, ...props }: any) {
  return (
    <SkeletonLib
      className={className}
      enableAnimation={active !== false}
      {...props}
    />
  );
}

function SkeletonAvatar({ active, className, size = 32 }: any) {
  const px = typeof size === "number" ? size : size === "large" ? 40 : 32;
  return (
    <SkeletonLib
      circle
      width={px}
      height={px}
      className={className}
      enableAnimation={active !== false}
    />
  );
}

function SkeletonButton({ active, className, size }: any) {
  const height = typeof size === "number" ? size : size === "large" ? 40 : 32;
  return (
    <SkeletonLib
      height={height}
      className={className}
      enableAnimation={active !== false}
    />
  );
}

Skeleton.Avatar = SkeletonAvatar;
Skeleton.Button = SkeletonButton;

const titleTags = ["h1", "h2", "h3", "h4", "h5"] as const;
const titleSizes = ["text-4xl", "text-3xl", "text-2xl", "text-xl", "text-base"];

function Title({ level = 1, editable, className, children, ...props }: any) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const TagName = titleTags[(level || 1) - 1] || "h1";
  const canEdit = Boolean(editable);
  function startEdit() {
    setDraft(
      editable?.text ?? (typeof children === "string" ? children : "") ?? "",
    );
    setEditing(true);
  }
  function commit() {
    setEditing(false);
    editable?.onChange?.(draft);
  }
  return (
    <TagName
      className={cx("font-semibold", titleSizes[(level || 1) - 1], className)}
      {...props}
    >
      {editing ? (
        <input
          autoFocus
          value={draft}
          className="border-b border-white bg-transparent outline-none"
          onChange={function (event) {
            setDraft(event.target.value);
          }}
          onBlur={commit}
          onKeyDown={function (event) {
            if (event.key === "Enter") commit();
          }}
        />
      ) : (
        children
      )}
      {canEdit && !editing ? (
        <button
          type="button"
          className="ml-2 inline-flex align-middle"
          onClick={startEdit}
        >
          {editable?.icon || <Pencil className="size-4" />}
        </button>
      ) : null}
    </TagName>
  );
}

const Typography = { Title };

function Row({ children, className, justify, align, gutter, ...props }: any) {
  const justifyClass =
    justify === "space-between"
      ? "justify-between"
      : justify === "center"
        ? "justify-center"
        : justify === "end"
          ? "justify-end"
          : "justify-start";
  const alignClass =
    align === "middle"
      ? "items-center"
      : align === "bottom"
        ? "items-end"
        : "items-stretch";
  return (
    <div
      className={cx("flex flex-wrap", justifyClass, alignClass, className)}
      style={
        typeof gutter === "number"
          ? { gap: gutter }
          : Array.isArray(gutter)
            ? { columnGap: gutter[0], rowGap: gutter[1] }
            : undefined
      }
      {...props}
    >
      {children}
    </div>
  );
}

function Col({ children, className, span, ...props }: any) {
  return (
    <div
      className={className}
      style={span ? { width: `${(span / 24) * 100}%` } : undefined}
      {...props}
    >
      {children}
    </div>
  );
}

function Card({
  title,
  hoverable,
  actions,
  className,
  classNames,
  children,
}: any) {
  return (
    <div
      className={cx(
        "flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white",
        hoverable && "transition hover:shadow-md",
        className,
      )}
    >
      {title ? (
        <div className="border-b border-gray-100 px-4 py-3 font-medium">
          {title}
        </div>
      ) : null}
      <div className={cx("p-4", classNames?.body)}>{children}</div>
      {actions?.length ? (
        <div className="flex border-t border-gray-100">
          {actions.map(function (action: any, index: number) {
            return (
              <div key={index} className="flex-1">
                {action}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function Statistic({
  title,
  value,
  prefix,
  suffix,
  formatter,
  precision,
  className,
}: any) {
  const shown =
    formatter?.(value) ??
    (typeof value === "number" && precision != null
      ? value.toFixed(precision)
      : value);
  return (
    <div className={className}>
      <div>{title}</div>
      <div className="ant-statistic-content flex items-center justify-center gap-1 font-medium">
        {prefix}
        <span className="ant-statistic-content-value">{shown}</span>
        {suffix}
      </div>
    </div>
  );
}

function Rate({
  value,
  defaultValue = 0,
  onChange,
  disabled,
  allowHalf,
  className,
}: any) {
  const [internal, setInternal] = useState(defaultValue);
  const current = value ?? internal;
  function set(next: number) {
    if (disabled) return;
    setInternal(next);
    onChange?.(next);
  }
  return (
    <div className={cx("inline-flex items-center", className)}>
      {[1, 2, 3, 4, 5].map(function (star) {
        const full = current >= star;
        const half = allowHalf && current >= star - 0.5 && current < star;
        return (
          <button
            type="button"
            key={star}
            disabled={disabled}
            className="relative p-0.5"
            onClick={function (event: any) {
              if (allowHalf) {
                const rect = event.currentTarget.getBoundingClientRect();
                set(
                  event.clientX - rect.left < rect.width / 2
                    ? star - 0.5
                    : star,
                );
              } else set(star);
            }}
          >
            <Star
              className={cx(
                "size-5",
                full || half
                  ? "fill-amber-400 text-amber-400"
                  : "text-gray-300",
              )}
            />
            {half ? (
              <span className="absolute inset-0.5 overflow-hidden">
                <Star className="size-5 fill-amber-400 text-amber-400" />
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

function Segmented({ options = [], value, onChange, size, className }: any) {
  return (
    <div
      className={cx(
        "inline-flex items-center rounded-md bg-gray-100 p-1",
        className,
      )}
    >
      {options.map(function (option: any) {
        const item =
          typeof option === "object"
            ? option
            : { label: option, value: option };
        const active = item.value === value;
        return (
          <button
            type="button"
            key={String(item.value)}
            onClick={function () {
              onChange?.(item.value);
            }}
            className={cx(
              "rounded px-3 py-1 text-sm",
              size === "small" && "px-2 py-0.5 text-xs",
              active ? "bg-white shadow" : "text-gray-600 hover:text-black",
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

function Image({ src, className, onClick, alt }: any) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <img
        src={src}
        alt={alt || ""}
        className={cx("cursor-pointer object-cover", className)}
        onClick={function (event) {
          event.stopPropagation();
          onClick?.(event);
          if (!event.defaultPrevented) setOpen(true);
        }}
      />
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={function () {
            setOpen(false);
          }}
        >
          <img
            src={src}
            alt={alt || ""}
            className="max-h-full max-w-full rounded"
          />
        </div>
      ) : null}
    </>
  );
}

export {
  Alert,
  Avatar,
  Card,
  Col,
  Empty,
  Image,
  Rate,
  Result,
  Row,
  Segmented,
  Skeleton,
  Statistic,
  Tag,
  Typography,
};
