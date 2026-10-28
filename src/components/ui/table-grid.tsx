import { useState, type Key, type ReactNode } from "react";
import { cx } from "@/utils/cx";

export default function TableGrid({
  noGap,
  noMargin,
  customGrid,
  items,
  maxPageSize,
  isFull,
  heightFull,
}: {
  noGap?: boolean;
  noMargin?: boolean;
  customGrid?: string;
  items?: { key: Key; element: ReactNode }[];
  maxPageSize?: number;
  // Keys of the items that take a full row.
  isFull?: { key: Key }[];
  heightFull?: boolean;
}) {
  const pageSize = maxPageSize ?? 10;
  const [page, setPage] = useState(1);
  const list = items ?? [];
  const needPaging = list.length > pageSize;
  const totalPages = Math.max(1, Math.ceil(list.length / pageSize));
  const current = Math.min(page, totalPages);
  const pageItems = needPaging
    ? list.slice((current - 1) * pageSize, current * pageSize)
    : list;

  return (
    <div className={cx("w-full", !noMargin && "m-4")}>
      <div
        className={cx(
          "flex flex-wrap justify-between",
          noGap ? "gap-0" : "gap-1",
        )}
      >
        {pageItems.map(function ({ key, element }) {
          const full = isFull?.some(function (item) {
            return item.key === key;
          });
          return (
            <div
              key={key}
              className={cx(
                "flex grow rounded",
                customGrid ?? "xl:w-1/3 2xl:w-1/4",
                full && "w-full",
                heightFull && "h-full",
              )}
            >
              {element}
            </div>
          );
        })}
      </div>
      {needPaging ? (
        <div className="mt-3 flex justify-center gap-2">
          {Array.from({ length: totalPages }).map(function (_, index) {
            const number = index + 1;
            return (
              <button
                type="button"
                key={number}
                onClick={function () {
                  setPage(number);
                }}
                className={cx(
                  "size-8 rounded border text-sm",
                  current === number
                    ? "border-blue-500 bg-blue-500 text-white"
                    : "border-gray-300 bg-white",
                )}
              >
                {number}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
