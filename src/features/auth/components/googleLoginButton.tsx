"use client";

import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { toast } from "react-toastify";
import { getErrorMessage } from "@/lib/error.lib";
import { useGoogleLogin } from "../hooks/useGoogleLogin";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

// lebar tombol Google harus angka px (maks 400). Ikuti lebar kartu auth (maks 384px),
// di HP dikurangi gutter + padding kartu supaya tidak meluber
const getButtonWidth = () =>
  typeof window === "undefined" ? 384 : Math.max(200, Math.min(384, window.innerWidth - 80));

// logo Google dari contoh tombol login daisyUI (dipakai di tombol nonaktif saat dev)
function GoogleLogo() {
  return (
    <svg aria-hidden="true" width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      <g>
        <path d="m0 0H512V512H0" fill="#fff" />
        <path fill="#34a853" d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341" />
        <path fill="#4285f4" d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57" />
        <path fill="#fbbc02" d="m90 341a208 200 0 010-171l63 49q-12 37 0 73" />
        <path fill="#ea4335" d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55" />
      </g>
    </svg>
  );
}

// Tombol resmi Google Identity Services (gaya outline putih, mirip tombol daisyUI).
// Harus tombol resmi & terlihat: BE (POST /auth/google) butuh ID token, dan Google
// menolak klik pada tombol yang disembunyikan/ditumpuk transparan (proteksi clickjacking).
export function GoogleLoginButton() {
  const { mutate, isPending } = useGoogleLogin();

  if (!GOOGLE_CLIENT_ID) {
    // production: sembunyikan. development: tampilkan tombol nonaktif supaya ketahuan env-nya kosong
    if (process.env.NODE_ENV !== "development") return null;
    return (
      <div className="flex flex-col gap-2">
        <button type="button" disabled className="btn h-11 w-full text-[15px]">
          <GoogleLogo />
          Continue with Google
        </button>
        <p className="text-xs text-danger-text">
          [dev] Set NEXT_PUBLIC_GOOGLE_CLIENT_ID in .env, then restart `npm run dev`.
        </p>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID} locale="en">
      <div className="flex flex-col gap-4">
        <div className="relative flex min-h-11 justify-center">
          <GoogleLogin
            onSuccess={({ credential }) => {
              if (!credential) {
                toast.error("Google sign-in failed. Please try again.");
                return;
              }
              mutate(credential, {
                onSuccess: (user) => toast.success(`Welcome, ${user.name}!`),
                onError: (error) => toast.error(getErrorMessage(error, "Google sign-in failed. Please try again.")),
              });
            }}
            onError={() => {
              toast.error("Google sign-in was cancelled or failed.");
            }}
            theme="outline"
            size="large"
            shape="rectangular"
            text="continue_with"
            logo_alignment="center"
            width={String(getButtonWidth())}
          />

          {/* selama BE memproses ID token: tombol Google ditutup penuh (solid, bukan transparan,
              supaya teks "Lanjutkan sebagai ..." tidak tembus) + spinner, cegah klik dobel */}
          {isPending && (
            <div
              role="status"
              className="absolute inset-0 z-10 flex items-center justify-center gap-2 rounded border border-[#dadce0] bg-base-100 text-sm font-medium text-ink"
            >
              <span aria-hidden="true" className="loading loading-spinner loading-sm text-primary" />
              Connecting to Google...
            </div>
          )}
        </div>

        <div className="divider my-0 text-xs text-ink-muted">or continue with email</div>
      </div>
    </GoogleOAuthProvider>
  );
}
