import { ChevronDown } from "lucide-react";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { cx } from "@/components/ui/cx";

function MenuItem({ item, theme, onClick, depth = 0 }: any) {
  const [open, setOpen] = useState(false);
  if (!item) return null;
  const hasChildren = Boolean(item.children?.length);
  const dark = theme === "dark";

  function handleClick(event: any) {
    if (hasChildren) {
      setOpen(function (value) {
        return !value;
      });
      return;
    }
    item.onClick?.({
      key: item.key,
      domEvent: event,
      keyPath: [item.key],
    });
    onClick?.({
      key: item.key,
      domEvent: event,
      keyPath: [item.key],
      item,
    });
  }

  // Leaf labels are often links or buttons themselves, which can't sit inside
  // a <button>; render those as a focusable menu item instead.
  const Trigger: any = hasChildren ? "button" : "div";
  const triggerProps = hasChildren
    ? { type: "button" }
    : {
        role: "menuitem",
        tabIndex: 0,
        onKeyDown: function (event: any) {
          if (event.target !== event.currentTarget) return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleClick(event);
          }
        },
      };

  return (
    <li data-menu-id={item.key}>
      <Trigger
        {...triggerProps}
        onClick={handleClick}
        className={cx(
          "cursor-pointer",
          "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left",
          dark
            ? "text-gray-200 hover:bg-[#1f3458] hover:text-white"
            : "text-gray-700 hover:bg-gray-100",
          String(item.key).includes("user") && "justify-start pl-1",
        )}
      >
        {item.icon}
        <span className="min-w-0 grow">{item.label}</span>
        {hasChildren ? (
          <ChevronDown
            className={cx("size-4 shrink-0 transition", open && "rotate-180")}
          />
        ) : null}
      </Trigger>
      {hasChildren && open ? (
        <ul
          id={String(item.key)}
          className={cx(
            "ml-2 overflow-hidden rounded-t-2xl pr-2",
            String(item.key).includes("sub31") &&
              "scroll--v max-h-52 overflow-y-auto bg-[rgb(31,88,126)]",
            String(item.key).includes("subdoc") && "bg-[rgb(23,65,107)]",
          )}
        >
          {item.children.map(function (child: any) {
            return (
              <MenuItem
                key={child.key}
                item={{
                  ...child,
                  onClick: child.onClick || item.onClick,
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

const Menu = forwardRef(function Menu(
  { items = [], theme = "light", mode, className, onClick, style }: any,
  ref: any,
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
      {items.filter(Boolean).map(function (item: any) {
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
