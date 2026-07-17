"use client";

import { Input } from "@/components/ui/Input";
import { Search } from "lucide-react";

interface TemplateSearchProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export function TemplateSearch({ value, onChange, placeholder = "Tìm kiếm mẫu email..." }: TemplateSearchProps) {
  return (
    <div className="relative max-w-sm">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <Input
        type="text"
        placeholder={placeholder}
        className="pl-10"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

