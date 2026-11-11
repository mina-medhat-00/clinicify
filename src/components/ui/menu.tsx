import { ChevronDown } from "lucide-react";
import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { cx } from "@/utils/cx";
import type {
  MenuClickInfo,
  MenuItemType,
  MenuTheme,
  MenuRef,
  MenuProps,
} from "@/types/ui";

function MenuItem({
  item,
  theme,
  onClick,
  depth = 0,
}: {
  item: MenuItemType;
  theme: MenuTheme;
  onClick?: (info: MenuClickInfo) => void;
  depth?: number;
}) {
  const [open, setOpen] = useState(false);
  const children = item.children ?? [];
  const hasChildren = children.length > 0;
  const dark = theme === "dark";

  function handleClick(event: MouseEvent | KeyboardEvent) {
    if (hasChildren) {
      setOpen(function (value) {
        return !value;
      });
      return;
    }
    const info = { key: item.key, domEvent: event, keyPath: [item.key] };
    item.onClick?.(info);
    onClick?.(info);
  }

  const className = cx(
    "cursor-pointer",
    "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left",
    dark
      ? "text-gray-200 hover:bg-blue-900 hover:text-white [&_a]:text-inherit"
      : "text-gray-700 hover:bg-gray-100",
    item.key.includes("user") && "justify-start pl-1",
  );
  const content = (
    <>
      {item.icon}
      <span className="min-w-0 grow">{item.label}</span>
      {hasChildren ? (
        <ChevronDown
          className={cx("size-4 shrink-0 transition", open && "rotate-180")}
        />
      ) : null}
    </>
  );

  return (
    <li data-menu-id={item.key}>
      {hasChildren ? (
        <button type="button" onClick={handleClick} className={className}>
          {content}
        </button>
      ) : (
        // Leaf labels may be links or buttons so render a focusable div instead of a button
        <div
          role="menuitem"
          tabIndex={0}
          onClick={handleClick}
          onKeyDown={function (event) {
            if (event.target !== event.currentTarget) return;
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              handleClick(event);
            }
          }}
          className={className}
        >
          {content}
        </div>
      )}
      {hasChildren && open ? (
        <ul
          id={item.key}
          className={cx(
            "ml-2 overflow-hidden rounded-t-2xl pr-2",
            item.key.includes("sub31") &&
              "scroll--v max-h-52 overflow-y-auto bg-sky-900",
            item.key.includes("subdoc") && "bg-blue-900",
          )}
        >
          {children.map(function (child) {
            return (
              <MenuItem
                key={child.key}
                item={{
                  ...child,
                  onClick: child.onClick ?? item.onClick,
                }}
                theme={theme}
                onClick={onClick}
                depth={depth + 1}
              />
            );
          })}
        </ul>
      ) : null}
    </li>
  );
}

const Menu = forwardRef<MenuRef, MenuProps>(function Menu(
  { items = [], theme = "light", mode, className, onClick, style },
  ref,
) {
  const listRef = useRef<HTMLUListElement>(null);
  useImperativeHandle(ref, function () {
    return {
      menu: {
        get list() {
          return listRef.current;
        },
      },
    };
  });

  return (
    <ul
      ref={listRef}
      style={style}
      className={cx(
        "ant-menu-root m-0 list-none p-0",
        mode === "vertical" && "w-full",
        theme === "dark" && "bg-blue-950 text-white",
        className,
      )}
    >
      {items.map(function (item) {
        if (!item) return null;
        return (
          <MenuItem
            key={item.key}
            item={item}
            theme={theme}
            onClick={onClick}
          />
        );
      })}
    </ul>
  );
});

export { Menu };
