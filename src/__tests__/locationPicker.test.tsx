import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LocationPicker } from "@/features/shipping/components/locationPicker";
import { renderWithQuery } from "./helpers/render";

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
    renderWithQuery(<LocationPicker value={null} onChange={vi.fn()} />);
    expect(screen.getByText(/No pin yet/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Remove pin" })).not.toBeInTheDocument();
  });

  it("tap peta -> koordinat dibulatkan 6 angka desimal", async () => {
    const onChange = vi.fn();
    renderWithQuery(<LocationPicker value={null} onChange={onChange} />);
    await userEvent.setup().click(await screen.findByRole("button", { name: "Fake map tap" }));
    expect(onChange).toHaveBeenCalledWith({ latitude: -7.966612, longitude: 112.632699 });
  });

  it("Use my current location -> titik dari GPS", async () => {
    stubGeolocation((success) => success({ coords: { latitude: -7.95, longitude: 112.61 } } as GeolocationPosition));
    const onChange = vi.fn();
    renderWithQuery(<LocationPicker value={null} onChange={onChange} />);
    await userEvent.setup().click(screen.getByRole("button", { name: /use my current location/i }));
    expect(onChange).toHaveBeenCalledWith({ latitude: -7.95, longitude: 112.61 });
  });

  it("izin lokasi ditolak -> pesan error, titik tidak berubah", async () => {
    stubGeolocation((_success, failure) => failure({ code: 1 } as GeolocationPositionError));
    const onChange = vi.fn();
    renderWithQuery(<LocationPicker value={null} onChange={onChange} />);
    await userEvent.setup().click(screen.getByRole("button", { name: /use my current location/i }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Couldn't get your location"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("ada pin: koordinat tampil & bisa dihapus", async () => {
    const onChange = vi.fn();
    renderWithQuery(<LocationPicker value={{ latitude: -7.9666, longitude: 112.6327 }} onChange={onChange} />);
    expect(screen.getByText("Pinned at -7.96660, 112.63270")).toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole("button", { name: "Remove pin" }));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  describe("cari tempat di peta (Nominatim)", () => {
    const nominatim = [
      { place_id: 1, display_name: "Jalan Ijen, Klojen, Malang, Jawa Timur, Indonesia", lat: "-7.9721", lon: "112.6205" },
      { place_id: 2, display_name: "Ijen Boulevard, Malang, Jawa Timur, Indonesia", lat: "-7.9701", lon: "112.6189" },
    ];

    it("Enter -> cari (Indonesia saja) -> pilih hasil -> pin pindah ke sana, form alamat tidak tersubmit", async () => {
      const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(nominatim), { status: 200 }));
      vi.stubGlobal("fetch", fetchMock);
      const onChange = vi.fn();
      const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
      const { user } = renderWithQuery(
        <form onSubmit={onSubmit}>
          <LocationPicker required value={null} onChange={onChange} />
        </form>,
      );
      await user.type(screen.getByRole("searchbox", { name: "Search the map" }), "jalan ijen malang{Enter}");
      expect(onSubmit).not.toHaveBeenCalled();

      const url = new URL(fetchMock.mock.calls[0][0] as string);
      expect(url.origin + url.pathname).toBe("https://nominatim.openstreetmap.org/search");
      expect(url.searchParams.get("q")).toBe("jalan ijen malang");
      expect(url.searchParams.get("countrycodes")).toBe("id");

      await user.click(await screen.findByRole("button", { name: /Jalan Ijen, Klojen/ }));
      expect(onChange).toHaveBeenCalledWith({ latitude: -7.9721, longitude: 112.6205 });
      expect(screen.queryByRole("list", { name: "Map search results" })).not.toBeInTheDocument();
    });

    it("tidak ketemu / error -> pesan; kurang dari 3 huruf -> tidak mencari", async () => {
      const fetchMock = vi.fn().mockResolvedValueOnce(new Response("[]", { status: 200 })).mockResolvedValueOnce(new Response("", { status: 503 }));
      vi.stubGlobal("fetch", fetchMock);
      const { user } = renderWithQuery(<LocationPicker value={null} onChange={vi.fn()} />);
      const box = screen.getByRole("searchbox", { name: "Search the map" });

      await user.type(box, "ab");
      await user.click(screen.getByRole("button", { name: "Search" }));
      expect(screen.getByRole("alert")).toHaveTextContent("at least 3 characters");
      expect(fetchMock).not.toHaveBeenCalled();

      await user.type(box, "zzzz");
      await user.click(screen.getByRole("button", { name: "Search" }));
      expect(await screen.findByText(/No places found/)).toBeInTheDocument();

      await user.clear(box);
      await user.type(box, "qqqq{Enter}");
      expect(await screen.findByText(/Couldn't search the map/)).toBeInTheDocument();
    });
  });
});
