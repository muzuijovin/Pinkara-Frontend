import type { Metadata } from "next";
import { BlogList } from "@/features/(public)/blog/blogList";

export const metadata: Metadata = {
  title: "Blog | Pinkara Studio",
  description: "Flower care tips and gifting ideas from Pinkara Studio's florists in Malang.",
};

// blog statis: artikel ada di src/features/(public)/blog/articles.ts
export default function BlogPage() {
  return (
    <div className="bg-page">
      <BlogList />
    </div>
  );
}
