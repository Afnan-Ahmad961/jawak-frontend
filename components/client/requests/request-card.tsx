import Link from "next/link";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar03Icon, PackageIcon, UserGroupIcon } from "@hugeicons/core-free-icons";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { apparelLabel } from "@/lib/labels";
import { formatDate, formatQuantity } from "@/lib/format";
import { mediaUrl } from "@/lib/media";
import type { DesignRequest } from "@/lib/api/types";

/** Summary tile for a design request in the client's list. */
export function RequestCard({ request }: { request: DesignRequest }) {
  const bidCount = request.bids_count ?? 0;

  return (
    <Link
      href={`/client/requests/${request.id}`}
      className="block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <Card className="h-full transition-colors hover:bg-muted/40">
        {request.design_image && (
          <div className="relative aspect-video w-full bg-muted">
            <Image
              src={mediaUrl(request.design_image)}
              alt={request.title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover"
            />
          </div>
        )}
        <CardContent className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <p className="line-clamp-2 text-sm font-medium">{request.title}</p>
            <StatusBadge kind="request" value={request.status} />
          </div>
          <div className="text-muted-foreground grid grid-cols-2 gap-1.5 text-xs">
            <span className="flex items-center gap-1">
              <HugeiconsIcon icon={PackageIcon} className="size-3.5" />
              {apparelLabel(request.apparel_type)}
            </span>
            <span className="flex items-center gap-1">
              <HugeiconsIcon icon={UserGroupIcon} className="size-3.5" />
              {formatQuantity(request.quantity)}
            </span>
            <span className="flex items-center gap-1">
              <HugeiconsIcon icon={Calendar03Icon} className="size-3.5" />
              {request.deadline ? formatDate(request.deadline) : "No deadline"}
            </span>
            <span className="flex items-center gap-1">
              {bidCount} {bidCount === 1 ? "bid" : "bids"}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
