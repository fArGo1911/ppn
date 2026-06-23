/**
 * Seeded source-side POC question pool for the content-mix PREVIEW builder. NOT a CMS, NOT Supabase-backed, and
 * NOT the live game's questions — this pool only powers the proposed-quiz preview in the internal setup wizard.
 * Operator/PPN can override the final selection before an event; nothing here writes to the question DB.
 *
 * Categories match the operator-facing content-mix categories (Music / Picture / Video are separate). Sponsor
 * prompts use a {sponsor} placeholder substituted via the client-facing identity (never hard-coding a brewery).
 * Picture/Video prompts are placeholder-safe ("Look at the image…" / "Watch the clip…") — no real assets needed.
 */
import type { ContentCategoryId } from "../lib/contentMix";

export type PoolCategory = ContentCategoryId | "tiebreak";
export interface PoolQuestion {
  id: string;
  category: PoolCategory;
  prompt: string;
  answer: string;
  difficulty?: "easy" | "medium" | "hard";
}

export const QUESTION_POOL: PoolQuestion[] = [
  // ── General knowledge → text ──
  { id: "gen-01", category: "general", prompt: "How many continents are there?", answer: "Seven", difficulty: "easy" },
  { id: "gen-02", category: "general", prompt: "What is H₂O more commonly known as?", answer: "Water", difficulty: "easy" },
  { id: "gen-03", category: "general", prompt: "How many days are in a leap year?", answer: "366", difficulty: "easy" },
  { id: "gen-04", category: "general", prompt: "What is the chemical symbol for gold?", answer: "Au", difficulty: "medium" },
  { id: "gen-05", category: "general", prompt: "How many sides does a hexagon have?", answer: "Six", difficulty: "easy" },
  { id: "gen-06", category: "general", prompt: "Who wrote “Romeo and Juliet”?", answer: "William Shakespeare", difficulty: "easy" },
  { id: "gen-07", category: "general", prompt: "What gas do plants absorb from the air?", answer: "Carbon dioxide", difficulty: "medium" },
  { id: "gen-08", category: "general", prompt: "How many colours are in a rainbow?", answer: "Seven", difficulty: "easy" },
  { id: "gen-09", category: "general", prompt: "What is the freezing point of water in Celsius?", answer: "0°C", difficulty: "easy" },
  { id: "gen-10", category: "general", prompt: "What is the smallest prime number?", answer: "2", difficulty: "medium" },
  { id: "gen-11", category: "general", prompt: "What do bees collect from flowers?", answer: "Nectar", difficulty: "easy" },
  { id: "gen-12", category: "general", prompt: "How many minutes are in a full day?", answer: "1,440", difficulty: "medium" },

  // ── Sport / football → sport / football ──
  { id: "spt-01", category: "sport", prompt: "Which sport is played with a shuttlecock?", answer: "Badminton", difficulty: "easy" },
  { id: "spt-02", category: "sport", prompt: "How many players from one team are on a football (soccer) pitch?", answer: "Eleven", difficulty: "easy" },
  { id: "spt-03", category: "sport", prompt: "In tennis, what term means a score of zero?", answer: "Love", difficulty: "easy" },
  { id: "spt-04", category: "sport", prompt: "How many points is a touchdown worth in American football?", answer: "Six", difficulty: "medium" },
  { id: "spt-05", category: "sport", prompt: "In which sport would you perform a slam dunk?", answer: "Basketball", difficulty: "easy" },
  { id: "spt-06", category: "sport", prompt: "How many holes are played in a full round of golf?", answer: "Eighteen", difficulty: "easy" },
  { id: "spt-07", category: "sport", prompt: "Which country has won the most FIFA World Cups?", answer: "Brazil", difficulty: "medium" },
  { id: "spt-08", category: "sport", prompt: "What colour card sends a footballer off?", answer: "Red", difficulty: "easy" },
  { id: "spt-09", category: "sport", prompt: "In cricket, how many runs is a boundary hit along the ground?", answer: "Four", difficulty: "medium" },
  { id: "spt-10", category: "sport", prompt: "The Ashes is a famous rivalry in which sport?", answer: "Cricket", difficulty: "medium" },
  { id: "spt-11", category: "sport", prompt: "In football, what is it called when one player scores three goals?", answer: "A hat-trick", difficulty: "easy" },
  { id: "spt-12", category: "sport", prompt: "Roughly how many miles is a marathon?", answer: "26.2 miles", difficulty: "medium" },

  // ── Music → music ──
  { id: "mus-01", category: "music", prompt: "Which instrument has 88 keys?", answer: "The piano", difficulty: "easy" },
  { id: "mus-02", category: "music", prompt: "How many strings does a standard guitar have?", answer: "Six", difficulty: "easy" },
  { id: "mus-03", category: "music", prompt: "“Bohemian Rhapsody” was recorded by which band?", answer: "Queen", difficulty: "easy" },
  { id: "mus-04", category: "music", prompt: "What does “forte” mean in music?", answer: "Loud", difficulty: "medium" },
  { id: "mus-05", category: "music", prompt: "Which decade is most associated with disco?", answer: "The 1970s", difficulty: "medium" },
  { id: "mus-06", category: "music", prompt: "Who is widely known as the King of Pop?", answer: "Michael Jackson", difficulty: "easy" },
  { id: "mus-07", category: "music", prompt: "Which Caribbean island is the home of reggae?", answer: "Jamaica", difficulty: "medium" },
  { id: "mus-08", category: "music", prompt: "What is a group of three or more notes played together called?", answer: "A chord", difficulty: "medium" },
  { id: "mus-09", category: "music", prompt: "Which brass instrument is the largest?", answer: "The tuba", difficulty: "medium" },
  { id: "mus-10", category: "music", prompt: "How many lines make up a musical staff?", answer: "Five", difficulty: "medium" },
  { id: "mus-11", category: "music", prompt: "What does “DJ” stand for?", answer: "Disc jockey", difficulty: "easy" },
  { id: "mus-12", category: "music", prompt: "Which is larger: a violin or a cello?", answer: "A cello", difficulty: "easy" },

  // ── Local / venue → local (generic pub/community; region-neutral) ──
  { id: "loc-01", category: "local", prompt: "Which pub game is played with a board and small arrows?", answer: "Darts", difficulty: "easy" },
  { id: "loc-02", category: "local", prompt: "What do you call the person who runs a pub?", answer: "The landlord / landlady", difficulty: "easy" },
  { id: "loc-03", category: "local", prompt: "Which pub game uses cues and a triangle of balls?", answer: "Pool", difficulty: "easy" },
  { id: "loc-04", category: "local", prompt: "In a pub, what is a “round”?", answer: "Buying drinks for the whole group", difficulty: "easy" },
  { id: "loc-05", category: "local", prompt: "The outdoor area of a pub for drinking is the beer ___?", answer: "Garden", difficulty: "easy" },
  { id: "loc-06", category: "local", prompt: "What weekly pub event is this whole feature about?", answer: "Quiz night", difficulty: "easy" },
  { id: "loc-07", category: "local", prompt: "A pub with rooms to stay in is traditionally called an ___?", answer: "Inn", difficulty: "medium" },
  { id: "loc-08", category: "local", prompt: "What does the “last orders” bell signal?", answer: "The bar is about to close", difficulty: "easy" },
  { id: "loc-09", category: "local", prompt: "A crunchy traditional pork pub snack is pork ___?", answer: "Scratchings", difficulty: "medium" },
  { id: "loc-10", category: "local", prompt: "“Your local” usually means what?", answer: "Your nearest / regular pub", difficulty: "easy" },
  { id: "loc-11", category: "local", prompt: "A quiz team usually picks a funny team ___?", answer: "Name", difficulty: "easy" },
  { id: "loc-12", category: "local", prompt: "What do you call the long counter where drinks are served?", answer: "The bar", difficulty: "easy" },

  // ── Geography / culture → geography ──
  { id: "geo-01", category: "geography", prompt: "What is the capital of France?", answer: "Paris", difficulty: "easy" },
  { id: "geo-02", category: "geography", prompt: "On which continent is the Sahara Desert?", answer: "Africa", difficulty: "easy" },
  { id: "geo-03", category: "geography", prompt: "What is the capital of Japan?", answer: "Tokyo", difficulty: "easy" },
  { id: "geo-04", category: "geography", prompt: "Which is the largest ocean?", answer: "The Pacific", difficulty: "medium" },
  { id: "geo-05", category: "geography", prompt: "What is the currency of the United States?", answer: "The dollar", difficulty: "easy" },
  { id: "geo-06", category: "geography", prompt: "Which country is shaped like a boot?", answer: "Italy", difficulty: "easy" },
  { id: "geo-07", category: "geography", prompt: "What is the capital of Australia?", answer: "Canberra", difficulty: "hard" },
  { id: "geo-08", category: "geography", prompt: "The Great Barrier Reef lies off which country's coast?", answer: "Australia", difficulty: "medium" },
  { id: "geo-09", category: "geography", prompt: "Which European city is famous for canals and gondolas?", answer: "Venice", difficulty: "easy" },
  { id: "geo-10", category: "geography", prompt: "What is the largest country in the world by area?", answer: "Russia", difficulty: "medium" },
  { id: "geo-11", category: "geography", prompt: "Mount Everest sits on the border of Nepal and which country?", answer: "China", difficulty: "medium" },
  { id: "geo-12", category: "geography", prompt: "Which river runs through Egypt?", answer: "The Nile", difficulty: "easy" },

  // ── Picture round → picture (placeholder-safe: "Look at the image…") ──
  { id: "pic-01", category: "picture", prompt: "Look at the image: name the tall iron tower in Paris.", answer: "The Eiffel Tower", difficulty: "easy" },
  { id: "pic-02", category: "picture", prompt: "Look at the logo: a bitten apple represents which tech company?", answer: "Apple", difficulty: "easy" },
  { id: "pic-03", category: "picture", prompt: "Look at the flag: a red circle on white is which country?", answer: "Japan", difficulty: "easy" },
  { id: "pic-04", category: "picture", prompt: "Look at the image: a yellow cartoon sponge who lives in a pineapple?", answer: "SpongeBob SquarePants", difficulty: "easy" },
  { id: "pic-05", category: "picture", prompt: "Look at the logo: the golden arches belong to which chain?", answer: "McDonald's", difficulty: "easy" },
  { id: "pic-06", category: "picture", prompt: "Look at the image: which planet has the famous rings?", answer: "Saturn", difficulty: "medium" },
  { id: "pic-07", category: "picture", prompt: "Look at the image: a clock tower beside the Houses of Parliament in London?", answer: "Big Ben", difficulty: "easy" },
  { id: "pic-08", category: "picture", prompt: "Look at the image: the largest land animal, with a trunk?", answer: "The elephant", difficulty: "easy" },
  { id: "pic-09", category: "picture", prompt: "Look at the album cover: four people on a zebra crossing?", answer: "Abbey Road (The Beatles)", difficulty: "medium" },
  { id: "pic-10", category: "picture", prompt: "Look at the image: a red double-decker bus is iconic in which city?", answer: "London", difficulty: "easy" },
  { id: "pic-11", category: "picture", prompt: "Look at the map outline: the boot-shaped country?", answer: "Italy", difficulty: "easy" },
  { id: "pic-12", category: "picture", prompt: "Look at the image: a black-and-white bear that eats bamboo?", answer: "The giant panda", difficulty: "easy" },

  // ── Video round → video (placeholder-safe: "Watch the clip…") ──
  { id: "vid-01", category: "video", prompt: "Watch the clip: which racquet sport is being played over a high net with a shuttlecock?", answer: "Badminton", difficulty: "easy" },
  { id: "vid-02", category: "video", prompt: "Watch the clip: a famous shark thriller directed by Steven Spielberg — name the film.", answer: "Jaws", difficulty: "medium" },
  { id: "vid-03", category: "video", prompt: "Watch the clip: a dance move where the performer glides backwards — name it.", answer: "The moonwalk", difficulty: "medium" },
  { id: "vid-04", category: "video", prompt: "Watch the clip: which planet's rings are shown?", answer: "Saturn", difficulty: "medium" },
  { id: "vid-05", category: "video", prompt: "Watch the clip: identify the animal from its long howl.", answer: "A wolf", difficulty: "easy" },
  { id: "vid-06", category: "video", prompt: "Watch the clip: boats travel through the canals of which city?", answer: "Venice", difficulty: "easy" },
  { id: "vid-07", category: "video", prompt: "Watch the clip: which ball game shows a slam dunk?", answer: "Basketball", difficulty: "easy" },
  { id: "vid-08", category: "video", prompt: "Watch the clip: a bubbling brewing process — what is this stage called?", answer: "Fermentation", difficulty: "hard" },
  { id: "vid-09", category: "video", prompt: "Watch the clip: name the large clock tower shown in London.", answer: "Big Ben", difficulty: "easy" },
  { id: "vid-10", category: "video", prompt: "Watch the clip: which keyboard instrument with 88 keys is being played?", answer: "The piano", difficulty: "easy" },
  { id: "vid-11", category: "video", prompt: "Watch the clip: a footballer raises three fingers — what has just happened?", answer: "A hat-trick", difficulty: "medium" },
  { id: "vid-12", category: "video", prompt: "Watch the clip: a rocket lifts off — what is the word at the end of the countdown?", answer: "Liftoff", difficulty: "easy" },

  // ── Sponsor / brand → sponsored (generic, sponsor-safe, {sponsor} substituted at preview time) ──
  { id: "spo-01", category: "sponsor", prompt: "Tonight's sponsored round is brought to you by {sponsor}. Which ingredient gives most beers their bitterness?", answer: "Hops", difficulty: "medium" },
  { id: "spo-02", category: "sponsor", prompt: "{sponsor} sponsors tonight's quiz. Which grain is most commonly used in brewing?", answer: "Barley", difficulty: "medium" },
  { id: "spo-03", category: "sponsor", prompt: "Sponsor round, courtesy of {sponsor}: what is the name for a place that brews beer?", answer: "A brewery", difficulty: "easy" },
  { id: "spo-04", category: "sponsor", prompt: "{sponsor} asks: which natural process turns sugars into alcohol?", answer: "Fermentation", difficulty: "medium" },
  { id: "spo-05", category: "sponsor", prompt: "Brought to you by {sponsor}: what does “IPA” stand for?", answer: "India Pale Ale", difficulty: "medium" },
  { id: "spo-06", category: "sponsor", prompt: "{sponsor} round: a drink with no alcohol is usually labelled “alcohol-free” or what percentage?", answer: "0%", difficulty: "easy" },
  { id: "spo-07", category: "sponsor", prompt: "Sponsor trivia from {sponsor}: what colour is a classic stout?", answer: "Dark / black", difficulty: "easy" },
  { id: "spo-08", category: "sponsor", prompt: "{sponsor} asks: what is the frothy top of a freshly poured beer called?", answer: "The head", difficulty: "easy" },
  { id: "spo-09", category: "sponsor", prompt: "Sponsored by {sponsor}: a small taster glass of a drink is called a ___?", answer: "Sample / taster", difficulty: "medium" },
  { id: "spo-10", category: "sponsor", prompt: "{sponsor} round: cider is traditionally made from which fruit?", answer: "Apples", difficulty: "easy" },
  { id: "spo-11", category: "sponsor", prompt: "Brought to you by {sponsor}: what is a common friendly toast word before drinking?", answer: "Cheers", difficulty: "easy" },
  { id: "spo-12", category: "sponsor", prompt: "{sponsor} question: a venue that both brews and serves its own beer is often called a ___?", answer: "Brewpub / taproom", difficulty: "hard" },

  // ── Tiebreak / bonus (OUTSIDE the main mix; closest-guess style) ──
  { id: "tie-01", category: "tiebreak", prompt: "Tiebreak (closest wins): how many pints are in a UK gallon?", answer: "8", difficulty: "medium" },
  { id: "tie-02", category: "tiebreak", prompt: "Tiebreak (closest wins): what is the boiling point of water in Celsius?", answer: "100", difficulty: "easy" },
  { id: "tie-03", category: "tiebreak", prompt: "Tiebreak (closest wins): in which year were the first modern Olympic Games held?", answer: "1896", difficulty: "hard" },
  { id: "tie-04", category: "tiebreak", prompt: "Tiebreak (closest wins): how many squares are on a chessboard?", answer: "64", difficulty: "medium" },
];

export const poolCount = (category: PoolCategory): number => QUESTION_POOL.filter((q) => q.category === category).length;
