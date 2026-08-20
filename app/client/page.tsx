import { DashboardPlaceholder } from "@/components/shared/dashboard-placeholder";

export default function ClientHome() {
  return (
    <DashboardPlaceholder
      title="Your requests"
      description="Post custom apparel jobs, compare vendor bids, and track production."
      next={[
        "Post a design request (multipart + reference images)",
        "Compare bids on a request",
        "Track awarded orders and production stages",
        "Confirm delivery and review the vendor",
      ]}
    />
  );
}
