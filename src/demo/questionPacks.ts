/**
 * 10-question capability packs per market (Sweden / Germany / UK) — seeded/demo content, NOT a question CMS.
 * Each market proves range: general · sport · football · geography · local/regional · music · picture · video ·
 * sponsored/brewery · tie-breaker. Every question carries setup compatibility, recommended TV/phone states,
 * sponsor involvement, an optional media slot, AI readout/reveal scripts and a short explanation.
 *
 * LIVE-RUN subset (item 4): the 5 questions flagged liveRun:true are run live in the guided demo
 * (general · local · music · picture · sponsored). The rest appear as capability cards (/capabilities).
 */
import type { Market } from "./markets";

export interface SetupCompat {
  phonesOnly: boolean; // works with phones alone
  tv: boolean;
  audio: boolean;
  tvAudio: boolean;
  localHost: boolean; // works in staff mic/speaker + phones-only mode
  aiAssisted: boolean;
}

export interface DemoQuestion {
  n: number;
  category: string;
  kind: "text" | "sport" | "football" | "geography" | "local" | "music" | "picture" | "video" | "sponsored" | "tiebreak";
  prompt: string;
  options: string[];
  correct: string;
  compat: SetupCompat;
  tvState: string; // recommended TV state
  phoneState: string; // recommended phone state
  sponsor: boolean;
  mediaSlot?: string; // brand.video.* slot or image slot when relevant
  aiReadout: string;
  aiReveal: string;
  explanation?: string;
  liveRun: boolean;
}

// Compatibility shorthands.
const ALL: SetupCompat = { phonesOnly: true, tv: true, audio: true, tvAudio: true, localHost: true, aiAssisted: true };
const SCREEN: SetupCompat = { phonesOnly: false, tv: true, audio: false, tvAudio: true, localHost: false, aiAssisted: true }; // needs TV (or phone image fallback)
const LISTEN: SetupCompat = { phonesOnly: false, tv: false, audio: true, tvAudio: true, localHost: false, aiAssisted: true }; // needs audio

export const QUESTION_PACKS: Record<Market, DemoQuestion[]> = {
  UK: [
    { n: 1, category: "General knowledge", kind: "text", prompt: "Which planet is known as the Red Planet?", options: ["Mars", "Venus", "Jupiter", "Mercury"], correct: "Mars", compat: ALL, tvState: "question", phoneState: "question", sponsor: false, aiReadout: "Question one, general knowledge: which planet is known as the Red Planet?", aiReveal: "The Red Planet is Mars.", explanation: "Mars looks red from iron oxide (rust) on its surface.", liveRun: true },
    { n: 2, category: "Sport", kind: "sport", prompt: "How many players are on a standard cricket team?", options: ["9", "11", "13", "15"], correct: "11", compat: ALL, tvState: "question", phoneState: "question", sponsor: false, aiReadout: "Sport round: how many players are on a standard cricket team?", aiReveal: "It's eleven.", liveRun: false },
    { n: 3, category: "Football-specific", kind: "football", prompt: "Which country won the 2018 FIFA World Cup?", options: ["France", "Croatia", "Brazil", "Germany"], correct: "France", compat: ALL, tvState: "question", phoneState: "question", sponsor: false, aiReadout: "Football: which country won the 2018 FIFA World Cup?", aiReveal: "France lifted the 2018 World Cup.", liveRun: false },
    { n: 4, category: "Geography", kind: "geography", prompt: "What is the capital city of Scotland?", options: ["Glasgow", "Edinburgh", "Aberdeen", "Dundee"], correct: "Edinburgh", compat: ALL, tvState: "question", phoneState: "question", sponsor: false, aiReadout: "Geography: what is the capital city of Scotland?", aiReveal: "The capital of Scotland is Edinburgh.", liveRun: false },
    { n: 5, category: "Local / regional", kind: "local", prompt: "Manchester City play at the Etihad Stadium — at which ground do Manchester United play?", options: ["Old Trafford", "Anfield", "Maine Road", "Hillsborough"], correct: "Old Trafford", compat: ALL, tvState: "question", phoneState: "question", sponsor: false, aiReadout: "Local Manchester round: City play at the Etihad — where do United play?", aiReveal: "Manchester United play at Old Trafford.", explanation: "Old Trafford has been United's home since 1910.", liveRun: true },
    { n: 6, category: "Music / audio", kind: "music", prompt: "Listen to the clip — which Manchester band released 'Wonderwall'?", options: ["Oasis", "The Stone Roses", "Joy Division", "The Smiths"], correct: "Oasis", compat: LISTEN, tvState: "audio", phoneState: "question", sponsor: false, mediaSlot: "audio clip (host/PA triggered)", aiReadout: "Music round — have a listen. Which Manchester band released 'Wonderwall'?", aiReveal: "That's Oasis.", liveRun: true },
    { n: 7, category: "Picture / visual", kind: "picture", prompt: "Look at the skyline on screen — which UK city is shown?", options: ["Manchester", "Liverpool", "Leeds", "Sheffield"], correct: "Manchester", compat: SCREEN, tvState: "media", phoneState: "sponsored", sponsor: false, mediaSlot: "images.heroUrl / phone image fallback", aiReadout: "Picture round — look at the screen. Which UK city's skyline is this?", aiReveal: "That skyline is Manchester.", liveRun: true },
    { n: 8, category: "Video / rich-media", kind: "video", prompt: "Watch the clip — which sport is being played?", options: ["Rugby league", "Football", "Cricket", "Netball"], correct: "Rugby league", compat: SCREEN, tvState: "media", phoneState: "sponsored", sponsor: false, mediaSlot: "video.videoQuestionUrl", aiReadout: "Video round — watch the big screen. Which sport is being played?", aiReveal: "It's rugby league.", liveRun: false },
    { n: 9, category: "Sponsored / brewery", kind: "sponsored", prompt: "Tonight's sponsor, Northgate Brewing Co., was founded in which city?", options: ["Manchester", "London", "Leeds", "Bristol"], correct: "Manchester", compat: ALL, tvState: "question", phoneState: "sponsored", sponsor: true, mediaSlot: "images.sponsorSlideUrl / phoneCardUrl", aiReadout: "Sponsored round, brought to you by Northgate Brewing Co. — in which city was the brewery founded?", aiReveal: "Northgate Brewing Co. was founded in Manchester.", liveRun: true },
    { n: 10, category: "Tie-breaker / bonus", kind: "tiebreak", prompt: "Tie-breaker — closest wins: in which year were the first modern Olympic Games held?", options: ["1888", "1896", "1900", "1924"], correct: "1896", compat: ALL, tvState: "question", phoneState: "question", sponsor: false, aiReadout: "Tie-breaker, closest answer wins: in which year were the first modern Olympic Games held?", aiReveal: "The first modern Olympics were held in 1896, in Athens.", liveRun: false },
  ],
  DE: [
    { n: 1, category: "Allgemeinwissen", kind: "text", prompt: "Wie viele Bundesländer hat Deutschland?", options: ["14", "15", "16", "17"], correct: "16", compat: ALL, tvState: "question", phoneState: "question", sponsor: false, aiReadout: "Frage eins, Allgemeinwissen: Wie viele Bundesländer hat Deutschland?", aiReveal: "Deutschland hat 16 Bundesländer.", liveRun: true },
    { n: 2, category: "Sport", kind: "sport", prompt: "In welcher Sportart ist der FC Bayern neben Fußball traditionell erfolgreich?", options: ["Handball", "Basketball", "Eishockey", "Volleyball"], correct: "Basketball", compat: ALL, tvState: "question", phoneState: "question", sponsor: false, aiReadout: "Sport-Runde: In welcher Sportart ist der FC Bayern neben Fußball traditionell stark?", aiReveal: "Basketball — der FC Bayern Basketball.", liveRun: false },
    { n: 3, category: "Bundesliga / Fußball", kind: "football", prompt: "Welcher Verein gewann 2020 das Triple (Meisterschaft, Pokal, Champions League)?", options: ["Borussia Dortmund", "FC Bayern München", "RB Leipzig", "Bayer Leverkusen"], correct: "FC Bayern München", compat: ALL, tvState: "question", phoneState: "question", sponsor: false, aiReadout: "Bundesliga: Welcher Verein gewann 2020 das Triple?", aiReveal: "Der FC Bayern München.", liveRun: false },
    { n: 4, category: "Geographie", kind: "geography", prompt: "Was ist die Hauptstadt des Bundeslandes Bayern?", options: ["Nürnberg", "Augsburg", "München", "Regensburg"], correct: "München", compat: ALL, tvState: "question", phoneState: "question", sponsor: false, aiReadout: "Geographie: Was ist die Hauptstadt Bayerns?", aiReveal: "Die Hauptstadt Bayerns ist München.", liveRun: false },
    { n: 5, category: "Lokal / regional", kind: "local", prompt: "Auf welcher Münchner Wiese findet das Oktoberfest statt?", options: ["Theresienwiese", "Königsplatz", "Marienplatz", "Olympiapark"], correct: "Theresienwiese", compat: ALL, tvState: "question", phoneState: "question", sponsor: false, aiReadout: "Münchner Lokalrunde: Auf welcher Wiese findet das Oktoberfest statt?", aiReveal: "Auf der Theresienwiese.", explanation: "Die 'Wiesn' ist nach Therese von Sachsen-Hildburghausen benannt.", liveRun: true },
    { n: 6, category: "Musik / Audio", kind: "music", prompt: "Hört den Clip — welche Band aus Düsseldorf gilt als Elektro-Pionier?", options: ["Kraftwerk", "Scorpions", "Rammstein", "Can"], correct: "Kraftwerk", compat: LISTEN, tvState: "audio", phoneState: "question", sponsor: false, mediaSlot: "audio clip (Host/PA)", aiReadout: "Musikrunde — hört genau hin. Welche Band aus Düsseldorf gilt als Elektro-Pionier?", aiReveal: "Das ist Kraftwerk.", liveRun: true },
    { n: 7, category: "Bild / visuell", kind: "picture", prompt: "Seht auf den Bildschirm — welches bayerische Schloss ist das?", options: ["Neuschwanstein", "Linderhof", "Herrenchiemsee", "Nymphenburg"], correct: "Neuschwanstein", compat: SCREEN, tvState: "media", phoneState: "sponsored", sponsor: false, mediaSlot: "images.heroUrl / Phone-Bild-Fallback", aiReadout: "Bilderrunde — schaut auf den Bildschirm. Welches bayerische Schloss seht ihr?", aiReveal: "Das ist Schloss Neuschwanstein.", liveRun: true },
    { n: 8, category: "Video / Rich-Media", kind: "video", prompt: "Schaut den Clip — welches Fest wird gezeigt?", options: ["Oktoberfest", "Karneval", "Weihnachtsmarkt", "Tollwood"], correct: "Oktoberfest", compat: SCREEN, tvState: "media", phoneState: "sponsored", sponsor: false, mediaSlot: "video.videoQuestionUrl", aiReadout: "Video-Runde — schaut auf die große Leinwand. Welches Fest wird gezeigt?", aiReveal: "Das ist das Oktoberfest.", liveRun: false },
    { n: 9, category: "Sponsored / Brauerei", kind: "sponsored", prompt: "Adlerbräu München braut nach dem Reinheitsgebot von welchem Jahr?", options: ["1156", "1516", "1616", "1716"], correct: "1516", compat: ALL, tvState: "question", phoneState: "sponsored", sponsor: true, mediaSlot: "images.sponsorSlideUrl / phoneCardUrl", aiReadout: "Sponsorenrunde, präsentiert von Adlerbräu München — nach dem Reinheitsgebot von welchem Jahr wird gebraut?", aiReveal: "Nach dem Reinheitsgebot von 1516.", liveRun: true },
    { n: 10, category: "Stechfrage / Bonus", kind: "tiebreak", prompt: "Stechfrage — am nächsten gewinnt: In welchem Jahr fand das erste Oktoberfest statt?", options: ["1810", "1850", "1871", "1900"], correct: "1810", compat: ALL, tvState: "question", phoneState: "question", sponsor: false, aiReadout: "Stechfrage, die nächste Antwort gewinnt: In welchem Jahr fand das erste Oktoberfest statt?", aiReveal: "Das erste Oktoberfest war 1810.", liveRun: false },
  ],
  SE: [
    { n: 1, category: "Allmänbildning", kind: "text", prompt: "Ungefär hur många kommuner har Sverige?", options: ["210", "250", "290", "330"], correct: "290", compat: ALL, tvState: "question", phoneState: "question", sponsor: false, aiReadout: "Fråga ett, allmänbildning: Ungefär hur många kommuner har Sverige?", aiReveal: "Sverige har 290 kommuner.", liveRun: true },
    { n: 2, category: "Sport", kind: "sport", prompt: "I vilken sport tävlar man i Vasaloppet?", options: ["Längdskidåkning", "Skridsko", "Orientering", "Cykel"], correct: "Längdskidåkning", compat: ALL, tvState: "question", phoneState: "question", sponsor: false, aiReadout: "Sportrunda: I vilken sport tävlar man i Vasaloppet?", aiReveal: "Längdskidåkning.", liveRun: false },
    { n: 3, category: "Fotboll", kind: "football", prompt: "Vilken svensk spelare har spelat för Milan, Barcelona och PSG?", options: ["Zlatan Ibrahimović", "Henrik Larsson", "Freddie Ljungberg", "Emil Forsberg"], correct: "Zlatan Ibrahimović", compat: ALL, tvState: "question", phoneState: "question", sponsor: false, aiReadout: "Fotboll: Vilken svensk spelare har spelat för Milan, Barcelona och PSG?", aiReveal: "Zlatan Ibrahimović.", liveRun: false },
    { n: 4, category: "Geografi", kind: "geography", prompt: "Vad heter Sveriges huvudstad?", options: ["Göteborg", "Malmö", "Stockholm", "Uppsala"], correct: "Stockholm", compat: ALL, tvState: "question", phoneState: "question", sponsor: false, aiReadout: "Geografi: Vad heter Sveriges huvudstad?", aiReveal: "Stockholm.", liveRun: false },
    { n: 5, category: "Lokal / regional", kind: "local", prompt: "Vilken är Stockholms äldsta stadsdel, känd för Stortorget?", options: ["Gamla stan", "Södermalm", "Östermalm", "Kungsholmen"], correct: "Gamla stan", compat: ALL, tvState: "question", phoneState: "question", sponsor: false, aiReadout: "Lokal Stockholmsrunda: Vilken är stadens äldsta stadsdel, känd för Stortorget?", aiReveal: "Gamla stan.", explanation: "Gamla stan grundades på 1200-talet.", liveRun: true },
    { n: 6, category: "Musik / Audio", kind: "music", prompt: "Lyssna på klippet — vilken svensk grupp vann Eurovision 1974 med 'Waterloo'?", options: ["ABBA", "Roxette", "Ace of Base", "Europe"], correct: "ABBA", compat: LISTEN, tvState: "audio", phoneState: "question", sponsor: false, mediaSlot: "ljudklipp (värd/PA)", aiReadout: "Musikrunda — lyssna noga. Vilken svensk grupp vann Eurovision 1974 med 'Waterloo'?", aiReveal: "Det är ABBA.", liveRun: true },
    { n: 7, category: "Bild / visuell", kind: "picture", prompt: "Titta på skärmen — vilken Stockholmsbyggnad visas?", options: ["Stadshuset", "Globen", "Slottet", "Operan"], correct: "Stadshuset", compat: SCREEN, tvState: "media", phoneState: "sponsored", sponsor: false, mediaSlot: "images.heroUrl / mobil bild-fallback", aiReadout: "Bildrunda — titta på skärmen. Vilken Stockholmsbyggnad visas?", aiReveal: "Det är Stockholms stadshus.", liveRun: true },
    { n: 8, category: "Video / rich-media", kind: "video", prompt: "Titta på klippet — vilket svenskt firande visas?", options: ["Midsommar", "Valborg", "Lucia", "Kräftskiva"], correct: "Midsommar", compat: SCREEN, tvState: "media", phoneState: "sponsored", sponsor: false, mediaSlot: "video.videoQuestionUrl", aiReadout: "Videorunda — titta på storbildsskärmen. Vilket svenskt firande visas?", aiReveal: "Det är midsommar.", liveRun: false },
    { n: 9, category: "Sponsrad / bryggeri", kind: "sponsored", prompt: "Kvällens sponsor, Nordström Bryggeri, bryggs i vilken stad?", options: ["Stockholm", "Göteborg", "Malmö", "Uppsala"], correct: "Stockholm", compat: ALL, tvState: "question", phoneState: "sponsored", sponsor: true, mediaSlot: "images.sponsorSlideUrl / phoneCardUrl", aiReadout: "Sponsrad runda, presenteras av Nordström Bryggeri — i vilken stad bryggs ölet?", aiReveal: "Nordström Bryggeri bryggs i Stockholm.", liveRun: true },
    { n: 10, category: "Utslagsfråga / bonus", kind: "tiebreak", prompt: "Utslagsfråga — närmast vinner: Vilket år hölls den första Eurovision Song Contest?", options: ["1951", "1956", "1960", "1965"], correct: "1956", compat: ALL, tvState: "question", phoneState: "question", sponsor: false, aiReadout: "Utslagsfråga, närmaste svar vinner: Vilket år hölls den första Eurovision Song Contest?", aiReveal: "Den första hölls 1956.", liveRun: false },
  ],
};

export function livePack(m: Market): DemoQuestion[] {
  return QUESTION_PACKS[m].filter((q) => q.liveRun);
}
export function capabilityPack(m: Market): DemoQuestion[] {
  return QUESTION_PACKS[m].filter((q) => !q.liveRun);
}
