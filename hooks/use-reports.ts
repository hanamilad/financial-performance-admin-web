"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getOverview, type OverviewParams } from "@/lib/reports";

export function useOverview(params: OverviewParams | null) {
  return useQuery({
    queryKey: ["reports", "overview", params],
    queryFn: ({ signal }) => getOverview(params as OverviewParams, signal),
    enabled: params !== null,
    placeholderData: keepPreviousData,
  });
}
