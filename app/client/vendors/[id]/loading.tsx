import { Skeleton } from "@/components/ui/skeleton";

export default function VendorDetailLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}
