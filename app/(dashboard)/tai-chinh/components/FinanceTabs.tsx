"use client";

import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS: { id: string; label: string; href: string; matches: string[] }[] = [
  {
    id: "home",
    label: "Trang chủ",
    href: "/tai-chinh",
    matches: ["/tai-chinh"],
  },
  {
    id: "quy",
    label: "Quỹ",
    href: "/tai-chinh/quy",
    matches: ["/tai-chinh/quy", "/tai-chinh/phieu-thu", "/tai-chinh/phieu-chi"],
  },
  {
    id: "ngan-sach",
    label: "Ngân sách",
    href: "/tai-chinh/ngan-sach",
    matches: ["/tai-chinh/ngan-sach"],
  },
  {
    id: "yccp",
    label: "Yêu cầu chi phí",
    href: "/tai-chinh/yeu-cau-chi-phi",
    matches: ["/tai-chinh/yeu-cau-chi-phi"],
  },
  // { id: "cong-no", label: "Công nợ", href: "/tai-chinh/cong-no", matches: ["/tai-chinh/cong-no"] },
  // { id: "so-cai", label: "Sổ cái", href: "/tai-chinh/so-cai", matches: ["/tai-chinh/so-cai"] },
  // { id: "bao-cao", label: "Báo cáo tài chính", href: "/tai-chinh/bao-cao", matches: ["/tai-chinh/bao-cao"] },
];

export function FinanceTabs() {
  const pathname = usePathname();
  const router = useRouter();

  // Determine the most specific match (longest match wins)
  let activeId = "home";
  let bestLen = 0;
  for (const tab of TABS) {
    for (const m of tab.matches) {
      if (
        (pathname === m || pathname.startsWith(m + "/")) &&
        m.length > bestLen
      ) {
        activeId = tab.id;
        bestLen = m.length;
      }
    }
  }

  return (
    <div className="bg-white border-b border-gray-200 px-6 pt-5">
      <h1 className="text-xl font-semibold text-gray-900 mb-3">Tài chính</h1>
      <nav className="flex flex-wrap gap-1" aria-label="Finance tabs">
        {TABS.map((tab) => {
          const active = activeId === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => router.push(tab.href)}
              className={cn(
                "py-2.5 px-4 text-sm font-medium transition-colors border-b-2 -mb-px",
                active
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-gray-600 hover:text-gray-900",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
