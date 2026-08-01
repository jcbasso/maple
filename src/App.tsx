import { useState, useMemo } from 'react';
import type { CountryData } from './assets/data/countries';
import { MiniMap } from './components/MiniMap';
import { GuessInput } from './components/GuessInput';
import { AttributeRow } from './components/AttributeRow';
import { VictoryModal } from './components/VictoryModal';
import { StatsModal } from './components/StatsModal';
import { HelpModal } from './components/HelpModal';
import { Header } from './components/Header';
import { compareCountries, type GuessComparison } from './utils/attributeMatcher';
import {
  getDailyCountryForMode,
  getSavedStats,
  recordGameResult,
  type GameStats,
} from './utils/gameLogic';

export default function App() {
  const [stats, setStats] = useState<GameStats>(getSavedStats);
  const [showStats, setShowStats] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [showVictory, setShowVictory] = useState<boolean>(false);

  // Daily Wordle target (fixed, determined by today's date)
  const dailyTarget = useMemo(() => getDailyCountryForMode('wordle'), []);

  const [guesses, setGuesses] = useState<GuessComparison[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [isWon, setIsWon] = useState(false);

  const handleGuess = (guessedCountry: CountryData) => {
    if (isFinished) return;

    const comparison = compareCountries(guessedCountry, dailyTarget);
    const updatedGuesses = [...guesses, comparison];
    const won = comparison.isExactMatch;
    const finished = won || updatedGuesses.length >= 6;

    setGuesses(updatedGuesses);
    setIsFinished(finished);
    setIsWon(won);

    if (finished) {
      setTimeout(() => {
        setShowVictory(true);
        const updatedStats = recordGameResult(won, updatedGuesses.length);
        setStats(updatedStats);
      }, 500);
    }
  };

  const getShareString = () => {
    const title = `Maple 🎯 ${isWon ? guesses.length : 'X'}/6\n\n`;
    const rows = guesses
      .map((g) => {
        const prox = g.geo.proximityPercent;
        if (g.isExactMatch) return '🟩🟩🟩🟩🟩🟩 🎯';
        if (prox >= 80) return '🟨🟨🟨🟨🟨🟨';
        if (prox >= 50) return '🟦🟦🟦🟦🟦🟦';
        return '⬛⬛⬛⬛⬛⬛';
      })
      .join('\n');
    return title + rows + '\n\nPlay at: https://geotradle.app';
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(getShareString());
    }
  };

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col items-center p-3 sm:p-6 select-none font-sans">
      <Header
        onOpenStats={() => setShowStats(true)}
        onOpenHelp={() => setShowHelp(true)}
      />

      <main className="w-full max-w-7xl flex flex-col gap-4 mt-2 pb-24 lg:pb-0">
        {/* Split Dashboard */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
          {/* LEFT COLUMN: Wordle Guesses — shown below map on mobile */}
          <div className="w-full lg:col-span-6 flex flex-col gap-3.5 order-2 lg:order-1">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-extrabold text-white tracking-wide">Guesses</h3>

              {/* 6 Wordle Status Badges */}
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5, 6].map((num) => {
                  const isPast = num <= guesses.length;
                  const isCurrent = num === guesses.length + 1 && !isFinished;
                  const pastGuess = guesses[num - 1];
                  const isWonGuess = pastGuess?.isExactMatch;
                  const prox = pastGuess?.geo.proximityPercent ?? 0;

                  let badgeStyle = 'bg-slate-900/60 text-slate-600 border border-slate-800/80';
                  if (isWonGuess) {
                    badgeStyle = 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30 font-black scale-110';
                  } else if (isPast) {
                    if (prox >= 80) {
                      badgeStyle = 'bg-amber-500 text-slate-950 border border-amber-400 font-extrabold';
                    } else if (prox >= 50) {
                      badgeStyle = 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 font-bold';
                    } else {
                      badgeStyle = 'bg-slate-800 text-slate-300 border border-slate-700';
                    }
                  } else if (isCurrent) {
                    badgeStyle = 'bg-cyan-500/20 text-cyan-400 border-2 border-cyan-500 animate-pulse';
                  }

                  return (
                    <div
                      key={num}
                      className={`w-7 h-7 rounded-lg text-xs font-mono flex items-center justify-center transition-all ${badgeStyle}`}
                    >
                      {num}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 6 Attempt Rows */}
            <div className="flex flex-col gap-2">
              {Array.from({ length: 6 }).map((_, idx) => {
                const attemptNum = idx + 1;
                const guess = guesses[idx];

                if (guess) {
                  return (
                    <AttributeRow
                      key={idx}
                      comparison={guess}
                      attemptNumber={attemptNum}
                    />
                  );
                }

                return (
                  <div
                    key={idx}
                    className="w-full h-[70px] sm:h-[82px] glass-panel px-3 py-2 flex flex-col justify-between border border-slate-800/50 bg-slate-900/30 rounded-2xl opacity-40 transition-all overflow-hidden"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-800/80 text-slate-500 border border-slate-700/60 text-xs font-mono flex items-center justify-center">
                          {attemptNum}
                        </span>
                        <span className="text-sm font-bold text-slate-500">
                          Attempt {attemptNum}
                        </span>
                      </div>
                      <span className="text-xs text-slate-600 font-mono">--- km · ---%</span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5">
                      <div className="py-[5px] rounded-lg bg-slate-900/60 border border-slate-700/60 flex items-center justify-center gap-1">
                        <span className="text-[9px] font-bold text-slate-600 uppercase">Cont.</span>
                        <span className="text-[11px] font-bold text-slate-600">---</span>
                      </div>
                      <div className="py-[5px] rounded-lg bg-slate-900/60 border border-slate-700/60 flex items-center justify-center gap-1">
                        <span className="text-[9px] font-bold text-slate-600 uppercase">Pop.</span>
                        <span className="text-[11px] font-bold text-slate-600">---</span>
                      </div>
                      <div className="py-[5px] rounded-lg bg-slate-900/60 border border-slate-700/60 flex items-center justify-center gap-1">
                        <span className="text-[9px] font-bold text-slate-600 uppercase">Lang.</span>
                        <span className="text-[11px] font-bold text-slate-600">---</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT COLUMN: Vector World Map — shown first on mobile */}
          <div className="w-full lg:col-span-6 flex flex-col gap-4 order-1 lg:order-2">
            <MiniMap
              guesses={guesses.map((g) => ({
                country: g.country,
                geo: g.geo,
              }))}
              targetCountry={dailyTarget}
              isFinished={isFinished}
            />
          </div>
        </div>

        {/* BOTTOM: Country Search — sticky on mobile, static on desktop */}
        <div className="fixed lg:static bottom-0 left-0 right-0 z-20 lg:z-auto bg-[#070a12]/95 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none border-t border-slate-800/60 lg:border-0 px-4 lg:px-0 py-3 lg:py-0 lg:mt-2">
          <div className="w-full max-w-3xl mx-auto">
            <GuessInput
              onGuess={handleGuess}
              disabledCountries={guesses.map((g) => g.country.id)}
              disabled={isFinished}
            />
          </div>
        </div>
      </main>

      <footer className="w-full text-center text-xs text-slate-600 pt-6 mt-4 pb-2 hidden lg:block">
        Built with React &amp; TypeScript · Geo data by Natural Earth ·{' '}
        Created by{' '}
        <a
          href="https://github.com/jcbasso"
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-500 hover:text-cyan-300 transition-colors font-medium"
        >
          @jcbasso
        </a>
      </footer>

      {showStats && (
        <StatsModal
          stats={stats}
          shareText={getShareString()}
          onClose={() => setShowStats(false)}
        />
      )}

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}

      {showVictory && (
        <VictoryModal
          isWon={isWon}
          targetCountry={dailyTarget}
          guessCount={guesses.length}
          onShare={handleShare}
          onClose={() => setShowVictory(false)}
        />
      )}
    </div>
  );
}
