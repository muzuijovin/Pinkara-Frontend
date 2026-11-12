"use client";

// pesan gift card (PRD §4.4): maks 200 karakter, boleh kosong (kartu polos), nama pengirim opsional / tanpa nama.
// Teks dicetak penjual -> emoji ditolak karena tidak bisa dicetak
export const GIFT_MESSAGE_MAX = 200;
export const SENDER_NAME_MAX = 50;
const EMOJI_REGEX = /\p{Extended_Pictographic}/u;

export const giftMessageError = (message: string) =>
  EMOJI_REGEX.test(message) ? "Emoji can't be printed. Please use letters and punctuation only." : undefined;

export type GiftCardValue = { message: string; senderName: string; anonymous: boolean };

type GiftCardFormProps = {
  value: GiftCardValue;
  onChange: (value: GiftCardValue) => void;
};

export function GiftCardForm({ value, onChange }: GiftCardFormProps) {
  const error = giftMessageError(value.message);
  const signature = value.anonymous ? "" : value.senderName.trim();

  return (
    <div className="flex flex-col gap-3 rounded-box bg-surface-muted p-3">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="gift-message" className="text-sm font-medium text-ink">
          Card message
        </label>
        <textarea
          id="gift-message"
          rows={3}
          maxLength={GIFT_MESSAGE_MAX}
          value={value.message}
          onChange={(event) => onChange({ ...value, message: event.target.value })}
          placeholder="Write your message… (leave empty for a blank card)"
          aria-invalid={error ? true : undefined}
          aria-describedby="gift-message-help"
          className={`textarea w-full bg-base-100 text-base leading-relaxed sm:text-sm ${error ? "textarea-error" : ""}`}
        />
        <div id="gift-message-help" className="flex justify-between gap-3 text-xs">
          <span className={error ? "text-danger-text" : "text-ink-muted"}>
            {error ?? "Printed neatly on thick card stock."}
          </span>
          <span className="shrink-0 tabular-nums text-ink-muted">
            {value.message.length} / {GIFT_MESSAGE_MAX}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="gift-sender" className="text-sm font-medium text-ink">
          From (optional)
        </label>
        <input
          id="gift-sender"
          maxLength={SENDER_NAME_MAX}
          value={value.senderName}
          disabled={value.anonymous}
          onChange={(event) => onChange({ ...value, senderName: event.target.value })}
          placeholder="Your name"
          className="input h-11 w-full bg-base-100 text-base sm:text-sm"
        />
        <label className="flex cursor-pointer items-center gap-2 py-1 text-sm text-ink">
          <input
            type="checkbox"
            checked={value.anonymous}
            onChange={(event) => onChange({ ...value, anonymous: event.target.checked })}
            className="checkbox checkbox-primary checkbox-sm"
          />
          Send anonymously
        </label>
      </div>

      {/* pratinjau kartu */}
      <figure aria-label="Card preview" className="rounded-box border border-base-300 bg-base-100 p-4 text-center">
        <figcaption className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-ink-muted">Preview</figcaption>
        <p className="min-h-10 whitespace-pre-line wrap-break-word font-serif text-sm italic text-ink">
          {value.message.trim() || <span className="text-ink-muted">Blank card</span>}
        </p>
        {signature && <p className="mt-2 text-sm text-ink">— {signature}</p>}
      </figure>
    </div>
  );
}
