import { useState } from "react";
import { cx } from "@/components/ui/kit/cx";

function TableGrid({
  noGap,
  noMargin,
  customGrid,
  items,
  maxPageSize,
  isFull,
  heightFull,
}: any) {
  const pageSize = maxPageSize || 10;
  const [page, setPage] = useState(1);
  const total = items?.length || 0;
  const needPaging = total > pageSize;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(page, totalPages);
  const pageItems = needPaging
    ? items.slice((current - 1) * pageSize, current * pageSize)
    : items;

  return (
    <div className={cx("w-full", !noMargin && "m-4")}>
      <div
        className={cx(
          "flex flex-wrap justify-between",
          noGap ? "gap-0" : "gap-1",
        )}
      >
        {pageItems?.map(function ({ key, element }: any) {
          const full = isFull?.some(function (item: any) {
            return item.key == key;
          });
          return (
            <div
              key={key}
              className={cx(
                "flex grow rounded",
                customGrid ? customGrid : "xl:w-1/3 2xl:w-1/4",
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
          {Array.from({ length: totalPages }).map(function (
            _: any,
            index: number,
          ) {
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

export default TableGrid;
