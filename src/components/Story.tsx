import { useEffect, useRef, useState } from "react";
import { cn } from "../utils/cn";
import { Reveal, SectionHead, Tile, prefersReducedMotion, useTicker } from "./ui";
import { DEFAULT_INPUT, fmt0, simulate, type SimInput } from "../lib/simulator";

/* ---------------- count-up on view ---------------- */
function CountUp({
  to,
  format,
  className,
}: {
  to: number;
  format: (n: number) => string;
  className?: string;
}) {
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      setStarted(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setStarted(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const v = useTicker(started ? to : 0, 1200);
  return <span ref={ref} className={cn("tabular-nums", className)}>{format(v)}</span>;
}

/* ================= 01 · PERIMETRO ================= */

export function ScaleSection({ input }: { input: SimInput }) {
  const total = input.vendingMachines + input.ocsMachines;
  return (
    <section id="perimetro" className="relative mx-auto max-w-[1440px] px-6 pt-24 lg:px-12 lg:pt-32">
      <SectionHead
        index="01"
        eyebrow="Perimetro operativo"
        title={
          <>
            Il Customer Care non è un ufficio.
            <br />
            <span className="text-paper/55">È il sistema nervoso di 32.000 apparati.</span>
          </>
        }
      />
      <div className="mt-16 grid grid-cols-1 gap-px overflow-hidden rounded-[14px] border border-white/8 bg-white/6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            v: input.vendingMachines,
            label: "Distributori automatici",
            note: "rete di rifornimento",
          },
          { v: input.ocsMachines, label: "Macchine OCS / caffè", note: "office coffee service" },
          { v: total, label: "Apparati totali in campo", note: "perimetro gestito", hot: true },
          {
            v: input.annualCalls,
            label: "Chiamate / anno",
            note: "valore di scenario · modificabile",
            tag: true,
          },
        ].map((c, k) => (
          <Reveal key={c.label} delay={k * 90} className="bg-ink-900/80">
            <div className="group relative h-full px-8 py-12 transition-colors duration-500 hover:bg-ink-850">
              <div className="numeral text-[clamp(40px,4vw,64px)] text-paper">
                <CountUp to={c.v} format={fmt0} />
              </div>
              <div className="mt-4 font-mono text-[11.5px] uppercase tracking-[0.16em] text-paper/60">
                {c.label}
              </div>
              <div className="mt-1.5 font-mono text-[10.5px] tracking-[0.08em] text-paper/32">
                {c.note}
              </div>
              {c.hot && (
                <span className="absolute right-6 top-6 h-2 w-2 rounded-full bg-[#55d6ff] shadow-[0_0_12px_rgba(85,214,255,0.9)]" />
              )}
              {c.tag && (
                <span className="absolute right-5 top-5 rounded-[4px] border border-[#e8a33d]/35 px-1.5 py-[2px] font-mono text-[9.5px] uppercase tracking-[0.12em] text-[#e8a33d]/90">
                  Scenario
                </span>
              )}
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal delay={120}>
        <p className="mt-8 max-w-[78ch] text-[16px] leading-relaxed text-paper/55">
          Con questa scala, il Call Center non si limita a "rispondere al telefono": una parte
          rilevante dell'attività è <strong className="text-paper/85">preventiva</strong>. Contattare
          il cliente, raccogliere le informazioni e programmare in anticipo rifornimento o
          intervento — evitando che la richiesta arrivi all'ultimo momento, come chiamata urgente.
        </p>
      </Reveal>
    </section>
  );
}

/* ================= 02 · CATENA CAUSALE ================= */

const CHAIN = [
  { t: "Chiamata persa", d: "il cliente non ottiene risposta", amber: true },
  { t: "Richiesta non acquisita", d: "nessuno sa che serve un intervento" },
  { t: "Programmazione tardiva", d: "la richiesta emerge fuori pianificazione" },
  { t: "Intervento urgente", d: "non ottimizzabile nella rotta o nell'agenda" },
  { t: "Km · ore · downtime extra", d: "il costo si scarica sulla flotta e sul cliente", amber: true },
];

export function ProblemSection() {
  return (
    <section id="problema" className="relative mx-auto max-w-[1440px] px-6 pt-28 lg:px-12 lg:pt-36">
      <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1fr_1fr]">
        <SectionHead
          index="02"
          eyebrow="Il problema"
          title={
            <>
              Una chiamata persa non è una chiamata persa.
            </>
          }
          lead={
            <>
              È l'inizio di una catena operativa. La richiesta non acquisita diventa
              programmazione tardiva, l'intervento diventa urgente, e il costo si scarica su
              chilometri, ore e fermo macchina. Per questo il modello non assume che ogni chiamata
              persa generi un intervento extra: usa una{" "}
              <strong className="text-paper/85">% di conversione causale configurabile</strong>.
            </>
          }
        />
        <Reveal delay={150}>
          <div className="tile p-8">
            <div className="mono-label mb-6">Catena causale · AS-IS</div>
            <ol className="space-y-0">
              {CHAIN.map((c, k) => (
                <li key={c.t} className="relative pl-8 pb-6 last:pb-0">
                  {k < CHAIN.length - 1 && (
                    <span className="node-line absolute left-[3px] top-3 h-full" aria-hidden />
                  )}
                  <span
                    className={cn(
                      "absolute left-0 top-[7px] h-[7px] w-[7px] rounded-full",
                      c.amber
                        ? "bg-[#e8a33d] shadow-[0_0_10px_rgba(232,163,61,0.8)]"
                        : "bg-white/30",
                    )}
                    aria-hidden
                  />
                  <div
                    className={cn(
                      "font-display text-[19px] font-semibold tracking-tight",
                      c.amber ? "text-[#e8a33d]" : "text-paper/90",
                    )}
                  >
                    {c.t}
                  </div>
                  <div className="text-[13.5px] text-paper/45">{c.d}</div>
                </li>
              ))}
            </ol>
            <div className="mt-7 grid grid-cols-2 gap-3 border-t border-white/8 pt-6">
              <div className="tile-flat p-4">
                <div className="mono-label mb-1.5 text-[#e8a33d]/80!">Flotta rifornimento</div>
                <p className="text-[12.5px] leading-snug text-paper/55">
                  rotte modificate, viaggi aggiuntivi, densità di rotta inferiore, costo per
                  intervento più alto.
                </p>
              </div>
              <div className="tile-flat p-4">
                <div className="mono-label mb-1.5 text-[#e8a33d]/80!">Flotta assistenza</div>
                <p className="text-[12.5px] leading-snug text-paper/55">
                  ticket aperti in ritardo, tecnico assegnato tardi, fuori SLA, fermo macchina
                  più lungo.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ================= 03 · AS-IS sticky + friction ================= */

const FRICTIONS = [
  {
    n: "01",
    t: "Picchi di domanda",
    d: "La capacità media può bastare, quella nei picchi no. Code, attese, abbandoni e backlog si formano nelle ore e nei periodi critici.",
    kpi: ["picco ×1.6 vs media", "abandonment rate", "backlog"],
  },
  {
    n: "02",
    t: "Cliente non risponde",
    d: "L'outbound proattivo fallisce quando il cliente non risponde: nuovi tentativi, ore operatore, richieste che restano non programmate.",
    kpi: ["no-answer 35%", "2.2 tentativi medi", "non raggiunti"],
  },
  {
    n: "03",
    t: "Dati incompleti",
    d: "Stato macchina, stock, storico, posizione, priorità: se i sistemi non sono integrati l'operatore cerca, verifica, copia, trasferisce.",
    kpi: ["ricerca manuale", "data entry", "errore"],
  },
  {
    n: "04",
    t: "Errori di interpretazione",
    d: "Macchina sbagliata, codice errato, quantità o priorità errate. Ogni errore genera una nuova interazione di correzione.",
    kpi: ["rework 10%", "correzioni", "ritardi"],
  },
  {
    n: "05",
    t: "Trasferimenti ed escalation",
    d: "Primo operatore, secondo operatore, supervisore, logistica, assistenza: ogni passaggio aggiunge tempo e rischio di perdita informativa.",
    kpi: ["transfer 15%", "escalation 8%", "FCR 62%"],
  },
  {
    n: "06",
    t: "Richieste fuori orario",
    d: "Il Call Center umano ha una finestra temporale limitata. Fuori orario: voicemail, richiamate, richieste urgenti il giorno dopo.",
    kpi: ["12% fuori orario", "voicemail", "urgenze"],
  },
  {
    n: "07",
    t: "Variabilità degli operatori",
    d: "Esperienza, complessità, sistemi usati: la durata reale di un'interazione varia molto. L'AHT medio non racconta le code.",
    kpi: ["AHT 6′ medio", "deviazione alta", "code"],
  },
  {
    n: "08",
    t: "Turnover, assenze, formazione",
    d: "Ferie, malattia, onboarding, pause, supervisione: gli FTE nominali non coincidono con la capacità realmente disponibile.",
    kpi: ["10 FTE nominali", "7.5 FTE produttivi", "−25%"],
  },
  {
    n: "09",
    t: "Richiamate",
    d: "Una richiesta non risolta genera una seconda, terza chiamata. Il Repeat Contact Rate è distinto dal rework e pesa doppio.",
    kpi: ["repeat 12%", "AHT ×2", "frustrazione"],
  },
  {
    n: "10",
    t: "Mancata programmazione",
    d: "Il KPI che riassume tutti gli altri: la percentuale di richieste non programmate entro SLA. È qui che nasce il costo a valle.",
    kpi: ["fuori SLA", "interventi urgenti", "km extra"],
    key: true,
  },
];

function AsIsDiagram({ asa }: { asa: number }) {
  return (
    <div className="tile-flat overflow-hidden p-6 font-mono text-[12px] leading-relaxed">
      <div className="mb-4 flex items-center justify-between">
        <span className="mono-label text-[10px]!">Flusso operativo · AS-IS</span>
        <div className="flex gap-2">
          {["30% perso", "AHT 6′", "picco ×1.6"].map((c) => (
            <span key={c} className="rounded-[4px] border border-[#e8a33d]/30 px-1.5 py-[2px] text-[9.5px] uppercase tracking-[0.1em] text-[#e8a33d]/85">
              {c}
            </span>
          ))}
        </div>
      </div>
      <div className="space-y-0 text-paper/75">
        <div className="flex items-center gap-3">
          <span className="pulse-dot" />
          <span className="text-paper">CLIENTE</span>
          <span className="text-paper/35">— chiamata →</span>
        </div>
        <div className="ml-[3px] node-line pl-6">
          <div className="py-1 text-paper">CALL CENTER</div>
          <div className="node-line ml-0 pl-5">
            <div className="py-0.5"><span className="text-paper/45">├─</span> CODA · ASA stimata {asa} s</div>
            <div className="py-0.5"><span className="text-paper/45">├─</span> GESTITA → operatore → ricerca dati → programmazione → <span className="text-[#4c8dff]">FLOTTA</span></div>
            <div className="py-0.5"><span className="text-paper/45">├─</span> CALLBACK · REWORK 10% · TRANSFER 15%</div>
            <div className="py-0.5">
              <span className="text-[#e8a33d]">└─ PERSA 30%</span> → richiesta non acquisita →
            </div>
            <div className="node-line ml-3 pl-5">
              <div className="py-0.5 text-[#e8a33d]/85">programmazione tardiva → intervento urgente</div>
              <div className="py-0.5 text-[#e8a33d]">→ km extra · ore extra · downtime</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AsIsSection() {
  const r = simulate(DEFAULT_INPUT);
  return (
    <section id="as-is" className="relative mx-auto max-w-[1440px] px-6 pt-28 lg:px-12 lg:pt-36">
      <div className="grid grid-cols-1 gap-14 lg:grid-cols-[0.85fr_1.15fr]">
        {/* sticky colonna sinistra */}
        <div className="panel-scroll lg:sticky lg:top-28 lg:max-h-[calc(100vh-128px)] lg:self-start lg:overflow-y-auto lg:pr-2">
          <SectionHead
            index="03"
            eyebrow="AS-IS · cosa succede oggi"
            title={
              <>
                Dieci colli di bottiglia, non "mancano operatori".
              </>
            }
            lead={
              <>
                Il servizio non è ideale per un insieme di attriti che si sommano: picchi,
                clienti non raggiungibili, dati frammentati, passaggi tra operatori, fuori
                orario. E ogni attrito può spingere una richiesta fuori dalla pianificazione.
              </>
            }
          />
          <Reveal delay={150}>
            <div className="mt-10 space-y-4">
              <div className="grid grid-cols-3 gap-px overflow-hidden rounded-[12px] border border-white/8 bg-white/6">
                {[
                  { v: Math.round(r.asIs.lost), l: "chiamate perse / anno" },
                  { v: Math.round(r.asIs.neverReached), l: "clienti mai raggiunti" },
                  { v: Math.round(r.asIs.fleet.failures), l: "fallimenti operativi" },
                ].map((s) => (
                  <div key={s.l} className="bg-ink-900/85 px-4 py-5">
                    <div className="numeral text-[24px] text-[#e8a33d]">{fmt0(s.v)}</div>
                    <div className="mt-1 font-mono text-[9.5px] uppercase leading-tight tracking-[0.12em] text-paper/40">
                      {s.l}
                    </div>
                  </div>
                ))}
              </div>
              <AsIsDiagram asa={r.kpi.asaSeconds} />
            </div>
          </Reveal>
        </div>

        {/* colonna destra: friction cards */}
        <div className="space-y-5">
          {FRICTIONS.map((f, k) => (
            <Reveal key={f.n} delay={(k % 3) * 70}>
              <Tile
                lift
                className={cn(
                  "p-6",
                  f.key && "border-[#e8a33d]/30",
                )}
              >
                <div className="flex items-start gap-5">
                  <div
                    className={cn(
                      "numeral text-[26px]",
                      f.key ? "text-[#e8a33d]" : "text-paper/30",
                    )}
                  >
                    {f.n}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display text-[19px] font-semibold tracking-tight text-paper">
                      {f.t}
                    </h3>
                    <p className="mt-2 text-[14px] leading-relaxed text-paper/55">{f.d}</p>
                    <div className="mt-3.5 flex flex-wrap gap-2">
                      {f.kpi.map((k2) => (
                        <span
                          key={k2}
                          className={cn(
                            "rounded-[4px] border px-1.5 py-[2px] font-mono text-[10px] tracking-[0.08em]",
                            f.key
                              ? "border-[#e8a33d]/35 text-[#e8a33d]/90"
                              : "border-white/12 text-paper/50",
                          )}
                        >
                          {k2}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Tile>
            </Reveal>
          ))}

          {/* loop outbound senza risposta */}
          <Reveal>
            <Tile className="border-[#e8a33d]/25 p-6">
              <div className="mono-label mb-4 text-[#e8a33d]/85!">
                Il processo che oggi non è misurato · outbound senza risposta
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[12px] text-paper/75">
                <span className="rounded-[6px] border border-white/14 px-2.5 py-1.5">OUTBOUND {fmt0(DEFAULT_INPUT.outboundCalls)}</span>
                <span className="text-paper/30">→</span>
                <span className="rounded-[6px] border border-[#e8a33d]/35 px-2.5 py-1.5 text-[#e8a33d]">NO ANSWER {fmt0(Math.round(r.asIs.retried))}</span>
                <span className="text-paper/30">→</span>
                <span className="rounded-[6px] border border-white/14 px-2.5 py-1.5">RETRY ×{DEFAULT_INPUT.avgAttempts}</span>
                <span className="text-paper/30">→</span>
                <span className="rounded-[6px] border border-[#4c8dff]/40 px-2.5 py-1.5 text-[#4c8dff]">RECUPERATI {fmt0(Math.round(r.asIs.reachedOnRetry))}</span>
                <span className="text-paper/30">→</span>
                <span className="rounded-[6px] border border-[#e8a33d]/50 bg-[#e8a33d]/8 px-2.5 py-1.5 font-semibold text-[#e8a33d]">
                  MAI RAGGIUNTI {fmt0(Math.round(r.asIs.neverReached))}
                </span>
              </div>
              <p className="mt-4 text-[13px] leading-relaxed text-paper/45">
                Ogni tentativo fallito consuma in media {DEFAULT_INPUT.failedAttemptMin} minuti
                operatore. Nel TO-BE l'Agente Vocale ripete i tentativi secondo una strategia
                configurabile — orari diversi, canali digitali alternativi — senza costo marginale
                umano.
              </p>
            </Tile>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ================= 04 · FUNNEL OPERATIVO ================= */

export function FunnelSection() {
  const r = simulate(DEFAULT_INPUT);
  const i = DEFAULT_INPUT;
  const total = r.asIs.received + i.outboundCalls;

  const reached = r.asIs.handled + r.asIs.firstAnswer + r.asIs.reachedOnRetry;
  const scheduled = Math.max(0, reached - r.asIs.fleet.failures);
  const cleanInt = Math.max(0, scheduled - r.asIs.fleet.extraInterventions);
  const cleanOut = Math.max(0, cleanInt - r.asIs.fleet.serviceExtra);

  const reachedT = total - r.toBe.lost - r.toBe.neverReached;
  const scheduledT = Math.max(0, reachedT - r.toBe.fleet.failures);
  const cleanIntT = Math.max(0, scheduledT - r.toBe.fleet.extraInterventions);
  const cleanOutT = Math.max(0, cleanIntT - r.toBe.fleet.serviceExtra);

  const rows = [
    {
      label: "Apparati in campo",
      v: i.vendingMachines + i.ocsMachines,
      asIs: total,
      toBe: total,
      base: total,
      loss: null as string | null,
      note: "base del funnel",
    },
    {
      label: "Interazioni / eventi anno",
      v: total,
      asIs: total,
      toBe: total,
      base: total,
      loss: null,
      note: "inbound + outbound proattivo",
    },
    {
      label: "Cliente raggiunto",
      v: reached,
      asIs: reached,
      toBe: reachedT,
      base: total,
      loss: `−${fmt0(r.asIs.lost)} perse · −${fmt0(r.asIs.neverReached)} senza risposta`,
      note: null,
    },
    {
      label: "Richiesta programmata",
      v: scheduled,
      asIs: scheduled,
      toBe: scheduledT,
      base: total,
      loss: `−${fmt0(r.asIs.fleet.failures)} fuori programmazione`,
      note: null,
    },
    {
      label: "Intervento senza extra",
      v: cleanInt,
      asIs: cleanInt,
      toBe: cleanIntT,
      base: total,
      loss: `−${fmt0(r.asIs.fleet.extraInterventions)} interventi extra rifornimento`,
      note: null,
    },
    {
      label: "Esito senza rework",
      v: cleanOut,
      asIs: cleanOut,
      toBe: cleanOutT,
      base: total,
      loss: `−${fmt0(r.asIs.fleet.serviceExtra)} assistenza non pianificata`,
      note: null,
    },
  ];

  return (
    <section id="funnel" className="relative mx-auto max-w-[1440px] px-6 pt-28 lg:px-12 lg:pt-36">
      <SectionHead
        index="04"
        eyebrow="Funnel operativo"
        title={
          <>
            Dove si perde valore, fase per fase.
          </>
        }
        lead={
          <>
            Il funnel parte dai 32.000 apparati e attraversa contatto, programmazione,
            intervento, esito. Le barre ambra sono l'AS-IS; le barre cyan mostrano dove
            l'orchestrazione riduce le perdite. Valori dello scenario predefinito.
          </>
        }
      />
      <Reveal delay={120}>
        <div className="tile mt-14 p-6 sm:p-10">
          <div className="mb-8 flex flex-wrap items-center gap-6">
            <span className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-paper/50">
              <span className="h-[3px] w-8 rounded-full bg-gradient-to-r from-[#e8a33d]/85 to-[#e8a33d]/40" /> As-is
            </span>
            <span className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-paper/50">
              <span className="h-[3px] w-8 rounded-full bg-gradient-to-r from-[#55d6ff] to-[#4c8dff]" /> To-be
            </span>
          </div>
          <div className="space-y-7">
            {rows.map((row, k) => (
              <div key={row.label}>
                <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                  <div className="flex items-baseline gap-3">
                    <span className="mono-label text-[10px]!">{String(k + 1).padStart(2, "0")}</span>
                    <span className="font-display text-[16px] font-semibold tracking-tight text-paper/90">
                      {row.label}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-4">
                    {row.loss && (
                      <span className="font-mono text-[10.5px] tracking-[0.04em] text-[#e8a33d]/80">
                        {row.loss}
                      </span>
                    )}
                    <span className="numeral text-[17px] text-paper">{fmt0(row.v)}</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="h-[7px] overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#e8a33d]/75 to-[#e8a33d]/35 transition-[width] duration-1000"
                      style={{ width: `${Math.max(3, (row.asIs / row.base) * 100)}%` }}
                    />
                  </div>
                  <div className="h-[7px] overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#55d6ff] to-[#4c8dff] transition-[width] duration-1000"
                      style={{ width: `${Math.max(3, (row.toBe / row.base) * 100)}%` }}
                    />
                  </div>
                </div>
                {row.note && (
                  <p className="mt-1.5 font-mono text-[10.5px] text-paper/35">{row.note}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ================= 05 · TO-BE · orchestrator network ================= */

function OrchestratorNetwork() {
  const node = "fill-[rgba(255,255,255,0.045)] stroke-[rgba(255,255,255,0.16)]";
  const nodeHot = "fill-[rgba(85,214,255,0.07)] stroke-[rgba(85,214,255,0.35)]";
  const label = "fill-[rgba(244,247,250,0.82)] font-mono text-[11.5px] tracking-[0.14em]";
  const sub = "fill-[rgba(244,247,250,0.38)] font-mono text-[9px] tracking-[0.12em]";
  const edge = "stroke-[rgba(255,255,255,0.14)] fill-none";
  const edgeCyan = "stroke-[rgba(85,214,255,0.3)] fill-none";

  return (
    <svg viewBox="0 0 920 560" className="w-full" role="img" aria-label="Architettura TO-BE: cliente, Voice Agent, Orchestratore Multi-Agent, sistemi aziendali, azione e conferma">
      {/* edges */}
      <path d="M210 68 H370" className={edgeCyan} strokeWidth="1.3" />
      <path d="M460 96 V250" className={edgeCyan} strokeWidth="1.3" />
      <path d="M390 314 L110 460" className={edge} strokeWidth="1" />
      <path d="M430 314 L300 460" className={edge} strokeWidth="1" />
      <path d="M490 314 L490 460" className={edge} strokeWidth="1" />
      <path d="M545 314 L680 460" className={edge} strokeWidth="1" />
      <path d="M680 460 C 760 420, 770 370, 780 312" className={edgeCyan} strokeWidth="1.2" />
      <path d="M490 460 C 620 430, 700 380, 762 312" className={edge} strokeWidth="1" />
      <path d="M795 252 V96" className={edgeCyan} strokeWidth="1.3" />
      <path d="M710 82 H250" className="fill-none stroke-[rgba(255,255,255,0.12)]" strokeWidth="1" strokeDasharray="3 5" />

      {/* tool call labels */}
      <text x="250" y="56" className={sub}>contatto</text>
      <text x="472" y="180" className={sub}>contesto</text>
      <text x="300" y="392" className={sub}>tool call</text>
      <text x="502" y="392" className={sub}>tool call</text>
      <text x="690" y="380" className={sub}>azione</text>
      <text x="806" y="180" className={sub}>esito</text>

      {/* pulses */}
      <circle r="3.4" fill="#55d6ff" className="svg-pulse">
        <animateMotion dur="5.2s" repeatCount="indefinite" path="M210 68 H460 V250" />
      </circle>
      <circle r="3" fill="#55d6ff" className="svg-pulse">
        <animateMotion dur="6.8s" begin="1.2s" repeatCount="indefinite" path="M490 314 V460 H680 C 760 420, 770 370, 780 312" />
      </circle>
      <circle r="3" fill="#4c8dff" className="svg-pulse">
        <animateMotion dur="6s" begin="2.4s" repeatCount="indefinite" path="M795 252 V96 H250" />
      </circle>

      {/* nodes */}
      <g>
        <rect x="40" y="40" width="170" height="56" rx="10" className={node} strokeWidth="1" />
        <text x="125" y="64" textAnchor="middle" className={label}>CLIENTE</text>
        <text x="125" y="82" textAnchor="middle" className={sub}>evento / chiamata</text>
      </g>
      <g>
        <rect x="370" y="40" width="180" height="56" rx="10" className={nodeHot} strokeWidth="1.2" />
        <text x="460" y="64" textAnchor="middle" className={label}>VOICE AGENT</text>
        <text x="460" y="82" textAnchor="middle" className={sub}>omni ap · 24/7</text>
      </g>
      <g>
        <rect x="710" y="40" width="170" height="56" rx="10" className={node} strokeWidth="1" />
        <text x="795" y="64" textAnchor="middle" className={label}>CONFERMA</text>
        <text x="795" y="82" textAnchor="middle" className={sub}>cliente + sistemi</text>
      </g>
      <g>
        <rect x="340" y="250" width="240" height="64" rx="12" className={nodeHot} strokeWidth="1.3" />
        <text x="460" y="278" textAnchor="middle" className={label}>MULTI-AGENT ORCHESTRATOR</text>
        <text x="460" y="297" textAnchor="middle" className={sub}>decide il percorso operativo</text>
      </g>
      <g>
        <rect x="710" y="252" width="170" height="60" rx="10" className={node} strokeWidth="1" />
        <text x="795" y="278" textAnchor="middle" className={label}>AZIONE</text>
        <text x="795" y="296" textAnchor="middle" className={sub}>slot · ticket · rotta</text>
      </g>
      {[
        { x: 40, t: "CRM", s: "cliente" },
        { x: 230, t: "ERP", s: "stock" },
        { x: 420, t: "FLEET", s: "rotte" },
        { x: 610, t: "SERVICE", s: "ticket" },
      ].map((n) => (
        <g key={n.t}>
          <rect x={n.x} y="460" width="140" height="52" rx="9" className={node} strokeWidth="1" />
          <text x={n.x + 70} y="483" textAnchor="middle" className={label}>{n.t}</text>
          <text x={n.x + 70} y="500" textAnchor="middle" className={sub}>{n.s}</text>
        </g>
      ))}
    </svg>
  );
}

const SENSE_STEPS = ["Sense", "Understand", "Decide", "Act", "Confirm", "Learn"];

export function ToBeSection() {
  return (
    <section id="piattaforma" className="relative mx-auto max-w-[1440px] px-6 pt-28 lg:px-12 lg:pt-36">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <SectionHead
            index="05"
            eyebrow="TO-BE · Omni Customer Care"
            title={
              <>
                Non un chatbot che risponde. Un orchestratore che agisce.
              </>
            }
            lead={
              <>
                Il Voice Agent è il punto di contatto. Il valore nasce dall'orchestrazione
                end-to-end: identifica cliente e apparato, interroga i sistemi via Tool
                Calling, decide il percorso, programma l'intervento, conferma e registra
                l'esito. L'escalation umana avviene solo quando serve — con contesto completo.
              </>
            }
          />
          <Reveal delay={140}>
            <div className="mt-10 flex flex-wrap gap-2.5">
              {SENSE_STEPS.map((s, k) => (
                <span key={s} className="flex items-center gap-2.5">
                  <span className="rounded-[6px] border border-[#55d6ff]/30 bg-[#55d6ff]/6 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-[#55d6ff]">
                    {s}
                  </span>
                  {k < SENSE_STEPS.length - 1 && <span className="text-paper/25">→</span>}
                </span>
              ))}
            </div>
          </Reveal>
          <Reveal delay={220}>
            <div className="mt-10 space-y-3">
              {[
                ["Disponibilità estesa", "le richieste fuori orario vengono comunque acquisite e programmate"],
                ["Dati sempre in contesto", "stato macchina, stock, storico e priorità letti dai sistemi, non ricopiati"],
                ["Multi-tentativo automatico", "cliente non risponde? retry pianificati e canali digitali alternativi"],
                ["Escalation con contesto", "l'operatore riceve il caso già classificato, con dati e priorità"],
              ].map(([t, d]) => (
                <div key={t} className="flex items-start gap-4 border-l-2 border-[#55d6ff]/30 py-1 pl-5">
                  <div>
                    <div className="font-display text-[15.5px] font-semibold tracking-tight text-paper/90">{t}</div>
                    <div className="text-[13.5px] text-paper/50">{d}</div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
        <Reveal delay={160}>
          <Tile className="p-6 sm:p-8">
            <div className="mb-4 flex items-center justify-between">
              <span className="mono-label text-[10px]!">Flusso orchestrato · TO-BE</span>
              <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[#55d6ff]/80">
                <span className="pulse-dot pulse-dot-cyan h-[5px]! w-[5px]!" />
                task in esecuzione
              </span>
            </div>
            <OrchestratorNetwork />
          </Tile>
        </Reveal>
      </div>
    </section>
  );
}

/* ================= 06 · PROCESSO · horizontal scroll ================= */

const PHASES = [
  {
    n: "01",
    t: "Contact",
    micro: "Voice Agent · Omni Ap",
    d: "Interazione inbound o outbound proattiva, con disponibilità estesa oltre l'orario del Call Center umano.",
    foot: "CANALE · VOCE / DIGITALE",
  },
  {
    n: "02",
    t: "Understand",
    micro: "Identificazione & NLU",
    d: "Cliente, apparato e tipologia di richiesta riconosciuti in tempo reale sul contesto della chiamata.",
    foot: "LATENZA · < 2 S",
  },
  {
    n: "03",
    t: "Orchestrate",
    micro: "Multi-Agent engine",
    d: "Il motore decide il percorso: verifica stock, rotte, tecnici e ricambi disponibili prima di proporre lo slot.",
    foot: "AGENTI · 4 SPECIALISTICI",
  },
  {
    n: "04",
    t: "Execute",
    micro: "Tool Calling · API · M2M",
    d: "Programmazione, apertura ticket, aggiornamento rotta e scorte: azioni eseguite direttamente sui sistemi.",
    foot: "OPERAZIONI · ERP / FLEET / SERVICE",
  },
  {
    n: "05",
    t: "Confirm",
    micro: "Chiusura del loop",
    d: "Conferma al cliente, aggiornamento dei sistemi e registrazione dell'esito. Nessuna informazione persa.",
    foot: "ESITO · TRACCIATO",
  },
  {
    n: "06",
    t: "Learn",
    micro: "Miglioramento continuo",
    d: "SLA, escalation e pattern di guasto alimentano il modello: la prevenzione diventa più precisa nel tempo.",
    foot: "FEEDBACK · SETTIMANALE",
  },
];

export function ProcessSection() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [trackW, setTrackW] = useState(0);
  const [vw, setVw] = useState(1200);

  useEffect(() => {
    setReduced(prefersReducedMotion());
    setVw(window.innerWidth);
    if (prefersReducedMotion()) return;
    let raf = 0;
    const measure = () => {
      if (trackRef.current) setTrackW(trackRef.current.scrollWidth);
      setVw(window.innerWidth);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const wrap = wrapRef.current;
        if (!wrap) return;
        const rect = wrap.getBoundingClientRect();
        const total = Math.max(1, wrap.offsetHeight - window.innerHeight);
        setProgress(Math.min(1, Math.max(0, -rect.top / total)));
      });
    };
    measure();
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      cancelAnimationFrame(raf);
    };
  }, []);

  const shift = Math.max(0, trackW - vw + 96);

  return (
    <section id="processo" className="relative pt-28 lg:pt-36">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <SectionHead
          index="06"
          eyebrow="Operating model"
          title={
            <>
              Sei fasi, un unico loop operativo.
            </>
          }
          lead={
            <>
              Ogni interazione attraversa lo stesso ciclo. Scorri: le fasi scorrono con te.
            </>
          }
        />
      </div>

      <div ref={wrapRef} className={cn(!reduced && "h-[290vh]")}>
        <div className={cn("relative", !reduced && "sticky top-0 flex h-screen items-center overflow-hidden")}>
          <div
            ref={trackRef}
            className={cn(
              "htrack px-6 py-10 lg:px-12",
              reduced && "flex-wrap gap-6! overflow-visible px-6",
            )}
            style={
              reduced
                ? undefined
                : { transform: `translate3d(${-progress * shift}px,0,0)` }
            }
          >
            {PHASES.map((p, k) => {
              const cardCenter = k * (380 + 28) + 190 - progress * shift;
              const dist = Math.abs(cardCenter - vw / 2) / Math.max(1, vw / 2);
              const focus = reduced ? 0.9 : Math.max(0.35, 1 - dist * 0.75);
              return (
                <Tile
                  key={p.n}
                  lift
                  className={cn(
                    "shrink-0 p-8",
                    reduced ? "w-full sm:w-[380px]" : "w-[320px] sm:w-[380px]",
                  )}
                >
                  <div style={{ opacity: focus, transition: "opacity .3s var(--ease)" }}>
                    <div className="flex items-start justify-between">
                      <div className="numeral text-[44px] leading-none text-paper/22">{p.n}</div>
                      <span className="mono-label text-[9.5px]!">{p.micro}</span>
                    </div>
                    <h3 className="numeral mt-8 text-[30px] text-paper">{p.t}</h3>
                    <p className="mt-4 min-h-[72px] text-[14.5px] leading-relaxed text-paper/55">
                      {p.d}
                    </p>
                    <div className="mt-6 border-t border-white/8 pt-4 font-mono text-[10px] tracking-[0.14em] text-[#55d6ff]/70">
                      {p.foot}
                    </div>
                  </div>
                </Tile>
              );
            })}
          </div>
          {/* progress rail */}
          {!reduced && (
            <div className="pointer-events-none absolute bottom-10 left-1/2 hidden h-[2px] w-[240px] -translate-x-1/2 overflow-hidden rounded-full bg-white/8 lg:block">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#55d6ff] to-[#4c8dff]"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ================= export unico ================= */
export function StorySections({ input }: { input: SimInput }) {
  return (
    <>
      <ScaleSection input={input} />
      <ProblemSection />
      <AsIsSection />
      <FunnelSection />
      <ToBeSection />
      <ProcessSection />
    </>
  );
}
