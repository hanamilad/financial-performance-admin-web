const sheetLabels: Record<string, string> = {
  BRANCHES: "الفروع",
  SALES_DAILY: "المبيعات اليومية",
  EXPENSES_MONTHLY: "المصروفات الشهرية",
  OTHER_INCOME_EXPENSES: "إيرادات ومصروفات أخرى",
  DELIVERY_PLATFORMS: "منصات التوصيل",
  FINANCIAL_POSITION: "المركز المالي",
  LIQUIDITY: "السيولة",
  ITEMS_MONTHLY: "الأصناف الشهرية",
  TARGETS_MONTHLY: "المستهدفات الشهرية",
  file: "الملف",
  header: "العناوين",
  sheet: "الأوراق",
};

export function sheetLabel(name: string): string {
  return sheetLabels[name] ?? name;
}

export function isNumericValue(value: unknown): boolean {
  if (typeof value === "number") return true;
  if (typeof value !== "string" || value.trim() === "") return false;
  return !Number.isNaN(Number(value));
}

export function formatCell(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}
