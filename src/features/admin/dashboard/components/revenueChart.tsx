"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { formatCompactRupiah, formatRupiah } from "@/lib/currency.lib";
import type { DashboardSales } from "@/types/dashboard.type";

const HEIGHT = 240;
const PAD = { top: 16, right: 16, bottom: 28, left: 56 };

// batas atas sumbu y yang "rapi": 1, 2, 2.5, 5 x 10^n
function niceMax(value: number) {
  if (value <= 0) return 100_000;
  const exponent = 10 ** Math.floor(Math.log10(value));
  const fraction = value / exponent;
  const nice = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 2.5 ? 2.5 : fraction <= 5 ? 5 : 10;
  return nice * exponent;
}

// "2026-11-13" -> "13 Nov", "2026-11-13 09:00" -> "09:00"
function pointLabel(label: string, granularity: "hour" | "day") {
  if (granularity === "hour") return label.slice(11);
  const [, month, day] = label.split("-");
  return `${Number(day)} ${new Date(2000, Number(month) - 1, 1).toLocaleString("en-GB", { month: "short" })}`;
}

// lebar wadah grafik (SVG digambar ulang sesuai lebar, teks tidak ikut melar).
// useEffect hanya untuk mengukur elemen, bukan fetch data
function useWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return { ref, width };
}

// grafik omzet per jam / per hari (PRD §12.2b): 1 seri -> tanpa legenda, judul sudah menjelaskan.
// Hover / panah kiri-kanan -> crosshair + tooltip. Tabel tersedia untuk pembaca layar & yang butuh angka pasti
export function RevenueChart({ series }: { series: DashboardSales["series"] }) {
  const { ref, width } = useWidth();
  const [active, setActive] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);
  const points = series.points;

  const innerWidth = Math.max(width - PAD.left - PAD.right, 1);
  const innerHeight = HEIGHT - PAD.top - PAD.bottom;
  const max = niceMax(Math.max(...points.map((point) => point.revenue), 0));
  const x = (index: number) => PAD.left + (points.length <= 1 ? innerWidth / 2 : (index / (points.length - 1)) * innerWidth);
  const y = (value: number) => PAD.top + innerHeight - (value / max) * innerHeight;

  const line = points.map((point, index) => `${index ? "L" : "M"}${x(index)},${y(point.revenue)}`).join(" ");
  const area = points.length ? `${line} L${x(points.length - 1)},${y(0)} L${x(0)},${y(0)} Z` : "";
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => ratio * max);
  // label sumbu x secukupnya (maks ~6) supaya tidak bertumpuk
  const labelEvery = Math.max(1, Math.ceil(points.length / 6));
  const total = points.reduce((sum, point) => sum + point.revenue, 0);

  const onKeyDown = (event: KeyboardEvent<SVGSVGElement>) => {
    if (event.key === "ArrowRight") setActive((current) => Math.min((current ?? -1) + 1, points.length - 1));
    if (event.key === "ArrowLeft") setActive((current) => Math.max((current ?? points.length) - 1, 0));
    if (event.key === "Escape") setActive(null);
  };

  const activePoint = active !== null ? points[active] : null;

  return (
    <section aria-labelledby="revenue-title" className="card border border-base-300 bg-base-100">
      <div className="card-body gap-3 p-4 sm:p-5">
        <header className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="revenue-title" className="font-semibold text-ink">
            Revenue {series.granularity === "hour" ? "by hour" : "by day"}
          </h2>
          <button type="button" onClick={() => setShowTable((value) => !value)} className="btn btn-ghost btn-xs h-8 text-accent-text">
            {showTable ? "View as chart" : "View as table"}
          </button>
        </header>

        {showTable ? (
          <div className="max-h-72 overflow-y-auto">
            <table className="table table-sm">
              <thead>
                <tr className="text-ink-muted">
                  <th>{series.granularity === "hour" ? "Hour" : "Date"}</th>
                  <th className="text-right">Orders</th>
                  <th className="text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {points.map((point) => (
                  <tr key={point.label}>
                    <td>{pointLabel(point.label, series.granularity)}</td>
                    <td className="text-right tabular-nums">{point.orders}</td>
                    <td className="text-right tabular-nums">{formatRupiah(point.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div ref={ref} className="relative">
            {width > 0 && (
              <svg
                width={width}
                height={HEIGHT}
                role="img"
                tabIndex={0}
                aria-label={`Revenue chart, total ${formatRupiah(total)}. Use left and right arrow keys to read each point.`}
                onKeyDown={onKeyDown}
                onMouseLeave={() => setActive(null)}
                onBlur={() => setActive(null)}
                className="block rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                {/* grid & sumbu: hairline solid, tidak bersaing dengan data */}
                {ticks.map((tick) => (
                  <g key={tick}>
                    <line x1={PAD.left} x2={width - PAD.right} y1={y(tick)} y2={y(tick)} className="stroke-base-300" strokeWidth={1} />
                    <text x={PAD.left - 8} y={y(tick)} dy="0.32em" textAnchor="end" className="fill-ink-muted text-[11px] tabular-nums">
                      {formatCompactRupiah(tick)}
                    </text>
                  </g>
                ))}
                {points.map((point, index) =>
                  index % labelEvery === 0 || index === points.length - 1 ? (
                    <text key={point.label} x={x(index)} y={HEIGHT - 8} textAnchor="middle" className="fill-ink-muted text-[11px]">
                      {pointLabel(point.label, series.granularity)}
                    </text>
                  ) : null,
                )}

                <path d={area} className="fill-primary/10" />
                <path d={line} fill="none" className="stroke-primary" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

                {activePoint && active !== null && (
                  <g>
                    <line x1={x(active)} x2={x(active)} y1={PAD.top} y2={y(0)} className="stroke-ink-muted/50" strokeWidth={1} />
                    <circle cx={x(active)} cy={y(activePoint.revenue)} r={5} className="fill-primary stroke-base-100" strokeWidth={2} />
                  </g>
                )}

                {/* area hover per titik, lebih lebar dari titiknya */}
                {points.map((point, index) => (
                  <rect
                    key={point.label}
                    x={x(index) - innerWidth / Math.max(points.length - 1, 1) / 2}
                    y={PAD.top}
                    width={innerWidth / Math.max(points.length - 1, 1)}
                    height={innerHeight}
                    fill="transparent"
                    onMouseEnter={() => setActive(index)}
                  />
                ))}
              </svg>
            )}

            {activePoint && active !== null && (
              <div
                role="status"
                className="pointer-events-none absolute top-2 z-10 -translate-x-1/2 rounded-lg border border-base-300 bg-base-100 px-3 py-2 text-xs shadow-md"
                style={{ left: Math.min(Math.max(x(active), 80), width - 80) }}
              >
                <p className="font-medium text-ink">{pointLabel(activePoint.label, series.granularity)}</p>
                <p className="tabular-nums text-ink">{formatRupiah(activePoint.revenue)}</p>
                <p className="text-ink-muted">
                  {activePoint.orders} {activePoint.orders === 1 ? "order" : "orders"}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
