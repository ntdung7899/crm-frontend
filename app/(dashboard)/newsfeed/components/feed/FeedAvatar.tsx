import { getInitials } from "@/lib/utils";
import { resolveMediaUrl } from "../../utils/postMappers";

interface FeedAvatarProps {
  src?: string | null;
  name: string;
  size?: number;
  className?: string;
}

export function FeedAvatar({ src, name, size = 40, className = "" }: FeedAvatarProps) {
  const resolved = resolveMediaUrl(src);
  const style = { width: size, height: size };

  if (resolved) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={resolved}
        alt={name}
        style={style}
        className={`shrink-0 rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      style={{ ...style, fontSize: size * 0.4 }}
      className={`flex shrink-0 items-center justify-center rounded-full bg-primary-500 font-semibold text-white ${className}`}
    >
      {getInitials(name || "?")}
    </div>
  );
}
