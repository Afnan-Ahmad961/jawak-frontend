import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StarRating } from "@/components/shared/star-rating";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { VendorSummary as VendorSummaryType } from "@/lib/api/types";

/**
 * Compact vendor identity: initials avatar + company name + (optional) rating.
 * Used in bid rows and order summaries where a full card is too much.
 */
export function VendorSummary({
  vendor,
  showRating = true,
  className,
}: {
  vendor: VendorSummaryType | null | undefined;
  showRating?: boolean;
  className?: string;
}) {
  const name = vendor?.company_name || "Unknown vendor";
  const rating = vendor?.avg_rating;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Avatar size="sm">
        <AvatarFallback>{initials(name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium">{name}</p>
        {showRating && typeof rating === "number" && rating > 0 && (
          <StarRating
            value={rating}
            count={vendor?.review_count ?? undefined}
            size="sm"
          />
        )}
      </div>
    </div>
  );
}
