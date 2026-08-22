import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StarRating } from "@/components/shared/star-rating";
import { asObjectRef } from "@/lib/api/refs";
import { formatDate, initials } from "@/lib/format";
import type { Review, UserSummary } from "@/lib/api/types";

/** A list of reviews (e.g. on a vendor profile). */
export function ReviewList({ reviews }: { reviews: Review[] }) {
  return (
    <ul className="space-y-4">
      {reviews.map((review) => {
        const reviewer = asObjectRef<UserSummary>(review.reviewer);
        const label = reviewer?.name || reviewer?.email || "Client";
        return (
          <li key={review.id} className="flex gap-3">
            <Avatar size="sm">
              <AvatarFallback>{initials(label)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-medium">{label}</span>
                <span className="text-muted-foreground text-xs">
                  {formatDate(review.created_at)}
                </span>
              </div>
              <StarRating value={review.rating} size="sm" />
              {review.comment && (
                <p className="text-muted-foreground text-xs">{review.comment}</p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
