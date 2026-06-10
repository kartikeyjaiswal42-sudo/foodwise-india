'use client'
import { useState, useMemo } from 'react'
import { Activity, Flame, Target, HeartPulse, Save, Scale, Ruler, Check } from 'lucide-react'
import { ACTIVITY_FACTORS, GOALS, computePlan } from '../lib/health'

export default function Profile({ profile, onSave }) {
  const [form, setForm] = useState(() => ({
    heightCm: profile?.heightCm ?? '',
    weightKg: profile?.weightKg ?? '',
    age: profile?.age ?? '',
    sex: profile?.sex ?? 'male',
    activity: profile?.activity ?? 'moderate',
    goal: profile?.goal ?? 'maintain',
  }))
  const [saved, setSaved] = useState(false)

  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setSaved(false) }
  const plan = useMemo(() => computePlan(form), [form])

  const save = () => {
    onSave({
      heightCm: Number(form.heightCm) || null,
      weightKg: Number(form.weightKg) || null,
      age: Number(form.age) || null,
      sex: form.sex,
      activity: form.activity,
      goal: form.goal,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  // BMI gauge marker position across 15–40
  const bmiPct = plan ? Math.max(0, Math.min(100, ((plan.bmi - 15) / 25) * 100)) : 0

  return (
    <main className="profile-view">
      <section className="explore-head">
        <div>
          <span className="eyebrow">Personal Health Engine</span>
          <h1>Your Health Profile</h1>
          <p>Tell us your body metrics and goal. We compute your BMI, daily energy needs, and the exact sugar / sodium / saturated-fat ceilings your food diary will be measured against.</p>
        </div>
      </section>

      <div className="profile-grid">
        {/* INPUT CARD */}
        <article className="panel profile-form-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Body metrics</span>
              <h2>About you</h2>
            </div>
            <HeartPulse size={19} color="#9c1b2e" />
          </div>

          <div className="pf-fields">
            <label className="pf-field">
              <span><Ruler size={14} /> Height (cm)</span>
              <input type="number" inputMode="numeric" value={form.heightCm}
                onChange={(e) => set('heightCm', e.target.value)} placeholder="170" />
            </label>
            <label className="pf-field">
              <span><Scale size={14} /> Weight (kg)</span>
              <input type="number" inputMode="numeric" value={form.weightKg}
                onChange={(e) => set('weightKg', e.target.value)} placeholder="68" />
            </label>
            <label className="pf-field">
              <span>Age</span>
              <input type="number" inputMode="numeric" value={form.age}
                onChange={(e) => set('age', e.target.value)} placeholder="28" />
            </label>
            <label className="pf-field">
              <span>Sex</span>
              <select value={form.sex} onChange={(e) => set('sex', e.target.value)}>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </label>
          </div>

          <div className="pf-block">
            <span className="pf-block-label"><Activity size={14} /> Activity level</span>
            <div className="pf-chips">
              {Object.entries(ACTIVITY_FACTORS).map(([key, v]) => (
                <button key={key} className={`pf-chip ${form.activity === key ? 'on' : ''}`}
                  onClick={() => set('activity', key)} title={v.label}>
                  {key[0].toUpperCase() + key.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="pf-block">
            <span className="pf-block-label"><Target size={14} /> Your goal</span>
            <div className="pf-goal-row">
              {Object.entries(GOALS).map(([key, v]) => (
                <button key={key} className={`pf-goal ${form.goal === key ? 'on' : ''}`}
                  onClick={() => set('goal', key)}>
                  <strong>{v.label}</strong>
                  <small>{key === 'lose' ? '−500 kcal/day' : key === 'gain' ? '+400 kcal/day' : 'maintenance'}</small>
                </button>
              ))}
            </div>
          </div>

          <button className="primary-button pf-save" onClick={save} disabled={!plan}>
            {saved ? <><Check size={18} /> Saved — diary updated</> : <><Save size={18} /> Save & apply to my diary</>}
          </button>
          {!plan && <p className="pf-hint">Enter height, weight and age to compute your plan.</p>}
        </article>

        {/* RESULT CARD */}
        <article className="panel profile-result-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Your numbers</span>
              <h2>Health readout</h2>
            </div>
          </div>

          {plan ? (
            <>
              <div className="bmi-readout" style={{ '--cat': plan.bmiCat.color }}>
                <div className="bmi-big">
                  <strong>{plan.bmi}</strong>
                  <span>BMI</span>
                </div>
                <div className="bmi-cat">
                  <span className="bmi-pill" style={{ background: plan.bmiCat.color }}>{plan.bmiCat.label}</span>
                  <div className="bmi-gauge">
                    <div className="bmi-gauge-track" />
                    <div className="bmi-gauge-marker" style={{ left: `${bmiPct}%` }} />
                  </div>
                  <div className="bmi-scale"><span>15</span><span>18.5</span><span>25</span><span>30</span><span>40</span></div>
                </div>
              </div>

              <div className="energy-grid">
                <div className="energy-cell">
                  <Flame size={16} color="#df7b54" />
                  <strong>{plan.tdee.toLocaleString()}</strong>
                  <span>Maintenance kcal/day</span>
                </div>
                <div className="energy-cell highlight">
                  <Target size={16} color="#9c1b2e" />
                  <strong>{plan.calorieTarget.toLocaleString()}</strong>
                  <span>Your daily target</span>
                </div>
              </div>

              <p className="goal-note">{GOALS[form.goal].note}</p>

              <div className="limits-block">
                <span className="eyebrow">Daily ceilings applied to your diary</span>
                <div className="limit-rows">
                  <div className="limit-row"><span>Calories</span><strong>{plan.limits.calories.toLocaleString()} kcal</strong></div>
                  <div className="limit-row"><span>Added sugar</span><strong>{plan.limits.sugar} g</strong></div>
                  <div className="limit-row"><span>Sodium</span><strong>{plan.limits.sodium.toLocaleString()} mg</strong></div>
                  <div className="limit-row"><span>Saturated fat</span><strong>{plan.limits.satFat} g</strong></div>
                </div>
              </div>
              <p className="pf-disclaimer">Estimates use the Mifflin–St Jeor equation. Educational only — not medical advice.</p>
            </>
          ) : (
            <div className="empty-state" style={{ padding: '40px 16px' }}>
              <HeartPulse size={30} />
              <h2>Awaiting your metrics</h2>
              <p>Fill in the form to see your BMI, energy needs and personalised diary targets.</p>
            </div>
          )}
        </article>
      </div>
    </main>
  )
}
