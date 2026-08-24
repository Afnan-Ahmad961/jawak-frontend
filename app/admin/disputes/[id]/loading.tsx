import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDisputeDetailLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-48 w-full" />
    </div>
  );
}
