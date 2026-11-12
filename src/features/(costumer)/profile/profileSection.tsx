"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PiIdentificationCard, PiMapPinLine, PiShieldCheck } from "react-icons/pi";
import { FormAlert } from "@/components/form/formAlert";
import { getErrorMessage } from "@/lib/error.lib";
import { AddressList } from "./components/addressList";
import { LogoutAllCard } from "./components/logoutAllCard";
import { ProfileForm } from "./components/profileForm";
import { ProfileSummary } from "./components/profileSummary";
import { UpdatePasswordForm } from "./components/updatePasswordForm";
import { useAddresses } from "./hooks/useAddresses";
import { useProfile } from "./hooks/useProfile";

// tab disimpan di URL (?tab=alamat) supaya bisa dibagikan / tombol back berfungsi
const TABS = [
  { key: "personal", label: "Personal Info", icon: PiIdentificationCard },
  { key: "addresses", label: "Addresses", icon: PiMapPinLine },
  { key: "security", label: "Security", icon: PiShieldCheck },
] as const;

type TabKey = (typeof TABS)[number]["key"];

// halaman Profil Saya: ringkasan + tab Data Diri / Alamat / Keamanan
export function ProfileSection() {
  const tabParam = useSearchParams().get("tab");
  const activeTab: TabKey = TABS.some((tab) => tab.key === tabParam) ? (tabParam as TabKey) : "personal";
  const { data: profile, isPending, error, refetch } = useProfile();
  const { data: addresses } = useAddresses();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 md:py-10">
      <h1 className="text-2xl font-bold text-ink md:text-3xl">My Profile</h1>
      <p className="mt-1 text-sm text-ink-muted">Manage your personal info, shipping addresses, and account security.</p>

      {isPending && (
        <div aria-busy="true" className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="skeleton h-96 w-full" />
          <div className="skeleton h-96 w-full" />
        </div>
      )}

      {error && (
        <div className="mt-6 flex flex-col gap-3">
          <FormAlert message={getErrorMessage(error, "Couldn't load your profile.")} />
          <button type="button" onClick={() => refetch()} className="btn btn-outline btn-sm self-start">
            Try again
          </button>
        </div>
      )}

      {profile && (
        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[300px_1fr] lg:gap-8">
          <ProfileSummary profile={profile} addresses={addresses} />

          <div className="flex min-w-0 flex-col gap-5">
            {/* tiap tab = link ke URL sendiri, jadi pakai semantik navigasi (aria-current).
                Gaya sama dengan navbar: aktif = garis primary di bawah, warna teks tidak berubah */}
            {/* garis dasar pakai inset shadow (bukan border + -mb-px) supaya tidak ada isi yang
                meluber 1px -> tidak muncul scrollbar. Di HP tab tetap bisa digeser, scrollbar disembunyikan */}
            <nav
              aria-label="Profile sections"
              className="flex overflow-x-auto overflow-y-hidden shadow-[inset_0_-1px_0_var(--color-base-300)] scrollbar-none [&::-webkit-scrollbar]:hidden"
            >
              {TABS.map(({ key, label, icon: Icon }) => {
                const active = activeTab === key;
                return (
                  <Link
                    key={key}
                    href={`/profile?tab=${key}`}
                    scroll={false}
                    aria-current={active ? "page" : undefined}
                    className={`inline-flex h-12 shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-4 text-[15px] transition-colors duration-200 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary ${
                      active
                        ? "border-primary font-semibold text-ink"
                        : "border-transparent text-ink-muted hover:border-base-300 hover:text-ink"
                    }`}
                  >
                    <Icon aria-hidden="true" size={18} className="shrink-0" />
                    {label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex flex-col gap-6">
              {activeTab === "personal" && <ProfileForm profile={profile} />}
              {activeTab === "addresses" && <AddressList />}
              {activeTab === "security" && (
                <>
                  <UpdatePasswordForm hasPassword={profile.hasPassword} />
                  <LogoutAllCard />
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
