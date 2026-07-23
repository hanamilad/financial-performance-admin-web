"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useCurrentUser } from "@/hooks/use-auth";
import { LoginForm } from "@/components/auth/login-form";
import { FullScreenLoader } from "@/components/full-screen-loader";

export default function LoginPage() {
  const router = useRouter();
  const { data: user, isLoading } = useCurrentUser();

  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  if (isLoading || user) {
    return <FullScreenLoader label="جارٍ التحقق من الجلسة..." />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <LoginForm />
    </main>
  );
}
