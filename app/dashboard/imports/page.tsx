"use client";

import { useState } from "react";
import Link from "next/link";
import { EyeIcon, PlusIcon, Trash2Icon } from "lucide-react";

import { useDeleteImport, useImports } from "@/hooks/use-imports";
import { ImportStatusBadge } from "@/components/imports/import-status-badge";
import { ImportUploadDialog } from "@/components/imports/import-upload-dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ImportsPage() {
  const [page, setPage] = useState(1);
  const [uploadOpen, setUploadOpen] = useState(false);
  const query = useImports(page);
  const deleteImport = useDeleteImport();

  const batches = query.data?.data ?? [];
  const meta = query.data?.meta;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">استيراد بيانات الأداء</h1>
        <Button onClick={() => setUploadOpen(true)}>
          <PlusIcon />
          رفع ملف جديد
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>العميل</TableHead>
              <TableHead>الفرع</TableHead>
              <TableHead>الفترة</TableHead>
              <TableHead>الملف</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>الصفوف</TableHead>
              <TableHead>الأخطاء</TableHead>
              <TableHead className="text-end">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                  جارٍ التحميل...
                </TableCell>
              </TableRow>
            ) : query.isError ? (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-destructive">
                  تعذّر تحميل عمليات الاستيراد.
                </TableCell>
              </TableRow>
            ) : batches.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                  لا توجد عمليات استيراد بعد.
                </TableCell>
              </TableRow>
            ) : (
              batches.map((batch) => (
                <TableRow key={batch.id}>
                  <TableCell className="font-medium">{batch.client_name ?? "—"}</TableCell>
                  <TableCell>{batch.branch_name ?? "—"}</TableCell>
                  <TableCell dir="ltr" className="text-start">{batch.reporting_period}</TableCell>
                  <TableCell className="max-w-40 truncate" title={batch.original_filename}>
                    {batch.original_filename}
                  </TableCell>
                  <TableCell>
                    <ImportStatusBadge status={batch.status} />
                  </TableCell>
                  <TableCell>{batch.row_count}</TableCell>
                  <TableCell>{batch.error_count}</TableCell>
                  <TableCell className="text-end">
                    <div className="flex justify-end gap-1">
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
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {meta && meta.last_page > 1 ? (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            صفحة {meta.current_page} من {meta.last_page}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={meta.current_page <= 1}
              onClick={() => setPage((current) => current - 1)}
            >
              السابق
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={meta.current_page >= meta.last_page}
              onClick={() => setPage((current) => current + 1)}
            >
              التالي
            </Button>
          </div>
        </div>
      ) : null}

      <ImportUploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
    </div>
  );
}
