import axios, { type InternalAxiosRequestConfig } from "axios";

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1",
  // cookie accessToken & refreshToken (httpOnly) ikut terkirim
  withCredentials: true,
});

// endpoint auth yang 401-nya memang berarti gagal (bukan access token kedaluwarsa)
const NO_REFRESH_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/google",
  "/auth/refresh",
  "/auth/logout",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/verify-email",
];

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

// dipakai bersama supaya beberapa request yang 401 bersamaan cukup 1x refresh
let refreshPromise: Promise<unknown> | null = null;

// access token cuma 15 menit -> kalau request kena 401, minta token baru lewat
// POST /auth/refresh (pakai cookie refreshToken) lalu ulangi request aslinya sekali
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as RetryableConfig | undefined;
    const url = original?.url ?? "";

    if (
      error.response?.status !== 401 ||
      !original ||
      original._retry ||
      NO_REFRESH_PATHS.some((path) => url.startsWith(path))
    ) {
      return Promise.reject(error);
    }

    original._retry = true;
    refreshPromise ??= axiosInstance.post("/auth/refresh").finally(() => {
      refreshPromise = null;
    });

    // refresh gagal -> error dilempar ke pemanggil (sesi sudah tidak valid)
    await refreshPromise;
    return axiosInstance(original);
  },
);
