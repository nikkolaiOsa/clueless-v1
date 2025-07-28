import React, { useState } from "react";
import { Link } from "react-router"; // Use react-router-dom for Link

type Suggestion = { label: string; bookId: string };

type SearchBoxProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  suggestions?: Suggestion[];
  onSuggestionClick?: (suggestion: string) => void;
};

function SearchBox({
  value,
  onChange,
  placeholder,
  suggestions = [],
  onSuggestionClick,
}: SearchBoxProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions =
    value && suggestions && suggestions.length > 0
      ? suggestions.filter(
          (s) =>
            s.label &&
            s.label.toLowerCase().includes(value.toLowerCase())
        )
      : [];
    suggestions.forEach(s => {
      console.log("Search Value:", value);
      console.log("Suggestions:", suggestions);
      console.log("Filtered Suggestions:", filteredSuggestions);
      console.log("S:", s.label, "Book ID:", s.bookId);
    });
  return (
    <div style={{ position: "relative", width: "100%" }}>
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setShowSuggestions(true);
        }}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
        onFocus={() => setShowSuggestions(true)}
        placeholder={placeholder || "Search..."}
        style={{
          width: "100%",
          padding: "8px",
          borderRadius: "4px",
          border: "1px solid #ccc",
        }}
        autoComplete="off"
      />
      {showSuggestions && filteredSuggestions.length > 0 && (
        <ul
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "100%",
            border: "1px solid #ccc",
            borderTop: "none",
            zIndex: 10,
            margin: 0,
            padding: 0,
            listStyle: "none",
            maxHeight: 180,
            overflowY: "auto",
            backgroundColor: "var(--color-gray-950)"
          }}
        >
          {filteredSuggestions.map((s, i) => (
            <li
              key={i}
              style={{
                padding: "8px",
                cursor: "pointer",
                borderBottom: "1px solid #eee",
              }}
            >
              <Link
                to={`/details/${s.bookId}`}
                style={{ color: "white", textDecoration: "none" }}
                onClick={() => {
                  onChange(s.label);
                  setShowSuggestions(false);
                  onSuggestionClick?.(s.label);
                }}
              >
                {s.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SearchBox;