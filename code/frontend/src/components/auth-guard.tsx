"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Panel } from "@/components/ui/panel";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth-context";
import { canAccess, landingRoute, routeForPath } from "@/lib/permissions";

/**
 * Shows the shape of the page that is about to arrive rather than a line of
 * text, so the layout does not jump once the session resolves.
 */
function PageSkeleton({ message }: { message: string }) {
  return (
    <Panel className="overflow-hidden">
      <span className="sr-only" role="status">
        {message}
      </span>
      <div aria-hidden="true">
        <div className="border-b px-4 py-5 sm:px-6">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="mt-2 h-4 w-56" />
        </div>
        <div className="space-y-3 px-4 py-5 sm:px-6">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-11 w-full" />
          ))}
        </div>
      </div>
    </Panel>
  );
}

export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const route = routeForPath(pathname);
  // An unknown path is left to the 404 handler; a known one must be permitted.
  const permitted = !user || route === null || canAccess(user.role, route);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/auth/login");
      return;
    }

    if (!permitted) {
      router.replace(landingRoute(user.role));
    }
  }, [loading, user, permitted, router]);

  if (loading) {
    return <PageSkeleton message="กำลังตรวจสอบสิทธิ์" />;
  }

  if (!user) {
    return <PageSkeleton message="กำลังพาไปหน้าเข้าสู่ระบบ" />;
  }

  if (!permitted) {
    return <PageSkeleton message="ไม่มีสิทธิ์เข้าถึงหน้านี้ กำลังพากลับ" />;
  }

  return <>{children}</>;
}
