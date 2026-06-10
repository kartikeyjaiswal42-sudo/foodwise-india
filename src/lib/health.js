// BMI + energy-needs + personalised daily nutrition targets.
// All pure functions — no React, no DOM — so they're trivially testable.

export const ACTIVITY_FACTORS = {
  sedentary: { factor: 1.2, label: 'Sedentary (little/no exercise)' },
  light: { factor: 1.375, label: 'Light (1–3 days/week)' },
  moderate: { factor: 1.55, label: 'Moderate (3–5 days/week)' },
  active: { factor: 1.725, label: 'Active (6–7 days/week)' },
  athlete: { factor: 1.9, label: 'Very active / physical job' },
}

export const GOALS = {
  lose: { label: 'Lose weight', adjust: -500, note: 'A ~500 kcal/day deficit targets roughly 0.45 kg loss per week.' },
  maintain: { label: 'Maintain weight', adjust: 0, note: 'Eat at your maintenance energy level.' },
  gain: { label: 'Gain weight', adjust: 400, note: 'A ~400 kcal/day surplus supports steady, lean weight gain.' },
}

export function bmiOf(weightKg, heightCm) {
  const h = Number(heightCm) / 100
  const w = Number(weightKg)
  if (!h || !w) return null
  return w / (h * h)
}

export function bmiCategory(bmi) {
  if (bmi == null) return null
  if (bmi < 18.5) return { key: 'under', label: 'Underweight', color: '#3b82f6' }
  if (bmi < 25) return { key: 'normal', label: 'Healthy weight', color: '#10b981' }
  if (bmi < 30) return { key: 'over', label: 'Overweight', color: '#f59e0b' }
  return { key: 'obese', label: 'Obese', color: '#ef4444' }
}

// Mifflin–St Jeor BMR
export function bmrOf({ weightKg, heightCm, age, sex }) {
  const w = Number(weightKg), h = Number(heightCm), a = Number(age)
  if (!w || !h || !a) return null
  const base = 10 * w + 6.25 * h - 5 * a
  return sex === 'female' ? base - 161 : base + 5
}

// Returns the full derived plan for a profile, or null if incomplete.
export function computePlan(profile) {
  if (!profile) return null
  const { weightKg, heightCm, age, sex = 'male', activity = 'sedentary', goal = 'maintain' } = profile
  const bmi = bmiOf(weightKg, heightCm)
  const bmr = bmrOf({ weightKg, heightCm, age, sex })
  if (bmi == null || bmr == null) return null
  const factor = (ACTIVITY_FACTORS[activity] || ACTIVITY_FACTORS.sedentary).factor
  const tdee = bmr * factor
  const adjust = (GOALS[goal] || GOALS.maintain).adjust
  const calorieTarget = Math.max(1200, Math.round((tdee + adjust) / 10) * 10)

  // Goal-aware nutrient ceilings, derived from the calorie target.
  // sugar: % of energy ÷ 4 kcal/g | satFat: % of energy ÷ 9 kcal/g
  const sugarPct = goal === 'lose' ? 0.05 : goal === 'gain' ? 0.10 : 0.07
  const satFatPct = goal === 'lose' ? 0.07 : 0.10
  const limits = {
    calories: calorieTarget,
    sugar: Math.round((calorieTarget * sugarPct) / 4),         // g
    sodium: goal === 'lose' ? 1800 : 2300,                      // mg
    satFat: Math.round((calorieTarget * satFatPct) / 9),        // g
  }
  return {
    bmi: Math.round(bmi * 10) / 10,
    bmiCat: bmiCategory(bmi),
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    calorieTarget,
    limits,
  }
}

// Limits used when no profile is set (so the app still works out-of-the-box).
export const DEFAULT_LIMITS = { calories: 2000, sugar: 25, sodium: 2300, satFat: 20 }
