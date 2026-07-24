"use client";

import { useMemo, useState } from "react";

import { useClient, useClients } from "@/hooks/use-clients";
import type { OverviewParams } from "@/lib/reports";

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function yearStart(): string {
  return `${new Date().getFullYear()}-01`;
}

export function useReportFilters() {
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [branchId, setBranchId] = useState<number | null>(null);
  const [from, setFrom] = useState(yearStart());
  const [to, setTo] = useState(currentMonth());

  const clientsQuery = useClients({ status: "active", page: 1 });
  const clients = useMemo(() => clientsQuery.data?.data ?? [], [clientsQuery.data]);
  const clientId = selectedClientId ?? clients[0]?.id ?? null;

  const clientQuery = useClient(clientId ?? 0);
  const branches = clientQuery.data?.branches ?? [];

  const params: OverviewParams | null = clientId ? { clientId, branchId, from, to } : null;

  return {
    clients,
    clientId,
    setClientId: (next: number) => {
      setSelectedClientId(next);
      setBranchId(null);
    },
    branches,
    branchId,
    setBranchId,
    from,
    setFrom,
    to,
    setTo,
    params,
  };
}
