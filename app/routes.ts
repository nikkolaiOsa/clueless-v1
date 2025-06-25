import { type RouteConfig, index } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    ToRead("routes/to-read.tsx"),
    BookDetails("routes/details.$bookId.tsx")
] satisfies RouteConfig;

function ToRead(path: string): import("@react-router/dev/routes").RouteConfigEntry {
    return {
        path: "/to-read",
        file: path,
    };
}

function BookDetails(path: string): import("@react-router/dev/routes").RouteConfigEntry {
    return {   
        path: "/details/:bookId",
        file: path,
    };
}           