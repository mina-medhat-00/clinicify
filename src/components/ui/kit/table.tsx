import { ChevronDown, Filter, Loader2 } from "lucide-react";
import { Fragment, useMemo, useState } from "react";
import { cx } from "@/components/ui/kit/cx";

const EXPAND_COLUMN = "EXPAND_COLUMN";

function Table({
  columns = [],
  dataSource = [],
  pagination,
  loading,
  rowClassName,
  showHeader = true,
  className,
  size,
  expandable,
}: any) {
  const [page, setPage] = useState(1);
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, any[]>>({});
  const [applied, setApplied] = useState<Record<string, any[]>>({});

  const pageSize =
    pagination && pagination !== false ? pagination.pageSize || 10 : Infinity;

  const filtered = useMemo(
    function () {
      return (dataSource || []).filter(function (record: any) {
        return columns.every(function (column: any) {
          const values = applied[column.key || column.dataIndex];
          if (!values?.length || !column.onFilter) return true;
          return values.some(function (value) {
            return column.onFilter(value, record);
          });
        });
      });
    },
    [applied, columns, dataSource],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, totalPages);
  const pageRows =
    pagination === false
      ? filtered
      : filtered.slice((current - 1) * pageSize, current * pageSize);

  function cellValue(column: any, record: any, index: number) {
    const raw = column.dataIndex ? record[column.dataIndex] : record;
    if (column.render) return column.render(raw, record, index);
    return raw;
  }

  return (
    <div className={cx("relative w-full", className)}>
      {loading ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50">
          <Loader2 className="size-6 animate-spin text-blue-500" />
        </div>
      ) : null}
      <table className="w-full border-collapse text-left">
        {showHeader ? (
          <thead>
            <tr>
              {columns.map(function (column: any) {
                if (column === EXPAND_COLUMN) {
                  return (
                    <th
                      key="expand"
                      className="w-10 border-b border-gray-200 px-3 py-2"
                    />
                  );
                }
                const colKey = column.key || column.dataIndex;
                const filteredCol = Boolean(applied[colKey]?.length);
                return (
                  <th
                    key={colKey}
                    className="border-b border-gray-200 px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      {column.title}
                      {column.filterDropdown || column.filters ? (
                        <div className="relative">
                          <button
                            type="button"
                            onClick={function () {
                              const next =
                                openFilter === colKey ? null : colKey;
                              setOpenFilter(next);
                              column.filterDropdownProps?.onOpenChange?.(
                                Boolean(next),
                              );
                            }}
                          >
                            {column.filterIcon ? (
                              column.filterIcon(filteredCol)
                            ) : (
                              <Filter
                                className={cx(
                                  "size-3.5",
                                  filteredCol && "text-blue-500",
                                )}
                              />
                            )}
                          </button>
                          {openFilter === colKey ? (
                            <div className="absolute top-full left-0 z-20 mt-1 min-w-48 rounded-md border border-gray-200 bg-white p-2 shadow-lg">
                              {column.filterDropdown ? (
                                column.filterDropdown({
                                  selectedKeys: draft[colKey] || [],
                                  setSelectedKeys: function (keys: any[]) {
                                    setDraft(function (current) {
                                      return { ...current, [colKey]: keys };
                                    });
                                  },
                                  confirm: function () {
                                    setApplied(function (current) {
                                      return {
                                        ...current,
                                        [colKey]: draft[colKey] || [],
                                      };
                                    });
                                    setOpenFilter(null);
                                    setPage(1);
                                  },
                                  clearFilters: function () {
                                    setDraft(function (current) {
                                      return { ...current, [colKey]: [] };
                                    });
                                    setApplied(function (current) {
                                      return { ...current, [colKey]: [] };
                                    });
                                  },
                                  close: function () {
                                    setOpenFilter(null);
                                  },
                                })
                              ) : (
                                <div className="flex flex-col gap-1">
                                  {column.filters.map(function (filter: any) {
                                    const selected = (
                                      draft[colKey] || []
                                    ).includes(filter.value);
                                    return (
                                      <label
                                        key={filter.value}
                                        className="flex items-center gap-2 text-sm"
                                      >
                                        <input
                                          type="checkbox"
                                          checked={selected}
                                          onChange={function () {
                                            setDraft(function (current) {
                                              const prev =
                                                current[colKey] || [];
                                              return {
                                                ...current,
                                                [colKey]: selected
                                                  ? prev.filter(
                                                      function (value) {
                                                        return (
                                                          value !== filter.value
                                                        );
                                                      },
                                                    )
                                                  : [...prev, filter.value],
                                              };
                                            });
                                          }}
                                        />
                                        {filter.text}
                                      </label>
                                    );
                                  })}
                                  <button
                                    type="button"
                                    className="mt-2 text-sm text-blue-500"
                                    onClick={function () {
                                      setApplied(function (current) {
                                        return {
                                          ...current,
                                          [colKey]: draft[colKey] || [],
                                        };
                                      });
                                      setOpenFilter(null);
                                      setPage(1);
                                    }}
                                  >
                                    OK
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
        ) : null}
        <tbody className="ant-table-tbody">
          {pageRows.map(function (record: any, index: number) {
            const extra =
              typeof rowClassName === "function"
                ? rowClassName(record, index)
                : rowClassName;
            const expanded = expandable?.expandedRowKeys?.includes(record.key);
            return (
              <Fragment key={record.key ?? index}>
                <tr
                  key={record.key ?? index}
                  className={cx("ant-table-cell-row-hover", extra)}
                >
                  {columns.map(function (column: any) {
                    if (column === EXPAND_COLUMN) {
                      return (
                        <td
                          key="expand"
                          className="border-b border-gray-100 px-3 py-2"
                        >
                          <button
                            type="button"
                            onClick={function () {
                              expandable?.onExpand?.(!expanded, record);
                            }}
                          >
                            <ChevronDown
                              className={cx(
                                "size-4 transition",
                                expanded && "rotate-180",
                              )}
                            />
                          </button>
                        </td>
                      );
                    }
                    return (
                      <td
                        key={column.key || column.dataIndex}
                        className="border-b border-gray-100 px-3 py-2"
                      >
                        {cellValue(column, record, index)}
                      </td>
                    );
                  })}
                </tr>
                {expanded && expandable?.expandedRowRender ? (
                  <tr key={`${record.key}-expanded`}>
                    <td
                      colSpan={columns.length}
                      className="border-b border-gray-100 bg-gray-50 p-3"
                    >
                      {expandable.expandedRowRender(record, index)}
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            );
          })}
        </tbody>
      </table>
      {pagination && pagination !== false && filtered.length > pageSize ? (
        <div
          className={cx(
            "ant-table-pagination mt-3 flex gap-2",
            pagination.position?.includes("bottomCenter")
              ? "justify-center"
              : "justify-start",
          )}
        >
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

Table.EXPAND_COLUMN = EXPAND_COLUMN;

export { Table };
