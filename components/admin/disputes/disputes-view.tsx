"use client";

import Link from "next/link";
import { useQueryState, parseAsStringLiteral } from "nuqs";
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { DataError } from "@/components/shared/data-error";
import { StatusBadge } from "@/components/shared/status-badge";
import { StatusFilter } from "@/components/shared/status-filter";
import { DisputeResolveDialog } from "@/components/admin/disputes/dispute-resolve-dialog";
import { asObjectRef, refId } from "@/lib/api/refs";
import { formatDate } from "@/lib/format";
import { useDisputes } from "@/lib/hooks/use-disputes";
import { disputeStatusMeta } from "@/lib/labels";
import type { DisputeStatus, Order, UserSummary } from "@/lib/api/types";

const STATUS_VALUES = Object.keys(disputeStatusMeta) as DisputeStatus[];
const STATUS_OPTIONS = STATUS_VALUES.map((value) => ({
  value,
  label: disputeStatusMeta[value].label,
}));

const OPEN_STATES: DisputeStatus[] = ["open", "under_review"];

/** All disputes (admin sees every one), filterable by status, with resolve. */
export function DisputesView() {
  const [status, setStatus] = useQueryState(
    "status",
    parseAsStringLiteral(STATUS_VALUES),
  );

  const { data: disputes = [], isLoading, isError, error, refetch } =
    useDisputes();

  const filtered = status
    ? disputes.filter((d) => d.status === status)
    : disputes;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Disputes"
        description="Review complaints raised on orders and resolve them."
      />

      <StatusFilter
        value={status}
        onChange={setStatus}
        options={STATUS_OPTIONS}
        allLabel="All statuses"
      />

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : isError ? (
        <DataError error={error} onRetry={() => refetch()} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={CheckmarkCircle02Icon}
          title={status ? "No disputes with this status" : "No disputes"}
          description={
            status
              ? "Try a different status filter."
              : "When a client or vendor raises a dispute, it appears here."
          }
        />
      ) : (
        <Card className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Raised by</TableHead>
                <TableHead>Raised</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((dispute) => {
                const orderId = refId(dispute.order);
                const raiser = asObjectRef<UserSummary>(dispute.raised_by);
                const raiserName =
                  raiser?.name || raiser?.username || raiser?.email || "—";
                const order = asObjectRef<Order>(dispute.order);
                const canResolve = OPEN_STATES.includes(dispute.status);

                return (
                  <TableRow key={dispute.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/admin/disputes/${dispute.id}`}
                        className="underline-offset-4 hover:underline"
                      >
                        Order #{orderId ?? order?.id ?? dispute.id}
                      </Link>
                    </TableCell>
                    <TableCell className="max-w-xs whitespace-normal">
                      <span className="line-clamp-2 text-xs">
                        {dispute.reason}
                      </span>
                    </TableCell>
                    <TableCell>{raiserName}</TableCell>
                    <TableCell>{formatDate(dispute.created_at)}</TableCell>
                    <TableCell>
                      <StatusBadge kind="dispute" value={dispute.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      {canResolve ? (
                        <DisputeResolveDialog
                          disputeId={dispute.id}
                          trigger={
                            <Button variant="outline" size="sm">
                              Resolve
                            </Button>
                          }
                        />
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          render={
                            <Link href={`/admin/disputes/${dispute.id}`} />
                          }
                        >
                          View
                        </Button>
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
