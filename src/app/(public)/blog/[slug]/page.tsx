import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleView } from "@/features/(public)/blog/articleView";
import { ARTICLES, findArticle } from "@/features/(public)/blog/articles";

type Props = { params: Promise<{ slug: string }> };

// semua artikel dibuat statis saat build. Slug lain -> 404 (dynamicParams tidak tersedia dengan cacheComponents)
export function generateStaticParams() {
  return ARTICLES.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = findArticle((await params).slug);
  if (!article) return { title: "Article not found | Pinkara Studio" };
  return { title: `${article.title} | Pinkara Studio`, description: article.excerpt };
}

export default async function BlogArticlePage({ params }: Props) {
  const article = findArticle((await params).slug);
  if (!article) notFound();

  return (
    <div className="bg-page">
      <ArticleView article={article} />
    </div>
  );
}
