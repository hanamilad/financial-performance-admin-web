import { Badge } from "@/components/ui/badge";
import type { ImportStatus } from "@/lib/imports";

const statusMeta: Record<
  ImportStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  uploaded: { label: "مرفوع", variant: "secondary" },
  validated: { label: "تم التحقق", variant: "secondary" },
  draft: { label: "مسودة", variant: "outline" },
  under_review: { label: "قيد المراجعة", variant: "secondary" },
  approved: { label: "معتمد", variant: "default" },
  published: { label: "منشور", variant: "default" },
  validation_failed: { label: "فشل التحقق", variant: "destructive" },
};

export const importStatusOptions: { value: ImportStatus; label: string }[] = (
  Object.keys(statusMeta) as ImportStatus[]
).map((value) => ({ value, label: statusMeta[value].label }));

export function ImportStatusBadge({ status }: { status: ImportStatus }) {
  const meta = statusMeta[status];
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}
