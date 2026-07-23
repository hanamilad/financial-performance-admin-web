import { api } from "@/lib/api";
import type { Paginated } from "@/lib/clients";

export type ImportStatus =
  | "uploaded"
  | "validation_failed"
  | "validated"
  | "draft"
  | "under_review"
  | "approved"
  | "published";

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
  submitted_at: string | null;
  submitted_by_name: string | null;
  approved_at: string | null;
  approved_by_name: string | null;
  published_at: string | null;
  published_by_name: string | null;
  review_note: string | null;
};

export type ImportListParams = {
  page?: number;
  status?: ImportStatus | "";
};

export async function listImports(params: ImportListParams = {}): Promise<Paginated<ImportBatch>> {
  const { data } = await api.get<Paginated<ImportBatch>>("/api/v1/admin/imports", {
    params: {
      page: params.page || undefined,
      status: params.status || undefined,
    },
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

async function transition(id: number, action: string, body?: Record<string, unknown>): Promise<ImportBatchDetail> {
  const { data } = await api.post<{ data: ImportBatchDetail }>(
    `/api/v1/admin/imports/${id}/${action}`,
    body,
  );
  return data.data;
}

export function submitImport(id: number): Promise<ImportBatchDetail> {
  return transition(id, "submit");
}

export function approveImport(id: number): Promise<ImportBatchDetail> {
  return transition(id, "approve");
}

export function publishImport(id: number): Promise<ImportBatchDetail> {
  return transition(id, "publish");
}

export function returnImportToDraft(id: number, reviewNote: string): Promise<ImportBatchDetail> {
  return transition(id, "return-to-draft", { review_note: reviewNote });
}

export async function deleteImport(id: number): Promise<void> {
  await api.delete(`/api/v1/admin/imports/${id}`);
}
