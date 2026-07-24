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

export type ReportWarning = { code: string; message: string };

export type ProfitabilitySummary = {
  net_sales: string;
  cogs: string | null;
  gross_profit: string | null;
  total_operating_expenses: string | null;
  other_income: string;
  other_expenses: string;
  net_profit: string | null;
  platform_costs: string | null;
};

export type ProfitabilityMargins = {
  gross_margin: string | null;
  net_margin: string | null;
  food_cost_ratio: string | null;
  packaging_cost_ratio: string | null;
  payroll_cost_ratio: string | null;
  rent_cost_ratio: string | null;
  utilities_cost_ratio: string | null;
  marketing_cost_ratio: string | null;
};

export type ProfitabilityCostBreakdown = {
  food_cost: string | null;
  packaging_cost: string | null;
  payroll_cost: string | null;
  rent_cost: string | null;
  utilities_cost: string | null;
  marketing_cost: string | null;
  platform_costs: string | null;
  other_operating_expenses: string | null;
  by_category: { category: string; amount: string; ratio: string | null }[];
};

export type ProfitabilityMonthlyPoint = {
  period: string;
  net_sales: string;
  gross_profit: string | null;
  net_profit: string | null;
  gross_margin: string | null;
  net_margin: string | null;
};

export type ProfitabilityBranchRow = {
  branch_id: number;
  branch_name: string | null;
  net_sales: string;
  gross_profit: string | null;
  net_profit: string | null;
  gross_margin: string | null;
  net_margin: string | null;
};

export type Profitability = {
  empty: boolean;
  filters: { client_id: number; branch_id: number | null; period_from: string; period_to: string };
  summary: ProfitabilitySummary | null;
  margins: ProfitabilityMargins | null;
  cost_breakdown: ProfitabilityCostBreakdown | null;
  monthly_trend: ProfitabilityMonthlyPoint[];
  branch_comparison: ProfitabilityBranchRow[] | null;
  data_coverage: DataCoverage;
  warnings: ReportWarning[];
};

export async function getProfitability(
  params: OverviewParams,
  signal?: AbortSignal,
): Promise<Profitability> {
  const { data } = await api.get<{ data: Profitability }>("/api/v1/admin/reports/profitability", {
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
