"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { Message01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { DataError } from "@/components/shared/data-error";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ImageGallery, type GalleryImage } from "@/components/shared/image-gallery";
import { BidForm } from "@/components/vendor/jobs/bid-form";
import { apparelLabel } from "@/lib/labels";
import { formatDate, formatList, formatMoney, formatQuantity } from "@/lib/format";
import { refId } from "@/lib/api/refs";
import { ApiError } from "@/lib/api/http";
import { useRequest } from "@/lib/hooks/use-requests";
import { useMyBids, useWithdrawBid } from "@/lib/hooks/use-bids";
import { useMyVendorProfile } from "@/lib/hooks/use-vendors";
import { useStartConversation } from "@/lib/hooks/use-conversations";

export function JobDetailView({ id }: { id: string }) {
  const router = useRouter();
  const { data: request, isLoading, isError, error, refetch } = useRequest(id);
  const {
    data: myBids = [],
    isPending: bidsPending,
    isError: bidsError,
    error: bidsErrorObj,
    refetch: refetchBids,
  } = useMyBids();
  const { data: vendor } = useMyVendorProfile();
  const withdrawBid = useWithdrawBid();
  const startConversation = useStartConversation();

  if (isLoading) return <JobDetailSkeleton />;
  if (isError || !request) {
    return <DataError error={error} onRetry={() => refetch()} />;
  }

  const myBid = myBids.find(
    (bid) => String(refId(bid.design_request)) === String(request.id),
  );
  const isOpen = request.status === "open";

  const gallery: GalleryImage[] = [
    ...(request.design_image
      ? [{ id: "design", src: request.design_image, alt: request.title }]
      : []),
    ...(request.reference_images ?? []).map((img) => ({
      id: img.id,
      src: img.image,
      alt: img.label ?? "Reference image",
    })),
  ];

  const onMessageClient = () => {
    if (!vendor?.id) {
      toast.error("Create your vendor profile first");
      return;
    }
    startConversation.mutate(
      { design_request: request.id, vendor: vendor.id },
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
        title={request.title}
        actions={
          <Button
            variant="outline"
            disabled={startConversation.isPending}
            onClick={onMessageClient}
          >
            <HugeiconsIcon icon={Message01Icon} />
            Message client
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge kind="request" value={request.status} />
        <span className="text-muted-foreground text-xs">
          {request.deadline
            ? `Deadline ${formatDate(request.deadline)}`
            : "No deadline"}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4 text-xs sm:grid-cols-3">
                <Spec label="Apparel type" value={apparelLabel(request.apparel_type)} />
                <Spec label="Quantity" value={formatQuantity(request.quantity)} />
                <Spec label="Material" value={request.material || "—"} />
                <Spec label="Sizes" value={formatList(request.sizes)} />
                <Spec label="Colors" value={request.color_preferences || "—"} />
              </dl>
              {request.description && (
                <div className="mt-4 space-y-1">
                  <dt className="text-muted-foreground text-xs">Description</dt>
                  <dd className="text-xs whitespace-pre-wrap">
                    {request.description}
                  </dd>
                </div>
              )}
            </CardContent>
          </Card>

          {gallery.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Images</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageGallery images={gallery} />
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{myBid ? "Your bid" : "Place a bid"}</CardTitle>
            </CardHeader>
            <CardContent>
              {bidsPending ? (
                <Skeleton className="h-40 w-full" />
              ) : bidsError ? (
                // Don't show the bid form until we know whether a bid exists —
                // otherwise an existing bidder could submit a duplicate.
                <DataError error={bidsErrorObj} onRetry={() => refetchBids()} />
              ) : myBid ? (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Price</span>
                    <span className="font-medium">
                      {formatMoney(myBid.proposed_price)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="font-medium">{myBid.delivery_days} days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <StatusBadge kind="bid" value={myBid.status} />
                  </div>
                  {myBid.status === "pending" && (
                    <ConfirmDialog
                      title="Withdraw this bid?"
                      description="The client will no longer see your bid. You can bid again while the request is open."
                      confirmLabel="Withdraw"
                      destructive
                      pending={withdrawBid.isPending}
                      onConfirm={() =>
                        withdrawBid.mutate(myBid.id, {
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
                          variant="destructive"
                          size="sm"
                          className="w-full"
                          disabled={withdrawBid.isPending}
                        >
                          Withdraw bid
                        </Button>
                      }
                    />
                  )}
                </div>
              ) : isOpen ? (
                <BidForm requestId={request.id} />
              ) : (
                <p className="text-muted-foreground text-xs">
                  This request is no longer open for bids.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

function JobDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-5 w-40" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}
