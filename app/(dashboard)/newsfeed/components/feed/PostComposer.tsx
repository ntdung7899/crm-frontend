"use client";

import { FiImage, FiVideo, FiCalendar } from "react-icons/fi";
import { MyInfoResponseData } from "@/types/api";
import { FeedAvatar } from "./FeedAvatar";

interface PostComposerProps {
  currentUser: MyInfoResponseData | null;
  onCreate: () => void;
}

export function PostComposer({ currentUser, onCreate }: PostComposerProps) {
  const name = currentUser?.full_name || "Bạn";

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <FeedAvatar src={currentUser?.avatar} name={name} size={40} />
        <button
          type="button"
          onClick={onCreate}
          className="flex-1 rounded-full bg-gray-100 px-4 py-2.5 text-left text-sm text-gray-500 transition-colors hover:bg-gray-200"
        >
          {name}, bạn đang nghĩ gì?
        </button>
      </div>

      <div className="mt-3 flex items-center gap-1 border-t border-gray-100 pt-2">
        <ComposerButton icon={<FiImage className="h-5 w-5 text-green-500" />} label="Ảnh/Video" onClick={onCreate} />
        <ComposerButton icon={<FiVideo className="h-5 w-5 text-rose-500" />} label="Media" onClick={onCreate} />
        <ComposerButton icon={<FiCalendar className="h-5 w-5 text-amber-500" />} label="Sự kiện" onClick={onCreate} />
      </div>
    </div>
  );
}

function ComposerButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
    >
      {icon}
      {label}
    </button>
  );
}
