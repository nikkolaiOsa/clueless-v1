import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { useNavigate, useLocation, Link } from 'react-router';

function ToRead() {
    const [data, setData] = useState<Record<string, unknown>[]>([]);
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
    const rowsPerPage = 10;

    const params = new URLSearchParams(location.search);
    const page = Math.max(1, parseInt(params.get('page') || '1', 10));
    const setPageAndUrl = (newPage: number) => {
        params.set('page', String(newPage));
        navigate({ search: params.toString() }, { replace: true });
    };

    useEffect(() => {
        fetchCSV();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchCSV = async () => {
        const response = await fetch('/goodreads_library_export.csv');
        const csvText = await response.text();
        Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                setData(results.data as Record<string, unknown>[]);
            },
        });
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
        console.log(toReadShelfNumber)
        if (toReadShelfNumber === null || isNaN(toReadShelfNumber)) {
            console.warn(`Invalid to-read shelf number for book: ${row["Title"]}`);
            return { ...row, "To-Read Order": null };
        }
        // Assign the shelf position based on the to-read shelf number
        row["To-Read Order"] = toReadShelfNumber;   
        console.log(`Row: ${row["To-Read Order"]}, To-Read Shelf Number: ${toReadShelfNumber}`);
        
        // Extract "to-read" position from "Bookshelves With Position"
        let toReadShelfPosition: number | null = null;
        console.log("To-Read Shelf Position:", row["To-Read Shelf Position"]);
        if (row["To-Read Order"]) {
            const pos = String(row["To-Read Order"])
            console.log("pos", pos)
            if (!isNaN(Number(pos))) {
                toReadShelfPosition = Number(pos)
            }        
        }

        return {
            ...row,
            "To-Read Order": toReadShelfPosition,
        };
    });


    const totalPages = Math.max(1, Math.ceil(sortedData.length / rowsPerPage));
    const paginatedData = sortedData.slice((page - 1) * rowsPerPage, page * rowsPerPage);

    return (
    <div>
      <button onClick={fetchCSV}>Reload Goodreads CSV</button>
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
          <table border={1} cellPadding={4} style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                {selectedColumns.map((header) => (
                  <th
                    key={header}
                    style={{ cursor: "pointer", userSelect: "none" }}
                    onClick={() => {
                        if (sortBy === header) setSortAsc((asc) => !asc);
                        else {
                            setSortBy(header);
                            setSortAsc(true);
                        }
                    }}
                  >
                    {header === "Average Rating" ? "Goodreads Rating" : header}
                    {sortBy === header ? (sortAsc ? " ▲" : " ▼") : ""}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, idx) => (
                <tr key={idx}>
                  {selectedColumns.map((header) => (
                     <td key={header}>
                        {header === "Title" && row["Book Id"] ? (
                        <Link to={`/details/${row["Book Id"]}`}>
                            {String(row[header] ?? '')}
                        </Link>
                        ) : (
                        String(row[header] ?? '')
                        )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => setPageAndUrl(Math.max(1, page - 1))} disabled={page === 1}>
              Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button onClick={() => setPageAndUrl(Math.min(totalPages, page + 1))} disabled={page === totalPages}>
              Next
            </button>
          </div>
        </div>
      )}
      {filteredData.length === 0 && data.length > 0 && (
        <div style={{ marginTop: 16 }}>No "to-read" books found.</div>
      )}
    </div>
  );
}

export default ToRead;