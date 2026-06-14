"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    ArrowLeft,
    CheckCircle2,
    KeyRound,
    Lock,
    Mail,
    RefreshCw,
} from "lucide-react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { Spinner } from "@/components/ui/Spinner";
import { OtpInput } from "./OtpInput";
import { useForgotPasswordFlow } from "../hooks/useForgotPasswordFlow";
import {
    FORGOT_PASSWORD_STEPS,
    ForgotStep,
    OTP_LENGTH,
} from "../utils/forgotPassword.types";

type StepMeta = {
    title: string;
    sub: string;
    icon: ReactNode;
};

const stepMeta: Record<ForgotStep, StepMeta> = {
    request: {
        title: "Quên mật khẩu",
        sub: "Nhập email đã đăng ký để nhận mã OTP xác thực.",
        icon: <Mail className="h-5 w-5 text-primary-600" />,
    },
    verify: {
        title: "Nhập mã OTP",
        sub: "Kiểm tra email và nhập mã 6 chữ số bên dưới.",
        icon: <KeyRound className="h-5 w-5 text-primary-600" />,
    },
    reset: {
        title: "Đặt mật khẩu mới",
        sub: "OTP đã xác thực. Nhập mật khẩu mới của bạn.",
        icon: <Lock className="h-5 w-5 text-primary-600" />,
    },
    done: {
        title: "Hoàn tất",
        sub: "Mật khẩu đã được cập nhật thành công.",
        icon: <CheckCircle2 className="h-5 w-5 text-teal-600" />,
    },
};

export function ForgotPasswordView() {
    const {
        step,
        email,
        setEmail,
        otp,
        setOtp,
        password,
        setPassword,
        confirmPassword,
        setConfirmPassword,
        showPw,
        setShowPw,
        showConfirm,
        setShowConfirm,
        isPending,
        countdown,
        activeStepIndex,
        handleRequestOtp,
        handleResendOtp,
        handleVerifyOtp,
        handleResetPassword,
        goToLogin,
    } = useForgotPasswordFlow();

    const meta = stepMeta[step];

    return (
        <div className="relative min-h-screen overflow-hidden bg-primary-950">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-primary-700/20 blur-3xl" />
                <div className="absolute -bottom-32 -left-32 h-[500px] w-[500px] rounded-full bg-teal-600/15 blur-3xl" />
            </div>

            <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
                <div className="grid w-full items-center gap-12 lg:grid-cols-[1fr_440px]">
                    <section className="hidden lg:flex lg:flex-col">
                        <div>
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-400/30 bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-300">
                                <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
                                Khôi phục tài khoản
                            </span>
                            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-white">
                                Quên mật khẩu?<br />
                                <span className="text-primary-300">Đừng lo,</span> chúng tôi giúp bạn.
                            </h1>
                            <p className="mt-4 max-w-md text-base leading-relaxed text-primary-200/70">
                                Chỉ cần nhập email đã đăng ký, chúng tôi sẽ gửi mã OTP để xác thực và bạn có thể đặt mật khẩu mới ngay lập tức.
                            </p>
                        </div>
                        <div className="mt-12 flex flex-col gap-3">
                            {[
                                "Bảo mật OTP 6 chữ số qua email",
                                "Mã OTP hết hạn sau 5 phút",
                                "Mật khẩu được mã hóa an toàn",
                            ].map((text) => (
                                <div key={text} className="flex items-center gap-3 text-sm text-primary-200/80">
                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-500/20 text-teal-400">
                                        <svg viewBox="0 0 12 12" fill="currentColor" className="h-3 w-3">
                                            <path
                                                d="M10 3L5 8.5 2 5.5"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                fill="none"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </span>
                                    {text}
                                </div>
                            ))}
                        </div>
                    </section>

                    <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-1 shadow-2xl backdrop-blur-xl">
                        <div className="rounded-xl bg-white px-8 py-10">
                            <div className="mb-6 flex justify-center">
                                <Image
                                    src="/logo.jpg"
                                    alt="CRM Logo"
                                    width={130}
                                    height={40}
                                    className="object-contain"
                                    priority
                                />
                            </div>

                            {step !== "done" && (
                                <div className="mb-6 flex items-center gap-1.5">
                                    {FORGOT_PASSWORD_STEPS.map((s, i) => (
                                        <div
                                            key={s}
                                            className={`h-1.5 flex-1 rounded-full transition-colors ${i < activeStepIndex
                                                ? "bg-teal-400"
                                                : i === activeStepIndex
                                                    ? "bg-primary-600"
                                                    : "bg-gray-200"
                                                }`}
                                        />
                                    ))}
                                </div>
                            )}

                            <div className="mb-6 flex items-center gap-3">
                                <div
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${step === "done" ? "bg-teal-100" : "bg-primary-100"}`}
                                >
                                    {meta.icon}
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">{meta.title}</h2>
                                    <p className="text-sm text-gray-500">{meta.sub}</p>
                                </div>
                            </div>

                            {step === "request" && (
                                <div className="space-y-4">
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
                                                onKeyDown={(e) => e.key === "Enter" && handleRequestOtp()}
                                                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm placeholder:text-gray-400 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:opacity-60 transition"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleRequestOtp}
                                        disabled={isPending || !email.trim()}
                                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50 transition"
                                    >
                                        {isPending && (
                                            <Spinner size="sm" className="border-2 border-white/40 border-t-white" />
                                        )}
                                        Gửi mã OTP
                                    </button>
                                </div>
                            )}

                            {step === "verify" && (
                                <div className="space-y-5">
                                    <div className="rounded-xl border border-primary-100 bg-primary-50 px-4 py-3 text-sm text-primary-700">
                                        Đã gửi mã OTP tới <span className="font-semibold">{email}</span>
                                    </div>
                                    <div>
                                        <label className="mb-3 block text-center text-sm font-medium text-gray-700">
                                            Nhập mã OTP
                                        </label>
                                        <OtpInput value={otp} onChange={setOtp} disabled={isPending} />
                                    </div>
                                    <div className="text-center">
                                        {countdown > 0 ? (
                                            <p className="text-sm text-gray-400">
                                                Gửi lại sau <span className="font-semibold text-primary-600">{countdown}s</span>
                                            </p>
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
                                    <button
                                        onClick={handleVerifyOtp}
                                        disabled={isPending || otp.trim().length < OTP_LENGTH}
                                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50 transition"
                                    >
                                        {isPending && (
                                            <Spinner size="sm" className="border-2 border-white/40 border-t-white" />
                                        )}
                                        Xác thực OTP
                                    </button>
                                </div>
                            )}

                            {step === "reset" && (
                                <div className="space-y-4">
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
                                            <button
                                                type="button"
                                                onClick={() => setShowPw((p) => !p)}
                                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                tabIndex={-1}
                                            >
                                                {showPw ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
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
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirm((p) => !p)}
                                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                tabIndex={-1}
                                            >
                                                {showConfirm ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleResetPassword}
                                        disabled={isPending || !password.trim() || !confirmPassword.trim()}
                                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50 transition"
                                    >
                                        {isPending && (
                                            <Spinner size="sm" className="border-2 border-white/40 border-t-white" />
                                        )}
                                        Cập nhật mật khẩu
                                    </button>
                                </div>
                            )}

                            {step === "done" && (
                                <div className="space-y-5 text-center">
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-100">
                                        <CheckCircle2 className="h-8 w-8 text-teal-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">Đổi mật khẩu thành công!</p>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Bạn có thể đăng nhập lại bằng mật khẩu mới.
                                        </p>
                                    </div>
                                    <button
                                        onClick={goToLogin}
                                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition"
                                    >
                                        Đăng nhập ngay
                                    </button>
                                </div>
                            )}

                            {step !== "done" && (
                                <div className="mt-6 text-center">
                                    <Link
                                        href="/auth/login"
                                        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600"
                                    >
                                        <ArrowLeft className="h-3.5 w-3.5" />
                                        Quay lại đăng nhập
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
