'use client'
import { useMemo, useState } from 'react'
import {
  TrendingUp, CalendarRange, Info, AlertTriangle, CheckCircle2, Flame,
} from 'lucide-react'
import { products } from '../data/foodDatabase'
import { dailyTotals, averages, deriveInsights, chartSeries, lastNDays, weekdayOf } from '../lib/trends'

const WINDOWS = [
  { id: 7, label: 'Last 7 days' },
  { id: 14, label: 'Last 14 days' },
  { id: 30, label: 'Last 30 days' },
]

const METRICS = [
  { id: 'calories', label: 'Calories', unit: 'kcal', limitKey: 'calories' },
  { id: 'sugar', label: 'Sugar', unit: 'g', limitKey: 'sugar' },
  { id: 'sodium', label: 'Sodium', unit: 'mg', limitKey: 'sodium' },
  { id: 'satFat', label: 'Sat fat', unit: 'g', limitKey: 'satFat' },
]

const TONE_ICON = { good: CheckCircle2, warn: AlertTriangle, bad: AlertTriangle, note: Info }

export default function Trends({ log = [], limits = {} }) {
  const [days, setDays] = useState(7)
  const [metric, setMetric] = useState('calories')

  const window = useMemo(() => lastNDays(days), [days])
  const rows = useMemo(() => dailyTotals(log, products, window), [log, window])
  const avg = useMemo(() => averages(rows), [rows])

  // Home-cooked vs eating-out is derived from the CONTEXT stored on each logged
  // meal, which only the meal features record. Packaged items have no cooking
  // context, so they are deliberately excluded rather than counted as "home".
  const contextSplit = useMemo(() => {
    let home = 0, out = 0, homeKcal = 0, outKcal = 0
    for (const entry of log) {
      if (!window.includes(entry.date) || !entry.meal?.items) continue
      const per = (entry.meal.totals?.kcal || 0) / Math.max(1, entry.meal.items.length)
      for (const it of entry.meal.items) {
        if (it.context === 'home' || it.context === 'homeRich') { home++; homeKcal += per }
        else if (it.context) { out++; outKcal += per }
      }
    }
    return { home, out, homeKcal, outKcal }
  }, [log, window])

  const { insights, blocked } = useMemo(
    () => deriveInsights(rows, limits, { contextSplit }),
    [rows, limits, contextSplit]
  )

  const meta = METRICS.find((m) => m.id === metric)
  const series = useMemo(() => chartSeries(rows, metric), [rows, metric])
  const limit = limits[meta.limitKey]
  const maxValue = Math.max(1, ...series.map((s) => s.value))
  const limitPct = limit ? Math.min(100, (limit / maxValue) * 100) : null

  return (
    <main className="trends-view">
      <section className="scanner-hero">
        <div className="scanner-hero-icon"><TrendingUp size={34} /></div>
        <div>
          <span className="eyebrow">Your patterns</span>
          <h1>What your week actually looked like</h1>
          <p>
            Every line below is arithmetic over what <em>you</em> logged. Nothing here diagnoses
            anything or guesses at a cause — if the log is too thin to support a finding, the
            finding is left out rather than hedged.
          </p>
        </div>
      </section>

      <div className="trends-controls">
        <div className="chip-row">
          {WINDOWS.map((w) => (
            <button key={w.id} className={`chip ${days === w.id ? 'on' : ''}`}
              aria-pressed={days === w.id} onClick={() => setDays(w.id)}>
              <CalendarRange size={14} /> {w.label}
            </button>
          ))}
        </div>
        <div className="chip-row">
          {METRICS.map((m) => (
            <button key={m.id} className={`chip ${metric === m.id ? 'on' : ''}`}
              aria-pressed={metric === m.id} onClick={() => setMetric(m.id)}>{m.label}</button>
          ))}
        </div>
      </div>

      <section className="panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">{meta.label} per day</span>
            <h2>
              {avg.loggedDays > 0
                ? <>Averaging {Math.round(avg[metric])} {meta.unit} across {avg.loggedDays} logged day{avg.loggedDays > 1 ? 's' : ''}</>
                : <>Nothing logged in this window</>}
            </h2>
          </div>
          {limit ? <span className="helper-click-badge">Your ceiling: {Math.round(limit)} {meta.unit}</span> : null}
        </div>

        <div className="trend-chart" role="img"
          aria-label={`${meta.label} for the last ${days} days`}>
          {limitPct != null && (
            <div className="trend-limit" style={{ bottom: `${limitPct}%` }}>
              <span>ceiling</span>
            </div>
          )}
          {series.map((s) => (
            <div key={s.date} className={`trend-bar-wrap ${s.empty ? 'empty' : ''}`}>
              <div
                className={`trend-bar ${limit && s.value > limit ? 'over' : ''}`}
                style={{ height: s.empty ? '2px' : `${Math.max(2, s.pct)}%` }}
                title={`${weekdayOf(s.date)} ${s.date}: ${s.empty ? 'nothing logged' : `${s.value} ${meta.unit}`}`}
              />
              <span className="trend-bar-label">{s.label}</span>
            </div>
          ))}
        </div>
        <p className="trend-legend">
          {/* An unlogged day is a hole in the data, not a zero-calorie day — the
              chart has to say which, or a skipped day reads as a fast. */}
          A flat sliver means <strong>nothing was logged that day</strong>, not that you ate nothing.
        </p>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div><span className="eyebrow">Findings</span><h2>What the log shows</h2></div>
        </div>

        {blocked ? (
          <p className="empty-note"><Info size={15} /> {blocked}</p>
        ) : (
          <ul className="insight-list">
            {insights.map((ins) => {
              const Icon = TONE_ICON[ins.tone] || Info
              return (
                <li key={ins.id} className={`insight tone-${ins.tone}`}>
                  <Icon size={17} />
                  <div>
                    <span className="insight-metric">{ins.metric}</span>
                    <p>{ins.text}</p>
                    {ins.detail && <small>{ins.detail}</small>}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {avg.loggedDays > 0 && (
        <section className="panel">
          <div className="section-heading">
            <div><span className="eyebrow">Daily averages</span><h2>Across {avg.loggedDays} logged day{avg.loggedDays > 1 ? 's' : ''}</h2></div>
          </div>
          <ul className="meal-macros">
            {[
              ['Calories', avg.calories, 'kcal', limits.calories],
              ['Sugar', avg.sugar, 'g', limits.sugar],
              ['Sodium', avg.sodium, 'mg', limits.sodium],
              ['Sat fat', avg.satFat, 'g', limits.satFat],
              ['Protein', avg.protein, 'g'],
              ['Fibre', avg.fibre, 'g'],
            ].map(([label, value, unit, lim]) => (
              <li key={label} className={lim && value > lim ? 'over' : ''}>
                <span>{label}</span>
                <strong>{value}<em>{unit}</em></strong>
                {lim ? <small>ceiling {Math.round(lim)}</small> : <small>no ceiling set</small>}
              </li>
            ))}
          </ul>
          {(avg.protein === 0 && avg.fibre === 0) && (
            <p className="trend-legend">
              <Flame size={13} /> Protein and fibre stay at zero until you log meals through
              the photo estimator or the dish builder — packaged labels in the catalog rarely
              publish either.
            </p>
          )}
        </section>
      )}
    </main>
  )
}
