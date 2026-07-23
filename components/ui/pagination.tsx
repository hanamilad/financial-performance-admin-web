"use client";

import { Button } from "@/components/ui/button";

type PaginationMeta = {
  current_page: number;
  last_page: number;
};

export function Pagination({
  meta,
  onPageChange,
}: {
  meta: PaginationMeta | undefined;
  onPageChange: (page: number) => void;
}) {
  if (!meta || meta.last_page <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">
        صفحة {meta.current_page} من {meta.last_page}
      </span>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={meta.current_page <= 1}
          onClick={() => onPageChange(meta.current_page - 1)}
        >
          السابق
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={meta.current_page >= meta.last_page}
          onClick={() => onPageChange(meta.current_page + 1)}
        >
          التالي
        </Button>
      </div>
    </div>
  );
}
