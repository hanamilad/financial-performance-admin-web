import { api } from "@/lib/api";

export type EntityStatus = "active" | "inactive";

export type Client = {
  id: number;
  name: string;
  code: string;
  status: EntityStatus;
  branches_count?: number;
  users_count?: number;
  created_at: string;
};

export type Branch = {
  id: number;
  client_id: number;
  name: string;
  code: string;
  city: string | null;
  status: EntityStatus;
  created_at: string;
};

export type ClientUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  client_id: number;
  is_active: boolean;
  created_at: string;
};

export type ClientDetail = Client & {
  branches: Branch[];
  users: ClientUser[];
};

export type Paginated<T> = {
  data: T[];
  meta: { current_page: number; last_page: number; total: number; per_page: number };
};

export type ClientListParams = {
  search?: string;
  status?: EntityStatus | "";
  page?: number;
};

export async function listClients(params: ClientListParams): Promise<Paginated<Client>> {
  const { data } = await api.get<Paginated<Client>>("/api/v1/admin/clients", {
    params: {
      search: params.search || undefined,
      status: params.status || undefined,
      page: params.page || undefined,
    },
  });
  return data;
}

export async function getClient(id: number): Promise<ClientDetail> {
  const { data } = await api.get<{ data: ClientDetail }>(`/api/v1/admin/clients/${id}`);
  return data.data;
}

export type ClientPayload = { name: string; code: string; status: EntityStatus };

export async function createClient(payload: ClientPayload): Promise<Client> {
  const { data } = await api.post<{ data: Client }>("/api/v1/admin/clients", payload);
  return data.data;
}

export async function updateClient(id: number, payload: Partial<ClientPayload>): Promise<Client> {
  const { data } = await api.patch<{ data: Client }>(`/api/v1/admin/clients/${id}`, payload);
  return data.data;
}

export type BranchPayload = {
  name: string;
  code: string;
  city: string | null;
  status: EntityStatus;
};

export async function createBranch(clientId: number, payload: BranchPayload): Promise<Branch> {
  const { data } = await api.post<{ data: Branch }>(
    `/api/v1/admin/clients/${clientId}/branches`,
    payload,
  );
  return data.data;
}

export async function updateBranch(branchId: number, payload: Partial<BranchPayload>): Promise<Branch> {
  const { data } = await api.patch<{ data: Branch }>(`/api/v1/admin/branches/${branchId}`, payload);
  return data.data;
}

export type CreateClientUserPayload = {
  name: string;
  email: string;
  password: string;
  is_active: boolean;
};

export type UpdateClientUserPayload = {
  name?: string;
  email?: string;
  password?: string;
  is_active?: boolean;
};

export async function createClientUser(
  clientId: number,
  payload: CreateClientUserPayload,
): Promise<ClientUser> {
  const { data } = await api.post<{ data: ClientUser }>(
    `/api/v1/admin/clients/${clientId}/users`,
    payload,
  );
  return data.data;
}

export async function updateClientUser(
  userId: number,
  payload: UpdateClientUserPayload,
): Promise<ClientUser> {
  const { data } = await api.patch<{ data: ClientUser }>(
    `/api/v1/admin/client-users/${userId}`,
    payload,
  );
  return data.data;
}
