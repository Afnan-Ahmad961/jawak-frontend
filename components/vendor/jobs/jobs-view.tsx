"use client";

import { File01Icon } from "@hugeicons/core-free-icons";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { DataError } from "@/components/shared/data-error";
import { JobCard } from "@/components/vendor/jobs/job-card";
import { useRequests } from "@/lib/hooks/use-requests";
import { useMyBids } from "@/lib/hooks/use-bids";
import { refId } from "@/lib/api/refs";

/**
 * The open job board. Vendors see all open requests (Overview.md §Vendor); jobs
 * the vendor has already bid on are flagged so they don't double-bid.
 */
export function JobsView() {
  const { data: requests = [], isLoading, isError, error, refetch } =
    useRequests({ status: "open" });
  const { data: myBids = [] } = useMyBids();

  const bidRequestIds = new Set(
    myBids.map((bid) => String(refId(bid.design_request))),
  );

  return (
    <div className="space-y-4">
      <PageHeader
        title="Job board"
        description="Open requests looking for a manufacturer. Bid with your price and timeline."
      />

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
          title="No open jobs right now"
          description="New requests that match your specialties will show up here — and you'll get a notification."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {requests.map((request) => (
            <JobCard
              key={request.id}
              request={request}
              alreadyBid={bidRequestIds.has(String(request.id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
