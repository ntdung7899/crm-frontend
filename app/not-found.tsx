"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/");
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 text-white">
      <div className="pointer-events-none absolute -left-28 top-14 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl animate-crm-float" />
      <div className="pointer-events-none absolute -right-20 bottom-8 h-72 w-72 rounded-full bg-primary-300/20 blur-3xl animate-crm-float" />
      <div className="pointer-events-none absolute left-1/2 top-1/4 h-10 w-10 -translate-x-1/2 rounded-full bg-cyan-300/60 animate-crm-orbit" />

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-4xl items-center px-6 py-16">
        <div className="w-full rounded-3xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-md sm:p-10">
          <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2">
            <Image src="/logo.jpg" alt="CRM" width={32} height={32} className="h-8 w-8 object-contain" priority />
            <span className="text-sm font-semibold text-primary-100">CRM Dien Lanh</span>
          </div>

          <div className="grid items-center gap-8 md:grid-cols-[1.2fr,0.8fr]">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-cyan-200">Error 404</p>
              <h1 className="mt-3 text-5xl font-extrabold leading-tight sm:text-6xl">
                Trang bạn tìm
                <span className="block bg-gradient-to-r from-cyan-300 to-primary-100 bg-clip-text text-transparent">
                  không tồn tại
                </span>
              </h1>
              <p className="mt-4 max-w-xl text-base text-primary-100/90 sm:text-lg">
                Đường dẫn có thể đã thay đổi hoặc trang đã được gỡ khỏi hệ thống. Bạn có thể quay về màn trước hoặc trở lại bảng điều khiển để tiếp tục công việc.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center justify-center rounded-xl border border-white/35 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
                >
                  Quay lại trang trước
                </button>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-xl bg-primary-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-400"
                >
                  Về bảng điều khiển
                </Link>
              </div>
            </div>

            <div className="relative hidden md:block">
              <div className="absolute inset-0 rounded-2xl bg-white/10 blur-2xl" />
              <div className="relative rounded-2xl border border-white/20 bg-white/10 p-6">
                <p className="text-7xl font-black tracking-tight text-cyan-300/90">404</p>
                <p className="mt-2 text-sm text-primary-100/90">Không tìm thấy nội dung theo URL hiện tại</p>
                <div className="mt-4 h-1.5 w-24 rounded-full bg-gradient-to-r from-cyan-300 to-primary-400" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
