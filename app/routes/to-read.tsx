import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { useNavigate, useLocation, Link } from 'react-router';
import DataTable from "../global/DataTable";
import FetchCSV from '~/global/FetchCSV';


function ToRead() {
    const data = FetchCSV('/goodreads_library_export.csv');
    const [selectedColumns, setSelectedColumns] = useState<string[]>([
        "To-Read Order",
        "Title",
        "Author",
        "Average Rating",
        "Year Published"
    ]);
    const [sortBy, setSortBy] = useState<string>("To-Read Order");
    const [sortAsc, setSortAsc] = useState<boolean>(true);
    const navigate = useNavigate();
    const location = useLocation();
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const params = new URLSearchParams(location.search);
    const page = Math.max(1, parseInt(params.get('page') || '1', 10));
    const setPageAndUrl = (newPage: number) => {
        params.set('page', String(newPage));
        navigate({ search: params.toString() }, { replace: true });
    };


    const headers = data.length > 0 ? Object.keys(data[0]) : [];
    const allHeaders = [...headers.filter(h => h !== "To-Read Order" && h !== "Title")];

    const handleColumnChange = (col: string) => {
        setSelectedColumns((prev) =>
            prev.includes(col)
                ? prev.filter((c) => c !== col)
                : [...prev, col]
        );
    };

    //Filter data for "to-read" shelf
    const filteredData = data.filter(
        row => String(row["Exclusive Shelf"]).toLowerCase() === "to-read"
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

    // Assign To-Read Order based on sorted order and bookshelves
    const rankedData = sortedData.map((row, idx) => {
        // Find the position of this book among all books with the same Bookshelves value
        const bookshelves = String(row["Bookshelves with positions"]);
        // Isolate the shelf entry that contains "to-read"
        const toReadShelf = bookshelves
            .split(',')
            .map(s => s.trim())
            .find(shelf => shelf.includes("to-read")) || "";
            
        let toReadShelfNumber: number | null = null;
        // Isolate number after # and before ) in toReadShelf string
        const hashMatch = toReadShelf.match(/#(\d+)\)/);
        
        if (hashMatch && hashMatch[1]) {
            toReadShelfNumber = Number(hashMatch[1]);
        }
        
        if (toReadShelfNumber === null || isNaN(toReadShelfNumber)) {
            console.warn(`Invalid to-read shelf number for book: ${row["Title"]}`);
            return { ...row, "To-Read Order": null };
        }
        // Assign the shelf position based on the to-read shelf number
        row["To-Read Order"] = toReadShelfNumber;   

        // Extract "to-read" position from "Bookshelves With Position"
        let toReadShelfPosition: number | null = null;
        if (row["To-Read Order"]) {
            const pos = String(row["To-Read Order"])
            if (!isNaN(Number(pos))) {
                toReadShelfPosition = Number(pos)
            }        
        }

        return {
            ...row,
            "To-Read Order": toReadShelfPosition,
        };
    });

    return (
    <div>
      <div style={{ margin: "1em 0" }}>
        <strong>Choose columns to display:</strong>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {allHeaders.map((header) => (
            <label key={header} style={{ marginRight: 12 }}>
              <input
                type="checkbox"
                checked={selectedColumns.includes(header)}
                onChange={() => handleColumnChange(header)}
              />
              {header}
            </label>
          ))}
        </div>
      </div>
      {selectedColumns.length > 0 && (
        <div style={{ maxHeight: 400, overflow: 'auto' }}>
          <DataTable
            data={rankedData}
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
              if (header === "Average Rating" && row["Average Rating"]) {
                return String(row["Average Rating"]);
              }
              if (header === "Year Published" && row["Year Published"]) {
                return String(row["Year Published"]);
              }
              return String(row[header] ?? '');
            }}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={setPageAndUrl}
            totalRows={rankedData.length}
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

export default ToRead;