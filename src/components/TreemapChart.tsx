import React, { useState } from 'react';
import type { ExportSlice } from '../assets/data/countries';

interface TreemapChartProps {
  slices: ExportSlice[];
  title?: string;
}

export const TreemapChart: React.FC<TreemapChartProps> = ({
  slices,
  title = 'Annual Export Breakdown',
}) => {
  const [hoveredSlice, setHoveredSlice] = useState<ExportSlice | null>(null);

  const totalPercentage = slices.reduce((acc, curr) => acc + curr.percentage, 0);

  return (
    <div className="w-full glass-panel p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
          {title}
        </h3>
        {hoveredSlice && (
          <div className="text-xs font-mono text-cyan-300 font-bold bg-slate-900/90 px-2.5 py-1 rounded-md border border-cyan-500/30 animate-fade-in">
            {hoveredSlice.category}: {hoveredSlice.percentage.toFixed(1)}%
          </div>
        )}
      </div>

      <div className="w-full h-64 rounded-xl overflow-hidden bg-slate-950 p-1 flex flex-wrap gap-1 border border-slate-800 relative">
        {slices.map((slice, idx) => {
          const flexGrow = Math.max(1, Math.round((slice.percentage / totalPercentage) * 100));
          return (
            <div
              key={idx}
              onMouseEnter={() => setHoveredSlice(slice)}
              onMouseLeave={() => setHoveredSlice(null)}
              style={{
                backgroundColor: slice.color,
                flexGrow: flexGrow,
                flexBasis: `${Math.max(12, slice.percentage)}%`,
              }}
              className="h-full rounded-lg p-2 flex flex-col justify-between transition-all duration-200 hover:brightness-125 cursor-pointer relative group border border-black/20 shadow-inner overflow-hidden"
            >
              <div className="flex justify-between items-start w-full">
                <span className="text-xs font-bold text-white drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)] truncate max-w-[90%]">
                  {slice.category}
                </span>
              </div>
              <span className="text-sm font-extrabold font-mono text-white/90 drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
                {slice.percentage.toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-1">
        {slices.map((slice, idx) => (
          <div
            key={idx}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300"
          >
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: slice.color }}
            />
            <span className="truncate max-w-[120px]">{slice.category}</span>
            <span className="font-mono text-slate-400 font-semibold">{slice.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};
