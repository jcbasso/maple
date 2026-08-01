import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import type { CountryData } from '../assets/data/countries';
import { Trophy, RefreshCw, BarChart2, X, XCircle } from 'lucide-react';

interface VictoryModalProps {
  isWon: boolean;
  targetCountry: CountryData;
  guessCount: number;
  onPlayAgain?: () => void;
  onShare: () => void;
  onClose: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isWon,
  targetCountry,
  guessCount,
  onPlayAgain,
  onShare,
  onClose,
}) => {
  useEffect(() => {
    if (isWon) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [isWon]);

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-panel p-6 flex flex-col items-center text-center gap-5 border border-slate-700 animate-flip relative">
        {/* Top Right Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          title="Close window to view game board"
        >
          <X className="w-5 h-5" />
        </button>

        <div
          className={`p-4 rounded-2xl ${
            isWon
              ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-xl shadow-emerald-500/20'
              : 'bg-gradient-to-tr from-rose-500 to-red-600 text-white shadow-xl shadow-rose-500/20'
          }`}
        >
          {isWon ? <Trophy className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
        </div>

        <div>
          <h2 className="text-2xl font-black text-white">
            {isWon ? 'VICTORY!' : 'GAME OVER'}
          </h2>
          <p className="text-sm text-slate-300 mt-1">
            {isWon
              ? `You guessed the country in ${guessCount} ${guessCount === 1 ? 'try' : 'tries'}!`
              : `The secret country was:`}
          </p>
        </div>

        <div className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-4 text-left">
          <img
            src={`https://flagcdn.com/w80/${targetCountry.iso2}.png`}
            alt={targetCountry.name}
            className="w-16 h-11 object-cover rounded-lg border border-white/20 shadow-md"
          />
          <div>
            <h3 className="text-xl font-black text-white leading-tight">
              {targetCountry.name}
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Capital: <span className="text-cyan-400">{targetCountry.capital}</span> • {targetCountry.continent}
            </p>
            <p className="text-xs text-slate-400 font-medium">
              Population: <span className="text-emerald-400">{targetCountry.populationDisplay}</span>
            </p>
          </div>
        </div>

        <div className="w-full flex flex-col sm:flex-row gap-2">
          {onPlayAgain ? (
            <button
              onClick={onPlayAgain}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Play Next Round</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-sm flex items-center justify-center gap-2 border border-slate-700 transition-all"
            >
              <X className="w-4 h-4 text-slate-400" />
              <span>View Game Board</span>
            </button>
          )}

          <button
            onClick={onShare}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
          >
            <BarChart2 className="w-4 h-4" />
            <span>Stats & Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};
