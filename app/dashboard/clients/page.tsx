"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PencilIcon, PlusIcon } from "lucide-react";

import { useClients } from "@/hooks/use-clients";
import type { Client, EntityStatus } from "@/lib/clients";
import { StatusBadge } from "@/components/clients/status";
import { ClientFormDialog } from "@/components/clients/client-form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type StatusFilter = "all" | EntityStatus;

export default function ClientsPage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const query = useClients({
    search,
    status: status === "all" ? "" : status,
    page,
  });

  const clients = query.data?.data ?? [];
  const meta = query.data?.meta;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">العملاء</h1>
        <Button onClick={() => setCreateOpen(true)}>
          <PlusIcon />
          إضافة عميل
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="ابحث بالاسم أو الرمز"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          className="h-9 max-w-xs"
        />
        <Select
          value={status}
          onValueChange={(next) => {
            setStatus(next as StatusFilter);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-9 w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الحالات</SelectItem>
            <SelectItem value="active">نشط</SelectItem>
            <SelectItem value="inactive">غير نشط</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الاسم</TableHead>
              <TableHead>الرمز</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>الفروع</TableHead>
              <TableHead>المستخدمون</TableHead>
              <TableHead className="text-end">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  جارٍ التحميل...
                </TableCell>
              </TableRow>
            ) : query.isError ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-destructive">
                  تعذّر تحميل العملاء. حاول مرة أخرى.
                </TableCell>
              </TableRow>
            ) : clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  لا يوجد عملاء مطابقون.
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">
                    <Link href={`/dashboard/clients/${client.id}`} className="hover:underline">
                      {client.name}
                    </Link>
                  </TableCell>
                  <TableCell dir="ltr" className="text-start">{client.code}</TableCell>
                  <TableCell>
                    <StatusBadge status={client.status} />
                  </TableCell>
                  <TableCell>{client.branches_count ?? 0}</TableCell>
                  <TableCell>{client.users_count ?? 0}</TableCell>
                  <TableCell className="text-end">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setEditing(client)}
                      aria-label="تعديل العميل"
                    >
                      <PencilIcon />
                    </Button>
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

      <ClientFormDialog open={createOpen} onOpenChange={setCreateOpen} />
      <ClientFormDialog
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
        client={editing ?? undefined}
      />
    </div>
  );
}
