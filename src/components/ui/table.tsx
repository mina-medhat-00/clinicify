import { ChevronDown, Filter, Loader2 } from "lucide-react";
import { Fragment, useMemo, useState, type Key, type ReactNode } from "react";
import { cx } from "@/utils/cx";

const EXPAND_COLUMN = "EXPAND_COLUMN" as const;

export type FilterValue = string | number | boolean;

export interface FilterDropdownProps {
  selectedKeys: FilterValue[];
  setSelectedKeys: (keys: FilterValue[]) => void;
  confirm: () => void;
  clearFilters: () => void;
  close: () => void;
}

interface ColumnBase<R> {
  title?: ReactNode;
  key?: string;
  filters?: { text: ReactNode; value: FilterValue }[];
  onFilter?: (value: FilterValue, record: R) => boolean;
  filterDropdown?: (props: FilterDropdownProps) => ReactNode;
  filterIcon?: (filtered: boolean) => ReactNode;
  filterDropdownProps?: { onOpenChange?: (open: boolean) => void };
}

// A column shows one field of the row (`dataIndex`), or the whole row.
type FieldColumn<R> = {
  [K in keyof R & string]: ColumnBase<R> & {
    dataIndex: K;
    render?: (value: R[K], record: R, index: number) => ReactNode;
  };
}[keyof R & string];
type RowColumn<R> = ColumnBase<R> & {
  dataIndex?: undefined;
  key: string;
  render: (record: R, _: R, index: number) => ReactNode;
};

export type TableColumn<R> = FieldColumn<R> | RowColumn<R>;
export interface TableRow {
  key?: Key;
}

interface TableProps<R extends TableRow> {
  columns?: (TableColumn<R> | typeof EXPAND_COLUMN)[];
  dataSource?: R[] | null;
  pagination?: false | { pageSize?: number; position?: string[] };
  loading?: boolean;
  rowClassName?: string | ((record: R, index: number) => string);
  showHeader?: boolean;
  className?: string;
  expandable?: {
    expandedRowKeys?: (Key | null)[];
    expandedRowRender?: (record: R, index: number) => ReactNode;
    onExpand?: (expanded: boolean, record: R) => void;
  };
}

function columnKey<R>(column: TableColumn<R>) {
  return column.key ?? column.dataIndex ?? "";
}

function isRowColumn<R>(column: TableColumn<R>): column is RowColumn<R> {
  return column.dataIndex === undefined;
}

function cellValue<R>(column: TableColumn<R>, record: R, index: number) {
  if (isRowColumn(column)) return column.render(record, record, index);
  const raw = record[column.dataIndex];
  if (column.render) {
    return (column.render as (v: unknown, r: R, i: number) => ReactNode)(
      raw,
      record,
      index,
    );
  }
  return raw as ReactNode;
}

function TableBase<R extends TableRow>({
  columns = [],
  dataSource,
  pagination,
  loading,
  rowClassName,
  showHeader = true,
  className,
  expandable,
}: TableProps<R>) {
  const [page, setPage] = useState(1);
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, FilterValue[]>>({});
  const [applied, setApplied] = useState<Record<string, FilterValue[]>>({});

  const pageSize = pagination ? (pagination.pageSize ?? 10) : Infinity;

  const filtered = useMemo(
    function () {
      return (dataSource ?? []).filter(function (record) {
        return columns.every(function (column) {
          if (column === EXPAND_COLUMN) return true;
          const values = applied[columnKey(column)];
          const { onFilter } = column;
          if (!values?.length || !onFilter) return true;
          return values.some(function (value) {
            return onFilter(value, record);
          });
        });
      });
    },
    [applied, columns, dataSource],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, totalPages);
  const pageRows = pagination
    ? filtered.slice((current - 1) * pageSize, current * pageSize)
    : filtered;

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
              {columns.map(function (column) {
                if (column === EXPAND_COLUMN) {
                  return (
                    <th
                      key="expand"
                      className="w-10 border-b border-gray-200 px-3 py-2"
                    />
                  );
                }
                const colKey = columnKey(column);
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
                                  selectedKeys: draft[colKey] ?? [],
                                  setSelectedKeys: function (keys) {
                                    setDraft(function (current) {
                                      return { ...current, [colKey]: keys };
                                    });
                                  },
                                  confirm: function () {
                                    setApplied(function (current) {
                                      return {
                                        ...current,
                                        [colKey]: draft[colKey] ?? [],
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
                                  {column.filters?.map(function (filter) {
                                    const selected = (
                                      draft[colKey] ?? []
                                    ).includes(filter.value);
                                    return (
                                      <label
                                        key={String(filter.value)}
                                        className="flex items-center gap-2 text-sm"
                                      >
                                        <input
                                          type="checkbox"
                                          checked={selected}
                                          onChange={function () {
                                            setDraft(function (current) {
                                              const prev =
                                                current[colKey] ?? [];
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
                                          [colKey]: draft[colKey] ?? [],
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
          {pageRows.map(function (record, index) {
            const extra =
              typeof rowClassName === "function"
                ? rowClassName(record, index)
                : rowClassName;
            const expanded = Boolean(
              record.key !== undefined &&
              expandable?.expandedRowKeys?.includes(record.key),
            );
            return (
              <Fragment key={record.key ?? index}>
                <tr
                  key={record.key ?? index}
                  className={cx("ant-table-cell-row-hover", extra)}
                >
                  {columns.map(function (column) {
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
                        key={columnKey(column)}
                        className="border-b border-gray-100 px-3 py-2"
                      >
                        {cellValue(column, record, index)}
                      </td>
                    );
                  })}
                </tr>
                {expanded && expandable?.expandedRowRender ? (
                  <tr key={`${String(record.key)}-expanded`}>
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
      {pagination && filtered.length > pageSize ? (
        <div
          className={cx(
            "ant-table-pagination mt-3 flex gap-2",
            pagination.position?.includes("bottomCenter")
              ? "justify-center"
              : "justify-start",
          )}
        >
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

const Table = Object.assign(TableBase, { EXPAND_COLUMN });

export { Table };
