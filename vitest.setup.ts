import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// jsdom belum punya <dialog>.showModal / close -> dibuat sederhana supaya modal bisa diuji
if (typeof HTMLDialogElement !== "undefined" && !HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
}

// next/image -> <img> biasa (optimasi gambar Next tidak jalan di jsdom)
vi.mock("next/image", async () => {
  const { createElement } = await import("react");
  return {
    default: ({ src, alt, className }: { src: string; alt?: string; className?: string }) => createElement("img", { src, alt: alt ?? "", className }),
  };
});

// URL pratinjau foto: versi Node tidak menerima File dari jsdom -> diganti URL palsu
URL.createObjectURL = () => "blob:preview";
URL.revokeObjectURL = () => undefined;
