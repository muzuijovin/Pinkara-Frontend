import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Footer from "@/components/layout/footer";
import { whatsappDisplay } from "@/config/site";
import { ArticleView } from "@/features/(public)/blog/articleView";
import { ARTICLES, findArticle, formatArticleDate, sortedArticles } from "@/features/(public)/blog/articles";
import { BlogList } from "@/features/(public)/blog/blogList";

// TES FOOTER, BLOG & DATA KONTAK
describe("Footer", () => {
  it("kontak: WhatsApp & email toko; Instagram disembunyikan selama belum diisi", () => {
    render(<Footer />);
    const socials = within(screen.getByRole("list", { name: "Follow and contact us" }));
    expect(socials.queryByRole("link", { name: /instagram/i })).not.toBeInTheDocument();
    const whatsapp = socials.getByRole("link", { name: "WhatsApp (opens in a new tab)" });
    expect(whatsapp).toHaveAttribute("href", "https://wa.me/6281935125149");
    expect(whatsapp).toHaveAttribute("rel", "noopener noreferrer");
    expect(socials.getByRole("link", { name: "Email" })).toHaveAttribute("href", "mailto:pinkarastudios@gmail.com");
    expect(screen.getByText("0819-3512-5149")).toBeInTheDocument();
    expect(screen.getByText("pinkarastudios@gmail.com")).toBeInTheDocument();
  });

  it("menu: About us, Blog, Privacy policy & halaman belanja mengarah ke halaman yang ada", () => {
    render(<Footer />);
    const company = within(screen.getByRole("navigation", { name: "Pinkara" }));
    expect(company.getByRole("link", { name: "About us" })).toHaveAttribute("href", "/about");
    expect(company.getByRole("link", { name: "Blog" })).toHaveAttribute("href", "/blog");
    expect(company.getByRole("link", { name: "Privacy policy" })).toHaveAttribute("href", "/privacy");
    const shop = within(screen.getByRole("navigation", { name: "Shop" }));
    expect(shop.getByRole("link", { name: "Flower care guide" })).toHaveAttribute("href", "/blog/flower-care-guide");
    expect(findArticle("flower-care-guide")).toBeDefined();
  });

  it("logo metode bayar & kurir sesuai checkout, dengan teks alternatif", () => {
    render(<Footer />);
    const payments = within(screen.getByRole("heading", { name: "Payment methods" }).parentElement!);
    for (const name of ["QRIS", "BCA", "BNI", "BRI", "Permata Bank"]) {
      expect(payments.getByRole("img", { name })).toHaveAttribute("src", expect.stringContaining("/images/brands/"));
    }
    const couriers = within(screen.getByRole("heading", { name: "Shipping partners" }).parentElement!);
    for (const name of ["JNE", "J&T Express", "GoSend by Gojek", "GrabExpress"]) expect(couriers.getByRole("img", { name })).toBeInTheDocument();
  });

  it("nomor WhatsApp tampil format lokal", () => {
    expect(whatsappDisplay).toMatch(/^08\d{2}-\d{4}-\d+$/);
  });
});

describe("Blog", () => {
  it("slug unik; urutan terbaru dulu; tanggal tanpa zona waktu", () => {
    expect(new Set(ARTICLES.map((article) => article.slug)).size).toBe(ARTICLES.length);
    const dates = sortedArticles().map((article) => article.publishedAt);
    expect(dates).toEqual([...dates].sort().reverse());
    expect(formatArticleDate("2026-11-03")).toBe("3 November 2026");
  });

  it("daftar artikel: setiap kartu menuju halaman artikelnya", () => {
    render(<BlogList />);
    expect(screen.getByRole("heading", { level: 1, name: "Notes from the studio" })).toBeInTheDocument();
    for (const article of ARTICLES) {
      expect(screen.getByRole("link", { name: article.title })).toHaveAttribute("href", `/blog/${article.slug}`);
    }
  });

  it("halaman artikel: judul, tips, artikel lain (tanpa dirinya sendiri)", () => {
    const article = findArticle("flower-care-guide")!;
    render(<ArticleView article={article} />);
    expect(screen.getByRole("heading", { level: 1, name: article.title })).toBeInTheDocument();
    expect(screen.getByText(/Tip:/)).toBeInTheDocument();
    const more = within(screen.getByRole("navigation", { name: "More from the blog" }));
    expect(more.queryByRole("link", { name: article.title })).not.toBeInTheDocument();
    expect(more.getAllByRole("link").length).toBeGreaterThan(0);
  });
});
