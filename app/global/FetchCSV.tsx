import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { useNavigate, useLocation } from 'react-router';    
    
export default function FetchCSV(csvPath: string) {
    const [data, setData] = useState<Record<string, unknown>[]>([]);
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
    return (data)
};