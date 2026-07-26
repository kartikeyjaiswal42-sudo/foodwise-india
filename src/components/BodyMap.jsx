'use client'
import { useState } from 'react'
import { ORGAN_SYSTEMS } from '../lib/toxicity'

// Where each body system sits on the 220 x 460 silhouette.
// A few (skin, bones, dna, blood) have no single anatomical point — they are
// placed where a reader intuitively looks for them and labelled clearly.
const SPOTS = {
  brain: { x: 110, y: 34 },
  teeth: { x: 110, y: 66 },
  thyroid: { x: 110, y: 92 },
  lungs: { x: 84, y: 138 },
  heart: { x: 124, y: 132 },
  liver: { x: 88, y: 178 },
  metabolic: { x: 126, y: 182 },
  kidney: { x: 142, y: 196 },
  immune: { x: 68, y: 196 },
  gut: { x: 110, y: 218 },
  reproductive: { x: 110, y: 254 },
  blood: { x: 44, y: 232 },
  skin: { x: 176, y: 232 },
  dna: { x: 176, y: 160 },
  bones: { x: 110, y: 350 },
}

/**
 * Interactive body silhouette. `intensity` is { organKey: 0..1 } — the dot
 * grows and glows with the load. Purely presentational; clicking calls onPick.
 */
export default function BodyMap({ intensity = {}, onPick, caption }) {
  const [hover, setHover] = useState(null)
  const hovered = hover ? ORGAN_SYSTEMS[hover] : null

  return (
    <section className="bodymap-panel panel">
      <div className="bodymap-stage">
        <svg viewBox="0 0 220 460" className="bodymap-svg" role="img" aria-label="Body systems affected by packaged-food chemicals">
          <defs>
            <linearGradient id="bmBody" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e9efe9" />
              <stop offset="100%" stopColor="#d8e2dc" />
            </linearGradient>
            <filter id="bmGlow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="5" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* silhouette */}
          <g fill="url(#bmBody)" stroke="#c3cfc7" strokeWidth="1.5">
            <circle cx="110" cy="44" r="30" />
            <rect x="100" y="72" width="20" height="18" rx="8" />
            <path d="M110 86 c-30 0 -44 12 -46 34 l-6 62 c-1 12 4 18 12 19 l4 40 c1 26 4 44 8 58 h56 c4 -14 7 -32 8 -58 l4 -40 c8 -1 13 -7 12 -19 l-6 -62 c-2 -22 -16 -34 -46 -34 z" />
            {/* arms */}
            <path d="M64 122 c-14 6 -20 18 -22 34 l-8 66 c-1 8 2 12 7 13 c5 1 8 -2 9 -10 l10 -60 z" />
            <path d="M156 122 c14 6 20 18 22 34 l8 66 c1 8 -2 12 -7 13 c-5 1 -8 -2 -9 -10 l-10 -60 z" />
            {/* legs */}
            <path d="M96 298 l-6 84 c-1 22 -2 40 -1 52 c1 8 4 12 10 12 c6 0 9 -4 10 -12 l4 -136 z" />
            <path d="M124 298 l6 84 c1 22 2 40 1 52 c-1 8 -4 12 -10 12 c-6 0 -9 -4 -10 -12 l-4 -136 z" />
          </g>

          {/* hotspots */}
          {Object.entries(SPOTS).map(([key, pos]) => {
            const sys = ORGAN_SYSTEMS[key]
            if (!sys) return null
            const v = Math.max(0, Math.min(1, intensity[key] || 0))
            const r = 5 + v * 12
            const active = hover === key
            return (
              <g
                key={key}
                className={`bodymap-spot ${v > 0 ? 'lit' : 'dim'} ${active ? 'active' : ''}`}
                onMouseEnter={() => setHover(key)}
                onMouseLeave={() => setHover(null)}
                onClick={() => onPick?.(key)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPick?.(key) } }}
                aria-label={`${sys.label} — load ${Math.round(v * 100)}%`}
              >
                {v > 0.05 && (
                  <circle cx={pos.x} cy={pos.y} r={r + 6} fill={sys.color} opacity={0.16 + v * 0.2} filter="url(#bmGlow)" />
                )}
                <circle cx={pos.x} cy={pos.y} r={r} fill={sys.color} opacity={v > 0 ? 0.55 + v * 0.45 : 0.22} />
                <circle cx={pos.x} cy={pos.y} r={r} fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.85" />
                {/* generous invisible hit area */}
                <circle cx={pos.x} cy={pos.y} r={Math.max(16, r + 8)} fill="transparent" />
              </g>
            )
          })}
        </svg>

        <div className="bodymap-side">
          {hovered ? (
            <div className="bodymap-tip animated-fade-in" style={{ '--organ': hovered.color }}>
              <span className="bodymap-tip-emoji">{hovered.emoji}</span>
              <strong>{hovered.label}</strong>
              <p>{hovered.blurb}</p>
              <div className="bodymap-tip-load">
                <span>Load</span>
                <div><span style={{ width: `${Math.round((intensity[hover] || 0) * 100)}%`, background: hovered.color }} /></div>
                <strong>{Math.round((intensity[hover] || 0) * 100)}%</strong>
              </div>
              <small>Click to open the full diagnostic →</small>
            </div>
          ) : (
            <div className="bodymap-legend">
              <span className="eyebrow">Affected systems</span>
              <div className="bodymap-legend-grid">
                {Object.values(ORGAN_SYSTEMS)
                  .slice()
                  .sort((a, b) => (intensity[b.key] || 0) - (intensity[a.key] || 0))
                  .map((s) => (
                    <button key={s.key} onClick={() => onPick?.(s.key)}
                      onMouseEnter={() => setHover(s.key)} onMouseLeave={() => setHover(null)}
                      className={(intensity[s.key] || 0) > 0 ? 'lit' : ''}>
                      <i style={{ background: s.color, opacity: 0.25 + (intensity[s.key] || 0) * 0.75 }} />
                      {s.emoji} {s.label}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {caption && <p className="label-note bodymap-caption">{caption} Hover or tap a hotspot.</p>}
    </section>
  )
}
