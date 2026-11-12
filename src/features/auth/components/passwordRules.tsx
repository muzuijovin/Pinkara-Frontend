import { PiCheckCircleFill, PiCircle } from "react-icons/pi";
import { PASSWORD_RULES } from "@/features/validation/authSchema";

// checklist syarat password yang ikut berubah saat user mengetik (ikon + teks, tidak cuma warna)
export function PasswordRules({ value, id }: { value: string; id?: string }) {
  return (
    <ul id={id} aria-label="Password requirements" className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
      {PASSWORD_RULES.map((rule) => {
        const passed = rule.test(value);
        return (
          <li
            key={rule.label}
            className={`flex items-center gap-1.5 ${passed ? "text-success-text" : "text-ink-muted"}`}
          >
            {passed ? (
              <PiCheckCircleFill aria-hidden="true" size={16} />
            ) : (
              <PiCircle aria-hidden="true" size={16} />
            )}
            <span>
              {rule.label}
              <span className="sr-only">{passed ? " (met)" : " (not met)"}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
