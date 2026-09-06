"use client";

import Link from "next/link";
import { toast } from "sonner";
import { TagIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { DataError } from "@/components/shared/data-error";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { asObjectRef, refId } from "@/lib/api/refs";
import { formatMoney } from "@/lib/format";
import { ApiError } from "@/lib/api/http";
import { useMyBids, useWithdrawBid } from "@/lib/hooks/use-bids";
import type { DesignRequest } from "@/lib/api/types";

/** The vendor's own bids across all requests, with withdraw for pending ones. */
export function BidsView() {
  const { data: bids = [], isLoading, isError, error, refetch } = useMyBids();
  const withdrawBid = useWithdrawBid();

  return (
    <div className="space-y-4">
      <PageHeader
        title="My bids"
        description="Every bid you've placed and its current status."
      />

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : isError ? (
        <DataError error={error} onRetry={() => refetch()} />
      ) : bids.length === 0 ? (
        <EmptyState
          icon={TagIcon}
          title="No bids yet"
          description="Browse the job board and place your first bid."
          action={
            <Button render={<Link href="/vendor/jobs" />}>Browse jobs</Button>
          }
        />
      ) : (
        <Card className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Delivery</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bids.map((bid) => {
                const request = asObjectRef<DesignRequest>(bid.design_request);
                const requestId = refId(bid.design_request);
                const rowPending =
                  withdrawBid.isPending &&
                  withdrawBid.variables === bid.id;
                return (
                  <TableRow key={bid.id}>
                    <TableCell>
                      {requestId !== undefined ? (
                        <Link
                          href={`/vendor/jobs/${requestId}`}
                          className="font-medium underline-offset-4 hover:underline"
                        >
                          {request?.title ?? `Request #${requestId}`}
                        </Link>
                      ) : (
                        (request?.title ?? "—")
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatMoney(bid.proposed_price)}
                    </TableCell>
                    <TableCell>{bid.delivery_days} days</TableCell>
                    <TableCell>
                      <StatusBadge kind="bid" value={bid.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      {bid.status === "pending" && (
                        <ConfirmDialog
                          title="Withdraw this bid?"
                          description="The client will no longer see it. You can bid again while the request is open."
                          confirmLabel="Withdraw"
                          destructive
                          pending={rowPending}
                          onConfirm={() =>
                            withdrawBid.mutate(bid.id, {
                              onSuccess: () => toast.success("Bid withdrawn"),
                              onError: (err) =>
                                toast.error(
                                  err instanceof ApiError
                                    ? err.message
                                    : "Couldn't withdraw bid",
                                ),
                            })
                          }
                          trigger={
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={withdrawBid.isPending}
                            >
                              Withdraw
                            </Button>
                          }
                        />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
