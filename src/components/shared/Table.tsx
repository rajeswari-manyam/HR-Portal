import React, { useState } from "react";

type Column<T> = {
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
  
};

type TableProps<T> = {
  columns: Column<T>[];
  data: T[];
  rowsPerPage?: number;
  emptyMessage?: string;
    page?: number;                                         // ← add
  setPage?: React.Dispatch<React.SetStateAction<number>>; // ← add
};

function Table<T>({
  columns,
  data,
  rowsPerPage = 4,
  emptyMessage = "No data found",
}: TableProps<T>) {
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(data.length / rowsPerPage);

  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;

  const paginatedData = data.slice(start, end);

  const nextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const prevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  return (
    <div className="card p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              {columns.map((col, i) => (
                <th key={i} className={`table-header ${col.className || ""}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-50">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  {columns.map((col, j) => (
                    <td key={j} className="table-cell">
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-12 text-slate-400 text-sm"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data.length > rowsPerPage && (
        <div className="flex items-center justify-between px-4 py-3 border-t bg-white">
          <p className="text-sm text-slate-500">
            Page {page} of {totalPages}
          </p>

          <div className="flex gap-2">
            <button
              onClick={prevPage}
              disabled={page === 1}
              className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50"
            >
              Previous
            </button>

            <button
              onClick={nextPage}
              disabled={page === totalPages}
              className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Table;