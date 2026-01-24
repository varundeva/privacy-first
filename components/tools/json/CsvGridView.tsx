'use client';

import { useMemo } from 'react';
import Papa from 'papaparse';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface CsvGridViewProps {
    data: string;
}

export function CsvGridView({ data }: CsvGridViewProps) {
    const parsedData = useMemo(() => {
        if (!data) return [];
        const result = Papa.parse(data, {
            skipEmptyLines: true,
            header: false
        });
        return result.data as string[][];
    }, [data]);

    if (!data.trim()) {
        return <div className="p-8 text-center text-muted-foreground flex items-center justify-center h-full text-sm">No data to display</div>;
    }

    if (parsedData.length === 0) {
        return <div className="p-8 text-center text-muted-foreground flex items-center justify-center h-full text-sm">Empty CSV</div>;
    }

    const headers = parsedData[0];
    const rows = parsedData.slice(1);

    return (
        <ScrollArea className="h-full w-full bg-background rounded-md">
            <div className="min-w-max">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-b-2">
                            {headers.map((header, i) => (
                                <TableHead key={i} className="font-bold bg-muted/40 text-foreground min-w-[120px] whitespace-nowrap h-9 py-2">
                                    {header}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.length > 0 ? rows.map((row, rowIndex) => (
                            <TableRow key={rowIndex} className="even:bg-muted/10">
                                {headers.map((_, colIndex) => (
                                    <TableCell key={colIndex} className="font-mono text-xs max-w-[300px] truncate py-1.5 border-r last:border-r-0 border-border/40" title={row[colIndex]}>
                                        {row[colIndex]}
                                    </TableCell>
                                ))}
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={headers.length} className="text-center py-8 text-muted-foreground">
                                    No rows found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <ScrollBar orientation="horizontal" />
            <ScrollBar orientation="vertical" />
        </ScrollArea>
    );
}
