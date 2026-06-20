"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  FiHome,
  FiUsers,
  FiCheckSquare,
  FiSettings,
  FiUser,
  FiBell,
  FiFileText,
  FiLogOut,
  FiLink,
  FiDollarSign,
  FiChevronDown,
  FiPackage,
  FiShoppingCart,
} from "react-icons/fi";
import { clearAuthSession } from "@/lib/auth-session";
import { authService } from "@/services/auth";
import { useToast } from "@/components/ui/ToastProvider";

interface NavChild {
  name: string;
  href: string;
  icon?: React.ElementType;
}

interface NavItem {
  name: string;
  href?: string;
  icon: React.ElementType;
  children?: NavChild[];
}

interface NavSection {
  label?: string;
  items: NavItem[];
}

const sections: NavSection[] = [
  {
    items: [{ name: "Bảng điều khiển", href: "/", icon: FiHome }],
  },
  {
    label: "KHÁCH HÀNG",
    items: [
      { name: "Quản lý khách hàng", href: "/customers", icon: FiUsers },
      { name: "Quản lý nhóm", href: "/customers/groups", icon: FiUsers },
      { name: "Người dùng", href: "/users", icon: FiUser },
    ],
  },
  {
    label: "CÔNG VIỆC",
    items: [{ name: "Công việc", href: "/tasks", icon: FiCheckSquare }],
  },
  {
    label: "KINH DOANH",
    items: [
      { name: "Sản phẩm", href: "/products", icon: FiPackage },
      { name: "Đơn hàng", href: "/orders", icon: FiShoppingCart },
    ],
  },
  {
    label: "THÔNG BÁO",
    items: [{ name: "Thông báo", href: "/notifications", icon: FiBell }],
  },
  {
    label: "BẢNG TIN",
    items: [{ name: "Bảng tin", href: "/newsfeed", icon: FiFileText }],
  },
  {
    label: "ZALO OA",
    items: [
      {
        name: "Zalo OA",
        href: "/zalo-oa",
        icon: FiLink,
        children: [
          { name: "Marketing", href: "/zalo-oa/marketing" },
          { name: "Automation", href: "/zalo-oa/automation" },
          { name: "Lịch sử template", href: "/zalo-oa/template-history" },
        ],
      },
    ],
  },
  {
    label: "TÀI CHÍNH",
    items: [
      {
        name: "Tài chính",
        icon: FiDollarSign,
        children: [
          { name: "Trang chủ", href: "/tai-chinh" },
          { name: "Phiếu thu", href: "/tai-chinh/phieu-thu" },
          { name: "Phiếu chi", href: "/tai-chinh/phieu-chi" },
          { name: "Quỹ", href: "/tai-chinh/quy" },
          { name: "Ngân sách", href: "/tai-chinh/ngan-sach" },
          { name: "Yêu cầu chi phí", href: "/tai-chinh/yeu-cau-chi-phi" },
        ],
      },
    ],
  },
  {
    label: "CÀI ĐẶT",
    items: [{ name: "Cài đặt", href: "/settings", icon: FiSettings }],
  },
];

interface SidebarProps {
  isOpen: boolean;
}

function isPathMatch(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function getActiveChildHref(
  pathname: string,
  children: NavChild[],
): string | null {
  const sorted = [...children].sort((a, b) => b.href.length - a.href.length);
  return sorted.find((c) => isPathMatch(pathname, c.href))?.href ?? null;
}

function isGroupRouteActive(pathname: string, item: NavItem): boolean {
  const matchesSelf = item.href ? isPathMatch(pathname, item.href) : false;
  const matchesChild = item.children
    ? Boolean(getActiveChildHref(pathname, item.children))
    : false;
  return matchesSelf || matchesChild;
}

function getBestFlatMatch(
  pathname: string,
  allSections: NavSection[],
): string | null {
  const allHrefs: string[] = [];
  for (const section of allSections) {
    for (const item of section.items) {
      if (!item.children && item.href) allHrefs.push(item.href);
    }
  }
  allHrefs.sort((a, b) => b.length - a.length);
  return allHrefs.find((href) => isPathMatch(pathname, href)) ?? null;
}

export function Sidebar({ isOpen }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();
  const [isLoggingOut, startLogoutTransition] = useTransition();

  const allItems = sections.flatMap((s) => s.items);

  const [expandedItems, setExpandedItems] = useState<Set<string>>(() => {
    const expanded = new Set<string>();
    allItems.forEach((item) => {
      if (item.children && isGroupRouteActive(pathname, item)) {
        expanded.add(item.name);
      }
    });
    return expanded;
  });

  useEffect(() => {
    const next = new Set<string>();
    allItems.forEach((item) => {
      if (item.children && isGroupRouteActive(pathname, item)) {
        next.add(item.name);
      }
    });
    setExpandedItems(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const toggleExpanded = (name: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const handleLogout = () => {
    startLogoutTransition(async () => {
      try {
        await authService.logout();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Đăng xuất thất bại";
        toast.warning("Không thể xác nhận đăng xuất", message);
      } finally {
        clearAuthSession();
        router.replace("/auth/login");
      }
    });
  };

  const activeClass =
    "bg-gradient-to-r from-primary-500 to-primary-700 text-white shadow-lg shadow-primary-900/30";
  const inactiveClass =
    "text-primary-100 hover:bg-primary-800/60 hover:text-white";

  const bestFlatMatch = getBestFlatMatch(pathname, sections);

  const renderNavItem = (item: NavItem) => {
    const Icon = item.icon;

    if (item.children) {
      const isExpanded = expandedItems.has(item.name);
      const activeChildHref = getActiveChildHref(pathname, item.children);
      const isGroupActive = isGroupRouteActive(pathname, item);

      if (!isOpen) {
        return (
          <Link
            key={item.name}
            href={item.href || item.children[0].href}
            title={item.name}
            className={cn(
              "flex items-center rounded-xl mx-auto h-10 w-10 justify-center transition-colors",
              isGroupActive ? activeClass : inactiveClass,
            )}
          >
            <Icon className="h-5 w-5" />
          </Link>
        );
      }

      return (
        <div key={item.name}>
          <button
            type="button"
            onClick={() => {
              if (item.href) {
                router.push(item.href);
                setExpandedItems((prev) => new Set(prev).add(item.name));
              } else {
                toggleExpanded(item.name);
              }
            }}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
              item.href && isPathMatch(pathname, item.href) && !activeChildHref
                ? activeClass
                : inactiveClass,
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span className="flex-1 truncate text-left">{item.name}</span>
            <FiChevronDown
              className={cn(
                "h-4 w-4 shrink-0 transition-transform",
                isExpanded && "rotate-180",
              )}
            />
          </button>

          {isExpanded && (
            <div className="mt-1 ml-4 space-y-0.5 border-l border-primary-700/40 pl-4">
              {item.children.map((child) => {
                const isChildActive = activeChildHref === child.href;
                return (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={cn(
                      "flex items-center rounded-lg px-3 py-2 text-sm transition-colors",
                      isChildActive
                        ? activeClass + " font-medium"
                        : "text-primary-100/80 hover:bg-primary-800/60 hover:text-white",
                    )}
                  >
                    <span className="truncate">{child.name}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    const isActive = item.href === bestFlatMatch;

    return (
      <Link
        key={item.name}
        href={item.href!}
        title={!isOpen ? item.name : undefined}
        className={cn(
          "flex items-center text-sm font-medium rounded-lg transition-colors",
          isOpen
            ? "gap-3 px-4 py-2.5"
            : "mx-auto h-10 w-10 justify-center rounded-xl",
          isActive ? activeClass : inactiveClass,
        )}
      >
        <Icon className="h-5 w-5 shrink-0" />
        {isOpen ? (
          <span className="truncate">{item.name}</span>
        ) : (
          <span className="sr-only">{item.name}</span>
        )}
      </Link>
    );
  };

  return (
    <aside
      aria-label="Thanh điều hướng"
      className={cn(
        "flex h-full min-h-0 flex-col overflow-hidden bg-gradient-to-b from-primary-950 to-primary-900 transition-[width] duration-300",
        isOpen ? "w-64" : "w-16",
      )}
    >
      <div
        className={cn(
          "flex h-16 shrink-0 items-center border-b border-primary-800/40",
          isOpen ? "justify-between px-5" : "justify-center",
        )}
      >
        {isOpen ? (
          <Image
            src="/logo.png"
            alt="CRM Logo"
            width={120}
            height={36}
            className="object-contain"
            priority
          />
        ) : (
          <Image
            src="/logo.png"
            alt="CRM"
            width={28}
            height={28}
            className="object-contain"
            priority
          />
        )}
      </div>

      <nav
        className={cn(
          "sidebar-scroll min-h-0 flex-1 overflow-y-auto py-4",
          isOpen ? "px-3" : "px-1",
        )}
      >
        {sections.map((section, sectionIdx) => (
          <div
            key={section.label || sectionIdx}
            className={sectionIdx > 0 ? "mt-5" : ""}
          >
            {section.label && isOpen && (
              <p className="mb-2 px-4 text-[11px] font-bold uppercase tracking-widest text-primary-200/70">
                {section.label}
              </p>
            )}
            {!isOpen && sectionIdx > 0 && (
              <div className="mx-2 mb-2 border-t border-primary-800/40" />
            )}
            <div className="space-y-0.5">
              {section.items.map(renderNavItem)}
            </div>
          </div>
        ))}
      </nav>

      <div
        className={cn(
          "shrink-0 border-t border-primary-800/40 pb-4 pt-3",
          isOpen ? "px-3" : "px-1",
        )}
      >
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          title={!isOpen ? "Đăng xuất" : undefined}
          aria-label="Đăng xuất"
          className={cn(
            "flex w-full items-center rounded-lg text-sm font-medium transition-colors",
            isOpen
              ? "gap-3 px-4 py-2.5"
              : "mx-auto h-10 w-10 justify-center rounded-xl",
            "text-primary-100 hover:bg-red-500/20 hover:text-red-300 disabled:opacity-60",
          )}
        >
          <FiLogOut className="h-5 w-5 shrink-0" />
          {isOpen ? (
            <span className="truncate">
              {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
            </span>
          ) : (
            <span className="sr-only">Đăng xuất</span>
          )}
        </button>
      </div>
    </aside>
  );
}
