"use client";

import { CheckIcon, LoaderIcon, TriangleAlertIcon } from "lucide-react";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

const timeFormat = new Intl.DateTimeFormat("ar", { timeStyle: "short" });

export function SaveStatusIndicator({ status, savedAt }: { status: SaveStatus; savedAt: Date | null }) {
  if (status === "saving") {
    return (
      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <LoaderIcon className="size-4 animate-spin" />
        جارٍ الحفظ...
      </span>
    );
  }

  if (status === "error") {
    return (
      <span className="flex items-center gap-1.5 text-sm text-destructive">
        <TriangleAlertIcon className="size-4" />
        تعذّر الحفظ
      </span>
    );
  }

  if (status === "saved" && savedAt) {
    return (
      <span className="flex items-center gap-1.5 text-sm text-primary">
        <CheckIcon className="size-4" />
        تم الحفظ {timeFormat.format(savedAt)}
      </span>
    );
  }

  return null;
}
