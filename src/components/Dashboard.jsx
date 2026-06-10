import { useMemo } from 'react'
import { Plus, HeartPulse, Zap, Sparkles, Home, ArrowRight, CheckCircle2, Leaf, Info, TriangleAlert } from 'lucide-react'
import { products } from '../data/foodDatabase'
import ProductPack from './ProductPack'

const dailyLimits = { sugar: 25, sodium: 2300, satFat: 20 }
const metricMeta = {
  sugar: { label: 'Added sugar', unit: 'g', color: '#df7b54', icon: Zap },
  sodium: { label: 'Sodium', unit: 'mg', color: '#7d88d9', icon: Sparkles },
  satFat: { label: 'Saturated fat', unit: 'g', color: '#c49143', icon: HeartPulse },
}

export default function Dashboard({ totals, log, onAdd, onOpen, onNavigate }) {
  // Overall daily balance rating based on nutritional watchpoints
  const overall = useMemo(() => {
    return Math.max(
      0,
      Math.round(
        100 -
          Object.keys(totals).reduce(
            (sum, metric) => sum + Math.max(0, (totals[metric] / dailyLimits[metric]) * 25),
            0
          )
      )
    )
  }, [totals])

  // Organ health warnings summary at a glance
  const organStatus = useMemo(() => {
    let aggregates = { maida: 0, palmOil: 0, carrageenan: 0, sugar: 0, sodium: 0 }
    log.forEach((item) => {
      if (item.productId === 'maggi') { aggregates.maida += 50 * item.servings; aggregates.palmOil += 10 * item.servings }
      else if (item.productId === 'lays') { aggregates.palmOil += 15 * item.servings }
      else if (item.productId === 'coke') { aggregates.sugar += 27.5 * item.servings }
      else if (item.productId === 'bourbon') { aggregates.maida += 25 * item.servings; aggregates.palmOil += 8 * item.servings }
      else if (item.productId === 'kool') { aggregates.carrageenan += 0.2 * item.servings }
      else if (item.productId === 'kurkure') { aggregates.palmOil += 24 * item.servings }
      else if (item.productId === 'knorr-soup') { aggregates.maida += 6 * item.servings; aggregates.palmOil += 1.5 * item.servings }
    })
    
    return {
      gutRisk: aggregates.carrageenan > 0 || aggregates.maida > 30 || aggregates.palmOil > 20,
      liverRisk: totals.sugar > dailyLimits.sugar || aggregates.sugar > 20,
      cardioRisk: totals.sodium > dailyLimits.sodium * 0.5 || aggregates.palmOil > 15
    }
  }, [log, totals])

  const recommendations = useMemo(() => {
    // Pick 3 healthy alternatives as upgrade recommendations
    return [
      products.find((p) => p.id === 'makhana'),
      products.find((p) => p.id === 'muesli'),
      products.find((p) => p.id === 'lassi')
    ].filter(Boolean)
  }, [])

  const ScoreBadge = ({ score, grade }) => {
    const tone = score >= 75 ? 'good' : score >= 50 ? 'fair' : 'poor'
    return (
      <div className={`score-badge ${tone}`}>
        <strong>{grade}</strong>
        <span>{score}</span>
      </div>
    )
  }

  const ProductCard = ({ product }) => {
    const topConcern = product.concerns[0]
    return (
      <article className="product-card">
        <button className="product-main" onClick={() => onOpen(product)} aria-label={`View ${product.name}`}>
          <div className="card-pack-wrap">
            <ProductPack product={product} />
            <ScoreBadge score={product.score} grade={product.grade} />
          </div>
          <div className="product-copy">
            <span className="eyebrow">{product.company}</span>
            <h3>{product.name}</h3>
            <p>{product.brand} · {product.size}</p>
            {topConcern && (
              <div className={`concern-pill ${topConcern.level}`}>
                {topConcern.level === 'high' ? <TriangleAlert size={13} /> : <Info size={13} />}
                {topConcern.name}
              </div>
            )}
          </div>
        </button>
        <div className="product-footer">
          <div>
            <strong>₹{product.price}</strong>
            <span>est. retail</span>
          </div>
          <button className="icon-button add" onClick={() => onAdd(product)} aria-label={`Add ${product.name}`}>
            <Plus size={18} />
          </button>
        </div>
      </article>
    )
  }

  const MetricRing = ({ metric, value }) => {
    const meta = metricMeta[metric]
    const percent = Math.min(100, Math.round((value / dailyLimits[metric]) * 100))
    return (
      <div className="metric-card">
        <div className="metric-ring" style={{ '--percent': `${percent * 3.6}deg`, '--ring': meta.color }}>
          <div>
            <strong>{percent}%</strong>
            <span>of limit</span>
          </div>
        </div>
        <div className="metric-copy">
          <span>{meta.label}</span>
          <strong>{value.toFixed(value % 1 === 0 ? 0 : 1)}{meta.unit}</strong>
          <small>limit: {dailyLimits[metric]}{meta.unit}</small>
        </div>
      </div>
    )
  }

  return (
    <main className="dashboard-view">
      <section className="welcome-row">
        <div>
          <span className="eyebrow">Clarity over packaging</span>
          <h1>Welcome back, Kartikey</h1>
          <p>Here is your biological exposure analysis for today.</p>
        </div>
        <button className="primary-button" onClick={() => onAdd(null)}>
          <Plus size={18} /> Log food item
        </button>
      </section>

      <section className="hero-card">
        <div className="hero-score">
          <div className="wellness-ring" style={{ '--wellness': `${overall * 3.6}deg` }}>
            <div>
              <strong>{overall}</strong>
              <span>Clean Score</span>
            </div>
          </div>
          <div className="hero-score-meta">
            <span className="status-chip">
              <CheckCircle2 size={14} /> {overall >= 75 ? 'Optimal Balance' : overall >= 50 ? 'Moderate Alert' : 'High Processing Strain'}
            </span>
            <h2>{overall >= 75 ? 'Your cells are thriving' : overall >= 50 ? 'Noticeable additive clearance load' : 'Critical toxicity threshold reached'}</h2>
            <p>
              {overall >= 75 
                ? 'Your dietary entries consist mostly of clean ingredients. The liver and kidneys are clearing residues with ease.' 
                : 'Processed fats and sodium are accumulating. A few clean dietary choices will restore your physiological baseline.'}
            </p>
            <button className="text-button text-light" onClick={() => onNavigate('diary')}>
              Open full diary analysis <ArrowRight size={16} />
            </button>
          </div>
        </div>
        <div className="hero-tip">
          <div className="tip-icon">
            <Leaf size={20} />
          </div>
          <span>Metabolic tip</span>
          <strong>{organStatus.gutRisk ? 'Restore Gut Flora' : 'Hydration Focus'}</strong>
          <p>
            {organStatus.gutRisk 
              ? 'You have consumed processed gluten or emulsifiers. Drink warm water and eat prebiotic fiber.' 
              : 'Add fresh lemon water to flush renal sodium load and reduce cellular acid stress.'}
          </p>
        </div>
      </section>

      {/* Embedded Organ Health Quick Card */}
      <section className="panel quick-organ-panel" style={{ marginTop: '24px' }}>
        <div className="section-heading">
          <div>
            <span className="eyebrow">Organ stress levels</span>
            <h2>Physiological Baseline Summary</h2>
          </div>
          <button className="text-button" onClick={() => onNavigate('diary')}>
            See detailed toxicity diagnostics <ArrowRight size={15} />
          </button>
        </div>
        <div className="quick-organ-grid">
          <div className={`quick-organ-item ${organStatus.gutRisk ? 'warning' : 'safe'}`}>
            <strong>Gut Lining</strong>
            <span>{organStatus.gutRisk ? '🚨 High Inflammation Risk' : '🟢 Optimal Mucosal State'}</span>
          </div>
          <div className={`quick-organ-item ${organStatus.liverRisk ? 'warning' : 'safe'}`}>
            <strong>Metabolic/Liver</strong>
            <span>{organStatus.liverRisk ? '🚨 Lipogenesis Stress' : '🟢 Balanced Sugar Clearance'}</span>
          </div>
          <div className={`quick-organ-item ${organStatus.cardioRisk ? 'warning' : 'safe'}`}>
            <strong>Cardiovascular</strong>
            <span>{organStatus.cardioRisk ? '🚨 High Arterial Load' : '🟢 Healthy Endothelial Pressure'}</span>
          </div>
        </div>
      </section>

      <section className="metrics-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Pack watchpoints</span>
            <h2>Nutritional Accumulations</h2>
          </div>
          <button className="text-button" onClick={() => onNavigate('ingredients')}>
            Understand limits <ArrowRight size={15} />
          </button>
        </div>
        <div className="metric-grid">
          {Object.keys(metricMeta).map((metric) => (
            <MetricRing key={metric} metric={metric} value={totals[metric]} />
          ))}
        </div>
      </section>

      <section className="two-column">
        <article className="panel diary-preview">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Today</span>
              <h2>Eaten timeline</h2>
            </div>
            <button className="icon-button" onClick={() => onAdd(null)} aria-label="Add item">
              <Plus size={18} />
            </button>
          </div>
          <div className="log-list">
            {log.map((item, index) => {
              const product = products.find((p) => p.id === item.productId)
              if (!product) return null
              return (
                <button key={`${item.productId}-${index}`} onClick={() => onOpen(product)} className="log-list-row">
                  <ProductPack product={product} compact />
                  <span className="log-row-meta">
                    <strong>{product.name}</strong>
                    <small>{item.servings} serving{item.servings !== 1 ? 's' : ''} · {item.time}</small>
                  </span>
                  <span className="log-cal">
                    {Math.round(product.calories * item.servings)}
                    <small>kcal</small>
                  </span>
                </button>
              )
            })}
            {log.length === 0 && (
              <div className="empty-log-state">
                <p>No food logged today yet.</p>
              </div>
            )}
          </div>
          <button className="secondary-button wide" onClick={() => onNavigate('diary')}>
            Open food diary <ArrowRight size={16} />
          </button>
        </article>

        <article className="panel insight-card">
          <div className="insight-orb">
            <Sparkles size={25} />
          </div>
          <span className="eyebrow">Shopping habits</span>
          <h2>Your labels are 24% cleaner</h2>
          <p>By avoiding products containing Palm Oil over the last 7 days, you saved your liver significant lipid filtration burden.</p>
          <div className="mini-chart">
            {[30, 45, 60, 40, 72, 85, 88].map((height, i) => (
              <span key={i} style={{ height: `${height}%` }} className={i === 6 ? 'active' : ''} />
            ))}
          </div>
          <div className="day-labels">
            <span>M</span>
            <span>T</span>
            <span>W</span>
            <span>T</span>
            <span>F</span>
            <span>S</span>
            <span>S</span>
          </div>
        </article>
      </section>

      <section className="recommend-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Recommended upgrades</span>
            <h2>Cleaner options for your next market trip</h2>
          </div>
          <button className="text-button" onClick={() => onNavigate('explore')}>
            Search all foods <ArrowRight size={16} />
          </button>
        </div>
        <div className="product-grid compact-grid">
          {recommendations.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </main>
  )
}
