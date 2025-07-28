import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import SearchBox from "./SearchBox";

type PredictiveSearchProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

type Suggestion = { label: string; bookId: string };

export default function PredictiveSearch({
  value,
  onChange,
  placeholder,
}: PredictiveSearchProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  useEffect(() => {
    const fetchCSV = async () => {
      const response = await fetch("/goodreads_library_export.csv");
      const csvText = await response.text();
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const data = results.data as Record<string, unknown>[];
          // Collect unique title-author-bookId triples
          const suggArr: Suggestion[] = [];
          const seen = new Set<string>();
          for (const row of data) {
            const title = String(row["Title"] ?? "");
            const author = String(row["Author"] ?? "");
            const bookId = String(row["Book Id"] ?? "");
            if (title && author && bookId) {
              const key = `${title}|||${author}|||${bookId}`;
              if (!seen.has(key)) {
                suggArr.push({ label: `${title} — ${author}`, bookId });
                seen.add(key);
              }
            }
          }
          setSuggestions(suggArr);
        },
      });
    };
    fetchCSV();
  }, []);

  // Filter suggestions based on input value
const filteredSuggestions = value
  ? suggestions.filter(
      s =>
        typeof s.label === "string" &&
        s.label.toLowerCase().includes(value.toLowerCase())
    )
  : suggestions;

  return (
    <SearchBox
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      suggestions={filteredSuggestions}
      onSuggestionClick={onChange}
    />
  );
}