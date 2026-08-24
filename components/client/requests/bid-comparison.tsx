"use client";

import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle02Icon,
  Cancel01Icon,
  Message01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { VendorSummary } from "@/components/shared/vendor-summary";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { asObjectRef, refId } from "@/lib/api/refs";
import { formatMoney } from "@/lib/format";
import { ApiError } from "@/lib/api/http";
import { useSetBidStatus } from "@/lib/hooks/use-bids";
import type { Bid, Id, RequestStatus, VendorSummary as VendorSummaryType } from "@/lib/api/types";

/**
 * Bid comparison table for a request. The client accepts one (which rejects the
 * rest and creates the order) or rejects individually, and can open a chat with
 * a vendor. Accept/reject are only offered while the request is still open.
 */
export function BidComparison({
  bids,
  requestStatus,
  onMessageVendor,
  messagePending,
}: {
  bids: Bid[];
  requestStatus: RequestStatus;
  onMessageVendor: (vendorId: Id) => void;
  messagePending?: boolean;
}) {
  const setStatus = useSetBidStatus();
  const canAward = requestStatus === "open";

  if (bids.length === 0) {
    return (
      <EmptyState
        icon={UserGroupIcon}
        title="No bids yet"
        description="Vendors whose specialties match your request are notified automatically. Check back soon."
      />
    );
  }

  const act = (bid: Bid, status: "accepted" | "rejected") => {
    setStatus.mutate(
      { id: bid.id, status },
      {
        onSuccess: () =>
          toast.success(status === "accepted" ? "Bid accepted — order created" : "Bid rejected"),
        onError: (error) =>
          toast.error(
            error instanceof ApiError ? error.message : "Couldn't update the bid",
          ),
      },
    );
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Vendor</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Delivery</TableHead>
          <TableHead className="min-w-40">Message</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bids.map((bid) => {
          const vendor = asObjectRef<VendorSummaryType>(bid.vendor);
          const vendorId = refId(bid.vendor);
          const rowPending =
            setStatus.isPending && setStatus.variables?.id === bid.id;
          // Any in-flight bid mutation locks every row: accepting rejects the
          // others and creates an order, so a second award must not race it.
          const anyPending = setStatus.isPending;
          const showActions = canAward && bid.status === "pending";

          return (
            <TableRow key={bid.id}>
              <TableCell>
                <VendorSummary vendor={vendor} />
              </TableCell>
              <TableCell className="font-medium">
                {formatMoney(bid.proposed_price)}
              </TableCell>
              <TableCell>{bid.delivery_days} days</TableCell>
              <TableCell className="max-w-xs whitespace-normal">
                <span className="text-muted-foreground line-clamp-2 text-xs">
                  {bid.message || "—"}
                </span>
              </TableCell>
              <TableCell>
                <StatusBadge kind="bid" value={bid.status} />
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  {vendorId !== undefined && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Message vendor"
                      disabled={messagePending}
                      onClick={() => onMessageVendor(vendorId)}
                    >
                      <HugeiconsIcon icon={Message01Icon} />
                    </Button>
                  )}
                  {showActions && (
                    <>
                      <ConfirmDialog
                        title="Accept this bid?"
                        description="This awards the job to this vendor, rejects the other bids, and creates an order. This can't be undone."
                        confirmLabel="Accept bid"
                        pending={rowPending}
                        onConfirm={() => act(bid, "accepted")}
                        trigger={
                          <Button variant="outline" size="sm" disabled={anyPending}>
                            <HugeiconsIcon icon={CheckmarkCircle02Icon} />
                            {rowPending ? "Working…" : "Accept"}
                          </Button>
                        }
                      />
                      <ConfirmDialog
                        title="Reject this bid?"
                        description="The vendor will be notified their bid was declined."
                        confirmLabel="Reject bid"
                        destructive
                        pending={rowPending}
                        onConfirm={() => act(bid, "rejected")}
                        trigger={
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Reject bid"
                            disabled={anyPending}
                          >
                            <HugeiconsIcon icon={Cancel01Icon} />
                          </Button>
                        }
                      />
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
