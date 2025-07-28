import { type RouteConfig, index } from "@react-router/dev/routes";


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

function ReadBooks(path: string): import("@react-router/dev/routes").RouteConfigEntry {
    return {        
        path: "/read",
        file: path,
    };  
}

export default [
    index("routes/home.tsx"),
    ToRead("routes/to-read.tsx"),
    BookDetails("pages/details.$bookId.tsx"),
    ReadBooks("routes/read.tsx"),
] satisfies RouteConfig;