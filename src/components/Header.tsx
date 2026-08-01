import React from 'react';
import { Globe2, BarChart3, HelpCircle } from 'lucide-react';

interface HeaderProps {
  onOpenStats: () => void;
  onOpenHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenStats,
  onOpenHelp,
}) => {
  return (
    <header className="w-full glass-panel mb-4 px-4 py-2 sm:py-3 sm:px-6 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20">
          <Globe2 className="w-6 h-6 text-white animate-spin-slow" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-cyan-200 to-blue-400 bg-clip-text text-transparent">
            MAP<span className="text-cyan-400">LE</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium hidden sm:block">
            Daily Country Guessing Game
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onOpenStats}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700"
          title="Statistics"
        >
          <BarChart3 className="w-5 h-5 text-emerald-400" />
        </button>
        <button
          onClick={onOpenHelp}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700"
          title="How to Play"
        >
          <HelpCircle className="w-5 h-5 text-amber-400" />
        </button>
      </div>
    </header>
  );
};
