"use client";

import { useMemo, useState } from "react";

import type { ImportRow } from "@/lib/imports";
import { fieldLabel, type ManualSheetSchema, type ManualValidationError } from "@/lib/manual-entry";
import { sheetLabel } from "@/lib/import-sheets";
import { FieldRenderer } from "@/components/manual/field-renderer";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

function periodBounds(period: string): { min: string; max: string } {
  const [year, month] = period.split("-").map(Number);
  const lastDay = new Date(year, month, 0).getDate();
  return { min: `${period}-01`, max: `${period}-${String(lastDay).padStart(2, "0")}` };
}

function toStringValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value);
}

export function RowFormDialog({
  open,
  onOpenChange,
  schema,
  branch,
  period,
  row,
  errors,
  pending,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schema: ManualSheetSchema;
  branch: { code: string; name: string | null };
  period: string;
  row?: ImportRow;
  errors: ManualValidationError[];
  pending: boolean;
  onSave: (data: Record<string, string>) => void;
}) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const field of schema.fields) {
      initial[field.name] = row ? toStringValue(row.data[field.name]) : "";
    }
    return initial;
  });
  const bounds = useMemo(() => periodBounds(period), [period]);
  const errorByColumn = useMemo(() => {
    const map: Record<string, string> = {};
    for (const error of errors) {
      map[error.column] = error.reason;
    }
    return map;
  }, [errors]);

  const submit = () => {
    const data: Record<string, string> = {};
    for (const field of schema.fields) {
      const value = values[field.name]?.trim() ?? "";
      if (value !== "") {
        data[field.name] = value;
      }
    }
    onSave(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] w-full overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {row ? "تعديل صف" : "إضافة صف"} — {sheetLabel(schema.sheet)}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {schema.fields.map((field) => {
            const inputId = `field-${field.name}`;
            const error = errorByColumn[field.name];
            return (
              <div key={field.name} className="flex flex-col gap-1.5">
                <Label htmlFor={inputId}>
                  {fieldLabel(field.name)}
                  {field.required ? <span className="text-destructive"> *</span> : null}
                </Label>
                <FieldRenderer
                  id={inputId}
                  field={field}
                  value={values[field.name] ?? ""}
                  onChange={(value) => setValues((previous) => ({ ...previous, [field.name]: value }))}
                  branch={branch}
                  dateMin={bounds.min}
                  dateMax={bounds.max}
                  invalid={Boolean(error)}
                />
                {error ? <span className="text-xs text-destructive">{error}</span> : null}
              </div>
            );
          })}
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" disabled={pending} />}>إلغاء</DialogClose>
          <Button onClick={submit} disabled={pending}>
            حفظ الصف
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
