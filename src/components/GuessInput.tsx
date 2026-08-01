import React, { useState, useRef, useEffect } from 'react';
import { COUNTRIES, type CountryData } from '../assets/data/countries';
import { Search, Send } from 'lucide-react';

interface GuessInputProps {
  onGuess: (country: CountryData) => void;
  disabledCountries: string[];
  disabled: boolean;
}

function normalizeText(str: string): string {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export const GuessInput: React.FC<GuessInputProps> = ({
  onGuess,
  disabledCountries,
  disabled,
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const isKeyboardNavigating = useRef(false);

  const availableCountries = COUNTRIES.filter((c) => !disabledCountries.includes(c.id));
  const normalizedQuery = normalizeText(query.trim());

  const filtered = normalizedQuery
    ? availableCountries.filter((c) => {
        return (
          normalizeText(c.name).includes(normalizedQuery) ||
          normalizeText(c.id).includes(normalizedQuery) ||
          normalizeText(c.capital).includes(normalizedQuery) ||
          c.aliases?.some((a) => normalizeText(a).includes(normalizedQuery))
        );
      })
    : availableCountries;

  useEffect(() => { setSelectedIndex(0); }, [query]);

  useEffect(() => {
    if (isOpen && itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex]?.scrollIntoView({ block: 'nearest', behavior: 'auto' });
    }
  }, [selectedIndex, isOpen]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (country: CountryData) => {
    onGuess(country);
    setQuery('');
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || filtered.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); isKeyboardNavigating.current = true; setSelectedIndex((p) => (p + 1) % filtered.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); isKeyboardNavigating.current = true; setSelectedIndex((p) => (p - 1 + filtered.length) % filtered.length); }
    else if (e.key === 'Enter') { e.preventDefault(); if (filtered[selectedIndex]) handleSelect(filtered[selectedIndex]); }
    else if (e.key === 'Escape') setIsOpen(false);
  };

  return (
    <div className="w-full" ref={dropdownRef}>
      <form
        onSubmit={(e) => { e.preventDefault(); if (filtered[selectedIndex]) handleSelect(filtered[selectedIndex]); }}
        className="w-full flex items-center gap-2.5"
      >
        <div className="relative flex-1">
          <Search className="w-4.5 h-4.5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={query}
            disabled={disabled}
            onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? 'Game Finished' : 'Search a country...'}
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/15 text-white placeholder-slate-600 font-medium text-sm outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />

          {isOpen && filtered.length > 0 && (
            /*
              Design math: outer corner = rounded-2xl (16px), inner padding = p-1.5 (6px)
              → Item corner = 10px (rounded-[10px]) → perfect nested-corner geometry, no clipping.
            */
            <div 
              className="absolute left-0 right-0 bottom-full mb-2 z-50 rounded-2xl border border-slate-700/70 bg-[#07090f]/98 shadow-[0_-8px_40px_rgba(0,0,0,0.6)] backdrop-blur-2xl overflow-hidden flex flex-col"
              onMouseMoveCapture={() => { isKeyboardNavigating.current = false; }}
            >
              <div className="max-h-[280px] overflow-y-auto custom-dropdown-scrollbar px-1.5 flex flex-col">
                {/* top spacer — ensures first item is never flush against the border */}
                <div className="h-1.5 shrink-0" />
                {filtered.map((country, idx) => {
                  const sel = idx === selectedIndex;
                  return (
                    <button
                      key={country.id}
                      ref={(el) => { itemRefs.current[idx] = el; }}
                      type="button"
                      onClick={() => handleSelect(country)}
                      onMouseEnter={() => {
                        if (!isKeyboardNavigating.current) {
                          setSelectedIndex(idx);
                        }
                      }}
                      onMouseMove={() => {
                        if (!isKeyboardNavigating.current && selectedIndex !== idx) {
                          setSelectedIndex(idx);
                        }
                      }}
                      className={`w-full px-3 py-2 mb-0.5 scroll-m-1.5 rounded-[10px] flex items-center gap-3 text-left transition-colors duration-75 ${
                        sel ? 'bg-cyan-500/10 text-white' : 'text-slate-300 hover:bg-white/[0.04] hover:text-white'
                      }`}
                    >
                      {/* Flag */}
                      <img
                        src={`https://flagcdn.com/w40/${country.iso2}.png`}
                        alt=""
                        className="w-7 h-[18px] rounded-sm object-cover border border-white/10 shrink-0"
                      />

                      {/* Name + meta */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold leading-tight truncate ${sel ? 'text-white' : 'text-slate-200'}`}>
                          {country.name}
                        </p>
                        <p className="text-[11px] text-slate-500 leading-tight truncate mt-0.5">
                          {country.capital} · {country.continent}
                        </p>
                      </div>

                      {/* Code */}
                      <span className={`text-[11px] font-mono font-bold shrink-0 ${sel ? 'text-cyan-400' : 'text-slate-600'}`}>
                        {country.id}
                      </span>
                    </button>
                  );
                })}
                {/* bottom spacer — ensures last item is never flush against the border */}
                <div className="h-1.5 shrink-0" />
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={disabled || !filtered.length}
          className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          <span>Guess</span>
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
