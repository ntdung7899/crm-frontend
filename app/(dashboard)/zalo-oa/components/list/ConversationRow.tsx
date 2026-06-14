"use client";

import Image from "next/image";
import type { ZaloConversation } from "@/types/zalo-oa";

interface ConversationRowProps {
    conv: ZaloConversation;
    isActive: boolean;
    onClick: () => void;
}

export function ConversationRow({ conv, isActive, onClick }: ConversationRowProps) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-start gap-3 px-3 py-2.5 text-left transition-colors border-b border-gray-100 last:border-0 ${isActive ? "bg-primary-50" : "hover:bg-gray-50"
                }`}
        >
            <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center overflow-hidden">
                    {conv.avatar ? (
                        <Image src={conv.avatar} alt={conv.name} fill sizes="40px" className="object-cover" unoptimized />
                    ) : (
                        <span className="text-white text-xs font-bold select-none">Z</span>
                    )}
                </div>
                {conv.unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] leading-none flex items-center justify-center font-semibold px-1">
                        {conv.unreadCount}
                    </span>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-1">
                    <p
                        className={`text-sm leading-tight truncate ${conv.unreadCount > 0 ? "font-semibold text-gray-900" : "font-medium text-gray-700"
                            }`}
                    >
                        {conv.name}
                    </p>
                    <span className="text-[10px] text-gray-400 flex-shrink-0 mt-0.5">{conv.timestamp}</span>
                </div>
                {conv.tags && conv.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                        {conv.tags.map((tag) => (
                            <span
                                key={tag}
                                className="px-1.5 py-0.5 rounded-full bg-primary-50 text-primary-600 text-[10px] font-medium leading-none"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
                {conv.lastMessage && (
                    <p className="text-xs text-gray-500 truncate mt-0.5">{conv.lastMessage}</p>
                )}
            </div>
        </button>
    );
}
