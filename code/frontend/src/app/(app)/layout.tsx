import type { CSSProperties, ReactNode } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider>
      <SidebarProvider style={{ "--sidebar-width": "20rem" } as CSSProperties}>
        <AppSidebar />
        <main className="min-h-screen min-w-0 flex-1 bg-[#dae8ff] p-4 md:p-6">
          <SidebarTrigger
            aria-label="เปิดหรือปิดเมนู"
            title="เปิดหรือปิดเมนู"
            className="mb-3 size-9 rounded-lg bg-white text-[#2580D9] hover:bg-white/80"
          />
          {children}
        </main>
      </SidebarProvider>
    </TooltipProvider>
  );
}
