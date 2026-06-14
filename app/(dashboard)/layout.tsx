"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { OneSignalInitializer } from "@/components/layout/OneSignalInitializer";
import { LoadingPage } from "@/components/ui/Spinner";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { hasAuthSession } from "@/lib/auth-session";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    if (!hasAuthSession()) {
      router.replace("/auth/login");
      return;
    }

    setIsCheckingAuth(false);
  }, [router]);

  useEffect(() => {
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };
  }, []);

  const handleToggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  if (isCheckingAuth) {
    return <LoadingPage />;
  }

  return (
    <ToastProvider>
      <Script
        src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
        strategy="afterInteractive"
      />
      <OneSignalInitializer />

      {/* Block access on screens smaller than lg */}
      <div className="flex lg:hidden h-dvh items-center justify-center bg-gradient-to-br from-primary-950 to-primary-900 p-8">
        <div className="flex flex-col items-center text-center max-w-sm">
          {/* Icon container */}
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 shadow-xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-white/80"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>

          {/* Badge */}
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-primary-500/20 px-3 py-1 text-xs font-medium text-primary-300 ring-1 ring-primary-500/30">
            <span className="h-1.5 w-1.5 rounded-full bg-primary-400" />
            Khu vực quản trị
          </span>

          <h2 className="text-2xl font-bold text-white">
            Màn hình quá nhỏ
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            Trang quản trị yêu cầu màn hình tối thiểu{" "}
            <span className="font-semibold text-slate-200">1024px</span>.
            Vui lòng sử dụng máy tính hoặc laptop để tiếp tục.
          </p>

          {/* Divider */}
          <div className="my-6 h-px w-full bg-white/10" />

          {/* Current size hint */}
          <p className="text-xs text-slate-500">
            Xoay thiết bị sang ngang hoặc dùng thiết bị khác
          </p>
        </div>
      </div>

      <div className="hidden lg:flex h-dvh min-h-0 overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={handleToggleSidebar}
          />
          <main className="flex-1 overflow-y-auto bg-gray-50">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
