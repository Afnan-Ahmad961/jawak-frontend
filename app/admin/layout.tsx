import type { ReactNode } from "react";
import { AppHeader } from "@/components/shared/app-header";
import { AdminNav } from "@/components/admin/admin-nav";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <AppHeader title="Admin" />
      <div className="border-b border-border px-4 py-1.5 md:px-6">
        <AdminNav />
      </div>
      <main className="mx-auto w-full max-w-6xl flex-1 p-4 md:p-6">
        {children}
      </main>
    </div>
  );
}
