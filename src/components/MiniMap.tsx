import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import type { CountryData } from '../assets/data/countries';
import type { GeoFeedback } from '../utils/geo';
import * as topojson from 'topojson-client';
import worldData from 'world-atlas/countries-50m.json';
import { geoEquirectangular, geoPath, geoContains, geoCentroid, geoDistance } from 'd3-geo';
import { Navigation, ZoomIn, ZoomOut, RotateCcw, Maximize2, X, Move, Eye, EyeOff } from 'lucide-react';

interface MiniMapProps {
  guesses: { country: CountryData; geo: GeoFeedback }[];
  targetCountry: CountryData;
  isFinished: boolean;
}

export const MiniMap: React.FC<MiniMapProps> = ({
  guesses,
  targetCountry,
  isFinished,
}) => {
  const mapWidth = 800;
  const mapHeight = 500;

  // Container & SVG Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const maxContainerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const maxSvgRef = useRef<SVGSVGElement>(null);

  // Pan & Zoom Refs (bypasses React re-renders for 60fps native vector scaling)
  const zoomRef = useRef<number>(1);
  const panRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isDraggingRef = useRef<boolean>(false);
  const dragStartRef = useRef<{
    x: number;
    y: number;
    panX: number;
    panY: number;
    containerWidth: number;
    containerHeight: number;
  }>({
    x: 0,
    y: 0,
    panX: 0,
    panY: 0,
    containerWidth: mapWidth,
    containerHeight: mapHeight,
  });

  // React state for UI indicators, toggle tags & modal
  const [zoomState, setZoomState] = useState<number>(1);
  // User preference: default showTags to false (clean map view by default)
  const [showTags, setShowTags] = useState<boolean>(false);
  const [isMaximized, setIsMaximized] = useState<boolean>(false);

  // Update SVG viewBox dynamically for 100% crisp vector rendering (ZERO PIXELATION)
  const applyVectorViewBox = useCallback(() => {
    const zoom = zoomRef.current;
    const panX = panRef.current.x;
    const panY = panRef.current.y;

    const vbWidth = mapWidth / zoom;
    const vbHeight = mapHeight / zoom;

    // Center coordinates adjusted for pan offset
    const vbX = (mapWidth - vbWidth) / 2 - panX;
    const vbY = (mapHeight - vbHeight) / 2 - panY;

    const viewBoxStr = `${vbX} ${vbY} ${vbWidth} ${vbHeight}`;

    if (svgRef.current) {
      svgRef.current.setAttribute('viewBox', viewBoxStr);
    }
    if (maxSvgRef.current) {
      maxSvgRef.current.setAttribute('viewBox', viewBoxStr);
    }
  }, []);

  const setZoom = useCallback((newZoom: number) => {
    const clamped = Math.max(1, Math.min(newZoom, 5));
    zoomRef.current = clamped;
    if (clamped === 1) {
      panRef.current = { x: 0, y: 0 };
    }
    applyVectorViewBox();
    setZoomState(clamped);
  }, [applyVectorViewBox]);

  const handleZoomIn = () => setZoom(zoomRef.current + 0.5);
  const handleZoomOut = () => setZoom(zoomRef.current - 0.5);
  const handleResetZoom = () => setZoom(1);

  // Mouse-relative wheel zooming (zooms relative to cursor position)
  const handleMouseWheel = useCallback((e: WheelEvent, containerEl: HTMLElement | null) => {
    e.preventDefault();
    e.stopPropagation();

    if (!containerEl) return;
    const rect = containerEl.getBoundingClientRect();

    // Mouse coordinates as a fraction [0..1] within container
    const fx = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const fy = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    const oldZoom = zoomRef.current;
    const delta = e.deltaY > 0 ? -0.25 : 0.25;
    const newZoom = Math.max(1, Math.min(oldZoom + delta, 5));

    if (newZoom === oldZoom) return;

    if (newZoom === 1) {
      zoomRef.current = 1;
      panRef.current = { x: 0, y: 0 };
      applyVectorViewBox();
      setZoomState(1);
      return;
    }

    // World coordinate under cursor before zoom
    const oldVbWidth = mapWidth / oldZoom;
    const oldVbHeight = mapHeight / oldZoom;
    const oldVbX = (mapWidth - oldVbWidth) / 2 - panRef.current.x;
    const oldVbY = (mapHeight - oldVbHeight) / 2 - panRef.current.y;

    const worldX = oldVbX + fx * oldVbWidth;
    const worldY = oldVbY + fy * oldVbHeight;

    // New viewBox dimensions
    const newVbWidth = mapWidth / newZoom;
    const newVbHeight = mapHeight / newZoom;

    // New viewBox top-left so worldX, worldY stays under mouse cursor (fx, fy)
    const newVbX = worldX - fx * newVbWidth;
    const newVbY = worldY - fy * newVbHeight;

    // Calculate new pan coordinates
    let newPanX = (mapWidth - newVbWidth) / 2 - newVbX;
    let newPanY = (mapHeight - newVbHeight) / 2 - newVbY;

    // Clamp pan bounds
    // worldWidth = 2 * mapHeight (since scale = mapHeight/π, world = 2π × scale = 2 × mapHeight = 1000)
    const worldWidth = 2 * mapHeight;
    const maxPanX = 3 * worldWidth; // allow panning 3 full world copies (for Polynesia etc.)
    newPanX = Math.max(-maxPanX, Math.min(maxPanX, newPanX));
    const maxPanY = (mapHeight / 2) * (1 - 1 / newZoom);
    newPanY = Math.max(-maxPanY, Math.min(maxPanY, newPanY));

    zoomRef.current = newZoom;
    panRef.current = { x: newPanX, y: newPanY };
    applyVectorViewBox();
    setZoomState(newZoom);
  }, [applyVectorViewBox]);

  // Non-passive wheel listener for smooth mouse-relative zooming
  useEffect(() => {
    const el1 = mapContainerRef.current;
    if (!el1) return;

    const onWheel = (e: WheelEvent) => handleMouseWheel(e, el1);
    el1.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      el1.removeEventListener('wheel', onWheel);
    };
  }, [handleMouseWheel]);

  useEffect(() => {
    if (!isMaximized) return;
    const el2 = maxContainerRef.current;
    if (!el2) return;

    requestAnimationFrame(() => {
      applyVectorViewBox();
    });

    const onWheel = (e: WheelEvent) => handleMouseWheel(e, el2);
    el2.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      el2.removeEventListener('wheel', onWheel);
    };
  }, [isMaximized, handleMouseWheel, applyVectorViewBox]);

  // Smooth Direct Drag-to-Pan Handlers (1-to-1 container responsive mouse tracking)
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    const container = isMaximized ? maxContainerRef.current : mapContainerRef.current;
    const rect = container ? container.getBoundingClientRect() : { width: mapWidth, height: mapHeight };

    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: panRef.current.x,
      panY: panRef.current.y,
      containerWidth: rect.width || mapWidth,
      containerHeight: rect.height || mapHeight,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const currentZoom = zoomRef.current;

    const screenDx = e.clientX - dragStartRef.current.x;
    const screenDy = e.clientY - dragStartRef.current.y;

    // Scale screen pixel displacement to SVG viewBox units according to actual container screen dimensions
    const viewBoxDx = (screenDx * (mapWidth / dragStartRef.current.containerWidth)) / currentZoom;
    const viewBoxDy = (screenDy * (mapHeight / dragStartRef.current.containerHeight)) / currentZoom;

    let newX = dragStartRef.current.panX + viewBoxDx;
    let newY = dragStartRef.current.panY + viewBoxDy;

    // Clamp horizontal pan: allow 3 full world-widths so user can see adjacent tiles (e.g. Polynesia)
    const worldWidth = 2 * mapHeight;
    const maxPanX = 3 * worldWidth;
    newX = Math.max(-maxPanX, Math.min(maxPanX, newX));

    // Clamp vertical pan EXACTLY at the North Pole and South Pole edges
    const maxPanY = (mapHeight / 2) * (1 - 1 / currentZoom);
    newY = Math.max(-maxPanY, Math.min(maxPanY, newY));

    panRef.current = { x: newX, y: newY };
    applyVectorViewBox();
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // D3 Projection & GeoJSON parsing (computed once)
  const { features, pathGenerator, projection } = useMemo(() => {
    // Scale to exactly fill mapHeight (500px). World becomes ~1000px wide, sides clip naturally (ocean only).
    // mapHeight / π ≈ 159.15 fills the full height; mapWidth / (2π) ≈ 127.32 would leave black bars.
    const exactScale = mapHeight / Math.PI;
    const proj = geoEquirectangular()
      .scale(exactScale)
      .translate([mapWidth / 2, mapHeight / 2]);
    const pathGen = geoPath().projection(proj);
    const geojson = topojson.feature(
      worldData as any,
      worldData.objects.countries as any
    ) as any;
    return {
      features: geojson.features || [],
      pathGenerator: pathGen,
      projection: proj,
    };
  }, []);

  // Pre-compute SVG path strings for all 241 features once
  const cachedCountryPaths = useMemo(() => {
    return features.map((f: any) => ({
      feature: f,
      d: pathGenerator(f) || '',
    }));
  }, [features, pathGenerator]);

  // Bulletproof feature lookup by direct containment or spherical centroid proximity (resolves antimeridian island MultiPolygons like Samoa)
  const findMatchingFeature = useCallback(
    (lat: number, lng: number) => {
      // 1. Direct point containment
      let match = features.find((f: any) => geoContains(f, [lng, lat]));
      if (match) return match;

      // 2. Radial spiral grid search up to 2.5 degrees around lat/lng
      for (let r = 0.25; r <= 2.5; r += 0.25) {
        for (let angle = 0; angle < 360; angle += 45) {
          const rad = (angle * Math.PI) / 180;
          const dx = r * Math.cos(rad);
          const dy = r * Math.sin(rad);
          match = features.find((f: any) => geoContains(f, [lng + dx, lat + dy]));
          if (match) return match;
        }
      }

      // 3. Spherical centroid proximity check (fixes antimeridian-clipped island MultiPolygons like Samoa)
      let minDistance = Infinity;
      let bestFeature = null;

      for (const feature of features) {
        const centroid = geoCentroid(feature);
        const dist = geoDistance([lng, lat], centroid);
        if (dist < minDistance) {
          minDistance = dist;
          bestFeature = feature;
        }
      }

      if (bestFeature && minDistance < 0.08) {
        return bestFeature;
      }

      return null;
    },
    [features]
  );

  // Map each guess to its matching GeoJSON feature (via lat/lng point containment or island radial search)
  const guessedFeatures = useMemo(() => {
    const map = new Map<string, { feature: any; color: string; prox: number; isWinner: boolean }>();

    guesses.forEach((g) => {
      const isWinner = g.country.id === targetCountry.id;
      const prox = g.geo.proximityPercent;

      let color = '#64748b'; // default slate
      if (isWinner) {
        color = '#10b981'; // Green
      } else if (prox >= 80) {
        color = '#f59e0b'; // Amber
      } else if (prox >= 50) {
        color = '#06b6d4'; // Cyan
      }

      const match = findMatchingFeature(g.country.lat, g.country.lng);

      if (match) {
        map.set(g.country.id, { feature: match, color, prox, isWinner });
      }
    });

    return map;
  }, [guesses, targetCountry, findMatchingFeature]);

  // Target country GeoJSON feature
  const targetFeature = useMemo(() => {
    return findMatchingFeature(targetCountry.lat, targetCountry.lng);
  }, [targetCountry, findMatchingFeature]);

  // Projected target centroid coordinates
  const targetCoords = useMemo(() => {
    const p = projection([targetCountry.lng, targetCountry.lat]);
    return p ? { x: p[0], y: p[1] } : { x: 400, y: 200 };
  }, [projection, targetCountry]);

  const targetPathD = useMemo(() => {
    return targetFeature ? pathGenerator(targetFeature) || '' : '';
  }, [targetFeature, pathGenerator]);

  // Render SVG Map using dynamic viewBox vector scaling
  const renderMapSvg = (ref: React.RefObject<SVGSVGElement | null>) => (
    <svg
      ref={ref}
      viewBox={`0 0 ${mapWidth} ${mapHeight}`}
      className="w-full h-full object-cover select-none"
    >

      {/* Render 9 Repeat World Tiles: [-4, -3, -2, -1, 0, 1, 2, 3, 4] */}
      {[-4, -3, -2, -1, 0, 1, 2, 3, 4].map((tileOffset) => (
        <g key={tileOffset} transform={`translate(${tileOffset * 2 * mapHeight}, 0)`}>
          {/* LAYER 0: Grid Lines (equator + prime meridian) repeated per tile */}
          <line x1="0" y1={mapHeight / 2} x2={2 * mapHeight} y2={mapHeight / 2} stroke="#1e293b" strokeDasharray="3 3" strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
          <line x1={mapHeight} y1="0" x2={mapHeight} y2={mapHeight} stroke="#1e293b" strokeDasharray="3 3" strokeWidth="0.8" vectorEffect="non-scaling-stroke" />

          {/* LAYER 1: Base World Map */}
          <g className="base-world-map">
            {cachedCountryPaths.map((item: { feature: any; d: string }, idx: number) => (
              <path
                key={idx}
                d={item.d}
                fill="#1e293b"
                stroke="#334155"
                strokeWidth="0.6"
                vectorEffect="non-scaling-stroke"
                strokeLinejoin="round"
              />
            ))}
          </g>

          {/* LAYER 2: Highlighted Guessed & Target Countries */}
          <g className="highlighted-countries">
            {Array.from(guessedFeatures.values()).map((val, idx) => {
              const pathD = pathGenerator(val.feature);
              if (!pathD) return null;

              return (
                <path
                  key={idx}
                  d={pathD}
                  fill={val.color}
                  stroke="rgba(255, 255, 255, 0.4)"
                  strokeWidth="0.6"
                  vectorEffect="non-scaling-stroke"
                  strokeLinejoin="round"
                />
              );
            })}

            {isFinished && targetPathD && (
              <path
                d={targetPathD}
                fill="#10b981"
                stroke="#34d399"
                strokeWidth="0.8"
                vectorEffect="non-scaling-stroke"
                strokeLinejoin="round"
              />
            )}
          </g>

          {/* LAYER 3: Flag Tag Overlay Badges (Color-coded by proximity %, enlarged for readability) */}
          {showTags && guesses.map((item, idx) => {
            const p = projection([item.country.lng, item.country.lat]);
            if (!p) return null;
            const guessPos = { x: p[0], y: p[1] };
            const invScale = 1 / zoomState;
            const isWinner = item.country.id === targetCountry.id;
            const prox = item.geo.proximityPercent;

            let strokeColor = '#64748b'; // default slate (<50%)
            let textColor = '#cbd5e1';

            if (isWinner) {
              strokeColor = '#10b981'; // Green (100%)
              textColor = '#34d399';
            } else if (prox >= 80) {
              strokeColor = '#f59e0b'; // Amber (>=80%)
              textColor = '#fbbf24';
            } else if (prox >= 50) {
              strokeColor = '#06b6d4'; // Cyan (>=50%)
              textColor = '#22d3ee';
            }

            return (
              <g key={idx} transform={`translate(${guessPos.x}, ${guessPos.y}) scale(${invScale})`}>
                {/* Flag Image + Country Tag Overlay (Centered on Centroid) */}
                <g transform="translate(-30, -10)">
                  <rect
                    x="-2"
                    y="-2"
                    width="60"
                    height="20"
                    rx="4"
                    fill="#0f172a"
                    fillOpacity="0.95"
                    stroke={strokeColor}
                    strokeWidth="1.2"
                    vectorEffect="non-scaling-stroke"
                  />
                  <image
                    href={`https://flagcdn.com/w40/${item.country.iso2}.png`}
                    x="2"
                    y="1"
                    width="18"
                    height="14"
                    preserveAspectRatio="cover"
                  />
                  <text
                    x="24"
                    y="11"
                    fill={textColor}
                    fontSize="11"
                    fontWeight="800"
                    fontFamily="monospace"
                  >
                    {item.country.id}
                  </text>
                </g>
              </g>
            );
          })}

          {/* Target Country Reveal Tag on Game End (Inverse Scaled & Toggleable) */}
          {showTags && isFinished && (
            <g transform={`translate(${targetCoords.x}, ${targetCoords.y}) scale(${1 / zoomState})`}>
              <g transform="translate(-67, -10)">
                <rect
                  x="-4"
                  y="-4"
                  width="135"
                  height="20"
                  rx="6"
                  fill="#064e3b"
                  fillOpacity="0.95"
                  stroke="#34d399"
                  strokeWidth="1.2"
                  vectorEffect="non-scaling-stroke"
                />
                <image
                  href={`https://flagcdn.com/w40/${targetCountry.iso2}.png`}
                  x="0"
                  y="-1"
                  width="18"
                  height="13"
                  preserveAspectRatio="cover"
                />
                <text
                  x="22"
                  y="10"
                  fill="#34d399"
                  fontSize="10"
                  fontWeight="900"
                  fontFamily="sans-serif"
                >
                  🎯 {targetCountry.name}
                </text>
              </g>
            </g>
          )}
        </g>
      ))}
    </svg>
  );

  return (
    <>
      {/* Standard In-Page MiniMap Container */}
      <div className="w-full glass-panel p-4 flex flex-col gap-3.5 border border-slate-800 shadow-2xl">
        <div className="flex items-center justify-between">
          {/* Drag hint when zoomed */}
          {zoomState > 1 ? (
            <span className="text-[10px] text-cyan-400 font-mono px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 flex items-center gap-1">
              <Move className="w-3 h-3" /> Drag to pan
            </span>
          ) : (
            <span className="text-[10px] text-slate-600 font-mono">
              {guesses.length > 0 ? `${guesses.length}/6 guesses` : 'Scroll to zoom · drag to pan'}
            </span>
          )}

          {/* Map Action Controls */}
          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setShowTags((prev) => !prev)}
              className={`p-1.5 rounded-lg transition-all ${
                showTags
                  ? 'text-cyan-400 bg-cyan-500/10 hover:bg-slate-800'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
              }`}
              title={showTags ? 'Hide Country Labels' : 'Show Country Labels'}
            >
              {showTags ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>

            <div className="w-px h-4 bg-slate-800 mx-0.5" />

            <button
              onClick={handleZoomIn}
              disabled={zoomState >= 5}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition-all"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              disabled={zoomState <= 1}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition-all"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            {(zoomState > 1 || panRef.current.x !== 0 || panRef.current.y !== 0) && (
              <button
                onClick={handleResetZoom}
                className="p-1.5 rounded-lg text-amber-400 hover:bg-slate-800 transition-all"
                title="Reset Zoom & Pan"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}

            <div className="w-px h-4 bg-slate-800 mx-0.5" />

            <button
              onClick={() => setIsMaximized(true)}
              className="p-1.5 rounded-lg text-cyan-400 hover:bg-slate-800 transition-all"
              title="Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Map Canvas with Mouse-Relative Zoom & Direct Drag */}
        <div
          ref={mapContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="w-full aspect-[16/10] rounded-2xl bg-[#090d16] border border-slate-800/80 overflow-hidden relative shadow-inner flex items-center justify-center cursor-grab active:cursor-grabbing"
        >
          {renderMapSvg(svgRef)}
        </div>
      </div>

      {/* Fullscreen Maximized Map Modal */}
      {isMaximized && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col p-4 sm:p-6 animate-flip">
          {/* Maximized Header & Controls */}
          <div className="w-full flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <Navigation className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white leading-tight">
                  Expanded Infinite Vector World Map
                </h2>
                <p className="text-xs text-slate-400">
                  {guesses.length} {guesses.length === 1 ? 'country' : 'countries'} plotted • Zoom: {zoomState.toFixed(1)}x • Scroll wheel over cursor to zoom
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
                {/* Toggle Tags Button inside Maximized Modal */}
                <button
                  onClick={() => setShowTags((prev) => !prev)}
                  className={`p-2 rounded-lg transition-all ${
                    showTags
                      ? 'text-cyan-400 bg-cyan-500/10 hover:bg-slate-800'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                  }`}
                  title={showTags ? 'Hide Country Labels / Tags' : 'Show Country Labels / Tags'}
                >
                  {showTags ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>

                <div className="w-px h-5 bg-slate-800 mx-0.5" />

                <button
                  onClick={handleZoomIn}
                  disabled={zoomState >= 5}
                  className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition-all"
                  title="Zoom In (+)"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
                <button
                  onClick={handleZoomOut}
                  disabled={zoomState <= 1}
                  className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition-all"
                  title="Zoom Out (-)"
                >
                  <ZoomOut className="w-5 h-5" />
                </button>

                {(zoomState > 1 || panRef.current.x !== 0 || panRef.current.y !== 0) && (
                  <button
                    onClick={handleResetZoom}
                    className="p-2 rounded-lg text-amber-400 hover:bg-slate-800 transition-all"
                    title="Reset Zoom & Pan"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                )}
              </div>

              <button
                onClick={() => setIsMaximized(false)}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                title="Close Fullscreen Map"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Fullscreen Map Canvas with Mouse-Relative Zoom */}
          <div
            ref={maxContainerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="w-full flex-1 rounded-2xl bg-[#090d16] border border-slate-800 mt-4 overflow-hidden relative shadow-2xl flex items-center justify-center cursor-grab active:cursor-grabbing"
          >
            {renderMapSvg(maxSvgRef)}
          </div>
        </div>
      )}
    </>
  );
};
