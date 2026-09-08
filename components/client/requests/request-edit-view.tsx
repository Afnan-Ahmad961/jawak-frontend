"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { DataError } from "@/components/shared/data-error";
import { RequestForm } from "@/components/client/requests/request-form";
import { useRequest } from "@/lib/hooks/use-requests";

/** Loads a request and hands it to the shared form in edit mode. */
export function RequestEditView({ id }: { id: string }) {
  const { data: request, isLoading, isError, error, refetch } = useRequest(id);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Edit request"
        description="Update the details below. Vendors see changes on their job board."
      />
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : isError || !request ? (
        <DataError error={error} onRetry={() => refetch()} />
      ) : (
        <RequestForm request={request} />
      )}
    </div>
  );
}
