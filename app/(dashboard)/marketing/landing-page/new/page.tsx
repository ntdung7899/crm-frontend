"use client";

import React, { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiGrid } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { LandingPageForm } from "@/modules/marketing/landing-page/components/forms/LandingPageForm";
import { LandingPageTemplatePicker } from "@/modules/marketing/landing-page/components/template-picker/LandingPageTemplatePicker";
import { landingPagesService } from "@/services/landingPages";
import { useToast } from "@/components/ui/ToastProvider";
import { LandingPage, LandingPageTemplate } from "@/types";

export default function NewLandingPagePage() {
  const router = useRouter();
  const toast = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<LandingPageTemplate | null>(null);

  const handleCancel = useCallback(() => {
    router.push("/marketing/landing-page");
  }, [router]);

  const handleSelectTemplate = useCallback((template: LandingPageTemplate) => {
    setSelectedTemplate(template);
    toast.success("Đã chọn mẫu", `Bạn đang sử dụng: ${template.name}`);
  }, [toast]);

  const handleChangeTemplateClick = () => {
    const ok = window.confirm(
      "Đổi mẫu sẽ làm thay đổi các nội dung và form hiện tại. Bạn có chắc muốn tiếp tục không?"
    );
    if (ok) {
      setSelectedTemplate(null);
    }
  };

  const handleSave = useCallback(async (payload: any) => {
    try {
      await landingPagesService.createLandingPage({
        ...payload,
        template_id: selectedTemplate?.id,
      });
      toast.success("Thành công", "Tạo mới landing page thành công");
      router.push("/marketing/landing-page");
    } catch (error: any) {
      toast.warning("Lỗi khi tạo", error.message || "Đã xảy ra lỗi");
    }
  }, [router, toast, selectedTemplate]);

  // Construct mock LandingPage containing template defaults
  const initialLpData: LandingPage | undefined = selectedTemplate
    ? {
        id: "",
        template_id: selectedTemplate.id,
        name: "",
        slug: "",
        title: selectedTemplate.default_title,
        description: selectedTemplate.default_description,
        banner_url: selectedTemplate.default_banner_url,
        primary_color: selectedTemplate.default_primary_color,
        cta_text: selectedTemplate.default_cta_text,
        content: selectedTemplate.default_content,
        status: "draft",
        submission_count: 0,
        customer_count: 0,
        created_at: "",
        updated_at: "",
        form_fields: selectedTemplate.default_form_fields,
        thank_you_message: selectedTemplate.default_thank_you_message,
      }
    : undefined;

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Tạo Landing Page mới</h1>
          <p className="text-sm text-text-secondary mt-1">
            {selectedTemplate
              ? `Đang sử dụng mẫu: ${selectedTemplate.name}`
              : "Chọn một mẫu landing page phù hợp với chiến dịch của bạn."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selectedTemplate && (
            <Button
              variant="outline"
              className="flex items-center gap-1.5"
              onClick={handleChangeTemplateClick}
            >
              <FiGrid className="w-4 h-4" /> Đổi mẫu khác
            </Button>
          )}
          <Button variant="secondary" className="flex items-center gap-1.5" onClick={handleCancel}>
            <FiArrowLeft className="w-4 h-4" /> Quay lại danh sách
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl">
        {selectedTemplate ? (
          <LandingPageForm
            landingPage={initialLpData}
            onSave={handleSave}
            onCancel={handleCancel}
            submitText="Tạo mới"
          />
        ) : (
          <LandingPageTemplatePicker
            onSelectTemplate={handleSelectTemplate}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
}
