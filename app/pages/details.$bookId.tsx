import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import Papa from "papaparse";

function BookDetails() {
  const { bookId } = useParams<{ bookId: string }>();
  const [book, setBook] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    const fetchCSV = async () => {
      const response = await fetch("/goodreads_library_export.csv");
      const csvText = await response.text();
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const books = results.data as Record<string, unknown>[];
          const foundBook = books.find((b) => b["Book Id"] === bookId);
          setBook(foundBook || null);
          console.log("Book details fetched:", foundBook);
        },
      });
    };

    fetchCSV();
  }, [bookId]);

  if (!book) return <div>Loading...</div>;

  return (
    <div>
      <h1>{String(book["Title"])}</h1>
      <p><strong>Author:</strong> {String(book["Author"])}</p>
      <p><strong>Tags:</strong> {String(book["Bookshelves"])
        .split(", ")
        .map(tag =>
            tag
                .replace(/-/g, " ")
                .replace(/\b\w/g, c => c.toUpperCase())
        )
        .join(", ")
    }</p>
      <p><strong>Average Rating:</strong> {String(book["Average Rating"])}</p>
      <p><strong>Year Published:</strong> {String(book["Year Published"])}</p>
      <Link to="/to-read">Back to To-Read List</Link>
    </div>
  );
}

export default BookDetails;