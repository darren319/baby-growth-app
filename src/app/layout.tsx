import type { Metadata } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";

import { AppDataProvider } from "@/components/providers/app-data-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ToastProvider } from "@/components/providers/toast-provider";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/constants";
import "./globals.css";

const aeonik = localFont({
  src: [
    {
      path: "../fonts/Aeonik-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/Aeonik-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/Aeonik-Black.ttf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-aeonik",
});

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${aeonik.variable} bg-[#fff8f3] text-slate-900 antialiased`}>
        <ToastProvider>
          <AuthProvider>
            <AppDataProvider>{children}</AppDataProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
