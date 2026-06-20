import React from "react";
import { FiSearch, FiPlus } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface LandingPageFiltersProps {
  keyword: string;
  status: string;
  onSearch: (value: string) => void;
  onFilterStatus: (value: string) => void;
  onCreateOpen: () => void;
}

export function LandingPageFilters({
  keyword,
  status,
  onSearch,
  onFilterStatus,
  onCreateOpen,
}: LandingPageFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 bg-white border-b border-border">
      <div className="flex flex-1 w-full md:w-auto items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary h-4 w-4" />
          <Input
            value={keyword}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Tìm theo tên hoặc slug..."
            className="pl-9 w-full"
          />
        </div>
        <select
          value={status}
          onChange={(e) => onFilterStatus(e.target.value)}
          className="border border-border rounded-xl px-3 py-2 text-sm bg-white text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="active">Hoạt động</option>
          <option value="inactive">Tạm dừng</option>
        </select>
      </div>
      <Button
        onClick={onCreateOpen}
        variant="primary"
        className="w-full md:w-auto flex items-center justify-center gap-2"
      >
        <FiPlus className="h-4 w-4" />
        Tạo Landing Page
      </Button>
    </div>
  );
}
