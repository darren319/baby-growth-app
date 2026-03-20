"use client";

import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Drawer({
  open,
  title,
  description,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      <button
        aria-label="关闭弹层"
        className="absolute inset-0 bg-slate-900/28 backdrop-blur-sm"
        onClick={onClose}
        type="button"
      />
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 max-h-[88vh] overflow-auto rounded-t-[32px] border border-white/70 bg-[#fffdf9] p-5 shadow-[0_-24px_80px_rgba(60,34,18,0.18)]",
        )}
      >
        <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-[#ead6ca]" />
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{title}</h2>
            {description ? (
              <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
            ) : null}
          </div>
          <Button onClick={onClose} type="button" variant="ghost">
            关闭
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
