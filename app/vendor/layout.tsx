import type { ReactNode } from "react";
import { AppHeader } from "@/components/shared/app-header";
import { VendorNav } from "@/components/vendor/vendor-nav";

export default function VendorLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <AppHeader title="Vendor" />
      <div className="border-b border-border px-4 py-1.5 md:px-6">
        <VendorNav />
      </div>
      <main className="mx-auto w-full max-w-6xl flex-1 p-4 md:p-6">
        {children}
      </main>
    </div>
  );
}
