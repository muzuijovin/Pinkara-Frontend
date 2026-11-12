import { AxiosError, AxiosHeaders } from "axios";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CheckoutSection } from "@/features/(costumer)/checkout/checkoutSection";
import { CourierOptions, selectedOption } from "@/features/shipping/components/courierOptions";
import type { ShippingOption, ShippingRates } from "@/types/shipping.type";
import { apiResponse, renderWithQuery } from "./helpers/render";

// TES ONGKIR KURIR: daftar pilihan kurir, petunjuk pin lokasi, tarif cadangan, checkout mengirim kurir terpilih
const api = vi.hoisted(() => ({ get: vi.fn(), patch: vi.fn(), post: vi.fn(), delete: vi.fn() }));
const nav = vi.hoisted(() => ({ replace: vi.fn(), push: vi.fn() }));
const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn(), info: vi.fn() }));
vi.mock("@/lib/axios-instance.lib", () => ({ axiosInstance: api }));
vi.mock("react-toastify", () => ({ toast }));
vi.mock("next/navigation", () => ({ useRouter: () => nav, usePathname: () => "/checkout", useSearchParams: () => new URLSearchParams() }));

const option = (overrides: Partial<ShippingOption>): ShippingOption => ({
  id: "jne:reg",
  courierCode: "jne",
  serviceCode: "reg",
  courierName: "JNE",
  serviceName: "JNE Reguler",
  type: "REGULAR",
  eta: "2 - 3 days",
  fee: 12000,
  isFallback: false,
  ...overrides,
});
const instant = option({ id: "gojek:instant", courierCode: "gojek", serviceCode: "instant", courierName: "GoSend", serviceName: "GoSend Instant", type: "INSTANT", eta: "1 - 3 hours", fee: 25000 });
const rates = (overrides: Partial<ShippingRates> = {}): ShippingRates => ({ options: [instant, option({})], fallback: false, hasPin: true, ...overrides });

describe("selectedOption", () => {
  it("pilihan pembeli kalau masih ada, kalau tidak -> pilihan pertama", () => {
    expect(selectedOption(rates(), "jne:reg")?.id).toBe("jne:reg");
    expect(selectedOption(rates(), "grab:instant")?.id).toBe("gojek:instant");
    expect(selectedOption(rates({ options: [] }), null)).toBeNull();
    expect(selectedOption(undefined, null)).toBeNull();
  });
});

describe("CourierOptions", () => {
  const setup = (props: Partial<Parameters<typeof CourierOptions>[0]> = {}) => {
    const onChange = vi.fn();
    render(<CourierOptions rates={rates()} isPending={false} error={null} onRetry={vi.fn()} selectedId={null} onChange={onChange} {...props} />);
    return { onChange, user: userEvent.setup() };
  };

  it("menampilkan layanan, label instan, perkiraan waktu, ongkir; pilihan pertama terpilih", () => {
    setup();
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(2);
    expect(radios[0]).toBeChecked();
    expect(screen.getByText("GoSend Instant")).toBeInTheDocument();
    expect(screen.getByText("Instant")).toBeInTheDocument();
    expect(screen.getByText("Estimated 1 - 3 hours")).toBeInTheDocument();
    expect(screen.getByText("Rp25.000")).toBeInTheDocument();
  });

  it("memilih kurir lain memanggil onChange dengan id-nya", async () => {
    const { user, onChange } = setup();
    await user.click(screen.getByRole("radio", { name: /JNE Reguler/ }));
    expect(onChange).toHaveBeenCalledWith("jne:reg");
  });

  it("alamat tanpa pin -> ajakan menambah pin lokasi", () => {
    setup({ rates: rates({ hasPin: false, options: [option({})] }) });
    expect(screen.getByText(/Pin this address on the map/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Add a pin" })).toHaveAttribute("href", "/profile?tab=addresses");
  });

  it("tarif cadangan -> keterangan tarif standar", () => {
    setup({ rates: rates({ fallback: true, options: [option({ id: "pinkara:flat", serviceName: "Standard delivery", isFallback: true })] }) });
    expect(screen.getByText(/showing our standard delivery fee/)).toBeInTheDocument();
  });

  it("gagal memuat -> pesan + coba lagi", async () => {
    const onRetry = vi.fn();
    setup({ rates: undefined, error: new Error("boom"), onRetry });
    await userEvent.setup().click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalled();
  });
});

describe("Checkout dengan kurir", () => {
  const preview = {
    items: [{ productName: "Pink Roses", variantLabel: "M", imageUrl: null, unitPrice: 150000, quantity: 1, addonTotal: 0, lineTotal: 150000, addons: [] }],
    subtotal: 150000,
    addonTotal: 0,
    promo: null,
    shippingOptions: [
      { method: "COURIER", fee: 25000 },
      { method: "PICKUP", fee: 0 },
    ],
    paymentOptions: [{ method: "QRIS", expiresInMinutes: 15 }],
  };
  const address = { id: "addr-1", label: "Home", recipientName: "Rina", recipientPhone: "081234567890", fullAddress: "Jl. Ijen 10", city: "Malang", postalCode: "65119", latitude: -7.97, longitude: 112.62, isDefault: true, createdAt: "", updatedAt: "" };
  const user = { id: "u1", name: "Rina", email: "rina@mail.com", role: "CUSTOMER", phone: null, avatarUrl: null, emailVerifiedAt: "2026-11-01T00:00:00.000Z", createdAt: "" };

  beforeEach(() => {
    api.get.mockImplementation(async (url: string, config?: { params?: Record<string, unknown> }) => {
      if (url === "/auth/me") return apiResponse(user);
      if (url === "/orders/checkout") return apiResponse(preview);
      if (url === "/addresses") return apiResponse([address]);
      if (url === "/shipping/rates") {
        expect(config?.params).toMatchObject({ addressId: "addr-1" });
        return apiResponse(rates());
      }
      return apiResponse(null);
    });
  });

  it("ongkir & total mengikuti kurir yang dipilih; Place order mengirim kurir terpilih", async () => {
    api.post.mockResolvedValue(apiResponse({ code: "PNK-261113-AAAA" }));
    const { user: actor } = renderWithQuery(<CheckoutSection />);

    await screen.findByText("GoSend Instant");
    const placeButton = await screen.findByRole("button", { name: /place order/i });
    await waitFor(() => expect(placeButton).toBeEnabled());
    expect(screen.getAllByText("Rp175.000").length).toBeGreaterThan(0);

    await actor.click(screen.getByRole("radio", { name: /JNE Reguler/ }));
    expect(screen.getAllByText("Rp162.000").length).toBeGreaterThan(0);

    await actor.click(placeButton);
    await waitFor(() => expect(api.post).toHaveBeenCalled());
    const [url, body] = api.post.mock.calls[0] as [string, Record<string, unknown>];
    expect(url).toBe("/orders");
    expect(body).toMatchObject({ shippingMethod: "COURIER", addressId: "addr-1", courier: { courierCode: "jne", serviceCode: "reg" }, expectedTotal: 162000 });
    await waitFor(() => expect(nav.replace).toHaveBeenCalledWith("/orders/PNK-261113-AAAA/payment"));
  });

  it("ambil sendiri -> tanpa kurir & tanpa ongkir", async () => {
    api.post.mockResolvedValue(apiResponse({ code: "PNK-261113-BBBB" }));
    const { user: actor } = renderWithQuery(<CheckoutSection />);
    await screen.findByText("GoSend Instant");
    await actor.click(screen.getByRole("radio", { name: /pick up at studio/i }));
    expect(screen.queryByText("GoSend Instant")).not.toBeInTheDocument();

    await actor.click(screen.getByRole("button", { name: /place order/i }));
    await waitFor(() => expect(api.post).toHaveBeenCalled());
    const body = (api.post.mock.calls[0] as [string, Record<string, unknown>])[1];
    expect(body).toMatchObject({ shippingMethod: "PICKUP", expectedTotal: 150000 });
    expect(body.courier).toBeUndefined();
  });

  it("SHIPPING_CHANGED -> pesan untuk memilih kurir lain & tarif diambil ulang", async () => {
    const config = { headers: new AxiosHeaders() };
    api.post.mockRejectedValue(
      new AxiosError("Conflict", "ERR", config, null, {
        status: 409,
        statusText: "Conflict",
        headers: {},
        config,
        data: { success: false, message: "The delivery option you chose is no longer available.", data: { code: "SHIPPING_CHANGED" } },
      }),
    );
    const { user: actor } = renderWithQuery(<CheckoutSection />);
    await screen.findByText("GoSend Instant");
    const placeButton = await screen.findByRole("button", { name: /place order/i });
    await waitFor(() => expect(placeButton).toBeEnabled());
    const ratesCalls = api.get.mock.calls.filter(([url]) => url === "/shipping/rates").length;

    await actor.click(placeButton);
    expect(await screen.findByText(/delivery option is no longer available/i)).toBeInTheDocument();
    await waitFor(() => expect(api.get.mock.calls.filter(([url]) => url === "/shipping/rates").length).toBeGreaterThan(ratesCalls));
    expect(nav.replace).not.toHaveBeenCalled();
  });

  it("kurir belum termuat -> tombol Place order belum aktif", async () => {
    let resolveRates: (value: unknown) => void = () => undefined;
    api.get.mockImplementation(async (url: string) => {
      if (url === "/auth/me") return apiResponse(user);
      if (url === "/orders/checkout") return apiResponse(preview);
      if (url === "/addresses") return apiResponse([address]);
      return new Promise((resolve) => (resolveRates = resolve));
    });
    renderWithQuery(<CheckoutSection />);
    expect(await screen.findByText("Loading delivery options...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /place order/i })).toBeDisabled();
    resolveRates(apiResponse(rates()));
    const summary = await screen.findByRole("button", { name: /place order/i });
    await waitFor(() => expect(summary).toBeEnabled());
    expect(within(document.body).getAllByText("GoSend Instant").length).toBeGreaterThan(0);
  });
});
