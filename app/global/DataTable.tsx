import React from "react";
import { Link } from "react-router";

type DataTableProps = {
  data: Record<string, unknown>[];
  columns: string[];
  sortBy: string;
  sortAsc: boolean;
  onSort: (col: string) => void;
  renderCell?: (row: Record<string, unknown>, header: string) => React.ReactNode;
  rowsPerPage: number;
  page: number;
  onPageChange: (page: number) => void;
  totalRows: number;
  onRowsPerPageChange: (n: number) => void;
};

export default function DataTable({
    data,
    columns,
    sortBy,
    sortAsc,
    onSort,
    renderCell,
    rowsPerPage,
    page,
    onPageChange,
    totalRows,
    onRowsPerPageChange,
    }: DataTableProps) {
    const startRow = (page - 1) * rowsPerPage;
    const endRow = startRow + rowsPerPage;
    const paginatedData = data.slice(startRow, endRow);
    
    return (
        <div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
            <tr>
                {columns.map((col) => (
                <th
                    key={col}
                    style={{
                    cursor: "pointer",
                    padding: "8px",
                    borderBottom: "1px solid #ddd",
                    }}
                    onClick={() => onSort(col)}
                >
                    {col === "Average Rating" ? "Goodreads Rating" : col} {sortBy === col ? (sortAsc ? "↑" : "↓") : ""}
                </th>
                ))}
            </tr>
            </thead>
            <tbody>
            {paginatedData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                {columns.map((header) => (
                    <td
                    key={header}
                    style={{
                        padding: "8px",
                        borderBottom: "1px solid #ddd",
                    }}
                    >
                    {renderCell ? renderCell(row, header) : String(row[header])}
                    </td>
                ))}
                </tr>
            ))}
            </tbody>
        </table>
    
        <div style={{ marginTop: "16px", display: "flex", justifyContent: "space-between" }}>
            <div>
            Rows per page:
            <select
                value={rowsPerPage}
                onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
                style={{ marginLeft: "8px" }}
            >
                {[10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>
                    {n}
                </option>
                ))}
            </select>
            </div>
    
            <div>
            Page {page} of {Math.ceil(totalRows / rowsPerPage)}
            <button
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
                style={{ marginLeft: "8px" }}
            >
                Previous        
            </button>
            <button
                disabled={page >= Math.ceil(totalRows / rowsPerPage)}
                onClick={() => onPageChange(page + 1)}
                style={{ marginLeft: "8px" }}
            >
                Next
            </button>
            </div>
        </div>

    </div>
    );
}
