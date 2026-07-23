import { isAxiosError } from "axios";
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

function arabicFieldError(field: string): string {
  switch (field) {
    case "code":
      return "هذا الرمز مستخدم بالفعل";
    case "email":
      return "هذا البريد الإلكتروني مستخدم بالفعل";
    default:
      return "قيمة غير صالحة";
  }
}

export function applyServerErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
): string | null {
  if (isAxiosError(error) && error.response?.status === 422) {
    const errors = error.response.data?.errors as Record<string, string[]> | undefined;
    if (errors && typeof errors === "object") {
      for (const field of Object.keys(errors)) {
        setError(field as Path<T>, { message: arabicFieldError(field) });
      }
      return null;
    }
  }
  return "تعذّر حفظ البيانات. تحقق من الاتصال وحاول مرة أخرى.";
}
