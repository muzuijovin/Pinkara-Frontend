import Image from "next/image";
import Link from "next/link";
import { formatArticleDate, sortedArticles } from "./articles";

// daftar artikel blog (terbaru dulu): kartu dengan sampul, kategori, tanggal & lama baca
export function BlogList() {
  const articles = sortedArticles();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-10 md:px-6 md:py-14">
      <header className="flex max-w-2xl flex-col gap-3">
        <p className="w-fit rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent-text">Blog</p>
        <h1 className="text-4xl font-bold tracking-tight text-balance text-ink">Notes from the studio</h1>
        <p className="text-base leading-relaxed text-ink-muted">Flower care tips and gifting ideas from our florists in Malang.</p>
      </header>

      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article, index) => (
          <li key={article.slug}>
            <article className="group relative flex h-full flex-col overflow-hidden rounded-box border border-base-300 bg-base-100 transition-shadow duration-200 hover:shadow-md has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary">
              <div className="relative aspect-3/2 overflow-hidden bg-surface-muted">
                <Image
                  src={article.cover.src}
                  alt={article.cover.alt}
                  fill
                  priority={index === 0}
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
              </div>
              <div className="flex flex-1 flex-col gap-2 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-accent-text">{article.category}</p>
                <h2 className="text-lg font-semibold text-balance text-ink">
                  {/* seluruh kartu bisa diklik lewat link judul */}
                  <Link
                    href={`/blog/${article.slug}`}
                    className="after:absolute after:inset-0 focus-visible:outline-none"
                  >
                    {article.title}
                  </Link>
                </h2>
                <p className="text-sm leading-relaxed text-ink-muted">{article.excerpt}</p>
                <p className="mt-auto pt-2 text-xs text-ink-muted">
                  <time dateTime={article.publishedAt}>{formatArticleDate(article.publishedAt)}</time> · {article.readMinutes} min read
                </p>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}
