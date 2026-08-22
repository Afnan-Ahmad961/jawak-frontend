import { VendorDetailView } from "@/components/client/vendors/vendor-detail-view";

export default async function VendorDetailPage({
  params,
}: PageProps<"/client/vendors/[id]">) {
  const { id } = await params;
  return <VendorDetailView id={id} />;
}
