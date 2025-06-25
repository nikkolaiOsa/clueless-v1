import logoDark from "./logo-dark.svg";
import logoLight from "./logo-light.svg";
import React, { useState } from 'react';
import { useLocation } from 'react-router';
import Papa from 'papaparse';
import { useParams } from "react-router";

function Welcome() {
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
        "Title",
    "Author",
    "My Rating",
    "Average Rating",
    "Year Published"
  ]);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const fetchCSV = async () => {
    const response = await fetch('/goodreads_library_export.csv');
    const csvText = await response.text();
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setData(results.data as Record<string, unknown>[]);
        setPage(1); // Reset to first page on new load
      },
    });
  };

  // Get table headers from the first row of data
  const headers = data.length > 0 ? Object.keys(data[0]) : [];

  const handleColumnChange = (col: string) => {
    setSelectedColumns((prev) =>
      prev.includes(col)
        ? prev.filter((c) => c !== col)
        : [...prev, col]
    );
  };

  const totalPages = Math.ceil(data.length / rowsPerPage);
  const paginatedData = data.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <div>
      <button onClick={fetchCSV}>Load Goodreads CSV</button>
      {headers.length > 0 && (
        <div style={{ margin: "1em 0" }}>
          <strong>Choose columns to display:</strong>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {headers.map((header) => (
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
      )}
      {data.length > 0 && selectedColumns.length > 0 && (
        <div style={{ maxHeight: 400, overflow: 'auto' }}>
          <table border={1} cellPadding={4} style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                {selectedColumns.map((header) => (
                  <th key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, idx) => (
                <tr key={idx}>
                  {selectedColumns.map((header) => (
                    <td key={header}>{String(row[header] ?? '')}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Welcome;