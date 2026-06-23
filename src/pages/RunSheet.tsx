/**
 * /run-sheet — Venue & host run sheet. A demo HANDOFF for the night: what the venue/host need, device roles,
 * setup options, before/during/after checklists, and fallbacks (no TV / no audio / weak signal). Persona:
 * venue & host handoff. Not pub onboarding — no accounts, no contracts, no data capture.
 */
import { DemoShell } from "../components/shells";
import { DEMO_BRAND } from "../demo/brand";
import { SETUP_MODE_INFO } from "../demo/kpiModel";

export default function RunSheet() {
  const brand = "var(--ppn-brand)";
  const Section = ({ title }: { title: string }) => <h2 className="mt-8 text-sm font-semibold uppercase tracking-wider text-[var(--ppn-muted)]">{title}</h2>;
  const List = ({ items }: { items: string[] }) => (
    <ul className="mt-3 grid gap-2 sm:grid-cols-2">
      {items.map((t) => <li key={t} className="flex items-start gap-2 rounded-lg border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-3 text-sm"><span style={{ color: brand }}>☐</span> {t}</li>)}
    </ul>
  );

  const devices = [
    { role: "Laptop — room output", detail: "Runs the TV screen (/tv) full-screen on the TV/projector + sound where possible: QR, questions, reveal, scoreboard, sponsor moments, chimes/AI voice." },
    { role: "Tablet — host control", detail: "Runs the host console (/host): start, next question, reveal & score, replay, see answered teams and what players/TV show, read the script." },
    { role: "Phones — players", detail: "Each guest's own phone (/play): scan the QR, join a team, answer, see submitted / reveal / scoreboard." },
  ];

  return (
    <DemoShell>
      <div className="mx-auto max-w-4xl px-5 py-10">
        <p className="text-sm uppercase tracking-widest" style={{ color: brand }}>Venue &amp; host handoff</p>
        <h1 className="mt-2 text-3xl font-extrabold">Run sheet — {DEMO_BRAND.eventName}</h1>
        <p className="mt-1 text-[var(--ppn-muted)]">A simple sheet to run the night. {DEMO_BRAND.broughtBy}. Demo handoff — not pub onboarding.</p>

        <Section title="What the venue needs" />
        <List items={["Acceptable Wi-Fi or mobile signal for guests", "A TV / projector (optional — phones work without one)", "An audio route / speaker (optional)", "QR codes placed on tables", "Sponsor product stocked", "A member of staff to host or support"]} />

        <Section title="What the host needs" />
        <List items={["A tablet or laptop for the host console", "The event link / QR for this venue", "5 minutes to skim the read-aloud script", "Know the setup mode for tonight (TV+audio / audio-only / manual live)", "Know who reads (staff host or AI voice)"]} />

        <Section title="Device roles" />
        <p className="mt-1 text-sm font-semibold" style={{ color: brand }}>Laptop runs the room. Tablet controls the night. Phones handle participation.</p>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {devices.map((d) => (
            <div key={d.role} className="rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-4"><p className="text-sm font-semibold">{d.role}</p><p className="mt-1 text-xs text-[var(--ppn-muted)]">{d.detail}</p></div>
          ))}
        </div>

        <Section title="Setup options" />
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {(["tv_audio", "audio_only", "phones_hosted"] as const).map((id) => (
            <div key={id} className="rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-4"><p className="text-sm font-semibold">{SETUP_MODE_INFO[id].label}</p><p className="mt-1 text-xs text-[var(--ppn-muted)]">{SETUP_MODE_INFO[id].meaning}</p></div>
          ))}
        </div>

        <Section title="Before the event" />
        <List items={["Open /host on the tablet and confirm the venue/event", "Open /tv on the laptop and put it full-screen on the TV (if used)", "Check audio output (if used)", "Place QR codes on tables (welcome screen also shows the QR)", "Pick setup mode + whether to include the AI intro", "Do a 1-minute test join from a phone"]} />

        <Section title="During the event" />
        <List items={["Welcome the room (or play the AI intro)", "Start the game; read or trigger each question", "Watch the answered-teams count before revealing", "Reveal & score, then show the scoreboard", "Run the sponsored round when it comes up", "Use replay if a question needs repeating — it never resets answers"]} />

        <Section title="After the event" />
        <List items={["Show the winner + sponsor thanks", "Thank the room and mention the next event / offer", "Note rough attendance and how it went", "Complete the short post-event venue report", "Optional: keep a till/POS screenshot for later (not required)"]} />

        <Section title="If something is missing" />
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-4 text-sm"><p className="font-semibold">No TV</p><p className="mt-1 text-xs text-[var(--ppn-muted)]">Run audio-only or manual live — phones carry the question, options, reveal and scoreboard. The event is complete without a screen.</p></div>
          <div className="rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-4 text-sm"><p className="font-semibold">No audio</p><p className="mt-1 text-xs text-[var(--ppn-muted)]">Use manual live / phones-only — staff reads from the host panel; skip the AI voice and chimes.</p></div>
          <div className="rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-4 text-sm"><p className="font-semibold">Weak Wi-Fi / signal</p><p className="mt-1 text-xs text-[var(--ppn-muted)]">Keep teams smaller, allow a little extra time per question, and consider a staff hotspot near the play area. Phones reconnect and resume.</p></div>
        </div>

        <Section title="What the venue reports after" />
        <List items={["Total guests during the event window", "Sponsored product units sold", "Offer / voucher redemptions", "Busier than a normal night? (yes/no)", "Would you run it again? (yes/no)", "A short staff comment"]} />
        <p className="mt-2 text-xs text-[var(--ppn-muted)]">Manual venue report is enough for the POC. PPN measures engagement; the venue reports commercial outcome; POS can support it later. PPN does not measure bar sales.</p>
      </div>
    </DemoShell>
  );
}
