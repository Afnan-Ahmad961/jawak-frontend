"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { Layers01Icon, StarIcon, Message01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { DataError } from "@/components/shared/data-error";
import { ReviewFormDialog } from "@/components/shared/review-form-dialog";
import { ProductionTimeline } from "@/components/shared/production-timeline";
import { ProductionUpdateDialog } from "@/components/vendor/orders/production-update-dialog";
import { asObjectRef, refId } from "@/lib/api/refs";
import { formatDate, formatDateTime, formatMoney } from "@/lib/format";
import { ApiError } from "@/lib/api/http";
import { useOrder } from "@/lib/hooks/use-orders";
import { useMyVendorProfile } from "@/lib/hooks/use-vendors";
import { useStartConversation } from "@/lib/hooks/use-conversations";
import type { Bid, DesignRequest, UserSummary } from "@/lib/api/types";

export function OrderDetailView({ id }: { id: string }) {
  const router = useRouter();
  const { data: order, isLoading, isError, error, refetch } = useOrder(id);
  const { data: vendor } = useMyVendorProfile();
  const startConversation = useStartConversation();

  if (isLoading) return <OrderDetailSkeleton />;
  if (isError || !order) {
    return <DataError error={error} onRetry={() => refetch()} />;
  }

  const request = asObjectRef<DesignRequest>(order.design_request);
  const client = asObjectRef<UserSummary>(order.client);
  const bid = asObjectRef<Bid>(order.bid);
  const clientName =
    client?.name || client?.username || client?.email || "Client";

  const isActive = order.status === "active";
  const canReview = order.status === "completed" && !order.has_review;

  const onMessageClient = () => {
    const requestId = refId(order.design_request);
    if (!vendor?.id || requestId === undefined) {
      toast.error("Couldn't open the conversation");
      return;
    }
    startConversation.mutate(
      { design_request: requestId, vendor: vendor.id },
      {
        onSuccess: (conversation) =>
          router.push(`/vendor/messages?c=${conversation.id}`),
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
            <Button
              variant="outline"
              disabled={startConversation.isPending}
              onClick={onMessageClient}
            >
              <HugeiconsIcon icon={Message01Icon} />
              Message client
            </Button>
            {isActive && (
              <ProductionUpdateDialog
                orderId={order.id}
                currentStage={order.current_stage}
                trigger={
                  <Button>
                    <HugeiconsIcon icon={Layers01Icon} />
                    Post update
                  </Button>
                }
              />
            )}
            {canReview && (
              <ReviewFormDialog
                orderId={order.id}
                title="Review the client"
                description="Rate working with this client."
                trigger={
                  <Button variant="outline">
                    <HugeiconsIcon icon={StarIcon} />
                    Review client
                  </Button>
                }
              />
            )}
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge kind="order" value={order.status} />
        {order.current_stage && (
          <StatusBadge kind="stage" value={order.current_stage} />
        )}
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

        <Card>
          <CardHeader>
            <CardTitle>Order details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-xs">
              <Detail label="Client" value={clientName} />
              <Detail
                label="Agreed price"
                value={formatMoney(order.final_price ?? bid?.proposed_price)}
              />
              <Detail label="Deadline" value={formatDate(order.deadline)} />
            </dl>
          </CardContent>
        </Card>
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
        <Skeleton className="h-40 w-full" />
      </div>
    </div>
  );
}
