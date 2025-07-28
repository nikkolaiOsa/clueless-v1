import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { useNavigate, useLocation, Link } from 'react-router';
import DataTable from "../global/DataTable";
import FetchCSV from '~/global/FetchCSV';

function ReadBooks() {
    const data = FetchCSV('/goodreads_library_export.csv');
    const [selectedColumns, setSelectedColumns] = useState<string[]>([
        "Date Read",
        "Title",
        "Author",
        "Average Rating",
        "My Rating",
        "Year Published"
    ]);
    const [sortBy, setSortBy] = useState<string>("Date Read");
    const [sortAsc, setSortAsc] = useState<boolean>(false);
    const navigate = useNavigate();
    const location = useLocation();
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const params = new URLSearchParams(location.search);
    const page = Math.max(1, parseInt(params.get('page') || '1', 10));
    const setPageAndUrl = (newPage: number) => {
        params.set('page', String(newPage));
        navigate({ search: params.toString() }, { replace: true });
    };
    
    const filteredData = data.filter(
        row => String(row["Exclusive Shelf"]).toLowerCase() === "read"
    );
    // Sort filtered data
    const sortedData = [...filteredData].sort((a, b) => {
        const aVal = String(a[sortBy] ?? "");
        const bVal = String(b[sortBy] ?? "");
        if (!isNaN(Number(aVal)) && !isNaN(Number(bVal))) {
            // Numeric sort
            return sortAsc
                ? Number(aVal) - Number(bVal)
                : Number(bVal) - Number(aVal);
        }
        // String sort
        return sortAsc
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
    });

    const paginatedData = sortedData.slice((page - 1) * rowsPerPage, page * rowsPerPage);

    return (
    <div>
        <h1>Read Books</h1>
        <p>Here are the books you have read:</p>
      {selectedColumns.length > 0 && (
        <div style={{ maxHeight: 400, overflow: 'auto' }}>
          <DataTable
            data={paginatedData}
            columns={selectedColumns}
            sortBy={sortBy}
            sortAsc={sortAsc}
            onSort={(col) => {
                if (sortBy === col) setSortAsc((asc) => !asc);
                else {
                    setSortBy(col);
                    setSortAsc(true);
                }
            }}
        renderCell={(row, header) => {
          if (header === "Title" && row["Book Id"]) {
            return <Link to={`/details/${row["Book Id"]}`}>{String(row[header] ?? '')}</Link>;
          }
          if (header === "Date Read" && row["Date Read"]) {
            const date = new Date(String(row["Date Read"]));
            return isNaN(date.getTime())
              ? String(row["Date Read"])
              : date.toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                });
          }
          return String(row[header] ?? '');
        }}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={setPageAndUrl}
        totalRows={sortedData.length}
        onRowsPerPageChange={setRowsPerPage}
      />
        </div>

      )}
      {filteredData.length === 0 && data.length > 0 && (
        <div style={{ marginTop: 16 }}>No "to-read" books found.</div>
      )}
    </div>
  );
}

export default ReadBooks;