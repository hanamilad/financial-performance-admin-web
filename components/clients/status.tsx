import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EntityStatus } from "@/lib/clients";

const statusLabels: Record<EntityStatus, string> = {
  active: "نشط",
  inactive: "غير نشط",
};

export function statusLabel(status: EntityStatus): string {
  return statusLabels[status];
}

export function StatusBadge({ status }: { status: EntityStatus }) {
  return (
    <Badge variant={status === "active" ? "default" : "secondary"}>
      {statusLabels[status]}
    </Badge>
  );
}

export function StatusSelect({
  value,
  onChange,
}: {
  value: EntityStatus;
  onChange: (value: EntityStatus) => void;
}) {
  return (
    <Select value={value} onValueChange={(next) => onChange(next as EntityStatus)}>
      <SelectTrigger className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="active">نشط</SelectItem>
        <SelectItem value="inactive">غير نشط</SelectItem>
      </SelectContent>
    </Select>
  );
}
