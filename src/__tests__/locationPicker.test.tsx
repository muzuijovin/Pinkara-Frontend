import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LocationPicker } from "@/features/shipping/components/locationPicker";

// TES PIN LOKASI ALAMAT: peta Leaflet diganti tiruan (tidak jalan di jsdom), geolocation browser di-stub
vi.mock("@/features/shipping/components/locationMap", () => ({
  default: ({ onChange }: { onChange: (value: { latitude: number; longitude: number }) => void }) => (
    <button type="button" onClick={() => onChange({ latitude: -7.966612345, longitude: 112.632698765 })}>
      Fake map tap
    </button>
  ),
}));

const stubGeolocation = (impl: (success: PositionCallback, failure: PositionErrorCallback) => void) =>
  vi.stubGlobal("navigator", { ...navigator, geolocation: { getCurrentPosition: impl } });

describe("LocationPicker", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("tanpa pin: keterangan bahwa kurir reguler tetap bisa", () => {
    render(<LocationPicker value={null} onChange={vi.fn()} />);
    expect(screen.getByText(/No pin yet/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Remove pin" })).not.toBeInTheDocument();
  });

  it("tap peta -> koordinat dibulatkan 6 angka desimal", async () => {
    const onChange = vi.fn();
    render(<LocationPicker value={null} onChange={onChange} />);
    await userEvent.setup().click(await screen.findByRole("button", { name: "Fake map tap" }));
    expect(onChange).toHaveBeenCalledWith({ latitude: -7.966612, longitude: 112.632699 });
  });

  it("Use my current location -> titik dari GPS", async () => {
    stubGeolocation((success) => success({ coords: { latitude: -7.95, longitude: 112.61 } } as GeolocationPosition));
    const onChange = vi.fn();
    render(<LocationPicker value={null} onChange={onChange} />);
    await userEvent.setup().click(screen.getByRole("button", { name: /use my current location/i }));
    expect(onChange).toHaveBeenCalledWith({ latitude: -7.95, longitude: 112.61 });
  });

  it("izin lokasi ditolak -> pesan error, titik tidak berubah", async () => {
    stubGeolocation((_success, failure) => failure({ code: 1 } as GeolocationPositionError));
    const onChange = vi.fn();
    render(<LocationPicker value={null} onChange={onChange} />);
    await userEvent.setup().click(screen.getByRole("button", { name: /use my current location/i }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Couldn't get your location"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("ada pin: koordinat tampil & bisa dihapus", async () => {
    const onChange = vi.fn();
    render(<LocationPicker value={{ latitude: -7.9666, longitude: 112.6327 }} onChange={onChange} />);
    expect(screen.getByText("Pinned at -7.96660, 112.63270")).toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole("button", { name: "Remove pin" }));
    expect(onChange).toHaveBeenCalledWith(null);
  });
});
