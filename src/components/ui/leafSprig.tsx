// ranting daun dekoratif (SVG solid, warna dari token green-brand logo). Hanya hiasan:
// tersembunyi dari pembaca layar & tidak bisa diklik. Ukuran & posisi diatur lewat className (w-*, absolute, rotate-*)

// satu daun mengarah ke kanan dari titik (0,0): panjang 70, lebar 32
const LEAF = "M0 0C16 -18 46 -20 70 0C46 20 16 18 0 0Z";

// posisi daun di sepanjang batang: x, y, sudut (derajat)
const LEAVES: [number, number, number][] = [
  [98, 24, -95],
  [99, 52, -40],
  [100, 78, -140],
  [101, 108, -35],
  [102, 138, -145],
  [101, 168, -32],
  [99, 198, -150],
];

type LeafSprigProps = {
  className?: string;
  tone?: "pale" | "soft"; // pale = paling pucat (latar), soft = sedikit lebih terlihat
};

export function LeafSprig({ className = "", tone = "pale" }: LeafSprigProps) {
  const leaf = tone === "soft" ? "fill-green-brand-200" : "fill-green-brand-100";
  const vein = tone === "soft" ? "stroke-green-brand-300" : "stroke-green-brand-200";

  return (
    <svg viewBox="0 0 200 250" aria-hidden="true" focusable="false" className={`pointer-events-none select-none ${className}`}>
      {/* batang */}
      <path d="M100 248C95 190 106 120 98 16" fill="none" strokeWidth="3" strokeLinecap="round" className={vein} />
      {LEAVES.map(([x, y, angle]) => (
        <g key={`${x}-${y}`} transform={`translate(${x} ${y}) rotate(${angle})`}>
          <path d={LEAF} className={leaf} />
          {/* tulang daun */}
          <path d="M4 0H60" fill="none" strokeWidth="2" strokeLinecap="round" className={vein} />
        </g>
      ))}
    </svg>
  );
}
