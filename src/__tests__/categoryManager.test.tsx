import { screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CategoryManager } from "@/features/admin/categories/categoryManager";
import type { AdminCategory } from "@/types/catalog.type";
import { apiResponse, renderWithQuery } from "./helpers/render";

// TES KELOLA KATEGORI ADMIN: urutan tampil, hapus diblokir kalau masih ada produk, tambah kategori
const api = vi.hoisted(() => ({ get: vi.fn(), patch: vi.fn(), post: vi.fn(), delete: vi.fn() }));
vi.mock("@/lib/axios-instance.lib", () => ({ axiosInstance: api }));
vi.mock("react-toastify", () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));

const category = (id: string, name: string, productCount: number): AdminCategory =>
  ({
    id,
    name,
    slug: name.toLowerCase().replace(/\s+/g, "-"),
    imageUrl: null,
    isActive: true,
    sortOrder: 0,
    productCount,
    defaultAddonTypes: ["PACKAGING"],
  }) as unknown as AdminCategory;

describe("CategoryManager", () => {
  beforeEach(() => {
    api.get.mockResolvedValue(apiResponse([category("c1", "Bouquet", 4), category("c2", "Bloom Box", 0)]));
    api.patch.mockResolvedValue(apiResponse([]));
    api.post.mockResolvedValue(apiResponse(category("c3", "Hampers", 0)));
    api.delete.mockResolvedValue(apiResponse({}));
  });

  it("menampilkan jumlah produk, slug, dan add-on default", async () => {
    renderWithQuery(<CategoryManager />);
    expect(await screen.findByText("4 products · /bouquet")).toBeInTheDocument();
    expect(screen.getAllByText("Default add-ons: Packaging box")).toHaveLength(2);
  });

  it("ubah urutan lalu simpan -> PATCH reorder", async () => {
    const { user } = renderWithQuery(<CategoryManager />);
    await user.click(await screen.findByRole("button", { name: "Move Bloom Box up" }));
    await user.click(screen.getByRole("button", { name: "Save order" }));
    expect(api.patch).toHaveBeenCalledWith("/admin/categories/reorder", { ids: ["c2", "c1"] });
  });

  it("hapus kategori yang masih punya produk -> diblokir, tanpa request", async () => {
    const { user } = renderWithQuery(<CategoryManager />);
    await user.click(await screen.findByRole("button", { name: "Delete Bouquet" }));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText(/still has 4 product/)).toBeInTheDocument();
    expect(within(dialog).queryByRole("button", { name: "Delete" })).not.toBeInTheDocument();
    expect(api.delete).not.toHaveBeenCalled();
  });

  it("hapus kategori kosong -> DELETE", async () => {
    const { user } = renderWithQuery(<CategoryManager />);
    await user.click(await screen.findByRole("button", { name: "Delete Bloom Box" }));
    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Delete" }));
    expect(api.delete).toHaveBeenCalledWith("/admin/categories/c2");
  });

  it("tambah kategori: nama terlalu pendek ditolak, nama valid dikirim multipart", async () => {
    const { user } = renderWithQuery(<CategoryManager />);
    await screen.findByText("4 products · /bouquet");
    await user.click(screen.getByRole("button", { name: "Add category" }));
    const dialog = screen.getByRole("dialog");
    const name = within(dialog).getByRole("textbox", { name: /name/i });

    await user.type(name, "A");
    await user.click(within(dialog).getByRole("button", { name: "Add category" }));
    expect(await within(dialog).findByText("Name must be at least 2 characters")).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();

    await user.type(name, "rtisan Hampers");
    await user.click(within(dialog).getByRole("button", { name: "Add category" }));
    await waitFor(() => expect(api.post).toHaveBeenCalled());
    const [url, body] = api.post.mock.calls[0] as [string, FormData];
    expect(url).toBe("/admin/categories");
    expect(body.get("name")).toBe("Artisan Hampers");
    expect(JSON.parse(String(body.get("defaultAddonTypes")))).toEqual(["PACKAGING", "PAPER_BAG", "GIFT_CARD"]);
  });
});
