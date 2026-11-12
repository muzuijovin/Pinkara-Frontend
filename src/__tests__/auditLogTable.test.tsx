import { screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuditLogTable } from "@/features/admin/auditLogs/auditLogTable";
import type { AuditLog } from "@/types/auditLog.type";
import { apiResponse, renderWithQuery } from "./helpers/render";

// TES AUDIT LOG ADMIN: filter disimpan di URL, label target, detail perubahan sebelum -> sesudah
const api = vi.hoisted(() => ({ get: vi.fn(), patch: vi.fn(), post: vi.fn(), delete: vi.fn() }));
const nav = vi.hoisted(() => ({ search: new URLSearchParams(), replace: vi.fn() }));
vi.mock("@/lib/axios-instance.lib", () => ({ axiosInstance: api }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: nav.replace, push: vi.fn() }),
  usePathname: () => "/admin/audit-logs",
  useSearchParams: () => nav.search,
}));

const log = (overrides: Partial<AuditLog>): AuditLog => ({
  id: "l1",
  entity: "product",
  entityId: "p1",
  action: "update",
  before: { name: "Pink Roses", minPrice: 150000 },
  after: { name: "Pink Roses", minPrice: 175000 },
  reason: null,
  createdAt: "2026-11-12T12:45:00.000Z",
  actor: { id: "a1", name: "Admin Sari", email: "sari@pinkara.test", role: "ADMIN" },
  target: { label: "Pink Roses", href: "/admin/products/p1/edit" },
  ...overrides,
});

function mockApi(logs: AuditLog[], meta = { page: 1, limit: 20, totalPage: 1, totalLogs: logs.length }) {
  api.get.mockImplementation(async (url: string) =>
    url.endsWith("/filters") ? apiResponse({ actors: [{ id: "a1", name: "Admin Sari" }], actions: ["status_change", "update"] }) : apiResponse(logs, meta),
  );
}

describe("AuditLogTable", () => {
  beforeEach(() => {
    nav.search = new URLSearchParams();
    mockApi([
      log({}),
      log({ id: "l2", entity: "gallery", entityId: "g1", action: "delete", before: { caption: "Old photo" }, after: null, target: { label: "Old photo", href: null } }),
      log({ id: "l3", entity: "order", action: "status_change", before: { status: "DIBAYAR" }, after: { status: "DIKEMAS" }, reason: "Packing started", actor: null, target: { label: null, href: null } }),
    ]);
  });

  it("menampilkan waktu WIB, admin, label target (link), dan nama aksi", async () => {
    renderWithQuery(<AuditLogTable />);
    const table = await screen.findByRole("table");
    expect(within(table).getAllByText("12 Nov 2026, 19:45 WIB").length).toBeGreaterThan(0);
    expect(within(table).getByRole("link", { name: "Pink Roses" })).toHaveAttribute("href", "/admin/products/p1/edit");
    expect(within(table).getByText("Status changed")).toBeInTheDocument();
    // perubahan oleh sistem (tanpa admin) & data yang sudah dihapus
    expect(within(table).getByText("System")).toBeInTheDocument();
    expect(within(table).getByText("Deleted order")).toBeInTheDocument();
  });

  it("detail perubahan hanya kolom yang berubah + alasan", async () => {
    const { user } = renderWithQuery(<AuditLogTable />);
    const table = await screen.findByRole("table");
    const rows = within(table).getAllByRole("row");

    await user.click(within(rows[1]).getByText("1 change"));
    expect(within(rows[1]).getByText("Min price")).toBeInTheDocument();
    expect(within(rows[1]).getByText("150.000")).toBeInTheDocument();
    expect(within(rows[1]).getByText("175.000")).toBeInTheDocument();
    expect(within(rows[1]).queryByText("Name")).not.toBeInTheDocument();

    await user.click(within(rows[3]).getByText("1 change"));
    expect(within(rows[3]).getByText("Packing started")).toBeInTheDocument();
  });

  it("filter mengubah URL (halaman kembali ke 1)", async () => {
    nav.search = new URLSearchParams("page=3");
    const { user } = renderWithQuery(<AuditLogTable />);
    await screen.findByRole("table");

    await user.selectOptions(screen.getByLabelText("Type"), "order");
    expect(nav.replace).toHaveBeenLastCalledWith("/admin/audit-logs?entity=order", { scroll: false });

    await user.selectOptions(await screen.findByLabelText("Admin"), "a1");
    expect(nav.replace).toHaveBeenLastCalledWith("/admin/audit-logs?actor=a1", { scroll: false });
  });

  it("filter dari URL dikirim ke API; nilai tidak valid diabaikan", async () => {
    nav.search = new URLSearchParams("entity=gallery&from=2026-11-01&to=kemarin&page=2");
    renderWithQuery(<AuditLogTable />);
    await screen.findByRole("table");
    expect(api.get).toHaveBeenCalledWith("/admin/audit-logs", {
      params: { page: 2, entity: "gallery", action: undefined, actorId: undefined, from: "2026-11-01", to: undefined },
    });
    expect(screen.getByRole("button", { name: "Clear filters" })).toBeInTheDocument();
  });

  it("hasil kosong dengan filter -> tombol hapus filter", async () => {
    nav.search = new URLSearchParams("entity=addon");
    mockApi([]);
    const { user } = renderWithQuery(<AuditLogTable />);
    expect(await screen.findByText("No changes match these filters")).toBeInTheDocument();
    await user.click(screen.getAllByRole("button", { name: "Clear filters" })[0]);
    expect(nav.replace).toHaveBeenLastCalledWith("/admin/audit-logs");
  });

  it("paginasi", async () => {
    mockApi([log({})], { page: 1, limit: 20, totalPage: 3, totalLogs: 45 });
    const { user } = renderWithQuery(<AuditLogTable />);
    expect(await screen.findByText(/Page 1 of 3 · 45 entries/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /previous/i })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: /next/i }));
    expect(nav.replace).toHaveBeenLastCalledWith("/admin/audit-logs?page=2", { scroll: false });
  });
});
