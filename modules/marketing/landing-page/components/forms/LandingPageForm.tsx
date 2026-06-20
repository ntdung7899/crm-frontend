import React, { useState, useEffect } from "react";
import { FiPlus, FiTrash2, FiArrowUp, FiArrowDown, FiEye, FiList, FiUploadCloud } from "react-icons/fi";
import { LandingPage, LandingPageField, LandingPageFieldType } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TextEditor } from "@/components/ui/TextEditor";
import { mockUsers } from "@/mock-data/users";
import { initialCampaigns } from "@/mock-data/marketing";
import { filesService } from "@/services/files";
import { resolveMediaUrl } from "@/app/(dashboard)/newsfeed/utils/postMappers";

interface LandingPageFormProps {
  landingPage?: LandingPage;
  onSave: (payload: any) => void;
  onCancel: () => void;
  submitText?: string;
}

const FIELD_TYPES: { value: LandingPageFieldType; label: string }[] = [
  { value: "text", label: "Chữ ngắn (Text)" },
  { value: "phone", label: "Số điện thoại (Phone)" },
  { value: "email", label: "Email" },
  { value: "textarea", label: "Chữ dài (Textarea)" },
  { value: "select", label: "Hộp chọn (Select)" },
  { value: "radio", label: "Chọn một (Radio)" },
  { value: "checkbox", label: "Chọn nhiều (Checkbox)" },
  { value: "date", label: "Chọn ngày (Date)" },
];

const formatDate = (dateStr?: string) => {
  const d = dateStr ? new Date(dateStr) : new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

export function LandingPageForm({
  landingPage,
  onSave,
  onCancel,
  submitText = "Lưu thay đổi",
}: LandingPageFormProps) {
  const [activeTab, setActiveTab] = useState<"general" | "form" | "settings">("general");
  
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBanner(true);
    try {
      const res = await filesService.uploadFile(file);
      if (res?.responseData?.original) {
        setBannerUrl(res.responseData.original);
      }
    } catch (err: any) {
      console.error("Lỗi upload banner:", err);
      alert("Không thể tải ảnh lên: " + (err.message || "Đã xảy ra lỗi"));
    } finally {
      setUploadingBanner(false);
      e.target.value = "";
    }
  };

  // Basic states
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#0C9CEC");
  const [ctaText, setCtaText] = useState("Gửi thông tin");
  const [content, setContent] = useState("");
  const [assignedUserId, setAssignedUserId] = useState("");
  const [campaignId, setCampaignId] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [thankYouMessage, setThankYouMessage] = useState("Cảm ơn bạn đã để lại thông tin. Chúng tôi sẽ liên hệ trong thời gian sớm nhất.");
  const [redirectUrl, setRedirectUrl] = useState("");

  // Form Fields states
  const [formFields, setFormFields] = useState<LandingPageField[]>([]);

  useEffect(() => {
    if (landingPage) {
      setName(landingPage.name);
      setSlug(landingPage.slug);
      setTitle(landingPage.title);
      setDescription(landingPage.description || "");
      setBannerUrl(landingPage.banner_url || "");
      setPrimaryColor(landingPage.primary_color || "#0C9CEC");
      setCtaText(landingPage.cta_text || "Gửi thông tin");
      setContent(landingPage.content || "");
      setAssignedUserId(landingPage.assigned_user_id || "");
      setCampaignId(landingPage.campaign_id || "");
      setStatus(landingPage.status === "active" ? "active" : "inactive");
      setThankYouMessage(landingPage.thank_you_message || "Cảm ơn bạn đã để lại thông tin. Chúng tôi sẽ liên hệ trong thời gian sớm nhất.");
      setRedirectUrl(landingPage.redirect_url || "");
      setFormFields(
        [...landingPage.form_fields].sort((a, b) => a.sort_order - b.sort_order)
      );
    } else {
      setName("");
      setSlug("");
      setTitle("");
      setDescription("");
      setBannerUrl("");
      setPrimaryColor("#0C9CEC");
      setCtaText("Gửi thông tin");
      setContent("");
      setAssignedUserId("");
      setCampaignId("");
      setStatus("active");
      setThankYouMessage("Cảm ơn bạn đã để lại thông tin. Chúng tôi sẽ liên hệ trong thời gian sớm nhất.");
      setRedirectUrl("");
      setFormFields([
        {
          field_key: "full_name",
          label: "Họ và tên",
          type: "text",
          required: true,
          placeholder: "Nhập họ và tên",
          options: [],
          sort_order: 1,
        },
        {
          field_key: "phone",
          label: "Số điện thoại",
          type: "phone",
          required: true,
          placeholder: "Nhập số điện thoại",
          options: [],
          sort_order: 2,
        },
      ]);
    }
  }, [landingPage]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!landingPage) {
      const autoSlug = val
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
      setSlug(autoSlug);
    }
  };

  const handleAddField = () => {
    const key = "field_" + Math.random().toString(36).substr(2, 5);
    const newField: LandingPageField = {
      field_key: key,
      label: "Trường thông tin mới",
      type: "text",
      required: false,
      placeholder: "",
      options: [],
      sort_order: formFields.length + 1,
    };
    setFormFields([...formFields, newField]);
  };

  const handleRemoveField = (index: number) => {
    const updated = formFields.filter((_, i) => i !== index);
    const reordered = updated.map((field, idx) => ({
      ...field,
      sort_order: idx + 1,
    }));
    setFormFields(reordered);
  };

  const handleUpdateField = (index: number, key: keyof LandingPageField, value: any) => {
    const updated = [...formFields];
    updated[index] = {
      ...updated[index],
      [key]: value,
    };
    setFormFields(updated);
  };

  const handleMoveField = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === formFields.length - 1) return;

    const targetIdx = direction === "up" ? index - 1 : index + 1;
    const updated = [...formFields];
    
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    const reordered = updated.map((field, idx) => ({
      ...field,
      sort_order: idx + 1,
    }));

    setFormFields(reordered);
  };

  const handleAddFieldOption = (fieldIdx: number) => {
    const field = formFields[fieldIdx];
    const newOption = { label: `Tùy chọn ${field.options.length + 1}`, value: `opt_${Date.now()}` };
    const updatedOptions = [...field.options, newOption];
    handleUpdateField(fieldIdx, "options", updatedOptions);
  };

  const handleRemoveFieldOption = (fieldIdx: number, optIdx: number) => {
    const field = formFields[fieldIdx];
    const updatedOptions = field.options.filter((_, i) => i !== optIdx);
    handleUpdateField(fieldIdx, "options", updatedOptions);
  };

  const handleUpdateFieldOption = (fieldIdx: number, optIdx: number, key: "label" | "value", value: string) => {
    const field = formFields[fieldIdx];
    const updatedOptions = [...field.options];
    updatedOptions[optIdx] = {
      ...updatedOptions[optIdx],
      [key]: value,
    };
    handleUpdateField(fieldIdx, "options", updatedOptions);
  };

  const handlePreview = () => {
    const mockLp: LandingPage = {
      id: landingPage?.id || "preview-temp",
      template_id: landingPage?.template_id,
      name: name || "Xem trước Landing Page",
      slug: slug || "preview",
      title: title || "Tiêu đề Landing Page",
      description,
      banner_url: bannerUrl,
      primary_color: primaryColor,
      cta_text: ctaText,
      content,
      assigned_user_id: assignedUserId,
      campaign_id: campaignId,
      status: status as any,
      submission_count: 0,
      customer_count: 0,
      created_at: "",
      updated_at: "",
      form_fields: formFields,
      thank_you_message: thankYouMessage,
      redirect_url: redirectUrl,
    };
    sessionStorage.setItem("crm:lp_preview_draft", JSON.stringify(mockLp));
    window.open("/lp/preview", "_blank");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (!slug.trim()) return;
    if (!title.trim()) return;

    const assignedUser = mockUsers.find(x => x.id === assignedUserId);
    const campaign = initialCampaigns.find(x => x.id === campaignId);

    const payload = {
      name,
      slug: slug.trim().toLowerCase(),
      title,
      description,
      banner_url: bannerUrl,
      primary_color: primaryColor,
      cta_text: ctaText,
      content,
      assigned_user_id: assignedUserId || null,
      assigned_user_name: assignedUser ? assignedUser.full_name : null,
      campaign_id: campaignId || null,
      campaign_name: campaign ? campaign.name : null,
      status,
      form_fields: formFields,
      thank_you_message: thankYouMessage,
      redirect_url: redirectUrl || null,
    };

    onSave(payload);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      {/* Left Column: Form Editor Card */}
      <div className="lg:col-span-2 bg-white rounded-2xl flex flex-col border border-border overflow-hidden shadow-sm">
      {/* Tab Headers */}
      <div className="flex border-b border-border bg-slate-50 px-6">
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className={`py-3.5 px-5 text-sm font-bold border-b-2 transition-all ${
            activeTab === "general"
              ? "border-primary text-primary"
              : "border-transparent text-text-secondary hover:text-text-primary"
          }`}
        >
          Thông tin chung
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("form")}
          className={`py-3.5 px-5 text-sm font-bold border-b-2 transition-all ${
            activeTab === "form"
              ? "border-primary text-primary"
              : "border-transparent text-text-secondary hover:text-text-primary"
          }`}
        >
          Thiết kế Form
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("settings")}
          className={`py-3.5 px-5 text-sm font-bold border-b-2 transition-all ${
            activeTab === "settings"
              ? "border-primary text-primary"
              : "border-transparent text-text-secondary hover:text-text-primary"
          }`}
        >
          Gán Lead & Cấu hình
        </button>
      </div>

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
        {activeTab === "general" && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-text-primary">
                  Tên Landing Page (Nội bộ) <span className="text-danger">*</span>
                </label>
                <Input
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ví dụ: Dịch vụ Sửa máy lạnh Q1"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-text-primary">
                  Đường dẫn (Slug) <span className="text-danger">*</span>
                </label>
                <div className="flex items-center">
                  <span className="bg-slate-100 text-text-secondary border border-r-0 border-border rounded-l-xl px-3 py-2 text-sm select-none">
                    /lp/
                  </span>
                  <Input
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.replace(/\s+/g, "-"))}
                    placeholder="sua-may-lanh-q1"
                    className="rounded-l-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-text-primary">
                Tiêu đề Landing Page (Công khai) <span className="text-danger">*</span>
              </label>
              <Input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Nhận tư vấn bảo trì & vệ sinh máy lạnh tại nhà"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-text-primary">Mô tả ngắn</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Nhập mô tả ngắn gọn hiển thị phía dưới tiêu đề chính..."
                rows={3}
                className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-white text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-sm font-semibold text-text-primary">Ảnh Banner</label>
                
                {bannerUrl ? (
                  <div className="relative w-full h-9 overflow-hidden rounded-xl border border-border bg-slate-50 flex items-center px-3 group">
                    <span className="text-xs text-text-secondary truncate max-w-[80%]">
                      {bannerUrl}
                    </span>
                    <button
                      type="button"
                      onClick={() => setBannerUrl("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-danger hover:bg-red-50 transition-all select-none"
                      title="Xóa ảnh"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-slate-50 hover:bg-slate-100/50 hover:border-primary transition-all text-text-secondary px-3"
                  >
                    {uploadingBanner ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-primary" />
                    ) : (
                      <FiUploadCloud className="h-4 w-4 text-primary" />
                    )}
                    <span className="text-xs font-semibold">Tải ảnh banner lên</span>
                  </div>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleBannerUpload}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-text-primary">Text nút bấm (CTA Text)</label>
                <Input
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  placeholder="Ví dụ: Đăng ký tư vấn, Nhận báo giá..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-text-primary">Màu chủ đạo (CTA Color)</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-9 w-9 rounded-lg border border-border cursor-pointer"
                  />
                  <Input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    placeholder="#0C9CEC"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-text-primary">Nội dung giới thiệu (HTML / Mô tả dịch vụ)</label>
              <TextEditor
                value={content}
                onChange={setContent}
                placeholder="Nhập nội dung chi tiết giới thiệu dịch vụ..."
              />
            </div>
          </div>
        )}

        {activeTab === "form" && (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-text-primary">Danh sách các trường của Form</h3>
              <Button
                type="button"
                onClick={handleAddField}
                variant="secondary"
                className="flex items-center gap-1.5 py-1 px-3"
              >
                <FiPlus className="h-4 w-4" /> Thêm Trường
              </Button>
            </div>

            <div className="flex flex-col gap-4">
              {formFields.map((field, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-50 border border-border rounded-xl flex flex-col gap-3 relative group/field"
                >
                  <div className="absolute right-3 top-3 flex items-center gap-1 opacity-60 group-hover/field:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleMoveField(idx, "up")}
                      disabled={idx === 0}
                      className="p-1 hover:bg-white border border-transparent hover:border-border rounded disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <FiArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveField(idx, "down")}
                      disabled={idx === formFields.length - 1}
                      className="p-1 hover:bg-white border border-transparent hover:border-border rounded disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <FiArrowDown className="h-3.5 w-3.5" />
                    </button>
                    {field.field_key !== "full_name" && field.field_key !== "phone" && (
                      <button
                        type="button"
                        onClick={() => handleRemoveField(idx)}
                        className="p-1 text-danger hover:bg-red-50 rounded"
                      >
                        <FiTrash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mr-20">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-text-secondary">Tên trường (Field Key)</label>
                      <input
                        required
                        value={field.field_key}
                        disabled={field.field_key === "full_name" || field.field_key === "phone"}
                        onChange={(e) => handleUpdateField(idx, "field_key", e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
                        className="border border-border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-primary disabled:bg-slate-200/50"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-text-secondary">Nhãn hiển thị (Label)</label>
                      <input
                        required
                        value={field.label}
                        onChange={(e) => handleUpdateField(idx, "label", e.target.value)}
                        className="border border-border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-text-secondary">Kiểu nhập (Type)</label>
                      <select
                        value={field.type}
                        disabled={field.field_key === "full_name" || field.field_key === "phone"}
                        onChange={(e) => handleUpdateField(idx, "type", e.target.value)}
                        className="border border-border rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none focus:border-primary"
                      >
                        {FIELD_TYPES.map(ft => (
                          <option key={ft.value} value={ft.value}>{ft.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-text-secondary">Placeholder</label>
                      <input
                        value={field.placeholder || ""}
                        onChange={(e) => handleUpdateField(idx, "placeholder", e.target.value)}
                        className="border border-border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <input
                        type="checkbox"
                        id={`req-${idx}`}
                        checked={field.required}
                        disabled={field.field_key === "full_name" || field.field_key === "phone"}
                        onChange={(e) => handleUpdateField(idx, "required", e.target.checked)}
                        className="h-4 w-4 text-primary focus:ring-primary/20 border-border rounded"
                      />
                      <label htmlFor={`req-${idx}`} className="text-xs font-semibold text-text-primary select-none cursor-pointer">
                        Bắt buộc nhập (Required)
                      </label>
                    </div>
                  </div>

                  {(field.type === "select" || field.type === "radio" || field.type === "checkbox") && (
                    <div className="mt-3 p-3 bg-white border border-border rounded-lg flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-text-secondary">Các tùy chọn (Options)</label>
                        <button
                          type="button"
                          onClick={() => handleAddFieldOption(idx)}
                          className="text-xs text-primary hover:underline flex items-center gap-1 font-semibold"
                        >
                          <FiPlus className="h-3 w-3" /> Thêm tùy chọn
                        </button>
                      </div>
                      <div className="flex flex-col gap-2">
                        {field.options.map((opt, optIdx) => (
                          <div key={optIdx} className="flex gap-2 items-center">
                            <input
                              required
                              value={opt.label}
                              placeholder="Label"
                              onChange={(e) => handleUpdateFieldOption(idx, optIdx, "label", e.target.value)}
                              className="border border-border rounded px-2 py-1 text-xs flex-1 focus:outline-none focus:border-primary"
                            />
                            <input
                              required
                              value={opt.value}
                              placeholder="Value"
                              onChange={(e) => handleUpdateFieldOption(idx, optIdx, "value", e.target.value.replace(/\s+/g, "_"))}
                              className="border border-border rounded px-2 py-1 text-xs flex-1 focus:outline-none focus:border-primary"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveFieldOption(idx, optIdx)}
                              className="p-1 hover:bg-slate-100 text-danger rounded"
                            >
                              <FiTrash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                        {field.options.length === 0 && (
                          <div className="text-xs text-text-muted italic text-center py-1">
                            Chưa có tùy chọn nào. Nhấp thêm tùy chọn để bắt đầu.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-text-primary">Nhân sự phụ trách Lead</label>
                <select
                  value={assignedUserId}
                  onChange={(e) => setAssignedUserId(e.target.value)}
                  className="border border-border rounded-xl px-3 py-2 text-sm bg-white text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">-- Chưa phân công --</option>
                  {mockUsers.map(u => (
                    <option key={u.id} value={u.id}>{u.full_name}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-text-primary">Liên kết chiến dịch</label>
                <select
                  value={campaignId}
                  onChange={(e) => setCampaignId(e.target.value)}
                  className="border border-border rounded-xl px-3 py-2 text-sm bg-white text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">-- Chọn chiến dịch --</option>
                  {initialCampaigns.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-text-primary">Trạng thái hoạt động</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="border border-border rounded-xl px-3 py-2 text-sm bg-white text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="active">Hoạt động (Cho phép truy cập và submit)</option>
                <option value="inactive">Tạm dừng (Chặn truy cập public)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-text-primary">Thông điệp cảm ơn (khi gửi thành công)</label>
              <textarea
                value={thankYouMessage}
                onChange={(e) => setThankYouMessage(e.target.value)}
                placeholder="Nhập thông điệp cảm ơn khách hàng..."
                rows={3}
                className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-white text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-text-primary">Đường dẫn chuyển hướng (Redirect URL)</label>
              <Input
                value={redirectUrl}
                onChange={(e) => setRedirectUrl(e.target.value)}
                placeholder="Ví dụ: https://example.com/thank-you (Để trống nếu không cần chuyển hướng)"
              />
              <p className="text-xs text-text-secondary">
                Nếu cấu hình, hệ thống sẽ tự động chuyển hướng khách hàng tới trang này sau khi đăng ký thành công.
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons inside Form */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-divider">
          <Button
            type="button"
            variant="outline"
            onClick={handlePreview}
            disabled={!title.trim()}
            title={!title.trim() ? "Vui lòng nhập tiêu đề public trước khi xem trước" : ""}
          >
            Xem trước
          </Button>
          <Button type="button" onClick={onCancel} variant="secondary">
            Hủy bỏ
          </Button>
          <Button type="submit" variant="primary">
            {submitText}
          </Button>
          </div>
        </form>
      </div>

      {/* Right Column: Live Preview & Summary Sidebar */}
      <div className="lg:col-span-1 space-y-6">
        {/* Quick Preview Card */}
        <div className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 font-bold text-text-primary text-base border-b border-divider pb-3">
            <FiEye className="text-primary w-5 h-5" />
            <span>Xem trước nhanh</span>
          </div>

          <div className="border border-border rounded-xl overflow-hidden bg-slate-50 flex flex-col shadow-inner">
            {/* Banner */}
            {bannerUrl ? (
              <img
                src={bannerUrl}
                alt="Banner"
                className="w-full h-36 object-cover border-b border-border"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=60";
                }}
              />
            ) : (
              <div className="w-full h-36 bg-slate-100 flex items-center justify-center text-text-muted text-sm border-b border-border select-none">
                Chưa có ảnh banner
              </div>
            )}

            {/* Preview Content */}
            <div className="p-5 flex flex-col gap-3 bg-white">
              <h4 className="font-bold text-text-primary text-base text-center line-clamp-2" title={title}>
                {title || "Tiêu đề Landing Page"}
              </h4>

              <p className="text-xs text-text-secondary text-center line-clamp-3 leading-relaxed" title={description}>
                {description || "Mô tả ngắn của Landing Page..."}
              </p>

              <button
                type="button"
                className="w-full py-2.5 px-4 rounded-xl text-white font-bold text-sm shadow-sm transition-all hover:brightness-95 active:scale-[0.98] mt-2 select-none"
                style={{ backgroundColor: primaryColor || "#0C9CEC" }}
              >
                {ctaText || "Gửi thông tin"}
              </button>
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 font-bold text-text-primary text-base border-b border-divider pb-3">
            <FiList className="text-primary w-5 h-5" />
            <span>Tóm tắt</span>
          </div>

          <div className="divide-y divide-border text-sm">
            <div className="flex justify-between items-center py-3">
              <span className="text-text-secondary">Trạng thái</span>
              {status === "active" ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
                  Hoạt động
                </span>
              ) : status === "inactive" ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-100">
                  Tạm dừng
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-100">
                  Bản nháp
                </span>
              )}
            </div>

            <div className="flex justify-between items-center py-3">
              <span className="text-text-secondary">Đường dẫn (Slug)</span>
              <span
                className="font-mono text-xs text-text-primary bg-slate-50 px-2.5 py-1 rounded-lg border border-border max-w-[180px] truncate"
                title={`/lp/${slug || ""}`}
              >
                /lp/{slug || "..."}
              </span>
            </div>

            <div className="flex justify-between items-center py-3">
              <span className="text-text-secondary">Cập nhật</span>
              <span className="text-text-primary font-semibold">
                {formatDate(landingPage?.updated_at)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
