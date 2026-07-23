"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useCurrentUser } from "@/hooks/use-auth";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { FullScreenLoader } from "@/components/full-screen-loader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: user, isLoading, isError } = useCurrentUser();

  useEffect(() => {
    if (isError) {
      router.replace("/login");
    }
  }, [isError, router]);

  if (isLoading) {
    return <FullScreenLoader label="جارٍ التحقق من الجلسة..." />;
  }

  if (!user) {
    return <FullScreenLoader label="جارٍ التحويل..." />;
  }

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
