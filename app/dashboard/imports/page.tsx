"use client";

import { useState } from "react";
import Link from "next/link";
import { EyeIcon, PlusIcon, Trash2Icon } from "lucide-react";

import { useDeleteImport, useImports } from "@/hooks/use-imports";
import type { ImportBatch } from "@/lib/imports";
import { ImportStatusBadge } from "@/components/imports/import-status-badge";
import { ImportUploadDialog } from "@/components/imports/import-upload-dialog";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";

export default function ImportsPage() {
  const [page, setPage] = useState(1);
  const [uploadOpen, setUploadOpen] = useState(false);
  const query = useImports(page);
  const deleteImport = useDeleteImport();

  const batches = query.data?.data ?? [];
  const meta = query.data?.meta;

  const columns: DataTableColumn<ImportBatch>[] = [
    { key: "client", header: "العميل", cell: (batch) => <span className="font-medium">{batch.client_name ?? "—"}</span> },
    { key: "branch", header: "الفرع", cell: (batch) => batch.branch_name ?? "—" },
    {
      key: "period",
      header: "الفترة",
      align: "center",
      cell: (batch) => (
        <span dir="ltr" className="tabular-nums">
          {batch.reporting_period}
        </span>
      ),
    },
    {
      key: "file",
      header: "الملف",
      cell: (batch) => (
        <span className="block max-w-40 truncate" title={batch.original_filename}>
          {batch.original_filename}
        </span>
      ),
    },
    { key: "status", header: "الحالة", align: "center", cell: (batch) => <ImportStatusBadge status={batch.status} /> },
    { key: "rows", header: "الصفوف", align: "center", cell: (batch) => <span className="tabular-nums">{batch.row_count}</span> },
    { key: "errors", header: "الأخطاء", align: "center", cell: (batch) => <span className="tabular-nums">{batch.error_count}</span> },
    {
      key: "actions",
      header: "إجراءات",
      align: "center",
      cell: (batch) => (
        <div className="flex justify-center gap-1">
          <Button variant="ghost" size="icon-sm" aria-label="عرض" render={<Link href={`/dashboard/imports/${batch.id}`} />}>
            <EyeIcon />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="حذف"
            disabled={deleteImport.isPending}
            onClick={() => deleteImport.mutate(batch.id)}
          >
            <Trash2Icon />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex w-full flex-col gap-6">
      <PageHeader
        title="استيراد بيانات الأداء"
        actions={
          <Button onClick={() => setUploadOpen(true)}>
            <PlusIcon />
            رفع ملف جديد
          </Button>
        }
      />

      <DataTable
        columns={columns}
        rows={batches}
        rowKey={(batch) => batch.id}
        isLoading={query.isLoading}
        isError={query.isError}
        errorLabel="تعذّر تحميل عمليات الاستيراد."
        emptyLabel="لا توجد عمليات استيراد بعد."
      />

      <Pagination meta={meta} onPageChange={setPage} />

      <ImportUploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
    </div>
  );
}
