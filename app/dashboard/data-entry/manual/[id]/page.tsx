"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import { ArrowRightIcon, CheckCircle2Icon, SendIcon } from "lucide-react";

import {
  useAddManualRow,
  useDeleteManualRow,
  useManualEntry,
  useManualSchema,
  useSubmitManual,
  useUpdateManualRow,
  useValidateManual,
} from "@/hooks/use-manual-entry";
import type { ImportRow } from "@/lib/imports";
import type { ManualSheetSchema, ManualValidationError, ManualValidationResult } from "@/lib/manual-entry";
import { MANUAL_SHEETS } from "@/lib/manual-entry";
import { ImportStatusBadge } from "@/components/imports/import-status-badge";
import { EditableDataTable } from "@/components/manual/editable-data-table";
import { RowFormDialog } from "@/components/manual/row-form-dialog";
import { SaveStatusIndicator, type SaveStatus } from "@/components/manual/save-status-indicator";
import { SheetNavigation } from "@/components/manual/sheet-navigation";
import { ValidationSummary } from "@/components/manual/validation-summary";
import { PageHeader } from "@/components/page-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

function rowErrorsOf(error: unknown): ManualValidationError[] {
  if (isAxiosError(error) && Array.isArray(error.response?.data?.errors)) {
    return error.response.data.errors as ManualValidationError[];
  }
  return [];
}

export default function ManualEntryPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = Number(params.id);

  const batchQuery = useManualEntry(id);
  const schemaQuery = useManualSchema();

  const addRow = useAddManualRow(id);
  const updateRow = useUpdateManualRow(id);
  const deleteRow = useDeleteManualRow(id);
  const validate = useValidateManual(id);
  const submit = useSubmitManual(id);

  const [activeSheet, setActiveSheet] = useState<string>(MANUAL_SHEETS[0]);
  const [dialog, setDialog] = useState<{ sheet: string; row?: ImportRow } | null>(null);
  const [dialogErrors, setDialogErrors] = useState<ManualValidationError[]>([]);
  const [validation, setValidation] = useState<ManualValidationResult | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  const batch = batchQuery.data;
  const schema = schemaQuery.data;

  const rowsBySheet = useMemo(() => {
    const map: Record<string, ImportRow[]> = {};
    for (const row of batch?.rows ?? []) {
      (map[row.sheet_name] ??= []).push(row);
    }
    return map;
  }, [batch]);

  const schemaBySheet = useMemo(() => {
    const map: Record<string, ManualSheetSchema> = {};
    for (const sheet of schema ?? []) {
      map[sheet.sheet] = sheet;
    }
    return map;
  }, [schema]);

  if (batchQuery.isLoading || schemaQuery.isLoading) {
    return <p className="py-10 text-center text-muted-foreground">جارٍ التحميل...</p>;
  }

  if (batchQuery.isError || !batch || !schema) {
    return <p className="py-10 text-center text-destructive">تعذّر تحميل الإدخال اليدوي.</p>;
  }

  const readOnly = batch.status !== "draft";
  const activeSchema = schemaBySheet[activeSheet];
  const branch = { code: batch.branch_code ?? "", name: batch.branch_name ?? null };

  const tabs = MANUAL_SHEETS.map((sheet) => ({
    sheet,
    count: rowsBySheet[sheet]?.length ?? 0,
    errorCount: validation?.errors.filter((error) => error.sheet === sheet).length ?? 0,
  }));

  const markSaved = () => {
    setSaveStatus("saved");
    setSavedAt(new Date());
  };

  const saveRow = (data: Record<string, string>) => {
    setSaveStatus("saving");
    setDialogErrors([]);
    const handlers = {
      onSuccess: () => {
        setDialog(null);
        markSaved();
      },
      onError: (error: unknown) => {
        setSaveStatus("error");
        setDialogErrors(rowErrorsOf(error));
      },
    };

    if (dialog?.row) {
      updateRow.mutate({ rowId: dialog.row.id, data }, handlers);
    } else if (dialog) {
      addRow.mutate({ sheet: dialog.sheet, data }, handlers);
    }
  };

  const removeRow = (row: ImportRow) => {
    setSaveStatus("saving");
    deleteRow.mutate(row.id, {
      onSuccess: markSaved,
      onError: () => setSaveStatus("error"),
    });
  };

  const runValidation = () => {
    validate.mutate(undefined, { onSuccess: setValidation });
  };

  const runSubmit = () => {
    submit.mutate(undefined, {
      onSuccess: () => router.push(`/dashboard/imports/${id}`),
      onError: (error) => {
        const errors = rowErrorsOf(error);
        setValidation({ valid: false, row_count: 0, error_count: errors.length, errors });
      },
    });
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <Link
        href="/dashboard/data-entry"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowRightIcon className="size-4" />
        إدخال البيانات
      </Link>

      <PageHeader title={`إدخال يدوي — ${batch.client_name ?? ""}`} />

      <Card>
        <CardHeader className="gap-3">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span>الفرع: {batch.branch_name}</span>
            <span dir="ltr">الفترة: {batch.reporting_period}</span>
            <ImportStatusBadge status={batch.status} />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SaveStatusIndicator status={saveStatus} savedAt={savedAt} />
            {readOnly ? null : (
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={runValidation} disabled={validate.isPending}>
                  <CheckCircle2Icon />
                  تحقق كامل
                </Button>
                <Button onClick={runSubmit} disabled={submit.isPending}>
                  <SendIcon />
                  إرسال للمراجعة
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        {readOnly ? (
          <CardContent>
            <Alert>
              <AlertDescription>
                هذا الإدخال في حالة مراجعة أو أبعد ولا يمكن تعديله.{" "}
                <Link href={`/dashboard/imports/${id}`} className="underline">
                  عرض تفاصيل العملية
                </Link>
              </AlertDescription>
            </Alert>
          </CardContent>
        ) : null}
      </Card>

      {validation ? <ValidationSummary result={validation} /> : null}

      <SheetNavigation tabs={tabs} active={activeSheet} onSelect={setActiveSheet} />

      {activeSchema ? (
        <EditableDataTable
          schema={activeSchema}
          rows={rowsBySheet[activeSheet] ?? []}
          readOnly={readOnly}
          deletingId={deleteRow.isPending ? (deleteRow.variables ?? null) : null}
          onAdd={() => {
            setDialogErrors([]);
            setDialog({ sheet: activeSheet });
          }}
          onEdit={(row) => {
            setDialogErrors([]);
            setDialog({ sheet: row.sheet_name, row });
          }}
          onDelete={removeRow}
        />
      ) : null}

      {dialog && schemaBySheet[dialog.sheet] ? (
        <RowFormDialog
          key={`${dialog.sheet}-${dialog.row?.id ?? "new"}`}
          open
          onOpenChange={(open) => {
            if (!open) setDialog(null);
          }}
          schema={schemaBySheet[dialog.sheet]}
          branch={branch}
          period={batch.reporting_period}
          row={dialog.row}
          errors={dialogErrors}
          pending={addRow.isPending || updateRow.isPending}
          onSave={saveRow}
        />
      ) : null}
    </div>
  );
}
