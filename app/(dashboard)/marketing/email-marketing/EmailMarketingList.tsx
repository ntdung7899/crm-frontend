"use client";

import { useEmailMarketing } from "./hooks/useEmailMarketing";
import { ListPageLayout } from "@/components/ui/ListPageLayout";
import { TemplateTable } from "./components/list/TemplateTable";
import { TemplateSearch } from "./components/list/TemplateSearch";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import Link from "next/link";

export function EmailMarketingList() {
  const { templates, isLoading, searchQuery, setSearchQuery, handleDelete } = useEmailMarketing();

  return (
    <ListPageLayout
      items={templates}
      isLoading={isLoading}
      resetPageKey={searchQuery}
      renderSearch={
        <div className="flex justify-between items-center mb-4">
          <TemplateSearch value={searchQuery} onChange={setSearchQuery} />
          <Button asChild>
            <Link href="/marketing/email-marketing/new">
              <Plus className="w-4 h-4 mr-2" />
              Tạo mẫu email mới
            </Link>
          </Button>
        </div>
      }
      renderTable={(pagedItems) => (
        <TemplateTable items={pagedItems} onDelete={handleDelete} />
      )}
    />
  );
}
