import { api } from "@/lib/api";
import type { ImportBatchDetail } from "@/lib/imports";
import { expenseCategoryLabel } from "@/lib/reports";

export type ManualFieldType = "date" | "decimal" | "integer" | "text" | "enum" | "scope" | "scope_only";

export type ManualField = {
  name: string;
  type: ManualFieldType;
  required: boolean;
  options: string[];
};

export type ManualSheetSchema = {
  sheet: string;
  fields: ManualField[];
};

export type ManualRow = {
  id: number;
  sheet_name: string;
  row_number: number;
  data: Record<string, unknown>;
};

export type ManualValidationError = {
  sheet: string;
  row: number;
  column: string;
  value: unknown;
  reason: string;
};

export type ManualValidationResult = {
  valid: boolean;
  row_count: number;
  error_count: number;
  errors: ManualValidationError[];
};

export const MANUAL_SHEETS = [
  "SALES_DAILY",
  "EXPENSES_MONTHLY",
  "OTHER_INCOME_EXPENSES",
  "DELIVERY_PLATFORMS",
  "FINANCIAL_POSITION",
  "LIQUIDITY",
  "ITEMS_MONTHLY",
  "TARGETS_MONTHLY",
] as const;

export async function getManualSchema(): Promise<ManualSheetSchema[]> {
  const { data } = await api.get<{ data: ManualSheetSchema[] }>("/api/v1/admin/manual-entries/schema");
  return data.data;
}

export async function createManualDraft(payload: {
  clientId: number;
  branchId: number;
  period: string;
}): Promise<ImportBatchDetail> {
  const { data } = await api.post<{ data: ImportBatchDetail }>("/api/v1/admin/manual-entries", {
    client_id: payload.clientId,
    branch_id: payload.branchId,
    reporting_period: payload.period,
  });
  return data.data;
}

export async function getManualEntry(id: number): Promise<ImportBatchDetail> {
  const { data } = await api.get<{ data: ImportBatchDetail }>(`/api/v1/admin/manual-entries/${id}`);
  return data.data;
}

export async function addManualRow(id: number, sheet: string, row: Record<string, unknown>): Promise<ManualRow> {
  const { data } = await api.post<{ data: ManualRow }>(
    `/api/v1/admin/manual-entries/${id}/sheets/${sheet}/rows`,
    { data: row },
  );
  return data.data;
}

export async function updateManualRow(id: number, rowId: number, row: Record<string, unknown>): Promise<ManualRow> {
  const { data } = await api.patch<{ data: ManualRow }>(
    `/api/v1/admin/manual-entries/${id}/rows/${rowId}`,
    { data: row },
  );
  return data.data;
}

export async function deleteManualRow(id: number, rowId: number): Promise<void> {
  await api.delete(`/api/v1/admin/manual-entries/${id}/rows/${rowId}`);
}

export async function validateManual(id: number): Promise<ManualValidationResult> {
  const { data } = await api.post<{ data: ManualValidationResult }>(`/api/v1/admin/manual-entries/${id}/validate`);
  return data.data;
}

export async function submitManual(id: number): Promise<ImportBatchDetail> {
  const { data } = await api.post<{ data: ImportBatchDetail }>(`/api/v1/admin/manual-entries/${id}/submit`);
  return data.data;
}

const fieldLabels: Record<string, string> = {
  date: "التاريخ",
  report_date: "تاريخ التقرير",
  scope_code: "النطاق",
  gross_sales_ex_vat: "إجمالي المبيعات بدون ضريبة",
  discounts: "الخصومات",
  returns: "المرتجعات",
  net_sales_ex_vat: "صافي المبيعات بدون ضريبة",
  vat_amount: "ضريبة القيمة المضافة",
  order_count: "عدد الطلبات",
  dine_in_sales: "مبيعات الصالة",
  pickup_sales: "مبيعات الاستلام",
  direct_delivery_sales: "التوصيل المباشر",
  platform_sales: "مبيعات المنصات",
  operating_status: "حالة التشغيل",
  note: "ملاحظات",
  expense_code: "كود المصروف",
  expense_name: "اسم المصروف",
  expense_category: "تصنيف المصروف",
  amount: "القيمة",
  item_code: "كود البند",
  item_name: "اسم البند",
  item_type: "نوع البند",
  platform_code: "كود المنصة",
  platform_name: "اسم المنصة",
  restaurant_funded_discounts: "خصومات ممولة من المطعم",
  platform_funded_discounts: "خصومات ممولة من المنصة",
  commission: "العمولة",
  additional_fees: "رسوم إضافية",
  commission_vat: "ضريبة العمولة والرسوم",
  platform_ads: "إعلانات المنصة",
  net_settlement: "صافي التحصيل",
  cash_on_hand: "الصندوق",
  bank_balances: "أرصدة البنوك",
  wallet_balances: "المحافظ",
  platform_receivables: "مستحقات المنصات",
  trade_receivables: "العملاء والمدينون",
  inventory: "المخزون",
  prepaid_expenses: "مصروفات مقدمة",
  other_current_assets: "أصول متداولة أخرى",
  equipment: "المعدات",
  furniture: "الأثاث",
  vehicles: "السيارات",
  leasehold_improvements: "تحسينات الفروع",
  other_fixed_assets: "أصول ثابتة أخرى",
  accumulated_depreciation: "مجمع الإهلاك",
  suppliers: "الموردون",
  accrued_expenses: "مصروفات مستحقة",
  payroll_payable: "رواتب مستحقة",
  vat_payable: "ضريبة مستحقة",
  tax_or_zakat_payable: "زكاة أو ضريبة مستحقة",
  short_term_loans: "قروض قصيرة الأجل",
  other_current_liabilities: "التزامات متداولة أخرى",
  long_term_loans: "قروض طويلة الأجل",
  lease_liabilities: "التزامات إيجار",
  other_non_current_liabilities: "التزامات طويلة أخرى",
  capital: "رأس المال",
  partner_accounts: "حسابات الشركاء",
  retained_earnings: "الأرباح المبقاة",
  current_period_profit: "صافي ربح الفترة",
  drawings_or_distributions: "توزيعات أو مسحوبات",
  other_equity: "حقوق ملكية أخرى",
  platform_receivables_expected: "مستحقات منصات متوقعة",
  other_expected_collections: "تحصيلات أخرى متوقعة",
  suppliers_due: "موردون مستحقون",
  payroll_due: "رواتب مستحقة",
  taxes_due: "ضرائب مستحقة",
  loan_installments_due: "أقساط قروض قريبة",
  lease_due: "التزامات إيجار قريبة",
  other_near_term_obligations: "التزامات أخرى قريبة",
  obligation_horizon_days: "أفق الالتزامات بالأيام",
  category_code: "كود الفئة",
  category_name: "اسم الفئة",
  quantity_sold: "الكمية المباعة",
  item_cost: "تكلفة الصنف",
  order_occurrences: "عدد مرات الظهور",
  sales_target: "مستهدف المبيعات",
  order_count_target: "مستهدف عدد الطلبات",
  average_order_value_target: "مستهدف متوسط الطلب",
  food_cost_percentage_target: "مستهدف نسبة تكلفة المواد",
  packaging_percentage_target: "مستهدف نسبة التغليف",
  payroll_percentage_target: "مستهدف نسبة الرواتب",
  gross_profit_target: "مستهدف مجمل الربح",
  net_profit_target: "مستهدف صافي الربح",
  net_profit_margin_target: "مستهدف هامش صافي الربح",
};

export function fieldLabel(name: string): string {
  return fieldLabels[name] ?? name;
}

const optionLabels: Record<string, string> = {
  OPEN: "مفتوح",
  CLOSED: "مغلق",
  OTHER_OPERATING_INCOME: "إيراد تشغيلي آخر",
  NON_OPERATING_INCOME: "إيراد غير تشغيلي",
  NON_OPERATING_EXPENSE: "مصروف غير تشغيلي",
  FINANCE_COST: "تكلفة تمويل",
  ZAKAT_OR_INCOME_TAX: "زكاة أو ضريبة دخل",
  HUNGERSTATION: "هنقرستيشن",
  JAEZ: "جاهز",
  KEETA: "كيتا",
  TOYOU: "تويو",
  MRSOOL: "مرسول",
  THE_CHEFZ: "ذا شفز",
  NINJA: "نينجا",
  OTHER: "أخرى",
  HEAD_OFFICE: "المركز الرئيسي",
  CLIENT: "العميل (مستوى الشركة)",
};

export function optionLabel(value: string): string {
  return optionLabels[value] ?? expenseCategoryLabel(value);
}
