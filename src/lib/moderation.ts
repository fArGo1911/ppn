/**
 * Team/player name moderation (POC brand-safety, NOT a moderation platform). Deterministic, in-repo blocklist.
 * Goal: keep offensive/garbage names off the sponsor-branded TV/scoreboard. Errs toward blocking (e.g. the
 * classic "Scunthorpe" false positive is acceptable for a demo). Existing unsafe DB names render as a safe
 * fallback via safeDisplayName() — never raw on the TV.
 */

// Strong terms — matched as a substring of the compacted name (leet-normalised, letters only).
const STRONG = [
  "fuck", "cunt", "nigger", "nigga", "faggot", "kike", "chink", "coon", "wanker", "bollocks",
  "pussy", "whore", "bastard", "retard", "spastic", "tranny", "bellend", "motherf",
];
// Word terms — matched only as a whole token (avoids "class" → "ass" false positives).
const WORD = [
  "shit", "bitch", "dick", "cock", "piss", "wank", "twat", "arse", "ass", "asshole", "prick",
  "slut", "slag", "bugger", "paki", "dyke", "fag", "knob", "minge",
];

const LEET: Record<string, string> = { "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "8": "b", "@": "a", "$": "s", "!": "i", "|": "i" };
const deleet = (s: string) => s.toLowerCase().replace(/[013457@$!|]/g, (c) => LEET[c] ?? c);

function isProfane(name: string): boolean {
  const compact = deleet(name).replace(/[^a-z]/g, "");
  if (STRONG.some((t) => compact.includes(t))) return true;
  const tokens = deleet(name).split(/[^a-z]+/).filter(Boolean);
  return tokens.some((tok) => WORD.includes(tok));
}

const URL_RE = /(https?:\/\/|www\.|\.[a-z]{2,}(\/|$))/i;

/** True if a name should NOT be shown raw on a sponsor-branded screen. */
export function isUnsafeDisplayName(name: string | null | undefined): boolean {
  const n = (name ?? "").trim();
  if (!n) return true;
  if (/^[\W_]+$/.test(n)) return true; // all symbols/punctuation
  if (URL_RE.test(n)) return true;
  return isProfane(n);
}

/** Safe name for display surfaces (TV/player scoreboard). Falls back when the stored name is unsafe. */
export function safeDisplayName(name: string | null | undefined, fallback: string): string {
  return isUnsafeDisplayName(name) ? fallback : (name as string).trim();
}

export interface NameCheck { ok: boolean; reason?: string; cleaned?: string }

/** Validate a NEW team name at creation/rename. Clear message; never silently rewrites an offensive name. */
export function validateTeamName(name: string): NameCheck {
  const n = (name ?? "").trim();
  if (!n) return { ok: false, reason: "Enter a team name." };
  if (n.length < 2) return { ok: false, reason: "Use a real team name — it will appear on the scoreboard." };
  if (n.length > 40) return { ok: false, reason: "Keep the team name under 40 characters." };
  if (/^[\W_]+$/.test(n)) return { ok: false, reason: "Use letters, not just symbols." };
  if (/(.)\1{4,}/.test(n)) return { ok: false, reason: "Use a real team name — no spammy repeats." };
  if (URL_RE.test(n)) return { ok: false, reason: "No links in team names." };
  if (isProfane(n)) return { ok: false, reason: "Choose a cleaner team name for the screen." };
  return { ok: true, cleaned: n };
}

/** Lighter check for a player's own display name. */
export function validatePlayerName(name: string): NameCheck {
  const n = (name ?? "").trim();
  if (!n) return { ok: false, reason: "Enter your name." };
  if (n.length > 40) return { ok: false, reason: "Keep your name under 40 characters." };
  if (isProfane(n)) return { ok: false, reason: "Use a cleaner name — it's shown to your team." };
  return { ok: true, cleaned: n };
}
