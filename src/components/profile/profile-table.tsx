import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/display";

export interface ProfileRow {
  name: ReactNode;
  value?: ReactNode;
  // Shown before the value, e.g. a phone prefix.
  preValue?: ReactNode;
}

function isBlank(value: ReactNode) {
  return (
    value === null || value === undefined || value === "" || value === false
  );
}

export default function ProfileTable({
  data,
  headers,
  headerColor,
  propColor,
  icon,
  loadingProps,
}: {
  data?: ProfileRow[];
  headers?: ReactNode[];
  headerColor?: string;
  propColor?: string;
  // Shown for rows without a value.
  icon?: ReactNode;
  loadingProps?: { active?: boolean; numCol?: number; numRow?: number };
}) {
  const loading = Boolean(loadingProps?.active);
  const numCol = loadingProps?.numCol ?? 3;
  const numRow = loadingProps?.numRow ?? 4;
  // Each row has a name and a value cell; headers share those two columns.
  const headerSpan = 2 / Math.max(headers?.length ?? 1, 1);
  return (
    <div className="w-full overflow-auto scroll--h">
      <table className="w-full text-left bg-white rounded-lg">
        {(headers !== undefined || loading) && (
          <thead
            className={`text-gray-500 ${
              loading ? "bg-gray-400 rounded" : "border-b-2 border-gray-400"
            } ${headerColor ?? "bg-gray-700"}`}
          >
            <tr>
              {loading
                ? Array.from({ length: numCol }).map(function (_, i) {
                    return (
                      <th
                        key={i}
                        scope="col"
                        className="px-1 py-4 text-gray-100"
                      >
                        <Skeleton.Button className="w-full rounded-lg" active />
                      </th>
                    );
                  })
                : headers?.map(function (val, i) {
                    return (
                      <th
                        key={i}
                        scope="col"
                        colSpan={headerSpan}
                        className="px-6 py-3 text-gray-100"
                      >
                        {val}
                      </th>
                    );
                  })}
            </tr>
          </thead>
        )}
        <tbody>
          {loading
            ? Array.from({ length: numRow }).map(function (_, i) {
                return (
                  <tr key={i}>
                    {Array.from({ length: numCol }).map(function (_, j) {
                      return (
                        <th key={j} scope="row" className="p-3">
                          <Skeleton.Button className="w-full" active />
                        </th>
                      );
                    })}
                  </tr>
                );
              })
            : data?.map(function ({ name, value, preValue }, i, arr) {
                return (
                  <tr key={i}>
                    <th
                      scope="row"
                      className={`text-gray-500/80 border-b border-gray-300 capitalize ${
                        propColor ?? "bg-gray-100"
                      } text-sm sm:text-lg p-3 font-medium w-1/3`}
                    >
                      {name}
                    </th>
                    <td
                      className={`px-2 text-gray-400 ${
                        i + 1 === arr.length ? "" : "border-b border-gray-100"
                      } break-all text-sm sm:text-lg font-medium`}
                    >
                      {!isBlank(preValue) && !isBlank(value) ? (
                        <>
                          {preValue} {value}
                        </>
                      ) : isBlank(value) ? (
                        <div>{icon}</div>
                      ) : (
                        value
                      )}
                    </td>
                  </tr>
                );
              })}
        </tbody>
      </table>
    </div>
  );
}
