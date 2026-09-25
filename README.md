# Omni Customer Care

Landing page di presentazione di **Omni Customer Care**, una piattaforma concettuale di orchestrazione AI per il Customer Care. Il progetto racconta come un Voice Agent, un motore Multi-Agent e i sistemi aziendali possano trasformare una chiamata inbound o un contatto outbound in un intervento operativo pianificato.

> **Nota:** questa repository contiene esclusivamente una landing page dimostrativa e un simulatore client-side. Non è presente un backend, non vengono effettuate chiamate reali a CRM/ERP/Fleet/Service e i KPI visualizzati sono stime di scenario, non dati aziendali certificati né risultati garantiti.

## Cosa mostra la landing page

La pagina segue il percorso operativo completo, dal contatto all'azione:

- **Hero e live console** — presenta il posizionamento di Omni Customer Care e una console animata di orchestrazione.
- **Perimetro operativo** — mostra il parco di apparati e i volumi di chiamate dello scenario.
- **Problema / AS-IS** — visualizza la catena causale che collega chiamate perse, richieste non acquisite, interventi urgenti, chilometri extra e downtime.
- **Funnel operativo** — confronta il flusso AS-IS con il TO-BE nelle fasi di contatto, programmazione, intervento ed esito.
- **Piattaforma TO-BE** — illustra l'architettura concettuale composta da Voice Agent, orchestratore Multi-Agent e sistemi CRM, ERP, Fleet e Service.
- **Operating model** — descrive il loop `Contact → Understand → Orchestrate → Execute → Confirm → Learn`.
- **ROI Simulator** — consente di modificare volumi, KPI, ipotesi operative e parametri AI per confrontare impatto operativo ed economico.

## Simulatore ROI

Il simulatore è implementato interamente nel browser e calcola in tempo reale:

- chiamate ricevute, gestite e perse;
- ore operatore, FTE richiesti e capacità liberata;
- clienti non raggiunti, retry e richieste recuperate;
- interventi extra, chilometri e ore di flotta evitabili;
- downtime e costi dell'assistenza;
- cash savings, capacity value, beneficio netto annuo, payback e ROI a 12 mesi.

Il modello separa i dati forniti, gli scenari, le ipotesi, i benchmark e i valori inseriti dall'utente. Inoltre:

- una chiamata persa non genera automaticamente un intervento extra: viene applicata una percentuale di conversione causale configurabile;
- la capacità liberata dagli operatori viene valorizzata una sola volta, come cash saving o capacity value;
- i benefici di flotta derivano esclusivamente dai fallimenti operativi evitati;
- tutti i valori restano ipotesi configurabili da validare con dati reali.

## Stack tecnologico

- [React](https://react.dev/) 19
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)
- [Tailwind CSS](https://tailwindcss.com/) 4 tramite `@tailwindcss/vite`
- `vite-plugin-singlefile` per produrre un bundle HTML autonomo
- `clsx` e `tailwind-merge` per la composizione delle classi
- Font Geist, Geist Mono e Space Grotesk caricate da Google Fonts

## Struttura del progetto

```text
.
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── src
    ├── App.tsx
    ├── main.tsx
    ├── index.css
    ├── components
    │   ├── Chrome.tsx       # sfondo, navigazione, hero, console e footer
    │   ├── Simulator.tsx    # form, risultati e dashboard ROI
    │   ├── Story.tsx        # sezioni narrative AS-IS / TO-BE / processo
    │   └── ui.tsx            # componenti UI condivisi e animazioni
    ├── lib
    │   └── simulator.ts     # input, modello di calcolo e formattazione KPI
    └── utils
        └── cn.ts            # utility per comporre classi CSS
```

## Requisiti

- Node.js 18 o superiore
- npm

## Avvio in locale

Installa le dipendenze:

```bash
npm install
```

Avvia il server di sviluppo:

```bash
npm run dev
```

Apri quindi l'URL mostrato da Vite, normalmente `http://localhost:5173`.

## Build e anteprima

Crea la build di produzione:

```bash
npm run build
```

La build viene generata nella directory `dist/`. Per servirla localmente:

```bash
npm run preview
```

Il plugin `vite-plugin-singlefile` è configurato in `vite.config.ts` per incorporare le risorse nella pagina prodotta, facilitando la pubblicazione come landing page autonoma.

## Accessibilità e comportamento responsive

La landing page include:

- layout responsive per mobile, tablet e desktop;
- landmark e label ARIA per navigazione, diagrammi e controlli;
- supporto a `prefers-reduced-motion` per ridurre animazioni e scrolling orizzontale quando richiesto;
- animazioni di reveal, contatori e console live realizzate lato client;
- navigazione ad ancora tra le sezioni della pagina.

## Contatti demo

La CTA della landing page apre una richiesta demo tramite:

`demo@omniap.io`

## Licenza

Non è presente un file di licenza nella repository. Prima di riutilizzare o distribuire il progetto, verificare i diritti sul codice, sui contenuti e sugli asset utilizzati.
