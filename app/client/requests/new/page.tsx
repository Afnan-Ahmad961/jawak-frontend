import { PageHeader } from "@/components/shared/page-header";
import { RequestForm } from "@/components/client/requests/request-form";

export default function NewRequestPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Post a design request"
        description="Describe what you need made. Vendors will bid with a price and timeline."
      />
      <RequestForm />
    </div>
  );
}
