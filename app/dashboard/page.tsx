import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">مرحبًا بك في لوحة الإدارة</CardTitle>
          <CardDescription>
            منصة متابعة الأداء المالي والتشغيلي للمطاعم والكافيهات
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm leading-7 text-muted-foreground">
          <p>
            هذه لوحة أولية. ستُضاف إدارة العملاء والفروع والتقارير والمؤشرات في
            المراحل القادمة.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
