import Image from "next/image";
import Link from "next/link";
import { PiArrowLeft, PiLightbulb } from "react-icons/pi";
import { type Article, type ArticleBlock, formatArticleDate, sortedArticles } from "./articles";

function Block({ block }: { block: ArticleBlock }) {
  switch (block.type) {
    case "h2":
      return <h2 className="mt-4 text-xl font-semibold text-ink">{block.text}</h2>;
    case "list":
      return (
        <ul className="list-disc space-y-2 pl-5 marker:text-primary">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    case "tip":
      return (
        <p className="flex gap-3 rounded-box bg-accent-soft/50 p-4 text-ink">
          <PiLightbulb aria-hidden="true" size={22} className="mt-0.5 shrink-0 text-accent-text" />
          <span>
            <strong className="font-semibold">Tip: </strong>
            {block.text}
          </span>
        </p>
      );
    default:
      return <p>{block.text}</p>;
  }
}

// halaman artikel: judul, sampul, isi, lalu artikel lain + ajakan belanja
export function ArticleView({ article }: { article: Article }) {
  const others = sortedArticles()
    .filter((item) => item.slug !== article.slug)
    .slice(0, 2);

  return (
    <article className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10 md:py-14">
      <Link href="/blog" className="flex w-fit items-center gap-1.5 text-sm font-medium text-accent-text hover:underline">
        <PiArrowLeft aria-hidden="true" size={16} />
        All articles
      </Link>

      <header className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent-text">{article.category}</p>
        <h1 className="text-3xl font-bold tracking-tight text-balance text-ink sm:text-4xl">{article.title}</h1>
        <p className="text-sm text-ink-muted">
          <time dateTime={article.publishedAt}>{formatArticleDate(article.publishedAt)}</time> · {article.readMinutes} min read
        </p>
      </header>

      <div className="relative aspect-video overflow-hidden rounded-box bg-surface-muted">
        <Image src={article.cover.src} alt={article.cover.alt} fill priority sizes="(min-width: 768px) 720px, 92vw" className="object-cover" />
      </div>

      <div className="flex flex-col gap-4 text-base leading-relaxed text-ink-muted">
        {article.body.map((block, index) => (
          <Block key={index} block={block} />
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-box border border-base-300 bg-base-100 p-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink">Looking for the perfect bouquet?</p>
        <div className="flex gap-2">
          <Link href="/products" className="btn btn-primary btn-sm h-10 px-4">
            Shop flowers
          </Link>
          <Link href="/custom-order" className="btn btn-outline btn-primary btn-sm h-10 px-4">
            Custom order
          </Link>
        </div>
      </div>

      {others.length > 0 && (
        <nav aria-labelledby="more-articles" className="flex flex-col gap-3 border-t border-base-300 pt-8">
          <h2 id="more-articles" className="text-lg font-semibold text-ink">
            More from the blog
          </h2>
          <ul className="flex flex-col gap-2">
            {others.map((item) => (
              <li key={item.slug}>
                <Link href={`/blog/${item.slug}`} className="text-accent-text underline-offset-2 hover:underline">
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </article>
  );
}
