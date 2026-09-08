"use client";

import Link from "next/link";
import { useQueryState, parseAsStringLiteral } from "nuqs";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon, File01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { DataError } from "@/components/shared/data-error";
import { StatusFilter } from "@/components/shared/status-filter";
import { RequestCard } from "@/components/client/requests/request-card";
import { useRequests } from "@/lib/hooks/use-requests";
import { requestStatusMeta } from "@/lib/labels";
import type { RequestStatus } from "@/lib/api/types";

const STATUS_VALUES = Object.keys(requestStatusMeta) as RequestStatus[];
const STATUS_OPTIONS = STATUS_VALUES.map((value) => ({
  value,
  label: requestStatusMeta[value].label,
}));

/**
 * The client's design-request list. Status filter lives in the URL (nuqs) and
 * feeds the query key, so a filtered view is shareable and reproducible.
 */
export function RequestsView() {
  const [status, setStatus] = useQueryState(
    "status",
    parseAsStringLiteral(STATUS_VALUES),
  );

  const { data: requests = [], isLoading, isError, error, refetch } =
    useRequests({ status });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Your requests"
        description="Post custom apparel jobs and compare vendor bids."
        actions={
          <Button render={<Link href="/client/requests/new" />}>
            <HugeiconsIcon icon={PlusSignIcon} />
            New request
          </Button>
        }
      />

      <div className="flex items-center gap-2">
        <StatusFilter
          value={status}
          onChange={setStatus}
          options={STATUS_OPTIONS}
          allLabel="All statuses"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56 w-full" />
          ))}
        </div>
      ) : isError ? (
        <DataError error={error} onRetry={() => refetch()} />
      ) : requests.length === 0 ? (
        <EmptyState
          icon={File01Icon}
          title={status ? "No requests with this status" : "No requests yet"}
          description={
            status
              ? "Try a different status filter."
              : "Post your first design request to start receiving bids from vendors."
          }
          action={
            !status && (
              <Button render={<Link href="/client/requests/new" />}>
                <HugeiconsIcon icon={PlusSignIcon} />
                Post a request
              </Button>
            )
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {requests.map((request) => (
            <RequestCard key={request.id} request={request} />
          ))}
        </div>
      )}
    </div>
  );
}
