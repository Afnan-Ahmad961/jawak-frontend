import { OrderDetailView } from "@/components/vendor/orders/order-detail-view";

export default async function VendorOrderDetailPage({
  params,
}: PageProps<"/vendor/orders/[id]">) {
  const { id } = await params;
  return <OrderDetailView id={id} />;
}
