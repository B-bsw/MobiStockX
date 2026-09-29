"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Panel } from "@/components/ui/panel";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth-context";

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

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return <PageSkeleton message="กำลังตรวจสอบสิทธิ์" />;
  }

  if (!user) {
    return <PageSkeleton message="กำลังพาไปหน้าเข้าสู่ระบบ" />;
  }

  return <>{children}</>;
}
