import { screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PaymentMonitor } from "@/features/admin/payments/paymentMonitor";
import type { AdminPayment, AdminPaymentDetail } from "@/types/adminPayment.type";
import { apiResponse, renderWithQuery } from "./helpers/render";

// TES PEMANTAUAN TRANSAKSI ADMIN: tab status, perlu perhatian, filter di URL, detail + Check status Midtrans
const api = vi.hoisted(() => ({ get: vi.fn(), patch: vi.fn(), post: vi.fn(), delete: vi.fn() }));
const nav = vi.hoisted(() => ({ search: new URLSearchParams(), replace: vi.fn() }));
const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn(), info: vi.fn() }));
vi.mock("@/lib/axios-instance.lib", () => ({ axiosInstance: api }));
vi.mock("react-toastify", () => ({ toast }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: nav.replace, push: vi.fn() }),
  usePathname: () => "/admin/payments",
  useSearchParams: () => nav.search,
}));

const payment = (overrides: Partial<AdminPayment> = {}): AdminPayment => ({
  id: "pay-1",
  method: "QRIS",
  vaBank: null,
  provider: "midtrans",
  amount: 175000,
  paidAmount: null,
  status: "PENDING",
  createdAt: "2026-11-12T12:45:00.000Z",
  paidAt: null,
  expiresAt: "2026-11-12T13:00:00.000Z",
  paidLate: false,
  attention: null,
  order: { code: "PNK-261112-AAAA", status: "MENUNGGU_PEMBAYARAN", total: 175000, user: { name: "Rina", email: "rina@mail.com" } },
  ...overrides,
});
const detail = (overrides: Partial<AdminPaymentDetail> = {}): AdminPaymentDetail => ({
  ...payment(),
  providerRef: "trx-123",
  vaNumber: null,
  updatedAt: "2026-11-12T12:45:00.000Z",
  events: [{ id: "e1", eventType: "pending", payload: { transaction_status: "pending" }, processedAt: "2026-11-12T12:45:01.000Z", createdAt: "2026-11-12T12:45:01.000Z" }],
  ...overrides,
});

const list = [
  payment(),
  payment({
    id: "pay-2",
    method: "VIRTUAL_ACCOUNT",
    vaBank: "bca",
    status: "UNDERPAID",
    paidAmount: 100000,
    attention: "Paid less than the bill",
    order: { code: "PNK-261112-BBBB", status: "MENUNGGU_PEMBAYARAN", total: 175000, user: { name: "Budi", email: "budi@mail.com" } },
  }),
];
const meta = { page: 1, limit: 20, totalPage: 1, totalPayments: 2, statusCounts: { PENDING: 1, UNDERPAID: 1 }, attentionCount: 1 };

describe("PaymentMonitor", () => {
  beforeEach(() => {
    nav.search = new URLSearchParams();
    api.get.mockImplementation(async (url: string) => (url === "/admin/payments" ? apiResponse(list, meta) : apiResponse(detail())));
  });

  it("daftar tagihan: metode, nominal diterima yang berbeda, alasan perlu perhatian", async () => {
    renderWithQuery(<PaymentMonitor />);
    const table = await screen.findByRole("table");
    const rows = within(table).getAllByRole("row");
    expect(within(rows[1]).getByText("PNK-261112-AAAA")).toBeInTheDocument();
    expect(within(rows[1]).getByText("Pending")).toBeInTheDocument();
    expect(within(rows[2]).getByText("BCA Virtual Account")).toBeInTheDocument();
    expect(within(rows[2]).getByText("Received Rp100.000")).toBeInTheDocument();
    expect(within(rows[2]).getByText("Paid less than the bill")).toBeInTheDocument();
  });

  it("tab status menampilkan jumlah & mengubah URL", async () => {
    const { user } = renderWithQuery(<PaymentMonitor />);
    const tabs = await screen.findByRole("tablist", { name: "Payment status" });
    await waitFor(() => expect(within(tabs).getByRole("tab", { name: /^All/ })).toHaveTextContent("2"));
    expect(within(tabs).getByRole("tab", { name: /^All/ })).toHaveAttribute("aria-selected", "true");

    await user.click(within(tabs).getByRole("tab", { name: /^Paid/ }));
    expect(nav.replace).toHaveBeenLastCalledWith("/admin/payments?status=PAID", { scroll: false });
  });

  it("banner 'perlu perhatian' membuka filter attention", async () => {
    const { user } = renderWithQuery(<PaymentMonitor />);
    await user.click(await screen.findByRole("button", { name: /1 payment needs attention/i }));
    expect(nav.replace).toHaveBeenLastCalledWith("/admin/payments?attention=true", { scroll: false });
  });

  it("filter dari URL dikirim ke API (attention jadi 'true', status tidak valid diabaikan)", async () => {
    nav.search = new URLSearchParams("attention=true&status=LUNAS&method=VIRTUAL_ACCOUNT");
    renderWithQuery(<PaymentMonitor />);
    await screen.findByRole("table");
    expect(api.get).toHaveBeenCalledWith("/admin/payments", {
      params: expect.objectContaining({ page: 1, status: undefined, method: "VIRTUAL_ACCOUNT", attention: "true" }),
    });
    // banner disembunyikan saat sudah memfilter attention
    expect(screen.queryByRole("button", { name: /needs attention/i })).not.toBeInTheDocument();
  });

  it("detail: event gateway + Check status (tidak berubah -> info)", async () => {
    api.post.mockResolvedValue(apiResponse({ gatewayStatus: "pending", gatewayMessage: null, changed: false, payment: detail() }));
    const { user } = renderWithQuery(<PaymentMonitor />);
    // tabel desktop & kartu mobile sama-sama ter-render di jsdom -> ambil yang pertama
    await user.click((await screen.findAllByRole("button", { name: "View payment for PNK-261112-AAAA" }))[0]);

    const dialog = await screen.findByRole("dialog");
    expect(await within(dialog).findByText("trx-123")).toBeInTheDocument();
    expect(within(dialog).getByText("Gateway events")).toBeInTheDocument();
    expect(within(dialog).getByRole("link", { name: "PNK-261112-AAAA" })).toHaveAttribute("href", "/admin/orders/PNK-261112-AAAA");

    await user.click(within(dialog).getByRole("button", { name: /check status with midtrans/i }));
    expect(api.post).toHaveBeenCalledWith("/admin/payments/pay-1/check");
    await waitFor(() => expect(toast.info).toHaveBeenCalledWith("Already up to date (Midtrans: pending)."));
  });

  it("Check status mengubah tagihan jadi lunas -> toast sukses & daftar diambil ulang", async () => {
    const paid = detail({ status: "PAID", paidAt: "2026-11-12T12:50:00.000Z", paidAmount: 175000 });
    api.post.mockResolvedValue(apiResponse({ gatewayStatus: "settlement", gatewayMessage: null, changed: true, payment: paid }));
    const { user } = renderWithQuery(<PaymentMonitor />);
    // tabel desktop & kartu mobile sama-sama ter-render di jsdom -> ambil yang pertama
    await user.click((await screen.findAllByRole("button", { name: "View payment for PNK-261112-AAAA" }))[0]);
    const dialog = await screen.findByRole("dialog");
    await within(dialog).findByText("trx-123");
    const listCalls = api.get.mock.calls.filter(([url]) => url === "/admin/payments").length;

    await user.click(within(dialog).getByRole("button", { name: /check status with midtrans/i }));
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Status updated: paid."));
    expect(within(dialog).getByText("Paid")).toBeInTheDocument();
    await waitFor(() => expect(api.get.mock.calls.filter(([url]) => url === "/admin/payments").length).toBeGreaterThan(listCalls));
  });

  it("tagihan test (mock gateway) tidak bisa dicek", async () => {
    api.get.mockImplementation(async (url: string) => (url === "/admin/payments" ? apiResponse(list, meta) : apiResponse(detail({ provider: "mock" }))));
    const { user } = renderWithQuery(<PaymentMonitor />);
    // tabel desktop & kartu mobile sama-sama ter-render di jsdom -> ambil yang pertama
    await user.click((await screen.findAllByRole("button", { name: "View payment for PNK-261112-AAAA" }))[0]);
    const dialog = await screen.findByRole("dialog");
    expect(await within(dialog).findByText("Test payments can't be checked.")).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: /check status with midtrans/i })).toBeDisabled();
  });

  it("tidak ada yang perlu perhatian -> pesan kosong yang sesuai", async () => {
    nav.search = new URLSearchParams("attention=true");
    api.get.mockResolvedValue(apiResponse([], { ...meta, totalPayments: 0, statusCounts: {}, attentionCount: 0 }));
    renderWithQuery(<PaymentMonitor />);
    expect(await screen.findByText("Nothing needs attention")).toBeInTheDocument();
  });
});
