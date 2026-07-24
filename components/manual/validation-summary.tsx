"use client";

import { AlertTriangleIcon, CheckCircle2Icon } from "lucide-react";

import { sheetLabel } from "@/lib/import-sheets";
import { fieldLabel, type ManualValidationResult } from "@/lib/manual-entry";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function ValidationSummary({ result }: { result: ManualValidationResult | null }) {
  if (result === null) {
    return null;
  }

  if (result.valid) {
    return (
      <Alert>
        <CheckCircle2Icon />
        <AlertDescription>البيانات صحيحة وجاهزة للإرسال للمراجعة.</AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="destructive">
      <AlertTriangleIcon />
      <AlertTitle>{result.error_count} خطأ في البيانات</AlertTitle>
      <AlertDescription>
        <ul className="mt-1 flex list-disc flex-col gap-1 ps-4">
          {result.errors.slice(0, 20).map((error, index) => (
            <li key={`${error.sheet}-${error.row}-${error.column}-${index}`}>
              {sheetLabel(error.sheet)} · صف <span className="tabular-nums">{error.row}</span>
              {error.column ? ` · ${fieldLabel(error.column)}` : ""} — {error.reason}
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
