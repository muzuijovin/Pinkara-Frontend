import { screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotificationBell } from "@/features/notifications/notificationBell";
import type { AppNotification } from "@/types/notification.type";
import { apiResponse, renderWithQuery } from "./helpers/render";

// TES LONCENG NOTIFIKASI: angka belum dibaca, daftar, tandai dibaca, mark all read, load more
const api = vi.hoisted(() => ({ get: vi.fn(), patch: vi.fn(), post: vi.fn(), delete: vi.fn() }));
vi.mock("@/lib/axios-instance.lib", () => ({ axiosInstance: api }));

const notification = (overrides: Partial<AppNotification>): AppNotification => ({
  id: "n1",
  type: "ORDER_STATUS",
  title: "Your order is on the way",
  body: "Order PNK-261113-ABCD has been shipped.",
  href: "/orders/PNK-261113-ABCD",
  imageUrl: null,
  createdAt: new Date().toISOString(),
  isRead: false,
  isAnnouncement: false,
  ...overrides,
});

function mockApi({ unread = 2, pages = [[notification({}), notification({ id: "n2", type: "NEW_PRODUCT", title: "New arrival: Pink Roses", isAnnouncement: true, isRead: true })]] } = {}) {
  let page = 0;
  api.get.mockImplementation(async (url: string) => {
    if (url === "/notifications/unread-count") return apiResponse({ unreadCount: unread });
    const notifications = pages[page] ?? [];
    const hasMore = page < pages.length - 1;
    page++;
    return apiResponse({ notifications, unreadCount: unread, hasMore });
  });
  api.patch.mockImplementation(async (url: string) => apiResponse({ unreadCount: url.endsWith("read-all") ? 0 : unread - 1 }));
}

describe("NotificationBell", () => {
  beforeEach(() => mockApi());

  it("menampilkan jumlah belum dibaca di lonceng (untuk pembaca layar juga)", async () => {
    renderWithQuery(<NotificationBell />);
    expect(await screen.findByRole("button", { name: "Notifications, 2 unread" })).toBeInTheDocument();
  });

  it("tanpa notifikasi belum dibaca: tanpa angka", async () => {
    mockApi({ unread: 0, pages: [[]] });
    renderWithQuery(<NotificationBell />);
    await waitFor(() => expect(api.get).toHaveBeenCalledWith("/notifications/unread-count"));
    expect(screen.getByRole("button", { name: "Notifications" })).toBeInTheDocument();
  });

  it("daftar hanya diambil saat dibuka; item belum dibaca diberi tanda & link ke halamannya", async () => {
    const { user } = renderWithQuery(<NotificationBell />);
    const bell = await screen.findByRole("button", { name: /notifications/i });
    expect(api.get).not.toHaveBeenCalledWith("/notifications", expect.anything());

    await user.click(bell);
    expect(bell).toHaveAttribute("aria-expanded", "true");
    const link = await screen.findByRole("link", { name: /your order is on the way/i });
    expect(link).toHaveAttribute("href", "/orders/PNK-261113-ABCD");
    expect(within(link).getByText("Unread")).toBeInTheDocument();
    expect(screen.getByText(/announcement/i)).toBeInTheDocument();
  });

  it("klik notifikasi belum dibaca -> PATCH /:id/read & angka berkurang", async () => {
    const { user } = renderWithQuery(<NotificationBell />);
    await user.click(await screen.findByRole("button", { name: /notifications/i }));
    await user.click(await screen.findByRole("link", { name: /your order is on the way/i }));

    expect(api.patch).toHaveBeenCalledWith("/notifications/n1/read");
    expect(await screen.findByRole("button", { name: "Notifications, 1 unread" })).toBeInTheDocument();
  });

  it("Mark all read -> semua tanda hilang & angka jadi 0", async () => {
    const { user } = renderWithQuery(<NotificationBell />);
    await user.click(await screen.findByRole("button", { name: /notifications/i }));
    await screen.findByRole("link", { name: /your order is on the way/i });

    await user.click(screen.getByRole("button", { name: /mark all read/i }));
    expect(api.patch).toHaveBeenCalledWith("/notifications/read-all");
    await waitFor(() => expect(screen.queryByText("Unread")).not.toBeInTheDocument());
    expect(screen.getByRole("button", { name: "Notifications" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /mark all read/i })).toBeDisabled();
  });

  it("Load more memakai cursor createdAt notifikasi terakhir", async () => {
    const last = notification({ id: "n2", title: "Payment received", createdAt: "2026-11-12T10:00:00.000Z" });
    mockApi({ pages: [[notification({}), last], [notification({ id: "n3", title: "Order completed", isRead: true })]] });
    const { user } = renderWithQuery(<NotificationBell />);
    await user.click(await screen.findByRole("button", { name: /notifications/i }));

    await user.click(await screen.findByRole("button", { name: /load more/i }));
    expect(await screen.findByText("Order completed")).toBeInTheDocument();
    expect(api.get).toHaveBeenLastCalledWith("/notifications", { params: { limit: 10, before: last.createdAt } });
    expect(screen.queryByRole("button", { name: /load more/i })).not.toBeInTheDocument();
  });

  it("kosong -> pesan 'all caught up'; Esc menutup panel", async () => {
    mockApi({ unread: 0, pages: [[]] });
    const { user } = renderWithQuery(<NotificationBell />);
    const bell = await screen.findByRole("button", { name: /notifications/i });
    await user.click(bell);
    expect(await screen.findByText("You're all caught up")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(bell).toHaveAttribute("aria-expanded", "false");
  });
});
