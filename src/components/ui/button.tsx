import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

export function Button({
  className,
  variant = "primary",
  fullWidth = false,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" &&
          "bg-[linear-gradient(135deg,#f5a072,#ee7f81)] text-white shadow-[0_14px_30px_rgba(238,127,129,0.28)] hover:-translate-y-0.5",
        variant === "secondary" &&
          "border border-[#ecd9ce] bg-white/80 text-slate-700 hover:border-[#f0b698] hover:bg-white",
        variant === "ghost" &&
          "bg-transparent text-slate-500 hover:bg-white/70 hover:text-slate-700",
        variant === "danger" &&
          "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100",
        fullWidth && "w-full",
        className,
      )}
      {...props}
    />
  );
}
