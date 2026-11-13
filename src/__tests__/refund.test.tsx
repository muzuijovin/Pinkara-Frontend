import { screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CancelOrderButton } from "@/features/(costumer)/orders/components/cancelOrderDialog";
import { RefundPanel } from "@/features/(costumer)/orders/components/refundPanel";
import { CancellationCard } from "@/features/admin/orders/components/cancellationCard";
import { OrderActions } from "@/features/admin/orders/components/orderActions";
import type { AdminOrderDetail, OrderDetail } from "@/types/order.type";
import { apiResponse, renderWithQuery } from "./helpers/render";

// TES REFUND: pembeli membatalkan (refund 50%), rekening tujuan refund, bukti refund; admin mencatat refund + bukti
const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn() }));
vi.mock("@/lib/axios-instance.lib", () => ({ axiosInstance: api }));
const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn(), info: vi.fn() }));
vi.mock("react-toastify", () => ({ toast }));

const order = (overrides: Partial<OrderDetail> = {}) =>
  ({
    code: "PNK-261114-AB12",
    status: "DIBAYAR",
    total: 300000,
    shipRecipientName: "Rina Putri",
    cancelledAt: null,
    cancelReason: null,
    cancelledBy: null,
    refundDue: null,
    refundAmount: null,
    refundedAt: null,
    refundProofUrl: null,
    refundBankName: null,
    refundAccountNumber: null,
    refundAccountName: null,
    refundAccountAt: null,
    canCancel: true,
    cancelRefundPercent: 50,
    cancelRefundAmount: 150000,
    refundExpected: null,
    ...overrides,
  }) as OrderDetail;

const refundPending = (overrides: Partial<OrderDetail> = {}) =>
  order({ status: "PERLU_REFUND", canCancel: false, cancelledBy: "CUSTOMER", refundDue: 150000, refundExpected: 150000, ...overrides });

beforeEach(() => {
  api.post.mockResolvedValue(apiResponse(refundPending()));
  api.put.mockResolvedValue(apiResponse(refundPending({ refundBankName: "BCA", refundAccountNumber: "1234567890", refundAccountName: "Rina Putri" })));
});

describe("Batalkan pesanan (pembeli)", () => {
  it("dialog menjelaskan refund 50% & nominalnya; alasan wajib; konfirmasi -> POST cancel", async () => {
    const { user } = renderWithQuery(<CancelOrderButton order={order()} />);
    await user.click(screen.getByRole("button", { name: /cancel order/i }));

    const dialog = within(screen.getByRole("dialog", { name: "Cancel this order?" }));
    expect(dialog.getByText("50%")).toBeInTheDocument();
    expect(dialog.getByText("Rp150.000")).toBeInTheDocument();

    await user.click(dialog.getByRole("button", { name: "Cancel order" }));
    expect(await dialog.findByText("Please tell us why you're cancelling")).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();

    await user.type(dialog.getByRole("textbox", { name: /why are you cancelling/i }), "My plans changed");
    await user.click(dialog.getByRole("button", { name: "Cancel order" }));
    await waitFor(() => expect(api.post).toHaveBeenCalledWith("/orders/PNK-261114-AB12/cancel", { reason: "My plans changed" }));
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Your order has been cancelled."));
  });

  it("'Keep my order' menutup dialog tanpa membatalkan", async () => {
    const { user } = renderWithQuery(<CancelOrderButton order={order()} />);
    await user.click(screen.getByRole("button", { name: /cancel order/i }));
    await user.click(screen.getByRole("button", { name: "Keep my order" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });
});

describe("Panel refund (pembeli)", () => {
  it("menunggu refund tanpa rekening: nominal 50%, isi rekening (validasi nomor) -> PUT refund-account", async () => {
    const { user } = renderWithQuery(<RefundPanel order={refundPending()} />);
    expect(screen.getByText("We'll refund").nextElementSibling).toHaveTextContent("Rp150.000");
    expect(screen.getByText(/50% of your payment/)).toBeInTheDocument();
    // nama pemilik rekening terisi dari nama penerima
    expect(screen.getByRole("textbox", { name: /account holder name/i })).toHaveValue("Rina Putri");

    await user.type(screen.getByRole("combobox", { name: /bank/i }), "BCA");
    await user.type(screen.getByRole("textbox", { name: /account number/i }), "12ab");
    await user.click(screen.getByRole("button", { name: "Save bank details" }));
    expect(await screen.findByText("Account number must be 6-20 digits")).toBeInTheDocument();
    expect(api.put).not.toHaveBeenCalled();

    await user.clear(screen.getByRole("textbox", { name: /account number/i }));
    await user.type(screen.getByRole("textbox", { name: /account number/i }), "1234 5678-90");
    await user.click(screen.getByRole("button", { name: "Save bank details" }));
    await waitFor(() =>
      expect(api.put).toHaveBeenCalledWith("/orders/PNK-261114-AB12/refund-account", { bankName: "BCA", accountNumber: "1234 5678-90", accountName: "Rina Putri" }),
    );
  });

  it("rekening sudah ada: ditampilkan + bisa diubah", async () => {
    const { user } = renderWithQuery(<RefundPanel order={refundPending({ refundBankName: "BCA", refundAccountNumber: "1234567890", refundAccountName: "Rina Putri" })} />);
    expect(screen.getByText("1234567890")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Edit" }));
    expect(screen.getByRole("textbox", { name: /account number/i })).toHaveValue("1234567890");
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("textbox", { name: /account number/i })).not.toBeInTheDocument();
  });

  it("dibatalkan penjual: refund penuh tanpa keterangan 50%", () => {
    renderWithQuery(<RefundPanel order={refundPending({ cancelledBy: "SELLER", refundDue: null, refundExpected: 300000 })} />);
    expect(screen.getByText("We'll refund").nextElementSibling).toHaveTextContent("Rp300.000");
    expect(screen.queryByText(/50% of your payment/)).not.toBeInTheDocument();
  });

  it("sudah direfund: nominal, rekening & bukti transfer", () => {
    renderWithQuery(
      <RefundPanel
        order={order({
          status: "DIREFUND",
          canCancel: false,
          refundAmount: 150000,
          refundedAt: "2026-11-14T03:00:00.000Z",
          refundBankName: "BCA",
          refundAccountNumber: "1234567890",
          refundProofUrl: "https://res.cloudinary.com/test/image/upload/refund-proof.webp",
        })}
      />,
    );
    expect(screen.getByText("Rp150.000")).toBeInTheDocument();
    expect(screen.getByText(/to BCA 1234567890/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /view transfer receipt/i })).toHaveAttribute("href", expect.stringContaining("refund-proof"));
  });
});

describe("Admin: tandai sudah direfund", () => {
  const adminOrder = (overrides: Partial<AdminOrderDetail> = {}) =>
    ({
      ...refundPending(),
      allowedNextStatuses: [],
      canCancel: false,
      canRefund: true,
      canPack: false,
      ...overrides,
    }) as unknown as AdminOrderDetail;

  it("nominal default 50% (refundDue), rekening pembeli tampil, dikirim sebagai multipart", async () => {
    api.post.mockResolvedValue(apiResponse(adminOrder({ status: "DIREFUND", canRefund: false })));
    const { user } = renderWithQuery(
      <OrderActions order={adminOrder({ refundBankName: "BCA", refundAccountNumber: "1234567890", refundAccountName: "Rina Putri" })} />,
    );
    await user.click(screen.getByRole("button", { name: "Mark as refunded" }));
    const dialog = within(screen.getByRole("dialog"));
    expect(dialog.getByRole("textbox", { name: /refund amount/i })).toHaveValue("150000");
    expect(dialog.getByText("1234567890")).toBeInTheDocument();

    await user.type(dialog.getByRole("textbox", { name: /note/i }), "50% via BCA transfer");
    await user.click(dialog.getByRole("button", { name: "Save refund" }));
    await waitFor(() => expect(api.post).toHaveBeenCalled());
    const [url, form] = api.post.mock.calls[0] as [string, FormData];
    expect(url).toBe("/admin/orders/PNK-261114-AB12/refund");
    expect(form.get("amount")).toBe("150000");
    expect(form.get("reason")).toBe("50% via BCA transfer");
    expect(form.get("proof")).toBeNull();
  });

  it("pembeli belum mengisi rekening -> peringatan di dialog", async () => {
    const { user } = renderWithQuery(<OrderActions order={adminOrder()} />);
    await user.click(screen.getByRole("button", { name: "Mark as refunded" }));
    expect(within(screen.getByRole("dialog")).getByText(/hasn't added refund bank details/)).toBeInTheDocument();
  });
});

describe("Admin: kartu pembatalan & refund", () => {
  const base = (overrides: Partial<AdminOrderDetail> = {}) =>
    ({ ...refundPending(), cancelledAt: "2026-11-14T02:00:00.000Z", cancelReason: "My plans changed", refundReason: null, ...overrides }) as unknown as AdminOrderDetail;

  it("dibatalkan pembeli: sumber, alasan, nominal 50%, rekening + salin", async () => {
    const { user } = renderWithQuery(<CancellationCard order={base({ refundBankName: "BCA", refundAccountNumber: "1234567890", refundAccountName: "Rina Putri" })} />);
    expect(screen.getByRole("heading", { name: "Cancelled by the customer" })).toBeInTheDocument();
    expect(screen.getByText("My plans changed")).toBeInTheDocument();
    expect(screen.getByText("To refund").nextElementSibling).toHaveTextContent("Rp150.000");
    expect(screen.getByText("50% (customer cancelled)")).toBeInTheDocument();
    expect(screen.getByText("Waiting to be sent")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Copy number" }));
    expect(await navigator.clipboard.readText()).toBe("1234567890");
  });

  it("belum ada rekening -> peringatan; sudah direfund -> nominal, catatan & bukti", () => {
    const { unmount } = renderWithQuery(<CancellationCard order={base()} />);
    expect(screen.getByText(/hasn't added bank details yet/)).toBeInTheDocument();
    unmount();

    renderWithQuery(
      <CancellationCard
        order={base({ status: "DIREFUND", refundAmount: 150000, refundedAt: "2026-11-14T05:00:00.000Z", refundReason: "50% via BCA", refundProofUrl: "https://res.cloudinary.com/test/proof.webp" })}
      />,
    );
    expect(screen.getByText("Sent", { selector: "span" })).toBeInTheDocument();
    expect(screen.getByText("Refunded").nextElementSibling).toHaveTextContent("Rp150.000");
    expect(screen.getByText(/50% via BCA/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /view refund receipt/i })).toHaveAttribute("href", expect.stringContaining("proof"));
  });

  it("kedaluwarsa & dibatalkan penjual; pesanan aktif tidak menampilkan kartu", () => {
    const { unmount } = renderWithQuery(<CancellationCard order={base({ status: "KEDALUWARSA", cancelledBy: null, cancelReason: null })} />);
    expect(screen.getByRole("heading", { name: "Expired" })).toBeInTheDocument();
    unmount();
    const seller = renderWithQuery(<CancellationCard order={base({ cancelledBy: "SELLER", refundDue: null })} />);
    expect(screen.getByRole("heading", { name: "Cancelled by the seller" })).toBeInTheDocument();
    expect(screen.getByText("Full refund")).toBeInTheDocument();
    seller.unmount();
    const { container } = renderWithQuery(<CancellationCard order={base({ status: "DIKEMAS" })} />);
    expect(container).toBeEmptyDOMElement();
  });
});
