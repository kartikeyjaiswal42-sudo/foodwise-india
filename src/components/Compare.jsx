'use client'
import { useMemo, useState } from 'react'
import {
  GitCompareArrows, Search, X, Plus, Trophy, ArrowRight, Ban, ShieldCheck, Info,
} from 'lucide-react'
import { products } from '../data/foodDatabase'
import { scanProduct, ORGAN_SYSTEMS, TOX_BANDS, RISK_META } from '../lib/toxicity'
import { VERDICT_META } from '../lib/ingredientClassify'
import { avoidHits } from '../lib/avoidList'
import ProductPack from './ProductPack'

const MAX = 3

const NUTRIENTS = [
  { key: 'calories', label: 'Energy', unit: ' kcal', lowerBetter: true, from: 'calories' },
  { key: 'sugar', label: 'Sugar', unit: ' g', lowerBetter: true },
  { key: 'sodium', label: 'Sodium', unit: ' mg', lowerBetter: true },
  { key: 'satFat', label: 'Saturated fat', unit: ' g', lowerBetter: true },
]

export default function Compare({ onOpen, onAdd, avoid = [] }) {
  const [picked, setPicked] = useState([])
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q.length < 2) return []
    return products
      .filter((p) => !picked.includes(p.id))
      .filter((p) => `${p.name} ${p.brand} ${p.company} ${p.category}`.toLowerCase().includes(q))
      .slice(0, 8)
  }, [query, picked])

  const chosen = useMemo(
    () => picked.map((id) => products.find((p) => p.id === id)).filter(Boolean),
    [picked]
  )
  const scans = useMemo(() => chosen.map((p) => scanProduct(p)), [chosen])

  const add = (p) => {
    if (picked.length >= MAX) return
    setPicked([...picked, p.id])
    setQuery('')
  }
  const remove = (id) => setPicked(picked.filter((x) => x !== id))

  // Winner = lowest toxic load, tie-broken by the catalog's own health score.
  const winnerIdx = useMemo(() => {
    if (scans.length < 2) return -1
    let best = 0
    scans.forEach((s, i) => {
      if (s.toxIndex < scans[best].toxIndex) best = i
      // `null > null` is false and `null > 60` is false, so an unrated product can
      // never win a tie-break it has no evidence for.
      else if (s.toxIndex === scans[best].toxIndex && (s.product.score ?? -1) > (scans[best].product.score ?? -1)) best = i
    })
    return best
  }, [scans])

  // Union of every organ any of the products touches, so rows line up.
  const organRows = useMemo(() => {
    const keys = new Set()
    scans.forEach((s) => Object.keys(s.organs).forEach((k) => s.organs[k] > 0 && keys.add(k)))
    return [...keys].sort(
      (a, b) =>
        Math.max(...scans.map((s) => s.organs[b] || 0)) - Math.max(...scans.map((s) => s.organs[a] || 0))
    )
  }, [scans])

  const bestOf = (key) => {
    const vals = chosen.map((p) => (key === 'calories' ? p.calories : p.nutrients?.[key]) ?? Infinity)
    return vals.indexOf(Math.min(...vals))
  }

  return (
    <main className="compare-view">
      <section className="compare-hero">
        <div className="compare-hero-icon"><GitCompareArrows size={32} /></div>
        <div>
          <span className="eyebrow">Shelf showdown</span>
          <h1>Compare up to {MAX} products, ingredient by ingredient</h1>
          <p>Standing in the aisle with two packs in hand? Put them side by side — nutrition, toxic load, every declared additive, and which organs each one loads.</p>
        </div>
      </section>

      <section className="panel compare-picker">
        <div className="compare-slots">
          {Array.from({ length: MAX }).map((_, i) => {
            const p = chosen[i]
            if (!p) {
              return (
                <div key={i} className="compare-slot empty">
                  <Plus size={22} />
                  <span>Slot {i + 1}</span>
                  <small>Search below to add</small>
                </div>
              )
            }
            return (
              <div key={p.id} className="compare-slot filled">
                <button className="compare-slot-remove" onClick={() => remove(p.id)} aria-label={`Remove ${p.name}`}>
                  <X size={14} />
                </button>
                <ProductPack product={p} compact />
                <strong>{p.name}</strong>
                <small>{p.brand}</small>
              </div>
            )
          })}
        </div>

        {picked.length < MAX && (
          <>
            <label className="search-field" style={{ marginTop: 14 }}>
              <Search size={18} />
              <input value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Search a product to add — name, brand or company" />
              {query && <button className="icon-button" onClick={() => setQuery('')}><X size={15} /></button>}
            </label>
            {results.length > 0 && (
              <div className="compare-results animated-fade-in">
                {results.map((p) => (
                  <button key={p.id} className="compare-result-row" onClick={() => add(p)}>
                    <img src={p.image} alt="" loading="lazy" />
                    <div>
                      <strong>{p.name}</strong>
                      <small>{p.brand} · {p.category}</small>
                    </div>
                    <span className={`grade-pill g-${p.grade || 'none'}`}>{p.grade || '?'}</span>
                    <Plus size={16} />
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {chosen.length < 2 && (
        <section className="panel empty-state" style={{ padding: '44px 20px' }}>
          <GitCompareArrows size={30} />
          <h2>Pick at least two products</h2>
          <p>Add a second product above and the full comparison table appears — nutrition, additives, organ load and a verdict.</p>
        </section>
      )}

      {chosen.length >= 2 && (
        <>
          {/* verdict banner */}
          {winnerIdx >= 0 && (
            <section className="compare-verdict">
              <Trophy size={24} />
              <div>
                <strong>{chosen[winnerIdx].name} is the better pick</strong>
                <p>
                  Lowest toxic load at <strong>{scans[winnerIdx].toxIndex}/100</strong> versus{' '}
                  {scans.filter((_, i) => i !== winnerIdx).map((s) => `${s.toxIndex}`).join(' and ')} —{' '}
                  {scans[winnerIdx].additives.length} declared additive{scans[winnerIdx].additives.length !== 1 ? 's' : ''} and{' '}
                  {scans[winnerIdx].systemsHit} body system{scans[winnerIdx].systemsHit !== 1 ? 's' : ''} affected.
                </p>
              </div>
              <button className="secondary-button" onClick={() => onOpen?.(chosen[winnerIdx])}>
                Open <ArrowRight size={15} />
              </button>
            </section>
          )}

          {/* headline table */}
          <section className="panel compare-table-panel">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Head to head</span>
                <h2>The numbers</h2>
              </div>
            </div>
            <div className="compare-table" style={{ '--cols': chosen.length }}>
              <div className="compare-row head">
                <span />
                {chosen.map((p, i) => (
                  <div key={p.id} className={i === winnerIdx ? 'win' : ''}>
                    <strong>{p.name}</strong>
                    <small>{p.brand} · {p.size}</small>
                  </div>
                ))}
              </div>

              <div className="compare-row">
                <span>Toxic load</span>
                {scans.map((s, i) => (
                  <div key={i} className={i === winnerIdx ? 'win' : ''}>
                    <b style={{ color: TOX_BANDS[s.band].color }}>{s.toxIndex}<i>/100</i></b>
                    <small>{TOX_BANDS[s.band].label}</small>
                  </div>
                ))}
              </div>

              <div className="compare-row">
                <span>Jaano score</span>
                {chosen.map((p, i) => (
                  <div key={i}>
                    <b>{p.score}</b>
                    <small>grade {p.grade}</small>
                  </div>
                ))}
              </div>

              {NUTRIENTS.map((n) => {
                const best = bestOf(n.key)
                return (
                  <div className="compare-row" key={n.key}>
                    <span>{n.label} <i>/100 g</i></span>
                    {chosen.map((p, i) => {
                      const v = n.key === 'calories' ? p.calories : p.nutrients?.[n.key]
                      return (
                        <div key={i} className={i === best ? 'best' : ''}>
                          <b>{v ?? '—'}{v != null ? n.unit : ''}</b>
                          {i === best && <small>lowest</small>}
                        </div>
                      )
                    })}
                  </div>
                )
              })}

              <div className="compare-row">
                <span>Price</span>
                {chosen.map((p, i) => <div key={i}><b>₹{p.price}</b><small>est.</small></div>)}
              </div>

              <div className="compare-row">
                <span>Declared additives</span>
                {scans.map((s, i) => (
                  <div key={i}>
                    <b>{s.additives.length}</b>
                    <small>{s.riskyAdditives.length} flagged</small>
                  </div>
                ))}
              </div>

              <div className="compare-row">
                <span>Ingredient quality</span>
                {scans.map((s, i) => (
                  <div key={i}>
                    <div className="compare-tally">
                      <span className="good">{s.counts.good}</span>
                      <span className="neutral">{s.counts.neutral}</span>
                      <span className="bad">{s.counts.bad}</span>
                    </div>
                    <small>good · neutral · watch</small>
                  </div>
                ))}
              </div>

              {avoid.length > 0 && (
                <div className="compare-row">
                  <span>On your avoid list</span>
                  {chosen.map((p, i) => {
                    const hits = avoidHits(p, avoid)
                    return (
                      <div key={i} className={hits.length ? 'alert' : ''}>
                        <b>{hits.length ? `${hits.length} hit${hits.length !== 1 ? 's' : ''}` : 'Clear'}</b>
                        <small>{hits.map((h) => h.rule.label).join(', ') || 'nothing flagged'}</small>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </section>

          {/* organ load */}
          {organRows.length > 0 && (
            <section className="panel">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">Body impact</span>
                  <h2>Which organs each one loads</h2>
                </div>
              </div>
              <div className="compare-organ-table" style={{ '--cols': chosen.length }}>
                {organRows.map((key) => {
                  const sys = ORGAN_SYSTEMS[key]
                  const max = Math.max(1, ...scans.map((s) => s.organs[key] || 0))
                  return (
                    <div className="compare-organ-row" key={key}>
                      <span className="compare-organ-name">{sys.emoji} {sys.label}</span>
                      {scans.map((s, i) => {
                        const v = s.organs[key] || 0
                        return (
                          <div key={i} className="compare-organ-cell">
                            <div className="compare-organ-bar">
                              <span style={{ width: `${(v / max) * 100}%`, background: sys.color }} />
                            </div>
                            <small>{v > 0 ? Math.round(v) : '—'}</small>
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* ingredient lists, side by side */}
          <section className="panel">
            <div className="section-heading">
              <div>
                <span className="eyebrow">The labels themselves</span>
                <h2>Full ingredient lists, side by side</h2>
              </div>
              <span className="helper-click-badge">Colour = good / neutral / watch out</span>
            </div>
            <div className="compare-ing-grid" style={{ '--cols': chosen.length }}>
              {scans.map((s, i) => (
                <div key={i} className="compare-ing-col">
                  <div className="compare-ing-head">
                    <ProductPack product={s.product} compact />
                    <div>
                      <strong>{s.product.name}</strong>
                      <small>{s.lines.length} ingredient{s.lines.length !== 1 ? 's' : ''}</small>
                    </div>
                  </div>
                  <ol className="compare-ing-list">
                    {s.lines.map((l, j) => (
                      <li key={j} className={`v-${l.verdict}`} style={{ '--v': VERDICT_META[l.verdict].color }}>
                        <span>{l.raw}</span>
                        {l.additives.map((a) => (
                          <i key={a.code} title={`${a.name} — ${(RISK_META[a.risk] || RISK_META.none).label}`}>{a.code}</i>
                        ))}
                      </li>
                    ))}
                    {s.lines.length === 0 && <li className="v-neutral"><span>No ingredient list declared</span></li>}
                  </ol>
                  <div className="compare-ing-foot">
                    <button className="secondary-button" onClick={() => onOpen?.(s.product)}>Full analysis</button>
                    <button className="icon-button add" onClick={() => onAdd?.(s.product)} aria-label={`Add ${s.product.name}`}>
                      <Plus size={17} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* what one has that the other doesn't */}
          <section className="panel">
            <div className="section-heading">
              <div>
                <span className="eyebrow">The difference</span>
                <h2>Additives unique to each pack</h2>
              </div>
            </div>
            <div className="compare-diff-grid" style={{ '--cols': chosen.length }}>
              {scans.map((s, i) => {
                const others = new Set(scans.filter((_, j) => j !== i).flatMap((o) => o.additives.map((a) => a.code)))
                const unique = s.additives.filter((a) => !others.has(a.code))
                return (
                  <div key={i} className="compare-diff-col">
                    <strong>{s.product.name}</strong>
                    {unique.length === 0 ? (
                      <p className="tox-safe-note"><ShieldCheck size={14} /> Nothing the others don’t also have.</p>
                    ) : (
                      unique.map((a) => (
                        <div key={a.code} className="compare-diff-item" style={{ '--risk': (RISK_META[a.risk] || RISK_META.none).color }}>
                          <span className="tox-code-badge">{a.code}</span>
                          <div>
                            <strong>{a.name}</strong>
                            <small>{a.cls}</small>
                          </div>
                          {/\bBANNED\b|Banned/.test(a.law || '') && <span className="tox-ban-tag"><Ban size={10} /></span>}
                        </div>
                      ))
                    )}
                  </div>
                )
              })}
            </div>
          </section>

          <p className="label-note">
            <Info size={14} /> Nutrition figures are per 100 g as declared to Open Food Facts, so the columns are directly comparable regardless of pack size.
          </p>
        </>
      )}
    </main>
  )
}
