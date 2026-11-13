import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { MessageInput } from "@/features/(costumer)/customRequest/discussion/components/messageInput";
import { MessageList, pendingMessage } from "@/features/(costumer)/customRequest/discussion/components/messageList";
import type { CustomMessage } from "@/types/customRequest.type";

// TES CHAT: pesan langsung tampil saat dikirim (koneksi database bisa beberapa detik), gagal -> isi dikembalikan
const sent: CustomMessage = {
  id: "m1",
  body: "Hi, can I get pastel colors?",
  attachments: [],
  readAt: null,
  createdAt: "2026-11-14T03:00:00.000Z",
  mine: true,
  sender: { name: "Rina", role: "CUSTOMER", avatarUrl: null },
};

describe("MessageInput", () => {
  it("kirim -> kolom langsung kosong, isi dikirim; restore -> teks kembali", async () => {
    const user = userEvent.setup();
    let restore: () => void = () => undefined;
    const onSend = vi.fn((_message, restoreFn: () => void) => {
      restore = restoreFn;
    });
    render(<MessageInput onSend={onSend} isPending={false} />);
    const box = screen.getByRole("textbox", { name: "Message" });

    await user.type(box, "Pastel please{Enter}");
    expect(onSend).toHaveBeenCalledWith({ body: "Pastel please", attachments: [], previewUrls: [] }, expect.any(Function));
    expect(box).toHaveValue("");

    restore();
    expect(await screen.findByDisplayValue("Pastel please")).toBeInTheDocument();
  });

  it("sedang mengirim -> tombol kirim nonaktif", () => {
    render(<MessageInput onSend={vi.fn()} isPending />);
    expect(screen.getByRole("button", { name: "Send message" })).toBeDisabled();
  });
});

describe("MessageList: pesan yang sedang dikirim", () => {
  // jsdom tidak punya scrollIntoView (dipakai untuk menggulir ke pesan terbaru)
  beforeAll(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });

  it("tampil di akhir dengan 'Sending…' (tanpa waktu), pesan lain tetap tampil", () => {
    render(<MessageList messages={[sent, pendingMessage({ body: "Thank you!", previewUrls: [] })]} otherLabel={() => "Florist"} emptyText="-" />);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[1]).toHaveTextContent("Thank you!");
    expect(items[1]).toHaveTextContent("Sending…");
    expect(items[1]).toHaveAttribute("aria-busy", "true");
    expect(items[0]).not.toHaveTextContent("Sending…");
  });

  it("pesan berisi foto saja: lampiran pratinjau ikut tampil", () => {
    render(<MessageList messages={[pendingMessage({ body: "  ", previewUrls: ["blob:preview-1"] })]} otherLabel={() => "Florist"} emptyText="-" />);
    expect(screen.getByRole("link", { name: "Open attachment 1" })).toHaveAttribute("href", "blob:preview-1");
  });
});
