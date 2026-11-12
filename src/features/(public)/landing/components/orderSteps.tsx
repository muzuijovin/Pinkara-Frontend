import Link from "next/link";
import type { IconType } from "react-icons";
import {
  PiArrowRight,
  PiChatsCircle,
  PiCreditCard,
  PiFlowerTulip,
  PiHandHeart,
  PiPencilSimpleLine,
  PiReceipt,
  PiShoppingCartSimple,
  PiTruck,
} from "react-icons/pi";

type Step = { icon: IconType; title: string; text: string };

// Cara pesan (PRD §6.1): dua jalur — Ready Stock (3 langkah) & Custom (5 langkah, PRD §8)
const READY_STEPS: Step[] = [
  { icon: PiShoppingCartSimple, title: "Pick your flowers", text: "Choose a size and add a box, paper bag, or gift card." },
  { icon: PiCreditCard, title: "Check out & pay", text: "Pay with QRIS or bank transfer. Your items are reserved right away." },
  { icon: PiTruck, title: "We deliver", text: "We pack it with care and send it, or you pick it up at the studio." },
];

const CUSTOM_STEPS: Step[] = [
  { icon: PiPencilSimpleLine, title: "Send your brief", text: "Colors, flowers, size, and when you need it." },
  { icon: PiChatsCircle, title: "Chat with our florist", text: "Fine-tune the details together." },
  { icon: PiReceipt, title: "Get a quote", text: "Price and ready date, valid for 48 hours." },
  { icon: PiCreditCard, title: "Approve & pay", text: "Pay in full to lock in your order." },
  { icon: PiHandHeart, title: "We craft & deliver", text: "See progress photos, then receive your piece." },
];

function StepList({ steps }: { steps: Step[] }) {
  return (
    <ol className="flex flex-col gap-5">
      {steps.map(({ icon: Icon, title, text }, index) => (
        <li key={title} className="flex gap-4">
          <span className="relative flex size-11 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-text">
            <Icon aria-hidden="true" size={22} />
            <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-content">
              {index + 1}
            </span>
          </span>
          <div>
            <p className="font-semibold text-ink">{title}</p>
            <p className="text-sm leading-relaxed text-ink-muted">{text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function OrderSteps() {
  return (
    <section aria-labelledby="steps-title" className="mx-auto w-full max-w-7xl px-4 md:px-6">
      <header className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-accent-text">How to order</p>
        <h2 id="steps-title" className="mt-1 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Ready to send, or made just for you
        </h2>
      </header>

      <div className="mt-8 grid gap-4 lg:grid-cols-2 lg:gap-6">
        <article className="card border border-base-300 bg-base-100">
          <div className="card-body gap-6 p-6 sm:p-8">
            <header className="flex items-center gap-3">
              <PiShoppingCartSimple aria-hidden="true" size={26} className="text-primary" />
              <div>
                <h3 className="text-lg font-semibold text-ink">Ready stock</h3>
                <p className="text-sm text-ink-muted">3 easy steps</p>
              </div>
            </header>
            <StepList steps={READY_STEPS} />
            <Link href="/products" className="btn btn-primary mt-auto h-11 gap-2 self-start">
              Browse catalog
              <PiArrowRight aria-hidden="true" size={16} />
            </Link>
          </div>
        </article>

        <article className="card border border-base-300 bg-base-100">
          <div className="card-body gap-6 p-6 sm:p-8">
            <header className="flex items-center gap-3">
              <PiFlowerTulip aria-hidden="true" size={26} className="text-primary" />
              <div>
                <h3 className="text-lg font-semibold text-ink">Custom order</h3>
                <p className="text-sm text-ink-muted">Made to your idea in 5 steps</p>
              </div>
            </header>
            <StepList steps={CUSTOM_STEPS} />
            <Link href="/custom-order" className="btn btn-outline btn-primary mt-auto h-11 gap-2 self-start">
              Start a custom order
              <PiArrowRight aria-hidden="true" size={16} />
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}
