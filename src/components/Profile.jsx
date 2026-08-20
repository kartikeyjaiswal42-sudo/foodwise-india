'use client'
import { useState, useMemo } from 'react'
import { Activity, Flame, Target, HeartPulse, Save, Scale, Ruler, Check, ShieldAlert, Info } from 'lucide-react'
import { ACTIVITY_FACTORS, GOALS, computePlan, DEFAULT_LIMITS } from '../lib/health'
import { CONDITIONS, CONDITION_GROUPS, applyConditions, DISCLAIMER } from '../lib/conditions'

export default function Profile({ profile, onSave }) {
  const [form, setForm] = useState(() => ({
    heightCm: profile?.heightCm ?? '',
    weightKg: profile?.weightKg ?? '',
    age: profile?.age ?? '',
    sex: profile?.sex ?? 'male',
    activity: profile?.activity ?? 'moderate',
    goal: profile?.goal ?? 'maintain',
    conditions: profile?.conditions ?? [],
  }))
  const [saved, setSaved] = useState(false)

  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setSaved(false) }
  const plan = useMemo(() => computePlan(form), [form])

  const toggleCondition = (id) => {
    setForm((f) => ({
      ...f,
      conditions: f.conditions.includes(id)
        ? f.conditions.filter((c) => c !== id)
        : [...f.conditions, id],
    }))
    setSaved(false)
  }

  // Conditions apply on top of whatever base we have — so someone who only
  // records an allergy still gets a working plan without entering body metrics.
  const tightened = useMemo(
    () => applyConditions(plan?.limits || DEFAULT_LIMITS, form.conditions),
    [plan, form.conditions]
  )

  const save = () => {
    onSave({
      heightCm: Number(form.heightCm) || null,
      weightKg: Number(form.weightKg) || null,
      age: Number(form.age) || null,
      sex: form.sex,
      activity: form.activity,
      goal: form.goal,
      conditions: form.conditions,
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

          <div className="pf-block pf-conditions">
            <span className="pf-block-label"><ShieldAlert size={14} /> Health conditions <em>(optional)</em></span>
            <p className="pf-cond-intro">
              Pick anything that applies. Jaano will tighten your ceilings to the published
              guideline for that condition and flag the specific ingredients that matter to you —
              on every product, scan and label.
            </p>
            {CONDITION_GROUPS.map((group) => {
              const items = CONDITIONS.filter((c) => c.group === group)
              if (!items.length) return null
              return (
                <div key={group} className="pf-cond-group">
                  <span className="pf-cond-group-name">{group}</span>
                  <div className="pf-cond-grid">
                    {items.map((c) => {
                      const on = form.conditions.includes(c.id)
                      return (
                        <button
                          key={c.id}
                          type="button"
                          className={`pf-cond ${on ? 'on' : ''}`}
                          onClick={() => toggleCondition(c.id)}
                          aria-pressed={on}
                        >
                          <span className="pf-cond-emoji">{c.emoji}</span>
                          <span className="pf-cond-text">
                            <strong>{c.label}</strong>
                            <small>{c.short}</small>
                          </span>
                          {on && <Check size={15} className="pf-cond-tick" />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          <button className="primary-button pf-save" onClick={save} disabled={!plan && !form.conditions.length}>
            {saved ? <><Check size={18} /> Saved — diary updated</> : <><Save size={18} /> Save & apply to my diary</>}
          </button>
          {!plan && (
            <p className="pf-hint">
              {form.conditions.length
                ? 'Your conditions will be saved. Add height, weight and age for calorie targets too.'
                : 'Enter height, weight and age to compute your plan.'}
            </p>
          )}
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

              <LimitsBlock base={plan.limits} tightened={tightened} />
              <p className="pf-disclaimer">Estimates use the Mifflin–St Jeor equation. {DISCLAIMER}</p>
            </>
          ) : (
            <>
              <div className="empty-state" style={{ padding: form.conditions.length ? '24px 16px' : '40px 16px' }}>
                <HeartPulse size={30} />
                <h2>Awaiting your metrics</h2>
                <p>Fill in the form to see your BMI, energy needs and personalised diary targets.</p>
              </div>
              {form.conditions.length > 0 && (
                <>
                  <LimitsBlock base={DEFAULT_LIMITS} tightened={tightened} />
                  <p className="pf-disclaimer">{DISCLAIMER}</p>
                </>
              )}
            </>
          )}
        </article>
      </div>
    </main>
  )
}

/* ------------------------------------------------------------------ */
/*  Daily ceilings, showing what each condition tightened              */
/* ------------------------------------------------------------------ */
function LimitsBlock({ base, tightened }) {
  const { limits, applied } = tightened
  const rows = [
    { key: 'calories', label: 'Calories', unit: 'kcal' },
    { key: 'sugar', label: 'Added sugar', unit: 'g' },
    { key: 'sodium', label: 'Sodium', unit: 'mg' },
    { key: 'satFat', label: 'Saturated fat', unit: 'g' },
  ]
  // Latest tightening per nutrient is the one that won (applyConditions only
  // records a change when it actually lowers the value).
  const winner = {}
  for (const a of applied) winner[a.nutrient] = a.condition

  return (
    <div className="limits-block">
      <span className="eyebrow">Daily ceilings applied to your diary</span>
      <div className="limit-rows">
        {rows.map((r) => {
          const was = base[r.key]
          const now = limits[r.key]
          const changed = now !== was
          return (
            <div key={r.key} className={`limit-row ${changed ? 'tightened' : ''}`}>
              {/* The space before <em> is explicit: JSX drops whitespace between
                  an expression and an adjacent element when the line wraps,
                  which rendered "Sodiumwas 2,300". */}
              <span>
                {r.label}{' '}
                {changed && <em className="limit-was">was {was.toLocaleString()}</em>}
              </span>
              <strong>
                {now.toLocaleString()} {r.unit}
                {changed && <small className="limit-why">for {winner[r.key]?.label}</small>}
              </strong>
            </div>
          )
        })}
      </div>
      {applied.length > 0 && (
        <p className="limits-note">
          <Info size={13} /> Tightened to the strictest published guideline among your conditions.
          Selecting more conditions can only lower these numbers, never raise them.
        </p>
      )}
    </div>
  )
}
