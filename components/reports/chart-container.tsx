import type { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ChartContainer({
  title,
  isEmpty = false,
  emptyLabel = "لا توجد بيانات لعرضها.",
  children,
}: {
  title: string;
  isEmpty?: boolean;
  emptyLabel?: string;
  children: ReactNode;
}) {
  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <p className="py-8 text-center text-sm text-muted-foreground">{emptyLabel}</p>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
