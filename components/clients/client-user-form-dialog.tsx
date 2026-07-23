"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { z } from "zod";
import { EyeIcon, EyeOffIcon, Loader2Icon } from "lucide-react";

import { useCreateClientUser, useUpdateClientUser } from "@/hooks/use-clients";
import { applyServerErrors } from "@/lib/form-errors";
import type { ClientUser } from "@/lib/clients";
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

const userSchema = z.object({
  name: z.string().min(1, "الاسم مطلوب").max(255),
  email: z
    .string()
    .min(1, "البريد الإلكتروني مطلوب")
    .email("صيغة البريد الإلكتروني غير صحيحة")
    .max(255),
  password: z.union([z.string().min(8, "كلمة المرور 8 أحرف على الأقل"), z.literal("")]),
  is_active: z.boolean(),
});

type UserValues = z.infer<typeof userSchema>;

export function ClientUserFormDialog({
  open,
  onOpenChange,
  clientId,
  user,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: number;
  user?: ClientUser;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {user ? "تعديل مستخدم العميل" : "إضافة مستخدم عميل"}
          </DialogTitle>
        </DialogHeader>
        <ClientUserForm
          clientId={clientId}
          user={user}
          onDone={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function ClientUserForm({
  clientId,
  user,
  onDone,
}: {
  clientId: number;
  user?: ClientUser;
  onDone: () => void;
}) {
  const isEdit = Boolean(user);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const createUser = useCreateClientUser(clientId);
  const updateUser = useUpdateClientUser(user?.id ?? 0);
  const pending = createUser.isPending || updateUser.isPending;

  const { register, handleSubmit, setError, control, formState } = useForm<UserValues>({
    resolver: standardSchemaResolver(userSchema),
    defaultValues: user
      ? { name: user.name, email: user.email, password: "", is_active: user.is_active }
      : { name: "", email: "", password: "", is_active: true },
  });

  const onSubmit = handleSubmit(async (values) => {
    setGeneralError(null);
    if (!isEdit && !values.password) {
      setError("password", { message: "كلمة المرور مطلوبة" });
      return;
    }

    try {
      if (isEdit) {
        await updateUser.mutateAsync({
          name: values.name,
          email: values.email,
          is_active: values.is_active,
          ...(values.password ? { password: values.password } : {}),
        });
      } else {
        await createUser.mutateAsync({
          name: values.name,
          email: values.email,
          password: values.password,
          is_active: values.is_active,
        });
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

      <FormField label="الاسم" error={formState.errors.name?.message}>
        <Input {...register("name")} />
      </FormField>

      <FormField label="البريد الإلكتروني" error={formState.errors.email?.message}>
        <Input type="email" dir="ltr" autoComplete="off" {...register("email")} />
      </FormField>

      <FormField
        label={isEdit ? "كلمة المرور (اتركها فارغة للإبقاء عليها)" : "كلمة المرور"}
        error={formState.errors.password?.message}
      >
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            dir="ltr"
            autoComplete="new-password"
            className="pe-9"
            {...register("password")}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute inset-y-0 end-1 my-auto text-muted-foreground"
            onClick={() => setShowPassword((shown) => !shown)}
            aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </Button>
        </div>
      </FormField>

      <FormField label="حالة الحساب">
        <Controller
          control={control}
          name="is_active"
          render={({ field }) => (
            <StatusSelect
              value={field.value ? "active" : "inactive"}
              onChange={(next) => field.onChange(next === "active")}
            />
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
