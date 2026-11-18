# Pinkara Studio — Frontend

Website toko bunga **Pinkara Studio** (Malang, Jawa Timur): katalog, belanja *ready stock*, pesanan **custom** lewat diskusi dengan florist, pembayaran otomatis (QRIS / virtual account), ongkir otomatis ke seluruh Indonesia, dan panel admin.

Repo ini berisi **frontend** (Next.js). Backend ada di repo terpisah **Pinkara-Backend** (Express + Prisma).

| | Alamat |
| --- | --- |
| Website (staging) | https://pinkara-studio.vercel.app |
| API backend | https://pinkara-backend.vercel.app/api/v1 |

## Daftar Isi

- [Tech Stack](#tech-stack)
- [Menjalankan di Lokal](#menjalankan-di-lokal)
- [Environment Variables](#environment-variables)
- [Script](#script)
- [Fitur](#fitur)
- [Daftar Halaman](#daftar-halaman)
- [Struktur Folder](#struktur-folder)
- [Konvensi Kode](#konvensi-kode)
- [Konten yang Sering Diubah](#konten-yang-sering-diubah)
- [Testing](#testing)
- [Deploy ke Vercel](#deploy-ke-vercel)

## Tech Stack

| Kebutuhan | Library |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack, `cacheComponents`, React Compiler), React 19, TypeScript |
| Styling | Tailwind CSS v4 + daisyUI 5 (tema `pinkara`), ikon Phosphor (`react-icons/pi`) |
| Data fetching | TanStack Query v5 + Axios |
| Form & validasi | React Hook Form + Zod 4 |
| State global | Zustand |
| Peta | Leaflet + React Leaflet (OpenStreetMap), pencarian lokasi Nominatim |
| Lainnya | Google login (`@react-oauth/google`), `qrcode.react` (QRIS), date-fns, react-toastify, use-debounce |
| Testing | Vitest, Testing Library, jsdom |

## Menjalankan di Lokal

**Prasyarat:** Node.js 20+, npm, dan backend **Pinkara-Backend** sudah berjalan (default `http://localhost:8000`).

```bash
# 1. install dependency
npm install

# 2. buat file .env di root project (lihat tabel Environment Variables)

# 3. jalankan development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

## Environment Variables

Buat file `.env` di root project (contoh di `.env.example`):

| Variable | Contoh | Keterangan |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8000/api/v1` | Alamat API. Lokal: langsung ke backend. Online: `/api/v1` (lewat proxy) |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | `xxxx.apps.googleusercontent.com` | OAuth Client ID Google, sama dengan `GOOGLE_CLIENT_ID` di backend |
| `API_PROXY_TARGET` | `https://pinkara-backend.vercel.app` | **Hanya online.** Kalau diisi, `/api/v1/*` diteruskan ke backend (lihat [Deploy](#deploy-ke-vercel)). Lokal dikosongkan |

## Script

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Build production |
| `npm run start` | Menjalankan hasil build |
| `npm run lint` | Cek ESLint |
| `npm test` | Menjalankan semua test sekali |
| `npm run test:watch` | Test mode pantau (jalan ulang otomatis saat file disimpan) |
| `npx tsc --noEmit` | Cek error TypeScript |

## Fitur

### Publik (tanpa login)

- **Beranda**: hero, kategori, produk unggulan, galeri karya studio, langkah pemesanan.
- **Bar pengumuman** berjalan di bawah navbar (bisa di-pause, diam otomatis untuk pengguna *reduce motion*).
- **Katalog**: filter kategori, tipe (ready / custom), harga, ketersediaan; pencarian & urutan. Filter tersimpan di URL.
- **Detail produk**: galeri foto, varian (harga & stok sendiri), add-on (box, paper bag, gift card), produk terkait.
- **Custom order**: penjelasan alur pesanan custom.
- **About, Blog, Privacy Policy**.

### Pembeli (wajib login)

- **Akun**: daftar & login (email atau Google), verifikasi email, lupa / reset password, profil & foto profil.
- **Alamat**: kecamatan dari daftar resmi kurir, pin peta + pencarian lokasi.
- **Keranjang & checkout**: ongkir JNE / J&T otomatis atau ambil di studio, kode promo.
- **Pembayaran**: QRIS / virtual account langsung tampil setelah checkout, dengan hitung mundur.
- **Pesanan saya**: status & nomor resi, pembatalan dengan refund 50% ke rekening pembeli.
- **Custom request**: brief + foto referensi, chat dengan florist, terima penawaran & bayar.
- **Notifikasi** di navbar.

### Admin

- **Dashboard**: omzet, pesanan, rata-rata nilai pesanan, daftar "perlu tindakan", stok menipis, kuota promo.
- **Pesanan, custom request, pembayaran**: kelola status, resi, refund, chat & penawaran custom.
- **Produk, kategori, add-on, galeri**: tambah / ubah / hapus, foto ke Cloudinary.
- **Audit log** semua perubahan penting.
- **Angka merah di sidebar** untuk pesanan / pesan baru (hilang setelah halamannya dibuka).

## Daftar Halaman

| Grup | Route |
| --- | --- |
| Publik `(public)` | `/`, `/products`, `/products/[slug]`, `/custom-order`, `/about`, `/blog`, `/blog/[slug]`, `/privacy` |
| Auth `(auth)` | `/login`, `/register`, `/verify-email`, `/forgot-password`, `/reset-password` |
| Pembeli `(costumer)` | `/cart`, `/checkout`, `/orders`, `/orders/[code]`, `/orders/[code]/payment`, `/custom-requests`, `/custom-requests/new`, `/custom-requests/[id]`, `/profile?tab=personal\|addresses\|security` |
| Admin `admin/` | `/admin`, `/admin/orders`, `/admin/orders/[code]`, `/admin/custom-requests`, `/admin/custom-requests/[id]`, `/admin/payments`, `/admin/products` (+ `create`, `[id]/edit`, `trash`), `/admin/categories`, `/admin/addons` (+ `create`, `[id]/edit`), `/admin/gallery`, `/admin/audit-logs` |

Halaman `(costumer)` dan `admin/` dijaga oleh `src/hoc/authGuard.tsx`: belum login diarahkan ke `/login?redirect=<halaman>`, dan admin tidak bisa membuka halaman belanja.

## Struktur Folder

```
src/
├── app/                  # Routing (App Router). page.tsx dibuat setipis mungkin: metadata + panggil fitur
│   ├── (public)/         # tanpa login
│   ├── (auth)/           # login, register, verifikasi & reset password
│   ├── (costumer)/       # wajib login sebagai pembeli
│   ├── admin/            # khusus admin
│   ├── layout.tsx        # root layout + provider
│   └── globals.css       # Tailwind, tema daisyUI "pinkara", token warna
├── features/<grup>/<fitur>/
│   ├── <fitur>.tsx       # komponen utama fitur
│   ├── components/       # komponen pendukung
│   ├── hooks/            # React Query (useQuery / useMutation)
│   ├── constants/, utils/
├── features/validation/  # skema Zod form (*Schema.ts)
├── components/           # UI bersama: form/, layout/ (navbar, footer), product/, ui/
├── hoc/authGuard.tsx     # penjaga route login & role
├── lib/                  # axios instance, format rupiah & tanggal, pesan error
├── providers/            # QueryProvider, ToastProvider
├── config/               # data studio (site.ts), kredit foto Unsplash
├── types/                # tipe data respons API (*.type.ts)
└── __tests__/            # test komponen & helper
```

## Konvensi Kode

- **Data dari API selalu lewat React Query** (`useQuery` / `useMutation`), tidak pakai `useEffect` untuk fetch.
- **Form** pakai React Hook Form + skema Zod di `features/validation/`.
- **Teks UI dalam Bahasa Inggris**; komentar kode dalam Bahasa Indonesia.
- **Next.js 16 + `cacheComponents`**: komponen yang memakai `useSearchParams` / `usePathname` dibungkus `<Suspense>`; `params` pada page adalah Promise.
- **Warna lewat token** di `globals.css` (`bg-footer`, `text-ink`, `text-accent-text`, dst), bukan hex langsung di komponen. Kontras teks minimal WCAG AA 4.5:1.
- **Git**: branch per fitur (`feat/…`, `fix/…`) → Pull Request → `main`, pesan commit gaya *conventional commits*.

## Konten yang Sering Diubah

| Yang diubah | File |
| --- | --- |
| Kontak toko (WhatsApp, email, Instagram, jam buka, alamat) | `src/config/site.ts` |
| Logo metode bayar & kurir di footer | `src/config/site.ts` (`PAYMENT_METHODS`, `SHIPPING_PARTNERS`) |
| Isi bar pengumuman di bawah navbar | `src/features/announcement/constants/announcements.ts` (array kosong = bar disembunyikan) |
| Artikel blog | `src/features/(public)/blog/articles.ts` |
| Kredit foto Unsplash sementara | `src/config/photoCredits.ts` |

## Testing

```bash
npm test                                         # semua test (±30 detik)
npx vitest run src/__tests__/announcementBar.test.tsx   # satu file
```

- Test ada di `src/__tests__/*.test.ts(x)`; API ditiru dengan `vi.mock("@/lib/axios-instance.lib")`, jadi tidak butuh backend.
- `renderWithQuery` di `src/__tests__/helpers/render.tsx` menyiapkan React Query baru untuk tiap test.
- Di Windows jalankan dari **PowerShell**. Git Bash dengan huruf drive kecil bisa memunculkan error `Failed to find the current suite`.

## Deploy ke Vercel

1. Import repo ke Vercel (framework terdeteksi otomatis sebagai Next.js).
2. Isi Environment Variables:
   - `API_PROXY_TARGET` = URL backend, mis. `https://pinkara-backend.vercel.app`
   - `NEXT_PUBLIC_API_BASE_URL` = `/api/v1`
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID` = Client ID Google
3. Deploy. Setelah env diubah, **redeploy** supaya nilai `NEXT_PUBLIC_*` ikut ter-build.
4. Tambahkan domain frontend ke **Authorized JavaScript origins** di Google Cloud Console (login Google) dan ke `ALLOWED_ORIGINS` di backend.

**Kenapa lewat proxy?** Browser memanggil `https://pinkara-studio.vercel.app/api/v1/...` lalu Vercel meneruskannya ke backend. Cookie login jadi milik domain frontend sendiri, sehingga tidak diblokir Safari / browser HP yang memblokir cookie pihak ketiga.
