import { useState, useMemo } from 'react'
import { Plus, ArrowLeft, ArrowRight, Trash2, ChevronRight, Info, Calendar } from 'lucide-react'
import { products } from '../data/foodDatabase'
import HealthReport from './HealthReport'
import { DEFAULT_LIMITS } from '../lib/health'
import { ingredientQuality } from '../lib/ingredientClassify'

const metricMeta = {
  calories: { label: 'Calories', unit: ' kcal', color: '#9c1b2e' },
  sugar: { label: 'Added sugar', unit: 'g', color: '#df7b54' },
  sodium: { label: 'Sodium', unit: 'mg', color: '#7d88d9' },
  satFat: { label: 'Saturated fat', unit: 'g', color: '#c49143' },
}

export default function Diary({ log = [], activeDate, setActiveDate, onAdd, onOpen, onDeleteLog, limits = DEFAULT_LIMITS }) {
  const dailyLimits = limits
  // Generate a dynamic list of 7 days around the activeDate
  const daysList = useMemo(() => {
    const days = []
    const currentDate = new Date(activeDate)
    
    // Start from 4 days ago up to 2 days ahead
    for (let i = -4; i <= 2; i++) {
      const targetDate = new Date(currentDate.getTime() + i * 24 * 60 * 60 * 1000)
      const dateString = targetDate.toISOString().split('T')[0]
      
      // Calculate daily balance score for that day to display on the strip
      const dayLogs = log.filter(item => item.date === dateString)
      let dayScore = null
      
      if (dayLogs.length > 0) {
        let daySugar = 0, daySodium = 0, daySatFat = 0
        dayLogs.forEach(item => {
          const prod = products.find(p => p.id === item.productId)
          if (prod) {
            daySugar += prod.nutrients.sugar * item.servings
            daySodium += prod.nutrients.sodium * item.servings
            daySatFat += prod.nutrients.satFat * item.servings
          }
        })
        
        dayScore = Math.max(0, Math.round(100 - (
          (daySugar / dailyLimits.sugar * 25) + 
          (daySodium / dailyLimits.sodium * 25) + 
          (daySatFat / dailyLimits.satFat * 25)
        )))
      }

      days.push({
        dateStr: dateString,
        dayName: targetDate.toLocaleDateString([], { weekday: 'short' }),
        dayNum: targetDate.getDate(),
        score: dayScore,
        isFuture: targetDate.getTime() > new Date().getTime() && dateString !== new Date().toISOString().split('T')[0]
      })
    }
    return days
  }, [activeDate, log])

  // Filter logs representing only the currently selected date
  const activeLogs = useMemo(() => {
    return log.filter(item => item.date === activeDate)
  }, [log, activeDate])

  // Calculate daily totals for the selected date
  const dailyTotals = useMemo(() => {
    let totals = { sugar: 0, sodium: 0, satFat: 0, calories: 0 }
    activeLogs.forEach(item => {
      const prod = products.find(p => p.id === item.productId)
      if (prod) {
        totals.sugar += prod.nutrients.sugar * item.servings
        totals.sodium += prod.nutrients.sodium * item.servings
        totals.satFat += prod.nutrients.satFat * item.servings
        totals.calories += prod.calories * item.servings
      }
    })
    return totals
  }, [activeLogs])

  // Good / neutral / bad ingredient tally across everything logged today
  const ingredientTally = useMemo(() => {
    const t = { good: 0, neutral: 0, bad: 0 }
    activeLogs.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId)
      if (!prod) return
      const q = ingredientQuality(prod)
      t.good += q.good; t.neutral += q.neutral; t.bad += q.bad
    })
    return t
  }, [activeLogs])
  const tallyTotal = ingredientTally.good + ingredientTally.neutral + ingredientTally.bad

  const ProductPack = ({ product, compact = false }) => {
    return (
      <div
        className={`product-pack ${compact ? 'compact' : ''}`}
        style={{ '--pack': product.color, '--ink': product.ink }}
      >
        <span className="pack-company">{product.brand}</span>
        <strong>{product.accent}</strong>
        <span className="pack-line" />
        <small>{product.category}</small>
      </div>
    )
  }

  const shiftDate = (daysShift) => {
    const d = new Date(activeDate)
    d.setDate(d.getDate() + daysShift)
    setActiveDate(d.toISOString().split('T')[0])
  }

  const formatDateLabel = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  }

  return (
    <main className="diary-view">
      <section className="welcome-row">
        <div>
          <span className="eyebrow">Your biological timeline</span>
          <h1>Food Diary Tracker</h1>
          <p>Switch between days to track accumulations, delete incorrect logs, and review biological clearance advisor tips.</p>
        </div>
        <button className="primary-button" onClick={() => onAdd(null)}>
          <Plus size={18} /> Log food
        </button>
      </section>

      {/* 7-day Date selector strip */}
      <section className="week-strip">
        <button className="icon-button" onClick={() => shiftDate(-1)} aria-label="Previous day">
          <ArrowLeft size={17} />
        </button>
        {daysList.map((day) => (
          <button
            key={day.dateStr}
            className={`${activeDate === day.dateStr ? 'active' : ''} ${day.isFuture ? 'future' : ''}`}
            onClick={() => !day.isFuture && setActiveDate(day.dateStr)}
            disabled={day.isFuture}
          >
            <span>{day.dayName}</span>
            <strong>{day.dayNum}</strong>
            {day.score !== null ? (
              <small className={day.score < 50 ? 'danger-badge' : day.score < 75 ? 'warning-badge' : 'safe-badge'}>
                {day.score}
              </small>
            ) : (
              <small>—</small>
            )}
          </button>
        ))}
        <button className="icon-button" onClick={() => shiftDate(1)} aria-label="Next day">
          <ArrowRight size={17} />
        </button>
      </section>

      <div className="diary-layout">
        <div className="diary-timeline-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow"><Calendar size={11} style={{ display: 'inline', marginRight: '3px' }} /> Selected date</span>
              <h2>{formatDateLabel(activeDate)}</h2>
            </div>
            <span className="meal-count">{activeLogs.length} items logged</span>
          </div>

          <div className="timeline">
            {activeLogs.map((item, index) => {
              const product = products.find((p) => p.id === item.productId)
              if (!product) return null
              return (
                <div className="timeline-item" key={`${item.productId}-${index}`}>
                  <span className="time">{item.time}</span>
                  <span className="timeline-dot" />
                  <div className="timeline-card">
                    <ProductPack product={product} compact />
                    <span className="timeline-card-meta" onClick={() => onOpen(product)}>
                      <strong>{product.name}</strong>
                      <small>{product.brand} · {item.servings} serving{item.servings !== 1 ? 's' : ''}</small>
                    </span>
                    <div className="timeline-card-cal">
                      <strong>{Math.round(product.calories * item.servings)}</strong>
                      <small>kcal</small>
                    </div>
                    <button
                      className="delete-log-btn"
                      onClick={() => onDeleteLog(item.id || index)}
                      title="Remove from logs"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              )
            })}

            <button className="timeline-add" onClick={() => onAdd(null)}>
              <span>Add</span>
              <span className="timeline-dot" />
              <div>
                <Plus size={18} /> Add another food item
              </div>
            </button>
          </div>
        </div>

        {/* Sidebar Summary */}
        <aside className="daily-summary panel">
          <span className="eyebrow">Nutritional Accumulation</span>
          <h2>Nutrient Totals</h2>
          <p>Aggregated limits consumed on {activeDate === new Date().toISOString().split('T')[0] ? 'today' : activeDate}.</p>
          <div className="summary-metrics">
            {Object.entries(dailyLimits).map(([metric, limit]) => {
              const value = dailyTotals[metric] || 0
              const meta = metricMeta[metric]
              const percent = Math.min(100, Math.round((value / limit) * 100))
              return (
                <div key={metric} className="summary-metric-row">
                  <div className="summary-metric-label">
                    <span>{meta.label}</span>
                    <strong>{value.toFixed(value % 1 === 0 ? 0 : 1)} / {limit}{meta.unit}</strong>
                  </div>
                  <div className="bar">
                    <span style={{ width: `${percent}%`, background: meta.color }} />
                  </div>
                </div>
              )
            })}
          </div>

          {tallyTotal > 0 && (
            <div className="ing-quality-block">
              <span className="eyebrow">Ingredient quality today</span>
              <div className="ing-quality-bar">
                <span className="iq good" style={{ flex: ingredientTally.good || 0.0001 }} />
                <span className="iq neutral" style={{ flex: ingredientTally.neutral || 0.0001 }} />
                <span className="iq bad" style={{ flex: ingredientTally.bad || 0.0001 }} />
              </div>
              <div className="ing-quality-legend">
                <span><i className="good" /> {ingredientTally.good} good</span>
                <span><i className="neutral" /> {ingredientTally.neutral} neutral</span>
                <span><i className="bad" /> {ingredientTally.bad} watch</span>
              </div>
            </div>
          )}

          <div className="summary-tip">
            <Info size={18} />
            <div>
              <strong>Actionable Next Step:</strong>
              <p>
                {dailyTotals.sodium > dailyLimits.sodium * 0.5 
                  ? 'Limit high-sodium sauces, instant soups, and chips for dinner. Select home-cooked grains and leafy salads.' 
                  : 'Your daily levels are looking well balanced. Keep drinking water and prioritize fiber.'}
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* Toxicity & Organ load Report section */}
      <section style={{ marginTop: '28px' }}>
        <HealthReport log={activeLogs} activeDate={activeDate} allLogs={log} />
      </section>
    </main>
  )
}
