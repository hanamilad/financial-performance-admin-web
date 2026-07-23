"use client";

import { useRouter } from "next/navigation";
import { LogOutIcon, MenuIcon, Loader2Icon } from "lucide-react";

import { useLogout } from "@/hooks/use-auth";
import { type AuthUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SidebarContent } from "@/components/dashboard/sidebar";

const roleLabels: Record<string, string> = {
  system_admin: "مدير النظام",
  client_user: "مستخدم عميل",
};

export function Header({ user }: { user: AuthUser }) {
  const router = useRouter();
  const logoutMutation = useLogout();

  function handleLogout() {
    logoutMutation.mutate(undefined, {
      onSuccess: () => router.replace("/login"),
    });
  }

  return (
    <header className="flex h-14 items-center justify-between gap-3 border-b bg-background px-4">
      <Sheet>
        <SheetTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="فتح القائمة"
            />
          }
        >
          <MenuIcon />
        </SheetTrigger>
        <SheetContent side="right" className="w-72 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>القائمة</SheetTitle>
          </SheetHeader>
          <SidebarContent />
        </SheetContent>
      </Sheet>

      <div className="flex items-center gap-3">
        <div className="flex flex-col items-end leading-tight">
          <span className="text-sm font-medium">{user.name}</span>
          <span className="text-xs text-muted-foreground">
            {roleLabels[user.role] ?? user.role}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
        >
          {logoutMutation.isPending ? (
            <Loader2Icon className="animate-spin" />
          ) : (
            <LogOutIcon />
          )}
          تسجيل الخروج
        </Button>
      </div>
    </header>
  );
}
