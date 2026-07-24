"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getOverview, getProfitability, type OverviewParams } from "@/lib/reports";

export function useOverview(params: OverviewParams | null) {
  return useQuery({
    queryKey: ["reports", "overview", params],
    queryFn: ({ signal }) => getOverview(params as OverviewParams, signal),
    enabled: params !== null,
    placeholderData: keepPreviousData,
  });
}

export function useProfitability(params: OverviewParams | null) {
  return useQuery({
    queryKey: ["reports", "profitability", params],
    queryFn: ({ signal }) => getProfitability(params as OverviewParams, signal),
    enabled: params !== null,
    placeholderData: keepPreviousData,
  });
}
