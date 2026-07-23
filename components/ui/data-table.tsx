"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Align = "start" | "center" | "end";

const alignClass: Record<Align, string> = {
  start: "text-start",
  center: "text-center",
  end: "text-end",
};

export type DataTableColumn<T> = {
  key: string;
  header: React.ReactNode;
  cell: (row: T) => React.ReactNode;
  align?: Align;
  className?: string;
  headerClassName?: string;
};

type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => React.Key;
  isLoading?: boolean;
  isError?: boolean;
  errorLabel?: string;
  emptyLabel?: string;
  skeletonRows?: number;
  className?: string;
  bare?: boolean;
};

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  isLoading = false,
  isError = false,
  errorLabel = "تعذّر تحميل البيانات.",
  emptyLabel = "لا توجد بيانات.",
  skeletonRows = 5,
  className,
  bare = false,
}: DataTableProps<T>) {
  return (
    <div
      className={cn(
        "w-full overflow-x-auto",
        !bare && "rounded-lg border bg-card",
        className,
      )}
    >
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={column.key}
                className={cn(alignClass[column.align ?? "start"], column.headerClassName)}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: skeletonRows }).map((_, rowIndex) => (
              <TableRow key={`skeleton-${rowIndex}`} aria-hidden="true">
                {columns.map((column) => (
                  <TableCell key={column.key} className={alignClass[column.align ?? "start"]}>
                    <div className="mx-auto h-4 w-full max-w-28 animate-pulse rounded bg-muted" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : isError ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="py-10 text-center text-destructive">
                {errorLabel}
              </TableCell>
            </TableRow>
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="py-10 text-center text-muted-foreground">
                {emptyLabel}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={rowKey(row)}>
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    className={cn(alignClass[column.align ?? "start"], column.className)}
                  >
                    {column.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
