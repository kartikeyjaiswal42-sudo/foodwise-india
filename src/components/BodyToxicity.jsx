'use client'
import { useMemo, useState } from 'react'
import { Activity, Search, AlertTriangle, ShieldCheck, ArrowLeft, Skull, FlaskConical, X } from 'lucide-react'
import { products } from '../data/foodDatabase'
import {
  ORGAN_SYSTEMS, ingredientsDb, ingredientsForOrgan, organLoadIndex, findIngredient,
} from '../data/ingredientsDb'

const RISK_META = {
  high:   { label: 'High harm',     color: '#ef4444', dot: '🔴' },
  medium: { label: 'Moderate harm', color: '#f59e0b', dot: '🟠' },
  low:    { label: 'Low / benign',  color: '#10b981', dot: '🟢' },
}

export default function BodyToxicity({ onOpen }) {
  const [activeOrgan, setActiveOrgan] = useState(null)   // organ key | null
  const [openEntry, setOpenEntry] = useState(null)        // encyclopedia entry | null
  const [query, setQuery] = useState('')

  const load = useMemo(() => organLoadIndex(), [])

  // How many real catalog products expose each body system (memoised, cached).
  const { organExposure, totalAudited } = useMemo(() => {
    const cache = new Map()
    const match = (str) => {
      if (cache.has(str)) return cache.get(str)
      const e = findIngredient(str)
      cache.set(str, e)
      return e
    }
    const exposure = {}
    for (const k of Object.keys(ORGAN_SYSTEMS)) exposure[k] = { count: 0, sample: [] }
    for (const p of products) {
      const organs = new Set()
      for (const ing of p.ingredients || []) {
        const e = match(ing)
        if (e && e.risk !== 'low') (e.organs || []).forEach((o) => organs.add(o))
      }
      organs.forEach((o) => {
        if (!exposure[o]) return
        exposure[o].count += 1
        if (exposure[o].sample.length < 4) exposure[o].sample.push(p)
      })
    }
    return { organExposure: exposure, totalAudited: products.length }
  }, [])

  // Reverse lookup: type an ingredient → which systems does it hit?
  const lookup = useMemo(() => {
    const q = query.trim()
    if (q.length < 2) return null
    return findIngredient(q)
  }, [query])

  const totalHazards = Object.keys(ingredientsDb).filter((k) => ingredientsDb[k].risk !== 'low').length

  // ---------- DETAIL: one body system ----------
  if (activeOrgan) {
    const sys = ORGAN_SYSTEMS[activeOrgan]
    const list = ingredientsForOrgan(activeOrgan)
    return (
      <main className="tox-view">
        <button className="text-button back" onClick={() => setActiveOrgan(null)}>
          <ArrowLeft size={17} /> All body systems
        </button>

        <section className="tox-organ-hero" style={{ '--organ': sys.color }}>
          <div className="tox-organ-emoji">{sys.emoji}</div>
          <div>
            <span className="eyebrow">Toxicity diagnostic</span>
            <h1>{sys.label}</h1>
            <p>{sys.blurb}</p>
            <div className="tox-organ-stats">
              <span><strong>{list.length}</strong> known harmful ingredients</span>
              <span><strong>{organExposure[activeOrgan]?.count ?? 0}</strong> products in our catalog expose it</span>
            </div>
          </div>
        </section>

        <section className="tox-entry-list">
          {list.map((e) => {
            const rm = RISK_META[e.risk]
            return (
              <article key={e.name} className="tox-entry" style={{ '--risk': rm.color }}>
                <header onClick={() => setOpenEntry(openEntry?.name === e.name ? null : e)}>
                  <div className="tox-entry-title">
                    <span className="tox-risk-chip" style={{ background: rm.color }}>{rm.dot} {rm.label}</span>
                    <h3>{e.name}</h3>
                    <small>{e.class}</small>
                  </div>
                  <div className="tox-entry-organs">
                    {e.organs.map((o) => (
                      <span key={o} className="tox-mini-organ" title={ORGAN_SYSTEMS[o]?.label}>{ORGAN_SYSTEMS[o]?.emoji}</span>
                    ))}
                  </div>
                </header>
                {openEntry?.name === e.name && (
                  <div className="tox-entry-body animated-fade-in">
                    <p className="tox-mechanism"><FlaskConical size={14} /> <span>{e.issues}</span></p>
                    <div className="tox-entry-meta">
                      <div><strong>Hides in</strong><p>{e.sources}</p></div>
                      <div><strong>Legal status</strong><p>{e.regulatory}</p></div>
                      <div><strong>Clean swap</strong><p>{e.replacedBy}</p></div>
                    </div>
                    <div className="tox-entry-systems">
                      <strong>Damages:</strong>
                      {e.organs.map((o) => (
                        <button key={o} className="tox-system-tag" onClick={() => { setActiveOrgan(o); setOpenEntry(null) }}>
                          {ORGAN_SYSTEMS[o]?.emoji} {ORGAN_SYSTEMS[o]?.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            )
          })}
        </section>

        {organExposure[activeOrgan]?.sample.length > 0 && (
          <section className="panel tox-sample-products">
            <h2>Products in your catalog that load the {sys.label.toLowerCase()}</h2>
            <div className="tox-sample-grid">
              {organExposure[activeOrgan].sample.map((p) => (
                <button key={p.id} className="tox-sample-card" onClick={() => onOpen?.(p)}>
                  <img src={p.image} alt={p.name} loading="lazy" />
                  <div><strong>{p.name}</strong><small>{p.brand}</small></div>
                  <span className={`grade-pill g-${p.grade}`}>{p.grade}</span>
                </button>
              ))}
            </div>
          </section>
        )}
      </main>
    )
  }

  // ---------- OVERVIEW: full body map ----------
  const orderedSystems = Object.values(ORGAN_SYSTEMS)
  const maxLoad = Math.max(1, ...orderedSystems.map((s) => load[s.key].total))

  return (
    <main className="tox-view">
      <section className="tox-hero">
        <div className="tox-hero-icon"><Skull size={34} /></div>
        <div>
          <span className="eyebrow">Body Toxicity Diagnostic</span>
          <h1>What packaged-food chemicals do to your body</h1>
          <p>
            We map <strong>{totalHazards} harmful ingredients & additives</strong> onto
            <strong> {orderedSystems.length} body systems</strong>, then scan all{' '}
            <strong>{totalAudited.toLocaleString('en-IN')} products</strong> in the catalog to show where the damage lands.
            Tap any organ to see the exact ingredients and the biological mechanism.
          </p>
        </div>
      </section>

      {/* Reverse lookup */}
      <section className="panel tox-lookup">
        <label className="search-field">
          <Search size={18} />
          <input value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Type an ingredient or code — e.g. 'palm oil', 'INS 621', 'aspartame', 'maida'" />
          {query && <button className="icon-button" onClick={() => setQuery('')}><X size={15} /></button>}
        </label>
        {lookup && (
          <div className="tox-lookup-result animated-fade-in" style={{ '--risk': RISK_META[lookup.risk].color }}>
            <div className="tox-lookup-head">
              <span className="tox-risk-chip" style={{ background: RISK_META[lookup.risk].color }}>{RISK_META[lookup.risk].dot} {RISK_META[lookup.risk].label}</span>
              <h3>{lookup.name}</h3>
              <small>{lookup.class}</small>
            </div>
            <p className="tox-mechanism"><FlaskConical size={14} /> <span>{lookup.issues}</span></p>
            {lookup.organs.length > 0 ? (
              <div className="tox-entry-systems">
                <strong>Attacks:</strong>
                {lookup.organs.map((o) => (
                  <button key={o} className="tox-system-tag" onClick={() => setActiveOrgan(o)}>
                    {ORGAN_SYSTEMS[o]?.emoji} {ORGAN_SYSTEMS[o]?.label}
                  </button>
                ))}
              </div>
            ) : <p className="tox-safe-note"><ShieldCheck size={15} /> No major organ-level harm on record — treated as benign in normal amounts.</p>}
            <div className="tox-entry-meta">
              <div><strong>Hides in</strong><p>{lookup.sources}</p></div>
              <div><strong>Clean swap</strong><p>{lookup.replacedBy}</p></div>
            </div>
          </div>
        )}
        {query.trim().length >= 2 && !lookup && (
          <p className="label-note"><Search size={14} /> Not in the hazard registry yet — likely a benign or structural ingredient.</p>
        )}
      </section>

      {/* The body-systems chart */}
      <section className="section-heading" style={{ marginTop: 8 }}>
        <div>
          <span className="eyebrow">The diagnostic chart</span>
          <h2>15 body systems · ranked by toxic load</h2>
        </div>
        <span className="helper-click-badge">💡 Tap a system to diagnose it</span>
      </section>

      <div className="tox-grid">
        {orderedSystems
          .slice()
          .sort((a, b) => load[b.key].total - load[a.key].total)
          .map((sys) => {
            const l = load[sys.key]
            const top = ingredientsForOrgan(sys.key).slice(0, 3)
            const exposure = organExposure[sys.key]?.count ?? 0
            return (
              <button key={sys.key} className="tox-card" style={{ '--organ': sys.color }} onClick={() => setActiveOrgan(sys.key)}>
                <div className="tox-card-top">
                  <span className="tox-card-emoji">{sys.emoji}</span>
                  <div className="tox-card-title">
                    <h3>{sys.label}</h3>
                    <small>{sys.blurb}</small>
                  </div>
                </div>

                <div className="tox-load-bar" title={`${l.total} harmful ingredients`}>
                  <span className="seg high" style={{ width: `${(l.high / maxLoad) * 100}%` }} />
                  <span className="seg medium" style={{ width: `${(l.medium / maxLoad) * 100}%` }} />
                  <span className="seg low" style={{ width: `${(l.low / maxLoad) * 100}%` }} />
                </div>
                <div className="tox-load-legend">
                  <span><AlertTriangle size={11} /> {l.high} high</span>
                  <span>{l.medium} moderate</span>
                  <span className="tox-exposure"><Activity size={11} /> {exposure} products</span>
                </div>

                <div className="tox-card-offenders">
                  {top.map((e) => <span key={e.name} className="tox-offender">{e.name.replace(/\s*\(.*\)/, '')}</span>)}
                </div>
              </button>
            )
          })}
      </div>

      <section className="panel evidence-note" style={{ marginTop: 20 }}>
        <ShieldCheck size={24} />
        <div>
          <h2>How this diagnostic is built</h2>
          <p>Each ingredient is mapped to body systems using FSSAI additive regulations, WHO/JECFA &amp; EFSA safety re-evaluations, IARC cancer monographs, US FDA GRAS reviews and peer-reviewed toxicology. “Harm” means a documented mechanism at relevant exposures — it is educational and does not replace medical advice. Many additives are safe in small amounts; the risk is the cumulative load across a day of packaged food.</p>
        </div>
      </section>
    </main>
  )
}
