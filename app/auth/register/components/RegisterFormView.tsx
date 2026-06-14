"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { FiUserPlus, FiUser, FiMail, FiPhone, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { Spinner } from "@/components/ui/Spinner";
import type { RegisterFormBindings } from "../utils/registerForm.types";

export function RegisterFormView({
    form,
    errors,
    isPending,
    canSubmit,
    handleInputChange,
    handleSubmit,
}: RegisterFormBindings) {
    const [showPassword, setShowPassword] = useState(false);

    const fields = [
        {
            key: "full_name" as const,
            label: "Họ và tên",
            type: "text",
            placeholder: "Nguyễn Văn A",
            autoComplete: "name",
            icon: FiUser,
        },
        {
            key: "email" as const,
            label: "Email",
            type: "email",
            placeholder: "example@domain.com",
            autoComplete: "email",
            icon: FiMail,
        },
        {
            key: "phone" as const,
            label: "Số điện thoại",
            type: "tel",
            placeholder: "0123 456 789",
            autoComplete: "tel",
            icon: FiPhone,
        },
    ];

    return (
        <div className="relative min-h-screen overflow-hidden bg-primary-950">
            {/* background blobs */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-primary-700/20 blur-3xl" />
                <div className="absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full bg-teal-600/15 blur-3xl" />
            </div>

            <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
                <div className="grid w-full items-center gap-12 lg:grid-cols-[1fr_460px]">
                    {/* Hero section */}
                    <section className="hidden lg:flex lg:flex-col">
                        <div className="mt-0">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-400/30 bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-300">
                                <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
                                Tạo tài khoản mới
                            </span>
                            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-white">
                                Bắt đầu hành trình<br />
                                <span className="text-primary-300">quản lý</span> chuyên nghiệp.
                            </h1>
                            <p className="mt-4 max-w-md text-base leading-relaxed text-primary-200/70">
                                Tạo tài khoản và trải nghiệm hệ thống CRM toàn diện ngay hôm nay.
                            </p>
                        </div>
                        <div className="mt-12 flex flex-col gap-3">
                            {[
                                "Miễn phí trong 30 ngày đầu",
                                "Hỗ trợ nhập liệu hàng loạt từ Excel",
                                "Báo cáo & thống kê tức thì",
                            ].map((text) => (
                                <div key={text} className="flex items-center gap-3 text-sm text-primary-200/80">
                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-500/20 text-teal-400">
                                        <svg viewBox="0 0 12 12" fill="currentColor" className="h-3 w-3">
                                            <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </span>
                                    {text}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Form card */}
                    <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-1 shadow-2xl backdrop-blur-xl">
                        <div className="rounded-xl bg-white px-8 py-10">
                            {/* Logo */}
                            <div className="mb-6 flex justify-center">
                                <Image src="/logo.jpg" alt="CRM Logo" width={130} height={40} className="object-contain" priority />
                            </div>

                            <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                                {fields.map(({ key, label, type, placeholder, autoComplete, icon: Icon }) => (
                                    <div key={key}>
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
                                        <div className="relative">
                                            <Icon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type={type}
                                                placeholder={placeholder}
                                                value={form[key]}
                                                onChange={(e) => handleInputChange(key, e.target.value)}
                                                autoComplete={autoComplete}
                                                disabled={isPending}
                                                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:opacity-60 transition"
                                            />
                                        </div>
                                        {errors[key] && <p className="mt-1 text-xs text-red-500">{errors[key]}</p>}
                                    </div>
                                ))}

                                {/* Password */}
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Mật khẩu</label>
                                    <div className="relative">
                                        <FiLock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Tối thiểu 8 ký tự"
                                            value={form.password}
                                            onChange={(e) => handleInputChange("password", e.target.value)}
                                            autoComplete="new-password"
                                            disabled={isPending}
                                            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-11 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:opacity-60 transition"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((p) => !p)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            tabIndex={-1}
                                        >
                                            {showPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isPending || !canSubmit}
                                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-60 transition mt-2"
                                >
                                    {isPending ? (
                                        <Spinner size="sm" className="border-2 border-white/40 border-t-white" />
                                    ) : (
                                        <FiUserPlus className="h-4 w-4" />
                                    )}
                                    {isPending ? "Đang tạo tài khoản..." : "Đăng ký"}
                                </button>

                                <p className="text-center text-sm text-gray-500">
                                    Đã có tài khoản?{" "}
                                    <Link href="/auth/login" className="font-semibold text-primary-600 hover:text-primary-700">
                                        Đăng nhập
                                    </Link>
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
