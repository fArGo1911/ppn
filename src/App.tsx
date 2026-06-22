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
import Config from "./pages/Config";
import Kpi from "./pages/Kpi";
import Rollout from "./pages/Rollout";
import Capabilities from "./pages/Capabilities";
import Preview from "./pages/Preview";
import { PresenterTools } from "./components/PresenterTools";

const BASENAME = import.meta.env.VITE_PPN_BASE_PATH ?? "/";

export default function App() {
  return (
    <BrowserRouter basename={BASENAME}>
      <PresenterTools />
      <Routes>
        <Route path="/" element={<Landing />} />
        {/* Functional surfaces */}
        <Route path="/play/:joinToken" element={<PlayJoin />} />
        <Route path="/host" element={<Host />} />
        <Route path="/tv/:sessionId" element={<Tv />} />
        {/* Commercial surfaces */}
        <Route path="/config" element={<Config />} />
        <Route path="/setup" element={<BrandAssets />} />
        <Route path="/kpi" element={<Kpi />} />
        <Route path="/rollout" element={<Rollout />} />
        <Route path="/capabilities" element={<Capabilities />} />
        <Route path="*" element={<Preview title="Not found" blurb="That screen isn't part of the demo. Head back to the overview." />} />
      </Routes>
    </BrowserRouter>
  );
}
