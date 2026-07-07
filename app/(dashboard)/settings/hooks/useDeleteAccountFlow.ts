"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearAuthSession } from "@/lib/auth-session";
import { usersService } from "@/services/users";
import { useStableToastRef } from "@/hooks/useStableToastRef";
import { OTP_LENGTH } from "../components/account/OtpInput";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type DeleteAccountStep = "request" | "verify";

interface UseDeleteAccountFlowOptions {
    /** Email của tài khoản hiện tại, dùng để điền sẵn. */
    defaultEmail?: string;
}

export function useDeleteAccountFlow({ defaultEmail = "" }: UseDeleteAccountFlowOptions = {}) {
    const router = useRouter();
    const toastRef = useStableToastRef();

    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState<DeleteAccountStep>("request");
    const [email, setEmail] = useState(defaultEmail);
    const [otp, setOtp] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isRequesting, setIsRequesting] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        if (countdown <= 0) return;
        const t = window.setTimeout(() => setCountdown((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [countdown]);

    const isPending = isRequesting || isConfirming;

    const open = useCallback(() => {
        setStep("request");
        setEmail(defaultEmail);
        setOtp("");
        setError(null);
        setCountdown(0);
        setIsOpen(true);
    }, [defaultEmail]);

    const close = useCallback(() => {
        if (isPending) return;
        setIsOpen(false);
    }, [isPending]);

    const handleChangeEmail = useCallback((value: string) => {
        setEmail(value);
        if (error) setError(null);
    }, [error]);

    const handleChangeOtp = useCallback((value: string) => {
        setOtp(value);
        if (error) setError(null);
    }, [error]);

    const requestOtp = useCallback(async () => {
        const normalizedEmail = email.trim();
        if (!EMAIL_REGEX.test(normalizedEmail)) {
            setError("Email không hợp lệ. Vui lòng nhập đúng định dạng.");
            return;
        }

        setError(null);
        setIsRequesting(true);
        try {
            await usersService.requestDeleteOtp({ email: normalizedEmail });
            setStep("verify");
            setCountdown(60);
            toastRef.current.success(
                "Đã gửi mã OTP",
                "Vui lòng kiểm tra email để lấy mã xác nhận xóa tài khoản.",
            );
        } catch (err) {
            const message = err instanceof Error ? err.message : "Không thể gửi mã OTP.";
            setError(message);
            toastRef.current.error("Gửi OTP thất bại", message);
        } finally {
            setIsRequesting(false);
        }
    }, [email, toastRef]);

    const resendOtp = useCallback(async () => {
        if (countdown > 0) return;
        await requestOtp();
    }, [countdown, requestOtp]);

    const confirmDelete = useCallback(async () => {
        const normalizedEmail = email.trim();
        const normalizedOtp = otp.trim();

        if (normalizedOtp.length < OTP_LENGTH) {
            setError(`Vui lòng nhập đủ ${OTP_LENGTH} chữ số OTP.`);
            return;
        }

        setError(null);
        setIsConfirming(true);
        try {
            await usersService.confirmDeleteUser({
                email: normalizedEmail,
                otp: normalizedOtp,
            });

            toastRef.current.success(
                "Xóa tài khoản thành công",
                "Tài khoản của bạn đã được xóa. Bạn sẽ được chuyển về trang đăng nhập.",
            );

            setIsOpen(false);
            clearAuthSession();
            router.replace("/auth/login");
        } catch (err) {
            const message = err instanceof Error ? err.message : "Mã OTP không đúng hoặc đã hết hạn.";
            setError(message);
            toastRef.current.error("Xóa tài khoản thất bại", message);
        } finally {
            setIsConfirming(false);
        }
    }, [email, otp, router, toastRef]);

    return {
        isOpen,
        step,
        email,
        otp,
        error,
        isRequesting,
        isConfirming,
        isPending,
        countdown,
        open,
        close,
        handleChangeEmail,
        handleChangeOtp,
        requestOtp,
        resendOtp,
        confirmDelete,
    };
}
