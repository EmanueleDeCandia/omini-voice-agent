import { useEffect, useRef, useState } from "react";
import { cn } from "../utils/cn";
import { Reveal, Tile, prefersReducedMotion } from "./ui";
import { fmt0 } from "../lib/simulator";

/* ================= ambient background ================= */

const SPARKS = [
  { left: "8%", top: "30%", sd: "44s", sx: "26px", d: "0s" },
  { left: "22%", top: "64%", sd: "52s", sx: "-18px", d: "6s" },
  { left: "38%", top: "22%", sd: "47s", sx: "14px", d: "12s" },
  { left: "55%", top: "78%", sd: "58s", sx: "-24px", d: "3s" },
  { left: "67%", top: "40%", sd: "41s", sx: "20px", d: "18s" },
  { left: "78%", top: "18%", sd: "50s", sx: "-12px", d: "9s" },
  { left: "88%", top: "58%", sd: "46s", sx: "18px", d: "15s" },
  { left: "45%", top: "48%", sd: "60s", sx: "-20px", d: "22s" },
];

export function AmbientBackground() {
  return (
    <div className="ambient" aria-hidden>
      <div className="ambient-grid" />
      <div className="ambient-blob blob-a" />
      <div className="ambient-blob blob-b" />
      <div className="ambient-blob blob-c" />
      <div className="ambient-energy" />
      {SPARKS.map((s, k) => (
        <span
          key={k}
          className="spark"
          style={{
            left: s.left,
            top: s.top,
            animationDelay: s.d,
            ["--sd" as string]: s.sd,
            ["--sx" as string]: s.sx,
          }}
        />
      ))}
    </div>
  );
}

/* ================= navigation ================= */

const NAV_LINKS = [
  { href: "#perimetro", label: "Perimetro" },
  { href: "#as-is", label: "AS-IS" },
  { href: "#piattaforma", label: "Piattaforma" },
  { href: "#processo", label: "Processo" },
  { href: "#simulatore", label: "ROI" },
];

export function Nav() {
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={cn("nav-shell fixed inset-x-0 top-0 z-50", solid && "nav-solid")}>
      <div className="mx-auto flex h-[68px] max-w-[1440px] items-center justify-between px-6 lg:px-12">
        <a href="#top" className="flex items-center gap-3" aria-label="Omni Customer Care — home">
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden>
            <rect x="1" y="1" width="24" height="24" rx="6" stroke="rgba(85,214,255,0.65)" strokeWidth="1.4" />
            <circle cx="13" cy="13" r="3.2" fill="#55d6ff" />
            <path d="M13 3.5v5M13 17.5v5M3.5 13h5M17.5 13h5" stroke="rgba(244,247,250,0.5)" strokeWidth="1.2" />
          </svg>
          <span className="font-display text-[15px] font-semibold tracking-[0.22em] text-paper">
            OMNI&nbsp;AP
          </span>
        </a>
        <nav className="hidden items-center gap-8 md:flex" aria-label="Principale">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="font-mono text-[11.5px] uppercase tracking-[0.16em] text-paper/55 transition-colors duration-300 hover:text-[#55d6ff]"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <a href="#contatti" className="btn-primary px-5! py-2.5! text-[12px]!">
          Request demo
        </a>
      </div>
    </header>
  );
}

/* ================= live orchestration console ================= */

type FeedLine = { t: string; tag: string; text: string; tone: "cyan" | "blue" | "amber" | "plain" };

const SCRIPT: Omit<FeedLine, "t">[] = [
  { tag: "VOICE", text: "Chiamata inbound · cliente #8412 identificato in 1.2 s", tone: "cyan" },
  { tag: "TOOL", text: "ERP.getStockLevel(VM-2481) → scorte 18% · soglia critica", tone: "blue" },
  { tag: "ORCH", text: "Percorso deciso: rifornimento prioritario · slot 06:30", tone: "plain" },
  { tag: "FLEET", text: "Rotta R-14 ripianificata · +1 fermata · −11 km rispetto a intervento urgente", tone: "cyan" },
  { tag: "CONFIRM", text: "Conferma inviata al cliente · esito registrato", tone: "plain" },
  { tag: "VOICE", text: "Outbound proattivo · cliente #3127 non risponde → retry pianificato h+2", tone: "amber" },
  { tag: "TOOL", text: "SERVICE.openTicket(GUASTO-0912) → tecnico T-07 assegnato", tone: "blue" },
  { tag: "VOICE", text: "Retry outbound · cliente #3127 risponde · programmazione completata", tone: "cyan" },
  { tag: "ORCH", text: "Escalation umana richiesta: caso #C-2214 → operatore con contesto completo", tone: "amber" },
  { tag: "FLEET", text: "Densità rotta R-09 ottimizzata · 14 fermate / 62 km", tone: "plain" },
];

function LiveConsole() {
  const [lines, setLines] = useState<FeedLine[]>([]);
  const [count, setCount] = useState(12847);
  const clockRef = useRef(9 * 3600 + 41 * 60 + 7);
  const idxRef = useRef(0);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setLines(SCRIPT.slice(0, 6).map((l, k) => ({ ...l, t: `09:4${1 + k}:${10 + k * 7}` })));
      return;
    }
    const push = () => {
      clockRef.current += 4 + Math.floor(Math.random() * 9);
      const h = Math.floor(clockRef.current / 3600) % 24;
      const m = Math.floor((clockRef.current % 3600) / 60);
      const s = clockRef.current % 60;
      const t = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
      const next = SCRIPT[idxRef.current % SCRIPT.length];
      idxRef.current += 1;
      setLines((prev) => [...prev.slice(-5), { ...next, t }]);
      setCount((c) => c + 1 + Math.floor(Math.random() * 3));
    };
    push();
    push();
    push();
    const id = setInterval(push, 2100);
    return () => clearInterval(id);
  }, []);

  const toneCls: Record<FeedLine["tone"], string> = {
    cyan: "text-[#55d6ff]",
    blue: "text-[#4c8dff]",
    amber: "text-[#e8a33d]",
    plain: "text-paper/60",
  };

  return (
    <Tile className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/8 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="pulse-dot pulse-dot-cyan h-[6px]! w-[6px]!" />
          <span className="mono-label text-[10px]! text-paper/60!">
            Orchestrator · live
          </span>
        </div>
        <span className="font-mono text-[10.5px] tracking-[0.1em] text-paper/40">
          OMNI AP · PROD
        </span>
      </div>

      <div className="grid grid-cols-2 divide-x divide-white/6 border-b border-white/8">
        <div className="px-5 py-4">
          <div className="mono-label mb-1">Richieste orchestrate oggi</div>
          <div className="numeral text-[30px] text-[#bfeaff]">{fmt0(count)}</div>
        </div>
        <div className="px-5 py-4">
          <div className="mono-label mb-1">Containment senza operatore</div>
          <div className="numeral text-[30px] text-paper">45.6%</div>
        </div>
      </div>

      <div className="flex h-[248px] flex-col justify-end gap-2 px-5 py-4 font-mono text-[11.5px] leading-relaxed">
        {lines.map((l, k) => (
          <div key={`${l.t}-${k}`} className="feed-line flex gap-2.5" style={{ opacity: 0.45 + (k / Math.max(1, lines.length - 1)) * 0.55 }}>
            <span className="shrink-0 text-paper/35">{l.t}</span>
            <span className={cn("w-[52px] shrink-0 font-semibold tracking-wide", toneCls[l.tone])}>
              {l.tag}
            </span>
            <span className="text-paper/72">{l.text}</span>
          </div>
        ))}
        <div className="flex items-center gap-2.5">
          <span className="text-paper/35">--:--:--</span>
          <span className="caret" />
        </div>
      </div>
    </Tile>
  );
}

/* ================= hero ================= */

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-[148px]">
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-end gap-14 px-6 pb-16 lg:grid-cols-[1.15fr_0.85fr] lg:px-12 lg:pb-24">
        <div>
          <Reveal>
            <p className="mono-label mb-7 flex items-center gap-4">
              <span className="text-[#55d6ff]/80">Omni Customer Care</span>
              <span className="h-px w-12 bg-white/20" aria-hidden />
              <span>Voice AI · Multi-Agent · System Integration</span>
            </p>
          </Reveal>
          <Reveal delay={90}>
            <h1 className="numeral max-w-[15ch] text-[clamp(46px,6.6vw,104px)] text-paper">
              Ogni chiamata muove una&nbsp;flotta.
            </h1>
          </Reveal>
          <Reveal delay={180}>
            <p className="mt-8 max-w-[52ch] text-[18px] leading-relaxed text-paper/60">
              Omni collega <strong className="font-semibold text-paper/90">Voice Agent</strong>,{" "}
              <strong className="font-semibold text-paper/90">orchestrazione Multi-Agent</strong> e
              sistemi aziendali per trasformare ogni interazione — inbound o proattiva — in un
              intervento pianificato. Prima che diventi un'emergenza operativa.
            </p>
          </Reveal>
          <Reveal delay={260}>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a href="#simulatore" className="btn-primary">
                Simula lo scenario
              </a>
              <a href="#contatti" className="btn-ghost">
                Request a demo
              </a>
            </div>
          </Reveal>
          <Reveal delay={340}>
            <p className="mt-8 font-mono text-[11px] leading-relaxed tracking-[0.06em] text-paper/35">
              Sense → Understand → Decide → Act → Confirm → Learn
              <br />
              Tool Calling · API · M2M · disponibilità estesa oltre l'orario umano
            </p>
          </Reveal>
        </div>

        <Reveal delay={220}>
          <LiveConsole />
        </Reveal>
      </div>

      <div className="hairline mx-auto max-w-[1440px]" aria-hidden />
    </section>
  );
}

/* ================= CTA + footer ================= */

export function CtaFooter() {
  return (
    <footer id="contatti" className="relative mt-28">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <Reveal>
          <div className="tile relative overflow-hidden px-8 py-16 text-center sm:px-16 lg:py-20">
            <p className="mono-label mb-6 justify-center">Attivazione</p>
            <h2 className="numeral mx-auto max-w-[22ch] text-[clamp(32px,4.2vw,58px)] text-paper">
              Porta il tuo Customer Care dal telefono all'orchestrazione.
            </h2>
            <p className="mx-auto mt-6 max-w-[58ch] text-[16px] leading-relaxed text-paper/55">
              Costruiamo insieme uno scenario sui tuoi volumi reali: chiamate, parco macchine,
              flotte e costi operativi. In 45 minuti vedi dove si crea valore — e dove no.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <a href="mailto:demo@omniap.io?subject=Richiesta%20demo%20Omni%20Customer%20Care" className="btn-primary">
                Request a demo
              </a>
              <a href="#simulatore" className="btn-ghost">
                Rivedi il simulatore
              </a>
            </div>
            <p className="mt-8 font-mono text-[11px] tracking-[0.08em] text-paper/35">
              demo@omniap.io · risposta entro 1 giorno lavorativo
            </p>
          </div>
        </Reveal>

        <div className="flex flex-col items-start justify-between gap-6 py-10 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <svg width="20" height="20" viewBox="0 0 26 26" fill="none" aria-hidden>
              <rect x="1" y="1" width="24" height="24" rx="6" stroke="rgba(85,214,255,0.5)" strokeWidth="1.4" />
              <circle cx="13" cy="13" r="3.2" fill="#55d6ff" />
            </svg>
            <span className="font-display text-[13px] font-semibold tracking-[0.22em] text-paper/80">
              OMNI AP
            </span>
          </div>
          <p className="max-w-[70ch] text-[11.5px] leading-relaxed text-paper/35">
            Tutti i valori, KPI e risultati economici mostrati in questa pagina sono stime di
            scenario basate su ipotesi configurabili e non costituiscono dati aziendali certificati
            né risultati garantiti. Il valore effettivo dipende dai processi, dai sistemi e dai
            volumi reali.
          </p>
        </div>
        <div className="hairline mb-8" aria-hidden />
        <div className="flex flex-col items-start justify-between gap-3 pb-10 font-mono text-[11px] tracking-[0.08em] text-paper/30 md:flex-row">
          <span>© 2026 Omni Ap S.r.l. — Customer Care Orchestration Platform</span>
          <span>Voice Agent · Multi-Agent · Tool Calling · API / M2M</span>
        </div>
      </div>
    </footer>
  );
}
