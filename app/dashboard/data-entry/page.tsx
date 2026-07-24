"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import { FileSpreadsheetIcon, KeyboardIcon } from "lucide-react";

import { useClient, useClients } from "@/hooks/use-clients";
import { useCreateManualDraft } from "@/hooks/use-manual-entry";
import { PageHeader } from "@/components/page-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function CreateManualDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const [clientId, setClientId] = useState<number | null>(null);
  const [branchId, setBranchId] = useState<number | null>(null);
  const [period, setPeriod] = useState(currentMonth());
  const [error, setError] = useState<string | null>(null);

  const clientsQuery = useClients({ status: "active", page: 1 });
  const clients = clientsQuery.data?.data ?? [];
  const clientQuery = useClient(clientId ?? 0);
  const branches = clientQuery.data?.branches ?? [];
  const create = useCreateManualDraft();

  const submit = () => {
    if (clientId === null || branchId === null) {
      setError("اختر العميل والفرع.");
      return;
    }
    setError(null);
    create.mutate(
      { clientId, branchId, period },
      {
        onSuccess: (batch) => router.push(`/dashboard/data-entry/manual/${batch.id}`),
        onError: (mutationError) => {
          setError(
            isAxiosError(mutationError) && typeof mutationError.response?.data?.message === "string"
              ? mutationError.response.data.message
              : "تعذّر إنشاء المسودة.",
          );
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>بدء إدخال يدوي جديد</DialogTitle>
        </DialogHeader>

        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>العميل</Label>
            <Select
              value={clientId ? String(clientId) : ""}
              onValueChange={(value) => {
                setClientId(Number(value));
                setBranchId(null);
              }}
            >
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder="اختر عميلًا" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={String(client.id)}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>الفرع</Label>
            <Select
              value={branchId ? String(branchId) : ""}
              onValueChange={(value) => setBranchId(Number(value))}
              disabled={clientId === null}
            >
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder="اختر فرعًا" />
              </SelectTrigger>
              <SelectContent>
                {branches.map((branch) => (
                  <SelectItem key={branch.id} value={String(branch.id)}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="manual-period">شهر التقرير</Label>
            <Input
              id="manual-period"
              type="month"
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
              className="h-9 w-44"
              dir="ltr"
            />
          </div>
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" disabled={create.isPending} />}>إلغاء</DialogClose>
          <Button onClick={submit} disabled={create.isPending}>
            بدء الإدخال
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function DataEntryPage() {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="flex w-full flex-col gap-6">
      <PageHeader title="إدخال البيانات" description="اختر طريقة إدخال بيانات الأداء" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileSpreadsheetIcon className="size-5 text-primary" />
              رفع ملف Excel
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              ارفع قالب الأداء المعتمد ليُقرأ ويُتحقق منه ويُحفظ كمسودة.
            </p>
            <Button variant="outline" className="w-fit" render={<Link href="/dashboard/imports" />}>
              فتح استيراد Excel
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <KeyboardIcon className="size-5 text-primary" />
              إدخال يدوي
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              أدخل بيانات الأداء يدويًا قسمًا قسمًا مع نفس التحقق ودورة المراجعة.
            </p>
            <Button className="w-fit" onClick={() => setCreateOpen(true)}>
              بدء إدخال يدوي
            </Button>
          </CardContent>
        </Card>
      </div>

      <CreateManualDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
