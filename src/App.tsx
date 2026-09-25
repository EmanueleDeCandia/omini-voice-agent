import { useCallback, useState, type CSSProperties } from "react";
import { AmbientBackground, CtaFooter, Hero, Nav } from "./components/Chrome";
import { StorySections } from "./components/Story";
import { Simulator } from "./components/Simulator";
import { DEFAULT_INPUT, type SimInput } from "./lib/simulator";

export default function App() {
  const [input, setInputState] = useState<SimInput>({ ...DEFAULT_INPUT });

  const setInput = useCallback((updater: (prev: SimInput) => SimInput) => {
    setInputState(updater);
  }, []);

  /* energia dello scenario → bagliore del background (molto sottile) */
  const energy =
    (input.aiAutomationRate / 100) * 0.45 +
    (input.aiContainmentRate / 100) * 0.3 +
    (input.lostReductionPct / 100) * 0.25;

  return (
    <div style={{ "--energy": energy.toFixed(3) } as CSSProperties}>
      <AmbientBackground />
      <Nav />
      <main>
        <Hero />
        <StorySections input={input} />
        <Simulator input={input} setInput={setInput} />
      </main>
      <CtaFooter />
    </div>
  );
}
