import { api } from "@/lib/api";
import type { Paginated } from "@/lib/clients";

export type ImportStatus = "uploaded" | "validation_failed" | "validated" | "draft";

export type ImportBatch = {
  id: number;
  client_id: number;
  client_name?: string;
  branch_id: number;
  branch_name?: string;
  reporting_period: string;
  original_filename: string;
  status: ImportStatus;
  row_count: number;
  error_count: number;
  uploaded_by_name?: string;
  created_at: string;
};

export type ImportError = {
  sheet: string;
  row: number;
  column: string;
  value: unknown;
  reason: string;
};

export type ImportRow = {
  sheet_name: string;
  row_number: number;
  data: Record<string, unknown>;
};

export type ImportSheetSummary = {
  sheet: string;
  row_count: number;
  error_count: number;
};

export type ImportBatchDetail = ImportBatch & {
  errors: ImportError[];
  sheets: ImportSheetSummary[];
  rows: ImportRow[];
};

export async function listImports(page?: number): Promise<Paginated<ImportBatch>> {
  const { data } = await api.get<Paginated<ImportBatch>>("/api/v1/admin/imports", {
    params: { page: page || undefined },
  });
  return data;
}

export async function getImport(id: number): Promise<ImportBatchDetail> {
  const { data } = await api.get<{ data: ImportBatchDetail }>(`/api/v1/admin/imports/${id}`);
  return data.data;
}

export type UploadImportPayload = {
  clientId: number;
  branchId: number;
  reportingPeriod: string;
  file: File;
};

export async function uploadImport(payload: UploadImportPayload): Promise<ImportBatchDetail> {
  const formData = new FormData();
  formData.append("client_id", String(payload.clientId));
  formData.append("branch_id", String(payload.branchId));
  formData.append("reporting_period", payload.reportingPeriod);
  formData.append("file", payload.file);

  const { data } = await api.post<{ data: ImportBatchDetail }>(
    "/api/v1/admin/imports",
    formData,
    { headers: { "Content-Type": undefined } },
  );
  return data.data;
}

export async function deleteImport(id: number): Promise<void> {
  await api.delete(`/api/v1/admin/imports/${id}`);
}
