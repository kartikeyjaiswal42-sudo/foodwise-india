import { Zap, Sparkles, HeartPulse, BookOpen, ShieldCheck } from 'lucide-react'

export default function IngredientGuide() {
  const guides = [
    {
      name: 'Added sugar',
      icon: Zap,
      color: '#df7b54',
      desc: 'Sugars added during manufacturing or processing, separate from naturally occurring lactose in milk or sugars inside whole fruits.',
      guide: 'WHO recommends under 25 g (6 teaspoons) per day.',
      sources: 'Soft colas, chocolate spreads, cereal flakes, cream biscuits',
      tip: 'Check per-serving carbohydrates and look for hidden aliases like sucrose, high-fructose corn syrup, liquid glucose, or malt extract.'
    },
    {
      name: 'Sodium / Preservatives',
      icon: Sparkles,
      color: '#7d88d9',
      desc: 'Sodium chloride acts as a flavor enhancer and preservative. High intake causes blood vessel fluid retention, raising blood pressure.',
      guide: 'Keep under 2,300 mg per day.',
      sources: 'Instant soups, potato chips, instant noodles, tomato ketchup',
      tip: 'Look for low-sodium labels, and wash canned products. Packaged foods frequently use sodium benzoate (INS 211) as a preservative, which can react with vitamin C to create benzene.'
    },
    {
      name: 'Industrial Saturated Fats',
      icon: HeartPulse,
      color: '#c49143',
      desc: 'Highly processed saturated fats like Palm oil or hydrogenated oils are used to extend shelf-life and provide structural crispness.',
      guide: 'Keep under 20 g per day.',
      sources: 'Deep fried chips, instant noodle cakes, commercial cookies',
      tip: 'Choose products containing cold-pressed seeds or rice bran oils. Avoid products declaring hydrogenated fats or interesterified vegetable oil.'
    },
    {
      name: 'Disruptive Additives',
      icon: ShieldCheck,
      color: '#5f8a70',
      desc: 'Permitted additives like thickeners, emulsifiers, synthetic dyes, and chemical flavor enhancers (like MSG, INS 627, 631).',
      guide: 'Avoid frequent consumption.',
      sources: 'Milkshakes (carrageenan), Magic Masala chips (INS 627/631), colas (Caramel IV)',
      tip: 'Prioritize short, clean ingredient lists. If a product contains ingredients with E-numbers/INS codes that you don\'t recognize, it is heavily processed.'
    }
  ]

  return (
    <main className="guide-view">
      <section className="guide-hero">
        <div>
          <span className="eyebrow">Ingredient Academy</span>
          <h1>Decode Pack Labels</h1>
          <p>Learn to spot corporate marketing tricks, understand common chemical codes, and make science-based choices at the supermarket.</p>
        </div>
        <div className="guide-hero-icon">
          <BookOpen size={35} />
        </div>
      </section>

      <div className="guide-grid">
        {guides.map((guide) => {
          const Icon = guide.icon
          return (
            <article className="guide-card" key={guide.name} style={{ '--guide': guide.color }}>
              <div className="guide-icon">
                <Icon size={21} />
              </div>
              <h2>{guide.name}</h2>
              <p>{guide.desc}</p>
              <div className="guide-detail-row">
                <span>Practical Guide</span>
                <strong>{guide.guide}</strong>
              </div>
              <div className="guide-detail-row">
                <span>Common Sources</span>
                <strong>{guide.sources}</strong>
              </div>
              <div className="guide-tip">
                <Sparkles size={15} />
                <span>{guide.tip}</span>
              </div>
            </article>
          )
        })}
      </div>

      <section className="panel evidence-note">
        <ShieldCheck size={24} />
        <div>
          <h2>How Jaano Evaluates Physiological Risk</h2>
          <p>
            Our health rating engine avoids sensationalist labels like "poison". Instead, it focuses on established clinical research regarding chronic chemical consumption, hepatic fat accumulation, metabolic insulin stress, and intestinal lining permeability. Our suggestions do not substitute for professional medical counsel.
          </p>
        </div>
      </section>
    </main>
  )
}
