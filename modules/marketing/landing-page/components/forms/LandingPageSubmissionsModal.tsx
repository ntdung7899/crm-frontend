import React from "react";
import { FiX, FiCheckSquare } from "react-icons/fi";
import { LandingPage, LandingPageSubmission } from "@/types";

interface LandingPageSubmissionsModalProps {
  isOpen: boolean;
  landingPage: LandingPage;
  submissions: LandingPageSubmission[];
  loading: boolean;
  onClose: () => void;
}

export function LandingPageSubmissionsModal({
  isOpen,
  landingPage,
  submissions,
  loading,
  onClose,
}: LandingPageSubmissionsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-text-primary">
              Danh sách đăng ký — {landingPage.name}
            </h2>
            <p className="text-xs text-text-secondary mt-0.5 font-mono">
              /lp/{landingPage.slug} · Tổng số: {submissions.length} lượt gửi
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary p-2 hover:bg-slate-200/50 rounded-lg transition-colors"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : submissions.length === 0 ? (
            <div className="flex flex-col h-64 items-center justify-center text-center p-8">
              <div className="text-text-muted mb-4 text-4xl">📥</div>
              <h3 className="text-base font-semibold text-text-primary">Chưa có lượt đăng ký nào</h3>
              <p className="text-xs text-text-secondary mt-1 max-w-xs">
                Khi khách hàng gửi thông tin từ landing page public, danh sách đăng ký sẽ được hiển thị tại đây.
              </p>
            </div>
          ) : (
            <div className="border border-border rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-text-secondary text-xs uppercase font-semibold border-b border-border">
                      <th className="py-3 px-4">Thời gian</th>
                      <th className="py-3 px-4">Khách hàng (Form)</th>
                      <th className="py-3 px-4">Thông tin nhập thêm</th>
                      <th className="py-3 px-4">UTM Campaign</th>
                      <th className="py-3 px-4">IP / User Agent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-divider text-xs text-text-primary">
                    {submissions.map((sub) => {
                      const data = sub.submitted_data || {};
                      
                      // Extract name and phone for highlighted display
                      const fullName = data.full_name || "N/A";
                      const phone = data.phone || "N/A";
                      const email = data.email;

                      // Other inputs
                      const otherEntries = Object.entries(data).filter(
                        ([key]) => key !== "full_name" && key !== "phone" && key !== "email"
                      );

                      return (
                        <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 px-4 font-mono text-text-secondary whitespace-nowrap">
                            {sub.created_at ? new Date(sub.created_at).toLocaleString("vi-VN") : "N/A"}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-text-primary">{fullName}</div>
                            <div className="text-text-secondary font-semibold mt-0.5">{phone}</div>
                            {email && <div className="text-text-muted mt-0.5 font-mono">{email}</div>}
                          </td>
                          <td className="py-3.5 px-4">
                            {otherEntries.length > 0 ? (
                              <div className="flex flex-col gap-1 max-w-xs">
                                {otherEntries.map(([key, value]) => {
                                  // Find the field label in the fields config for a readable printout
                                  const fieldDef = landingPage.form_fields.find(f => f.field_key === key);
                                  const label = fieldDef ? fieldDef.label : key;

                                  return (
                                    <div key={key} className="flex gap-1.5 flex-wrap">
                                      <span className="text-text-secondary font-semibold">{label}:</span>
                                      <span className="text-text-primary italic">
                                        {Array.isArray(value) ? value.join(", ") : String(value)}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <span className="text-text-muted italic">Không có thêm thông tin</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {sub.utm_source ? (
                              <div className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-1.5">
                                  <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold text-[10px] uppercase">
                                    {sub.utm_source}
                                  </span>
                                  {sub.utm_medium && (
                                    <span className="text-text-secondary text-[10px]">
                                      /{sub.utm_medium}
                                    </span>
                                  )}
                                </div>
                                {sub.utm_campaign && (
                                  <div className="text-[10px] text-text-muted mt-0.5 max-w-[150px] truncate" title={sub.utm_campaign}>
                                    Camp: {sub.utm_campaign}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-text-muted italic">—</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 max-w-[150px] truncate" title={sub.user_agent}>
                            <div className="font-mono text-text-secondary">{sub.ip_address || "127.0.0.1"}</div>
                            <div className="text-[10px] text-text-muted mt-0.5 max-w-[150px] truncate">
                              {sub.user_agent || "N/A"}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-border bg-slate-50">
          <button
            onClick={onClose}
            className="border border-border rounded-xl px-4 py-2 text-sm font-semibold hover:bg-slate-100 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
export default LandingPageSubmissionsModal;
