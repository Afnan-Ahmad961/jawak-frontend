"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Location01Icon, PackageIcon } from "@hugeicons/core-free-icons";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StarRating } from "@/components/shared/star-rating";
import { DataError } from "@/components/shared/data-error";
import { ImageGallery } from "@/components/shared/image-gallery";
import { ReviewList } from "@/components/shared/review-list";
import { EmptyState } from "@/components/shared/empty-state";
import { initials } from "@/lib/format";
import { useVendor } from "@/lib/hooks/use-vendors";
import { useVendorReviews } from "@/lib/hooks/use-reviews";

export function VendorDetailView({ id }: { id: string }) {
  const { data: vendor, isLoading, isError, error, refetch } = useVendor(id);
  const reviewsQuery = useVendorReviews(id);

  if (isLoading) return <VendorDetailSkeleton />;
  if (isError || !vendor) {
    return <DataError error={error} onRetry={() => refetch()} />;
  }

  const specialties = vendor.specialties ?? [];
  const portfolio = vendor.portfolio ?? [];

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-wrap items-start gap-4">
          <Avatar size="lg">
            <AvatarFallback>{initials(vendor.company_name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 space-y-2">
            <div>
              <h1 className="text-lg font-semibold tracking-tight">
                {vendor.company_name}
              </h1>
              {vendor.location && (
                <p className="text-muted-foreground flex items-center gap-1 text-xs">
                  <HugeiconsIcon icon={Location01Icon} className="size-3.5" />
                  {vendor.location}
                </p>
              )}
            </div>
            {typeof vendor.rating === "number" && vendor.rating > 0 ? (
              <StarRating
                value={vendor.rating}
                count={vendor.review_count ?? undefined}
              />
            ) : (
              <p className="text-muted-foreground text-xs">No reviews yet</p>
            )}
            {vendor.capacity != null && (
              <p className="text-muted-foreground flex items-center gap-1 text-xs">
                <HugeiconsIcon icon={PackageIcon} className="size-3.5" />
                Capacity: {vendor.capacity}
              </p>
            )}
            {specialties.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {specialties.map((s) => (
                  <Badge key={s} variant="secondary" className="capitalize">
                    {s.replace(/_/g, " ")}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {vendor.bio && (
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-xs whitespace-pre-wrap">
              {vendor.bio}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Portfolio</CardTitle>
        </CardHeader>
        <CardContent>
          {portfolio.length > 0 ? (
            <ImageGallery
              images={portfolio.map((item) => ({
                id: item.id,
                src: item.image,
                alt: item.title ?? "Portfolio item",
              }))}
            />
          ) : (
            <p className="text-muted-foreground text-xs">
              This vendor hasn&apos;t added portfolio items yet.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {reviewsQuery.isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : reviewsQuery.isError ? (
            <DataError
              error={reviewsQuery.error}
              onRetry={() => reviewsQuery.refetch()}
            />
          ) : (reviewsQuery.data ?? []).length === 0 ? (
            <EmptyState title="No reviews yet" />
          ) : (
            <ReviewList reviews={reviewsQuery.data ?? []} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function VendorDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}
