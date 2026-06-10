import { useState, useMemo } from 'react'
import { Heart, Activity, ShieldAlert, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react'
import { products } from '../data/foodDatabase'

// Derive per-serving exposure for a product from its real ingredients + nutrition.
// Ingredient flags are detected from the declared ingredient list; sugar/sodium/
// satFat come straight from the per-100g nutrition (1 serving ≈ 100 g basis).
function exposureOf(product) {
  const ing = (product.ingredients || []).join(' ').toLowerCase()
  const has = (re) => re.test(ing)
  const additiveConcern = (product.concerns || []).find((c) => /additive/i.test(c.name))
  const additivesCount = additiveConcern
    ? (parseInt(additiveConcern.amount, 10) || (additiveConcern.amount.match(/[A-Z]?\d{3}/g) || []).length || 1)
    : 0
  return {
    maida: has(/maida|refined wheat/) ? 25 : 0,
    palmOil: has(/palm/) ? 12 : 0,
    carrageenan: has(/carrageenan|\b407\b/) ? 0.2 : 0,
    maltodextrin: has(/maltodextrin/) ? 3 : 0,
    sugar: product.nutrients?.sugar || 0,
    sodium: product.nutrients?.sodium || 0,
    satFat: product.nutrients?.satFat || 0,
    additivesCount,
  }
}

export default function HealthReport({ log, activeDate, allLogs = [] }) {
  const [reportDuration, setReportDuration] = useState('1day') // '1day' or '3day'

  // Filter logs based on duration selection
  const targetLogs = useMemo(() => {
    if (reportDuration === '1day') {
      return log
    } else {
      // 3-day window calculation (Active Date + previous 2 calendar dates)
      // Since activeDate is formatted as "2026-06-10", let's parse it and get past 2 days
      try {
        const currentDateObj = new Date(activeDate)
        const dayMs = 24 * 60 * 60 * 1000
        const dateRangeStrs = [
          activeDate,
          new Date(currentDateObj.getTime() - dayMs).toISOString().split('T')[0],
          new Date(currentDateObj.getTime() - 2 * dayMs).toISOString().split('T')[0]
        ]
        return allLogs.filter(item => dateRangeStrs.includes(item.date))
      } catch (err) {
        return log
      }
    }
  }, [log, reportDuration, activeDate, allLogs])

  // Aggregate total consumption of toxic components
  const totals = useMemo(() => {
    let aggregates = {
      maida: 0, palmOil: 0, carrageenan: 0, maltodextrin: 0,
      sugar: 0, sodium: 0, satFat: 0, additivesCount: 0,
    }

    targetLogs.forEach((item) => {
      const product = products.find((p) => p.id === item.productId)
      if (!product) return
      const w = exposureOf(product)
      const factor = item.servings
      aggregates.maida += w.maida * factor
      aggregates.palmOil += w.palmOil * factor
      aggregates.carrageenan += w.carrageenan * factor
      aggregates.maltodextrin += w.maltodextrin * factor
      aggregates.sugar += w.sugar * factor
      aggregates.sodium += w.sodium * factor
      aggregates.satFat += w.satFat * factor
      aggregates.additivesCount += w.additivesCount * factor
    })

    return aggregates
  }, [targetLogs])

  // Normalization divisors depending on duration (1-day limits vs 3-day cumulative limits)
  const durationMultiplier = reportDuration === '1day' ? 1 : 2.5

  // Biological Risk Algorithms (scale 0 - 100)
  const biologicalRisks = useMemo(() => {
    const gut = Math.min(100, Math.round(
      ((totals.carrageenan * 350) + (totals.maida * 0.8) + (totals.palmOil * 0.5)) / durationMultiplier
    ))

    const liver = Math.min(100, Math.round(
      ((totals.sugar * 2.2) + (totals.maltodextrin * 15)) / durationMultiplier
    ))

    const heart = Math.min(100, Math.round(
      ((totals.sodium * 0.025) + (totals.palmOil * 1.5) + (totals.satFat * 1.2)) / durationMultiplier
    ))

    const cellular = Math.min(100, Math.round(
      (totals.additivesCount * 18) / durationMultiplier
    ))

    return { gut, liver, heart, cellular }
  }, [totals, durationMultiplier])

  const getRiskStatus = (score) => {
    if (score >= 70) return { label: 'Action Needed', class: 'danger', color: '#ef4444' }
    if (score >= 40) return { label: 'Watchpoint', class: 'warning', color: '#f59e0b' }
    return { label: 'Safe Range', class: 'safe', color: '#10b981' }
  }

  const gutStatus = getRiskStatus(biologicalRisks.gut)
  const liverStatus = getRiskStatus(biologicalRisks.liver)
  const heartStatus = getRiskStatus(biologicalRisks.heart)
  const cellularStatus = getRiskStatus(biologicalRisks.cellular)

  // Recovery protocols recommendations
  const recoveryProtocols = useMemo(() => {
    const protocols = []
    if (biologicalRisks.gut >= 40) {
      protocols.push({
        title: 'Gut Mucosa Protection Protocol',
        action: 'Consume probiotic rich fermented foods (kefir, buttermilk, home-set curd) and soluble fiber (isabgol/psyllium husk, chia seeds). Avoid raw starches or emulsifier-loaded dairy for the next 24 hours to let the tight junctions heal.'
      })
    }
    if (biologicalRisks.liver >= 40) {
      protocols.push({
        title: 'Insulin Sensitization Protocol',
        action: 'Perform 20-30 minutes of low-intensity aerobic exercise (brisk walking) to draw glucose into skeletal muscles. Drink 300ml green tea or consume cinnamon-spiced foods to assist metabolic clearing; avoid high-fructose syrups and liquid calories.'
      })
    }
    if (biologicalRisks.heart >= 40) {
      protocols.push({
        title: 'Sodium Clearance Protocol',
        action: 'Double your water intake (aim for 3L) and consume potassium-rich foods (coconut water, banana, roasted sweet potato) to trigger renal sodium flushing. Avoid adding table salt to home-cooked meals.'
      })
    }
    if (biologicalRisks.cellular >= 40) {
      protocols.push({
        title: 'Oxidative Stress Neutralization',
        action: 'Load up on natural antioxidants. Consume citrus fruits (amla, lemon, oranges) containing vitamin C, and cruciferous vegetables (broccoli, cabbage) containing sulforaphane to assist liver Phase II conjugation paths.'
      })
    }

    if (protocols.length === 0) {
      protocols.push({
        title: 'All Systems Optimal',
        action: 'Your current food log shows excellent ingredient selections. Continue drinking adequate water and choosing unprocessed, whole foods to maintain this baseline.'
      })
    }

    return protocols
  }, [biologicalRisks])

  return (
    <div className="health-report-panel panel">
      <div className="health-report-header">
        <div>
          <span className="eyebrow">Diagnostic Analytics</span>
          <h2>Organ Toxicity & Risk Report</h2>
          <p>Analyzing physiological burden based on ingested E-numbers, chemical stabilizers, trans fats, and glycemic stress.</p>
        </div>
        <div className="duration-selector">
          <button 
            className={reportDuration === '1day' ? 'active' : ''} 
            onClick={() => setReportDuration('1day')}
          >
            Today
          </button>
          <button 
            className={reportDuration === '3day' ? 'active' : ''} 
            onClick={() => setReportDuration('3day')}
          >
            3-Day Trend
          </button>
        </div>
      </div>

      {targetLogs.length === 0 ? (
        <div className="empty-health-report">
          <CheckCircle2 size={32} color="#10b981" />
          <h3>No biological load recorded</h3>
          <p>Add foods to your diary on this date to view a metabolic toxicity report.</p>
        </div>
      ) : (
        <>
          <div className="organ-risk-grid">
            {/* Gut Health Dial */}
            <div className={`organ-risk-card ${gutStatus.class}`}>
              <div className="organ-risk-circle" style={{ '--percent': `${biologicalRisks.gut * 3.6}deg`, '--ring': gutStatus.color }}>
                <div>
                  <strong>{biologicalRisks.gut}%</strong>
                  <span>Stress</span>
                </div>
              </div>
              <div className="organ-risk-meta">
                <span className="organ-title"><Activity size={13} /> Gut Lining</span>
                <span className={`organ-badge ${gutStatus.class}`}>{gutStatus.label}</span>
                <p>{biologicalRisks.gut >= 40 
                  ? 'High risk of gut permeability (leaky gut) and mucosal irritation from processed flour or carrageenan emulsifiers.' 
                  : 'Gut barrier and microbiome are functioning in safe parameters.'}
                </p>
              </div>
            </div>

            {/* Liver & Metabolic Dial */}
            <div className={`organ-risk-card ${liverStatus.class}`}>
              <div className="organ-risk-circle" style={{ '--percent': `${biologicalRisks.liver * 3.6}deg`, '--ring': liverStatus.color }}>
                <div>
                  <strong>{biologicalRisks.liver}%</strong>
                  <span>Stress</span>
                </div>
              </div>
              <div className="organ-risk-meta">
                <span className="organ-title"><ShieldAlert size={13} /> Metabolic</span>
                <span className={`organ-badge ${liverStatus.class}`}>{liverStatus.label}</span>
                <p>{biologicalRisks.liver >= 40 
                  ? 'Fructose overload triggering de novo lipogenesis (liver fat deposition) and rapid insulin spikes from maltodextrin.' 
                  : 'Minimal metabolic stress; blood sugars remain stable.'}
                </p>
              </div>
            </div>

            {/* Cardiovascular Dial */}
            <div className={`organ-risk-card ${heartStatus.class}`}>
              <div className="organ-risk-circle" style={{ '--percent': `${biologicalRisks.heart * 3.6}deg`, '--ring': heartStatus.color }}>
                <div>
                  <strong>{biologicalRisks.heart}%</strong>
                  <span>Stress</span>
                </div>
              </div>
              <div className="organ-risk-meta">
                <span className="organ-title"><Heart size={13} /> Cardiovascular</span>
                <span className={`organ-badge ${heartStatus.class}`}>{heartStatus.label}</span>
                <p>{biologicalRisks.heart >= 40 
                  ? 'Elevated arterial blood pressure load and vascular stiffness due to heavy sodium accumulation and saturated fats.' 
                  : 'Low sodium and saturated fat load, protecting cardiovascular endothelial health.'}
                </p>
              </div>
            </div>

            {/* Cellular Dial */}
            <div className={`organ-risk-card ${cellularStatus.class}`}>
              <div className="organ-risk-circle" style={{ '--percent': `${biologicalRisks.cellular * 3.6}deg`, '--ring': cellularStatus.color }}>
                <div>
                  <strong>{biologicalRisks.cellular}%</strong>
                  <span>Stress</span>
                </div>
              </div>
              <div className="organ-risk-meta">
                <span className="organ-title"><Sparkles size={13} /> Cellular Load</span>
                <span className={`organ-badge ${cellularStatus.class}`}>{cellularStatus.label}</span>
                <p>{biologicalRisks.cellular >= 40 
                  ? 'Liver clearance burdened by E-numbers (Caramel IV, Sodium Benzoate, MSG), increasing free radical oxidative stress.' 
                  : 'Clean chemical profile; negligible synthetic additive clearance load.'}
                </p>
              </div>
            </div>
          </div>

          {/* Aggregated consumption weights */}
          <div className="toxicity-stats-bar">
            <h4>Ingested Chemicals & Refined Loads:</h4>
            <div className="tox-stats-grid">
              <div>
                <span>Refined wheat flour (Maida)</span>
                <strong>{totals.maida.toFixed(0)} g</strong>
              </div>
              <div>
                <span>Industrial Palm Oil</span>
                <strong>{totals.palmOil.toFixed(0)} g</strong>
              </div>
              <div>
                <span>Sodium Intake</span>
                <strong>{totals.sodium.toFixed(0)} mg</strong>
              </div>
              <div>
                <span>Added Sugar</span>
                <strong>{totals.sugar.toFixed(1)} g</strong>
              </div>
              <div>
                <span>Synthetic Additives</span>
                <strong>{totals.additivesCount} instances</strong>
              </div>
            </div>
          </div>

          {/* Recovery protocols */}
          <div className="recovery-protocols-section">
            <h4>💡 Recommended Metabolic Flush Actions:</h4>
            <div className="protocol-list">
              {recoveryProtocols.map((protocol, index) => (
                <div key={index} className="protocol-card">
                  <div className="protocol-icon">
                    {protocol.title.includes('Optimal') ? <CheckCircle2 size={16} color="#10b981" /> : <AlertTriangle size={16} color="#f59e0b" />}
                  </div>
                  <div>
                    <strong>{protocol.title}</strong>
                    <p>{protocol.action}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
