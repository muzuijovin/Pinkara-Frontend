import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SingleImageInput } from "@/components/form/singleImageInput";

// TES INPUT 1 FOTO (add-on, kategori, galeri): validasi tipe & ukuran, mode opsional vs wajib
const toast = vi.hoisted(() => ({ error: vi.fn(), success: vi.fn() }));
vi.mock("react-toastify", () => ({ toast }));

const setup = (props: Partial<Parameters<typeof SingleImageInput>[0]> = {}) => {
  const onFileChange = vi.fn();
  const onRemovedChange = vi.fn();
  render(
    <SingleImageInput label="Photo" currentUrl={null} file={null} removed={false} onFileChange={onFileChange} onRemovedChange={onRemovedChange} {...props} />,
  );
  return { user: userEvent.setup({ applyAccept: false }), onFileChange, onRemovedChange };
};
const png = (bytes = 10) => new File([new Uint8Array(bytes)], "photo.png", { type: "image/png" });

describe("SingleImageInput", () => {
  it("pilih foto valid -> onFileChange", async () => {
    const { user, onFileChange, onRemovedChange } = setup();
    const file = png();
    await user.upload(screen.getByLabelText(/upload photo/i), file);
    expect(onFileChange).toHaveBeenCalledWith(file);
    expect(onRemovedChange).toHaveBeenCalledWith(false);
  });

  it("tipe bukan gambar / lebih dari 5 MB ditolak", async () => {
    const { user, onFileChange } = setup();
    await user.upload(screen.getByLabelText(/upload photo/i), new File(["x"], "doc.pdf", { type: "application/pdf" }));
    expect(toast.error).toHaveBeenCalledWith("Photo must be JPG, PNG, or WebP");
    await user.upload(screen.getByLabelText(/upload photo/i), png(5 * 1024 * 1024 + 1));
    expect(toast.error).toHaveBeenCalledWith("Photo must be 5 MB or smaller");
    expect(onFileChange).not.toHaveBeenCalled();
  });

  it("mode opsional: foto tersimpan bisa dihapus", async () => {
    const { user, onRemovedChange } = setup({ currentUrl: "https://res.cloudinary.com/test/a.webp" });
    expect(screen.getByText(/^Optional/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Remove" }));
    expect(onRemovedChange).toHaveBeenCalledWith(true);
  });

  it("mode wajib: foto tersimpan tidak bisa dihapus, pesan error tampil", () => {
    setup({ required: true, currentUrl: "https://res.cloudinary.com/test/a.webp", error: "Please choose a photo" });
    expect(screen.queryByRole("button", { name: "Remove" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Undo" })).not.toBeInTheDocument();
    expect(screen.getByText(/^Required/)).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Please choose a photo");
  });

  it("mode wajib + foto baru: Undo hanya membatalkan foto baru", async () => {
    const { user, onFileChange, onRemovedChange } = setup({ required: true, currentUrl: "https://res.cloudinary.com/test/a.webp", file: png() });
    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(onFileChange).toHaveBeenCalledWith(null);
    expect(onRemovedChange).not.toHaveBeenCalled();
  });
});
