import { PiWarningCircle } from "react-icons/pi";

// error dari server ditampilkan di atas form; role="alert" supaya dibacakan screen reader
export function FormAlert({ message }: { message: string }) {
  return (
    <div role="alert" className="alert alert-error alert-soft items-start text-sm">
      <PiWarningCircle aria-hidden="true" size={20} className="shrink-0" />
      <span>{message}</span>
    </div>
  );
}
