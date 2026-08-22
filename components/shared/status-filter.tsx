"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ALL = "all";

/**
 * A status dropdown whose value is bound to URL state (nuqs) by the caller.
 * `value === null` means "no filter"; internally that maps to an "All" item so
 * base-ui always has a concrete selection (avoids placeholder edge cases).
 */
export function StatusFilter<T extends string>({
  value,
  onChange,
  options,
  allLabel = "All statuses",
  className,
}: {
  value: T | null;
  onChange: (value: T | null) => void;
  options: { value: T; label: string }[];
  allLabel?: string;
  className?: string;
}) {
  // `items` lets base-ui resolve the trigger label from the selected value.
  const items = [{ value: ALL, label: allLabel }, ...options];
  return (
    <Select
      items={items}
      value={value ?? ALL}
      onValueChange={(next) =>
        onChange(next === ALL ? null : (next as T))
      }
    >
      <SelectTrigger className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{allLabel}</SelectItem>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
