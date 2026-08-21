import { DashboardPlaceholder } from "@/components/shared/dashboard-placeholder";

export default function VendorHome() {
  return (
    <DashboardPlaceholder
      title="Vendor workspace"
      description="Manage your profile, discover matching jobs, bid, and run production."
      next={[
        "Create / edit vendor profile and portfolio",
        "Browse the open job board and place bids",
        "Manage assigned orders and post production updates",
        "Review clients after completion",
      ]}
    />
  );
}
