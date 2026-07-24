import { api } from "@/lib/api";

export type OverviewSummary = {
  gross_sales: string;
  discounts: string;
  returns: string;
  net_sales: string;
  vat: string;
  order_count: number;
  average_order_value: string;
  dine_in_sales: string;
  pickup_sales: string;
  direct_delivery_sales: string;
  platform_sales: string;
  total_expenses: string;
  other_income: string;
  other_expenses: string;
  net_operating_cashflow: string;
  discount_ratio: string;
  returns_ratio: string;
  expense_ratio: string;
  platform_sales_ratio: string;
};

export type ChannelSlice = { channel: string; amount: string; ratio: string };
export type ExpenseSlice = { category: string; amount: string; ratio: string };

export type MonthlyPoint = {
  period: string;
  gross_sales: string;
  net_sales: string;
  total_expenses: string;
  other_income: string;
  other_expenses: string;
  net_operating_cashflow: string;
  order_count: number;
};

export type BranchComparisonRow = {
  branch_id: number;
  branch_name: string | null;
  net_sales: string;
  total_expenses: string;
  net_operating_cashflow: string;
  order_count: number;
};

export type DataCoverage = {
  periods: string[];
  branches: { branch_id: number; branch_name: string | null }[];
};

export type Overview = {
  empty: boolean;
  filters: { client_id: number; branch_id: number | null; period_from: string; period_to: string };
  summary: OverviewSummary | null;
  channel_breakdown: ChannelSlice[];
  expense_breakdown: ExpenseSlice[];
  monthly_trend: MonthlyPoint[];
  branch_comparison: BranchComparisonRow[] | null;
  data_coverage: DataCoverage;
};

export type OverviewParams = {
  clientId: number;
  branchId: number | null;
  from: string;
  to: string;
};

export async function getOverview(
  params: OverviewParams,
  signal?: AbortSignal,
): Promise<Overview> {
  const { data } = await api.get<{ data: Overview }>("/api/v1/admin/reports/overview", {
    signal,
    params: {
      client_id: params.clientId,
      branch_id: params.branchId ?? undefined,
      period_from: params.from,
      period_to: params.to,
    },
  });
  return data.data;
}

const channelLabels: Record<string, string> = {
  dine_in_sales: "مبيعات الصالة",
  pickup_sales: "مبيعات الاستلام",
  direct_delivery_sales: "التوصيل المباشر",
  platform_sales: "مبيعات المنصات",
};

export function channelLabel(channel: string): string {
  return channelLabels[channel] ?? channel;
}

const expenseCategoryLabels: Record<string, string> = {
  FOOD_COST: "تكلفة المواد",
  OTHER_DIRECT_COST: "تكاليف مباشرة أخرى",
  PACKAGING: "التغليف",
  PLATFORM_COMMISSION: "عمولة المنصات",
  PLATFORM_OTHER_FEES: "رسوم منصات أخرى",
  PLATFORM_ADS: "إعلانات المنصات",
  PAYROLL: "الرواتب",
  RENT: "الإيجار",
  ELECTRICITY: "الكهرباء",
  WATER: "المياه",
  GAS: "الغاز",
  MARKETING: "التسويق",
  MAINTENANCE: "الصيانة",
  CLEANING: "النظافة",
  TRANSPORTATION: "النقل",
  SOFTWARE_SUBSCRIPTIONS: "اشتراكات البرمجيات",
  GOVERNMENT_FEES: "رسوم حكومية",
  BANK_FEES: "رسوم بنكية",
  DEPRECIATION: "الإهلاك",
  BRANCH_ADMIN: "إدارة الفرع",
  HEAD_OFFICE_ADMIN: "إدارة المركز الرئيسي",
  OTHER_OPERATING: "تشغيلية أخرى",
};

export function expenseCategoryLabel(category: string): string {
  return expenseCategoryLabels[category] ?? category;
}
