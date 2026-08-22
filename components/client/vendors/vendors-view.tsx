"use client";

import { useQueryState, parseAsString } from "nuqs";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon, Store01Icon } from "@hugeicons/core-free-icons";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { DataError } from "@/components/shared/data-error";
import { VendorCard } from "@/components/shared/vendor-card";
import { useVendors } from "@/lib/hooks/use-vendors";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";

/**
 * Vendor directory. The search term lives in the URL (nuqs) and feeds the query
 * key; the input is debounced locally so typing doesn't spam the API.
 */
export function VendorsView() {
  // `search` (URL state) is the single source of truth: the input reflects it
  // directly (so back/forward and shared links Just Work), while the query key
  // trails a debounced copy so typing doesn't refetch on every keystroke.
  const [search, setSearch] = useQueryState("q", parseAsString);
  const debouncedSearch = useDebouncedValue(search, 300);

  const { data: vendors = [], isLoading, isError, error, refetch } = useVendors({
    search: debouncedSearch,
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Vendors"
        description="Browse manufacturers, compare ratings, and explore portfolios."
      />

      <div className="relative max-w-sm">
        <HugeiconsIcon
          icon={Search01Icon}
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2"
        />
        <Input
          value={search ?? ""}
          onChange={(e) => setSearch(e.target.value || null)}
          placeholder="Search by company or specialty…"
          className="pl-7"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : isError ? (
        <DataError error={error} onRetry={() => refetch()} />
      ) : vendors.length === 0 ? (
        <EmptyState
          icon={Store01Icon}
          title={search ? "No vendors match your search" : "No vendors yet"}
          description={
            search
              ? "Try a different company name or specialty."
              : "Vendors will appear here as manufacturers join the marketplace."
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vendors.map((vendor) => (
            <VendorCard
              key={vendor.id}
              vendor={vendor}
              href={`/client/vendors/${vendor.id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
