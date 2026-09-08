import { OrderDetailView } from "@/components/client/orders/order-detail-view";

export default async function OrderDetailPage({
  params,
}: PageProps<"/client/orders/[id]">) {
  const { id } = await params;
  return <OrderDetailView id={id} />;
}
