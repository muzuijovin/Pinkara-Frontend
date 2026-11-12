import Link from "next/link";
import { PiCaretRight, PiCheckCircleFill, PiCircle } from "react-icons/pi";
import type { Address, Profile } from "@/types/profile.type";
import { AvatarUploader } from "./avatarUploader";

// kartu kiri: foto, nama, email + checklist kelengkapan profil.
// item yang belum lengkap bisa diklik -> langsung ke bagian yang perlu diisi
export function ProfileSummary({ profile, addresses }: { profile: Profile; addresses?: Address[] }) {
  const checklist = [
    { label: "Profile photo", done: Boolean(profile.avatarUrl), href: null },
    { label: "Phone number", done: Boolean(profile.phone), href: "/profile?tab=personal" },
    { label: "Verified email", done: Boolean(profile.emailVerifiedAt), href: "/profile?tab=personal" },
    { label: "Shipping address", done: Boolean(addresses?.length), href: "/profile?tab=addresses" },
  ];
  const doneCount = checklist.filter((item) => item.done).length;
  const isComplete = doneCount === checklist.length;

  return (
    <section aria-label="Profile summary" className="card border border-base-300 bg-base-100 lg:sticky lg:top-24">
      <div className="card-body gap-5 p-6">
        <AvatarUploader profile={profile}>
          <div className="text-center">
            <p className="wrap-break-word text-lg font-semibold text-ink">{profile.name}</p>
            <p className="break-all text-sm text-ink-muted">{profile.email}</p>
            {profile.role === "ADMIN" && (
              <span className="badge badge-sm mt-2 border-none bg-accent-soft text-accent-text">Admin</span>
            )}
          </div>
        </AvatarUploader>

        <div className="border-t border-base-300 pt-5">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-ink">
              {isComplete ? "Your profile is complete" : "Complete your profile"}
            </span>
            <span className="tabular-nums text-ink-muted">
              {doneCount}/{checklist.length}
            </span>
          </div>
          <progress
            className="progress progress-primary h-1.5 w-full"
            value={doneCount}
            max={checklist.length}
            aria-label={`Profile completion: ${doneCount} of ${checklist.length}`}
          />

          <ul className="mt-3 flex flex-col">
            {checklist.map((item) => {
              const content = (
                <>
                  {item.done ? (
                    <PiCheckCircleFill aria-hidden="true" size={18} className="shrink-0 text-success-text" />
                  ) : (
                    <PiCircle aria-hidden="true" size={18} className="shrink-0 text-ink-muted" />
                  )}
                  <span className={`flex-1 ${item.done ? "text-ink-muted line-through" : "text-ink"}`}>
                    {item.label}
                  </span>
                  <span className="sr-only">{item.done ? "(done)" : "(to do)"}</span>
                </>
              );

              return (
                <li key={item.label}>
                  {!item.done && item.href ? (
                    <Link
                      href={item.href}
                      scroll={false}
                      className="flex min-h-10 items-center gap-2.5 rounded-lg px-2 text-sm transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-primary"
                    >
                      {content}
                      <PiCaretRight aria-hidden="true" size={14} className="text-ink-muted" />
                    </Link>
                  ) : (
                    <div className="flex min-h-10 items-center gap-2.5 px-2 text-sm">{content}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
