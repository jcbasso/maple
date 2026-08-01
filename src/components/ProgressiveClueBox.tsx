import React, { useState } from 'react';
import type { CountryData } from '../assets/data/countries';
import { TreemapChart } from './TreemapChart';
import { Lock, Zap, Trees, Palette, Building2, Package } from 'lucide-react';

interface ProgressiveClueBoxProps {
  country: CountryData;
  guessCount: number;
}

export const ProgressiveClueBox: React.FC<ProgressiveClueBoxProps> = ({
  country,
  guessCount,
}) => {
  const [activeTab, setActiveTab] = useState<'exports' | 'energy' | 'land' | 'flag' | 'capital'>('exports');

  const isEnergyUnlocked = guessCount >= 1;
  const isLandUnlocked = guessCount >= 2;
  const isFlagUnlocked = guessCount >= 3;
  const isCapitalUnlocked = guessCount >= 4;

  return (
    <div className="w-full glass-panel p-4 flex flex-col gap-4">
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-slate-800">
        <button
          onClick={() => setActiveTab('exports')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'exports'
              ? 'bg-cyan-500 text-slate-950 shadow-md'
              : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>1. Exports</span>
        </button>

        <button
          onClick={() => isEnergyUnlocked && setActiveTab('energy')}
          disabled={!isEnergyUnlocked}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            !isEnergyUnlocked
              ? 'bg-slate-950/40 text-slate-600 cursor-not-allowed border border-slate-900'
              : activeTab === 'energy'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800'
          }`}
        >
          {isEnergyUnlocked ? <Zap className="w-3.5 h-3.5 text-amber-400" /> : <Lock className="w-3.5 h-3.5" />}
          <span>2. Energy Grid</span>
        </button>

        <button
          onClick={() => isLandUnlocked && setActiveTab('land')}
          disabled={!isLandUnlocked}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            !isLandUnlocked
              ? 'bg-slate-950/40 text-slate-600 cursor-not-allowed border border-slate-900'
              : activeTab === 'land'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800'
          }`}
        >
          {isLandUnlocked ? <Trees className="w-3.5 h-3.5 text-emerald-400" /> : <Lock className="w-3.5 h-3.5" />}
          <span>3. Land Use</span>
        </button>

        <button
          onClick={() => isFlagUnlocked && setActiveTab('flag')}
          disabled={!isFlagUnlocked}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            !isFlagUnlocked
              ? 'bg-slate-950/40 text-slate-600 cursor-not-allowed border border-slate-900'
              : activeTab === 'flag'
              ? 'bg-rose-500 text-white shadow-md'
              : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800'
          }`}
        >
          {isFlagUnlocked ? <Palette className="w-3.5 h-3.5 text-rose-400" /> : <Lock className="w-3.5 h-3.5" />}
          <span>4. Flag Palette</span>
        </button>

        <button
          onClick={() => isCapitalUnlocked && setActiveTab('capital')}
          disabled={!isCapitalUnlocked}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            !isCapitalUnlocked
              ? 'bg-slate-950/40 text-slate-600 cursor-not-allowed border border-slate-900'
              : activeTab === 'capital'
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800'
          }`}
        >
          {isCapitalUnlocked ? <Building2 className="w-3.5 h-3.5 text-blue-400" /> : <Lock className="w-3.5 h-3.5" />}
          <span>5. Capital Hint</span>
        </button>
      </div>

      <div className="w-full">
        {activeTab === 'exports' && (
          <TreemapChart slices={country.exports} title="Pista 1: Exportaciones Anuales" />
        )}

        {activeTab === 'energy' && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-3">
            <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4" /> Pista 2: Fuentes de Generación Eléctrica
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {country.energy.map((item, i) => (
                <div key={i} className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex flex-col">
                  <span className="text-xs text-slate-400 truncate">{item.source}</span>
                  <span className="text-lg font-bold font-mono text-amber-400">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'land' && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-3">
            <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <Trees className="w-4 h-4" /> Pista 3: Superficie y Uso de Suelo
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {country.landUse.map((item, i) => (
                <div key={i} className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex flex-col">
                  <span className="text-xs text-slate-400 truncate">{item.type}</span>
                  <span className="text-lg font-bold font-mono text-emerald-400">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'flag' && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-3">
            <h4 className="text-xs font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-2">
              <Palette className="w-4 h-4" /> Pista 4: Colores Dominantes de la Bandera
            </h4>
            <div className="flex items-center gap-3">
              {country.flagColors.map((color, i) => (
                <div
                  key={i}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2 text-sm font-semibold text-slate-200"
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-white/20"
                    style={{ backgroundColor: color.toLowerCase() }}
                  />
                  <span>{color}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'capital' && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-3">
            <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4" /> Pista 5: Capital del País
            </h4>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Capital de este país:</p>
                <p className="text-xl font-extrabold text-blue-400 tracking-wide font-mono">
                  {country.capital}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Primera letra del país:</p>
                <p className="text-2xl font-black text-cyan-400 font-mono">
                  "{country.name.charAt(0)}"
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
