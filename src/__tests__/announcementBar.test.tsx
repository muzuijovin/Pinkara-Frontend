import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { AnnouncementBar } from "@/features/announcement/announcementBar";
import { ANNOUNCEMENTS } from "@/features/announcement/constants/announcements";

// TES BAR PENGUMUMAN (marquee di bawah navbar)
describe("AnnouncementBar", () => {
  it("semua pengumuman tampil sekali untuk screen reader; salinan marquee disembunyikan & tidak bisa di-tab", () => {
    render(<AnnouncementBar />);
    const bar = within(screen.getByRole("region", { name: "Announcements" }));
    // getAllByRole hanya menghitung elemen yang terlihat di accessibility tree -> salinan aria-hidden tidak ikut
    expect(bar.getAllByRole("listitem")).toHaveLength(ANNOUNCEMENTS.length);
    const link = bar.getByRole("link", { name: "Shipping across Indonesia from our studio in Malang" });
    expect(link).toHaveAttribute("href", "/products");

    const hiddenCopy = document.querySelector('ul[aria-hidden="true"]')!;
    expect(hiddenCopy.querySelectorAll("li")).toHaveLength(ANNOUNCEMENTS.length);
    hiddenCopy.querySelectorAll("a").forEach((a) => expect(a).toHaveAttribute("tabindex", "-1"));
  });

  it("tombol pause menghentikan & melanjutkan marquee", async () => {
    const user = userEvent.setup();
    render(<AnnouncementBar />);
    const marquee = document.querySelector(".marquee")!;
    expect(marquee).toHaveAttribute("data-paused", "false");

    await user.click(screen.getByRole("button", { name: "Pause announcements" }));
    expect(marquee).toHaveAttribute("data-paused", "true");
    const play = screen.getByRole("button", { name: "Play announcements" });
    expect(play).toHaveAttribute("aria-pressed", "true");

    await user.click(play);
    expect(marquee).toHaveAttribute("data-paused", "false");
  });

  it("daftar kosong -> bar tidak dirender", () => {
    const { container } = render(<AnnouncementBar items={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
