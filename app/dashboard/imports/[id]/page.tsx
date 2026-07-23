"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowRightIcon, Trash2Icon } from "lucide-react";

import { useDeleteImport, useImport } from "@/hooks/use-imports";
import { ImportStatusBadge } from "@/components/imports/import-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const previewColumns: { key: string; label: string }[] = [
  { key: "date", label: "التاريخ" },
  { key: "gross_sales_ex_vat", label: "إجمالي المبيعات" },
  { key: "discounts", label: "الخصومات" },
  { key: "returns", label: "المرتجعات" },
  { key: "net_sales_ex_vat", label: "صافي المبيعات" },
  { key: "vat_amount", label: "الضريبة" },
  { key: "order_count", label: "الطلبات" },
  { key: "operating_status", label: "الحالة" },
];

function cell(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

export default function ImportDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = Number(params.id);
  const query = useImport(id);
  const deleteImport = useDeleteImport();

  if (query.isLoading) {
    return <p className="py-10 text-center text-muted-foreground">جارٍ التحميل...</p>;
  }

  if (query.isError || !query.data) {
    return <p className="py-10 text-center text-destructive">تعذّر تحميل عملية الاستيراد.</p>;
  }

  const batch = query.data;
  const rows = batch.rows ?? [];

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <Link
        href="/dashboard/imports"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowRightIcon className="size-4" />
        عمليات الاستيراد
      </Link>

      <Card>
        <CardHeader className="flex-row items-start justify-between gap-3">
          <div className="flex flex-col gap-2">
            <CardTitle className="text-lg">{batch.client_name}</CardTitle>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span>الفرع: {batch.branch_name}</span>
              <span dir="ltr">الفترة: {batch.reporting_period}</span>
              <span className="max-w-60 truncate" title={batch.original_filename}>
                الملف: {batch.original_filename}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <ImportStatusBadge status={batch.status} />
              <span className="text-muted-foreground">صفوف صحيحة: {batch.row_count}</span>
              <span className="text-muted-foreground">أخطاء: {batch.error_count}</span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={deleteImport.isPending}
            onClick={() =>
              deleteImport.mutate(batch.id, {
                onSuccess: () => router.push("/dashboard/imports"),
              })
            }
          >
            <Trash2Icon />
            حذف
          </Button>
        </CardHeader>
      </Card>

      {batch.errors.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-destructive">أخطاء التحقق</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الصف</TableHead>
                    <TableHead>العمود</TableHead>
                    <TableHead>القيمة</TableHead>
                    <TableHead>السبب</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batch.errors.map((error, index) => (
                    <TableRow key={`${error.row}-${error.column}-${index}`}>
                      <TableCell>{error.row === 0 ? "—" : error.row}</TableCell>
                      <TableCell dir="ltr" className="text-start">{error.column}</TableCell>
                      <TableCell>{cell(error.value)}</TableCell>
                      <TableCell>{error.reason}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {rows.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">معاينة البيانات ({rows.length} صف)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {previewColumns.map((column) => (
                      <TableHead key={column.key}>{column.label}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.row_number}>
                      {previewColumns.map((column) => (
                        <TableCell key={column.key}>{cell(row.data[column.key])}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
