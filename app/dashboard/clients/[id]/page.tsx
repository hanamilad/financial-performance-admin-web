"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowRightIcon, PencilIcon, PlusIcon } from "lucide-react";

import { useClient } from "@/hooks/use-clients";
import type { Branch, ClientUser } from "@/lib/clients";
import { StatusBadge } from "@/components/clients/status";
import { ClientFormDialog } from "@/components/clients/client-form-dialog";
import { BranchFormDialog } from "@/components/clients/branch-form-dialog";
import { ClientUserFormDialog } from "@/components/clients/client-user-form-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";

export default function ClientDetailPage() {
  const params = useParams<{ id: string }>();
  const clientId = Number(params.id);
  const query = useClient(clientId);

  const [editClientOpen, setEditClientOpen] = useState(false);
  const [branchDialog, setBranchDialog] = useState<{ open: boolean; branch?: Branch }>({
    open: false,
  });
  const [userDialog, setUserDialog] = useState<{ open: boolean; user?: ClientUser }>({
    open: false,
  });

  if (query.isLoading) {
    return <p className="py-10 text-center text-muted-foreground">جارٍ التحميل...</p>;
  }

  if (query.isError || !query.data) {
    return (
      <p className="py-10 text-center text-destructive">تعذّر تحميل بيانات العميل.</p>
    );
  }

  const client = query.data;

  const branchColumns: DataTableColumn<Branch>[] = [
    { key: "name", header: "الاسم", cell: (branch) => <span className="font-medium">{branch.name}</span> },
    {
      key: "code",
      header: "الرمز",
      align: "center",
      cell: (branch) => (
        <span dir="ltr" className="font-mono text-xs">
          {branch.code}
        </span>
      ),
    },
    { key: "city", header: "المدينة", cell: (branch) => branch.city ?? "—" },
    { key: "status", header: "الحالة", align: "center", cell: (branch) => <StatusBadge status={branch.status} /> },
    {
      key: "actions",
      header: "إجراءات",
      align: "center",
      cell: (branch) => (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setBranchDialog({ open: true, branch })}
          aria-label="تعديل الفرع"
        >
          <PencilIcon />
        </Button>
      ),
    },
  ];

  const userColumns: DataTableColumn<ClientUser>[] = [
    { key: "name", header: "الاسم", cell: (user) => <span className="font-medium">{user.name}</span> },
    {
      key: "email",
      header: "البريد الإلكتروني",
      cell: (user) => (
        <span dir="ltr" className="text-start">
          {user.email}
        </span>
      ),
    },
    {
      key: "status",
      header: "الحالة",
      align: "center",
      cell: (user) => <StatusBadge status={user.is_active ? "active" : "inactive"} />,
    },
    {
      key: "actions",
      header: "إجراءات",
      align: "center",
      cell: (user) => (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setUserDialog({ open: true, user })}
          aria-label="تعديل المستخدم"
        >
          <PencilIcon />
        </Button>
      ),
    },
  ];

  return (
    <div className="flex w-full flex-col gap-6">
      <Link
        href="/dashboard/clients"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowRightIcon className="size-4" />
        العملاء
      </Link>

      <Card>
        <CardHeader className="flex-row items-start justify-between gap-3">
          <div className="flex flex-col gap-1.5">
            <CardTitle className="text-lg">{client.name}</CardTitle>
            <div className="flex items-center gap-2">
              <span dir="ltr" className="text-sm text-muted-foreground">
                {client.code}
              </span>
              <StatusBadge status={client.status} />
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setEditClientOpen(true)}>
            <PencilIcon />
            تعديل
          </Button>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">الفروع</CardTitle>
          <Button size="sm" onClick={() => setBranchDialog({ open: true })}>
            <PlusIcon />
            إضافة فرع
          </Button>
        </CardHeader>
        <CardContent>
          <DataTable
            bare
            columns={branchColumns}
            rows={client.branches}
            rowKey={(branch) => branch.id}
            emptyLabel="لا توجد فروع بعد."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">المستخدمون</CardTitle>
          <Button size="sm" onClick={() => setUserDialog({ open: true })}>
            <PlusIcon />
            إضافة مستخدم
          </Button>
        </CardHeader>
        <CardContent>
          <DataTable
            bare
            columns={userColumns}
            rows={client.users}
            rowKey={(user) => user.id}
            emptyLabel="لا يوجد مستخدمون بعد."
          />
        </CardContent>
      </Card>

      <ClientFormDialog open={editClientOpen} onOpenChange={setEditClientOpen} client={client} />
      <BranchFormDialog
        open={branchDialog.open}
        onOpenChange={(open) => setBranchDialog((current) => ({ ...current, open }))}
        clientId={client.id}
        branch={branchDialog.branch}
      />
      <ClientUserFormDialog
        open={userDialog.open}
        onOpenChange={(open) => setUserDialog((current) => ({ ...current, open }))}
        clientId={client.id}
        user={userDialog.user}
      />
    </div>
  );
}
