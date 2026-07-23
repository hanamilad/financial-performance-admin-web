import { api } from "@/lib/api";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

type ResourceResponse = { data: AuthUser };

export async function fetchCurrentUser(): Promise<AuthUser> {
  const { data } = await api.get<ResourceResponse>("/api/v1/auth/me");
  return data.data;
}

export async function login(credentials: LoginCredentials): Promise<AuthUser> {
  await api.get("/sanctum/csrf-cookie");
  const { data } = await api.post<ResourceResponse>(
    "/api/v1/auth/login",
    credentials,
  );
  return data.data;
}

export async function logout(): Promise<void> {
  await api.post("/api/v1/auth/logout");
}
