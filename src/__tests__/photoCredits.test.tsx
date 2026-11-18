import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { photoCredit } from "@/config/photoCredits";
import { ProductGallery } from "@/features/(public)/productDetail/components/productGallery";

// TES KREDIT FOTO UNSPLASH: foto produk sementara dari Unsplash wajib menampilkan nama fotografer
const unsplash = "https://images.unsplash.com/photo-1548094967-e25a127d1f6d?crop=entropy&w=1080";

describe("photoCredit", () => {
  it("foto Unsplash -> kredit fotografer; foto lain / URL rusak -> null", () => {
    expect(photoCredit(unsplash)).toMatchObject({ author: "Bence Balla-Schottner" });
    expect(photoCredit("https://res.cloudinary.com/demo/image/upload/rose.webp")).toBeNull();
    expect(photoCredit("https://images.unsplash.com/photo-unknown")).toBeNull();
    expect(photoCredit("bukan url")).toBeNull();
  });
});

describe("ProductGallery", () => {
  it("foto Unsplash -> 'Photo by <nama> on Unsplash' dengan link", () => {
    render(<ProductGallery images={[unsplash]} name="Round Bouquet" />);
    expect(screen.getByText(/Photo by/)).toHaveTextContent("Photo by Bence Balla-Schottner on Unsplash");
    expect(screen.getByRole("link", { name: "Bence Balla-Schottner" })).toHaveAttribute("href", expect.stringContaining("utm_source=pinkara"));
    expect(screen.getByRole("link", { name: "Unsplash" })).toHaveAttribute("target", "_blank");
  });

  it("foto upload sendiri -> tanpa kredit", () => {
    render(<ProductGallery images={["https://res.cloudinary.com/demo/image/upload/rose.webp"]} name="Round Bouquet" />);
    expect(screen.queryByText(/Photo by/)).not.toBeInTheDocument();
  });
});
