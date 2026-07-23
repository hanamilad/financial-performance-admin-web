"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { z } from "zod";
import { Loader2Icon } from "lucide-react";

import { useCreateClient, useUpdateClient } from "@/hooks/use-clients";
import { applyServerErrors } from "@/lib/form-errors";
import type { Client } from "@/lib/clients";
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

const clientSchema = z.object({
  name: z.string().min(1, "اسم العميل مطلوب").max(255),
  code: z.string().min(1, "الرمز مطلوب").max(64),
  status: z.enum(["active", "inactive"]),
});

type ClientValues = z.infer<typeof clientSchema>;

export function ClientFormDialog({
  open,
  onOpenChange,
  client,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{client ? "تعديل العميل" : "إضافة عميل"}</DialogTitle>
        </DialogHeader>
        <ClientForm client={client} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function ClientForm({ client, onDone }: { client?: Client; onDone: () => void }) {
  const isEdit = Boolean(client);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const createClient = useCreateClient();
  const updateClient = useUpdateClient(client?.id ?? 0);
  const pending = createClient.isPending || updateClient.isPending;

  const { register, handleSubmit, setError, control, formState } = useForm<ClientValues>({
    resolver: standardSchemaResolver(clientSchema),
    defaultValues: client
      ? { name: client.name, code: client.code, status: client.status }
      : { name: "", code: "", status: "active" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setGeneralError(null);
    try {
      if (isEdit) {
        await updateClient.mutateAsync(values);
      } else {
        await createClient.mutateAsync(values);
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

      <FormField label="اسم العميل" error={formState.errors.name?.message}>
        <Input {...register("name")} />
      </FormField>

      <FormField label="الرمز" error={formState.errors.code?.message}>
        <Input dir="ltr" {...register("code")} />
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
