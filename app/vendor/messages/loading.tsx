import { Skeleton } from "@/components/ui/skeleton";

export default function VendorMessagesLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-[32rem] w-full" />
    </div>
  );
}
