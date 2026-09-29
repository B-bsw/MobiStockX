import type { CSSProperties, ReactNode } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { AuthGuard } from "@/components/auth-guard";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth-context";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <TooltipProvider>
        <SidebarProvider style={{ "--sidebar-width": "17rem" } as CSSProperties}>
          <AppSidebar />

          <div className="flex min-w-0 flex-1 flex-col">
            {/* Stays put so the menu toggle is reachable from anywhere in a
                long table, which is most of this app. */}
            <header className="sticky top-0 z-[var(--z-sticky)] flex h-14 shrink-0 items-center gap-2 border-b bg-background px-2 sm:px-4">
              <SidebarTrigger
                size="icon-touch"
                variant="ghost"
                aria-label="เปิดหรือปิดเมนู"
                title="เปิดหรือปิดเมนู (Ctrl+B)"
                className="text-muted-foreground hover:text-foreground"
              />
              <span className="truncate text-sm font-semibold text-foreground md:hidden">
                Mobistock
              </span>
            </header>

            <main className="min-w-0 flex-1 p-3 sm:p-4 lg:p-6">
              <AuthGuard>{children}</AuthGuard>
            </main>
          </div>
        </SidebarProvider>
      </TooltipProvider>
    </AuthProvider>
  );
}
