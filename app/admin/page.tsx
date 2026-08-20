import { DashboardPlaceholder } from "@/components/shared/dashboard-placeholder";

export default function AdminHome() {
  return (
    <DashboardPlaceholder
      title="Admin console"
      description="Moderate disputes and monitor the marketplace."
      next={[
        "Review and resolve disputes",
        "Marketplace analytics overview (volume metrics)",
      ]}
    />
  );
}
