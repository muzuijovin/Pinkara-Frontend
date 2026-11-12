import { useEffect, useState } from "react";

// Sisa waktu (ms) sampai expiresAt, dihitung dengan JAM SERVER (PRD §9): selisih jam server vs perangkat
// diambil sekali dari serverTime, jadi hitung mundur tetap benar walau jam HP pembeli salah.
// useEffect di sini hanya untuk timer per detik, bukan untuk fetch data
export function useCountdown(expiresAt: string, serverTime: string) {
  const [offset] = useState(() => new Date(serverTime).getTime() - Date.now());
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  return Math.max(0, new Date(expiresAt).getTime() - (now + offset));
}

// 905000 -> "15:05", 86_400_000 -> "24:00:00"
export function formatCountdown(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (value: number) => String(value).padStart(2, "0");
  return hours > 0 ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
}
