"use client";

import { FiAlertTriangle, FiMail, FiRefreshCw } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { OtpInput, OTP_LENGTH } from "./OtpInput";
import type { DeleteAccountStep } from "../../hooks/useDeleteAccountFlow";

interface DeleteAccountModalProps {
    isOpen: boolean;
    step: DeleteAccountStep;
    email: string;
    otp: string;
    error: string | null;
    isRequesting: boolean;
    isConfirming: boolean;
    isPending: boolean;
    countdown: number;
    onClose: () => void;
    onChangeEmail: (value: string) => void;
    onChangeOtp: (value: string) => void;
    onRequestOtp: () => void;
    onResendOtp: () => void;
    onConfirmDelete: () => void;
}

export function DeleteAccountModal({
    isOpen,
    step,
    email,
    otp,
    error,
    isRequesting,
    isConfirming,
    isPending,
    countdown,
    onClose,
    onChangeEmail,
    onChangeOtp,
    onRequestOtp,
    onResendOtp,
    onConfirmDelete,
}: DeleteAccountModalProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Xóa tài khoản"
            size="sm"
            footer={
                step === "request" ? (
                    <>
                        <Button variant="outline" onClick={onClose} disabled={isPending}>
                            Hủy
                        </Button>
                        <Button
                            variant="danger"
                            onClick={onRequestOtp}
                            disabled={isPending || !email.trim()}
                        >
                            {isRequesting ? "Đang gửi..." : "Gửi mã OTP"}
                        </Button>
                    </>
                ) : (
                    <>
                        <Button variant="outline" onClick={onClose} disabled={isPending}>
                            Hủy
                        </Button>
                        <Button
                            variant="danger"
                            onClick={onConfirmDelete}
                            disabled={isPending || otp.trim().length < OTP_LENGTH}
                        >
                            {isConfirming ? "Đang xóa..." : "Xác nhận xóa"}
                        </Button>
                    </>
                )
            }
        >
            <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <FiAlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>
                        Tài khoản sẽ bị <span className="font-semibold">xóa vĩnh viễn</span> và không
                        thể khôi phục. Vui lòng xác nhận qua mã OTP gửi tới email.
                    </p>
                </div>

                {step === "request" ? (
                    <Input
                        label="Email tài khoản"
                        type="email"
                        value={email}
                        onChange={(event) => onChangeEmail(event.target.value)}
                        placeholder="example@domain.com"
                        error={error || undefined}
                        autoComplete="email"
                        disabled={isPending}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                event.preventDefault();
                                onRequestOtp();
                            }
                        }}
                    />
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 rounded-lg border border-primary-100 bg-primary-50 px-3 py-2.5 text-sm text-primary-700">
                            <FiMail className="h-4 w-4 shrink-0" />
                            <span>
                                Đã gửi mã OTP tới <span className="font-semibold">{email}</span>
                            </span>
                        </div>

                        <div>
                            <label className="mb-3 block text-center text-sm font-medium text-gray-700">
                                Nhập mã OTP {OTP_LENGTH} chữ số
                            </label>
                            <OtpInput value={otp} onChange={onChangeOtp} disabled={isPending} />
                        </div>

                        {error && (
                            <p className="text-center text-sm text-red-600">{error}</p>
                        )}

                        <div className="text-center">
                            {countdown > 0 ? (
                                <p className="text-sm text-gray-400">
                                    Gửi lại sau{" "}
                                    <span className="font-semibold text-primary-600">{countdown}s</span>
                                </p>
                            ) : (
                                <button
                                    type="button"
                                    onClick={onResendOtp}
                                    disabled={isPending}
                                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 disabled:opacity-50"
                                >
                                    <FiRefreshCw className="h-3.5 w-3.5" />
                                    Gửi lại OTP
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}
