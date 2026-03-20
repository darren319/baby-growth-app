"use client";

import type { ReactNode } from "react";
import { Baby, Clock3, GalleryHorizontal, Home, LogOut, Sparkles, TrendingUp } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { useAppData } from "@/components/providers/app-data-provider";
import { useAuth } from "@/components/providers/auth-provider";
import { useToast } from "@/components/providers/toast-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const primaryNav = [
  { href: "/dashboard", label: "首页", icon: Home },
  { href: "/memories", label: "记录", icon: Sparkles },
  { href: "/timeline", label: "时间轴", icon: Clock3 },
  { href: "/gallery", label: "相册", icon: GalleryHorizontal },
  { href: "/growth", label: "成长", icon: TrendingUp },
];

const secondaryNav = [
  { href: "/babies", label: "宝宝档案", icon: Baby },
  { href: "/milestones", label: "里程碑", icon: Sparkles },
  { href: "/future", label: "未来功能", icon: Sparkles },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut, isMockMode } = useAuth();
  const { babies, selectedBabyId, setSelectedBabyId, selectedBaby } = useAppData();
  const { showToast } = useToast();

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,rgba(255,231,219,0.95),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(213,239,223,0.8),transparent_28%),linear-gradient(180deg,#fff8f3_0%,#fffdf9_100%)] pb-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[300px] bg-[radial-gradient(circle_at_top,rgba(242,160,114,0.24),transparent_52%)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-10 pt-4 sm:px-6">
        <header className="sticky top-3 z-40 mb-5 rounded-[30px] border border-white/70 bg-white/82 p-4 shadow-[0_20px_48px_rgba(244,180,145,0.16)] backdrop-blur-xl">
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Link
                  className="inline-flex items-center gap-2 text-lg font-black tracking-tight text-slate-900"
                  href="/dashboard"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#ffd7be,#f6a77d)] text-lg text-white shadow-[0_10px_24px_rgba(242,160,114,0.28)]">
                    宝
                  </span>
                  <span>宝宝成长记录</span>
                </Link>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedBaby
                    ? `正在查看 ${selectedBaby.name} 的成长档案`
                    : "先创建一个宝宝档案，就能开始记录啦。"}
                </p>
              </div>
              <Button
                onClick={async () => {
                  await signOut();
                  showToast("已安全退出", "success");
                  router.replace("/login");
                }}
                type="button"
                variant="ghost"
              >
                <LogOut className="mr-2 h-4 w-4" />
                退出
              </Button>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <span className="rounded-full bg-[#fff3ea] px-3 py-1 font-semibold text-[#aa6d4b]">
                  {isMockMode ? "演示模式" : "Supabase 实时模式"}
                </span>
                <span>{user?.email}</span>
              </div>
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                <select
                  className="h-11 min-w-[220px] rounded-2xl border border-[#ead9cf] bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#f0a177] focus:ring-4 focus:ring-[#ffd9c6]/50"
                  onChange={(event) => setSelectedBabyId(event.target.value)}
                  value={selectedBabyId ?? ""}
                >
                  {babies.length === 0 ? (
                    <option value="">还没有宝宝档案</option>
                  ) : null}
                  {babies.map((baby) => (
                    <option key={baby.id} value={baby.id}>
                      {baby.name}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {secondaryNav.map((item) => {
                    const Icon = item.icon;
                    const active = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        className={cn(
                          "inline-flex min-h-11 items-center gap-2 rounded-2xl border px-3 text-sm font-semibold transition",
                          active
                            ? "border-[#f0b698] bg-[#fff3ea] text-[#a76446]"
                            : "border-[#ead9cf] bg-white text-slate-600",
                        )}
                        href={item.href}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-3 z-40 mx-auto flex w-[calc(100%-24px)] max-w-xl items-center justify-between rounded-[28px] border border-white/80 bg-white/88 px-2 py-2 shadow-[0_18px_40px_rgba(201,140,100,0.22)] backdrop-blur-xl">
        {primaryNav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-semibold transition",
                active ? "bg-[#fff1e8] text-[#a76446]" : "text-slate-500",
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
