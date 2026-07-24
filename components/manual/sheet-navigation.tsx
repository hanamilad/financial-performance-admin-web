"use client";

import { sheetLabel } from "@/lib/import-sheets";

export type SheetTab = {
  sheet: string;
  count: number;
  errorCount: number;
};

export function SheetNavigation({
  tabs,
  active,
  onSelect,
}: {
  tabs: SheetTab[];
  active: string;
  onSelect: (sheet: string) => void;
}) {
  return (
    <div role="tablist" aria-label="أقسام الإدخال" className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const selected = tab.sheet === active;
        return (
          <button
            key={tab.sheet}
            role="tab"
            type="button"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onSelect(tab.sheet)}
            className={[
              "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              selected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground hover:bg-muted",
            ].join(" ")}
          >
            <span>{sheetLabel(tab.sheet)}</span>
            {tab.errorCount > 0 ? (
              <span
                className={[
                  "rounded-full px-1.5 text-xs tabular-nums",
                  selected ? "bg-primary-foreground/20" : "bg-destructive/10 text-destructive",
                ].join(" ")}
              >
                {tab.errorCount}
              </span>
            ) : tab.count > 0 ? (
              <span
                className={[
                  "rounded-full px-1.5 text-xs tabular-nums",
                  selected ? "bg-primary-foreground/20" : "bg-muted text-muted-foreground",
                ].join(" ")}
              >
                {tab.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
