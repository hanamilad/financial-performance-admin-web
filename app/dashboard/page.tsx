"use client";

import { useReportFilters } from "@/hooks/use-report-filters";
import { useOverview } from "@/hooks/use-reports";
import type { BranchComparisonRow, Overview } from "@/lib/reports";
import { channelLabel, expenseCategoryLabel } from "@/lib/reports";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { BarChart, type BarDatum } from "@/components/reports/bar-chart";
import { ChartContainer } from "@/components/reports/chart-container";
import { FilterBar } from "@/components/reports/filter-bar";
import { KpiCard } from "@/components/reports/kpi-card";
import { TrendChart } from "@/components/reports/trend-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";

function kpiCards(summary: NonNullable<Overview["summary"]>) {
  return [
    { label: "صافي المبيعات", value: formatCurrency(summary.net_sales) },
    { label: "إجمالي المبيعات", value: formatCurrency(summary.gross_sales) },
    { label: "عدد الطلبات", value: formatNumber(summary.order_count) },
    { label: "متوسط قيمة الطلب", value: formatCurrency(summary.average_order_value) },
    {
      label: "إجمالي المصروفات",
      value: formatCurrency(summary.total_expenses),
      caption: `${formatPercent(summary.expense_ratio)} من الصافي`,
    },
    { label: "صافي التدفق التشغيلي", value: formatCurrency(summary.net_operating_cashflow) },
    { label: "الخصومات", value: formatCurrency(summary.discounts), caption: formatPercent(summary.discount_ratio) },
    { label: "المرتجعات", value: formatCurrency(summary.returns), caption: formatPercent(summary.returns_ratio) },
    { label: "ضريبة القيمة المضافة", value: formatCurrency(summary.vat) },
    { label: "الإيرادات الأخرى", value: formatCurrency(summary.other_income) },
    { label: "المصروفات الأخرى", value: formatCurrency(summary.other_expenses) },
    {
      label: "مبيعات المنصات",
      value: formatCurrency(summary.platform_sales),
      caption: formatPercent(summary.platform_sales_ratio),
    },
  ];
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
        {Array.from({ length: 12 }).map((_, index) => (
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

function OverviewContent({ overview }: { overview: Overview }) {
  const summary = overview.summary;
  if (summary === null) {
    return <EmptyState periods={overview.data_coverage.periods} />;
  }

  const channelData: BarDatum[] = overview.channel_breakdown.map((slice) => ({
    label: channelLabel(slice.channel),
    value: Number(slice.amount),
    display: `${formatCurrency(slice.amount)} · ${formatPercent(slice.ratio)}`,
  }));

  const expenseData: BarDatum[] = overview.expense_breakdown.map((slice) => ({
    label: expenseCategoryLabel(slice.category),
    value: Number(slice.amount),
    display: `${formatCurrency(slice.amount)} · ${formatPercent(slice.ratio)}`,
  }));

  const trendPoints = overview.monthly_trend.map((point) => ({
    label: point.period,
    netSales: Number(point.net_sales),
    cashflow: Number(point.net_operating_cashflow),
  }));

  const branchColumns: DataTableColumn<BranchComparisonRow>[] = [
    { key: "branch", header: "الفرع", cell: (row) => <span className="font-medium">{row.branch_name ?? "—"}</span> },
    { key: "net_sales", header: "صافي المبيعات", align: "center", cell: (row) => <span className="tabular-nums" dir="ltr">{formatCurrency(row.net_sales)}</span> },
    { key: "expenses", header: "المصروفات", align: "center", cell: (row) => <span className="tabular-nums" dir="ltr">{formatCurrency(row.total_expenses)}</span> },
    { key: "noc", header: "صافي التدفق التشغيلي", align: "center", cell: (row) => <span className="tabular-nums" dir="ltr">{formatCurrency(row.net_operating_cashflow)}</span> },
    { key: "orders", header: "الطلبات", align: "center", cell: (row) => <span className="tabular-nums" dir="ltr">{formatNumber(row.order_count)}</span> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
        {kpiCards(summary).map((card) => (
          <KpiCard key={card.label} label={card.label} value={card.value} caption={card.caption} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartContainer title="توزيع قنوات البيع" isEmpty={channelData.length === 0}>
          <BarChart data={channelData} />
        </ChartContainer>
        <ChartContainer title="توزيع المصروفات" isEmpty={expenseData.length === 0}>
          <BarChart data={expenseData} />
        </ChartContainer>
      </div>

      <ChartContainer title="الاتجاه الشهري" isEmpty={trendPoints.length === 0}>
        <TrendChart points={trendPoints} />
      </ChartContainer>

      {overview.branch_comparison !== null ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">مقارنة الفروع</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              bare
              columns={branchColumns}
              rows={overview.branch_comparison}
              rowKey={(row) => row.branch_id}
              emptyLabel="لا توجد فروع بها بيانات."
            />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

export default function DashboardPage() {
  const filters = useReportFilters();
  const overviewQuery = useOverview(filters.params);
  const { clientId } = filters;

  return (
    <div className="flex w-full flex-col gap-6">
      <PageHeader title="لوحة الأداء" description="مؤشرات الأداء الأساسية من البيانات المنشورة" />

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
        onRefresh={() => overviewQuery.refetch()}
        isFetching={overviewQuery.isFetching}
      />

      {clientId === null ? (
        <Card>
          <CardContent className="py-16 text-center text-sm text-muted-foreground">
            اختر عميلًا لعرض المؤشرات.
          </CardContent>
        </Card>
      ) : overviewQuery.isLoading || !overviewQuery.data ? (
        <DashboardSkeleton />
      ) : overviewQuery.isError ? (
        <Card>
          <CardContent className="py-16 text-center text-sm text-destructive">
            تعذّر تحميل المؤشرات. حاول مرة أخرى.
          </CardContent>
        </Card>
      ) : (
        <OverviewContent overview={overviewQuery.data} />
      )}
    </div>
  );
}
