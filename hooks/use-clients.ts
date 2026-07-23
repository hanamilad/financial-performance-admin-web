"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createBranch,
  createClient,
  createClientUser,
  getClient,
  listClients,
  updateBranch,
  updateClient,
  updateClientUser,
  type BranchPayload,
  type ClientListParams,
  type ClientPayload,
  type CreateClientUserPayload,
  type UpdateClientUserPayload,
} from "@/lib/clients";

const clientsKey = ["clients"] as const;

export function useClients(params: ClientListParams) {
  return useQuery({
    queryKey: [...clientsKey, "list", params],
    queryFn: () => listClients(params),
    placeholderData: (previous) => previous,
  });
}

export function useClient(id: number) {
  return useQuery({
    queryKey: [...clientsKey, "detail", id],
    queryFn: () => getClient(id),
  });
}

function useInvalidateClients() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: clientsKey });
}

export function useCreateClient() {
  const invalidate = useInvalidateClients();
  return useMutation({
    mutationFn: (payload: ClientPayload) => createClient(payload),
    onSuccess: invalidate,
  });
}

export function useUpdateClient(id: number) {
  const invalidate = useInvalidateClients();
  return useMutation({
    mutationFn: (payload: Partial<ClientPayload>) => updateClient(id, payload),
    onSuccess: invalidate,
  });
}

export function useCreateBranch(clientId: number) {
  const invalidate = useInvalidateClients();
  return useMutation({
    mutationFn: (payload: BranchPayload) => createBranch(clientId, payload),
    onSuccess: invalidate,
  });
}

export function useUpdateBranch(branchId: number) {
  const invalidate = useInvalidateClients();
  return useMutation({
    mutationFn: (payload: Partial<BranchPayload>) => updateBranch(branchId, payload),
    onSuccess: invalidate,
  });
}

export function useCreateClientUser(clientId: number) {
  const invalidate = useInvalidateClients();
  return useMutation({
    mutationFn: (payload: CreateClientUserPayload) => createClientUser(clientId, payload),
    onSuccess: invalidate,
  });
}

export function useUpdateClientUser(userId: number) {
  const invalidate = useInvalidateClients();
  return useMutation({
    mutationFn: (payload: UpdateClientUserPayload) => updateClientUser(userId, payload),
    onSuccess: invalidate,
  });
}
