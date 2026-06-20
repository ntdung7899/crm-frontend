import React from "react";
import { FiEdit2, FiTrash2, FiEye, FiCopy, FiCheck, FiBarChart2, FiGlobe } from "react-icons/fi";
import { LandingPage } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { useDeleteConfirmation } from "@/components/ui/useDeleteConfirmation";

interface LandingPageTableProps {
  landingPages: LandingPage[];
  loading: boolean;
  onEdit: (lp: LandingPage) => void;
  onDelete: (id: string) => void;
  onOpenSubmissions: (lp: LandingPage) => void;
  onCopyLink: (slug: string) => void;
}

export function LandingPageTable({
  landingPages,
  loading,
  onEdit,
  onDelete,
  onOpenSubmissions,
  onCopyLink,
}: LandingPageTableProps) {
  const { requestDeleteConfirmation, DeleteConfirmationDialog } = useDeleteConfirmation();
  const [copiedSlug, setCopiedSlug] = React.useState<string | null>(null);

  const handleCopy = (slug: string) => {
    onCopyLink(slug);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const handlePreview = (lp: LandingPage) => {
    sessionStorage.setItem("crm:lp_preview_draft", JSON.stringify(lp));
    window.open("/lp/preview", "_blank");
  };

  const handleDeleteConfirm = (id: string, name: string) => {
    requestDeleteConfirmation({
      title: "Xác nhận xóa Landing Page",
      description: `Bạn có chắc chắn muốn xóa "${name}" không? Hành động này không thể hoàn tác.`,
      onConfirm: () => onDelete(id),
    });
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center bg-white rounded-xl">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (landingPages.length === 0) {
    return (
      <div className="flex flex-col h-64 items-center justify-center bg-white rounded-xl border border-border text-center p-8">
        <div className="text-text-muted mb-4 text-4xl">📭</div>
        <h3 className="text-lg font-semibold text-text-primary">Không tìm thấy Landing Page nào</h3>
        <p className="text-text-secondary mt-1 max-w-sm text-sm">
          Hãy tạo Landing Page đầu tiên để bắt đầu thu thập thông tin khách hàng tiềm năng.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-background text-text-secondary text-xs uppercase font-semibold border-b border-border">
              <th className="py-4 px-6">Tên Landing Page</th>
              <th className="py-4 px-6">Đường dẫn (Slug)</th>
              <th className="py-4 px-6">Trạng thái</th>
              <th className="py-4 px-6 text-center">Lượt gửi</th>
              <th className="py-4 px-6 text-center">Khách hàng</th>
              <th className="py-4 px-6">Ngày tạo</th>
              <th className="py-4 px-6 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-divider text-sm text-text-primary">
            {landingPages.map((lp) => (
              <tr key={lp.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <FiGlobe className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-text-primary truncate">{lp.name}</div>
                      {lp.title && (
                        <div className="text-xs text-text-secondary mt-0.5 line-clamp-1">{lp.title}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">
                      lp/{lp.slug}
                    </span>
                    <button
                      onClick={() => handleCopy(lp.slug)}
                      title="Sao chép đường dẫn"
                      className="text-text-muted hover:text-primary transition-colors p-1 rounded-md hover:bg-slate-100"
                    >
                      {copiedSlug === lp.slug ? (
                        <FiCheck className="h-3.5 w-3.5 text-success" />
                      ) : (
                        <FiCopy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <Badge variant={lp.status === "active" ? "success" : "default"}>
                    {lp.status === "active" ? "Hoạt động" : "Tạm dừng"}
                  </Badge>
                </td>
                <td className="py-4 px-6 text-center font-semibold text-text-primary">
                  {lp.submission_count}
                </td>
                <td className="py-4 px-6 text-center font-semibold text-text-primary">
                  {lp.customer_count}
                </td>
                <td className="py-4 px-6 text-text-secondary">
                  {lp.created_at
                    ? new Date(lp.created_at).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "numeric",
                        year: "numeric",
                      })
                    : "N/A"}
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => handlePreview(lp)}
                      title="Xem trước giao diện"
                      className="p-2 text-text-secondary hover:text-primary hover:bg-primary-light/30 rounded-lg transition-all"
                    >
                      <FiEye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEdit(lp)}
                      title="Chỉnh sửa"
                      className="p-2 text-text-secondary hover:text-primary hover:bg-primary-light/30 rounded-lg transition-all"
                    >
                      <FiEdit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleCopy(lp.slug)}
                      title="Sao chép đường dẫn"
                      className="p-2 text-text-secondary hover:text-primary hover:bg-primary-light/30 rounded-lg transition-all"
                    >
                      <FiCopy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onOpenSubmissions(lp)}
                      title="Xem danh sách đăng ký"
                      className="p-2 text-text-secondary hover:text-primary hover:bg-primary-light/30 rounded-lg transition-all"
                    >
                      <FiBarChart2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteConfirm(lp.id, lp.name)}
                      title="Xóa"
                      className="p-2 text-text-secondary hover:text-danger hover:bg-red-50 rounded-lg transition-all"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <DeleteConfirmationDialog />
    </div>
  );
}
