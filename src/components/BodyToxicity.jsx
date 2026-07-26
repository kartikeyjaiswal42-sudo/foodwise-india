'use client'
import { useMemo, useState } from 'react'
import {
  Activity, Search, AlertTriangle, ShieldCheck, ArrowLeft, Skull, FlaskConical, X,
  TrendingUp, Ban, ChevronDown, Beaker, ListOrdered, CalendarDays, Sparkles, Info,
} from 'lucide-react'
import { products } from '../data/foodDatabase'
import {
  ORGAN_SYSTEMS, ORGAN_ADVICE, RISK_META, TOX_BANDS,
  catalogToxicity, scanProduct, scanLine, scanIntake,
  fullOrganLoadIndex, hazardsForOrgan, additiveIndex, registryStats,
  ADDITIVE_FAMILIES,
} from '../lib/toxicity'
import BodyMap from './BodyMap'

const TABS = [
  { id: 'map', label: 'Body map', icon: Activity },
  { id: 'exposure', label: 'My exposure', icon: TrendingUp },
  { id: 'additives', label: 'Additive index', icon: Beaker },
  { id: 'ranking', label: 'Product ranking', icon: ListOrdered },
]

const riskMeta = (r) => RISK_META[r] || RISK_META.none

export default function BodyToxicity({ onOpen, log = [] }) {
  const [tab, setTab] = useState('map')
  const [activeOrgan, setActiveOrgan] = useState(null)
  const [openEntry, setOpenEntry] = useState(null)
  const [query, setQuery] = useState('')

  const stats = useMemo(() => registryStats(), [])
  const load = useMemo(() => fullOrganLoadIndex(), [])
  const catalog = useMemo(() => catalogToxicity(products), [])

  // Reverse lookup now spans BOTH registries (whole ingredients AND INS codes)
  const lookup = useMemo(() => {
    const q = query.trim()
    if (q.length < 2) return null
    const scan = scanLine(q)
    if (!scan || (!scan.rich && scan.additives.length === 0)) return null
    return scan
  }, [query])

  // ---------- DETAIL: one body system ----------
  if (activeOrgan) {
    const sys = ORGAN_SYSTEMS[activeOrgan]
    const hazards = hazardsForOrgan(activeOrgan)
    const exposure = catalog.exposure[activeOrgan]
    return (
      <main className="tox-view">
        <button className="text-button back" onClick={() => { setActiveOrgan(null); setOpenEntry(null) }}>
          <ArrowLeft size={17} /> All body systems
        </button>

        <section className="tox-organ-hero" style={{ '--organ': sys.color }}>
          <div className="tox-organ-emoji">{sys.emoji}</div>
          <div>
            <span className="eyebrow">Toxicity diagnostic</span>
            <h1>{sys.label}</h1>
            <p>{sys.blurb}</p>
            <div className="tox-organ-stats">
              <span><strong>{hazards.length}</strong> known hazards</span>
              <span><strong>{hazards.filter((h) => h.kind === 'additive').length}</strong> additive codes</span>
              <span><strong>{exposure?.count ?? 0}</strong> catalog products expose it</span>
            </div>
          </div>
        </section>

        <section className="panel tox-advice">
          <Sparkles size={20} />
          <div>
            <strong>How to lower the load on your {sys.label.toLowerCase()}</strong>
            <p>{ORGAN_ADVICE[activeOrgan]}</p>
          </div>
        </section>

        <div className="section-heading" style={{ marginTop: 6 }}>
          <div>
            <span className="eyebrow">Full hazard list</span>
            <h2>{hazards.length} ingredients &amp; additives that damage this system</h2>
          </div>
          <span className="helper-click-badge">💡 Tap any row for the mechanism</span>
        </div>

        <section className="tox-entry-list">
          {hazards.map((h) => {
            const rm = riskMeta(h.risk)
            const id = `${h.kind}-${h.code || h.name}`
            const isOpen = openEntry === id
            return (
              <article key={id} className="tox-entry" style={{ '--risk': rm.color }}>
                <header onClick={() => setOpenEntry(isOpen ? null : id)}>
                  <div className="tox-entry-title">
                    <span className="tox-risk-chip" style={{ background: rm.color }}>{rm.dot} {rm.label}</span>
                    <h3>
                      {h.code && <span className="tox-code">INS {h.code}</span>}
                      {h.name}
                    </h3>
                    <small>{h.cls}</small>
                  </div>
                  <div className="tox-entry-organs">
                    {h.organKeys.map((o) => (
                      <span key={o} className="tox-mini-organ" title={ORGAN_SYSTEMS[o]?.label}>{ORGAN_SYSTEMS[o]?.emoji}</span>
                    ))}
                  </div>
                </header>
                {isOpen && (
                  <div className="tox-entry-body animated-fade-in">
                    <p className="tox-mechanism"><FlaskConical size={14} /> <span>{h.harm}</span></p>
                    <div className="tox-entry-meta">
                      {h.symptoms && <div><strong>Early signs</strong><p>{h.symptoms}</p></div>}
                      {h.sources && <div><strong>Hides in</strong><p>{h.sources}</p></div>}
                      {h.adi && <div><strong>Safe daily intake</strong><p>{h.adi}</p></div>}
                      {h.law && <div><strong>Legal status</strong><p>{h.law}</p></div>}
                      {h.swap && <div><strong>Clean swap</strong><p>{h.swap}</p></div>}
                    </div>
                    <div className="tox-entry-systems">
                      <strong>Also damages:</strong>
                      {h.organKeys.filter((o) => o !== activeOrgan).map((o) => (
                        <button key={o} className="tox-system-tag" onClick={() => { setActiveOrgan(o); setOpenEntry(null) }}>
                          {ORGAN_SYSTEMS[o]?.emoji} {ORGAN_SYSTEMS[o]?.label}
                        </button>
                      ))}
                      {h.organKeys.length <= 1 && <span className="label-note" style={{ margin: 0 }}>This system only.</span>}
                    </div>
                  </div>
                )}
              </article>
            )
          })}
        </section>

        {exposure?.sample?.length > 0 && (
          <section className="panel tox-sample-products">
            <h2>Worst offenders in the catalog for the {sys.label.toLowerCase()}</h2>
            <div className="tox-sample-grid">
              {exposure.sample.map((p) => (
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

  // ---------- OVERVIEW ----------
  return (
    <main className="tox-view">
      <section className="tox-hero">
        <div className="tox-hero-icon"><Skull size={34} /></div>
        <div>
          <span className="eyebrow">Body Toxicity Diagnostic</span>
          <h1>What packaged-food chemicals do to your body</h1>
          <p>
            We cross-reference <strong>{stats.additives} additive codes</strong> and{' '}
            <strong>{stats.ingredients} whole-ingredient hazards</strong> against{' '}
            <strong>{stats.systems} body systems</strong>, then scan all{' '}
            <strong>{catalog.total.toLocaleString('en-IN')} products</strong> in the catalog — and everything in your own food diary.
          </p>
          <div className="tox-hero-stats">
            <span><strong>{stats.highRisk}</strong> high-risk additives</span>
            <span><strong>{stats.bannedSomewhere}</strong> banned in at least one country</span>
            <span><strong>{catalog.ranked.filter((s) => s.band === 'severe').length}</strong> severe-load products found</span>
          </div>
        </div>
      </section>

      {/* Reverse lookup — works for names AND INS/E codes */}
      <section className="panel tox-lookup">
        <label className="search-field">
          <Search size={18} />
          <input value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Look up anything — 'palm oil', 'INS 621', 'E102', 'aspartame', 'maida', 'carrageenan'" />
          {query && <button className="icon-button" onClick={() => setQuery('')}><X size={15} /></button>}
        </label>
        {lookup && (() => {
          const rm = riskMeta(lookup.risk)
          const organs = Object.entries(lookup.organs).sort((a, b) => b[1] - a[1])
          return (
            <div className="tox-lookup-result animated-fade-in" style={{ '--risk': rm.color }}>
              <div className="tox-lookup-head">
                <span className="tox-risk-chip" style={{ background: rm.color }}>{rm.dot} {rm.label}</span>
                <h3>{lookup.rich?.name || lookup.additives[0]?.name}</h3>
                <small>{lookup.rich?.class || lookup.additives[0]?.cls}</small>
              </div>
              <p className="tox-mechanism"><FlaskConical size={14} /> <span>{lookup.harm}</span></p>

              {lookup.additives.length > 0 && (
                <div className="tox-additive-strip">
                  {lookup.additives.map((a) => (
                    <div key={a.code} className="tox-additive-mini" style={{ '--risk': riskMeta(a.risk).color }}>
                      <strong>INS {a.code}</strong>
                      <span>{a.name}</span>
                      <small>ADI {a.adi}</small>
                    </div>
                  ))}
                </div>
              )}

              {organs.length > 0 ? (
                <div className="tox-entry-systems">
                  <strong>Attacks:</strong>
                  {organs.map(([o]) => (
                    <button key={o} className="tox-system-tag" onClick={() => setActiveOrgan(o)}>
                      {ORGAN_SYSTEMS[o]?.emoji} {ORGAN_SYSTEMS[o]?.label}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="tox-safe-note"><ShieldCheck size={15} /> No major organ-level harm on record — treated as benign in normal amounts.</p>
              )}

              <div className="tox-entry-meta">
                {lookup.rich?.sources && <div><strong>Hides in</strong><p>{lookup.rich.sources}</p></div>}
                {lookup.additives[0]?.law && <div><strong>Legal status</strong><p>{lookup.additives[0].law}</p></div>}
                {lookup.rich?.replacedBy && <div><strong>Clean swap</strong><p>{lookup.rich.replacedBy}</p></div>}
              </div>
            </div>
          )
        })()}
        {query.trim().length >= 2 && !lookup && (
          <p className="label-note"><Search size={14} /> Not in either registry — likely a benign or structural ingredient.</p>
        )}
      </section>

      <div className="tox-tabs">
        {TABS.map((t) => {
          const Icon = t.icon
          return (
            <button key={t.id} className={tab === t.id ? 'active' : ''} onClick={() => setTab(t.id)}>
              <Icon size={16} /> {t.label}
            </button>
          )
        })}
      </div>

      {tab === 'map' && <MapTab load={load} catalog={catalog} onPick={setActiveOrgan} />}
      {tab === 'exposure' && <ExposureTab log={log} onPick={setActiveOrgan} onOpen={onOpen} />}
      {tab === 'additives' && <AdditiveTab onPick={setActiveOrgan} />}
      {tab === 'ranking' && <RankingTab catalog={catalog} onOpen={onOpen} />}

      <section className="panel evidence-note" style={{ marginTop: 20 }}>
        <ShieldCheck size={24} />
        <div>
          <h2>How this diagnostic is built</h2>
          <p>Every ingredient and INS/E code is mapped to body systems using FSSAI additive regulations, WHO/JECFA &amp; EFSA safety re-evaluations, IARC cancer monographs, US FDA GRAS reviews and peer-reviewed toxicology. “Harm” means a documented mechanism at relevant exposures — this is educational and does not replace medical advice. Ingredient lists are printed in descending order of quantity, so items near the front are weighted more heavily. Many additives are safe in small amounts; the real risk is the cumulative load across a day of packaged food.</p>
        </div>
      </section>
    </main>
  )
}

/* ============================== TAB: BODY MAP ============================== */
function MapTab({ load, catalog, onPick }) {
  const systems = Object.values(ORGAN_SYSTEMS)
  const maxLoad = Math.max(1, ...systems.map((s) => load[s.key].total))
  const maxExposure = Math.max(1, ...systems.map((s) => catalog.exposure[s.key]?.count || 0))

  return (
    <>
      <BodyMap
        intensity={Object.fromEntries(systems.map((s) => [s.key, (catalog.exposure[s.key]?.count || 0) / maxExposure]))}
        onPick={onPick}
        caption={`Hotspots sized by how many of the ${catalog.total.toLocaleString('en-IN')} catalog products load each system.`}
      />

      <div className="section-heading" style={{ marginTop: 22 }}>
        <div>
          <span className="eyebrow">The diagnostic chart</span>
          <h2>{systems.length} body systems · ranked by toxic load</h2>
        </div>
        <span className="helper-click-badge">💡 Tap a system to diagnose it</span>
      </div>

      <div className="tox-grid">
        {systems
          .slice()
          .sort((a, b) => load[b.key].total - load[a.key].total)
          .map((sys) => {
            const l = load[sys.key]
            const top = hazardsForOrgan(sys.key).slice(0, 3)
            const exposure = catalog.exposure[sys.key]?.count ?? 0
            return (
              <button key={sys.key} className="tox-card" style={{ '--organ': sys.color }} onClick={() => onPick(sys.key)}>
                <div className="tox-card-top">
                  <span className="tox-card-emoji">{sys.emoji}</span>
                  <div className="tox-card-title">
                    <h3>{sys.label}</h3>
                    <small>{sys.blurb}</small>
                  </div>
                </div>

                <div className="tox-load-bar" title={`${l.total} hazards`}>
                  <span className="seg high" style={{ width: `${(l.high / maxLoad) * 100}%` }} />
                  <span className="seg medium" style={{ width: `${(l.moderate / maxLoad) * 100}%` }} />
                  <span className="seg low" style={{ width: `${(l.low / maxLoad) * 100}%` }} />
                </div>
                <div className="tox-load-legend">
                  <span><AlertTriangle size={11} /> {l.high} high</span>
                  <span>{l.moderate} moderate</span>
                  <span className="tox-exposure"><Activity size={11} /> {exposure} products</span>
                </div>

                <div className="tox-card-offenders">
                  {top.map((e) => (
                    <span key={e.code || e.name} className="tox-offender">
                      {e.name.replace(/\s*\(.*\)/, '')}
                    </span>
                  ))}
                </div>
              </button>
            )
          })}
      </div>
    </>
  )
}

/* ============================ TAB: MY EXPOSURE ============================ */
function ExposureTab({ log, onPick, onOpen }) {
  const [days, setDays] = useState(7)
  const intake = useMemo(() => scanIntake(log, products, days), [log, days])

  if (intake.entries.length === 0) {
    return (
      <section className="panel empty-state" style={{ padding: '46px 20px' }}>
        <CalendarDays size={32} />
        <h2>Nothing logged in the last {days} days</h2>
        <p>Add packaged foods to your food diary and this becomes a personal report: which of your organs took the biggest hit, from exactly which products and chemicals.</p>
      </section>
    )
  }

  const maxOrgan = Math.max(1, ...intake.topOrgans.map((o) => o.value))
  const loadBand = intake.dailyAvg >= 120 ? 'severe' : intake.dailyAvg >= 70 ? 'high' : intake.dailyAvg >= 30 ? 'moderate' : 'clean'
  const band = TOX_BANDS[loadBand]

  return (
    <>
      <div className="tox-window-switch">
        {[7, 30].map((d) => (
          <button key={d} className={days === d ? 'active' : ''} onClick={() => setDays(d)}>Last {d} days</button>
        ))}
      </div>

      <section className="tox-exposure-summary" style={{ '--band': band.color }}>
        <div className="tox-exposure-score">
          <strong>{intake.dailyAvg}</strong>
          <span>avg daily<br />toxic load</span>
        </div>
        <div>
          <span className="tox-risk-chip" style={{ background: band.color }}>{band.label}</span>
          <h2>You logged {intake.entries.length} item{intake.entries.length !== 1 ? 's' : ''} across {intake.daysLogged} day{intake.daysLogged !== 1 ? 's' : ''}</h2>
          <p>{band.note} Your cumulative load over this window is <strong>{intake.totalLoad}</strong> points across{' '}
            <strong>{intake.topOrgans.length}</strong> body systems.</p>
        </div>
      </section>

      <BodyMap
        intensity={Object.fromEntries(intake.topOrgans.map((o) => [o.key, o.value / maxOrgan]))}
        onPick={onPick}
        caption="Hotspots sized by YOUR actual intake over this window."
      />

      <section className="panel" style={{ marginTop: 18 }}>
        <div className="section-heading">
          <div>
            <span className="eyebrow">Where the damage landed</span>
            <h2>Your organ load, ranked</h2>
          </div>
        </div>
        <div className="tox-organ-bars">
          {intake.topOrgans.map((o) => (
            <div key={o.key} className="tox-organ-bar-row">
              <button className="tox-organ-bar-name" onClick={() => onPick(o.key)}>
                <span>{o.system.emoji}</span> {o.system.label}
              </button>
              <div className="tox-organ-bar">
                <span style={{ width: `${(o.value / maxOrgan) * 100}%`, background: o.system.color }} />
              </div>
              <strong>{Math.round(o.value)}</strong>
            </div>
          ))}
        </div>
        {intake.topOrgans[0] && (
          <div className="tox-advice inline">
            <Sparkles size={18} />
            <div>
              <strong>Priority: your {intake.topOrgans[0].system.label.toLowerCase()}</strong>
              <p>{intake.topOrgans[0].advice}</p>
            </div>
          </div>
        )}
      </section>

      <div className="tox-two-col">
        <section className="panel">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Biggest contributors</span>
              <h2>Products that loaded you most</h2>
            </div>
          </div>
          <div className="tox-rank-list">
            {intake.topProducts.slice(0, 8).map(({ product, scan, servings, load }) => (
              <button key={product.id} className="tox-rank-row" onClick={() => onOpen?.(product)}>
                <span className="tox-rank-index" style={{ background: TOX_BANDS[scan.band].color }}>{scan.toxIndex}</span>
                <div>
                  <strong>{product.name}</strong>
                  <small>{product.brand} · {servings} serving{servings !== 1 ? 's' : ''} · {scan.additives.length} additive{scan.additives.length !== 1 ? 's' : ''}</small>
                </div>
                <span className="tox-rank-load">{Math.round(load)}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Chemicals you actually ate</span>
              <h2>Your additive exposure</h2>
            </div>
          </div>
          {intake.topAdditives.length === 0 ? (
            <p className="tox-safe-note"><ShieldCheck size={15} /> No declared INS/E additives in anything you logged. That is a genuinely clean window.</p>
          ) : (
            <div className="tox-additive-list">
              {intake.topAdditives.slice(0, 10).map((a) => (
                <div key={a.code} className="tox-additive-row" style={{ '--risk': riskMeta(a.risk).color }}>
                  <span className="tox-code-badge">{a.code}</span>
                  <div>
                    <strong>{a.name}</strong>
                    <small>{a.cls}</small>
                    <p>{a.harm}</p>
                  </div>
                  <span className="tox-times">×{a.times}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {intake.topIngredients.length > 0 && (
        <section className="panel" style={{ marginTop: 18 }}>
          <div className="section-heading">
            <div>
              <span className="eyebrow">Repeat offenders</span>
              <h2>Watch-out ingredients you ate most often</h2>
            </div>
          </div>
          <div className="tox-offender-grid">
            {intake.topIngredients.slice(0, 9).map((h) => (
              <div key={h.key} className="tox-offender-card">
                <div className="tox-offender-head">
                  <strong>{h.key}</strong>
                  <span>×{h.times}</span>
                </div>
                <p>{h.line.harm}</p>
                <small>In: {h.products.slice(0, 3).join(', ')}{h.products.length > 3 ? ` +${h.products.length - 3} more` : ''}</small>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  )
}

/* =========================== TAB: ADDITIVE INDEX =========================== */
function AdditiveTab({ onPick }) {
  const all = useMemo(() => additiveIndex(), [])
  const [q, setQ] = useState('')
  const [family, setFamily] = useState('all')
  const [risk, setRisk] = useState('all')
  const [bannedOnly, setBannedOnly] = useState(false)
  const [open, setOpen] = useState(null)

  const visible = useMemo(() => {
    const term = q.trim().toLowerCase()
    return all.filter((a) => {
      if (family !== 'all' && a.family.key !== family) return false
      if (risk !== 'all' && a.risk !== risk) return false
      if (bannedOnly && !a.banned) return false
      if (term && !`${a.code} ${a.name} ${a.cls}`.toLowerCase().includes(term)) return false
      return true
    })
  }, [all, q, family, risk, bannedOnly])

  return (
    <>
      <div className="section-heading">
        <div>
          <span className="eyebrow">The full chemical registry</span>
          <h2>{all.length} food additives, decoded</h2>
        </div>
        <span className="helper-click-badge">💡 Tap a row for harm, symptoms, ADI &amp; law</span>
      </div>

      <div className="panel tox-additive-browser">
        <label className="search-field">
          <Search size={18} />
          <input value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search a code or name — '621', 'tartrazine', 'sulphite', 'carrageenan'" />
          {q && <button className="icon-button" onClick={() => setQ('')}><X size={15} /></button>}
        </label>

        <div className="tox-filter-row">
          <button className={family === 'all' ? 'active' : ''} onClick={() => setFamily('all')}>All classes</button>
          {ADDITIVE_FAMILIES.filter((f) => f.key !== 'other').map((f) => (
            <button key={f.key} className={family === f.key ? 'active' : ''} onClick={() => setFamily(f.key)}>
              {f.emoji} {f.label}
            </button>
          ))}
        </div>
        <div className="tox-filter-row">
          {['all', 'high', 'moderate', 'low', 'none'].map((r) => (
            <button key={r} className={risk === r ? 'active' : ''} onClick={() => setRisk(r)}>
              {r === 'all' ? 'Any risk' : `${riskMeta(r).dot} ${riskMeta(r).label}`}
            </button>
          ))}
          <button className={`ban-filter ${bannedOnly ? 'active' : ''}`} onClick={() => setBannedOnly(!bannedOnly)}>
            <Ban size={13} /> Banned somewhere
          </button>
        </div>

        <p className="label-note" style={{ marginTop: 4 }}>{visible.length} of {all.length} additives shown</p>

        <div className="tox-additive-index">
          {visible.map((a) => {
            const rm = riskMeta(a.risk)
            const isOpen = open === a.code
            return (
              <div key={a.code} className={`tox-idx-row ${isOpen ? 'open' : ''}`} style={{ '--risk': rm.color }}>
                <button className="tox-idx-head" onClick={() => setOpen(isOpen ? null : a.code)}>
                  <span className="tox-code-badge">{a.code}</span>
                  <div className="tox-idx-main">
                    <strong>{a.name}</strong>
                    <small>{a.cls}</small>
                  </div>
                  <div className="tox-idx-tags">
                    {a.banned && <span className="tox-ban-tag"><Ban size={11} /> Banned</span>}
                    <span className="tox-risk-chip sm" style={{ background: rm.color }}>{rm.label}</span>
                    <ChevronDown size={15} className="tox-chev" />
                  </div>
                </button>
                {isOpen && (
                  <div className="tox-idx-body animated-fade-in">
                    <p className="tox-mechanism"><FlaskConical size={14} /> <span>{a.harm}</span></p>
                    <div className="tox-entry-meta">
                      {a.symptoms && <div><strong>Early signs</strong><p>{a.symptoms}</p></div>}
                      <div><strong>Acceptable daily intake</strong><p>{a.adi}</p></div>
                      <div><strong>Legal status</strong><p>{a.law}</p></div>
                    </div>
                    {a.organKeys.length > 0 && (
                      <div className="tox-entry-systems">
                        <strong>Damages:</strong>
                        {a.organKeys.map((o) => ORGAN_SYSTEMS[o] && (
                          <button key={o} className="tox-system-tag" onClick={() => onPick(o)}>
                            {ORGAN_SYSTEMS[o].emoji} {ORGAN_SYSTEMS[o].label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
          {visible.length === 0 && (
            <div className="empty-state" style={{ padding: '34px 12px' }}>
              <Search size={28} />
              <h2>No additive matches</h2>
              <p>Try a bare number like “621”, or clear the class/risk filters.</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

/* =========================== TAB: PRODUCT RANKING =========================== */
function RankingTab({ catalog, onOpen }) {
  const [mode, setMode] = useState('worst')
  const [limit, setLimit] = useState(25)

  const list = useMemo(() => {
    const arr = mode === 'worst' ? catalog.ranked : catalog.ranked.slice().reverse()
    return arr.slice(0, limit)
  }, [catalog, mode, limit])

  return (
    <>
      <div className="section-heading">
        <div>
          <span className="eyebrow">Every product scored</span>
          <h2>{mode === 'worst' ? 'Highest toxic load in the catalog' : 'Cleanest labels in the catalog'}</h2>
        </div>
        <div className="tox-window-switch">
          <button className={mode === 'worst' ? 'active' : ''} onClick={() => setMode('worst')}>☠️ Worst</button>
          <button className={mode === 'best' ? 'active' : ''} onClick={() => setMode('best')}>🌿 Cleanest</button>
        </div>
      </div>

      <div className="tox-product-rank">
        {list.map((s, i) => {
          const band = TOX_BANDS[s.band]
          return (
            <button key={s.product.id} className="tox-prank-row" onClick={() => onOpen?.(s.product)} style={{ '--band': band.color }}>
              <span className="tox-prank-num">{i + 1}</span>
              <img src={s.product.image} alt={s.product.name} loading="lazy" />
              <div className="tox-prank-main">
                <strong>{s.product.name}</strong>
                <small>{s.product.brand} · {s.product.category}</small>
                <div className="tox-prank-tags">
                  {s.additives.length > 0 && <span>{s.additives.length} additive{s.additives.length !== 1 ? 's' : ''}</span>}
                  {s.hazards.length > 0 && <span>{s.hazards.length} flagged ingredient{s.hazards.length !== 1 ? 's' : ''}</span>}
                  <span>{s.systemsHit} system{s.systemsHit !== 1 ? 's' : ''} hit</span>
                </div>
                <div className="tox-prank-ing">
                  {(s.product.ingredients || []).slice(0, 4).join(' · ') || 'No ingredient list declared'}
                </div>
              </div>
              <div className="tox-prank-score">
                <strong>{s.toxIndex}</strong>
                <span>{band.label}</span>
                <div className="tox-prank-bar"><span style={{ width: `${s.toxIndex}%` }} /></div>
              </div>
            </button>
          )
        })}
      </div>

      {limit < catalog.ranked.length && (
        <button className="secondary-button wide" style={{ marginTop: 14 }} onClick={() => setLimit(limit + 25)}>
          Show 25 more
        </button>
      )}

      <p className="label-note" style={{ marginTop: 12 }}>
        <Info size={14} /> Toxic load = additive &amp; ingredient hazard density (0–60, weighted by position on the label) + nutrition penalty against the FSSAI/WHO per-100 g thresholds (0–40).
      </p>
    </>
  )
}
