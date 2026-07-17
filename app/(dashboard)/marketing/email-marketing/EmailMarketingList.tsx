"use client";

import { useState } from "react";
import { useEmailMarketing } from "./hooks/useEmailMarketing";
import { ListPageLayout } from "@/components/ui/ListPageLayout";
import { TemplateTable } from "./components/list/TemplateTable";
import { TemplateSearch } from "./components/list/TemplateSearch";
import { CampaignTable } from "./components/list/CampaignTable";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Tabs } from "@/components/ui/Tabs";

export function EmailMarketingList() {
  const [activeTab, setActiveTab] = useState("templates");
  
  const {
    templates,
    isLoading,
    searchQuery,
    setSearchQuery,
    handleDelete,

    campaigns,
    isLoadingCampaigns,
    campaignSearchQuery,
    setCampaignSearchQuery,
  } = useEmailMarketing();

  const tabs = [
    { id: "templates", label: "Mẫu email" },
    { id: "campaigns", label: "Chiến dịch đã gửi" },
  ];

  return (
    <div className="space-y-6">
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      
      {activeTab === "templates" ? (
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
      ) : (
        <ListPageLayout
          items={campaigns}
          isLoading={isLoadingCampaigns}
          resetPageKey={campaignSearchQuery}
          renderSearch={
            <div className="flex justify-between items-center mb-4">
              <TemplateSearch
                value={campaignSearchQuery}
                onChange={setCampaignSearchQuery}
                placeholder="Tìm kiếm chiến dịch..."
              />
            </div>
          }
          renderTable={(pagedItems) => (
            <CampaignTable items={pagedItems} />
          )}
        />
      )}
    </div>
  );
}
