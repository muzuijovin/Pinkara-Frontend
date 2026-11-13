import { screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminSidebar } from "@/features/admin/layout/adminSidebar";
import { apiResponse, renderWithQuery } from "./helpers/render";

// TES ANGKA NOTIFIKASI DI MENU ADMIN: pesanan baru, custom belum dibalas, pembayaran perlu dicek
const api = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@/lib/axios-instance.lib", () => ({ axiosInstance: api }));
const nav = vi.hoisted(() => ({ pathname: "/admin" }));
vi.mock("next/navigation", () => ({ usePathname: () => nav.pathname }));

// sidebar desktop (aside) — versi HP berisi menu yang sama
const desktopNav = () => within(screen.getByRole("complementary", { name: "Admin navigation" }));

beforeEach(() => {
  nav.pathname = "/admin";
  api.get.mockResolvedValue(apiResponse({ orders: 3, orderRefunds: 2, customRequests: 120, payments: 0 }));
});

describe("AdminSidebar – angka notifikasi", () => {
  it("angka tampil di Orders & Custom requests (maks 99+), Payments 0 tanpa angka", async () => {
    renderWithQuery(<AdminSidebar />);
    expect(await desktopNav().findByRole("link", { name: /Orders, 3 new paid orders/ })).toHaveAttribute("href", "/admin/orders");
    expect(desktopNav().getByRole("link", { name: /Custom requests, 120 requests waiting for your reply/ })).toBeInTheDocument();
    expect(desktopNav().getByText("99+")).toBeInTheDocument();
    expect(desktopNav().getByRole("link", { name: "Payments" })).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith("/admin/dashboard/badges");
  });

  it("Orders: angka merah terpisah untuk pembatalan & refund", async () => {
    renderWithQuery(<AdminSidebar />);
    const orders = await desktopNav().findByRole("link", { name: /Orders, 3 new paid orders, 2 cancelled orders to refund/ });
    const refundBadge = within(orders).getByText("2").parentElement!;
    expect(refundBadge).toHaveClass("bg-danger-text");
  });

  it("menu yang sedang dibuka -> angkanya disembunyikan", async () => {
    nav.pathname = "/admin/orders";
    renderWithQuery(<AdminSidebar />);
    expect(await desktopNav().findByRole("link", { name: /Custom requests, 120/ })).toBeInTheDocument();
    const orders = desktopNav().getByRole("link", { name: "Orders" });
    expect(orders).toHaveAttribute("aria-current", "page");
    expect(within(orders).queryByText("3")).not.toBeInTheDocument();
    expect(within(orders).queryByText("2")).not.toBeInTheDocument();
  });

  it("gagal memuat angka -> menu tetap tampil tanpa angka", async () => {
    api.get.mockRejectedValue(new Error("offline"));
    renderWithQuery(<AdminSidebar />);
    expect(desktopNav().getByRole("link", { name: "Orders" })).toBeInTheDocument();
    expect(desktopNav().queryByText("3")).not.toBeInTheDocument();
  });
});
