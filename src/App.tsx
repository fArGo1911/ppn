/**
 * PPN (PubPlay Network) — POC app shell. Routes are relative to a configurable base path (VITE_PPN_BASE_PATH)
 * so the same app works at the subdomain root (ppn.todeloo.com) or under a /ppn subpath. Local-first, deploy-ready.
 */
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import PlayJoin from "./pages/PlayJoin";
import Host from "./pages/Host";
import Tv from "./pages/Tv";
import BrandAssets from "./pages/BrandAssets";
import Preview from "./pages/Preview";

const BASENAME = import.meta.env.VITE_PPN_BASE_PATH ?? "/";

export default function App() {
  return (
    <BrowserRouter basename={BASENAME}>
      <Routes>
        <Route path="/" element={<Landing />} />
        {/* Functional surfaces */}
        <Route path="/play/:joinToken" element={<PlayJoin />} />
        <Route path="/host" element={<Host />} />
        <Route path="/tv/:sessionId" element={<Tv />} />
        {/* Commercial surfaces — branded previews this slice (built later in the POC order) */}
        <Route path="/config" element={<Preview title="Brewery preset / config" blurb="Switch the demo to a specific brewery — identity, colours, market, offer — without code changes. (Hidden presenter control; built later.)" />} />
        <Route path="/setup" element={<BrandAssets />} />
        <Route path="/kpi" element={<Preview title="Brewery KPI report" blurb="The campaign proof a sponsor receives — reach, sponsored-round participation, dwell, venue network. Built later." />} />
        <Route path="/rollout" element={<Preview title="Rollout / network" blurb="From a pilot to a brewery-funded pub network: 5 → 25 → 100 venues. Built later." />} />
        <Route path="/capabilities" element={<Preview title="Beyond quiz" blurb="Music nights, match-day games, sponsored mini-games, seasonal & inter-pub events — the same network. Built later." />} />
        <Route path="*" element={<Preview title="Not found" blurb="That screen isn't part of the demo. Head back to the overview." />} />
      </Routes>
    </BrowserRouter>
  );
}
