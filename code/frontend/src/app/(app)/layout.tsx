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
        <SidebarProvider
          style={{ "--sidebar-width": "17rem" } as CSSProperties}
        >
          <AppSidebar />

          <div className="relative isolate flex min-w-0 flex-1 flex-col bg-white dark:bg-background">
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-[65dvh] w-full text-[#dce7ff] dark:text-[#26354f]"
              viewBox="0 0 1440 800"
              preserveAspectRatio="none"
            >
              <path
                fill="currentColor"
                d="M0 0H1440V255C1230 300 1070 260 870 250C650 220 485 255 315 455C175 625 95 735 0 780Z"
              />
            </svg>

            {/* Stays put so the menu toggle is reachable from anywhere in a
                long table, which is most of this app. */}
            <header className="sticky top-0 z-(--z-sticky) flex h-14 shrink-0 items-center gap-2 border-b bg-background px-2 sm:px-4">
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

            <main className="relative min-w-0 flex-1 p-3 sm:p-4 lg:p-6">
              <AuthGuard>{children}</AuthGuard>
            </main>
          </div>
        </SidebarProvider>
      </TooltipProvider>
    </AuthProvider>
  );
}
