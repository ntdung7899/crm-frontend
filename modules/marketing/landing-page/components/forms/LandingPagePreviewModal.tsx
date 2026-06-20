import React, { useState } from "react";
import { FiX, FiMonitor, FiSmartphone } from "react-icons/fi";
import { LandingPage } from "@/types";
import { resolveMediaUrl } from "@/app/(dashboard)/newsfeed/utils/postMappers";

// Helper to convert HEX to RGB values for custom opacity styling
function hexToRgb(hex: string): string {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : "12, 156, 236";
}

interface LandingPagePreviewModalProps {
  isOpen: boolean;
  landingPage: LandingPage;
  onClose: () => void;
}

export function LandingPagePreviewModal({
  isOpen,
  landingPage,
  onClose,
}: LandingPagePreviewModalProps) {
  const [deviceMode, setDeviceMode] = useState<"desktop" | "mobile">("desktop");
  const [formInputs, setFormInputs] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (fieldKey: string, val: any) => {
    setFormInputs((prev) => ({ ...prev, [fieldKey]: val }));
  };

  const handleCheckboxChange = (fieldKey: string, optionValue: string, checked: boolean) => {
    const currentList = (formInputs[fieldKey] as string[]) || [];
    let nextList = [...currentList];
    if (checked) {
      nextList.push(optionValue);
    } else {
      nextList = nextList.filter((x) => x !== optionValue);
    }
    handleInputChange(fieldKey, nextList);
  };

  const handleMockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleResetForm = () => {
    setFormInputs({});
    setSubmitted(false);
  };

  if (!isOpen) return null;

  const primaryColor = landingPage.primary_color || "#0C9CEC";
  const primaryRgb = hexToRgb(primaryColor);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-100 rounded-3xl w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl border border-slate-200/50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header toolbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/40 bg-white">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-black text-slate-800">
              Xem trước: <span className="text-slate-500 font-medium">{landingPage.name}</span>
            </h2>
            <div className="flex bg-slate-100 rounded-xl p-0.5 border border-slate-200/60">
              <button
                type="button"
                onClick={() => setDeviceMode("desktop")}
                className={`p-2 rounded-lg flex items-center gap-1.5 text-[11px] font-bold transition-all ${
                  deviceMode === "desktop"
                    ? "bg-white text-primary shadow-sm"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                <FiMonitor className="h-3.5 w-3.5" /> Desktop
              </button>
              <button
                type="button"
                onClick={() => setDeviceMode("mobile")}
                className={`p-2 rounded-lg flex items-center gap-1.5 text-[11px] font-bold transition-all ${
                  deviceMode === "mobile"
                    ? "bg-white text-primary shadow-sm"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                <FiSmartphone className="h-3.5 w-3.5" /> Mobile
              </button>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Workspace body */}
        <div className="flex-1 overflow-hidden p-6 flex justify-center items-center bg-slate-50">
          
          <div
            style={{
              "--primary-color": primaryColor,
              "--primary-rgb": primaryRgb,
            } as React.CSSProperties}
            className={`bg-slate-50/60 shadow-2xl transition-all overflow-y-auto flex flex-col relative ${
              deviceMode === "mobile"
                ? "w-[375px] h-[600px] ring-8 ring-slate-800 rounded-[32px] border-4 border-slate-700"
                : "w-full h-full rounded-2xl border border-slate-200"
            }`}
          >
            {/* Glowing Backdrop Blobs inside frame */}
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-[rgba(var(--primary-rgb),0.05)] rounded-full blur-[80px] pointer-events-none -z-10 animate-pulse" />
            <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-[rgba(var(--primary-rgb),0.03)] rounded-full blur-[90px] pointer-events-none -z-10" />

            {/* Simulated Page Header */}
            <div className="w-full backdrop-blur-md bg-white/80 border-b border-slate-200/40 px-5 py-3.5 flex items-center justify-between shrink-0 relative z-20">
              <div className="flex items-center gap-2">
                <div 
                  className="w-7 h-7 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-md shadow-[rgba(var(--primary-rgb),0.25)]"
                  style={{ background: `linear-gradient(135deg, var(--primary-color) 0%, rgba(var(--primary-rgb), 0.75) 100%)` }}
                >
                  TX
                </div>
                <span className="font-extrabold text-slate-800 tracking-tight text-[11px] hidden sm:inline-block">
                  TechX <span className="text-slate-400 font-medium">Marketing</span>
                </span>
              </div>
              <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full text-[9px] font-bold border border-emerald-500/10">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Đang hoạt động
              </div>
            </div>

            {/* Banner image if configured */}
            {landingPage.banner_url ? (
              <div className={`w-full relative overflow-hidden bg-slate-900 shrink-0 ${
                deviceMode === "mobile" ? "h-[140px]" : "h-[220px]"
              }`}>
                <img
                  src={resolveMediaUrl(landingPage.banner_url)}
                  alt="Banner"
                  className="w-full h-full object-cover opacity-85 select-none pointer-events-none"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 px-5 pb-5 text-white z-10">
                  <span className="inline-block bg-[rgba(var(--primary-rgb),0.2)] backdrop-blur-md text-[var(--primary-color)] border border-[rgba(var(--primary-rgb),0.3)] text-[8px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full mb-1.5">
                    Mẫu xem trước
                  </span>
                  <h1 className={`font-black tracking-tight leading-tight ${
                    deviceMode === "mobile" ? "text-base" : "text-2xl md:text-3xl"
                  }`}>
                    {landingPage.title || "Tiêu đề Landing Page"}
                  </h1>
                </div>
              </div>
            ) : (
              <div className="h-24 bg-white/80 border-b border-slate-200/50 flex items-center justify-center text-slate-400 text-xs italic font-semibold select-none shrink-0">
                Chưa cấu hình hình ảnh banner
              </div>
            )}

            {/* Grid Content wrapper inside preview */}
            <div className={`px-5 relative z-20 flex-1 flex gap-6 pb-12 ${
              landingPage.banner_url ? "-mt-4" : "mt-6"
            } ${
              deviceMode === "mobile" ? "flex-col" : "flex-col md:flex-row items-start"
            }`}>
              
              {/* Left Column (Content) */}
              <div className="flex-1 flex flex-col gap-4 w-full">
                {/* Title fallback if banner is missing */}
                {!landingPage.banner_url && (
                  <h1 className="text-xl font-black text-slate-800">
                    {landingPage.title || "Tiêu đề Landing Page"}
                  </h1>
                )}
                
                {landingPage.description && (
                  <div className="relative p-4 rounded-2xl bg-white/85 backdrop-blur-md border border-slate-200/50 shadow-sm">
                    <div 
                      className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full"
                      style={{ backgroundColor: "var(--primary-color)" }}
                    />
                    <p className="text-slate-700 text-xs leading-relaxed pl-3 font-semibold italic">
                      {landingPage.description}
                    </p>
                  </div>
                )}

                {/* HTML content rendering */}
                {landingPage.content ? (
                  <div className="bg-white/85 backdrop-blur-md p-5 rounded-2xl border border-slate-200/50 shadow-sm">
                    <div
                      className={`prose prose-slate max-w-none text-slate-600 leading-relaxed
                                 prose-headings:font-black prose-headings:text-slate-800 prose-headings:tracking-tight prose-headings:mt-4 prose-headings:mb-2
                                 prose-h3:text-sm prose-h3:border-l-4 prose-h3:border-[var(--primary-color)] prose-h3:pl-2
                                 prose-p:mb-2 prose-p:leading-relaxed
                                 prose-ul:list-disc prose-ul:pl-5 prose-ul:space-y-1.5 prose-ul:my-3
                                 prose-li:marker:text-[var(--primary-color)] ${
                                   deviceMode === "mobile" ? "text-[11px]" : "text-xs"
                                 }`}
                      dangerouslySetInnerHTML={{ __html: landingPage.content }}
                    />
                  </div>
                ) : (
                  <div className="bg-white/80 p-5 rounded-2xl border border-slate-200/50 text-center">
                    <p className="text-slate-400 italic text-xs">
                      Chưa cấu hình nội dung giới thiệu chi tiết.
                    </p>
                  </div>
                )}
              </div>

              {/* Right Column (Form Box) */}
              <div className={`shrink-0 w-full ${
                deviceMode === "mobile" ? "" : "md:w-[310px]"
              }`}>
                <div className="bg-white/95 backdrop-blur-md border border-white/60 rounded-2xl p-5 shadow-xl">
                  
                  {submitted ? (
                    <div className="flex flex-col items-center text-center py-6">
                      <div className="relative mb-4">
                        <div 
                          className="w-14 h-14 rounded-full flex items-center justify-center animate-in zoom-in duration-300"
                          style={{ background: `rgba(var(--primary-rgb), 0.12)` }}
                        >
                          <svg 
                            className="w-7 h-7"
                            style={{ color: "var(--primary-color)" }}
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="3.5" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full animate-ping" style={{ background: "var(--primary-color)" }} />
                      </div>
                      <h3 className="text-sm font-black text-slate-800">
                        Đăng ký thành công!
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-2 leading-relaxed px-1">
                        {landingPage.thank_you_message || "Cảm ơn bạn đã quan tâm. Thông tin của bạn đã được chuyển tới bộ phận tư vấn."}
                      </p>
                      <button
                        type="button"
                        onClick={handleResetForm}
                        style={{ background: `linear-gradient(135deg, var(--primary-color) 0%, rgba(var(--primary-rgb), 0.85) 100%)` }}
                        className="mt-5 text-white text-[10px] font-black px-4 py-2 rounded-xl hover:opacity-90 transition-opacity uppercase tracking-wider"
                      >
                        Gửi thử lại
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleMockSubmit} className="flex flex-col gap-4">
                      <div className="border-b border-slate-100 pb-2">
                        <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                          <span className="w-1 h-2.5 rounded-full" style={{ backgroundColor: "var(--primary-color)" }} />
                          Đăng ký nhận tư vấn
                        </h3>
                      </div>

                      <div className="flex flex-col gap-3.5 max-h-[260px] overflow-y-auto pr-1 scrollbar-thin">
                        {landingPage.form_fields.map((field) => (
                          <div key={field.field_key} className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-700 select-none">
                              {field.label}{" "}
                              {field.required && (
                                <span className="text-rose-500 font-extrabold">*</span>
                              )}
                            </label>

                            {field.type === "textarea" ? (
                              <textarea
                                required={field.required}
                                placeholder={field.placeholder}
                                value={formInputs[field.field_key] || ""}
                                onChange={(e) => handleInputChange(field.field_key, e.target.value)}
                                rows={3}
                                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-[11px] focus:outline-none focus:ring-4 focus:ring-[rgba(var(--primary-rgb),0.1)] focus:border-[rgba(var(--primary-rgb),0.7)] bg-white text-slate-800 placeholder:text-slate-400 transition-all"
                              />
                            ) : field.type === "select" ? (
                              <select
                                required={field.required}
                                value={formInputs[field.field_key] || ""}
                                onChange={(e) => handleInputChange(field.field_key, e.target.value)}
                                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-[11px] focus:outline-none focus:ring-4 focus:ring-[rgba(var(--primary-rgb),0.1)] focus:border-[rgba(var(--primary-rgb),0.7)] bg-white text-slate-800 transition-all"
                              >
                                <option value="">{field.placeholder || "-- Chọn --"}</option>
                                {field.options?.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            ) : field.type === "radio" ? (
                              <div className="flex flex-col gap-2 mt-0.5 pl-0.5">
                                {field.options?.map((opt) => (
                                  <label
                                    key={opt.value}
                                    className="flex items-center gap-2 text-[10px] font-medium text-slate-600 select-none cursor-pointer hover:text-slate-800 transition-colors"
                                  >
                                    <input
                                      type="radio"
                                      name={field.field_key}
                                      required={field.required}
                                      checked={formInputs[field.field_key] === opt.value}
                                      onChange={() => handleInputChange(field.field_key, opt.value)}
                                      className="h-4 w-4 border-slate-300 accent-[var(--primary-color)] cursor-pointer"
                                    />
                                    <span>{opt.label}</span>
                                  </label>
                                ))}
                              </div>
                            ) : field.type === "checkbox" ? (
                              <div className="flex flex-col gap-2 mt-0.5 pl-0.5">
                                {field.options?.map((opt) => {
                                  const checked = (
                                    (formInputs[field.field_key] as string[]) || []
                                  ).includes(opt.value);
                                  return (
                                    <label
                                      key={opt.value}
                                      className="flex items-center gap-2 text-[10px] font-medium text-slate-600 select-none cursor-pointer hover:text-slate-800 transition-colors"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={(e) =>
                                          handleCheckboxChange(
                                            field.field_key,
                                            opt.value,
                                            e.target.checked
                                          )
                                        }
                                        className="h-4 w-4 rounded border-slate-300 accent-[var(--primary-color)] cursor-pointer"
                                      />
                                      <span>{opt.label}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            ) : (
                              <input
                                type={field.type === "phone" ? "tel" : field.type === "email" ? "email" : field.type === "date" ? "date" : "text"}
                                required={field.required}
                                placeholder={field.placeholder}
                                value={formInputs[field.field_key] || ""}
                                onChange={(e) => handleInputChange(field.field_key, e.target.value)}
                                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-[11px] focus:outline-none focus:ring-4 focus:ring-[rgba(var(--primary-rgb),0.1)] focus:border-[rgba(var(--primary-rgb),0.7)] bg-white text-slate-800 placeholder:text-slate-400 transition-all"
                              />
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Mock Submit CTA */}
                      <button
                        type="submit"
                        style={{ background: `linear-gradient(135deg, var(--primary-color) 0%, rgba(var(--primary-rgb), 0.85) 100%)` }}
                        className="mt-2 text-white text-[11px] font-extrabold py-3 px-4 rounded-xl hover:shadow-lg hover:shadow-[rgba(var(--primary-rgb),0.2)] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                      >
                        {landingPage.cta_text || "Gửi Đăng Ký"}
                      </button>
                    </form>
                  )}

                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
export default LandingPagePreviewModal;
