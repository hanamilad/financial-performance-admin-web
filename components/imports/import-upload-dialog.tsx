"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import { Loader2Icon, UploadIcon } from "lucide-react";

import { useClients } from "@/hooks/use-clients";
import { getClient } from "@/lib/clients";
import { useQuery } from "@tanstack/react-query";
import { useUploadImport } from "@/hooks/use-imports";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ImportUploadDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>رفع ملف أداء شهري</DialogTitle>
        </DialogHeader>
        <UploadForm
          onDone={(id) => {
            onOpenChange(false);
            router.push(`/dashboard/imports/${id}`);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

type FieldErrors = {
  client?: string;
  branch?: string;
  period?: string;
  file?: string;
};

function UploadForm({ onDone }: { onDone: (id: number) => void }) {
  const upload = useUploadImport();
  const [clientId, setClientId] = useState<number | null>(null);
  const [branchId, setBranchId] = useState<number | null>(null);
  const [period, setPeriod] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const clientsQuery = useClients({ search: "", status: "active", page: 1 });
  const branchesQuery = useQuery({
    queryKey: ["clients", "detail", clientId],
    queryFn: () => getClient(clientId as number),
    enabled: clientId !== null,
  });

  const clients = clientsQuery.data?.data ?? [];
  const branches = (branchesQuery.data?.branches ?? []).filter((b) => b.status === "active");

  function pickFile(next: File | null) {
    if (next && !next.name.toLowerCase().endsWith(".xlsx")) {
      setErrors((prev) => ({ ...prev, file: "الملف يجب أن يكون بصيغة xlsx." }));
      setFile(null);
      return;
    }
    setErrors((prev) => ({ ...prev, file: undefined }));
    setFile(next);
  }

  async function submit() {
    const nextErrors: FieldErrors = {};
    if (clientId === null) nextErrors.client = "اختر العميل.";
    if (branchId === null) nextErrors.branch = "اختر الفرع.";
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(period)) nextErrors.period = "اختر الشهر.";
    if (!file) nextErrors.file = "اختر ملف xlsx.";
    setErrors(nextErrors);
    setGeneralError(null);
    if (Object.keys(nextErrors).length > 0 || clientId === null || branchId === null || !file) {
      return;
    }

    try {
      const batch = await upload.mutateAsync({
        clientId,
        branchId,
        reportingPeriod: period,
        file,
      });
      onDone(batch.id);
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 409) {
        setGeneralError("يوجد استيراد سابق لنفس العميل والفرع والفترة. احذفه أولًا.");
      } else if (isAxiosError(error) && error.response?.status === 422) {
        setGeneralError("تحقق من العميل والفرع والفترة والملف.");
      } else {
        setGeneralError("تعذّر رفع الملف. حاول مرة أخرى.");
      }
    }
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
      noValidate
    >
      {generalError ? (
        <Alert variant="destructive">
          <AlertDescription>{generalError}</AlertDescription>
        </Alert>
      ) : null}

      <FormField label="العميل" error={errors.client}>
        <Select
          value={clientId === null ? "" : String(clientId)}
          onValueChange={(value) => {
            setClientId(Number(value));
            setBranchId(null);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="اختر العميل" />
          </SelectTrigger>
          <SelectContent>
            {clients.map((client) => (
              <SelectItem key={client.id} value={String(client.id)}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <FormField label="الفرع" error={errors.branch}>
        <Select
          value={branchId === null ? "" : String(branchId)}
          onValueChange={(value) => setBranchId(Number(value))}
          disabled={clientId === null || branchesQuery.isLoading}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="اختر الفرع" />
          </SelectTrigger>
          <SelectContent>
            {branches.map((branch) => (
              <SelectItem key={branch.id} value={String(branch.id)}>
                {branch.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <FormField label="شهر التقرير" htmlFor="period" error={errors.period}>
        <Input
          id="period"
          type="month"
          dir="ltr"
          value={period}
          onChange={(event) => setPeriod(event.target.value)}
        />
      </FormField>

      <FormField label="ملف Excel" error={errors.file}>
        <label
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            pickFile(event.dataTransfer.files[0] ?? null);
          }}
          className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-input bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground hover:bg-muted/50"
        >
          <UploadIcon className="size-5" />
          <span>{file ? file.name : "اسحب ملف xlsx هنا أو اضغط للاختيار"}</span>
          <input
            type="file"
            accept=".xlsx"
            className="hidden"
            onChange={(event) => pickFile(event.target.files?.[0] ?? null)}
          />
        </label>
      </FormField>

      <DialogFooter>
        <Button type="submit" disabled={upload.isPending}>
          {upload.isPending ? <Loader2Icon className="animate-spin" /> : null}
          رفع وتحقق
        </Button>
      </DialogFooter>
    </form>
  );
}
