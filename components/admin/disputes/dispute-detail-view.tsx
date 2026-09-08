"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { DataError } from "@/components/shared/data-error";
import { EmptyState } from "@/components/shared/empty-state";
import { DisputeResolveDialog } from "@/components/admin/disputes/dispute-resolve-dialog";
import { asObjectRef, refId } from "@/lib/api/refs";
import { formatDateTime } from "@/lib/format";
import { useDisputes } from "@/lib/hooks/use-disputes";
import type { DisputeStatus, Order, UserSummary } from "@/lib/api/types";

const OPEN_STATES: DisputeStatus[] = ["open", "under_review"];

export function DisputeDetailView({ id }: { id: string }) {
  const { data: disputes = [], isLoading, isError, error, refetch } =
    useDisputes();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }
  if (isError) return <DataError error={error} onRetry={() => refetch()} />;

  const dispute = disputes.find((d) => String(d.id) === id);
  if (!dispute) {
    return (
      <EmptyState
        title="Dispute not found"
        description="It may have been removed, or you don't have access."
      />
    );
  }

  const orderId = refId(dispute.order) ?? asObjectRef<Order>(dispute.order)?.id;
  const raiser = asObjectRef<UserSummary>(dispute.raised_by);
  const raiserName =
    raiser?.name || raiser?.username || raiser?.email || "Unknown";
  const canResolve = OPEN_STATES.includes(dispute.status);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Dispute · Order #${orderId ?? dispute.id}`}
        actions={
          canResolve && (
            <DisputeResolveDialog
              disputeId={dispute.id}
              trigger={<Button>Resolve</Button>}
            />
          )
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge kind="dispute" value={dispute.status} />
        <span className="text-muted-foreground text-xs">
          Raised by {raiserName} · {formatDateTime(dispute.created_at)}
        </span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Complaint</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs">Reason</p>
            <p className="text-sm font-medium">{dispute.reason}</p>
          </div>
          {dispute.description && (
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs">Description</p>
              <p className="text-xs whitespace-pre-wrap">{dispute.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {dispute.resolution && (
        <Card>
          <CardHeader>
            <CardTitle>Resolution</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs whitespace-pre-wrap">{dispute.resolution}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
