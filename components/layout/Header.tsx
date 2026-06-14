"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FiMenu, FiSettings, FiLogOut, FiChevronDown } from "react-icons/fi";
import { Avatar } from "@/components/ui/Avatar";
import { NotificationDropdown } from "@/components/layout/NotificationDropdown";
import {
  clearAuthSession,
  getCurrentUserSession,
  hasAuthSession,
  setCurrentUserSession,
} from "@/lib/auth-session";
import { MyInfoResponseData } from "@/types/api";
import { authService } from "@/services/auth";
import { usersService } from "@/services/users";

const moduleTitleMap: Record<string, string> = {
  "/": "Bảng điều khiển",
  "/customers": "Quản lý khách hàng",
  "/customers/groups": "Quản lý nhóm khách hàng",
  "/contacts": "Liên hệ",
  "/companies": "Công ty",
  "/deals": "Thương vụ",
  "/tasks": "Công việc",
  "/users": "Người dùng",
  "/notifications": "Thông báo",
  "/permissions": "Phân quyền",
  "/zalo-oa": "Zalo OA",
  "/settings": "Cài đặt",
};

interface HeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function Header({ isSidebarOpen, onToggleSidebar }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<MyInfoResponseData | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch { }
    clearAuthSession();
    router.replace("/auth/login");
  };

  useEffect(() => {
    let isMounted = true;

    const loadCurrentUser = async () => {
      const cachedUser = getCurrentUserSession();

      if (cachedUser) {
        setCurrentUser(cachedUser);
        return;
      }

      if (!hasAuthSession()) {
        return;
      }

      try {
        const response = await usersService.getMyInfo();

        if (!isMounted || !response.responseData) {
          return;
        }

        setCurrentUserSession(response.responseData);
        setCurrentUser(response.responseData);
      } catch (error) {
        console.error("Load current user in header failed:", error);
      }
    };

    loadCurrentUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const activeModule = useMemo(() => {
    if (!pathname || pathname === "/") {
      return moduleTitleMap["/"];
    }

    // Match longest prefix first (e.g. /customers/groups before /customers)
    const sortedKeys = Object.keys(moduleTitleMap).sort((a, b) => b.length - a.length);
    for (const key of sortedKeys) {
      if (key !== "/" && (pathname === key || pathname.startsWith(key + "/"))) {
        return moduleTitleMap[key];
      }
    }

    return "Bảng điều khiển";
  }, [pathname]);

  return (
    <header className="bg-white border-b border-gray-200 h-16">
      <div className="flex h-full items-center gap-4 px-4 md:gap-6 md:px-6">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label={isSidebarOpen ? "Thu gọn thanh bên" : "Mở rộng thanh bên"}
            className="rounded-lg p-2 text-gray-500 hover:bg-primary-50 hover:text-primary-600 transition-colors"
          >
            <FiMenu className="h-5 w-5" />
          </button>
          <p className="text-lg font-semibold text-gray-900 whitespace-nowrap">{activeModule}</p>
        </div>

        <div className="flex-1" />

        <div className="flex items-center space-x-4">
          <NotificationDropdown />

          <div ref={userMenuRef} className="relative flex items-center space-x-3 pl-4 border-l border-gray-200">
            <button
              type="button"
              onClick={() => setIsUserMenuOpen((prev) => !prev)}
              className="flex items-center space-x-3 rounded-lg px-2 py-1 hover:bg-gray-50 transition-colors"
            >
              <Avatar
                src={currentUser?.avatar ?? undefined}
                name={currentUser?.full_name || "Người dùng hệ thống"}
                size="sm"
              />
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900 leading-tight">
                  {currentUser?.full_name || "Người dùng hệ thống"}
                </p>
                <p className="text-xs text-gray-500">
                  {currentUser?.email || "Quản lý kinh doanh"}
                </p>
              </div>
              <FiChevronDown
                className={`h-4 w-4 text-gray-400 transition-transform ${isUserMenuOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg z-50">
                <button
                  type="button"
                  onClick={() => { setIsUserMenuOpen(false); router.push("/settings"); }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <FiSettings className="h-4 w-4 text-gray-400" />
                  Cài đặt
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <FiLogOut className="h-4 w-4" />
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
