"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { DataError } from "@/components/shared/data-error";
import { VendorProfileForm } from "@/components/vendor/profile/vendor-profile-form";
import { PortfolioManager } from "@/components/vendor/profile/portfolio-manager";
import { useMyVendorProfile } from "@/lib/hooks/use-vendors";

/**
 * The vendor's own profile page. If no profile exists yet, shows the create
 * form (creating one promotes the account to a vendor). Otherwise shows the
 * edit form plus the portfolio manager.
 */
export function VendorProfileView() {
  const { data: vendor, isLoading, isError, error, refetch } =
    useMyVendorProfile();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-2xl">
        <DataError error={error} onRetry={() => refetch()} />
      </div>
    );
  }

  // No profile yet → onboarding.
  if (!vendor) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <PageHeader
          title="Set up your vendor profile"
          description="Create a profile to appear in the directory, get matched to jobs, and start bidding."
        />
        <VendorProfileForm />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Your profile"
        description="Keep your details current — clients see this when comparing bids."
      />
      <VendorProfileForm vendor={vendor} />
      <PortfolioManager items={vendor.portfolio ?? []} />
    </div>
  );
}
