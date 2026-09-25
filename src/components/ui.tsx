import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { cn } from "../utils/cn";
import type { SourceTag } from "../lib/simulator";

/* ---------------- reduced motion ---------------- */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/* ---------------- animated number ---------------- */
export function useTicker(target: number, duration = 550): number {
  const [value, setValue] = useState(target);
  const fromRef = useRef(target);
  const rafRef = useRef(0);

  useEffect(() => {
    if (prefersReducedMotion()) {
      fromRef.current = target;
      setValue(target);
      return;
    }
    const from = fromRef.current;
    if (from === target) return;
    const t0 = performance.now();
    cancelAnimationFrame(rafRef.current);
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const e = 1 - Math.pow(1 - p, 3);
      setValue(from + (target - from) * e);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return value;
}

export function Ticker({
  value,
  format,
  className,
}: {
  value: number;
  format: (n: number) => string;
  className?: string;
}) {
  const v = useTicker(value);
  return <span className={cn("tabular-nums", className)}>{format(v)}</span>;
}

/* ---------------- reveal on scroll ---------------- */
export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "li" | "figure" | "header";
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      el.classList.add("is-in");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      data-reveal
      className={className}
      style={{ "--rd": `${delay}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}

/* ---------------- glass tile ---------------- */
export function Tile({
  children,
  className,
  lift = false,
}: {
  children: ReactNode;
  className?: string;
  lift?: boolean;
}) {
  return <div className={cn("tile", lift && "tile-lift", className)}>{children}</div>;
}

/* ---------------- section header ---------------- */
export function SectionHead({
  index,
  eyebrow,
  title,
  lead,
  align = "left",
}: {
  index: string;
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: "left" | "center";
}) {
  return (
    <Reveal
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
      )}
    >
      <div
        className={cn(
          "mono-label mb-5 flex items-center gap-4",
          align === "center" && "justify-center",
        )}
      >
        <span className="text-[#55d6ff]/80">{index}</span>
        <span className="h-px w-10 bg-white/20" aria-hidden />
        <span>{eyebrow}</span>
      </div>
      <h2 className="numeral text-[clamp(34px,4.6vw,64px)] text-paper">{title}</h2>
      {lead && (
        <p className="mt-6 text-[17px] leading-relaxed text-paper/60">{lead}</p>
      )}
    </Reveal>
  );
}

/* ---------------- source tag ---------------- */
const TAG_STYLE: Record<SourceTag, { label: string; cls: string }> = {
  fornito: { label: "Dato fornito", cls: "border-[#55d6ff]/30 text-[#55d6ff]/90" },
  scenario: { label: "Scenario", cls: "border-white/25 text-paper/70" },
  ipotesi: { label: "Ipotesi", cls: "border-[#e8a33d]/35 text-[#e8a33d]/90" },
  benchmark: { label: "Benchmark", cls: "border-[#4c8dff]/40 text-[#4c8dff]" },
  utente: { label: "Scelta utente", cls: "border-white/40 text-paper/85" },
};

export function SourceBadge({ tag }: { tag: SourceTag }) {
  const t = TAG_STYLE[tag];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[4px] border px-1.5 py-[2px] font-mono text-[9.5px] uppercase tracking-[0.12em]",
        t.cls,
      )}
    >
      {t.label}
    </span>
  );
}

/* ---------------- precision slider ---------------- */
export function PrecisionSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  tag,
  unit,
  format,
  note,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  tag: SourceTag;
  unit?: string;
  format?: (n: number) => string;
  note?: string;
}) {
  const p = ((value - min) / (max - min)) * 100;
  const shown = format ? format(value) : `${value}${unit ?? ""}`;
  return (
    <div className="group">
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <label className="flex min-w-0 items-center gap-2 text-[13px] font-medium text-paper/75">
          <span className="truncate">{label}</span>
          <SourceBadge tag={tag} />
        </label>
        <span className="numeral shrink-0 text-[15px] font-semibold text-paper">
          {shown}
        </span>
      </div>
      <input
        type="range"
        className="pslider"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        style={{ "--p": `${p}%` } as CSSProperties}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
      <div className="pslider-ticks" aria-hidden>
        {[0, 25, 50, 75, 100].map((t) => (
          <span key={t} style={{ left: `${t}%` }} />
        ))}
      </div>
      <div className="flex justify-between font-mono text-[9px] tracking-[0.06em] text-paper/25" aria-hidden>
        <span>{format ? format(min) : `${min}${unit ?? ""}`}</span>
        <span>{format ? format(max) : `${max}${unit ?? ""}`}</span>
      </div>
      {note && <p className="mt-1 text-[11.5px] leading-snug text-paper/38">{note}</p>}
    </div>
  );
}

/* ---------------- AS-IS vs TO-BE comparison card ---------------- */
export function CompareStat({
  label,
  asIs,
  toBe,
  format,
  invert = true,
  suffix,
  note,
}: {
  label: string;
  asIs: number;
  toBe: number;
  format: (n: number) => string;
  /** true = la riduzione è un miglioramento */
  invert?: boolean;
  suffix?: string;
  note?: string;
}) {
  const max = Math.max(asIs, toBe, 1);
  const delta = asIs !== 0 ? ((toBe - asIs) / asIs) * 100 : toBe > 0 ? 100 : 0;
  const good = invert ? delta <= 0 : delta >= 0;
  const deltaTxt =
    asIs === 0 && toBe > 0
      ? "nuovo"
      : `${delta > 0 ? "+" : "−"}${Math.abs(delta) >= 99.5 && delta < 0 ? "99" : Math.abs(delta).toFixed(0)}%`;

  return (
    <div className="tile-flat p-4 transition-colors duration-300 hover:border-[#55d6ff]/25">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="mono-label text-[10px]!">{label}</span>
        <span
          className={cn(
            "numeral rounded-[5px] border px-1.5 py-[2px] text-[11px] font-semibold",
            good
              ? "border-[#55d6ff]/35 bg-[#55d6ff]/8 text-[#55d6ff]"
              : "border-[#e8a33d]/35 bg-[#e8a33d]/8 text-[#e8a33d]",
          )}
        >
          {deltaTxt}
        </span>
      </div>
      <div className="space-y-2.5">
        <div>
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#e8a33d]/75">
              As-is
            </span>
            <Ticker
              value={asIs}
              format={format}
              className="numeral text-[19px] font-semibold text-paper/90"
            />
          </div>
          <div className="mt-1 h-[3px] overflow-hidden rounded-full bg-white/6">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#e8a33d]/80 to-[#e8a33d]/45 transition-[width] duration-700"
              style={{ width: `${(asIs / max) * 100}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#55d6ff]/80">
              To-be
            </span>
            <Ticker
              value={toBe}
              format={format}
              className="numeral text-[19px] font-semibold text-[#bfeaff]"
            />
          </div>
          <div className="mt-1 h-[3px] overflow-hidden rounded-full bg-white/6">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#55d6ff] to-[#4c8dff] transition-[width] duration-700"
              style={{ width: `${(toBe / max) * 100}%` }}
            />
          </div>
        </div>
      </div>
      {note || suffix ? (
        <p className="mt-2.5 text-[11px] leading-snug text-paper/40">{note ?? suffix}</p>
      ) : null}
    </div>
  );
}

/* ---------------- simple labeled stat ---------------- */
export function Stat({
  label,
  value,
  format,
  accent = false,
  sub,
}: {
  label: string;
  value: number;
  format: (n: number) => string;
  accent?: boolean;
  sub?: string;
}) {
  return (
    <div>
      <div className="mono-label mb-1.5">{label}</div>
      <div
        className={cn(
          "numeral text-[22px] font-semibold",
          accent ? "text-[#55d6ff]" : "text-paper",
        )}
      >
        <Ticker value={value} format={format} />
      </div>
      {sub && <div className="mt-1 text-[11.5px] text-paper/40">{sub}</div>}
    </div>
  );
}
