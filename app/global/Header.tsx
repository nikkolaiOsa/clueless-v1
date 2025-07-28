import React from "react";
import { Link } from "react-router";

type HeaderProps = {
  title: string;
  children?: React.ReactNode;
};

function Header({ title, children }: HeaderProps) {
  return (
    <header
      style={{
        padding: "16px 0",
        marginBottom: 24,
        borderBottom: "1px solid #eee",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <h1 style={{ margin: 0, fontSize: 28 }}><Link to="/">{title}</Link></h1>
        <Link to="/to-read" style={{ fontSize: 18, textDecoration: "none", color: "#0070f3" }}>
          To-Read
        </Link>
          <Link to="/read" style={{ fontSize: 18, textDecoration: "none", color: "#0070f3" }}>
          Read
        </Link>
      </div>
      <div>{children}</div>
    </header>
  );
}

export default Header;