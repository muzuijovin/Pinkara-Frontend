import { useEffect } from "react";

// peringatan bawaan browser "Leave site? Changes you made may not be saved"
// saat tab ditutup / di-refresh selagi form masih ada perubahan (PRD §12.1b).
// useEffect di sini untuk memasang event listener browser, bukan untuk fetch data
export function useUnsavedChangesWarning(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [enabled]);
}
