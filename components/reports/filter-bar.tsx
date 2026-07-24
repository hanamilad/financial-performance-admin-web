"use client";

import { RefreshCwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Option = { id: number; name: string | null };

export function FilterBar({
  clients,
  clientId,
  onClientChange,
  branches,
  branchId,
  onBranchChange,
  from,
  to,
  onFromChange,
  onToChange,
  onRefresh,
  isFetching,
}: {
  clients: Option[];
  clientId: number | null;
  onClientChange: (clientId: number) => void;
  branches: Option[];
  branchId: number | null;
  onBranchChange: (branchId: number | null) => void;
  from: string;
  to: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onRefresh: () => void;
  isFetching: boolean;
}) {
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-xl border bg-card p-4">
      <div className="flex min-w-48 flex-col gap-1.5">
        <Label>العميل</Label>
        <Select
          value={clientId ? String(clientId) : ""}
          onValueChange={(value) => onClientChange(Number(value))}
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

      <div className="flex min-w-44 flex-col gap-1.5">
        <Label>الفرع</Label>
        <Select
          value={branchId === null ? "all" : String(branchId)}
          onValueChange={(value) => onBranchChange(value === "all" ? null : Number(value))}
        >
          <SelectTrigger className="h-9 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الفروع</SelectItem>
            {branches.map((branch) => (
              <SelectItem key={branch.id} value={String(branch.id)}>
                {branch.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="period-from">من شهر</Label>
        <Input
          id="period-from"
          type="month"
          value={from}
          max={to}
          onChange={(event) => onFromChange(event.target.value)}
          className="h-9 w-40"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="period-to">إلى شهر</Label>
        <Input
          id="period-to"
          type="month"
          value={to}
          min={from}
          onChange={(event) => onToChange(event.target.value)}
          className="h-9 w-40"
        />
      </div>

      <Button variant="outline" className="h-9" onClick={onRefresh} disabled={isFetching}>
        <RefreshCwIcon className={isFetching ? "animate-spin" : undefined} />
        تحديث
      </Button>
    </div>
  );
}
