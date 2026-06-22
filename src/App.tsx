/**
 * PPN (PubPlay Network) — POC app shell.
 *
 * Routing is written relative to a configurable base path (VITE_PPN_BASE_PATH) so the same app works at the
 * subdomain root (ppn.todeloo.com) or under a /ppn subpath, with no code changes. Local-first, deploy-ready.
 */
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import PlayJoin from "./pages/PlayJoin";
import Host from "./pages/Host";

const BASENAME = import.meta.env.VITE_PPN_BASE_PATH ?? "/";

function Home() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight text-emerald-400">PubPlay Network</h1>
      <p className="mt-2 text-slate-400">POC scaffold — live‑event core (local) + brewery demo surfaces (seeded).</p>
      <p className="mt-6 text-sm text-slate-500">Routes (placeholders during bootstrap):</p>
      <ul className="mt-2 grid grid-cols-2 gap-1 text-sm">
        {["/config", "/setup", "/host", "/play/demo", "/tv/demo", "/kpi", "/rollout", "/capabilities"].map((r) => (
          <li key={r}>
            <Link className="text-emerald-300 hover:underline" to={r}>
              {r}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

function Placeholder({ name }: { name: string }) {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <Link className="text-sm text-emerald-300 hover:underline" to="/">
        ← PPN
      </Link>
      <h2 className="mt-4 text-xl font-semibold">{name}</h2>
      <p className="mt-2 text-slate-400">Placeholder — built in the POC build order.</p>
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter basename={BASENAME}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/config" element={<Placeholder name="Brewery preset / config (hidden)" />} />
        <Route path="/setup" element={<Placeholder name="Demo setup — market / venue / brand studio" />} />
        <Route path="/host" element={<Host />} />
        <Route path="/play/:joinToken" element={<PlayJoin />} />
        <Route path="/tv/:sessionId" element={<Placeholder name="TV / display view" />} />
        <Route path="/kpi" element={<Placeholder name="Brewery KPI mock-up" />} />
        <Route path="/rollout" element={<Placeholder name="Rollout / network view" />} />
        <Route path="/capabilities" element={<Placeholder name="Broader-than-quiz capability cards" />} />
        <Route path="*" element={<Placeholder name="Not found" />} />
      </Routes>
    </BrowserRouter>
  );
}
