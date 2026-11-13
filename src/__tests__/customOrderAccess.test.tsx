import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CustomOrderCta } from "@/features/(public)/productDetail/components/customOrderCta";
import { RequireAuth } from "@/hoc/authGuard";
import { apiResponse, renderWithQuery } from "./helpers/render";

// TES AKSES CUSTOM ORDER: hanya customer yang bisa membuka form brief; admin -> tombol nonaktif & halaman ditolak
const api = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@/lib/axios-instance.lib", () => ({ axiosInstance: api }));
vi.mock("next/navigation", () => ({
  usePathname: () => "/custom-requests/new",
  useSearchParams: () => new URLSearchParams(),
  redirect: vi.fn(),
}));

const loginAs = (role: "CUSTOMER" | "ADMIN" | null) =>
  api.get.mockImplementation(async (url: string) => {
    if (url !== "/auth/me") return apiResponse(null);
    if (!role) throw Object.assign(new Error("Unauthorized"), { response: { status: 401 } });
    return apiResponse({ id: "u1", name: "Tester", email: "t@example.com", role });
  });

beforeEach(() => api.get.mockReset());

describe("CustomOrderCta", () => {
  it("customer -> link ke form brief produk ini", async () => {
    loginAs("CUSTOMER");
    renderWithQuery(<CustomOrderCta slug="custom-keychain" />);
    expect(await screen.findByRole("link", { name: /order custom/i })).toHaveAttribute("href", "/custom-requests/new?product=custom-keychain");
  });

  it("tamu -> tetap link (halaman brief yang meminta login)", async () => {
    loginAs(null);
    renderWithQuery(<CustomOrderCta slug="custom-keychain" />);
    await vi.waitFor(() => expect(api.get).toHaveBeenCalledWith("/auth/me"));
    expect(screen.getByRole("link", { name: /order custom/i })).toBeInTheDocument();
  });

  it("admin -> tombol nonaktif + alasan, tanpa link", async () => {
    loginAs("ADMIN");
    renderWithQuery(<CustomOrderCta slug="custom-keychain" />);
    const button = await screen.findByRole("button", { name: /order custom/i });
    expect(button).toBeDisabled();
    expect(button).toHaveAccessibleDescription(/admin accounts can't place custom orders/i);
    expect(screen.queryByRole("link", { name: /order custom/i })).not.toBeInTheDocument();
  });
});

describe("RequireAuth roles CUSTOMER (halaman brief)", () => {
  it("admin membuka URL langsung -> Access denied", async () => {
    loginAs("ADMIN");
    renderWithQuery(
      <RequireAuth roles={["CUSTOMER"]}>
        <p>Brief form</p>
      </RequireAuth>,
    );
    expect(await screen.findByText("Access denied")).toBeInTheDocument();
    expect(screen.queryByText("Brief form")).not.toBeInTheDocument();
  });

  it("customer -> form tampil", async () => {
    loginAs("CUSTOMER");
    renderWithQuery(
      <RequireAuth roles={["CUSTOMER"]}>
        <p>Brief form</p>
      </RequireAuth>,
    );
    expect(await screen.findByText("Brief form")).toBeInTheDocument();
  });
});
