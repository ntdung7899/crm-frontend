"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { landingPagesService } from "@/services/landingPages";
import { LandingPage } from "@/types";
import { Spinner } from "@/components/ui/Spinner";
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

function LandingPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params?.slug as string;

  const [loading, setLoading] = useState(true);
  const [lp, setLp] = useState<LandingPage | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [formInputs, setFormInputs] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showMobileCta, setShowMobileCta] = useState(false);

  // Monitor scroll to show mobile floating CTA
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 280) {
        setShowMobileCta(true);
      } else {
        setShowMobileCta(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!slug) return;

    const loadLp = async () => {
      try {
        setLoading(true);
        if (slug === "preview") {
          const draftStr = typeof window !== "undefined" ? sessionStorage.getItem("crm:lp_preview_draft") : null;
          if (draftStr) {
            const draftLp = JSON.parse(draftStr);
            setLp(draftLp);
            return;
          }
          throw new Error("Không tìm thấy dữ liệu xem trước. Vui lòng quay lại trình chỉnh sửa và bấm Xem trước.");
        }
        const data = await landingPagesService.getPublicLandingPage(slug);
        setLp(data);
      } catch (err: any) {
        setErrorMsg(err.message || "Landing page không khả dụng hoặc đã ngừng hoạt động.");
      } finally {
        setLoading(false);
      }
    };

    loadLp();
  }, [slug]);

  const handleInputChange = (fieldKey: string, val: any) => {
    setFormInputs((prev) => ({ ...prev, [fieldKey]: val }));
    if (validationErrors[fieldKey]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[fieldKey];
        return next;
      });
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lp) return;

    // Validate inputs
    const errors: Record<string, string> = {};
    lp.form_fields.forEach((field) => {
      const val = formInputs[field.field_key];
      if (field.required && (!val || (Array.isArray(val) && val.length === 0))) {
        errors[field.field_key] = `Vui lòng điền thông tin: ${field.label}`;
      }
      if (field.type === "phone" && val) {
        const phoneRegex = /^(0|\+84|84)[1-9][0-9]{8}$/;
        if (!phoneRegex.test(val.replace(/\s+/g, ""))) {
          errors[field.field_key] = "Số điện thoại không hợp lệ";
        }
      }
      if (field.type === "email" && val) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(val)) {
          errors[field.field_key] = "Email không hợp lệ";
        }
      }
    });

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Collect UTM parameters
    const utmParams: Record<string, string> = {};
    const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
    utmKeys.forEach((key) => {
      const val = searchParams?.get(key);
      if (val) utmParams[key] = val;
    });

    setSubmitting(true);
    try {
      if (slug === "preview") {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setSubmitted(true);
        if (lp.redirect_url) {
          setTimeout(() => {
            alert(`[Chế độ xem trước] Biểu mẫu đã gửi thành công! Đường dẫn chuyển hướng cấu hình là: ${lp.redirect_url}`);
          }, 1500);
        }
        return;
      }

      await landingPagesService.submitPublicLandingPage(slug, {
        ...formInputs,
        ...utmParams,
      });
      setSubmitted(true);
      if (lp.redirect_url) {
        setTimeout(() => {
          window.location.href = lp.redirect_url!;
        }, 1500);
      }
    } catch (err: any) {
      alert(err.message || "Có lỗi xảy ra khi gửi thông tin. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  const scrollToForm = () => {
    const formEl = document.getElementById("registration-form-card");
    if (formEl) {
      formEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Spinner className="h-10 w-10 text-primary" />
      </div>
    );
  }

  if (errorMsg || !lp) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 p-6">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center border border-slate-200 shadow-2xl">
          <div className="text-amber-500 text-5xl mb-4 animate-bounce">⚠️</div>
          <h2 className="text-xl font-black text-slate-800">Landing Page Không Khả Dụng</h2>
          <p className="text-slate-500 mt-3 text-sm leading-relaxed">{errorMsg}</p>
          <div className="mt-6 border-t border-slate-100 pt-4">
            <p className="text-xs text-slate-400 font-medium">Hệ thống CRM & Marketing TechX</p>
          </div>
        </div>
      </div>
    );
  }

  const primaryColor = lp.primary_color || "#0C9CEC";
  const primaryRgb = hexToRgb(primaryColor);

  return (
    <div 
      style={{
        "--primary-color": primaryColor,
        "--primary-rgb": primaryRgb,
      } as React.CSSProperties}
      className="min-h-screen bg-slate-50/50 flex flex-col font-sans relative overflow-x-hidden"
    >
      {/* Decorative Glowing Backdrop Blobs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[rgba(var(--primary-rgb),0.06)] rounded-full blur-[120px] pointer-events-none -z-10 animate-crm-float" />
      <div className="absolute bottom-20 right-1/4 w-[600px] h-[600px] bg-[rgba(var(--primary-rgb),0.04)] rounded-full blur-[140px] pointer-events-none -z-10 animate-crm-float" style={{ animationDelay: "-3s" }} />

      {/* Glassmorphic Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 border-b border-slate-200/40 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-9 h-9 rounded-2xl flex items-center justify-center text-white font-black text-base shadow-lg shadow-[rgba(var(--primary-rgb),0.3)]"
              style={{ background: `linear-gradient(135deg, var(--primary-color) 0%, rgba(var(--primary-rgb), 0.75) 100%)` }}
            >
              TechX
            </div>
            <span className="font-extrabold text-slate-800 tracking-tight text-base hidden sm:inline-block">
              TechX <span className="text-slate-400 font-medium">Marketing</span>
            </span>
          </div>
          <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-600 px-3.5 py-1 rounded-full text-xs font-bold border border-emerald-500/10 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Đang hoạt động
          </div>
        </div>
      </header>

      {/* Hero Banner Section */}
      {lp.banner_url ? (
        <div className="w-full relative h-[250px] md:h-[360px] overflow-hidden bg-slate-900">
          <img
            src={resolveMediaUrl(lp.banner_url)}
            alt={lp.title}
            className="w-full h-full object-cover opacity-85 select-none pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 max-w-6xl mx-auto px-6 pb-12 md:pb-16 text-white z-10">
            <span className="inline-block bg-[rgba(var(--primary-rgb),0.2)] backdrop-blur-md text-[var(--primary-color)] border border-[rgba(var(--primary-rgb),0.3)] text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full mb-3 shadow-sm">
              Chương Trình Đặc Biệt
            </span>
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight max-w-4xl text-shadow">
              {lp.title}
            </h1>
          </div>
        </div>
      ) : (
        <div className="w-full h-10 bg-transparent" />
      )}

      {/* Main Grid Content Area */}
      <div className="max-w-6xl w-full mx-auto px-6 -mt-8 md:-mt-12 relative z-20 flex-1 flex flex-col lg:flex-row gap-8 items-start pb-20">
        
        {/* Info Column (Left Side) */}
        <div className="flex-1 flex flex-col gap-6 w-full">
          {/* If there is no banner, we render title and status inside main layout */}
          {!lp.banner_url && (
            <div className="bg-white/80 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-slate-200/50 shadow-xl shadow-slate-100/50">
              <h1 className="text-3xl md:text-4xl font-black text-slate-800 leading-tight">
                {lp.title}
              </h1>
            </div>
          )}

          {lp.description && (
            <div className="relative p-6 rounded-3xl bg-white/80 backdrop-blur-md border border-slate-200/50 shadow-md">
              <div 
                className="absolute left-0 top-6 bottom-6 w-1.5 rounded-r-full"
                style={{ backgroundColor: "var(--primary-color)" }}
              />
              <p className="text-slate-700 text-sm md:text-base leading-relaxed pl-4 font-semibold italic">
                {lp.description}
              </p>
            </div>
          )}

          {lp.content && (
            <div className="bg-white/80 backdrop-blur-md p-6 md:p-10 rounded-3xl border border-slate-200/50 shadow-xl shadow-slate-100/30">
              <article 
                className="prose prose-slate max-w-none text-slate-600 text-sm md:text-base leading-relaxed
                           prose-headings:font-black prose-headings:text-slate-800 prose-headings:tracking-tight prose-headings:mt-6 prose-headings:mb-4
                           prose-h3:text-lg prose-h3:border-l-4 prose-h3:border-[var(--primary-color)] prose-h3:pl-3
                           prose-p:mb-4 prose-p:leading-relaxed
                           prose-ul:list-disc prose-ul:pl-6 prose-ul:space-y-2 prose-ul:my-4
                           prose-li:text-slate-600 prose-li:marker:text-[var(--primary-color)]"
                dangerouslySetInnerHTML={{ __html: lp.content }}
              />
            </div>
          )}
        </div>

        {/* Form Column (Right Side / Sticky) */}
        <div id="registration-form-card" className="w-full lg:w-[390px] shrink-0 lg:sticky lg:top-24">
          <div className="bg-white/90 backdrop-blur-lg border border-white/60 rounded-3xl p-6 md:p-8 shadow-2xl shadow-slate-200/80">
            {submitted ? (
              <div className="flex flex-col items-center text-center py-8">
                <div className="relative mb-6">
                  <div 
                    className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{ background: `rgba(var(--primary-rgb), 0.12)` }}
                  >
                    <svg 
                      className="w-10 h-10 animate-in zoom-in duration-300"
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
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-ping" style={{ background: "var(--primary-color)" }} />
                  <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 rounded-full animate-pulse opacity-60" style={{ background: "var(--primary-color)" }} />
                </div>
                
                <h3 className="text-lg font-black text-slate-800">
                  Đăng ký thành công!
                </h3>
                <p className="text-xs text-slate-500 mt-4 leading-relaxed max-w-xs px-2">
                  {lp.thank_you_message || "Cảm ơn bạn đã quan tâm. Chúng tôi đã nhận được thông tin đăng ký và sẽ liên hệ hỗ trợ trong thời gian sớm nhất."}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-3 rounded-full" style={{ backgroundColor: "var(--primary-color)" }} />
                    Đăng ký nhận tư vấn
                  </h3>
                </div>

                <div className="flex flex-col gap-4 max-h-[50vh] overflow-y-auto pr-1 scrollbar-thin">
                  {lp.form_fields.map((field) => (
                    <div key={field.field_key} className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-0.5 select-none">
                        {field.label}
                        {field.required && <span className="text-rose-500 font-extrabold ml-0.5">*</span>}
                      </label>

                      {field.type === "textarea" ? (
                        <textarea
                          required={field.required}
                          placeholder={field.placeholder}
                          value={formInputs[field.field_key] || ""}
                          onChange={(e) => handleInputChange(field.field_key, e.target.value)}
                          rows={3}
                          className={`w-full border rounded-2xl px-4 py-3 text-xs bg-white/70 backdrop-blur-sm text-slate-800 transition-all placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[rgba(var(--primary-rgb),0.12)] ${
                            validationErrors[field.field_key]
                              ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10"
                              : "border-slate-200 focus:border-[rgba(var(--primary-rgb),0.8)]"
                          }`}
                        />
                      ) : field.type === "select" ? (
                        <select
                          required={field.required}
                          value={formInputs[field.field_key] || ""}
                          onChange={(e) => handleInputChange(field.field_key, e.target.value)}
                          className={`w-full border rounded-2xl px-4 py-3 text-xs bg-white/70 backdrop-blur-sm text-slate-800 transition-all focus:outline-none focus:ring-4 focus:ring-[rgba(var(--primary-rgb),0.12)] ${
                            validationErrors[field.field_key]
                              ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10"
                              : "border-slate-200 focus:border-[rgba(var(--primary-rgb),0.8)]"
                          }`}
                        >
                          <option value="">{field.placeholder || "-- Chọn lựa chọn --"}</option>
                          {field.options?.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : field.type === "radio" ? (
                        <div className="flex flex-col gap-2.5 mt-1 pl-1">
                          {field.options?.map((opt) => (
                            <label
                              key={opt.value}
                              className="flex items-center gap-2.5 text-xs font-medium text-slate-600 select-none cursor-pointer hover:text-slate-800 transition-colors"
                            >
                              <input
                                type="radio"
                                name={field.field_key}
                                required={field.required}
                                checked={formInputs[field.field_key] === opt.value}
                                onChange={() => handleInputChange(field.field_key, opt.value)}
                                className="h-4.5 w-4.5 border-slate-300 accent-[var(--primary-color)] cursor-pointer"
                              />
                              <span>{opt.label}</span>
                            </label>
                          ))}
                        </div>
                      ) : field.type === "checkbox" ? (
                        <div className="flex flex-col gap-2.5 mt-1 pl-1">
                          {field.options?.map((opt) => {
                            const checked = (
                              (formInputs[field.field_key] as string[]) || []
                            ).includes(opt.value);
                            return (
                              <label
                                key={opt.value}
                                className="flex items-center gap-2.5 text-xs font-medium text-slate-600 select-none cursor-pointer hover:text-slate-800 transition-colors"
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
                                  className="h-4.5 w-4.5 rounded border-slate-300 accent-[var(--primary-color)] cursor-pointer"
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
                          className={`w-full border rounded-2xl px-4 py-3 text-xs bg-white/70 backdrop-blur-sm text-slate-800 transition-all placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[rgba(var(--primary-rgb),0.12)] ${
                            validationErrors[field.field_key]
                              ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10"
                              : "border-slate-200 focus:border-[rgba(var(--primary-rgb),0.8)]"
                          }`}
                        />
                      )}

                      {validationErrors[field.field_key] && (
                        <span className="text-[10px] text-rose-500 font-bold mt-0.5 ml-1 animate-in fade-in duration-200">
                          {validationErrors[field.field_key]}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{ 
                    background: `linear-gradient(135deg, var(--primary-color) 0%, rgba(var(--primary-rgb), 0.85) 100%)` 
                  }}
                  className="mt-2 text-white text-xs font-extrabold py-3.5 px-4 rounded-2xl hover:shadow-lg hover:shadow-[rgba(var(--primary-rgb),0.25)] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Đang xử lý đăng ký...
                    </>
                  ) : (
                    lp.cta_text || "Gửi Đăng Ký"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

      </div>

      {/* Mobile Floating Action Button */}
      {!submitted && showMobileCta && (
        <div className="fixed bottom-6 left-0 right-0 z-40 px-6 lg:hidden animate-in fade-in slide-in-from-bottom-6 duration-300">
          <button
            onClick={scrollToForm}
            style={{ 
              background: `linear-gradient(135deg, var(--primary-color) 0%, rgba(var(--primary-rgb), 0.85) 100%)` 
            }}
            className="w-full text-white text-xs font-black py-4 px-6 rounded-2xl shadow-xl shadow-[rgba(var(--primary-rgb),0.3)] active:scale-95 transition-all flex items-center justify-center gap-2 border border-white/20 uppercase tracking-wider"
          >
            ✍️ {lp.cta_text || "Đăng Ký Tư Vấn Ngay"}
          </button>
        </div>
      )}
    </div>
  );
}

export default function PublicLandingPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Spinner className="h-10 w-10 text-primary" />
      </div>
    }>
      <LandingPageContent />
    </Suspense>
  );
}
