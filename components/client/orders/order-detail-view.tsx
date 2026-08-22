"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle02Icon,
  StarIcon,
  Alert02Icon,
  Message01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { DataError } from "@/components/shared/data-error";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ReviewFormDialog } from "@/components/shared/review-form-dialog";
import { ProductionTimeline } from "@/components/shared/production-timeline";
import { VendorSummary } from "@/components/shared/vendor-summary";
import { DisputeFormDialog } from "@/components/client/orders/dispute-form-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { asObjectRef, refId } from "@/lib/api/refs";
import { formatDateTime, formatMoney } from "@/lib/format";
import { ApiError } from "@/lib/api/http";
import { useConfirmDelivery, useOrder } from "@/lib/hooks/use-orders";
import { useStartConversation } from "@/lib/hooks/use-conversations";
import type {
  Bid,
  DesignRequest,
  VendorSummary as VendorSummaryType,
} from "@/lib/api/types";

export function OrderDetailView({ id }: { id: string }) {
  const router = useRouter();
  const { data: order, isLoading, isError, error, refetch } = useOrder(id);
  const confirmDelivery = useConfirmDelivery(id);
  const startConversation = useStartConversation();

  if (isLoading) return <OrderDetailSkeleton />;
  if (isError || !order) {
    return <DataError error={error} onRetry={() => refetch()} />;
  }

  const request = asObjectRef<DesignRequest>(order.design_request);
  const vendor = asObjectRef<VendorSummaryType>(order.vendor);
  const vendorId = refId(order.vendor);
  const bid = asObjectRef<Bid>(order.bid);

  const stage = order.current_stage;
  const canConfirm =
    order.status === "active" && (stage === "shipped" || stage === "delivered");
  const canReview = order.status === "completed" && !order.has_review;
  const canDispute = order.status === "active";

  const onConfirm = () =>
    confirmDelivery.mutate(undefined, {
      onSuccess: () => toast.success("Delivery confirmed — order completed"),
      onError: (err) =>
        toast.error(
          err instanceof ApiError ? err.message : "Couldn't confirm delivery",
        ),
    });

  const onMessageVendor = () => {
    const requestId = refId(order.design_request);
    if (requestId === undefined || vendorId === undefined) return;
    startConversation.mutate(
      { design_request: requestId, vendor: vendorId },
      {
        onSuccess: (conversation) =>
          router.push(`/client/messages?c=${conversation.id}`),
        onError: (err) =>
          toast.error(
            err instanceof ApiError ? err.message : "Couldn't start conversation",
          ),
      },
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={request?.title ?? `Order #${order.id}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {vendorId !== undefined && (
              <Button
                variant="outline"
                disabled={startConversation.isPending}
                onClick={onMessageVendor}
              >
                <HugeiconsIcon icon={Message01Icon} />
                Message vendor
              </Button>
            )}
            {canConfirm && (
              <ConfirmDialog
                title="Confirm delivery?"
                description="Confirm you've received the order as agreed. This completes the order and lets you leave a review."
                confirmLabel="Confirm delivery"
                pending={confirmDelivery.isPending}
                onConfirm={onConfirm}
                trigger={
                  <Button>
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} />
                    Confirm delivery
                  </Button>
                }
              />
            )}
            {canReview && (
              <ReviewFormDialog
                orderId={order.id}
                title="Review the vendor"
                trigger={
                  <Button variant="outline">
                    <HugeiconsIcon icon={StarIcon} />
                    Leave a review
                  </Button>
                }
              />
            )}
            {canDispute && (
              <DisputeFormDialog
                orderId={order.id}
                trigger={
                  <Button variant="ghost">
                    <HugeiconsIcon icon={Alert02Icon} />
                    Raise dispute
                  </Button>
                }
              />
            )}
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge kind="order" value={order.status} />
        {stage && <StatusBadge kind="stage" value={stage} />}
        <span className="text-muted-foreground text-xs">
          Awarded {formatDateTime(order.created_at)}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Production</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductionTimeline
              currentStage={order.current_stage}
              updates={order.production_updates}
            />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Vendor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <VendorSummary vendor={vendor} />
              {vendorId !== undefined && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  render={<Link href={`/client/vendors/${vendorId}`} />}
                >
                  View profile
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3 text-xs">
                <Detail
                  label="Agreed price"
                  value={formatMoney(order.proposed_price ?? bid?.proposed_price)}
                />
                <Detail
                  label="Delivery window"
                  value={
                    order.delivery_days ?? bid?.delivery_days
                      ? `${order.delivery_days ?? bid?.delivery_days} days`
                      : "—"
                  }
                />
                {request && (
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-muted-foreground">Request</dt>
                    <dd>
                      <Link
                        href={`/client/requests/${refId(order.design_request)}`}
                        className="font-medium underline-offset-4 hover:underline"
                      >
                        View request
                      </Link>
                    </dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

function OrderDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-5 w-48" />
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-64 w-full lg:col-span-2" />
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  );
}
