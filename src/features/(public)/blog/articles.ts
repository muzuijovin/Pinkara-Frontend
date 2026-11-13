// ===== ARTIKEL BLOG (statis) =====
// Tambah artikel = tambah objek di ARTICLES (slug unik, huruf kecil-strip). Urutan tampil: terbaru dulu (publishedAt)

export type ArticleBlock = { type: "p"; text: string } | { type: "h2"; text: string } | { type: "list"; items: string[] } | { type: "tip"; text: string };

export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string; // YYYY-MM-DD
  readMinutes: number;
  cover: { src: string; alt: string };
  body: ArticleBlock[];
};

export const ARTICLES: Article[] = [
  {
    slug: "flower-care-guide",
    title: "How to make your fresh bouquet last longer",
    excerpt: "Simple daily habits that keep fresh flowers looking their best for up to a week.",
    category: "Flower care",
    publishedAt: "2026-11-13",
    readMinutes: 4,
    cover: { src: "/images/categories/hand-bouquet.webp", alt: "Hand-tied bouquet of fresh flowers" },
    body: [
      { type: "p", text: "Fresh flowers are living things. With a little care in the first hour and a few minutes each day, most bouquets stay beautiful for five to seven days." },
      { type: "h2", text: "As soon as it arrives" },
      {
        type: "list",
        items: [
          "Take the bouquet out of its wrapping and remove any leaves that would sit below the water line.",
          "Trim 2–3 cm off each stem at a 45° angle with clean, sharp scissors so the stems can drink.",
          "Place it in a clean vase filled with room-temperature water.",
        ],
      },
      { type: "h2", text: "Every day" },
      {
        type: "list",
        items: [
          "Change the water every one to two days, and rinse the vase when you do.",
          "Re-trim the stems a little every couple of days.",
          "Remove wilted flowers early so they don't shorten the life of the others.",
        ],
      },
      { type: "h2", text: "Where to put it" },
      { type: "p", text: "Keep flowers away from direct sunlight, air-conditioner vents, and ripening fruit. A cool, bright spot gives the longest life." },
      { type: "tip", text: "Bloom boxes and arrangements in floral foam don't go in a vase. Pour a little water into the foam every day instead, until it feels damp." },
    ],
  },
  {
    slug: "flower-color-meanings",
    title: "What flower colors say: a quick guide for gifting",
    excerpt: "Not sure which colors to choose? Here's what each one usually means.",
    category: "Gift ideas",
    publishedAt: "2026-11-12",
    readMinutes: 3,
    cover: { src: "/images/categories/round-bouquet.webp", alt: "Round bouquet with flowers in several colors" },
    body: [
      { type: "p", text: "Colors carry a feeling before a single word is read. When you're choosing a bouquet, these common meanings can help the flowers say what you mean." },
      {
        type: "list",
        items: [
          "Red: love and passion. A classic for anniversaries and romantic moments.",
          "Pink: affection, gratitude, and admiration. Warm without being too intense.",
          "White: purity, respect, and new beginnings. Often chosen for weddings and sympathy.",
          "Yellow: friendship and joy. Bright and cheerful for birthdays and congratulations.",
          "Purple: elegance and admiration. A thoughtful choice for someone special.",
        ],
      },
      { type: "h2", text: "Mixing colors" },
      { type: "p", text: "Soft pastels feel gentle and romantic, while bold contrasts feel festive. If you're unsure, a mix of pink and white works for almost any occasion." },
      { type: "tip", text: "Have a specific color story in mind? Send it in a custom order brief and our florists will arrange it for you." },
    ],
  },
  {
    slug: "choosing-bouquet-size",
    title: "Choosing the right bouquet size",
    excerpt: "From a small thank-you to a grand surprise: how to pick between S, M, L and XL.",
    category: "Gift ideas",
    publishedAt: "2026-11-10",
    readMinutes: 3,
    cover: { src: "/images/categories/bloom-box.webp", alt: "Flower arrangement in a gift box" },
    body: [
      { type: "p", text: "Our round bouquets come in four sizes. The right one depends on the moment, the budget, and how it will be given." },
      {
        type: "list",
        items: [
          "S: a sweet thank-you or a small surprise, easy to carry.",
          "M: our most popular size for birthdays and everyday gifts.",
          "L: a statement bouquet for anniversaries and graduations.",
          "XL: for grand gestures and celebrations that deserve a big entrance.",
        ],
      },
      { type: "h2", text: "Think about the delivery" },
      { type: "p", text: "Larger bouquets need a bigger box, which can raise the shipping fee for out-of-town deliveries. You'll see the exact fee at checkout before you pay." },
      { type: "tip", text: "Giving it in person at a crowded event? A medium bouquet is easier to hold and photograph." },
    ],
  },
];

export const sortedArticles = () => [...ARTICLES].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
export const findArticle = (slug: string) => ARTICLES.find((article) => article.slug === slug);

// "13 November 2026" (tanggal saja, tanpa zona waktu)
export const formatArticleDate = (date: string) => {
  const [year, month, day] = date.split("-").map(Number);
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return `${day} ${months[month - 1]} ${year}`;
};
