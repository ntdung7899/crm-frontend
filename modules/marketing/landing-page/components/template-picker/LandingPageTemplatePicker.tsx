import React, { useState, useEffect } from "react";
import { FiSearch, FiEye, FiCheck } from "react-icons/fi";
import { LandingPageTemplate } from "@/types";
import { landingPageTemplatesService } from "@/services/landingPages";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LandingPage } from "@/types";

interface LandingPageTemplatePickerProps {
  onSelectTemplate: (template: LandingPageTemplate) => void;
  onCancel: () => void;
}

const CATEGORIES = [
  { value: "", label: "Tất cả mẫu" },
  { value: "service", label: "Tư vấn dịch vụ" },
  { value: "quote", label: "Nhận báo giá" },
  { value: "booking", label: "Đặt lịch hẹn" },
  { value: "product", label: "Giới thiệu sản phẩm" },
  { value: "event", label: "Đăng ký sự kiện" },
];

export function LandingPageTemplatePicker({
  onSelectTemplate,
  onCancel,
}: LandingPageTemplatePickerProps) {
  const [templates, setTemplates] = useState<LandingPageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    const loadTemplates = async () => {
      setLoading(true);
      try {
        const data = await landingPageTemplatesService.getTemplates({
          category: selectedCategory || undefined,
          keyword: keyword || undefined,
        });
        setTemplates(data.rows);
      } catch (error) {
        console.error("Error loading templates:", error);
      } finally {
        setLoading(false);
      }
    };
    loadTemplates();
  }, [selectedCategory, keyword]);

  // Convert LandingPageTemplate to a mock LandingPage so we can reuse LandingPagePreviewModal
  const getMockLandingPage = (tpl: LandingPageTemplate): LandingPage => {
    return {
      id: tpl.id,
      name: tpl.name,
      slug: "template-preview",
      title: tpl.default_title,
      description: tpl.default_description,
      banner_url: tpl.default_banner_url,
      primary_color: tpl.default_primary_color,
      content: tpl.default_content,
      form_fields: tpl.default_form_fields,
      status: "active",
      submission_count: 0,
      customer_count: 0,
      created_at: "",
      updated_at: "",
    };
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Category filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl border border-divider w-full md:w-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedCategory === cat.value
                  ? "bg-white text-primary shadow-sm"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary h-4 w-4" />
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm kiếm mẫu..."
            className="pl-9 w-full py-1.5 text-xs rounded-xl"
          />
        </div>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center bg-white rounded-2xl border border-border">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : templates.length === 0 ? (
        <div className="flex flex-col h-64 items-center justify-center bg-white rounded-2xl border border-border text-center p-8">
          <div className="text-text-muted mb-4 text-4xl">📭</div>
          <h3 className="text-lg font-semibold text-text-primary">Không tìm thấy mẫu nào</h3>
          <p className="text-text-secondary mt-1 text-sm">
            Vui lòng thử từ khóa khác hoặc chuyển danh mục.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md hover:border-primary/50 transition-all flex flex-col group"
            >
              {/* Preview image */}
              <div className="h-44 w-full relative bg-slate-100 overflow-hidden border-b border-border">
                <img
                  src={tpl.preview_image_url}
                  alt={tpl.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 select-none"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2.5">
                  <Button
                    type="button"
                    onClick={() => {
                      const mockLp = getMockLandingPage(tpl);
                      sessionStorage.setItem("crm:lp_preview_draft", JSON.stringify(mockLp));
                      window.open("/lp/preview", "_blank");
                    }}
                    variant="secondary"
                    className="flex items-center gap-1.5 bg-white text-slate-800 hover:bg-slate-50 border-none py-1.5 px-3 shadow-md"
                  >
                    <FiEye className="h-4 w-4" /> Xem trước
                  </Button>
                  <Button
                    type="button"
                    onClick={() => onSelectTemplate(tpl)}
                    variant="primary"
                    className="flex items-center gap-1.5 py-1.5 px-3 shadow-md"
                  >
                    <FiCheck className="h-4 w-4" /> Sử dụng mẫu
                  </Button>
                </div>
                {/* Category badge */}
                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-primary font-bold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm border border-slate-200">
                  {CATEGORIES.find(c => c.value === tpl.category)?.label || tpl.category}
                </span>
              </div>

              {/* Information */}
              <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                <div className="space-y-1.5">
                  <h3 className="font-bold text-text-primary text-sm group-hover:text-primary transition-colors">
                    {tpl.name}
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
                    {tpl.description}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-divider pt-3.5 mt-auto">
                  <span className="text-[11px] font-semibold text-text-muted">
                    Form mặc định: <strong className="text-text-primary">{tpl.default_form_fields.length} trường</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => onSelectTemplate(tpl)}
                    className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
                  >
                    Chọn mẫu &rarr;
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel button */}
      <div className="flex justify-end mt-4">
        <Button onClick={onCancel} variant="secondary">
          Hủy bỏ
        </Button>
      </div>

    </div>
  );
}
