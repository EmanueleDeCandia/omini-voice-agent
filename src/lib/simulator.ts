/* ============================================================
   Omni Customer Care — modello di scenario ROI
   Livello 1: input  ·  Livello 2: KPI operativi
   Livello 3: impatto operativo  ·  Livello 4: impatto economico

   Regole del modello:
   · Una chiamata persa NON genera automaticamente un intervento
     extra: esiste una % di conversione causale configurabile.
   · Nessun doppio conteggio: la capacità operatore liberata è
     conteggiata una sola volta (Cash o Capacity), i benefici di
     flotta derivano solo dai fallimenti operativi evitati.
   · Tutti i valori sono di scenario, non dati certificati.
   ============================================================ */

export type SourceTag = "fornito" | "scenario" | "ipotesi" | "benchmark" | "utente";

export interface SimInput {
  /* — parco installato — */
  vendingMachines: number;
  ocsMachines: number;

  /* — contact center AS-IS — */
  annualCalls: number;
  callsBase: "received" | "handled"; // semantica del volume (§14)
  lostCallPercent: number;
  numOperators: number; // FTE nominali
  productiveFactor: number; // % FTE produttivi (ferie, assenze, formazione…)
  operatorCostAnnual: number;
  ahtMin: number; // Average Handling Time
  wrapOverheadPct: number; // attività post-call, pause, supervisione
  reworkPercent: number; // errori di interpretazione / data entry
  repeatContactRate: number; // richiamate per richiesta non risolta
  escalationRate: number;
  transferRate: number;
  fcrPercent: number; // First Contact Resolution
  outOfHoursPercent: number; // richieste fuori orario operativo
  peakFactor: number; // picco / domanda media

  /* — outbound & contattabilità — */
  outboundCalls: number; // tentativi proattivi di programmazione
  noAnswerRate: number; // % clienti che non rispondono al 1° tentativo
  secondReachRate: number; // % recuperati al 2°/3° tentativo
  avgAttempts: number; // tentativi medi per richiesta
  failedAttemptMin: number; // tempo medio per tentativo fallito
  talkOutMin: number; // durata media contatto outbound riuscito
  unscheduledRate: number; // % non raggiunti che resta NON programmato
  lostToOpsRate: number; // % conversione richiesta persa → disservizio operativo

  /* — flotta rifornimento — */
  fleetRefillSize: number;
  refillSharePct: number; // quota fallimenti che colpisce il rifornimento
  extraKmPerInt: number; // km medi per intervento extra
  extraMinPerInt: number; // durata media intervento extra
  costPerKm: number;
  fleetHourCost: number;
  avoidableExtraPct: number; // % extra residuo eliminato da scheduling/rotte AI

  /* — assistenza & guasti — */
  annualBreakdowns: number;
  ticketOpenMin: number; // tempo medio apertura ticket AS-IS
  mttrMin: number; // Mean Time To Repair
  avgInterventionCost: number;
  repeatInterventionRate: number; // interventi ripetuti
  downtimeHrsPerFailure: number; // fermo macchina aggiuntivo per richiesta tardiva
  machineMarginPerHour: number; // costo/ora di fermo macchina
  mttrReductionPct: number; // riduzione TO-BE (classificazione, ricambi, assegnazione)

  /* — TO-BE / AI multi-agent — */
  aiAutomationRate: number; // % inbound preso in carico dall'agente
  aiContainmentRate: number; // % risolti senza operatore umano
  lostReductionPct: number; // riduzione delle chiamate perse
  aiRecoveryRate: number; // % clienti "non risponde" recuperati (multi-tentativo + canali digitali)
  reworkReductionPct: number;
  repeatReductionPct: number;
  outOfHoursAutoPct: number; // % fuori orario gestito automaticamente

  /* — costi & valorizzazione — */
  aiAnnualCost: number; // licenze, consumo AI/voice, manutenzione
  aiImplementationCost: number; // setup, integrazione, una tantum
  monetizePct: number; // quota capacità operatore realmente monetizzata
}

export const DEFAULT_INPUT: SimInput = {
  vendingMachines: 24000,
  ocsMachines: 8000,

  annualCalls: 150000,
  callsBase: "received",
  lostCallPercent: 30,
  numOperators: 10,
  productiveFactor: 75,
  operatorCostAnnual: 32000,
  ahtMin: 6,
  wrapOverheadPct: 18,
  reworkPercent: 10,
  repeatContactRate: 12,
  escalationRate: 8,
  transferRate: 15,
  fcrPercent: 62,
  outOfHoursPercent: 12,
  peakFactor: 1.6,

  outboundCalls: 24000,
  noAnswerRate: 35,
  secondReachRate: 45,
  avgAttempts: 2.2,
  failedAttemptMin: 2.5,
  talkOutMin: 3.5,
  unscheduledRate: 55,
  lostToOpsRate: 35,

  fleetRefillSize: 15,
  refillSharePct: 60,
  extraKmPerInt: 16,
  extraMinPerInt: 55,
  costPerKm: 0.62,
  fleetHourCost: 36,
  avoidableExtraPct: 30,

  annualBreakdowns: 9500,
  ticketOpenMin: 240,
  mttrMin: 150,
  avgInterventionCost: 90,
  repeatInterventionRate: 14,
  downtimeHrsPerFailure: 30,
  machineMarginPerHour: 0.85,
  mttrReductionPct: 25,

  aiAutomationRate: 70,
  aiContainmentRate: 65,
  lostReductionPct: 85,
  aiRecoveryRate: 55,
  reworkReductionPct: 70,
  repeatReductionPct: 65,
  outOfHoursAutoPct: 80,

  aiAnnualCost: 58000,
  aiImplementationCost: 45000,
  monetizePct: 50,
};

const ANNUAL_HOURS = 1720; // ore lavorative annue per FTE
const pct = (v: number) => v / 100;

export interface CcResult {
  received: number;
  handled: number;
  lost: number;
  lostRate: number;
  talkHours: number;
  reworkHours: number;
  repeatHours: number;
  outboundHours: number;
  overheadHours: number;
  operatorHours: number;
  fteRequired: number;
  fteProductive: number;
  availableHours: number;
  overtimeHours: number;
  hourlyCost: number;
  ccCost: number;
  outOfHoursCalls: number;
  // outbound / contattabilità
  firstAnswer: number;
  retried: number;
  reachedOnRetry: number;
  neverReached: number;
  totalAttempts: number;
  failedAttempts: number;
  serviceLevel: number;
}

export interface FleetResult {
  failures: number; // richieste → disservizio operativo
  extraInterventions: number;
  extraKm: number;
  extraFleetHours: number;
  extraCost: number;
  serviceExtra: number;
  serviceDowntimeHrs: number;
  serviceDowntimeCost: number;
  serviceRepeat: number;
  serviceRepeatCost: number;
  servicePremiumCost: number;
  serviceCost: number;
  totalOpsCost: number;
}

export interface SimResult {
  asIs: CcResult & { fleet: FleetResult };
  toBe: CcResult & { fleet: FleetResult };
  delta: {
    lostAvoided: number;
    lostReduction: number; // -%
    hoursFreed: number;
    fteFreed: number;
    extraIntAvoided: number;
    kmAvoided: number;
    fleetHoursAvoided: number;
    downtimeAvoided: number;
    repeatCallsAvoided: number;
    outOfHoursHandled: number;
    customersRecovered: number;
  };
  econ: {
    ccCapacityValue: number;
    ccCashSavings: number;
    overtimeAvoidedCash: number;
    refillSavings: number;
    serviceSavings: number;
    grossAnnual: number;
    aiAnnual: number;
    netAnnual: number;
    investment: number;
    paybackMonths: number | null;
    roi12: number | null;
  };
  kpi: {
    asaSeconds: number;
    fcrToBe: number;
    containmentRate: number;
    automationRate: number;
    escalationToBe: number;
    ticketOpenToBeMin: number;
    mttrToBeMin: number;
    endToEndPct: number;
  };
}

export function simulate(i: SimInput): SimResult {
  /* ---------- volumi inbound (§14: semantica del dato) ---------- */
  const lostRateAsIs = pct(i.lostCallPercent);
  const received =
    i.callsBase === "received"
      ? i.annualCalls
      : i.annualCalls / (1 - Math.min(lostRateAsIs, 0.9));
  const lost = received * lostRateAsIs;
  const handled = received - lost;

  const hourlyCost = i.operatorCostAnnual / ANNUAL_HOURS;

  /* ---------- ore operatore AS-IS ---------- */
  const talk = (handled * i.ahtMin) / 60;
  const rework = talk * pct(i.reworkPercent);
  const repeat = talk * pct(i.repeatContactRate);

  /* ---------- outbound & contattabilità ---------- */
  const firstAnswer = i.outboundCalls * (1 - pct(i.noAnswerRate));
  const retried = i.outboundCalls * pct(i.noAnswerRate);
  const reachedOnRetry = retried * pct(i.secondReachRate);
  const neverReached = retried - reachedOnRetry;
  const totalAttempts = i.outboundCalls + retried * Math.max(0, i.avgAttempts - 1);
  const failedAttempts = Math.max(0, totalAttempts - firstAnswer - reachedOnRetry);
  const outboundHours =
    ((firstAnswer + reachedOnRetry) * i.talkOutMin + failedAttempts * i.failedAttemptMin) / 60;

  const overhead = (talk + rework + repeat + outboundHours) * pct(i.wrapOverheadPct);
  const operatorHours = talk + rework + repeat + outboundHours + overhead;
  const fteRequired = operatorHours / ANNUAL_HOURS;
  const fteProductive = i.numOperators * pct(i.productiveFactor);
  const availableHours = fteProductive * ANNUAL_HOURS;
  const overtimeHours = Math.max(0, operatorHours - availableHours);
  const ccCost = i.numOperators * i.operatorCostAnnual + overtimeHours * hourlyCost * 1.35;

  /* ---------- catena causale → fallimenti operativi (§22) ---------- */
  const failures =
    lost * pct(i.lostToOpsRate) + neverReached * pct(i.unscheduledRate) * pct(i.lostToOpsRate);

  const fleetAsIs = fleetImpact(i, failures, 1);

  const asIs: CcResult & { fleet: FleetResult } = {
    received,
    handled,
    lost,
    lostRate: lostRateAsIs,
    talkHours: talk,
    reworkHours: rework,
    repeatHours: repeat,
    outboundHours,
    overheadHours: overhead,
    operatorHours,
    fteRequired,
    fteProductive,
    availableHours,
    overtimeHours,
    hourlyCost,
    ccCost,
    outOfHoursCalls: received * pct(i.outOfHoursPercent),
    firstAnswer,
    retried,
    reachedOnRetry,
    neverReached,
    totalAttempts,
    failedAttempts,
    serviceLevel: received > 0 ? handled / received : 1,
    fleet: fleetAsIs,
  };

  /* ================= TO-BE ================= */
  const lostRateToBe = lostRateAsIs * (1 - pct(i.lostReductionPct));
  const lostToBe = received * lostRateToBe;
  const handledToBe = received - lostToBe;

  const contained = received * pct(i.aiAutomationRate) * pct(i.aiContainmentRate);
  const humanCalls = Math.max(0, received - contained);

  const talkT = (humanCalls * i.ahtMin) / 60;
  const reworkT = talkT * pct(i.reworkPercent) * (1 - pct(i.reworkReductionPct));
  const repeatT = talkT * pct(i.repeatContactRate) * (1 - pct(i.repeatReductionPct));

  const neverReachedT = neverReached * (1 - pct(i.aiRecoveryRate));
  const reachedOnRetryT = retried - neverReachedT;
  // l'agente esegue i tentativi: il costo tempo umano residuo è supervisione
  const outboundHoursT = outboundHours * 0.08;

  const overheadT = (talkT + reworkT + repeatT + outboundHoursT) * pct(i.wrapOverheadPct);
  const operatorHoursT = talkT + reworkT + repeatT + outboundHoursT + overheadT;
  const fteRequiredT = operatorHoursT / ANNUAL_HOURS;
  const overtimeHoursT = Math.max(0, operatorHoursT - availableHours);
  const ccCostT =
    i.numOperators * i.operatorCostAnnual * (operatorHoursT / Math.max(1, operatorHours)) +
    overtimeHoursT * hourlyCost * 1.35;

  const failuresBase =
    lostToBe * pct(i.lostToOpsRate) +
    neverReachedT * pct(i.unscheduledRate) * pct(i.lostToOpsRate);
  const failuresT = failuresBase * (1 - pct(i.avoidableExtraPct));

  const fleetToBe = fleetImpact(i, failuresT, 1 - pct(i.mttrReductionPct));

  const toBe: CcResult & { fleet: FleetResult } = {
    received,
    handled: handledToBe,
    lost: lostToBe,
    lostRate: lostRateToBe,
    talkHours: talkT,
    reworkHours: reworkT,
    repeatHours: repeatT,
    outboundHours: outboundHoursT,
    overheadHours: overheadT,
    operatorHours: operatorHoursT,
    fteRequired: fteRequiredT,
    fteProductive,
    availableHours,
    overtimeHours: overtimeHoursT,
    hourlyCost,
    ccCost: ccCostT,
    outOfHoursCalls: received * pct(i.outOfHoursPercent),
    firstAnswer,
    retried,
    reachedOnRetry: reachedOnRetryT,
    neverReached: neverReachedT,
    totalAttempts: totalAttempts * (1 - pct(i.aiRecoveryRate) * 0.5),
    failedAttempts: failedAttempts * (1 - pct(i.aiRecoveryRate)),
    serviceLevel: received > 0 ? handledToBe / received : 1,
    fleet: fleetToBe,
  };

  /* ================= delta & economia ================= */
  const hoursFreed = Math.max(0, operatorHours - operatorHoursT);
  const refillShare = pct(i.refillSharePct);

  const extraIntAsIs = failures * refillShare;
  const extraIntToBe = failuresT * refillShare;
  const kmAvoided = (extraIntAsIs - extraIntToBe) * i.extraKmPerInt;
  const fleetHoursAvoided = ((extraIntAsIs - extraIntToBe) * i.extraMinPerInt) / 60;

  const serviceExtraAsIs = failures * (1 - refillShare);
  const serviceExtraToBe = failuresT * (1 - refillShare);
  const downtimeAvoided =
    serviceExtraAsIs * i.downtimeHrsPerFailure -
    serviceExtraToBe * i.downtimeHrsPerFailure * (1 - pct(i.mttrReductionPct));

  const ccCapacityValue = hoursFreed * hourlyCost;
  const overtimeAvoidedCash = Math.max(0, overtimeHours - overtimeHoursT) * hourlyCost * 0.35;
  const ccCashSavings = ccCapacityValue * pct(i.monetizePct) + overtimeAvoidedCash;

  const refillSavings = kmAvoided * i.costPerKm + fleetHoursAvoided * i.fleetHourCost;
  const serviceSavings = Math.max(0, fleetAsIs.serviceCost - fleetToBe.serviceCost);

  const grossAnnual = ccCashSavings + refillSavings + serviceSavings;
  const netAnnual = grossAnnual - i.aiAnnualCost;
  const paybackMonths = netAnnual > 0 ? i.aiImplementationCost / (netAnnual / 12) : null;
  const roi12 =
    netAnnual - i.aiImplementationCost !== 0
      ? ((netAnnual - i.aiImplementationCost) / i.aiImplementationCost) * 100
      : null;

  return {
    asIs,
    toBe,
    delta: {
      lostAvoided: lost - lostToBe,
      lostReduction: lost > 0 ? (1 - lostToBe / lost) * 100 : 0,
      hoursFreed,
      fteFreed: hoursFreed / ANNUAL_HOURS,
      extraIntAvoided: extraIntAsIs - extraIntToBe + (serviceExtraAsIs - serviceExtraToBe),
      kmAvoided,
      fleetHoursAvoided,
      downtimeAvoided,
      repeatCallsAvoided:
        (handled * pct(i.repeatContactRate) + failedAttempts) -
        (handledToBe * pct(i.repeatContactRate) * (1 - pct(i.repeatReductionPct)) +
          failedAttempts * (1 - pct(i.aiRecoveryRate))),
      outOfHoursHandled: received * pct(i.outOfHoursPercent) * pct(i.outOfHoursAutoPct),
      customersRecovered: neverReached - neverReachedT,
    },
    econ: {
      ccCapacityValue,
      ccCashSavings,
      overtimeAvoidedCash,
      refillSavings,
      serviceSavings,
      grossAnnual,
      aiAnnual: i.aiAnnualCost,
      netAnnual,
      investment: i.aiImplementationCost,
      paybackMonths,
      roi12,
    },
    kpi: {
      asaSeconds: Math.round(18 + i.peakFactor * 22 + i.lostCallPercent * 2.4),
      fcrToBe: Math.min(96, i.fcrPercent + 21),
      containmentRate: pct(i.aiAutomationRate) * pct(i.aiContainmentRate) * 100,
      automationRate: i.aiAutomationRate,
      escalationToBe: Math.max(2, i.escalationRate * 0.55),
      ticketOpenToBeMin: 2,
      mttrToBeMin: Math.round(i.mttrMin * (1 - pct(i.mttrReductionPct))),
      endToEndPct: Math.min(94, pct(i.aiAutomationRate) * pct(i.aiContainmentRate) * 100 * 0.92),
    },
  };
}

function fleetImpact(i: SimInput, failures: number, downtimeFactor: number): FleetResult {
  const refillShare = pct(i.refillSharePct);
  const extraInterventions = failures * refillShare;
  const extraKm = extraInterventions * i.extraKmPerInt;
  const extraFleetHours = (extraInterventions * i.extraMinPerInt) / 60;
  const extraCost = extraKm * i.costPerKm + extraFleetHours * i.fleetHourCost;

  const serviceExtra = failures * (1 - refillShare);
  const serviceDowntimeHrs = serviceExtra * i.downtimeHrsPerFailure * downtimeFactor;
  const serviceDowntimeCost = serviceDowntimeHrs * i.machineMarginPerHour;
  const serviceRepeat = serviceExtra * pct(i.repeatInterventionRate);
  const serviceRepeatCost = serviceRepeat * i.avgInterventionCost;
  const servicePremiumCost = serviceExtra * i.avgInterventionCost * 0.35; // trasferta urgente non pianificata
  const serviceCost = serviceDowntimeCost + serviceRepeatCost + servicePremiumCost;

  return {
    failures,
    extraInterventions,
    extraKm,
    extraFleetHours,
    extraCost,
    serviceExtra,
    serviceDowntimeHrs,
    serviceDowntimeCost,
    serviceRepeat,
    serviceRepeatCost,
    servicePremiumCost,
    serviceCost,
    totalOpsCost: extraCost + serviceCost,
  };
}

/* ================= formattazione it-IT ================= */

const nf0 = new Intl.NumberFormat("it-IT", { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat("it-IT", { maximumFractionDigits: 1 });

export const fmt0 = (n: number) => nf0.format(Math.round(n));
export const fmt1 = (n: number) => nf1.format(n);
export const fmtEur = (n: number) => "€ " + nf0.format(Math.round(n));
export const fmtPct = (n: number) => nf1.format(n) + "%";
export const fmtHrs = (n: number) => nf0.format(Math.round(n)) + " h";
export const fmtKm = (n: number) => nf0.format(Math.round(n)) + " km";
