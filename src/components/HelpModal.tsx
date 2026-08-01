import React from 'react';
import { X, HelpCircle, Globe2, Compass, CheckCircle2 } from 'lucide-react';

interface HelpModalProps {
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg glass-panel p-6 flex flex-col gap-5 border border-slate-700 animate-flip relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-amber-400" />
          <h2 className="text-xl font-extrabold text-white">How to Play Maple</h2>
        </div>

        <p className="text-sm text-slate-300">
          Guess the mystery daily country in 6 attempts or fewer!
        </p>

        <div className="flex flex-col gap-3">
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-white mb-1">Country Attributes</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Each guess compares 3 key attributes (Continent, Population, Primary Language) with color-coded feedback:
                <span className="block mt-1">🟩 <strong>Green</strong> = Exact Match</span>
                <span className="block">🟨 <strong>Yellow</strong> = Close / Similar</span>
                <span className="block">⬜ <strong>Gray</strong> = Different</span>
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
            <Compass className="w-5 h-5 text-cyan-400 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-white mb-1">Distance &amp; Bearing Feedback</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                After each guess, you will see the distance in kilometers to the target country and a compass direction arrow pointing towards it (e.g. ↗️ North-East).
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
            <Globe2 className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-white mb-1">Interactive World Map</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every country you guess is plotted live on the vector world map with a color-coded tag showing its proximity score.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-sm transition-all"
        >
          Got it, Let's Play!
        </button>
      </div>
    </div>
  );
};
