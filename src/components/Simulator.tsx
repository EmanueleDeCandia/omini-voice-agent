import { useMemo, type ReactNode } from "react";
import { cn } from "../utils/cn";
import {
  CompareStat,
  PrecisionSlider,
  Reveal,
  SectionHead,
  SourceBadge,
  Stat,
  Ticker,
  Tile,
} from "./ui";
import {
  DEFAULT_INPUT,
  fmt0,
  fmt1,
  fmtEur,
  fmtHrs,
  fmtKm,
  fmtPct,
  simulate,
  type SimInput,
} from "../lib/simulator";

/* ---------------- helpers ---------------- */

function Group({
  code,
  title,
  children,
  note,
}: {
  code: string;
  title: string;
  children: ReactNode;
  note?: string;
}) {
  return (
    <div className="tile-flat p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <span className="numeral text-[15px] text-[#55d6ff]/75">{code}</span>
        <h3 className="font-display text-[16px] font-semibold tracking-tight text-paper/90">
          {title}
        </h3>
      </div>
      <div className="grid grid-cols-1 gap-x-8 gap-y-5 xl:grid-cols-2">{children}</div>
      {note && <p className="mt-4 text-[11.5px] leading-snug text-paper/38">{note}</p>}
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  step = 1000,
  tag,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  tag: "fornito" | "scenario" | "ipotesi" | "benchmark" | "utente";
}) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <label className="flex items-center gap-2 text-[13px] font-medium text-paper/75">
          {label}
          <SourceBadge tag={tag} />
        </label>
      </div>
      <input
        type="number"
        value={value}
        step={step}
        aria-label={label}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
        className="numeral w-full rounded-[8px] border border-white/12 bg-ink-950/70 px-3 py-2 text-[15px] text-paper outline-none transition-colors duration-300 focus:border-[#55d6ff]/50"
      />
    </div>
  );
}

function Segmented({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: string;
  options: { v: string; l: string }[];
  onChange: (v: string) => void;
  ariaLabel: string;
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="inline-flex rounded-[9px] border border-white/12 bg-ink-950/60 p-1"
    >
      {options.map((o) => (
        <button
          key={o.v}
          type="button"
          onClick={() => onChange(o.v)}
          aria-pressed={value === o.v}
          className={cn(
            "rounded-[7px] px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.1em] transition-all duration-300",
            value === o.v
              ? "bg-[#55d6ff]/15 text-[#55d6ff] shadow-[inset_0_0_0_1px_rgba(85,214,255,0.35)]"
              : "text-paper/45 hover:text-paper/75",
          )}
        >
          {o.l}
        </button>
      ))}
    </div>
  );
}

/* ---------------- waterfall ---------------- */

function Waterfall({ items }: { items: { label: string; v: number }[] }) {
  const bars = useMemo(() => {
    let cum = 0;
    const list = items.map((it) => {
      const from = cum;
      cum += it.v;
      return { ...it, from, to: cum };
    });
    const lo = Math.min(0, cum, ...list.map((b) => Math.min(b.from, b.to)));
    const hi = Math.max(1, cum, ...list.map((b) => Math.max(b.from, b.to)));
    const y = (v: number) => ((v - lo) / (hi - lo)) * 100;
    return { list, y, cum };
  }, [items]);

  const cols = [
    ...bars.list.map((b) => ({
      label: b.label,
      v: b.v,
      bottom: bars.y(Math.min(b.from, b.to)),
      height: Math.max(1.6, Math.abs(bars.y(b.to) - bars.y(b.from))),
      neg: b.v < 0,
      connector: bars.y(b.to),
      total: false,
    })),
    {
      label: "Beneficio netto",
      v: bars.cum,
      bottom: bars.y(Math.min(0, bars.cum)),
      height: Math.max(1.6, Math.abs(bars.y(bars.cum) - bars.y(0))),
      neg: bars.cum < 0,
      connector: null as number | null,
      total: true,
    },
  ];

  return (
    <div>
      <div className="flex h-[220px] items-stretch gap-2 sm:gap-3">
        {cols.map((c, k) => (
          <div key={c.label} className="relative flex min-w-0 flex-1 flex-col justify-end">
            {/* connector from previous column */}
            {k > 0 && cols[k - 1].connector != null && (
              <span
                className="absolute -left-2 w-2 border-t border-dashed border-white/20 sm:-left-3 sm:w-3"
                style={{ bottom: `${cols[k - 1].connector}%` }}
                aria-hidden
              />
            )}
            <div
              className={cn(
                "wf-bar relative rounded-[5px] border",
                c.total
                  ? c.neg
                    ? "border-[#e8a33d]/40 bg-[#e8a33d]/15"
                    : "border-[#55d6ff]/45 bg-[#55d6ff]/14 shadow-[0_0_24px_rgba(85,214,255,0.12)]"
                  : c.neg
                    ? "border-[#e8a33d]/35 bg-[#e8a33d]/12"
                    : "border-white/14 bg-gradient-to-t from-[#4c8dff]/22 to-[#55d6ff]/16",
              )}
              style={{ bottom: `${c.bottom}%`, height: `${c.height}%`, position: "absolute", left: 0, right: 0 }}
            >
              <span
                className={cn(
                  "numeral absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] font-semibold",
                  c.neg ? "text-[#e8a33d]" : "text-[#bfeaff]",
                  c.v < 0 ? "-top-5" : "-top-5",
                )}
              >
                <Ticker value={c.v} format={(n) => (n < 0 ? "−" : "") + fmtEur(Math.abs(n))} />
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-2 sm:gap-3">
        {cols.map((c) => (
          <div key={c.label} className="min-w-0 flex-1 text-center font-mono text-[9px] uppercase leading-tight tracking-[0.08em] text-paper/45">
            {c.label}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- simulator ---------------- */

export function Simulator({
  input,
  setInput,
}: {
  input: SimInput;
  setInput: (updater: (prev: SimInput) => SimInput) => void;
}) {
  const r = useMemo(() => simulate(input), [input]);
  const set =
    <K extends keyof SimInput>(k: K) =>
    (v: SimInput[K]) =>
      setInput((prev) => ({ ...prev, [k]: v }));

  const extraIntAsIs = r.asIs.fleet.extraInterventions + r.asIs.fleet.serviceExtra;
  const extraIntToBe = r.toBe.fleet.extraInterventions + r.toBe.fleet.serviceExtra;

  const waterfallItems = [
    { label: "Contact Center", v: r.econ.ccCashSavings },
    { label: "Rifornimento", v: r.econ.refillSavings },
    { label: "Assistenza", v: r.econ.serviceSavings },
    { label: "Costi Omni", v: -r.econ.aiAnnual },
  ];

  return (
    <section id="simulatore" className="relative mx-auto max-w-[1440px] px-6 pt-28 lg:px-12 lg:pt-36">
      <div className="flex flex-wrap items-end justify-between gap-8">
        <SectionHead
          index="07"
          eyebrow="ROI Simulator"
          title={
            <>
              Quanto vale lo scenario, lungo tutta la catena.
            </>
          }
          lead={
            <>
              Il simulatore non misura solo il risparmio sul Call Center: propaga l'effetto
              dell'automazione su programmazione, flotte, downtime ed economia complessiva.
              Ogni parametro è modificabile ed etichettato per origine.
            </>
          }
        />
        <Reveal delay={140} className="mb-2 flex items-center gap-3">
          <span className="rounded-[6px] border border-[#e8a33d]/35 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[#e8a33d]/90">
            Scenario simulato · non dati certificati
          </span>
          <button
            type="button"
            onClick={() => setInput(() => ({ ...DEFAULT_INPUT }))}
            className="rounded-[6px] border border-white/14 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-paper/55 transition-colors duration-300 hover:border-[#55d6ff]/40 hover:text-[#55d6ff]"
          >
            Reset scenario
          </button>
        </Reveal>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_0.92fr]">
        {/* ============ colonna input ============ */}
        <div className="space-y-6">
          <Reveal>
            <Group code="A" title="Contact Center · AS-IS">
              <div className="xl:col-span-2 flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-white/8 bg-ink-950/50 px-4 py-3">
                <div>
                  <div className="text-[13px] font-medium text-paper/80">
                    Semantica del volume · 150.000 chiamate
                  </div>
                  <p className="mt-0.5 text-[11.5px] text-paper/40">
                    Se rappresentano le gestite, le ricevute stimate sono{" "}
                    {fmt0(150000 / (1 - Math.min(input.lostCallPercent, 90) / 100))} con{" "}
                    {input.lostCallPercent}% perse.
                  </p>
                </div>
                <Segmented
                  ariaLabel="Semantica del volume chiamate"
                  value={input.callsBase}
                  onChange={(v) => set("callsBase")(v as SimInput["callsBase"])}
                  options={[
                    { v: "received", l: "= ricevute" },
                    { v: "handled", l: "= gestite" },
                  ]}
                />
              </div>
              <NumberField label="Chiamate inbound / anno" value={input.annualCalls} onChange={set("annualCalls")} step={1000} tag="fornito" />
              <PrecisionSlider label="Chiamate perse" value={input.lostCallPercent} min={5} max={60} step={1} unit="%" tag="scenario" onChange={set("lostCallPercent")} />
              <PrecisionSlider label="FTE operatori (nominali)" value={input.numOperators} min={1} max={40} step={1} tag="fornito" onChange={set("numOperators")} />
              <PrecisionSlider label="FTE produttivi" value={input.productiveFactor} min={40} max={95} step={1} unit="%" tag="ipotesi" onChange={set("productiveFactor")} note="Ferie, assenze, formazione, pause, supervisione." />
              <PrecisionSlider label="AHT — durata media interazione" value={input.ahtMin} min={2} max={15} step={0.5} unit=" min" tag="benchmark" format={(n) => `${fmt1(n)} min`} onChange={set("ahtMin")} />
              <PrecisionSlider label="Costo annuo per operatore" value={input.operatorCostAnnual} min={20000} max={60000} step={500} tag="fornito" format={fmtEur} onChange={set("operatorCostAnnual")} />
              <PrecisionSlider label="Rework (errori / correzioni)" value={input.reworkPercent} min={0} max={30} step={1} unit="%" tag="fornito" onChange={set("reworkPercent")} />
              <PrecisionSlider label="Repeat contact rate" value={input.repeatContactRate} min={0} max={40} step={1} unit="%" tag="ipotesi" onChange={set("repeatContactRate")} />
              <PrecisionSlider label="First Contact Resolution" value={input.fcrPercent} min={20} max={95} step={1} unit="%" tag="ipotesi" onChange={set("fcrPercent")} />
              <PrecisionSlider label="Escalation rate" value={input.escalationRate} min={0} max={30} step={1} unit="%" tag="ipotesi" onChange={set("escalationRate")} />
              <PrecisionSlider label="Transfer rate" value={input.transferRate} min={0} max={40} step={1} unit="%" tag="ipotesi" onChange={set("transferRate")} />
              <PrecisionSlider label="Richieste fuori orario" value={input.outOfHoursPercent} min={0} max={35} step={1} unit="%" tag="ipotesi" onChange={set("outOfHoursPercent")} />
              <PrecisionSlider label="Picco / domanda media" value={input.peakFactor} min={1} max={3} step={0.1} tag="ipotesi" format={(n) => `×${fmt1(n)}`} onChange={set("peakFactor")} note="La capacità media può bastare, quella di picco no." />
              <PrecisionSlider label="Overhead post-call e wrap" value={input.wrapOverheadPct} min={5} max={40} step={1} unit="%" tag="ipotesi" onChange={set("wrapOverheadPct")} />
            </Group>
          </Reveal>

          <Reveal>
            <Group
              code="B"
              title="Outbound & contattabilità"
              note="Il Call Center cerca di prevenire la chiamata: contatta il cliente e programma in anticipo. Se il cliente non risponde, il processo può fallire."
            >
              <PrecisionSlider label="Outbound proattivi / anno" value={input.outboundCalls} min={0} max={100000} step={500} tag="ipotesi" format={fmt0} onChange={set("outboundCalls")} />
              <PrecisionSlider label="Clienti che non rispondono (1° tentativo)" value={input.noAnswerRate} min={0} max={80} step={1} unit="%" tag="ipotesi" onChange={set("noAnswerRate")} />
              <PrecisionSlider label="Recuperati al 2°/3° tentativo" value={input.secondReachRate} min={0} max={90} step={1} unit="%" tag="ipotesi" onChange={set("secondReachRate")} />
              <PrecisionSlider label="Tentativi medi per richiesta" value={input.avgAttempts} min={1} max={5} step={0.1} tag="ipotesi" format={(n) => `×${fmt1(n)}`} onChange={set("avgAttempts")} />
              <PrecisionSlider label="Tempo per tentativo fallito" value={input.failedAttemptMin} min={1} max={8} step={0.5} unit=" min" tag="ipotesi" format={(n) => `${fmt1(n)} min`} onChange={set("failedAttemptMin")} />
              <PrecisionSlider label="Durata contatto outbound riuscito" value={input.talkOutMin} min={1} max={10} step={0.5} unit=" min" tag="ipotesi" format={(n) => `${fmt1(n)} min`} onChange={set("talkOutMin")} />
              <PrecisionSlider label="Non raggiunti che restano non programmati" value={input.unscheduledRate} min={0} max={90} step={1} unit="%" tag="ipotesi" onChange={set("unscheduledRate")} />
              <PrecisionSlider
                label="Conversione richiesta persa → disservizio operativo"
                value={input.lostToOpsRate}
                min={5}
                max={80}
                step={1}
                unit="%"
                tag="ipotesi"
                onChange={set("lostToOpsRate")}
                note="Parametro chiave di attribuzione causale: non ogni chiamata persa genera un intervento extra."
              />
            </Group>
          </Reveal>

          <Reveal>
            <Group code="C" title="Flotta rifornimento">
              <NumberField label="Distributori automatici" value={input.vendingMachines} onChange={set("vendingMachines")} tag="fornito" />
              <NumberField label="Macchine OCS / caffè" value={input.ocsMachines} onChange={set("ocsMachines")} tag="fornito" />
              <PrecisionSlider label="Addetti flotta rifornimento" value={input.fleetRefillSize} min={1} max={80} step={1} tag="fornito" onChange={set("fleetRefillSize")} />
              <PrecisionSlider label="Quota fallimenti su rifornimento" value={input.refillSharePct} min={20} max={80} step={1} unit="%" tag="ipotesi" onChange={set("refillSharePct")} note="La parte restante colpisce l'assistenza guasti." />
              <PrecisionSlider label="Km medi per intervento extra" value={input.extraKmPerInt} min={2} max={60} step={1} unit=" km" tag="ipotesi" format={(n) => `${fmt0(n)} km`} onChange={set("extraKmPerInt")} />
              <PrecisionSlider label="Durata media intervento extra" value={input.extraMinPerInt} min={10} max={180} step={5} unit=" min" tag="ipotesi" format={(n) => `${fmt0(n)} min`} onChange={set("extraMinPerInt")} />
              <PrecisionSlider label="Costo al km" value={input.costPerKm} min={0.2} max={1.5} step={0.01} tag="benchmark" format={(n) => "€ " + n.toFixed(2).replace(".", ",")} onChange={set("costPerKm")} />
              <PrecisionSlider label="Costo ora flotta" value={input.fleetHourCost} min={20} max={70} step={1} tag="benchmark" format={fmtEur} onChange={set("fleetHourCost")} />
              <PrecisionSlider
                label="Extra residuo eliminabile (rotte / scheduling AI)"
                value={input.avoidableExtraPct}
                min={0}
                max={80}
                step={1}
                unit="%"
                tag="ipotesi"
                onChange={set("avoidableExtraPct")}
              />
            </Group>
          </Reveal>

          <Reveal>
            <Group code="D" title="Assistenza & guasti">
              <PrecisionSlider label="Guasti / anno" value={input.annualBreakdowns} min={0} max={30000} step={100} tag="ipotesi" format={fmt0} onChange={set("annualBreakdowns")} />
              <PrecisionSlider label="Tempo medio apertura ticket" value={input.ticketOpenMin} min={15} max={480} step={5} unit=" min" tag="ipotesi" format={(n) => `${fmt0(n)} min`} onChange={set("ticketOpenMin")} />
              <PrecisionSlider label="MTTR — tempo medio di riparazione" value={input.mttrMin} min={30} max={600} step={10} unit=" min" tag="benchmark" format={(n) => `${fmt0(n)} min`} onChange={set("mttrMin")} />
              <PrecisionSlider label="Costo medio intervento" value={input.avgInterventionCost} min={30} max={300} step={5} tag="ipotesi" format={fmtEur} onChange={set("avgInterventionCost")} />
              <PrecisionSlider label="Interventi ripetuti" value={input.repeatInterventionRate} min={0} max={40} step={1} unit="%" tag="ipotesi" onChange={set("repeatInterventionRate")} />
              <PrecisionSlider label="Fermo macchina extra per richiesta tardiva" value={input.downtimeHrsPerFailure} min={4} max={96} step={2} unit=" h" tag="ipotesi" format={(n) => `${fmt0(n)} h`} onChange={set("downtimeHrsPerFailure")} />
              <PrecisionSlider label="Costo orario fermo macchina" value={input.machineMarginPerHour} min={0.2} max={5} step={0.05} tag="ipotesi" format={(n) => "€ " + n.toFixed(2).replace(".", ",")} onChange={set("machineMarginPerHour")} />
              <PrecisionSlider label="Riduzione MTTR nel TO-BE" value={input.mttrReductionPct} min={0} max={60} step={1} unit="%" tag="ipotesi" onChange={set("mttrReductionPct")} note="Classificazione guasto, assegnazione tecnico e ricambi più rapidi." />
            </Group>
          </Reveal>

          <Reveal>
            <Group
              code="E"
              title="TO-BE · AI Multi-Agent"
              note="Valori di scenario: rappresentano il potenziale dell'orchestrazione, non risultati garantiti."
            >
              <PrecisionSlider label="Inbound preso in carico dall'Agente" value={input.aiAutomationRate} min={20} max={95} step={1} unit="%" tag="ipotesi" onChange={set("aiAutomationRate")} />
              <PrecisionSlider label="Contenuti senza operatore (containment)" value={input.aiContainmentRate} min={20} max={95} step={1} unit="%" tag="ipotesi" onChange={set("aiContainmentRate")} />
              <PrecisionSlider label="Riduzione chiamate perse" value={input.lostReductionPct} min={30} max={98} step={1} unit="%" tag="ipotesi" onChange={set("lostReductionPct")} />
              <PrecisionSlider label="Clienti 'non risponde' recuperati" value={input.aiRecoveryRate} min={10} max={90} step={1} unit="%" tag="ipotesi" onChange={set("aiRecoveryRate")} note="Retry automatici + canali digitali alternativi." />
              <PrecisionSlider label="Riduzione rework" value={input.reworkReductionPct} min={0} max={95} step={1} unit="%" tag="ipotesi" onChange={set("reworkReductionPct")} />
              <PrecisionSlider label="Riduzione repeat contact" value={input.repeatReductionPct} min={0} max={95} step={1} unit="%" tag="ipotesi" onChange={set("repeatReductionPct")} />
              <PrecisionSlider label="Fuori orario gestito automaticamente" value={input.outOfHoursAutoPct} min={0} max={100} step={1} unit="%" tag="ipotesi" onChange={set("outOfHoursAutoPct")} />
            </Group>
          </Reveal>

          <Reveal>
            <Group code="F" title="Costi & valorizzazione">
              <PrecisionSlider label="Costo annuo soluzione (licenze, AI, gestione)" value={input.aiAnnualCost} min={10000} max={300000} step={1000} tag="ipotesi" format={fmtEur} onChange={set("aiAnnualCost")} />
              <PrecisionSlider label="Implementazione & integrazione (una tantum)" value={input.aiImplementationCost} min={10000} max={300000} step={1000} tag="fornito" format={fmtEur} onChange={set("aiImplementationCost")} />
              <div className="xl:col-span-2">
                <PrecisionSlider
                  label="Quota di capacità operatore effettivamente monetizzata"
                  value={input.monetizePct}
                  min={0}
                  max={100}
                  step={5}
                  unit="%"
                  tag="utente"
                  onChange={set("monetizePct")}
                  note="Distingue Capacity Value (capacità liberata) da Cash Savings (costo realmente evitato). Se l'azienda non riduce il personale, il valore resta come produttività recuperata."
                />
              </div>
            </Group>
          </Reveal>
        </div>

        {/* ============ colonna risultati ============ */}
        <div className="space-y-6 pr-0.5 lg:sticky lg:top-24 lg:max-h-[calc(100vh-112px)] lg:self-start lg:overflow-y-auto lg:pr-2 panel-scroll">
          <Reveal>
            <Tile className="p-6 sm:p-7">
              <div className="mb-5 flex items-center justify-between">
                <span className="mono-label text-[10px]!">AS-IS vs TO-BE · impatto operativo</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-paper/35">
                  live
                </span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <CompareStat label="Chiamate perse / anno" asIs={r.asIs.lost} toBe={r.toBe.lost} format={fmt0} note={`Service level: ${fmtPct(r.asIs.serviceLevel * 100)} → ${fmtPct(r.toBe.serviceLevel * 100)}`} />
                <CompareStat label="Ore operatore / anno" asIs={r.asIs.operatorHours} toBe={r.toBe.operatorHours} format={fmtHrs} note={`Capacità liberata: ${fmt1(r.delta.fteFreed)} FTE equivalenti`} />
                <CompareStat label="Interventi extra / urgenti" asIs={extraIntAsIs} toBe={extraIntToBe} format={fmt0} note="Generati da richieste perse o non programmate" />
                <CompareStat label="Km flotta evitabili" asIs={r.asIs.fleet.extraKm} toBe={r.toBe.fleet.extraKm} format={fmtKm} note="Km totali vs km evitati dall'orchestrazione" />
                <CompareStat label="Ore flotta evitabili" asIs={r.asIs.fleet.extraFleetHours} toBe={r.toBe.fleet.extraFleetHours} format={fmtHrs} />
                <CompareStat label="Fermo macchina (downtime)" asIs={r.asIs.fleet.serviceDowntimeHrs} toBe={r.toBe.fleet.serviceDowntimeHrs} format={fmtHrs} note="Ore di fermo aggiuntive per richieste tardive" />
                <CompareStat label="First Contact Resolution" asIs={input.fcrPercent} toBe={r.kpi.fcrToBe} format={(n) => `${fmt0(n)}%`} invert={false} />
                <CompareStat label="FTE necessari" asIs={r.asIs.fteRequired} toBe={r.toBe.fteRequired} format={(n) => fmt1(n)} note={`Produttivi disponibili: ${fmt1(r.asIs.fteProductive)} FTE`} />
              </div>
            </Tile>
          </Reveal>

          <Reveal delay={80}>
            <Tile className="border-[#55d6ff]/25 p-6 sm:p-7">
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="mono-label mb-2">Beneficio annuo netto · scenario</div>
                  <div
                    className={cn(
                      "numeral text-[clamp(36px,3.4vw,52px)]",
                      r.econ.netAnnual >= 0 ? "text-[#55d6ff]" : "text-[#e8a33d]",
                    )}
                  >
                    <Ticker value={r.econ.netAnnual} format={(n) => (n < 0 ? "−" : "") + fmtEur(Math.abs(n))} />
                  </div>
                </div>
                <div className="text-right">
                  <div className="mono-label mb-1">Beneficio lordo</div>
                  <div className="numeral text-[20px] text-paper/85">
                    <Ticker value={r.econ.grossAnnual} format={fmtEur} />
                  </div>
                </div>
              </div>

              <Waterfall items={waterfallItems} />

              <div className="mt-7 grid grid-cols-2 gap-4 border-t border-white/8 pt-6 sm:grid-cols-3">
                <Stat label="Investimento" value={r.econ.investment} format={fmtEur} />
                <Stat
                  label="Payback"
                  value={r.econ.paybackMonths ?? 99}
                  format={(n) => (r.econ.paybackMonths == null ? "n/d" : `${fmt1(n)} mesi`)}
                  sub="Investimento / beneficio mensile netto"
                />
                <Stat
                  label="ROI 1° anno"
                  value={r.econ.roi12 ?? 0}
                  format={(n) => (r.econ.roi12 == null ? "n/d" : `${fmt0(n)}%`)}
                  accent={(r.econ.roi12 ?? 0) > 0}
                  sub="(Netto − investimento) / investimento"
                />
                <Stat label="Cash Savings" value={r.econ.ccCashSavings + r.econ.refillSavings + r.econ.serviceSavings} format={fmtEur} sub="Benefici realmente monetizzabili" />
                <Stat label="Capacity Value" value={r.econ.ccCapacityValue} format={fmtEur} accent sub="Capacità operatore liberata" />
                <Stat label="Costo soluzione / anno" value={r.econ.aiAnnual} format={fmtEur} />
              </div>
            </Tile>
          </Reveal>

          <Reveal delay={120}>
            <details className="formulas tile-flat p-5 sm:p-6">
              <summary className="flex items-center justify-between">
                <span className="font-display text-[15px] font-semibold tracking-tight text-paper/85">
                  Come viene calcolato?
                </span>
                <span className="chev font-mono text-[12px] text-[#55d6ff]">›</span>
              </summary>
              <div className="mt-5 space-y-2.5 font-mono text-[11.5px] leading-relaxed text-paper/55">
                <p><span className="text-[#55d6ff]">perse</span> = ricevute × % perse</p>
                <p><span className="text-[#55d6ff]">ore operatore</span> = gestite × AHT + rework + repeat + outbound + overhead</p>
                <p><span className="text-[#55d6ff]">mai raggiunti</span> = outbound × % no-answer × (1 − recupero 2°/3° tentativo)</p>
                <p><span className="text-[#55d6ff]">fallimenti operativi</span> = perse × % conversione + mai raggiunti × % non programmati × % conversione</p>
                <p><span className="text-[#55d6ff]">interventi extra</span> = fallimenti × quota rifornimento · km e ore per intervento</p>
                <p><span className="text-[#55d6ff]">cash vs capacity</span> = ore liberate × costo orario × % monetizzata</p>
                <p><span className="text-[#55d6ff]">payback</span> = investimento / (beneficio netto annuo / 12)</p>
                <p><span className="text-[#55d6ff]">ROI 12m</span> = (beneficio netto − investimento) / investimento</p>
                <div className="mt-4 border-t border-white/8 pt-4 text-paper/40">
                  <p>Attribuzione causale: una chiamata persa genera un intervento extra solo attraverso la % di conversione configurabile — non automaticamente.</p>
                  <p className="mt-2">Nessun doppio conteggio: la capacità operatore è valorizzata una sola volta (cash o capacity); i benefici di flotta derivano esclusivamente dai fallimenti operativi evitati.</p>
                </div>
              </div>
            </details>
          </Reveal>

          {/* ============ dashboard finale ============ */}
          <Reveal delay={160}>
            <Tile className="p-6 sm:p-8">
              <div className="mono-label mb-6">Dashboard di scenario</div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div>
                  <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.16em] text-[#e8a33d]">As-is</div>
                  <ul className="space-y-3 text-[13px]">
                    {[
                      [fmt0(input.vendingMachines + input.ocsMachines), "apparati totali"],
                      [fmt0(r.asIs.received), "chiamate inbound (scenario)"],
                      [fmtPct(input.lostCallPercent), "chiamate perse"],
                      [`${fmt0(input.numOperators)} → ${fmt1(r.asIs.fteProductive)}`, "FTE nominali → produttivi"],
                      [fmtPct(input.repeatContactRate), "repeat contact"],
                      [fmt0(r.asIs.fleet.failures), "richieste → disservizio"],
                      [fmtKm(r.asIs.fleet.extraKm), "km extra / anno"],
                      [fmtHrs(r.asIs.fleet.serviceDowntimeHrs), "downtime evitabile"],
                    ].map(([v, l]) => (
                      <li key={l} className="flex items-baseline justify-between gap-3 border-b border-white/6 pb-2">
                        <span className="text-paper/45">{l}</span>
                        <span className="numeral text-[15px] text-paper/90">{v}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.16em] text-[#55d6ff]">To-be</div>
                  <ul className="space-y-3 text-[13px]">
                    {[
                      [fmtPct(r.kpi.automationRate), "inbound gestito dall'Agente"],
                      [fmtPct(r.kpi.endToEndPct), "richieste end-to-end senza operatore"],
                      [fmtPct(input.escalationRate * 0.55), "escalation umane residue"],
                      [fmt0(Math.max(0, r.delta.repeatCallsAvoided)), "callback / repeat evitati"],
                      [fmt1(r.delta.fteFreed), "FTE di capacità liberata"],
                      [fmt0(Math.max(0, r.delta.extraIntAvoided)), "interventi extra evitati"],
                      [fmtKm(Math.max(0, r.delta.kmAvoided)), "km evitati"],
                      [fmtHrs(Math.max(0, r.delta.downtimeAvoided)), "downtime evitato"],
                    ].map(([v, l]) => (
                      <li key={l} className="flex items-baseline justify-between gap-3 border-b border-white/6 pb-2">
                        <span className="text-paper/45">{l}</span>
                        <span className="numeral text-[15px] text-[#bfeaff]">{v}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.16em] text-paper/70">Impatto</div>
                  <ul className="space-y-3 text-[13px]">
                    {[
                      [fmtEur(r.econ.ccCapacityValue), "capacity value"],
                      [fmtEur(r.econ.ccCashSavings + r.econ.refillSavings + r.econ.serviceSavings), "cash savings"],
                      [fmtEur(r.econ.investment), "investimento"],
                      [fmtEur(r.econ.netAnnual), "beneficio annuo netto"],
                      [r.econ.paybackMonths == null ? "n/d" : `${fmt1(r.econ.paybackMonths)} mesi`, "payback"],
                      [r.econ.roi12 == null ? "n/d" : `${fmt0(r.econ.roi12)}%`, "ROI 1° anno"],
                      [fmt0(r.delta.outOfHoursHandled), "richieste fuori orario gestite"],
                      [fmt0(r.delta.customersRecovered), "clienti non raggiunti recuperati"],
                    ].map(([v, l]) => (
                      <li key={l} className="flex items-baseline justify-between gap-3 border-b border-white/6 pb-2">
                        <span className="text-paper/45">{l}</span>
                        <span className="numeral text-[15px] text-paper">{v}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <p className="mt-6 text-[11.5px] leading-relaxed text-paper/38">
                Stima derivata dalle ipotesi configurate. Il valore effettivo richiede validazione
                sui dati operativi reali: volumi, AHT, rotte, costi e sistemi integrati.
              </p>
            </Tile>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
