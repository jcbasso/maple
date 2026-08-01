import React, { useState } from 'react';
import type { GameStats } from '../utils/gameLogic';
import { X, Share2, Award, Flame, CheckCircle } from 'lucide-react';

interface StatsModalProps {
  stats: GameStats;
  shareText?: string;
  onClose: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  stats,
  shareText,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  const winRate = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;
  const maxHistogramVal = Math.max(...Object.values(stats.guessHistogram), 1);

  const handleShare = () => {
    if (shareText) {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-panel p-6 flex flex-col gap-5 border border-slate-700 animate-flip relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <Award className="w-6 h-6 text-emerald-400" />
          <h2 className="text-xl font-extrabold text-white">Player Statistics</h2>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-2xl font-black text-white block">{stats.played}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Played</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-2xl font-black text-emerald-400 block">{winRate}%</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Win Rate</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-2xl font-black text-amber-400 flex items-center justify-center gap-1">
              <Flame className="w-4 h-4 fill-amber-400" /> {stats.currentStreak}
            </span>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Streak</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-2xl font-black text-cyan-400 block">{stats.maxStreak}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Max Streak</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Guess Distribution
          </h3>
          <div className="flex flex-col gap-1.5">
            {[1, 2, 3, 4, 5, 6].map((num) => {
              const count = stats.guessHistogram[num] || 0;
              const widthPct = Math.max(10, Math.round((count / maxHistogramVal) * 100));

              return (
                <div key={num} className="flex items-center gap-2 text-xs">
                  <span className="w-3 font-mono font-bold text-slate-400">{num}</span>
                  <div
                    style={{ width: `${widthPct}%` }}
                    className={`py-1 px-2 rounded-md font-mono text-xs font-bold text-right transition-all ${
                      count > 0 ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {count}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {shareText && (
          <button
            onClick={handleShare}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
          >
            {copied ? (
              <>
                <CheckCircle className="w-5 h-5 text-slate-950" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Share2 className="w-5 h-5 text-slate-950" />
                <span>Share Results (Emoji Grid)</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
