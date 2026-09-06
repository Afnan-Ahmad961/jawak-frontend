import type { ReactNode } from "react";
import { ClientSidebar } from "@/components/client/client-sidebar";
import { ClientTopbar } from "@/components/client/client-topbar";

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-dvh overflow-hidden">
      {/* Fixed desktop rail; on mobile it lives in the top bar's drawer. */}
      <aside className="hidden w-60 shrink-0 border-r border-sidebar-border md:block">
        <ClientSidebar />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <ClientTopbar />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-6xl p-4 md:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
