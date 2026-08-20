import type { ReactNode } from "react";
import { AppHeader } from "@/components/shared/app-header";

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <AppHeader title="Customer" />
      <main className="flex-1 p-4 md:p-6">{children}</main>
    </div>
  );
}
