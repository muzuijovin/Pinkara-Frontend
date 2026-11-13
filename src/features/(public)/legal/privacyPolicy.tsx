import Link from "next/link";
import { emailUrl, SITE, whatsappDisplay, whatsappUrl } from "@/config/site";

// tanggal berlaku kebijakan: ubah setiap kali isi kebijakan diubah
const LAST_UPDATED = "13 November 2026";

const SECTIONS: { id: string; title: string; body: React.ReactNode }[] = [
  {
    id: "data-we-collect",
    title: "Information we collect",
    body: (
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <strong className="text-ink">Account details:</strong> your name, email address, and password (stored encrypted). If you sign in with Google, we receive
          your name, email, and profile photo from Google.
        </li>
        <li>
          <strong className="text-ink">Delivery details:</strong> recipient name and phone number, street address, district, postal code, and the map pin you
          place for the delivery location.
        </li>
        <li>
          <strong className="text-ink">Order details:</strong> the products and add-ons you order, gift card messages, notes, and order history.
        </li>
        <li>
          <strong className="text-ink">Custom orders:</strong> your brief, reference photos, and the messages you exchange with our florists.
        </li>
        <li>
          <strong className="text-ink">Payment status:</strong> the payment method you choose and whether the payment succeeded. Payments are processed by
          Midtrans; we never receive your bank login, PIN, or e-wallet password.
        </li>
      </ul>
    ),
  },
  {
    id: "how-we-use",
    title: "How we use your information",
    body: (
      <ul className="list-disc space-y-2 pl-5">
        <li>To process your orders, confirm payments, and arrange delivery or pick-up.</li>
        <li>To calculate shipping fees and show delivery options for your address.</li>
        <li>To send order updates, notifications, and replies to your custom requests.</li>
        <li>To help you when you contact us, and to keep our website secure.</li>
      </ul>
    ),
  },
  {
    id: "sharing",
    title: "Who we share it with",
    body: (
      <>
        <p>We do not sell your personal data. We only share what is needed to complete your order with:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-ink">Midtrans</strong>, to process QRIS and bank transfer payments.
          </li>
          <li>
            <strong className="text-ink">Biteship and our courier partners</strong> (such as JNE, J&amp;T, GoSend, and GrabExpress), who receive the recipient
            name, phone number, address, and map pin to deliver your order.
          </li>
          <li>
            <strong className="text-ink">Google</strong>, if you choose to sign in with Google.
          </li>
          <li>
            <strong className="text-ink">OpenStreetMap</strong>, which provides the map and receives the place names you search for when pinning your
            address.
          </li>
          <li>Our hosting, database, and image storage providers, who store data on our behalf.</li>
        </ul>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies",
    body: <p>We use essential cookies to keep you signed in and to protect your account. We don&apos;t use advertising or tracking cookies.</p>,
  },
  {
    id: "retention",
    title: "How long we keep it",
    body: (
      <p>
        We keep your account data while your account is active. Order and payment records are kept as long as needed for accounting and legal
        obligations. You can ask us to delete your account at any time.
      </p>
    ),
  },
  {
    id: "your-rights",
    title: "Your rights",
    body: (
      <p>
        In line with Indonesia&apos;s Personal Data Protection Law (Law No. 27 of 2022), you can ask to see, correct, or delete your personal data. You
        can update your name, phone number, and addresses yourself in your{" "}
        <Link href="/profile" className="text-accent-text underline underline-offset-2">
          profile
        </Link>
        . For anything else, contact us using the details below.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: <p>If we change this policy, we&apos;ll update the date at the top of this page. Significant changes will also be announced on our website.</p>,
  },
];

// Kebijakan Privasi: menjelaskan data yang benar-benar dipakai aplikasi (akun, alamat + pin, pesanan, custom,
// pembayaran Midtrans, kurir Biteship, login Google, peta OpenStreetMap). Perlu ditinjau pemilik sebelum rilis
export function PrivacyPolicy() {
  return (
    <article className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10 md:py-14">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">Privacy policy</h1>
        <p className="text-sm text-ink-muted">Last updated: {LAST_UPDATED}</p>
        <p className="text-base leading-relaxed text-ink-muted">
          This policy explains what personal information {SITE.name} collects when you shop with us, how we use it, and the choices you have.
        </p>
      </header>

      <nav aria-labelledby="privacy-contents" className="rounded-box border border-base-300 bg-base-100 p-5">
        <h2 id="privacy-contents" className="mb-2 text-sm font-semibold text-ink">
          On this page
        </h2>
        <ol className="list-decimal space-y-1.5 pl-5 text-sm">
          {SECTIONS.map((section) => (
            <li key={section.id}>
              <a href={`#${section.id}`} className="text-accent-text underline-offset-2 hover:underline">
                {section.title}
              </a>
            </li>
          ))}
          <li>
            <a href="#contact" className="text-accent-text underline-offset-2 hover:underline">
              Contact us
            </a>
          </li>
        </ol>
      </nav>

      {SECTIONS.map((section) => (
        <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`} className="flex scroll-mt-24 flex-col gap-3 text-base leading-relaxed text-ink-muted">
          <h2 id={`${section.id}-title`} className="text-xl font-semibold text-ink">
            {section.title}
          </h2>
          {section.body}
        </section>
      ))}

      <section id="contact" aria-labelledby="contact-title" className="flex scroll-mt-24 flex-col gap-3 text-base leading-relaxed text-ink-muted">
        <h2 id="contact-title" className="text-xl font-semibold text-ink">
          Contact us
        </h2>
        <p>Questions about your data? Reach us at:</p>
        <ul className="space-y-1.5">
          <li>
            Email:{" "}
            <a href={emailUrl} className="text-accent-text underline underline-offset-2">
              {SITE.email}
            </a>
          </li>
          <li>
            WhatsApp:{" "}
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-accent-text underline underline-offset-2">
              {whatsappDisplay}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </li>
          <li>Studio: {SITE.address}</li>
        </ul>
      </section>
    </article>
  );
}
