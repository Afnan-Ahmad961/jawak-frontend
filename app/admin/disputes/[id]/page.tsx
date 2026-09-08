import { DisputeDetailView } from "@/components/admin/disputes/dispute-detail-view";

export default async function AdminDisputeDetailPage({
  params,
}: PageProps<"/admin/disputes/[id]">) {
  const { id } = await params;
  return <DisputeDetailView id={id} />;
}
