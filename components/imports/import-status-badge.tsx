import { Badge } from "@/components/ui/badge";
import type { ImportStatus } from "@/lib/imports";

const statusMeta: Record<
  ImportStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  uploaded: { label: "مرفوع", variant: "secondary" },
  validated: { label: "تم التحقق", variant: "default" },
  draft: { label: "مسودة", variant: "default" },
  validation_failed: { label: "فشل التحقق", variant: "destructive" },
};

export function ImportStatusBadge({ status }: { status: ImportStatus }) {
  const meta = statusMeta[status];
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}
