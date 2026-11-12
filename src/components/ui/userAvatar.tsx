import Image from "next/image";

const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");

type UserAvatarProps = {
  name: string;
  src?: string | null;
  size?: number; // px
  className?: string;
};

// foto profil bulat; kalau belum ada foto -> inisial nama di atas warna primary
export function UserAvatar({ name, src, size = 36, className = "" }: UserAvatarProps) {
  return (
    <span
      style={{ width: size, height: size, fontSize: Math.max(12, Math.round(size * 0.36)) }}
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary font-bold text-primary-content ${className}`}
    >
      {src ? (
        <Image
          src={src}
          alt={`${name}'s profile photo`}
          fill
          sizes={`${size}px`}
          // blob: = pratinjau lokal saat upload, tidak bisa dioptimasi next/image
          unoptimized={src.startsWith("blob:")}
          className="object-cover"
        />
      ) : (
        <span aria-hidden="true">{getInitials(name)}</span>
      )}
    </span>
  );
}
