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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>الرمز</TableHead>
                <TableHead>المدينة</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead className="text-end">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {client.branches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                    لا توجد فروع بعد.
                  </TableCell>
                </TableRow>
              ) : (
                client.branches.map((branch) => (
                  <TableRow key={branch.id}>
                    <TableCell className="font-medium">{branch.name}</TableCell>
                    <TableCell dir="ltr" className="text-start">{branch.code}</TableCell>
                    <TableCell>{branch.city ?? "—"}</TableCell>
                    <TableCell>
                      <StatusBadge status={branch.status} />
                    </TableCell>
                    <TableCell className="text-end">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setBranchDialog({ open: true, branch })}
                        aria-label="تعديل الفرع"
                      >
                        <PencilIcon />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>البريد الإلكتروني</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead className="text-end">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {client.users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                    لا يوجد مستخدمون بعد.
                  </TableCell>
                </TableRow>
              ) : (
                client.users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell dir="ltr" className="text-start">{user.email}</TableCell>
                    <TableCell>
                      <StatusBadge status={user.is_active ? "active" : "inactive"} />
                    </TableCell>
                    <TableCell className="text-end">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setUserDialog({ open: true, user })}
                        aria-label="تعديل المستخدم"
                      >
                        <PencilIcon />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
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
