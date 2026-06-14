"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Mail, KeyRound, Lock, RefreshCw, CheckCircle2 } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/ToastProvider";
import { authService } from "@/services/auth";
import { clearAuthSession, setAuthSession } from "@/lib/auth-session";
import { OtpInput } from "../../forgot-password/components/OtpInput";
import { OTP_LENGTH } from "../../forgot-password/utils/forgotPassword.types";
import { isValidEmail } from "../../forgot-password/utils/forgotPassword.validators";

type ForgotStep = "request" | "verify" | "reset";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const toast = useToast();
  const [step, setStep] = useState<ForgotStep>("request");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setStep("request");
      setEmail("");
      setOtp("");
      setPassword("");
      setConfirmPassword("");
      setIsPending(false);
      setCountdown(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = window.setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const modalTitle = useMemo(() => {
    if (step === "request") return "Quên mật khẩu";
    if (step === "verify") return "Nhập mã OTP";
    return "Đặt mật khẩu mới";
  }, [step]);

  const handleRequestOtp = async () => {
    const normalizedEmail = email.trim();
    if (!isValidEmail(normalizedEmail)) {
      toast.error("Email không hợp lệ", "Vui lòng nhập đúng định dạng email.");
      return;
    }
    setIsPending(true);
    try {
      await authService.forgotPassword({ email: normalizedEmail });
      setStep("verify");
      setCountdown(60);
      toast.success("Đã gửi OTP", "Vui lòng kiểm tra email để lấy mã xác thực.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể gửi OTP.";
      toast.error("Gửi OTP thất bại", message);
    } finally {
      setIsPending(false);
    }
  };

  const handleResendOtp = async () => {
    const normalizedEmail = email.trim();
    if (!isValidEmail(normalizedEmail)) return;
    setIsPending(true);
    try {
      await authService.resendOtp({ email: normalizedEmail });
      setCountdown(60);
      toast.success("Đã gửi lại OTP", "Mã OTP mới đã được gửi đến email của bạn.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể gửi lại OTP.";
      toast.error("Gửi lại OTP thất bại", message);
    } finally {
      setIsPending(false);
    }
  };

  const handleVerifyOtp = async () => {
    const normalizedEmail = email.trim();
    const normalizedOtp = otp.trim();
    if (!isValidEmail(normalizedEmail)) {
      toast.error("Email không hợp lệ", "Vui lòng nhập đúng định dạng email.");
      return;
    }
    if (normalizedOtp.length < OTP_LENGTH) {
      toast.error("Thiếu OTP", `Vui lòng nhập đủ ${OTP_LENGTH} chữ số.`);
      return;
    }
    setIsPending(true);
    try {
      const response = await authService.verifyOtp({ email: normalizedEmail, otp: normalizedOtp });
      if (!response.responseData?.accessToken) throw new Error(response.message || "Không thể xác thực OTP.");
      setAuthSession(response.responseData);
      setStep("reset");
      toast.success("Xác thực thành công", "Bạn có thể đặt mật khẩu mới ngay bây giờ.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "OTP không hợp lệ.";
      toast.error("Xác thực OTP thất bại", message);
    } finally {
      setIsPending(false);
    }
  };

  const handleResetPassword = async () => {
    const normalizedPassword = password.trim();
    if (normalizedPassword.length < 8) { toast.error("Mật khẩu chưa hợp lệ", "Mật khẩu cần tối thiểu 8 ký tự."); return; }
    if (normalizedPassword !== confirmPassword.trim()) { toast.error("Xác nhận mật khẩu không khớp", "Vui lòng nhập lại mật khẩu xác nhận."); return; }
    setIsPending(true);
    try {
      await authService.updatePassword({ password: normalizedPassword });
      clearAuthSession();
      toast.success("Đổi mật khẩu thành công", "Bạn có thể đăng nhập lại bằng mật khẩu mới.");
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể cập nhật mật khẩu.";
      toast.error("Đổi mật khẩu thất bại", message);
    } finally {
      setIsPending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-primary-950/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-100">
              {step === "request" && <Mail className="h-4.5 w-4.5 text-primary-600" />}
              {step === "verify" && <KeyRound className="h-4.5 w-4.5 text-primary-600" />}
              {step === "reset" && <Lock className="h-4.5 w-4.5 text-primary-600" />}
            </div>
            <h2 className="text-base font-semibold text-gray-900">{modalTitle}</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isPending}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-1 px-6 pt-4">
          {(["request", "verify", "reset"] as ForgotStep[]).map((s, i) => (
            <div key={s} className="flex items-center gap-1">
              <div className={`h-1.5 w-8 rounded-full transition-colors ${step === s ? "bg-primary-600" : i < ["request", "verify", "reset"].indexOf(step) ? "bg-teal-400" : "bg-gray-200"
                }`} />
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-5">
          {step === "request" && (
            <>
              <p className="text-sm text-gray-500">Nhập email đã đăng ký. Chúng tôi sẽ gửi mã OTP để xác thực.</p>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    placeholder="example@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isPending}
                    autoComplete="email"
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm placeholder:text-gray-400 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:opacity-60 transition"
                  />
                </div>
              </div>
            </>
          )}

          {step === "verify" && (
            <>
              <div className="rounded-xl bg-primary-50 border border-primary-100 px-4 py-3 text-sm text-primary-700">
                Mã OTP đã gửi đến <span className="font-semibold">{email}</span>. Vui lòng kiểm tra hộp thư.
              </div>
              <div>
                <label className="mb-3 block text-sm font-medium text-gray-700 text-center">Nhập mã OTP</label>
                <OtpInput value={otp} onChange={setOtp} disabled={isPending} />
              </div>
              <div className="text-center">
                {countdown > 0 ? (
                  <p className="text-sm text-gray-400">Gửi lại sau <span className="font-semibold text-primary-600">{countdown}s</span></p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isPending}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 disabled:opacity-50"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Gửi lại OTP
                  </button>
                )}
              </div>
            </>
          )}

          {step === "reset" && (
            <>
              <div className="flex items-center gap-2 rounded-xl bg-teal-50 border border-teal-100 px-4 py-3 text-sm text-teal-700">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                OTP đã xác thực. Hãy đặt mật khẩu mới bên dưới.
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Mật khẩu mới</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPw ? "text" : "password"}
                    placeholder="Tối thiểu 8 ký tự"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isPending}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-11 text-sm placeholder:text-gray-400 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:opacity-60 transition"
                  />
                  <button type="button" onClick={() => setShowPw((p) => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
                    {showPw ? <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg> : <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Xác nhận mật khẩu mới</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Nhập lại mật khẩu mới"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isPending}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-11 text-sm placeholder:text-gray-400 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:opacity-60 transition"
                  />
                  <button type="button" onClick={() => setShowConfirm((p) => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
                    {showConfirm ? <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg> : <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
          <button
            onClick={onClose}
            disabled={isPending}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition"
          >
            Đóng
          </button>
          {step === "request" && (
            <button
              onClick={handleRequestOtp}
              disabled={isPending || !email.trim()}
              className="flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50 transition"
            >
              {isPending && <Spinner size="sm" className="border-2 border-white/40 border-t-white" />}
              Gửi OTP
            </button>
          )}
          {step === "verify" && (
            <button
              onClick={handleVerifyOtp}
              disabled={isPending || otp.trim().length < OTP_LENGTH}
              className="flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50 transition"
            >
              {isPending && <Spinner size="sm" className="border-2 border-white/40 border-t-white" />}
              Xác thực OTP
            </button>
          )}
          {step === "reset" && (
            <button
              onClick={handleResetPassword}
              disabled={isPending || !password.trim() || !confirmPassword.trim()}
              className="flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50 transition"
            >
              {isPending && <Spinner size="sm" className="border-2 border-white/40 border-t-white" />}
              Cập nhật mật khẩu
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
