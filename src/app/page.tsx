"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/providers/auth-provider";
import { LoadingState } from "@/components/ui/loading-state";

export default function Home() {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [router, status]);

  return <LoadingState label="正在进入宝宝成长记录..." />;
}
