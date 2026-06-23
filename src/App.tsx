/**
 * PPN (PubPlay Network) — POC app shell. Routes are relative to a configurable base path (VITE_PPN_BASE_PATH)
 * so the same app works at the subdomain root (ppn.todeloo.com) or under a /ppn subpath. Local-first, deploy-ready.
 */
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Landing from "./pages/Landing";
import PlayJoin from "./pages/PlayJoin";
import Host from "./pages/Host";
import Tv from "./pages/Tv";
import BrandAssets from "./pages/BrandAssets";
import Config from "./pages/Config";
import Operator from "./pages/Operator";
import SetupWizard from "./pages/SetupWizard";
import Kpi from "./pages/Kpi";
import Rollout from "./pages/Rollout";
import Report from "./pages/Report";
import RunSheet from "./pages/RunSheet";
import Capabilities from "./pages/Capabilities";
import Presentation from "./pages/Presentation";
import Preview from "./pages/Preview";
import { PresenterTools } from "./components/PresenterTools";
import { OperatorGate } from "./components/OperatorGate";

const BASENAME = import.meta.env.VITE_PPN_BASE_PATH ?? "/";

/**
 * Reliable in-app scroll-to-hash. React Router does not scroll to #anchors itself, and on a direct SPA load the
 * target id may not be mounted yet when the browser tries — so we retry across a few frames, then scrollIntoView.
 * Covers deep links like /config#brand-media and /setup#asset-slots. Display-only; runs only when a hash exists.
 */
function ScrollToHash() {
  const { hash, pathname } = useLocation();
  useEffect(() => {
    if (!hash) return;
    const id = decodeURIComponent(hash.slice(1));
    let raf = 0;
    let tries = 0;
    const tick = () => {
      const el = document.getElementById(id);
      if (el) { el.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
      if (tries++ < 30) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [hash, pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter basename={BASENAME}>
      <ScrollToHash />
      <PresenterTools />
      <Routes>
        <Route path="/" element={<Landing />} />
        {/* Functional surfaces */}
        <Route path="/play/:joinToken" element={<PlayJoin />} />
        {/* Operator/control surfaces — POC gate (not production auth). /play + /tv are never gated. */}
        <Route path="/host" element={<OperatorGate><Host /></OperatorGate>} />
        <Route path="/tv/:sessionId" element={<Tv />} />
        {/* Operator hub + detailed setup (gated) */}
        <Route path="/operator" element={<OperatorGate><Operator /></OperatorGate>} />
        <Route path="/operator/setup-wizard" element={<OperatorGate><SetupWizard /></OperatorGate>} />
        <Route path="/config" element={<OperatorGate><Config /></OperatorGate>} />
        <Route path="/setup" element={<BrandAssets />} />
        {/* Client-facing guided presentation (read-only, client-safe — never gated). */}
        <Route path="/presentation" element={<Presentation />} />
        <Route path="/kpi" element={<Kpi />} />
        <Route path="/rollout" element={<Rollout />} />
        <Route path="/report" element={<Report />} />
        <Route path="/run-sheet" element={<RunSheet />} />
        <Route path="/capabilities" element={<Capabilities />} />
        <Route path="*" element={<Preview title="Not found" blurb="That screen isn't part of the demo. Head back to the overview." />} />
      </Routes>
    </BrowserRouter>
  );
}
