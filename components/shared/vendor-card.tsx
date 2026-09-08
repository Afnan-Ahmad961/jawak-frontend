import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Location01Icon } from "@hugeicons/core-free-icons";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { StarRating } from "@/components/shared/star-rating";
import { initials } from "@/lib/format";
import type { Vendor } from "@/lib/api/types";

/**
 * Vendor tile for the browse directory. Links through to the vendor's profile.
 * `href` is passed so the same card works from any role's namespace.
 */
export function VendorCard({ vendor, href }: { vendor: Vendor; href: string }) {
  const specialties = vendor.specialties ?? [];

  return (
    <Link
      href={href}
      className="block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <Card className="h-full transition-colors hover:bg-muted/40">
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <Avatar>
              <AvatarFallback>{initials(vendor.company_name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {vendor.company_name}
              </p>
              {vendor.location && (
                <p className="text-muted-foreground flex items-center gap-1 text-xs">
                  <HugeiconsIcon icon={Location01Icon} className="size-3" />
                  <span className="truncate">{vendor.location}</span>
                </p>
              )}
            </div>
          </div>

          {typeof vendor.avg_rating === "number" && vendor.avg_rating > 0 ? (
            <StarRating
              value={vendor.avg_rating}
              count={vendor.review_count ?? undefined}
              size="sm"
            />
          ) : (
            <p className="text-muted-foreground text-xs">No reviews yet</p>
          )}

          {specialties.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {specialties.slice(0, 4).map((s) => (
                <Badge key={s} variant="secondary" className="capitalize">
                  {s.replace(/_/g, " ")}
                </Badge>
              ))}
              {specialties.length > 4 && (
                <Badge variant="outline">+{specialties.length - 4}</Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
