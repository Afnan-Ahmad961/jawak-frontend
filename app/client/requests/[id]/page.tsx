import { RequestDetailView } from "@/components/client/requests/request-detail-view";

export default async function RequestDetailPage({
  params,
}: PageProps<"/client/requests/[id]">) {
  const { id } = await params;
  return <RequestDetailView id={id} />;
}
