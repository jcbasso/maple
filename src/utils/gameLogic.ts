import { COUNTRIES, type CountryData } from '../assets/data/countries';

export type GameMode = 'tradle' | 'wordle' | 'detective' | 'mystery';
export type PlayMode = 'daily' | 'unlimited';

export interface GameStats {
  played: number;
  wins: number;
  currentStreak: number;
  maxStreak: number;
  guessHistogram: { [guesses: number]: number };
}

export interface SavedGameState {
  dateStr: string;
  targetId: string;
  guesses: string[];
  isFinished: boolean;
  isWon: boolean;
  mode: GameMode;
  playMode: PlayMode;
}

const STATS_KEY = 'tradle_game_stats_v1';

// ---------------------------------------------------------------------------
// Seeded PRNG (Mulberry32) – deterministic random from a 32-bit integer seed
// ---------------------------------------------------------------------------
function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// Fisher-Yates shuffle with a seeded PRNG
// ---------------------------------------------------------------------------
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const copy = [...arr];
  const rng = mulberry32(seed);
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// ---------------------------------------------------------------------------
// Daily country – no repeats until the full cycle completes
// ---------------------------------------------------------------------------
// We use a fixed epoch so that dayNumber is consistent forever.
// Each "cycle" contains exactly N days (N = number of countries).
// Within a cycle, we generate a deterministic permutation of all country
// indices using a seeded Fisher-Yates shuffle (seed = cycle number).
// This guarantees every country appears exactly once per cycle before any
// country can repeat.
//
// The algorithm is fully deterministic: given the same date, every player
// worldwide sees the same country.
// ---------------------------------------------------------------------------
const EPOCH = new Date('2025-01-01T00:00:00Z').getTime();
const MS_PER_DAY = 86400000;

function getDayNumber(dateStr?: string): number {
  const d = dateStr ? new Date(dateStr) : new Date();
  return Math.floor((d.getTime() - EPOCH) / MS_PER_DAY);
}

/**
 * Returns the daily country for a given date (or today).
 * Uses a cycle-based permutation so that all N countries appear exactly once
 * before any country repeats.
 */
export function getDailyCountry(dateStr?: string): CountryData {
  const N = COUNTRIES.length;
  const dayNumber = getDayNumber(dateStr);
  const cycle = Math.floor(dayNumber / N);
  const positionInCycle = ((dayNumber % N) + N) % N; // safe modulo for negative

  const permutation = seededShuffle(COUNTRIES, cycle);
  return permutation[positionInCycle];
}

/**
 * Returns the daily country for a specific game mode.
 * Each mode gets a different seed offset so they have different daily countries.
 */
export function getDailyCountryForMode(mode: GameMode, dateStr?: string): CountryData {
  const N = COUNTRIES.length;
  const dayNumber = getDayNumber(dateStr);

  // Each mode gets a unique offset to produce a different permutation
  const modeOffset: Record<GameMode, number> = {
    tradle: 0,
    wordle: 7919,     // large prime offsets to ensure different sequences
    detective: 15731,
    mystery: 23993,
  };

  const adjustedDay = dayNumber + modeOffset[mode];
  const cycle = Math.floor(adjustedDay / N);
  const positionInCycle = ((adjustedDay % N) + N) % N;

  const permutation = seededShuffle(COUNTRIES, cycle);
  return permutation[positionInCycle];
}

export function getRandomCountry(excludeId?: string): CountryData {
  const available = COUNTRIES.filter((c) => c.id !== excludeId);
  const randomIndex = Math.floor(Math.random() * available.length);
  return available[randomIndex];
}

export function getSavedStats(): GameStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to parse stats:', e);
  }
  return {
    played: 0,
    wins: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessHistogram: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
  };
}

export function saveStats(stats: GameStats): void {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save stats:', e);
  }
}

export function recordGameResult(isWon: boolean, numGuesses: number): GameStats {
  const stats = getSavedStats();
  stats.played += 1;

  if (isWon) {
    stats.wins += 1;
    stats.currentStreak += 1;
    stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
    stats.guessHistogram[numGuesses] = (stats.guessHistogram[numGuesses] || 0) + 1;
  } else {
    stats.currentStreak = 0;
  }

  saveStats(stats);
  return stats;
}

export function getTodayDateString(): string {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
