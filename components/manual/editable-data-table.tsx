"use client";

import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";

import type { ImportRow } from "@/lib/imports";
import { fieldLabel, optionLabel, type ManualField, type ManualSheetSchema } from "@/lib/manual-entry";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function cellValue(field: ManualField, value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (field.type === "enum" || field.type === "scope" || field.type === "scope_only") {
    return optionLabel(String(value));
  }
  return String(value);
}

export function EditableDataTable({
  schema,
  rows,
  readOnly,
  deletingId,
  onAdd,
  onEdit,
  onDelete,
}: {
  schema: ManualSheetSchema;
  rows: ImportRow[];
  readOnly: boolean;
  deletingId: number | null;
  onAdd: () => void;
  onEdit: (row: ImportRow) => void;
  onDelete: (row: ImportRow) => void;
}) {
  const columnCount = schema.fields.length + (readOnly ? 0 : 1);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground tabular-nums">{rows.length} صف</span>
        {readOnly ? null : (
          <Button size="sm" onClick={onAdd}>
            <PlusIcon />
            إضافة صف
          </Button>
        )}
      </div>

      <div className="w-full overflow-x-auto rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              {schema.fields.map((field) => (
                <TableHead key={field.name} className="whitespace-nowrap text-center">
                  {fieldLabel(field.name)}
                </TableHead>
              ))}
              {readOnly ? null : <TableHead className="text-center">إجراءات</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columnCount} className="py-8 text-center text-muted-foreground">
                  لا توجد صفوف بعد.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  {schema.fields.map((field) => {
                    const numeric = field.type === "decimal" || field.type === "integer";
                    return (
                      <TableCell
                        key={field.name}
                        className={numeric ? "text-center tabular-nums" : "text-start"}
                        dir={numeric ? "ltr" : undefined}
                      >
                        {cellValue(field, row.data[field.name])}
                      </TableCell>
                    );
                  })}
                  {readOnly ? null : (
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-1">
                        <Button variant="ghost" size="icon-sm" aria-label="تعديل" onClick={() => onEdit(row)}>
                          <PencilIcon />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="حذف"
                          disabled={deletingId === row.id}
                          onClick={() => onDelete(row)}
                        >
                          <Trash2Icon />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
