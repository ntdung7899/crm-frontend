import React from "react";
import { FiFileText, FiTrendingUp, FiSend, FiUsers } from "react-icons/fi";
import { LandingPageFilters } from "./LandingPageFilters";
import { LandingPageTable } from "./LandingPageTable";
import { TablePagination } from "@/components/ui/TablePagination";
import { useLandingPagePage } from "../../hooks/useLandingPagePage";
import { LandingPageSubmissionsModal } from "../forms/LandingPageSubmissionsModal";

export function LandingPageListView() {
  const {
    landingPages,
    totalCount,
    loading,
    filters,
    handlePageChange,
    handlePageSizeChange,
    handleSearch,
    handleFilterStatus,

    // Form navigation
    handleOpenCreateModal,
    handleOpenEditModal,
    handleToggleStatus,
    handleDeleteLandingPage,

    // Submissions
    isSubmissionsOpen,
    submissionsLp,
    submissions,
    submissionsLoading,
    handleOpenSubmissions,
    handleCloseSubmissions,

    // Copy link
    handleCopyLink,
  } = useLandingPagePage();

  const activeCount = landingPages.filter((lp) => lp.status === "active").length;
  const totalSubmissions = landingPages.reduce((sum, lp) => sum + lp.submission_count, 0);
  const totalCustomers = landingPages.reduce((sum, lp) => sum + lp.customer_count, 0);

  const statsCards = [
    {
      label: "Tổng Landing Page",
      value: totalCount,
      icon: FiFileText,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      label: "Đang hoạt động",
      value: activeCount,
      icon: FiTrendingUp,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      label: "Tổng lượt gửi",
      value: totalSubmissions,
      icon: FiSend,
      iconBg: "bg-teal-100",
      iconColor: "text-teal-600",
    },
    {
      label: "Tổng khách hàng",
      value: totalCustomers,
      icon: FiUsers,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="p-6">
        <h1 className="text-2xl font-bold text-text-primary">Landing Page</h1>
        <p className="text-text-secondary mt-1 text-sm">
          Tạo và quản lý các landing page thu thập thông tin khách hàng từ các chiến dịch quảng cáo.
        </p>
      </div>

      {/* Stats Cards Row */}
      <div className="px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card) => (
          <div
            key={card.label}
            className="flex items-center gap-4 bg-white rounded-2xl border border-border p-4"
          >
            <div
              className={`flex items-center justify-center w-12 h-12 rounded-full ${card.iconBg}`}
            >
              <card.icon className={`w-5 h-5 ${card.iconColor}`} />
            </div>
            <div>
              <p className="text-sm text-text-secondary">{card.label}</p>
              <p className="text-2xl font-bold text-text-primary">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="px-6 mt-6">
        <LandingPageFilters
          keyword={filters.keyword || ""}
          status={filters.status || ""}
          onSearch={handleSearch}
          onFilterStatus={handleFilterStatus}
          onCreateOpen={handleOpenCreateModal}
        />
      </div>

      {/* Table */}
      <div className="px-6 mt-4">
        <LandingPageTable
          landingPages={landingPages}
          loading={loading}
          onEdit={handleOpenEditModal}
          onDelete={handleDeleteLandingPage}
          onOpenSubmissions={handleOpenSubmissions}
          onCopyLink={handleCopyLink}
        />

        {/* Pagination */}
        {totalCount > 0 && (
          <div className="mt-4 flex justify-end">
            <TablePagination
              currentPage={filters.currentPage}
              pageSize={filters.pageSize}
              totalCount={totalCount}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          </div>
        )}
      </div>

      {/* Submissions List Modal */}
      {isSubmissionsOpen && submissionsLp && (
        <LandingPageSubmissionsModal
          isOpen={isSubmissionsOpen}
          landingPage={submissionsLp}
          submissions={submissions}
          loading={submissionsLoading}
          onClose={handleCloseSubmissions}
        />
      )}
    </div>
  );
}
export default LandingPageListView;
