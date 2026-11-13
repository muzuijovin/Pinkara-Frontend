import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PaymentPanel } from "@/features/(costumer)/orders/components/paymentPanel";
import type { OrderDetail, OrderPayment } from "@/types/order.type";
import { apiResponse, renderWithQuery } from "./helpers/render";

// TES HALAMAN BAYAR: panel uji sandbox Midtrans (link simulator + cek status) & tombol simulasi mode mock
const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
vi.mock("@/lib/axios-instance.lib", () => ({ axiosInstance: api }));
const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn(), info: vi.fn() }));
vi.mock("react-toastify", () => ({ toast }));

const payment = (overrides: Partial<OrderPayment> = {}): OrderPayment => ({
  id: "pay-1",
  method: "QRIS",
  provider: "midtrans",
  status: "PENDING",
  qrString: "00020101021226",
  vaNumber: null,
  vaBank: null,
  amount: 542500,
  expiresAt: "2026-11-13T09:01:00.000Z",
  paidAt: null,
  sandbox: {
    simulatorUrl: "https://simulator.sandbox.midtrans.com/v2/qris/index",
    qrImageUrl: "https://api.sandbox.midtrans.com/v2/qris/trx-123/qr-code",
  },
  ...overrides,
});

const order = (p: OrderPayment) => ({ code: "PNK-261113-AB12", status: "MENUNGGU_PEMBAYARAN", payment: p }) as unknown as OrderDetail;

// clipboard: userEvent.setup() memasang clipboard tiruan -> isinya dibaca lewat readText()
beforeEach(() => vi.clearAllMocks());

describe("PaymentPanel – sandbox Midtrans", () => {
  it("QRIS: salin link gambar QR + link simulator QRIS (tab baru)", async () => {
    const { user } = renderWithQuery(<PaymentPanel order={order(payment())} />);
    expect(screen.getByRole("heading", { name: /sandbox test/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Copy link" }));
    expect(await navigator.clipboard.readText()).toBe("https://api.sandbox.midtrans.com/v2/qris/trx-123/qr-code");

    const link = screen.getByRole("link", { name: /midtrans qris simulator/i });
    expect(link).toHaveAttribute("href", "https://simulator.sandbox.midtrans.com/v2/qris/index");
    expect(link).toHaveAttribute("target", "_blank");
    expect(screen.queryByRole("button", { name: /simulate successful payment/i })).not.toBeInTheDocument();
  });

  it("VA: salin nomor VA + simulator bank", async () => {
    const va = payment({
      method: "VIRTUAL_ACCOUNT",
      qrString: null,
      vaNumber: "12345678901",
      vaBank: "bca",
      sandbox: { simulatorUrl: "https://simulator.sandbox.midtrans.com/bca/va/index", qrImageUrl: null },
    });
    const { user } = renderWithQuery(<PaymentPanel order={order(va)} />);
    expect(screen.getByRole("link", { name: /midtrans bca simulator/i })).toHaveAttribute("href", "https://simulator.sandbox.midtrans.com/bca/va/index");
    await user.click(screen.getByRole("button", { name: "Copy number" }));
    expect(await navigator.clipboard.readText()).toBe("12345678901");
  });

  it("Check payment status: lunas -> toast sukses; belum -> info", async () => {
    api.post.mockResolvedValueOnce(apiResponse(order(payment({ status: "PAID" })))).mockResolvedValueOnce(apiResponse(order(payment())));
    const { user } = renderWithQuery(<PaymentPanel order={order(payment())} />);

    await user.click(screen.getByRole("button", { name: /check payment status/i }));
    expect(api.post).toHaveBeenCalledWith("/payments/pay-1/refresh");
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Test payment received."));

    await user.click(screen.getByRole("button", { name: /check payment status/i }));
    await waitFor(() => expect(toast.info).toHaveBeenCalledWith(expect.stringContaining("Not paid yet")));
  });

  it("production (sandbox null) -> tidak ada panel uji", () => {
    renderWithQuery(<PaymentPanel order={order(payment({ sandbox: null }))} />);
    expect(screen.queryByRole("heading", { name: /sandbox test/i })).not.toBeInTheDocument();
  });
});

describe("PaymentPanel – mode mock", () => {
  it("tombol simulasi bayar tetap ada, tanpa panel sandbox", async () => {
    api.post.mockResolvedValue(apiResponse(order(payment({ provider: "mock", sandbox: null, status: "PAID" }))));
    const { user } = renderWithQuery(<PaymentPanel order={order(payment({ provider: "mock", sandbox: null }))} />);
    expect(screen.queryByRole("heading", { name: /sandbox test/i })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /simulate successful payment/i }));
    expect(api.post).toHaveBeenCalledWith("/payments/pay-1/simulate");
  });
});
