"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/components/providers/auth-provider";
import { LoadingState } from "@/components/ui/loading-state";

export function AuthGate({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [pathname, router, status]);

  if (status === "loading") {
    return <LoadingState label="正在校验登录状态..." />;
  }

  if (status === "unauthenticated") {
    return <LoadingState label="即将跳转到登录页..." />;
  }

  return <>{children}</>;
}
