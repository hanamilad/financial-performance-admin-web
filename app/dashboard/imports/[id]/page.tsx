"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowRightIcon } from "lucide-react";

import { useImport } from "@/hooks/use-imports";
import type { ImportBatchDetail, ImportError, ImportRow } from "@/lib/imports";
import { formatCell, isNumericValue, sheetLabel } from "@/lib/import-sheets";
import { ImportStatusBadge } from "@/components/imports/import-status-badge";
import { ImportWorkflow } from "@/components/imports/import-workflow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";

function SheetTabs({
  sheets,
  active,
  onSelect,
}: {
  sheets: ImportBatchDetail["sheets"];
  active: string;
  onSelect: (sheet: string) => void;
}) {
  return (
    <div role="tablist" aria-label="أوراق الملف" className="flex flex-wrap gap-2">
      {sheets.map((summary) => {
        const selected = summary.sheet === active;
        return (
          <button
            key={summary.sheet}
            role="tab"
            type="button"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onSelect(summary.sheet)}
            className={[
              "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              selected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground hover:bg-muted",
            ].join(" ")}
          >
            <span>{sheetLabel(summary.sheet)}</span>
            {summary.error_count > 0 ? (
              <span
                className={[
                  "rounded-full px-1.5 text-xs tabular-nums",
                  selected ? "bg-primary-foreground/20" : "bg-destructive/10 text-destructive",
                ].join(" ")}
              >
                {summary.error_count} خطأ
              </span>
            ) : (
              <span
                className={[
                  "rounded-full px-1.5 text-xs tabular-nums",
                  selected ? "bg-primary-foreground/20" : "bg-muted text-muted-foreground",
                ].join(" ")}
              >
                {summary.row_count} صف
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function ErrorsTable({ errors }: { errors: ImportError[] }) {
  const columns: DataTableColumn<ImportError>[] = [
    { key: "row", header: "الصف", align: "center", cell: (error) => (error.row === 0 ? "—" : error.row) },
    {
      key: "column",
      header: "العمود",
      cell: (error) => (
        <span dir="ltr" className="font-mono text-xs">
          {error.column}
        </span>
      ),
    },
    { key: "value", header: "القيمة", align: "center", cell: (error) => formatCell(error.value) },
    { key: "reason", header: "السبب", cell: (error) => error.reason },
  ];

  return (
    <DataTable
      bare
      columns={columns}
      rows={errors}
      rowKey={(error) => `${error.row}-${error.column}-${error.reason}`}
      emptyLabel="لا توجد أخطاء في هذه الورقة."
    />
  );
}

function PreviewTable({ rows }: { rows: ImportRow[] }) {
  const columns = useMemo<DataTableColumn<ImportRow>[]>(() => {
    const keys = Array.from(new Set(rows.flatMap((row) => Object.keys(row.data))));
    return keys.map((key) => {
      const numeric = isNumericValue(rows.find((row) => row.data[key] != null)?.data[key]);
      return {
        key,
        header: (
          <span dir="ltr" className="font-mono text-xs">
            {key}
          </span>
        ),
        align: numeric ? "center" : "start",
        cell: (row: ImportRow) =>
          numeric ? (
            <span className="tabular-nums" dir="ltr">
              {formatCell(row.data[key])}
            </span>
          ) : (
            formatCell(row.data[key])
          ),
      } satisfies DataTableColumn<ImportRow>;
    });
  }, [rows]);

  return (
    <DataTable
      bare
      columns={columns}
      rows={rows}
      rowKey={(row) => row.row_number}
      emptyLabel="لا توجد صفوف محفوظة لهذه الورقة."
    />
  );
}

export default function ImportDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const query = useImport(id);
  const [activeSheet, setActiveSheet] = useState<string | null>(null);

  if (query.isLoading) {
    return <p className="py-10 text-center text-muted-foreground">جارٍ التحميل...</p>;
  }

  if (query.isError || !query.data) {
    return <p className="py-10 text-center text-destructive">تعذّر تحميل عملية الاستيراد.</p>;
  }

  const batch = query.data;
  const sheets = batch.sheets ?? [];
  const active = activeSheet ?? sheets[0]?.sheet ?? null;
  const sheetErrors = active ? batch.errors.filter((error) => error.sheet === active) : batch.errors;
  const sheetRows = active ? batch.rows.filter((row) => row.sheet_name === active) : [];

  return (
    <div className="flex w-full flex-col gap-6">
      <Link
        href="/dashboard/imports"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowRightIcon className="size-4" />
        عمليات الاستيراد
      </Link>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2">
            <CardTitle className="text-lg">{batch.client_name}</CardTitle>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span>الفرع: {batch.branch_name}</span>
              <span dir="ltr">الفترة: {batch.reporting_period}</span>
              <span className="max-w-60 truncate" title={batch.original_filename ?? undefined}>
                {batch.source === "manual" ? "إدخال يدوي" : `الملف: ${batch.original_filename ?? "—"}`}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <ImportStatusBadge status={batch.status} />
              <span className="text-muted-foreground">صفوف صحيحة: {batch.row_count}</span>
              <span className="text-muted-foreground">أخطاء: {batch.error_count}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ImportWorkflow batch={batch} />
        </CardContent>
      </Card>

      {sheets.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-destructive">أخطاء التحقق</CardTitle>
          </CardHeader>
          <CardContent>
            <ErrorsTable errors={batch.errors} />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="gap-4">
            <CardTitle className="text-base">مراجعة الأوراق</CardTitle>
            <SheetTabs sheets={sheets} active={active ?? ""} onSelect={setActiveSheet} />
          </CardHeader>
          <CardContent>
            {sheetErrors.length > 0 ? (
              <div className="flex flex-col gap-3">
                <p className="text-sm font-medium text-destructive">
                  {sheetErrors.length} خطأ في ورقة {sheetLabel(active ?? "")}
                </p>
                <ErrorsTable errors={sheetErrors} />
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-muted-foreground">
                  {sheetRows.length} صف في ورقة {sheetLabel(active ?? "")}
                </p>
                <PreviewTable rows={sheetRows} />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
