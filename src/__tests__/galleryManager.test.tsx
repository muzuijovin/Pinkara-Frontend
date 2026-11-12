import { screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GalleryManager } from "@/features/admin/gallery/galleryManager";
import type { AdminGalleryItem } from "@/types/gallery.type";
import { apiResponse, renderWithQuery } from "./helpers/render";

// TES KELOLA GALERI ADMIN: daftar, urutan, tampil/sembunyi, tambah (foto wajib), hapus
const api = vi.hoisted(() => ({ get: vi.fn(), patch: vi.fn(), post: vi.fn(), delete: vi.fn() }));
vi.mock("@/lib/axios-instance.lib", () => ({ axiosInstance: api }));
vi.mock("react-toastify", () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));

const photo = (id: string, overrides: Partial<AdminGalleryItem> = {}): AdminGalleryItem => ({
  id,
  imageUrl: `https://res.cloudinary.com/test/${id}.webp`,
  caption: `Bouquet ${id}`,
  sortOrder: 0,
  isActive: true,
  updatedAt: "2026-11-12T10:00:00.000Z",
  ...overrides,
});

describe("GalleryManager", () => {
  beforeEach(() => {
    api.get.mockResolvedValue(apiResponse([photo("a"), photo("b"), photo("c", { isActive: false, caption: null })]));
    api.patch.mockImplementation(async (_url: string, body: unknown) => apiResponse(body));
    api.post.mockResolvedValue(apiResponse(photo("new")));
    api.delete.mockResolvedValue(apiResponse({}));
  });

  it("menampilkan foto sesuai urutan, jumlah, dan penanda tersembunyi", async () => {
    renderWithQuery(<GalleryManager />);
    const items = await screen.findAllByRole("listitem");
    expect(items).toHaveLength(3);
    expect(within(items[0]).getByText("#1")).toBeInTheDocument();
    expect(within(items[2]).getByText("Hidden")).toBeInTheDocument();
    expect(within(items[2]).getByText("No caption")).toBeInTheDocument();
    expect(screen.getByText("3 of 30 photos · 2 shown")).toBeInTheDocument();
  });

  it("geser urutan -> bar 'Save order' -> PATCH reorder dengan urutan baru", async () => {
    const { user } = renderWithQuery(<GalleryManager />);
    await user.click(await screen.findByRole("button", { name: "Move Bouquet a later" }));
    expect(screen.getByRole("status")).toHaveTextContent("You changed the order.");

    await user.click(screen.getByRole("button", { name: "Save order" }));
    expect(api.patch).toHaveBeenCalledWith("/admin/gallery/reorder", { ids: ["b", "a", "c"] });
    await waitFor(() => expect(screen.queryByText("You changed the order.")).not.toBeInTheDocument());
  });

  it("Reset mengembalikan urutan tanpa memanggil server", async () => {
    const { user } = renderWithQuery(<GalleryManager />);
    await user.click(await screen.findByRole("button", { name: "Move Bouquet b earlier" }));
    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(api.patch).not.toHaveBeenCalled();
  });

  it("foto pertama tidak bisa digeser ke depan (tombol disembunyikan)", async () => {
    const { container } = renderWithQuery(<GalleryManager />);
    await screen.findAllByRole("listitem");
    const first = container.querySelector("[aria-label=\"Move Bouquet a earlier\"]");
    expect(first).toBeDisabled();
    expect(first).toHaveAttribute("aria-hidden", "true");
    expect(first).toHaveClass("invisible");
  });

  it("sembunyikan cepat dari kartu -> PATCH isActive false", async () => {
    const { user } = renderWithQuery(<GalleryManager />);
    await user.click(await screen.findByRole("button", { name: "Hide Bouquet a" }));
    expect(api.patch).toHaveBeenCalledWith("/admin/gallery/a", { isActive: false });
  });

  it("tambah foto tanpa memilih file -> error di form, tidak ada request", async () => {
    const { user } = renderWithQuery(<GalleryManager />);
    await screen.findAllByRole("listitem");
    await user.click(screen.getByRole("button", { name: "Add photo" }));
    const dialog = screen.getByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "Add photo" }));
    expect(within(dialog).getByRole("alert")).toHaveTextContent("Please choose a photo");
    expect(api.post).not.toHaveBeenCalled();
  });

  it("tambah foto + caption -> multipart POST", async () => {
    const { user } = renderWithQuery(<GalleryManager />);
    await screen.findAllByRole("listitem");
    await user.click(screen.getByRole("button", { name: "Add photo" }));
    const dialog = screen.getByRole("dialog");
    await user.upload(within(dialog).getByLabelText(/upload photo/i), new File(["x"], "rose.png", { type: "image/png" }));
    await user.type(within(dialog).getByRole("textbox", { name: "Caption" }), "Graduation bouquet");
    await user.click(within(dialog).getByRole("button", { name: "Add photo" }));

    await waitFor(() => expect(api.post).toHaveBeenCalled());
    const [url, body] = api.post.mock.calls[0] as [string, FormData];
    expect(url).toBe("/admin/gallery");
    expect(body.get("caption")).toBe("Graduation bouquet");
    expect(body.get("isActive")).toBe("true");
    expect(body.get("image")).toBeInstanceOf(File);
  });

  it("hapus lewat dialog konfirmasi", async () => {
    const { user } = renderWithQuery(<GalleryManager />);
    await user.click(await screen.findByRole("button", { name: "Delete Bouquet b" }));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("Delete this photo?")).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: "Delete" }));
    expect(api.delete).toHaveBeenCalledWith("/admin/gallery/b");
  });

  it("galeri kosong -> ajakan menambah foto pertama", async () => {
    api.get.mockResolvedValue(apiResponse([]));
    renderWithQuery(<GalleryManager />);
    expect(await screen.findByText("No photos yet")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add the first photo" })).toBeInTheDocument();
  });

  it("galeri penuh (30 foto) -> tombol tambah dinonaktifkan", async () => {
    api.get.mockResolvedValue(apiResponse(Array.from({ length: 30 }, (_, index) => photo(`p${index}`))));
    renderWithQuery(<GalleryManager />);
    expect(await screen.findByText(/Gallery is full/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add photo" })).toBeDisabled();
  });
});
