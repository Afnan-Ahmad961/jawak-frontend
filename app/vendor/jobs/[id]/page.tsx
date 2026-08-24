import { JobDetailView } from "@/components/vendor/jobs/job-detail-view";

export default async function VendorJobDetailPage({
  params,
}: PageProps<"/vendor/jobs/[id]">) {
  const { id } = await params;
  return <JobDetailView id={id} />;
}
