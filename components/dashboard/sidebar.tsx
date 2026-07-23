"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2Icon,
  FileTextIcon,
  LandmarkIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  StoreIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  icon: LucideIcon;
  href?: string;
};

const navItems: NavItem[] = [
  { label: "لوحة التحكم", icon: LayoutDashboardIcon, href: "/dashboard" },
  { label: "العملاء", icon: Building2Icon, href: "/dashboard/clients" },
  { label: "الفروع", icon: StoreIcon },
  { label: "التقارير", icon: FileTextIcon },
  { label: "المستخدمون", icon: UsersIcon },
  { label: "الإعدادات", icon: SettingsIcon },
];

function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 p-3">
      {navItems.map(({ label, icon: Icon, href }) => {
        if (href) {
          const active =
            href === "/dashboard" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={label}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted",
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        }

        return (
          <span
            key={label}
            aria-disabled="true"
            className="flex cursor-default items-center justify-between rounded-lg px-3 py-2 text-sm text-muted-foreground"
          >
            <span className="flex items-center gap-2.5">
              <Icon className="size-4" />
              {label}
            </span>
            <span className="rounded-md bg-muted px-1.5 py-0.5 text-[0.65rem]">
              قريبًا
            </span>
          </span>
        );
      })}
    </nav>
  );
}

export function SidebarContent() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <LandmarkIcon className="size-4" />
        </div>
        <span className="font-heading text-sm font-semibold">
          منصة الأداء المالي
        </span>
      </div>
      <SidebarNav />
    </div>
  );
}
