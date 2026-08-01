import React from 'react';
import type { GuessComparison } from '../utils/attributeMatcher';

interface AttributeRowProps {
  comparison: GuessComparison;
  attemptNumber: number;
}

export const AttributeRow: React.FC<AttributeRowProps> = ({
  comparison,
  attemptNumber,
}) => {
  const { country, geo, attributes, isExactMatch } = comparison;
  const prox = geo.proximityPercent;

  // Determine overall color theme based on proximity %
  let borderLeftColor = 'border-l-slate-600';
  let bgGradient = 'bg-slate-900/80 border-slate-800';
  let badgeColor = 'bg-slate-800 text-slate-300 border-slate-700';
  let proxBadgeColor = 'bg-slate-800/80 text-slate-400 border-slate-700';
  let proxTextColor = 'text-slate-400';

  if (isExactMatch) {
    borderLeftColor = 'border-l-emerald-500';
    bgGradient = 'bg-gradient-to-r from-emerald-950/60 to-slate-900/90 border-emerald-500/40 shadow-lg shadow-emerald-500/10';
    badgeColor = 'bg-emerald-500 text-slate-950 border-emerald-400 font-black';
    proxBadgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    proxTextColor = 'text-emerald-300';
  } else if (prox >= 80) {
    borderLeftColor = 'border-l-amber-500';
    bgGradient = 'bg-gradient-to-r from-amber-950/40 to-slate-900/90 border-amber-500/30 shadow-md shadow-amber-500/10';
    badgeColor = 'bg-amber-500 text-slate-950 border-amber-400 font-bold';
    proxBadgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    proxTextColor = 'text-amber-300';
  } else if (prox >= 50) {
    borderLeftColor = 'border-l-cyan-500';
    bgGradient = 'bg-gradient-to-r from-cyan-950/30 to-slate-900/90 border-cyan-500/30';
    badgeColor = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold';
    proxBadgeColor = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
    proxTextColor = 'text-cyan-300';
  }

  return (
    <div
      className={`w-full h-[70px] sm:h-[82px] glass-panel px-3 py-2 flex flex-col justify-between animate-flip border-l-4 ${borderLeftColor} ${bgGradient} transition-all rounded-2xl overflow-hidden`}
    >
      {/* Row 1: Attempt Number, Flag, Country Name, Distance & Proximity Badge */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`w-5 h-5 rounded-full border text-xs font-mono flex items-center justify-center shrink-0 ${badgeColor}`}
          >
            {attemptNumber}
          </span>
          <img
            src={`https://flagcdn.com/w40/${country.iso2}.png`}
            alt={country.name}
            className="w-7 h-[18px] object-cover rounded border border-white/20 shadow-sm shrink-0"
          />
          <h4 className="text-sm font-bold text-white truncate leading-none">
            {country.name}
          </h4>
        </div>

        {/* Distance & Proximity Badge */}
        <div
          className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border shrink-0 ${proxBadgeColor}`}
        >
          <span className="text-base leading-none">{geo.directionArrow}</span>
          <span className={`text-[11px] font-extrabold font-mono leading-none ${proxTextColor}`}>
            {geo.distanceKm.toLocaleString()} km · {geo.proximityPercent}%
          </span>
        </div>
      </div>

      {/* Row 2: 3 Single-Line Attribute Tiles */}
      <div className="grid grid-cols-3 gap-1.5">
        <div
          className={`px-2 py-[5px] rounded-lg flex items-center justify-center gap-1 border transition-all ${
            attributes.continent.status === 'correct'
              ? 'bg-emerald-500/20 border-emerald-500/50'
              : 'bg-slate-900/60 border-slate-700/60'
          }`}
        >
          <span className="text-[9px] uppercase font-bold text-slate-500 shrink-0">Cont.</span>
          <span className={`text-[11px] font-bold truncate ${attributes.continent.status === 'correct' ? 'text-emerald-300' : 'text-slate-200'}`}>
            {attributes.continent.indicatorSymbol} {country.continent}
          </span>
        </div>

        <div
          className={`px-2 py-[5px] rounded-lg flex items-center justify-center gap-1 border transition-all ${
            attributes.population.status === 'correct'
              ? 'bg-emerald-500/20 border-emerald-500/50'
              : attributes.population.status === 'close'
              ? 'bg-amber-500/20 border-amber-500/50'
              : 'bg-slate-900/60 border-slate-700/60'
          }`}
        >
          <span className="text-[9px] uppercase font-bold text-slate-500 shrink-0">Pop.</span>
          <span className={`text-[11px] font-bold truncate ${
            attributes.population.status === 'correct' ? 'text-emerald-300'
            : attributes.population.status === 'close' ? 'text-amber-300'
            : 'text-slate-200'
          }`}>
            {attributes.population.indicatorSymbol} {country.populationDisplay}
          </span>
        </div>

        <div
          className={`px-2 py-[5px] rounded-lg flex items-center justify-center gap-1 border transition-all ${
            attributes.language.status === 'correct'
              ? 'bg-emerald-500/20 border-emerald-500/50'
              : 'bg-slate-900/60 border-slate-700/60'
          }`}
        >
          <span className="text-[9px] uppercase font-bold text-slate-500 shrink-0">Lang.</span>
          <span className={`text-[11px] font-bold truncate ${attributes.language.status === 'correct' ? 'text-emerald-300' : 'text-slate-200'}`}>
            {attributes.language.indicatorSymbol} {country.language}
          </span>
        </div>
      </div>
    </div>
  );
};
