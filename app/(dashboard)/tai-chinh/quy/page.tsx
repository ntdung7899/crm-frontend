"use client";

import { useQuyPage } from "./_hooks/useQuyPage";
import { QuyTabBar } from "./components/QuyTabBar";
import { QuanLyQuyTab } from "./components/QuanLyQuyTab";
import { PhieuThuTab } from "./components/PhieuThuTab";
import { PhieuChiTab } from "./components/PhieuChiTab";
import { HachToanQuyTab } from "./components/HachToanQuyTab";
import { QuyFormModal } from "./components/QuyFormModal";
import { PhieuThuFormModal } from "../phieu-thu/components/PhieuThuFormModal";
import { PhieuThuDetailModal } from "../phieu-thu/components/PhieuThuDetailModal";
import { PhieuChiFormModal } from "../phieu-chi/components/PhieuChiFormModal";
import { PhieuChiDetailModal } from "../phieu-chi/components/PhieuChiDetailModal";

export default function QuyPage() {
  const {
    users, quyList, counterparties, yccpList, soCai,
    isSavingQuy, isSavingThu, isSavingChi,
    submitQuy, submitThu, submitChi,
    activeTab, setActiveTab,
    search, setSearch,
    trangThaiFilter, setTrangThaiFilter,
    showForm, setShowForm,
    editing,
    filteredQuy,
    totalBalance,
    phieuThu, phieuChi,
    onCreateQuy, onEditQuy, onDeleteQuy,
    showThuForm, setShowThuForm,
    detailThu, setDetailThu,
    onCreateThu, onViewThu,
    showChiForm, setShowChiForm,
    detailChi, setDetailChi,
    onCreateChi, onViewChi,
  } = useQuyPage();

  return (
    <div className="p-6">
      <QuyTabBar activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "quan-ly" && (
        <QuanLyQuyTab
          filteredQuy={filteredQuy}
          nguoiDung={users}
          search={search}
          trangThaiFilter={trangThaiFilter}
          totalBalance={totalBalance}
          onSearchChange={setSearch}
          onTrangThaiChange={setTrangThaiFilter}
          onCreate={onCreateQuy}
          onEdit={onEditQuy}
          onDelete={onDeleteQuy}
        />
      )}

      {activeTab === "phieu-thu" && (
        <PhieuThuTab phieuThu={phieuThu} quyList={quyList} onCreate={onCreateThu} onEdit={onViewThu} onView={onViewThu} />
      )}

      {activeTab === "phieu-chi" && (
        <PhieuChiTab phieuChi={phieuChi} quyList={quyList} onCreate={onCreateChi} onEdit={onViewChi} onView={onViewChi} />
      )}

      {activeTab === "hach-toan" && <HachToanQuyTab soCai={soCai} />}

      {/* Modals */}
      <QuyFormModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        editing={editing}
        users={users}
        quyList={filteredQuy}
        isSaving={isSavingQuy}
        onSubmit={submitQuy}
      />
      <PhieuThuFormModal
        isOpen={showThuForm}
        onClose={() => setShowThuForm(false)}
        quyList={quyList}
        counterparties={counterparties}
        isSaving={isSavingThu}
        onSubmit={submitThu}
      />
      <PhieuThuDetailModal phieu={detailThu} onClose={() => setDetailThu(null)} />
      <PhieuChiFormModal
        isOpen={showChiForm}
        onClose={() => setShowChiForm(false)}
        quyList={quyList}
        counterparties={counterparties}
        yccpList={yccpList}
        isSaving={isSavingChi}
        onSubmit={submitChi}
      />
      <PhieuChiDetailModal phieu={detailChi} onClose={() => setDetailChi(null)} />
    </div>
  );
}
