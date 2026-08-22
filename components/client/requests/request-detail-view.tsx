"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  PencilEdit02Icon,
  Delete02Icon,
  Cancel01Icon,
  ImageUploadIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { DataError } from "@/components/shared/data-error";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ImageGallery, type GalleryImage } from "@/components/shared/image-gallery";
import { BidComparison } from "@/components/client/requests/bid-comparison";
import { apparelLabel } from "@/lib/labels";
import {
  formatDate,
  formatDateTime,
  formatList,
  formatQuantity,
} from "@/lib/format";
import { ApiError } from "@/lib/api/http";
import {
  useAddReferenceImages,
  useDeleteReferenceImage,
  useDeleteRequest,
  useRequest,
} from "@/lib/hooks/use-requests";
import { useRequestBids } from "@/lib/hooks/use-bids";
import { useStartConversation } from "@/lib/hooks/use-conversations";
import type { Id } from "@/lib/api/types";

export function RequestDetailView({ id }: { id: string }) {
  const router = useRouter();
  const { data: request, isLoading, isError, error, refetch } = useRequest(id);
  const bidsQuery = useRequestBids(id);

  const deleteRequest = useDeleteRequest();
  const deleteReferenceImage = useDeleteReferenceImage(id);
  const addReferenceImages = useAddReferenceImages();
  const startConversation = useStartConversation();

  if (isLoading) return <RequestDetailSkeleton />;
  if (isError || !request) {
    return <DataError error={error} onRetry={() => refetch()} />;
  }

  const isOpen = request.status === "open";
  const referenceImages = request.reference_images ?? [];

  const gallery: GalleryImage[] = [
    ...(request.design_image
      ? [{ id: "design", src: request.design_image, alt: request.title }]
      : []),
    ...referenceImages.map((img) => ({
      id: img.id,
      src: img.image,
      alt: img.label ?? "Reference image",
    })),
  ];

  const onDelete = () =>
    deleteRequest.mutate(request.id, {
      onSuccess: () => {
        toast.success("Request deleted");
        router.push("/client/requests");
      },
      onError: (err) =>
        toast.error(
          err instanceof ApiError ? err.message : "Couldn't delete request",
        ),
    });

  const onMessageVendor = (vendorId: Id) =>
    startConversation.mutate(
      { design_request: request.id, vendor: vendorId },
      {
        onSuccess: (conversation) =>
          router.push(`/client/messages?c=${conversation.id}`),
        onError: (err) =>
          toast.error(
            err instanceof ApiError ? err.message : "Couldn't start conversation",
          ),
      },
    );

  const onAddReferenceImages = (files: File[]) => {
    if (files.length === 0) return;
    addReferenceImages.mutate(
      { requestId: request.id, files },
      {
        onSuccess: () => toast.success("Reference images added"),
        onError: (err) =>
          toast.error(
            err instanceof ApiError ? err.message : "Couldn't upload images",
          ),
      },
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={request.title}
        actions={
          isOpen && (
            <>
              <Button
                variant="outline"
                render={<Link href={`/client/requests/${request.id}/edit`} />}
              >
                <HugeiconsIcon icon={PencilEdit02Icon} />
                Edit
              </Button>
              <ConfirmDialog
                title="Delete this request?"
                description="This permanently removes the request and any bids on it. This can't be undone."
                confirmLabel="Delete"
                destructive
                pending={deleteRequest.isPending}
                onConfirm={onDelete}
                trigger={
                  <Button variant="destructive">
                    <HugeiconsIcon icon={Delete02Icon} />
                    Delete
                  </Button>
                }
              />
            </>
          )
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge kind="request" value={request.status} />
        <span className="text-muted-foreground text-xs">
          Posted {formatDateTime(request.created_at)}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Specs */}
          <Card>
            <CardHeader>
              <CardTitle>Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4 text-xs sm:grid-cols-3">
                <Spec label="Apparel type" value={apparelLabel(request.apparel_type)} />
                <Spec label="Quantity" value={formatQuantity(request.quantity)} />
                <Spec
                  label="Deadline"
                  value={request.deadline ? formatDate(request.deadline) : "No deadline"}
                />
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

          {/* Bids */}
          <Card>
            <CardHeader>
              <CardTitle>Bids</CardTitle>
            </CardHeader>
            <CardContent>
              {bidsQuery.isLoading ? (
                <Skeleton className="h-32 w-full" />
              ) : bidsQuery.isError ? (
                <DataError
                  error={bidsQuery.error}
                  onRetry={() => bidsQuery.refetch()}
                />
              ) : (
                <BidComparison
                  bids={bidsQuery.data ?? []}
                  requestStatus={request.status}
                  onMessageVendor={onMessageVendor}
                  messagePending={startConversation.isPending}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Images */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Design</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {request.design_image ? (
                <div className="relative aspect-square w-full overflow-hidden rounded-md border border-border bg-muted">
                  <Image
                    src={request.design_image}
                    alt={request.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
              ) : (
                <p className="text-muted-foreground text-xs">
                  No design image uploaded.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reference images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {referenceImages.length > 0 ? (
                isOpen ? (
                  <div className="grid grid-cols-3 gap-2">
                    {referenceImages.map((img) => (
                      <div
                        key={img.id}
                        className="group relative aspect-square overflow-hidden rounded-md border border-border bg-muted"
                      >
                        <Image
                          src={img.image}
                          alt={img.label ?? "Reference image"}
                          fill
                          sizes="120px"
                          className="object-cover"
                        />
                        <ConfirmDialog
                          title="Remove this image?"
                          confirmLabel="Remove"
                          destructive
                          pending={deleteReferenceImage.isPending}
                          onConfirm={() =>
                            deleteReferenceImage.mutate(img.id, {
                              onError: (err) =>
                                toast.error(
                                  err instanceof ApiError
                                    ? err.message
                                    : "Couldn't remove image",
                                ),
                            })
                          }
                          trigger={
                            <button
                              type="button"
                              aria-label="Remove image"
                              className="bg-background/80 text-foreground absolute top-1 right-1 rounded-full p-0.5 opacity-0 transition-opacity group-hover:opacity-100"
                            >
                              <HugeiconsIcon icon={Cancel01Icon} className="size-3.5" />
                            </button>
                          }
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <ImageGallery
                    images={referenceImages.map((img) => ({
                      id: img.id,
                      src: img.image,
                      alt: img.label ?? "Reference image",
                    }))}
                    className="grid-cols-3"
                  />
                )
              ) : (
                <p className="text-muted-foreground text-xs">
                  No reference images.
                </p>
              )}

              {isOpen && (
                <label className="border-border text-muted-foreground hover:bg-muted/50 flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed px-3 py-2 text-xs transition-colors">
                  <HugeiconsIcon icon={ImageUploadIcon} className="size-4" />
                  {addReferenceImages.isPending ? "Uploading…" : "Add images"}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    disabled={addReferenceImages.isPending}
                    onChange={(e) => {
                      onAddReferenceImages(Array.from(e.target.files ?? []));
                      e.target.value = "";
                    }}
                  />
                </label>
              )}
            </CardContent>
          </Card>

          {gallery.length > 0 && (
            <p className="text-muted-foreground text-center text-xs">
              {gallery.length} image{gallery.length === 1 ? "" : "s"} total
            </p>
          )}
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

function RequestDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-5 w-40" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </div>
  );
}
