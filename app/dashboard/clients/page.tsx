"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PencilIcon, PlusIcon } from "lucide-react";

import { useClients } from "@/hooks/use-clients";
import type { Client, EntityStatus } from "@/lib/clients";
import { StatusBadge } from "@/components/clients/status";
import { ClientFormDialog } from "@/components/clients/client-form-dialog";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type StatusFilter = "all" | EntityStatus;

export default function ClientsPage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);

  // Debounce applies to the free-text search only; status filter changes apply
  // immediately — no artificial delay on a bounded toggle.
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

  const columns: DataTableColumn<Client>[] = [
    {
      key: "name",
      header: "الاسم",
      cell: (client) => (
        <Link href={`/dashboard/clients/${client.id}`} className="font-medium hover:underline">
          {client.name}
        </Link>
      ),
    },
    {
      key: "code",
      header: "الرمز",
      align: "center",
      cell: (client) => (
        <span dir="ltr" className="font-mono text-xs">
          {client.code}
        </span>
      ),
    },
    { key: "status", header: "الحالة", align: "center", cell: (client) => <StatusBadge status={client.status} /> },
    { key: "branches", header: "الفروع", align: "center", cell: (client) => <span className="tabular-nums">{client.branches_count ?? 0}</span> },
    { key: "users", header: "المستخدمون", align: "center", cell: (client) => <span className="tabular-nums">{client.users_count ?? 0}</span> },
    {
      key: "actions",
      header: "إجراءات",
      align: "center",
      cell: (client) => (
        <Button variant="ghost" size="icon-sm" onClick={() => setEditing(client)} aria-label="تعديل العميل">
          <PencilIcon />
        </Button>
      ),
    },
  ];

  return (
    <div className="flex w-full flex-col gap-6">
      <PageHeader
        title="العملاء"
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <PlusIcon />
            إضافة عميل
          </Button>
        }
      />

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

      <DataTable
        columns={columns}
        rows={clients}
        rowKey={(client) => client.id}
        isLoading={query.isLoading}
        isError={query.isError}
        errorLabel="تعذّر تحميل العملاء. حاول مرة أخرى."
        emptyLabel="لا يوجد عملاء مطابقون."
      />

      <Pagination meta={meta} onPageChange={setPage} />

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
