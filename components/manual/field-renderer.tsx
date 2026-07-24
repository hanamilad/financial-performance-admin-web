"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { optionLabel, type ManualField } from "@/lib/manual-entry";

export function FieldRenderer({
  field,
  value,
  onChange,
  branch,
  dateMin,
  dateMax,
  invalid,
  id,
}: {
  field: ManualField;
  value: string;
  onChange: (value: string) => void;
  branch: { code: string; name: string | null };
  dateMin?: string;
  dateMax?: string;
  invalid?: boolean;
  id: string;
}) {
  if (field.type === "enum" || field.type === "scope" || field.type === "scope_only") {
    const options: { value: string; label: string }[] = [];
    if (field.type === "scope") {
      options.push({ value: branch.code, label: `الفرع: ${branch.name ?? branch.code}` });
    }
    for (const option of field.options) {
      options.push({ value: option, label: optionLabel(option) });
    }

    return (
      <Select value={value} onValueChange={(next) => onChange(next ?? "")}>
        <SelectTrigger id={id} aria-invalid={invalid} className="h-9 w-full">
          <SelectValue placeholder="اختر" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (field.type === "date") {
    return (
      <Input
        id={id}
        type="date"
        value={value}
        min={dateMin}
        max={dateMax}
        aria-invalid={invalid}
        onChange={(event) => onChange(event.target.value)}
        className="h-9"
        dir="ltr"
      />
    );
  }

  if (field.type === "integer" || field.type === "decimal") {
    return (
      <Input
        id={id}
        type="number"
        inputMode="decimal"
        step={field.type === "integer" ? "1" : "any"}
        value={value}
        aria-invalid={invalid}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 text-center tabular-nums"
        dir="ltr"
      />
    );
  }

  return (
    <Input
      id={id}
      type="text"
      value={value}
      aria-invalid={invalid}
      onChange={(event) => onChange(event.target.value)}
      className="h-9"
    />
  );
}
