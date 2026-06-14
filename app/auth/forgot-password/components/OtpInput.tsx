"use client";

import { useRef } from "react";
import { OTP_LENGTH } from "../utils/forgotPassword.types";

interface OtpInputProps {
    value: string;
    onChange: (v: string) => void;
    disabled: boolean;
}

export function OtpInput({ value, onChange, disabled }: OtpInputProps) {
    const refs = useRef<(HTMLInputElement | null)[]>([]);
    const digits = value.padEnd(OTP_LENGTH, "").slice(0, OTP_LENGTH).split("");

    const update = (idx: number, char: string) => {
        const next = digits.slice();
        next[idx] = char;
        onChange(next.join("").trimEnd());
    };

    const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace") {
            if (digits[idx]) {
                update(idx, "");
            } else if (idx > 0) {
                refs.current[idx - 1]?.focus();
                update(idx - 1, "");
            }
        } else if (e.key === "ArrowLeft" && idx > 0) {
            refs.current[idx - 1]?.focus();
        } else if (e.key === "ArrowRight" && idx < OTP_LENGTH - 1) {
            refs.current[idx + 1]?.focus();
        }
    };

    const handleChange = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, "");
        if (!val) return;

        if (val.length > 1) {
            const chars = val.slice(0, OTP_LENGTH - idx).split("");
            const next = digits.slice();
            chars.forEach((c, i) => {
                if (idx + i < OTP_LENGTH) next[idx + i] = c;
            });
            onChange(next.join("").trimEnd());
            const focusIdx = Math.min(idx + chars.length, OTP_LENGTH - 1);
            refs.current[focusIdx]?.focus();
            return;
        }

        update(idx, val);
        if (idx < OTP_LENGTH - 1) refs.current[idx + 1]?.focus();
    };

    return (
        <div className="flex items-center justify-center gap-2">
            {Array.from({ length: OTP_LENGTH }).map((_, i) => (
                <input
                    key={i}
                    ref={(el) => {
                        refs.current[i] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={OTP_LENGTH}
                    value={digits[i] ?? ""}
                    disabled={disabled}
                    onChange={(e) => handleChange(i, e)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onFocus={(e) => e.target.select()}
                    className="h-12 w-11 rounded-lg border border-gray-200 bg-gray-50 text-center text-lg font-bold text-primary-700 caret-transparent focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/25 disabled:opacity-50 transition"
                />
            ))}
        </div>
    );
}
