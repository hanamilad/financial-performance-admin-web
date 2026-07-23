"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { z } from "zod";
import { Loader2Icon } from "lucide-react";

import { useCreateBranch, useUpdateBranch } from "@/hooks/use-clients";
import { applyServerErrors } from "@/lib/form-errors";
import type { Branch } from "@/lib/clients";
import { StatusSelect } from "@/components/clients/status";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const branchSchema = z.object({
  name: z.string().min(1, "اسم الفرع مطلوب").max(255),
  code: z.string().min(1, "الرمز مطلوب").max(64),
  city: z.string().max(255).optional(),
  status: z.enum(["active", "inactive"]),
});

type BranchValues = z.infer<typeof branchSchema>;

export function BranchFormDialog({
  open,
  onOpenChange,
  clientId,
  branch,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: number;
  branch?: Branch;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{branch ? "تعديل الفرع" : "إضافة فرع"}</DialogTitle>
        </DialogHeader>
        <BranchForm
          clientId={clientId}
          branch={branch}
          onDone={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function BranchForm({
  clientId,
  branch,
  onDone,
}: {
  clientId: number;
  branch?: Branch;
  onDone: () => void;
}) {
  const isEdit = Boolean(branch);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const createBranch = useCreateBranch(clientId);
  const updateBranch = useUpdateBranch(branch?.id ?? 0);
  const pending = createBranch.isPending || updateBranch.isPending;

  const { register, handleSubmit, setError, control, formState } = useForm<BranchValues>({
    resolver: standardSchemaResolver(branchSchema),
    defaultValues: branch
      ? { name: branch.name, code: branch.code, city: branch.city ?? "", status: branch.status }
      : { name: "", code: "", city: "", status: "active" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setGeneralError(null);
    const payload = { ...values, city: values.city?.trim() ? values.city.trim() : null };
    try {
      if (isEdit) {
        await updateBranch.mutateAsync(payload);
      } else {
        await createBranch.mutateAsync(payload);
      }
      onDone();
    } catch (error) {
      setGeneralError(applyServerErrors(error, setError));
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      {generalError ? (
        <Alert variant="destructive">
          <AlertDescription>{generalError}</AlertDescription>
        </Alert>
      ) : null}

      <FormField label="اسم الفرع" error={formState.errors.name?.message}>
        <Input {...register("name")} />
      </FormField>

      <FormField label="الرمز" error={formState.errors.code?.message}>
        <Input dir="ltr" {...register("code")} />
      </FormField>

      <FormField label="المدينة (اختياري)" error={formState.errors.city?.message}>
        <Input {...register("city")} />
      </FormField>

      <FormField label="الحالة" error={formState.errors.status?.message}>
        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <StatusSelect value={field.value} onChange={field.onChange} />
          )}
        />
      </FormField>

      <DialogFooter>
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2Icon className="animate-spin" /> : null}
          حفظ
        </Button>
      </DialogFooter>
    </form>
  );
}
