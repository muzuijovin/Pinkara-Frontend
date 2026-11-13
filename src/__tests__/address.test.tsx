import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AddressForm } from "@/features/(costumer)/profile/components/addressForm";
import { AreaCombobox, type SelectedArea } from "@/features/shipping/components/areaCombobox";
import { formatAddressLine, isAddressReady, pickReadyAddress } from "@/features/shipping/utils/address";
import type { Address } from "@/types/profile.type";
import type { Area } from "@/types/shipping.type";
import { apiResponse, renderWithQuery } from "./helpers/render";

// TES ALAMAT: wilayah dipilih dari daftar resmi (tidak bisa diketik bebas), pin wajib, alamat lama harus diperbarui
const api = vi.hoisted(() => ({ get: vi.fn(), patch: vi.fn(), post: vi.fn(), delete: vi.fn() }));
vi.mock("@/lib/axios-instance.lib", () => ({ axiosInstance: api }));
vi.mock("react-toastify", () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));
// peta Leaflet diganti tombol tiruan (tidak jalan di jsdom)
vi.mock("@/features/shipping/components/locationMap", () => ({
  default: ({ onChange }: { onChange: (value: { latitude: number; longitude: number }) => void }) => (
    <button type="button" onClick={() => onChange({ latitude: -7.9666, longitude: 112.6211 })}>
      Fake map tap
    </button>
  ),
}));

const KLOJEN: Area = { id: "MOCK-KLOJEN-65111", name: "Klojen, Malang, Jawa Timur. 65111", province: "Jawa Timur", city: "Malang", district: "Klojen", postalCode: "65111", deliverable: true };
const GUBENG: Area = { id: "MOCK-GUBENG-60281", name: "Gubeng, Surabaya, Jawa Timur. 60281", province: "Jawa Timur", city: "Surabaya", district: "Gubeng", postalCode: "60281", deliverable: false };

const address = (overrides: Partial<Address> = {}): Address => ({
  id: "a1",
  label: null,
  recipientName: "Rina",
  recipientPhone: "081234567890",
  fullAddress: "Jl. Ijen No. 10",
  city: "Malang",
  postalCode: "65111",
  areaId: KLOJEN.id,
  areaName: KLOJEN.name,
  district: "Klojen",
  province: "Jawa Timur",
  latitude: -7.97,
  longitude: 112.62,
  isDefault: false,
  createdAt: "",
  updatedAt: "",
  ...overrides,
});

beforeEach(() => {
  api.get.mockImplementation(async (url: string, config?: { params?: { input?: string } }) =>
    url === "/shipping/areas" ? apiResponse([KLOJEN, GUBENG].filter((area) => area.name.toLowerCase().includes(String(config?.params?.input).toLowerCase()))) : apiResponse([]),
  );
  api.post.mockResolvedValue(apiResponse(address()));
  api.patch.mockResolvedValue(apiResponse(address()));
});

describe("helper alamat", () => {
  it("siap kirim = wilayah resmi + pin", () => {
    expect(isAddressReady(address())).toBe(true);
    expect(isAddressReady(address({ areaId: null }))).toBe(false);
    expect(isAddressReady(address({ latitude: null, longitude: null }))).toBe(false);
  });

  it("baris alamat: nama wilayah resmi, alamat lama pakai kota + kode pos", () => {
    expect(formatAddressLine(address())).toBe("Jl. Ijen No. 10, Klojen, Malang, Jawa Timur. 65111");
    expect(formatAddressLine(address({ areaName: null, postalCode: "65119" }))).toBe("Jl. Ijen No. 10, Malang 65119");
  });

  it("alamat terpilih checkout: lewati alamat lama yang belum lengkap", () => {
    const legacyDefault = address({ id: "old", isDefault: true, areaId: null });
    const ready = address({ id: "new" });
    expect(pickReadyAddress([legacyDefault, ready], null)).toBe("new");
    expect(pickReadyAddress([legacyDefault, ready], "old")).toBe("new");
    expect(pickReadyAddress([legacyDefault], null)).toBeNull();
  });
});

describe("AreaCombobox", () => {
  function Harness({ onPick }: { onPick: (area: Area | null) => void }) {
    const [value, setValue] = useState<SelectedArea | null>(null);
    return (
      <AreaCombobox
        value={value}
        onChange={(area) => {
          onPick(area);
          setValue(area ? { id: area.id, name: area.name } : null);
        }}
      />
    );
  }

  it("ketik -> pilih dengan keyboard -> wilayah terpilih & bisa diganti", async () => {
    const onPick = vi.fn();
    const { user } = renderWithQuery(<Harness onPick={onPick} />);
    const input = screen.getByRole("combobox", { name: /district, city & postal code/i });
    await user.type(input, "klo");
    expect(await screen.findByRole("option", { name: /Klojen, Malang/ })).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith("/shipping/areas", { params: { input: "klo" } });

    await user.keyboard("{ArrowDown}{Enter}");
    expect(onPick).toHaveBeenCalledWith(KLOJEN);
    expect(screen.getByText(KLOJEN.name)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Change" }));
    expect(onPick).toHaveBeenLastCalledWith(null);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("wilayah di luar Malang Raya tampil tapi tidak bisa dipilih", async () => {
    const onPick = vi.fn();
    const { user } = renderWithQuery(<Harness onPick={onPick} />);
    await user.type(screen.getByRole("combobox"), "gubeng");
    const option = await screen.findByRole("option", { name: /Gubeng/ });
    expect(option).toHaveAttribute("aria-disabled", "true");
    expect(within(option).getByText("Outside our delivery area")).toBeInTheDocument();
    await user.pointer({ keys: "[MouseLeft>]", target: option });
    expect(onPick).not.toHaveBeenCalled();
  });

  it("kurang dari 3 huruf: belum mencari", async () => {
    const { user } = renderWithQuery(<Harness onPick={vi.fn()} />);
    await user.type(screen.getByRole("combobox"), "kl");
    await new Promise((resolve) => setTimeout(resolve, 400));
    expect(api.get).not.toHaveBeenCalled();
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("tidak ditemukan -> saran coba ejaan lain / kode pos", async () => {
    const { user } = renderWithQuery(<Harness onPick={vi.fn()} />);
    await user.type(screen.getByRole("combobox"), "zzzz");
    expect(await screen.findByText(/No districts found/)).toBeInTheDocument();
  });
});

describe("AddressForm", () => {
  const fillBasics = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.type(screen.getByRole("textbox", { name: /recipient name/i }), "Rina");
    await user.type(screen.getByRole("textbox", { name: /recipient phone/i }), "081234567890");
    await user.type(screen.getByRole("textbox", { name: /street address/i }), "Jl. Ijen No. 10, RT 02/RW 03");
  };

  it("tanpa wilayah & pin -> error di form, tidak ada request", async () => {
    const { user } = renderWithQuery(<AddressForm isFirstAddress onDone={vi.fn()} onCancel={vi.fn()} />);
    await fillBasics(user);
    await user.click(screen.getByRole("button", { name: "Save address" }));
    expect(await screen.findByText("Please choose your district from the list")).toBeInTheDocument();
    expect(screen.getByText("Please pin the location on the map")).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });

  it("wilayah dari daftar + pin -> dikirim tanpa kota/kode pos ketikan", async () => {
    const onDone = vi.fn();
    const { user } = renderWithQuery(<AddressForm isFirstAddress onDone={onDone} onCancel={vi.fn()} />);
    await fillBasics(user);
    await user.type(screen.getByRole("combobox"), "klojen");
    await user.click(await screen.findByRole("option", { name: /Klojen/ }));
    await user.click(await screen.findByRole("button", { name: "Fake map tap" }));
    await user.click(screen.getByRole("button", { name: "Save address" }));

    await waitFor(() => expect(api.post).toHaveBeenCalled());
    const [url, body] = api.post.mock.calls[0] as [string, Record<string, unknown>];
    expect(url).toBe("/addresses");
    expect(body).toMatchObject({ areaId: KLOJEN.id, areaName: KLOJEN.name, latitude: -7.9666, longitude: 112.6211, fullAddress: "Jl. Ijen No. 10, RT 02/RW 03" });
    expect(body).not.toHaveProperty("city");
    expect(body).not.toHaveProperty("postalCode");
    await waitFor(() => expect(onDone).toHaveBeenCalled());
  });

  it("alamat lama -> pesan untuk melengkapi wilayah & pin", () => {
    renderWithQuery(<AddressForm address={address({ areaId: null, areaName: null, latitude: null, longitude: null })} isFirstAddress={false} onDone={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByRole("status")).toHaveTextContent("choose this address's district");
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("alamat lengkap -> wilayah terpilih ditampilkan, pin terisi", () => {
    renderWithQuery(<AddressForm address={address()} isFirstAddress={false} onDone={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByText(KLOJEN.name)).toBeInTheDocument();
    expect(screen.getByText(/Pinned at -7.97000, 112.62000/)).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
