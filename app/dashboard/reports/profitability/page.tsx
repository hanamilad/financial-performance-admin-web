"use client";

import { AlertTriangleIcon } from "lucide-react";

import { useReportFilters } from "@/hooks/use-report-filters";
import { useProfitability } from "@/hooks/use-reports";
import type { Profitability, ProfitabilityBranchRow } from "@/lib/reports";
import { expenseCategoryLabel } from "@/lib/reports";
import { formatCurrency, formatPercent } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { BarChart, type BarDatum } from "@/components/reports/bar-chart";
import { ChartContainer } from "@/components/reports/chart-container";
import { FilterBar } from "@/components/reports/filter-bar";
import { KpiCard } from "@/components/reports/kpi-card";
import { TrendChart } from "@/components/reports/trend-chart";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";

function money(value: string | null): string {
  return value === null ? "—" : formatCurrency(value);
}

function percent(value: string | null): string {
  return value === null ? "—" : formatPercent(value);
}

function ProfitabilitySkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="h-24 animate-pulse rounded-xl border bg-muted/40" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="h-64 animate-pulse rounded-xl border bg-muted/40" />
        <div className="h-64 animate-pulse rounded-xl border bg-muted/40" />
      </div>
    </div>
  );
}

function EmptyState({ periods }: { periods: string[] }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-2 py-16 text-center">
        <p className="text-sm font-medium">لا توجد بيانات منشورة ضمن الفلاتر المحددة.</p>
        {periods.length > 0 ? (
          <p className="text-sm text-muted-foreground">
            الفترات المتاحة لهذا العميل: <span dir="ltr">{periods.join("، ")}</span>
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">لا توجد أي عمليات منشورة لهذا العميل بعد.</p>
        )}
      </CardContent>
    </Card>
  );
}

function ProfitabilityContent({ report }: { report: Profitability }) {
  const summary = report.summary;
  const margins = report.margins;
  const costs = report.cost_breakdown;

  if (summary === null || margins === null) {
    return <EmptyState periods={report.data_coverage.periods} />;
  }

  const kpis = [
    { label: "صافي المبيعات", value: money(summary.net_sales) },
    { label: "تكلفة الأصناف المباعة", value: money(summary.cogs) },
    { label: "مجمل الربح", value: money(summary.gross_profit), caption: `الهامش ${percent(margins.gross_margin)}` },
    { label: "إجمالي المصروفات التشغيلية", value: money(summary.total_operating_expenses) },
    { label: "صافي الربح", value: money(summary.net_profit), caption: `الهامش ${percent(margins.net_margin)}` },
    { label: "تكاليف المنصات", value: money(summary.platform_costs) },
    { label: "الإيرادات الأخرى", value: money(summary.other_income) },
    { label: "المصروفات الأخرى", value: money(summary.other_expenses) },
  ];

  const costRatios: BarDatum[] = [
    { label: "تكلفة المواد", ratio: margins.food_cost_ratio },
    { label: "التغليف", ratio: margins.packaging_cost_ratio },
    { label: "الرواتب", ratio: margins.payroll_cost_ratio },
    { label: "الإيجار", ratio: margins.rent_cost_ratio },
    { label: "المرافق", ratio: margins.utilities_cost_ratio },
    { label: "التسويق", ratio: margins.marketing_cost_ratio },
  ]
    .filter((row): row is { label: string; ratio: string } => row.ratio !== null)
    .map((row) => ({
      label: row.label,
      value: Number(row.ratio),
      display: percent(row.ratio),
    }));

  const categoryData: BarDatum[] = (costs?.by_category ?? []).map((slice) => ({
    label: expenseCategoryLabel(slice.category),
    value: Number(slice.amount),
    display: `${formatCurrency(slice.amount)} · ${percent(slice.ratio)}`,
  }));

  const trendPoints = report.monthly_trend.map((point) => ({
    label: point.period,
    netSales: Number(point.gross_profit ?? 0),
    cashflow: Number(point.net_profit ?? 0),
  }));

  const branchColumns: DataTableColumn<ProfitabilityBranchRow>[] = [
    { key: "branch", header: "الفرع", cell: (row) => <span className="font-medium">{row.branch_name ?? "—"}</span> },
    { key: "net_sales", header: "صافي المبيعات", align: "center", cell: (row) => <span className="tabular-nums" dir="ltr">{money(row.net_sales)}</span> },
    { key: "gross_profit", header: "مجمل الربح", align: "center", cell: (row) => <span className="tabular-nums" dir="ltr">{money(row.gross_profit)}</span> },
    { key: "net_profit", header: "صافي الربح", align: "center", cell: (row) => <span className="tabular-nums" dir="ltr">{money(row.net_profit)}</span> },
    { key: "gross_margin", header: "هامش مجمل الربح", align: "center", cell: (row) => <span className="tabular-nums" dir="ltr">{percent(row.gross_margin)}</span> },
    { key: "net_margin", header: "هامش صافي الربح", align: "center", cell: (row) => <span className="tabular-nums" dir="ltr">{percent(row.net_margin)}</span> },
  ];

  return (
    <div className="flex flex-col gap-6">
      {report.warnings.length > 0 ? (
        <div className="flex flex-col gap-2">
          {report.warnings.map((warning) => (
            <Alert key={warning.code}>
              <AlertTriangleIcon />
              <AlertDescription>{warning.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
        {kpis.map((card) => (
          <KpiCard key={card.label} label={card.label} value={card.value} caption={card.caption} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartContainer title="معدلات التكاليف من المبيعات" isEmpty={costRatios.length === 0}>
          <BarChart data={costRatios} />
        </ChartContainer>
        <ChartContainer title="تفصيل التكاليف حسب الفئة" isEmpty={categoryData.length === 0}>
          <BarChart data={categoryData} />
        </ChartContainer>
      </div>

      <ChartContainer title="اتجاه الربحية الشهري" isEmpty={trendPoints.length === 0}>
        <TrendChart points={trendPoints} areaLabel="مجمل الربح" lineLabel="صافي الربح" />
      </ChartContainer>

      {report.branch_comparison !== null ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">مقارنة ربحية الفروع</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              bare
              columns={branchColumns}
              rows={report.branch_comparison}
              rowKey={(row) => row.branch_id}
              emptyLabel="لا توجد فروع بها بيانات."
            />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

export default function ProfitabilityPage() {
  const filters = useReportFilters();
  const query = useProfitability(filters.params);

  return (
    <div className="flex w-full flex-col gap-6">
      <PageHeader title="تحليل الربحية والتكاليف" description="الربحية والهوامش والتكاليف من البيانات المنشورة" />

      <FilterBar
        clients={filters.clients}
        clientId={filters.clientId}
        onClientChange={filters.setClientId}
        branches={filters.branches}
        branchId={filters.branchId}
        onBranchChange={filters.setBranchId}
        from={filters.from}
        to={filters.to}
        onFromChange={filters.setFrom}
        onToChange={filters.setTo}
        onRefresh={() => query.refetch()}
        isFetching={query.isFetching}
      />

      {filters.clientId === null ? (
        <Card>
          <CardContent className="py-16 text-center text-sm text-muted-foreground">
            اختر عميلًا لعرض التحليل.
          </CardContent>
        </Card>
      ) : query.isLoading || !query.data ? (
        <ProfitabilitySkeleton />
      ) : query.isError ? (
        <Card>
          <CardContent className="py-16 text-center text-sm text-destructive">
            تعذّر تحميل التحليل. حاول مرة أخرى.
          </CardContent>
        </Card>
      ) : (
        <ProfitabilityContent report={query.data} />
      )}
    </div>
  );
}
