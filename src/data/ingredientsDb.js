// ============================================================================
//  JAANO — BODY TOXICITY ENCYCLOPEDIA
//  A hand-curated hazard registry for packaged-food ingredients & additives.
//  Each entry maps an ingredient to the BODY SYSTEMS it can damage, the exact
//  biological mechanism, where it hides, its legal status, and a clean swap.
//
//  Sources: FSSAI Food Safety Standards (Food Additives) Regulations, WHO/JECFA
//  ADI evaluations, EFSA re-evaluations, US FDA GRAS notices, IARC monographs,
//  and peer-reviewed toxicology literature. Educational — not medical advice.
//
//  `organs` values MUST be keys of ORGAN_SYSTEMS below (used by the body chart).
//  `risk`: 'high' | 'medium' | 'low'.  `class`: additive/ingredient family.
// ============================================================================

// The 15 body systems the toxicity chart diagnoses. Order = display order.
export const ORGAN_SYSTEMS = {
  brain:        { key: 'brain',        label: 'Brain & Nerves',        emoji: '🧠', color: '#8b5cf6', blurb: 'Neurotransmitters, mood, focus, headaches, child behaviour.' },
  heart:        { key: 'heart',        label: 'Heart & Arteries',      emoji: '❤️', color: '#ef4444', blurb: 'Cholesterol, blood pressure, arterial plaque, rhythm.' },
  liver:        { key: 'liver',        label: 'Liver',                 emoji: '🫀', color: '#b45309', blurb: 'Fat storage (fatty liver), detox load, enzyme stress.' },
  kidney:       { key: 'kidney',       label: 'Kidneys',               emoji: '🫘', color: '#0ea5e9', blurb: 'Filtration load, mineral balance, stone risk.' },
  gut:          { key: 'gut',          label: 'Gut & Microbiome',      emoji: '🦠', color: '#16a34a', blurb: 'Gut lining, good bacteria, bloating, IBS/IBD risk.' },
  metabolic:    { key: 'metabolic',    label: 'Blood Sugar & Pancreas',emoji: '🩸', color: '#f59e0b', blurb: 'Glucose spikes, insulin resistance, diabetes, obesity.' },
  thyroid:      { key: 'thyroid',      label: 'Hormones & Thyroid',    emoji: '⚖️', color: '#14b8a6', blurb: 'Endocrine disruption, thyroid, fertility hormones.' },
  reproductive: { key: 'reproductive', label: 'Reproductive Health',   emoji: '🧬', color: '#db2777', blurb: 'Fertility, sperm/egg quality, pregnancy, development.' },
  immune:       { key: 'immune',       label: 'Immune System',         emoji: '🛡️', color: '#6366f1', blurb: 'Allergies, inflammation, autoimmune triggers.' },
  lungs:        { key: 'lungs',        label: 'Lungs & Airways',       emoji: '🫁', color: '#0891b2', blurb: 'Asthma, breathing, sulphite & gas sensitivity.' },
  skin:         { key: 'skin',         label: 'Skin',                  emoji: '🧴', color: '#e11d48', blurb: 'Hives, rashes, itching, eczema flares.' },
  bones:        { key: 'bones',        label: 'Bones & Joints',        emoji: '🦴', color: '#64748b', blurb: 'Calcium loss, bone density, phosphate balance.' },
  blood:        { key: 'blood',        label: 'Blood',                 emoji: '🩸', color: '#9f1239', blurb: 'Oxygen carrying, anaemia, blood-cell effects.' },
  teeth:        { key: 'teeth',        label: 'Teeth & Enamel',        emoji: '🦷', color: '#0d9488', blurb: 'Decay, enamel erosion, acid wear.' },
  dna:          { key: 'dna',          label: 'DNA & Cancer Risk',     emoji: '☢️', color: '#7c2d12', blurb: 'Genotoxicity, carcinogens, oxidative cell damage.' },
}

export const ingredientsDb = {
  // ========================= REFINED CARBS & FLOURS =========================
  'Refined wheat flour (Maida)': {
    name: 'Refined wheat flour (Maida)', class: 'Refined grain',
    alternativeNames: ['Maida', 'Refined wheat flour', 'Enriched flour', 'Bleached flour'],
    risk: 'high', organs: ['metabolic', 'gut', 'heart'],
    issues: 'Stripped of fibre, bran and germ, leaving near-pure starch that digests instantly and spikes blood glucose, forcing repeated insulin surges → insulin resistance and visceral (belly) fat. Lack of fibre slows gut motility (constipation) and starves good bacteria. Often chemically bleached with benzoyl peroxide or chlorine.',
    sources: 'Noodles, biscuits, cookies, white bread, rusks, frozen snacks, namkeen',
    regulatory: 'Permitted globally; public-health bodies urge replacing with whole grains.',
    replacedBy: 'Whole wheat (atta), ragi, jowar, bajra, foxtail millet, oat flour.'
  },
  'Whole grain / Atta': {
    name: 'Whole grain (Whole wheat / Atta)', class: 'Whole grain',
    alternativeNames: ['Whole wheat', 'Atta', 'Whole grain', 'Wholemeal'],
    risk: 'low', organs: ['gut'],
    issues: 'Beneficial. Retains bran, germ and fibre — slows glucose release, feeds the microbiome and lowers cholesterol. The only watch-out is for diagnosed coeliac/gluten-sensitive individuals.',
    sources: 'Whole-wheat breads, multigrain biscuits, atta noodles',
    regulatory: 'Recommended by WHO/ICMR as a staple.',
    replacedBy: 'No replacement needed — already a clean whole food.'
  },
  'Millet / ancient grain': {
    name: 'Millet & ancient grains', class: 'Whole grain',
    alternativeNames: ['Ragi', 'Jowar', 'Bajra', 'Foxtail millet', 'Quinoa', 'Barley'],
    risk: 'low', organs: ['metabolic'],
    issues: 'Beneficial. Low glycemic load, high fibre and minerals (iron, magnesium); steadies blood sugar and supports satiety.',
    sources: 'Millet flakes, ragi cookies, multigrain mixes',
    regulatory: 'Promoted by FSSAI (International Year of Millets, 2023).',
    replacedBy: 'No replacement needed.'
  },

  // ============================ SUGARS & SYRUPS =============================
  'Sugar': {
    name: 'Refined Sugar (Sucrose)', class: 'Added sugar',
    alternativeNames: ['White sugar', 'Sucrose', 'Added sugar', 'Cane sugar'],
    risk: 'high', organs: ['metabolic', 'liver', 'teeth', 'heart'],
    issues: 'Half glucose, half fructose. The fructose half is processed only by the liver; overload is converted to fat → Non-Alcoholic Fatty Liver Disease (NAFLD). Drives insulin resistance, type-2 diabetes, systemic inflammation and weight gain; feeds mouth bacteria that erode enamel; raises triglycerides and blood pressure.',
    sources: 'Soft drinks, chocolates, cream biscuits, cereals, ketchup, flavoured dairy',
    regulatory: 'WHO: keep added sugars under ~5% of calories (~25 g/day).',
    replacedBy: 'Whole fruit, date paste, small amounts of jaggery; stevia/monk fruit for drinks.'
  },
  'Liquid Glucose': {
    name: 'Liquid Glucose / Glucose Syrup', class: 'Added sugar',
    alternativeNames: ['Glucose syrup', 'Corn syrup', 'Glucose-fructose syrup'],
    risk: 'high', organs: ['metabolic', 'liver', 'teeth'],
    issues: 'Concentrated glucose+maltose absorbed almost instantly, triggering massive insulin surges that exhaust the pancreas. Suppresses leptin (the “full” hormone) so you eat more, and drives liver fat deposition.',
    sources: 'Confectionery, jams, sauces, ice cream, energy chews',
    regulatory: 'Permitted; counts as added free sugar.',
    replacedBy: 'Dates, raisins, fruit pulp.'
  },
  'High-fructose corn syrup': {
    name: 'High-Fructose Corn Syrup (HFCS)', class: 'Added sugar',
    alternativeNames: ['HFCS', 'Fructose syrup', 'Isoglucose'],
    risk: 'high', organs: ['liver', 'metabolic', 'heart'],
    issues: 'Extra-high fructose load goes straight to the liver, strongly promoting fatty liver, high triglycerides, uric acid (gout) and insulin resistance more aggressively than table sugar. Bypasses normal appetite control.',
    sources: 'Some sodas, bottled sauces, candies, imported snacks',
    regulatory: 'Permitted; flagged by researchers as a key driver of metabolic disease.',
    replacedBy: 'Whole fruit, no-added-sugar options.'
  },
  'Invert sugar syrup': {
    name: 'Invert Sugar Syrup', class: 'Added sugar',
    alternativeNames: ['Invert syrup', 'Inverted sugar'],
    risk: 'high', organs: ['metabolic', 'liver', 'teeth'],
    issues: 'Glucose+fructose made by acid-hydrolysing sucrose; absorbed faster than table sugar so blood-sugar and insulin spikes are sharper. Adds to liver fat and tooth decay.',
    sources: 'Cream biscuits, cookies, confectionery, ketchups',
    regulatory: 'Approved as a sweetener.',
    replacedBy: 'Date paste, applesauce, jaggery (sparingly).'
  },
  'Maltodextrin': {
    name: 'Maltodextrin', class: 'Processed starch',
    alternativeNames: ['Maltodextrin', 'Malt extract', 'INS 1400'],
    risk: 'high', organs: ['metabolic', 'gut'],
    issues: 'Ultra-processed starch with a glycemic index of 110–185 — higher than table sugar — causing sharp glucose spikes. Research shows it thins the protective intestinal mucus layer and shifts the microbiome toward inflammatory species, raising gut-disease susceptibility.',
    sources: 'Health-drink powders, soups, seasonings, gravies, energy bars, sweeteners',
    regulatory: 'Approved as a bulking agent; criticised by metabolic/gut researchers.',
    replacedBy: 'Whole-food flours, no thickener, almond/lentil powder.'
  },
  'Honey / Jaggery': {
    name: 'Honey / Jaggery (Gur)', class: 'Less-refined sugar',
    alternativeNames: ['Honey', 'Jaggery', 'Gur', 'Date syrup'],
    risk: 'medium', organs: ['metabolic', 'teeth'],
    issues: 'Less refined and carries trace minerals/antioxidants, but still ~75–80% sugar — raises blood glucose and feeds decay if overused. Better than white sugar, not a free pass.',
    sources: 'Energy bars, “no refined sugar” snacks, traditional sweets',
    regulatory: 'Permitted; still counts toward added-sugar limits.',
    replacedBy: 'Whole fruit; use sparingly.'
  },

  // ============================ FATS & OILS ================================
  'Palm oil': {
    name: 'Palm Oil / Palmolein', class: 'Refined fat',
    alternativeNames: ['Palm oil', 'Palmolein', 'Edible vegetable oil', 'Palm fat'],
    risk: 'high', organs: ['heart', 'metabolic', 'dna'],
    issues: '~50% saturated (palmitic acid) — raises LDL “bad” cholesterol and arterial plaque. High-heat refining/deodorising (>200°C) creates 3-MCPD and glycidyl esters, which are genotoxic/possibly carcinogenic process contaminants.',
    sources: 'Instant noodles, chips, cookies, chocolate creams, vanaspati blends',
    regulatory: 'Permitted; EU caps glycidyl-ester contaminants.',
    replacedBy: 'Cold-pressed mustard/sesame/groundnut oil, rice-bran oil.'
  },
  'Vanaspati / Hydrogenated fat': {
    name: 'Hydrogenated Vegetable Fat (Vanaspati)', class: 'Trans/hydrogenated fat',
    alternativeNames: ['Vanaspati', 'Hydrogenated vegetable oil', 'Partially hydrogenated oil', 'Trans fat', 'Shortening'],
    risk: 'high', organs: ['heart', 'metabolic', 'reproductive'],
    issues: 'Hydrogenation creates trans fats that simultaneously raise LDL and lower HDL — the worst possible cholesterol shift — sharply increasing heart-attack and stroke risk. Promotes insulin resistance and systemic inflammation; linked to reduced fertility.',
    sources: 'Soan papdi, traditional sweets, cheap biscuits, bakery, street food',
    regulatory: 'FSSAI caps industrial trans fat at ≤2% by weight (2022).',
    replacedBy: 'Cow ghee, cold-pressed oils, butter in moderation.'
  },
  'Interesterified fat': {
    name: 'Interesterified Vegetable Fat', class: 'Modified fat',
    alternativeNames: ['Interesterified fat', 'Rearranged fat'],
    risk: 'medium', organs: ['heart', 'metabolic', 'liver'],
    issues: 'A trans-fat replacement where fatty acids are chemically rearranged. Early studies link high intakes to higher blood sugar, lower good cholesterol and impaired liver fat metabolism.',
    sources: 'Bakery shortenings, biscuit creams, dairy-fat replacers',
    regulatory: 'Permitted; long-term human data still limited.',
    replacedBy: 'Natural ghee, cold-pressed oils.'
  },
  'Refined vegetable oil': {
    name: 'Refined Vegetable Oil', class: 'Refined fat',
    alternativeNames: ['Sunflower oil', 'Soybean oil', 'Rice-bran oil', 'Canola oil'],
    risk: 'medium', organs: ['heart'],
    issues: 'Better than palm/vanaspati but solvent-extracted and high-heat refined, stripping antioxidants and (in seed oils) skewing the omega-6:omega-3 ratio toward inflammation when over-consumed. Repeated frying oxidises it into harmful aldehydes.',
    sources: 'Most fried snacks, chips, namkeen, packaged fried foods',
    regulatory: 'Permitted; fine in moderation, avoid reused frying oil.',
    replacedBy: 'Cold-pressed mustard/groundnut/sesame oil, rice-bran for high heat.'
  },
  'Cold-pressed oil': {
    name: 'Cold-Pressed / Mustard / Ghee', class: 'Traditional fat',
    alternativeNames: ['Mustard oil', 'Groundnut oil', 'Sesame oil', 'Ghee', 'Coconut oil'],
    risk: 'low', organs: ['heart'],
    issues: 'Largely beneficial — retains antioxidants and a better fatty-acid profile. Saturated types (ghee, coconut) are fine in moderation for most people; limit if you have high cholesterol.',
    sources: 'Traditional cooking, premium snacks',
    regulatory: 'Permitted; preferred by nutritionists.',
    replacedBy: 'No replacement needed.'
  },

  // ============================ SYNTHETIC COLOURS ==========================
  'Tartrazine (INS 102)': {
    name: 'Tartrazine (INS 102)', class: 'Synthetic colour (azo)',
    alternativeNames: ['INS 102', 'Tartrazine', 'Yellow 5', 'E102'],
    risk: 'high', organs: ['brain', 'immune', 'skin'],
    issues: 'Petroleum-derived azo dye. Strongly linked to hyperactivity and attention problems in children (the “Southampton Six”), and triggers hives, asthma and itching in aspirin-sensitive people.',
    sources: 'Orange/yellow drinks, candies, jellies, namkeen coatings, custard',
    regulatory: 'EU mandates a child-hyperactivity warning; permitted in India with limits.',
    replacedBy: 'Turmeric, saffron, beta-carotene.'
  },
  'Sunset Yellow (INS 110)': {
    name: 'Sunset Yellow FCF (INS 110)', class: 'Synthetic colour (azo)',
    alternativeNames: ['INS 110', 'Sunset Yellow', 'Yellow 6', 'E110'],
    risk: 'high', organs: ['brain', 'immune', 'skin'],
    issues: 'Azo dye linked to hyperactivity in children, allergic urticaria and abdominal pain; animal studies raise tumour and kidney concerns at high doses.',
    sources: 'Orange sodas, jellies, snack coatings, ice creams',
    regulatory: 'EU child-behaviour warning required; permitted in India with limits.',
    replacedBy: 'Beta-carotene, annatto, paprika extract.'
  },
  'Carmoisine (INS 122)': {
    name: 'Carmoisine / Azorubine (INS 122)', class: 'Synthetic colour (azo)',
    alternativeNames: ['INS 122', 'Carmoisine', 'Azorubine', 'E122'],
    risk: 'high', organs: ['brain', 'immune', 'skin'],
    issues: 'Red azo dye linked to hyperactivity/ADHD-type behaviour in children and to hives, asthma and skin itching in sensitive people.',
    sources: 'Mixed-fruit jams, red candies, syrups, red aerated drinks',
    regulatory: 'Banned in the US, Canada, Japan, Norway; allowed in India/EU with limits + warning.',
    replacedBy: 'Beetroot red, hibiscus, elderberry.'
  },
  'Ponceau 4R (INS 124)': {
    name: 'Ponceau 4R (INS 124)', class: 'Synthetic colour (azo)',
    alternativeNames: ['INS 124', 'Ponceau 4R', 'Cochineal Red A', 'E124'],
    risk: 'high', organs: ['brain', 'immune', 'dna'],
    issues: 'Red azo dye on the Southampton hyperactivity list; suspected carcinogen in some animal data and an allergen for aspirin/asthma-sensitive individuals.',
    sources: 'Red drinks, desserts, tinned fruit, confectionery',
    regulatory: 'Banned in the US; permitted in India/EU with limits + warning.',
    replacedBy: 'Beetroot, tomato lycopene, anthocyanins.'
  },
  'Allura Red (INS 129)': {
    name: 'Allura Red AC (INS 129)', class: 'Synthetic colour (azo)',
    alternativeNames: ['INS 129', 'Allura Red', 'Red 40', 'E129'],
    risk: 'high', organs: ['brain', 'gut', 'immune'],
    issues: 'Common red azo dye linked to child hyperactivity; 2022 research links chronic exposure to gut inflammation and colitis susceptibility via the gut lining.',
    sources: 'Red candies, fruit snacks, drinks, baked goods',
    regulatory: 'Permitted with limits; under fresh regulatory scrutiny.',
    replacedBy: 'Beetroot red, paprika, anthocyanins.'
  },
  'Brilliant Blue (INS 133)': {
    name: 'Brilliant Blue FCF (INS 133)', class: 'Synthetic colour',
    alternativeNames: ['INS 133', 'Brilliant Blue', 'Blue 1', 'E133'],
    risk: 'medium', organs: ['brain', 'immune'],
    issues: 'Synthetic triarylmethane dye; possible hyperactivity contributor and rare allergen. Can be absorbed across a compromised gut lining.',
    sources: 'Blue/green candies, ice creams, sports drinks',
    regulatory: 'Permitted with limits.',
    replacedBy: 'Spirulina extract (natural blue), no colour.'
  },
  'Erythrosine (INS 127)': {
    name: 'Erythrosine (INS 127)', class: 'Synthetic colour',
    alternativeNames: ['INS 127', 'Erythrosine', 'Red 3', 'E127'],
    risk: 'high', organs: ['thyroid', 'dna'],
    issues: 'Iodine-rich red dye shown to affect thyroid hormone levels and cause thyroid tumours in rats at high doses; being phased out in some markets.',
    sources: 'Glacé cherries, some candies, decorative icings',
    regulatory: 'US banned Red 3 in food (2025 ruling); restricted elsewhere.',
    replacedBy: 'Beetroot red, natural cherry colour.'
  },
  'Caramel IV (INS 150d)': {
    name: 'Caramel IV — Sulfite-Ammonia (INS 150d)', class: 'Caramel colour',
    alternativeNames: ['INS 150d', 'Caramel IV', 'Sulfite ammonia caramel', 'E150d'],
    risk: 'high', organs: ['dna', 'immune'],
    issues: 'Made by heating sugars with sulfite + ammonia, producing 4-methylimidazole (4-MEI) — classified by IARC as possibly carcinogenic to humans. High doses suppress immune (white-blood-cell) counts in animals.',
    sources: 'Colas, dark soft drinks, chocolate syrups, dark sauces',
    regulatory: 'California Prop-65 cancer warning above a 4-MEI threshold; limits in India/EU.',
    replacedBy: 'Roasted chicory, cocoa, beetroot, dye-free.'
  },
  'Caramel III (INS 150c)': {
    name: 'Caramel III — Ammonia Caramel (INS 150c)', class: 'Caramel colour',
    alternativeNames: ['INS 150c', 'Ammonia caramel', 'E150c'],
    risk: 'medium', organs: ['dna', 'gut'],
    issues: 'Ammonia-process caramel; can carry trace 4-MEI and THI (an immunosuppressant in animals). Lower concern than 150d but still a processed colour.',
    sources: 'Sauces, gravies, beer, baked goods, savoury snacks',
    regulatory: 'Permitted with limits.',
    replacedBy: 'Roasted malt, cocoa, natural browning.'
  },
  'Titanium dioxide (INS 171)': {
    name: 'Titanium Dioxide (INS 171)', class: 'Whitening colour',
    alternativeNames: ['INS 171', 'Titanium dioxide', 'E171'],
    risk: 'high', organs: ['dna', 'gut', 'immune'],
    issues: 'Nano-scale whitener that EFSA concluded can no longer be considered safe — possible genotoxicity (DNA damage) and accumulation; disrupts the gut lining and immune signalling.',
    sources: 'White coatings on candies, chewing gum, icings, some supplements',
    regulatory: 'BANNED as a food additive in the EU (2022); permitted in India.',
    replacedBy: 'Rice starch, calcium carbonate, no whitener.'
  },
  'Annatto (INS 160b)': {
    name: 'Annatto (INS 160b)', class: 'Natural colour',
    alternativeNames: ['INS 160b', 'Annatto', 'Bixin', 'Norbixin'],
    risk: 'low', organs: ['skin', 'immune'],
    issues: 'Natural seed colour, generally safe, but a known trigger of hives and itching in a small subset of sensitive people.',
    sources: 'Butter, cheese, margarine, bakery',
    regulatory: 'Permitted globally as a natural colour.',
    replacedBy: 'Beta-carotene, turmeric.'
  },
  'Beta-carotene (INS 160a)': {
    name: 'Beta-Carotene (INS 160a)', class: 'Natural colour / vitamin',
    alternativeNames: ['INS 160a', 'Beta-carotene', 'Carotenes', 'Provitamin A'],
    risk: 'low', organs: [],
    issues: 'Beneficial natural orange colour and a vitamin-A precursor with antioxidant value. Safe at food levels (very high supplement doses are a separate issue for smokers).',
    sources: 'Juices, butter, cereals, healthy snacks',
    regulatory: 'Permitted; considered safe.',
    replacedBy: 'No replacement needed.'
  },

  // ============================ PRESERVATIVES =============================
  'Sodium benzoate (INS 211)': {
    name: 'Sodium Benzoate (INS 211)', class: 'Preservative',
    alternativeNames: ['INS 211', 'Sodium benzoate', 'Benzoic acid', 'INS 210', 'E211'],
    risk: 'high', organs: ['dna', 'brain', 'immune'],
    issues: 'With vitamin C (ascorbic acid) it can react to form BENZENE, a known human carcinogen — a real risk in citrus sodas/juices. Independently linked to child hyperactivity and cellular oxidative stress.',
    sources: 'Fruit squashes, sodas, sauces, pickles, packaged juices',
    regulatory: 'Permitted with ppm limits; avoid where paired with vitamin C.',
    replacedBy: 'Vinegar, citric acid, refrigeration, pasteurisation.'
  },
  'Potassium sorbate (INS 202)': {
    name: 'Potassium Sorbate / Sorbic Acid (INS 202/200)', class: 'Preservative',
    alternativeNames: ['INS 202', 'INS 200', 'Potassium sorbate', 'Sorbic acid', 'E202'],
    risk: 'medium', organs: ['skin', 'gut', 'dna'],
    issues: 'Mould/yeast inhibitor; generally low-risk but can cause skin/contact irritation and, in lab assays at high concentration, mild DNA/genotoxic signals.',
    sources: 'Cheese, baked goods, dried fruit, jams, drinks',
    regulatory: 'Approved with limits (typically <0.1%).',
    replacedBy: 'Vacuum packing, refrigeration, fermentation.'
  },
  'Sodium metabisulphite (INS 223)': {
    name: 'Sodium Metabisulphite / Sulphites (INS 223)', class: 'Preservative (sulphite)',
    alternativeNames: ['INS 223', 'INS 224', 'INS 220', 'Sodium metabisulphite', 'Sulphur dioxide', 'Sulphites'],
    risk: 'high', organs: ['lungs', 'immune', 'gut'],
    issues: 'Releases sulphur dioxide that can trigger severe, even life-threatening asthma attacks and breathing distress in sulphite-sensitive people. Destroys thiamine (vitamin B1) and irritates the gut.',
    sources: 'Glucose biscuits, dried fruit, doughs, dehydrated potato, fruit pulp, wine',
    regulatory: 'Mandatory “contains sulphites” label above 10 mg/kg in EU/US.',
    replacedBy: 'Vacuum packing, refrigeration, no bleaching.'
  },
  'Sodium nitrite (INS 250)': {
    name: 'Sodium Nitrite / Nitrate (INS 250/251)', class: 'Preservative (curing)',
    alternativeNames: ['INS 250', 'INS 251', 'Sodium nitrite', 'Potassium nitrate', 'Curing salt', 'E250'],
    risk: 'high', organs: ['dna', 'blood', 'heart'],
    issues: 'In cured/processed meat and during high-heat cooking, nitrites form nitrosamines — IARC Group 1 carcinogens linked to colorectal cancer. Can also oxidise haemoglobin (methaemoglobinaemia), dangerous for infants.',
    sources: 'Sausages, salami, ham, bacon, cured/processed meats',
    regulatory: 'Permitted with strict limits; processed meat is IARC Group 1.',
    replacedBy: 'Fresh meat, celery-juice cured (still nitrate), eat less processed meat.'
  },
  'Calcium propionate (INS 282)': {
    name: 'Calcium Propionate (INS 282)', class: 'Preservative',
    alternativeNames: ['INS 282', 'Calcium propionate', 'Propionic acid', 'E282'],
    risk: 'medium', organs: ['brain', 'gut'],
    issues: 'Anti-mould preservative; some children’s studies associate it with irritability, restlessness and sleep disturbance, and it can cause stomach upset in sensitive people.',
    sources: 'Packaged breads, buns, bakery, tortillas',
    regulatory: 'Permitted with limits.',
    replacedBy: 'Fresh bread, refrigeration, sourdough fermentation.'
  },

  // ============================ ANTIOXIDANTS =============================
  'BHA (INS 320)': {
    name: 'Butylated Hydroxyanisole — BHA (INS 320)', class: 'Synthetic antioxidant',
    alternativeNames: ['INS 320', 'BHA', 'Butylated hydroxyanisole', 'E320'],
    risk: 'high', organs: ['dna', 'thyroid', 'reproductive'],
    issues: 'Synthetic fat-preserving antioxidant. IARC classifies BHA as possibly carcinogenic to humans (forestomach tumours in rodents); also flagged as a potential endocrine disruptor affecting thyroid and reproductive hormones.',
    sources: 'Chips, instant noodles, fried snacks, chewing gum, fats',
    regulatory: 'Permitted with limits; IARC Group 2B; restricted in some uses.',
    replacedBy: 'Vitamin E (tocopherols), rosemary extract, fresh oils.'
  },
  'BHT (INS 321)': {
    name: 'Butylated Hydroxytoluene — BHT (INS 321)', class: 'Synthetic antioxidant',
    alternativeNames: ['INS 321', 'BHT', 'Butylated hydroxytoluene', 'E321'],
    risk: 'high', organs: ['dna', 'liver', 'reproductive'],
    issues: 'Petroleum-derived antioxidant; high doses cause liver and lung effects and tumours in animal studies, with possible endocrine/reproductive disruption. Frequently paired with BHA.',
    sources: 'Cereals, chips, fats, instant snacks, gum',
    regulatory: 'Permitted with limits; under re-evaluation.',
    replacedBy: 'Tocopherols (vitamin E), rosemary extract.'
  },
  'TBHQ (INS 319)': {
    name: 'Tertiary Butylhydroquinone — TBHQ (INS 319)', class: 'Synthetic antioxidant',
    alternativeNames: ['INS 319', 'TBHQ', 'E319'],
    risk: 'high', organs: ['immune', 'dna', 'liver'],
    issues: 'Petroleum-based antioxidant. Animal/cell research links it to immune dysfunction (weakened response to infection/vaccines, more allergies) and, at high doses, DNA and liver effects.',
    sources: 'Instant noodles, fried snacks, crackers, fast-food fryer oils',
    regulatory: 'Permitted with strict limits (ADI 0–0.7 mg/kg).',
    replacedBy: 'Vitamin E, rosemary extract, freshly fried foods.'
  },

  // ====================== EMULSIFIERS / STABILISERS ======================
  'Carrageenan (INS 407)': {
    name: 'Carrageenan (INS 407)', class: 'Stabiliser/thickener',
    alternativeNames: ['INS 407', 'Carrageenan', 'E407'],
    risk: 'high', organs: ['gut', 'immune'],
    issues: 'Seaweed thickener that degrades the gut tight-junctions (“leaky gut”) and triggers intestinal inflammation resembling ulcerative colitis; chronic intake linked to bloating, IBS and immune activation.',
    sources: 'Chocolate milk, milkshakes, ice cream, plant milks, whipping cream',
    regulatory: 'Banned from US organic foods; restricted in EU infant formula.',
    replacedBy: 'Sunflower lecithin, guar gum, locust bean gum.'
  },
  'Polysorbate 80 (INS 433)': {
    name: 'Polysorbate 80 (INS 433)', class: 'Emulsifier',
    alternativeNames: ['INS 433', 'Polysorbate 80', 'Tween 80', 'E433'],
    risk: 'high', organs: ['gut', 'immune', 'metabolic'],
    issues: 'Detergent-like emulsifier shown in research to erode the gut mucus barrier, alter the microbiome and promote low-grade inflammation, weight gain and metabolic syndrome in animal models.',
    sources: 'Ice cream, sauces, dressings, baked goods, some supplements',
    regulatory: 'Permitted with limits; flagged by microbiome researchers.',
    replacedBy: 'Lecithin, egg yolk, no emulsifier.'
  },
  'Mono- and diglycerides (INS 471)': {
    name: 'Mono- & Diglycerides (INS 471)', class: 'Emulsifier',
    alternativeNames: ['INS 471', 'Mono and diglycerides', 'Glyceryl monostearate', 'E471'],
    risk: 'medium', organs: ['gut', 'heart'],
    issues: 'Common emulsifier that can shift the microbiome toward inflammation. A bigger hidden issue: it can legally contain trans fats not declared on the nutrition panel.',
    sources: 'Breads, cakes, ice cream, margarine, peanut butter',
    regulatory: 'Permitted; not counted in declared trans-fat figures.',
    replacedBy: 'Lecithin, egg yolk, oil + natural emulsification.'
  },
  'PGPR (INS 476)': {
    name: 'Polyglycerol Polyricinoleate — PGPR (INS 476)', class: 'Emulsifier',
    alternativeNames: ['INS 476', 'PGPR', 'E476'],
    risk: 'medium', organs: ['gut', 'liver'],
    issues: 'Castor-bean emulsifier used to cut costly cocoa butter in chocolate. Considered low-risk at small doses but high intake enlarged the liver in animal studies and can cause GI upset in sensitive people.',
    sources: 'Chocolate, compound coatings, spreads',
    regulatory: 'Permitted; ADI ~7.5 mg/kg.',
    replacedBy: 'Pure cocoa butter, sunflower lecithin.'
  },
  'Lecithin (INS 322)': {
    name: 'Lecithin (INS 322)', class: 'Emulsifier',
    alternativeNames: ['INS 322', 'Soy lecithin', 'Sunflower lecithin', 'E322'],
    risk: 'low', organs: [],
    issues: 'Natural emulsifier from soy/sunflower; benign and even a source of choline. The only caveat is a soy-allergen note for severely soy-allergic individuals.',
    sources: 'Chocolate, baked goods, spreads, plant milks',
    regulatory: 'Permitted; considered safe.',
    replacedBy: 'No replacement needed.'
  },
  'Carboxymethyl cellulose (INS 466)': {
    name: 'Carboxymethyl Cellulose — CMC (INS 466)', class: 'Thickener/stabiliser',
    alternativeNames: ['INS 466', 'CMC', 'Carboxymethyl cellulose', 'Cellulose gum', 'E466'],
    risk: 'medium', organs: ['gut', 'metabolic'],
    issues: 'Synthetic cellulose gum; human trials show it can disturb the microbiome and gut lining, promoting inflammation and altering blood-sugar control in susceptible people.',
    sources: 'Ice cream, low-fat dairy, baked goods, sauces',
    regulatory: 'Permitted; microbiome concerns emerging.',
    replacedBy: 'Guar/locust bean gum, no thickener.'
  },
  'Xanthan gum (INS 415)': {
    name: 'Xanthan Gum (INS 415)', class: 'Thickener (fermentation)',
    alternativeNames: ['INS 415', 'Xanthan gum', 'E415'],
    risk: 'low', organs: ['gut'],
    issues: 'Fermentation-derived thickener, mostly benign; in large amounts it acts as an osmotic laxative causing bloating, gas and loose stools, and shifts gut gas-producing bacteria.',
    sources: 'Sauces, dressings, gluten-free baking, ketchup',
    regulatory: 'Approved globally.',
    replacedBy: 'Guar gum, arrowroot, physical thickening.'
  },
  'Guar gum (INS 412)': {
    name: 'Guar Gum (INS 412)', class: 'Natural thickener',
    alternativeNames: ['INS 412', 'Guar gum', 'E412'],
    risk: 'low', organs: ['gut'],
    issues: 'Natural soluble seed fibre — largely beneficial (slows sugar absorption, feeds good bacteria); only causes gas/bloating if over-consumed.',
    sources: 'Ice cream, sauces, gluten-free baking, dairy',
    regulatory: 'Approved; considered safe.',
    replacedBy: 'No replacement needed.'
  },
  'Pectin (INS 440)': {
    name: 'Pectin (INS 440)', class: 'Natural gelling fibre',
    alternativeNames: ['INS 440', 'Pectin', 'Fruit pectin', 'E440'],
    risk: 'low', organs: ['gut'],
    issues: 'Natural fruit fibre; a clean gelling agent that supports digestion. Only massive amounts cause mild gas.',
    sources: 'Jams, jellies, fruit desserts',
    regulatory: 'Approved; considered a beneficial fibre.',
    replacedBy: 'No replacement needed.'
  },

  // ====================== FLAVOUR ENHANCERS (MSG) ======================
  'MSG (INS 621)': {
    name: 'Monosodium Glutamate — MSG (INS 621)', class: 'Flavour enhancer',
    alternativeNames: ['INS 621', 'MSG', 'Monosodium glutamate', 'Ajinomoto', 'E621'],
    risk: 'high', organs: ['brain', 'metabolic'],
    issues: 'Free-glutamate excitotoxin that overstimulates brain receptors — can cause headache, flushing, sweating and chest tightness (“MSG symptom complex”) in sensitive people. By boosting palatability it overrides fullness signals, promoting overeating and obesity.',
    sources: 'Instant noodles, chips, seasoned snacks, soups, Chinese seasonings',
    regulatory: 'Permitted with labelling; banned in infant foods.',
    replacedBy: 'Tomato/mushroom powder, yeast extract, spices, sea salt.'
  },
  'Disodium inosinate/guanylate (INS 627/631)': {
    name: 'Disodium Guanylate & Inosinate (INS 627/631)', class: 'Flavour enhancer',
    alternativeNames: ['INS 627', 'INS 631', 'INS 635', 'Disodium ribonucleotides', 'Sodium inosinate', 'Sodium guanylate'],
    risk: 'medium', organs: ['brain', 'metabolic', 'skin'],
    issues: 'MSG-booster nucleotides that multiply savoury taste so you eat more, bypassing satiety. Metabolised into purines/uric acid — unsuitable for gout sufferers — and can cause rashes/itching in sensitive people.',
    sources: 'Flavoured chips, instant noodles, soups, gravies',
    regulatory: 'Permitted with labelling; banned in infant foods.',
    replacedBy: 'Mushroom/tomato powder, sea salt, herbs.'
  },
  'Yeast extract': {
    name: 'Yeast Extract', class: 'Flavour enhancer (natural)',
    alternativeNames: ['Yeast extract', 'Autolysed yeast', 'Hydrolysed protein'],
    risk: 'medium', organs: ['brain', 'metabolic'],
    issues: 'A “clean-label” source of free glutamate — the same active molecule as MSG — so it boosts flavour and can drive overeating, though it’s less concentrated. Marketed as natural.',
    sources: 'Soups, snack seasonings, sauces, “no added MSG” products',
    regulatory: 'Permitted; not classed as an additive.',
    replacedBy: 'Real stock, spices, fermented sauces.'
  },

  // ====================== ARTIFICIAL SWEETENERS ======================
  'Aspartame (INS 951)': {
    name: 'Aspartame (INS 951)', class: 'Artificial sweetener',
    alternativeNames: ['INS 951', 'Aspartame', 'Equal', 'E951'],
    risk: 'high', organs: ['brain', 'dna', 'metabolic'],
    issues: 'IARC (2023) classified aspartame as possibly carcinogenic to humans (Group 2B). Some people report headaches/migraines; can disturb gut bacteria and glucose handling. Dangerous for people with PKU (phenylketonuria).',
    sources: 'Diet sodas, sugar-free gum, “zero” drinks, tabletop sweeteners',
    regulatory: 'Permitted within ADI; IARC 2B; mandatory PKU warning.',
    replacedBy: 'Stevia, monk fruit, or simply less sweetness.'
  },
  'Sucralose (INS 955)': {
    name: 'Sucralose (INS 955)', class: 'Artificial sweetener',
    alternativeNames: ['INS 955', 'Sucralose', 'Splenda', 'E955'],
    risk: 'medium', organs: ['gut', 'metabolic', 'dna'],
    issues: 'Chlorinated sweetener that reduces beneficial gut bacteria and may impair blood-sugar control; heating it (baking) can generate chloropropanols and other potentially harmful compounds.',
    sources: 'Diet drinks, sugar-free desserts, protein bars, baked “sugar-free” goods',
    regulatory: 'Permitted within ADI; avoid using it for baking.',
    replacedBy: 'Stevia, monk fruit, small amounts of real sugar.'
  },
  'Acesulfame K (INS 950)': {
    name: 'Acesulfame Potassium (INS 950)', class: 'Artificial sweetener',
    alternativeNames: ['INS 950', 'Acesulfame K', 'Ace-K', 'E950'],
    risk: 'medium', organs: ['gut', 'metabolic'],
    issues: 'Heat-stable sweetener often blended with others; animal data suggest microbiome disruption and possible metabolic/insulin effects; not metabolised, excreted by kidneys.',
    sources: 'Diet sodas, sugar-free gum, protein powders',
    regulatory: 'Permitted within ADI.',
    replacedBy: 'Stevia, monk fruit.'
  },
  'Saccharin (INS 954)': {
    name: 'Saccharin (INS 954)', class: 'Artificial sweetener',
    alternativeNames: ['INS 954', 'Saccharin', 'E954'],
    risk: 'medium', organs: ['gut', 'metabolic', 'dna'],
    issues: 'Oldest artificial sweetener; once linked to bladder tumours in rats (mechanism considered rat-specific) and shown in humans to alter gut bacteria and raise blood-sugar responses in some people.',
    sources: 'Tabletop sweeteners, sugar-free sweets, some drinks',
    regulatory: 'Permitted within ADI (delisted as a carcinogen).',
    replacedBy: 'Stevia, monk fruit.'
  },
  'Sorbitol / Maltitol (INS 420/965)': {
    name: 'Sugar Alcohols — Sorbitol/Maltitol (INS 420/965)', class: 'Polyol sweetener',
    alternativeNames: ['INS 420', 'INS 965', 'Sorbitol', 'Maltitol', 'Polyols'],
    risk: 'medium', organs: ['gut', 'metabolic'],
    issues: 'Sugar alcohols that are poorly absorbed, drawing water into the bowel — strong laxative effect, bloating, gas and diarrhoea above modest amounts. Maltitol still raises blood sugar moderately.',
    sources: 'Sugar-free chocolate, mints, gum, diabetic sweets',
    regulatory: 'Permitted; EU mandates “excess consumption may have laxative effects”.',
    replacedBy: 'Stevia, erythritol (better tolerated), whole fruit.'
  },
  'Stevia (INS 960)': {
    name: 'Steviol Glycosides — Stevia (INS 960)', class: 'Natural sweetener',
    alternativeNames: ['INS 960', 'Stevia', 'Steviol glycosides', 'E960'],
    risk: 'low', organs: [],
    issues: 'Plant-derived zero-calorie sweetener, generally considered safe within ADI and a good sugar replacement. Very high intakes may mildly affect gut flora in some people.',
    sources: 'Diet drinks, “naturally sweetened” products',
    regulatory: 'Permitted; considered a safer sweetener choice.',
    replacedBy: 'No replacement needed (use in moderation).'
  },

  // ====================== ACIDITY / PHOSPHATES / OTHERS ======================
  'Phosphoric acid (INS 338)': {
    name: 'Phosphoric Acid (INS 338)', class: 'Acidity regulator',
    alternativeNames: ['INS 338', 'Phosphoric acid', 'Orthophosphoric acid', 'E338'],
    risk: 'medium', organs: ['bones', 'kidney', 'teeth'],
    issues: 'The tang in colas. High dietary phosphoric acid is linked to lower bone mineral density and kidney stress, and its acidity directly erodes tooth enamel.',
    sources: 'Cola soft drinks, some processed cheese',
    regulatory: 'Permitted; bone-health concern with heavy cola intake.',
    replacedBy: 'Water, citrus-infused water, no cola.'
  },
  'Citric acid (INS 330)': {
    name: 'Citric Acid (INS 330)', class: 'Acidity regulator',
    alternativeNames: ['INS 330', 'Citric acid', 'E330'],
    risk: 'low', organs: ['teeth'],
    issues: 'Very common, generally safe acid (though usually made industrially from mould fermentation, not citrus). Frequent acidic drinks can erode enamel; rare reports of sensitivity.',
    sources: 'Drinks, candies, sauces, jams — everywhere',
    regulatory: 'Permitted; GRAS.',
    replacedBy: 'Lemon juice; no swap usually needed.'
  },
  'Sodium / Salt': {
    name: 'Salt / Sodium', class: 'Mineral',
    alternativeNames: ['Salt', 'Sodium chloride', 'Iodised salt', 'Sea salt'],
    risk: 'medium', organs: ['heart', 'kidney'],
    issues: 'Essential in small amounts, but packaged foods stack up fast. Excess sodium raises blood pressure, strains the heart and kidneys, and is linked to stroke and stomach-cancer risk.',
    sources: 'Chips, namkeen, instant noodles, sauces, pickles, processed cheese',
    regulatory: 'WHO: <2,000 mg sodium (5 g salt)/day.',
    replacedBy: 'Less salt, more spices/herbs, potassium salt blends.'
  },
  'Aluminium additives (INS 554/541)': {
    name: 'Aluminium Additives (INS 541/554)', class: 'Anti-caking / raising agent',
    alternativeNames: ['INS 541', 'INS 554', 'Sodium aluminium phosphate', 'Sodium aluminosilicate', 'Aluminium'],
    risk: 'medium', organs: ['brain', 'bones', 'kidney'],
    issues: 'Aluminium-bearing anti-caking and raising agents add to total aluminium intake, which accumulates in bone and brain tissue and is a long-debated neurotoxicity concern; the kidneys must clear it.',
    sources: 'Some baking powders, processed cheese, powdered mixes, table-salt anti-caking',
    regulatory: 'EFSA set a tolerable weekly aluminium intake; limits apply.',
    replacedBy: 'Aluminium-free baking powder, silicon dioxide.'
  },
  'Silicon dioxide (INS 551)': {
    name: 'Silicon Dioxide (INS 551)', class: 'Anti-caking agent',
    alternativeNames: ['INS 551', 'Silicon dioxide', 'Silica', 'E551'],
    risk: 'low', organs: ['gut'],
    issues: 'Keeps powders free-flowing; mostly inert and poorly absorbed. Nano-form is under review for gut-lining effects, but food-grade use is considered low-risk.',
    sources: 'Spice mixes, powdered drinks, salt, seasoning sachets',
    regulatory: 'Permitted; nano-grade under EFSA review.',
    replacedBy: 'Rice flour anti-caking, keep dry.'
  },
  'Modified starch': {
    name: 'Modified Starch', class: 'Thickener/stabiliser',
    alternativeNames: ['Modified starch', 'Modified corn starch', 'INS 1400 series', 'E1442'],
    risk: 'low', organs: ['metabolic'],
    issues: 'Chemically/physically altered starch used to thicken and stabilise. Generally safe but a refined, high-glycemic carbohydrate that adds to the blood-sugar load with no nutrition.',
    sources: 'Sauces, instant gravies, soups, ready meals, desserts',
    regulatory: 'Permitted; considered safe.',
    replacedBy: 'Whole-food thickeners (lentil flour), less processed foods.'
  },
  'Artificial flavours': {
    name: 'Artificial / Nature-Identical Flavours', class: 'Flavouring',
    alternativeNames: ['Artificial flavour', 'Nature-identical flavour', 'Added flavour', 'Flavouring substances'],
    risk: 'medium', organs: ['brain', 'metabolic'],
    issues: 'Undisclosed lab blends engineered to make hyper-palatable food irresistible, encouraging overeating. Specific mixtures are proprietary and unlisted; some components cause sensitivities. Their main harm is driving consumption of junk food.',
    sources: 'Almost all flavoured snacks, drinks, dairy and confectionery',
    regulatory: 'Permitted; exact composition not disclosed on label.',
    replacedBy: 'Real spices, fruit, cocoa, herbs.'
  },
  'Mineral oil / wax (INS 905)': {
    name: 'Mineral Oil / Microcrystalline Wax (INS 905)', class: 'Glazing agent',
    alternativeNames: ['INS 905', 'Microcrystalline wax', 'Mineral hydrocarbons', 'Liquid paraffin'],
    risk: 'medium', organs: ['liver', 'immune', 'dna'],
    issues: 'Petroleum-derived glazing/release agents. Mineral oil aromatic hydrocarbons (MOAH) can accumulate in body tissue and include possible genotoxic/carcinogenic fractions; saturated fractions build up in liver and lymph nodes.',
    sources: 'Coated/glazed confectionery, chewing gum, rice/grain coatings',
    regulatory: 'EFSA flagged MOAH concern; limits/migration controls apply.',
    replacedBy: 'Carnauba/beeswax glaze, uncoated foods.'
  },

  // ====================== DAIRY / PROTEIN / COCOA ======================
  'Milk solids / SMP': {
    name: 'Milk Solids / Skimmed Milk Powder', class: 'Dairy',
    alternativeNames: ['Milk solids', 'Skimmed milk powder', 'Milk powder', 'Whey'],
    risk: 'low', organs: [],
    issues: 'Generally a beneficial protein/calcium source. Watch only for added sugar in sweetened milk products and for lactose-intolerant individuals (bloating/gas).',
    sources: 'Chocolates, biscuits, dairy drinks, ice cream',
    regulatory: 'Permitted; nutritious.',
    replacedBy: 'No replacement needed (choose unsweetened).'
  },
  'Cocoa solids': {
    name: 'Cocoa Solids / Cocoa Mass', class: 'Plant',
    alternativeNames: ['Cocoa solids', 'Cocoa mass', 'Cocoa powder', 'Cacao'],
    risk: 'low', organs: [],
    issues: 'Beneficial — rich in flavonoid antioxidants that support heart and brain (best in dark chocolate). The concern in chocolate is the added sugar and fat around it, not the cocoa.',
    sources: 'Dark chocolate, cocoa drinks, baked goods',
    regulatory: 'Permitted; beneficial in dark forms.',
    replacedBy: 'Choose higher cocoa %, less sugar.'
  },
  'Nuts & seeds': {
    name: 'Nuts & Seeds', class: 'Whole food',
    alternativeNames: ['Almond', 'Cashew', 'Peanut', 'Flax', 'Sunflower seed', 'Chia'],
    risk: 'low', organs: [],
    issues: 'Beneficial — healthy fats, protein, fibre and minerals supporting heart and metabolism. The only real risk is severe allergy (peanut/tree nut) for sensitised people.',
    sources: 'Trail mixes, energy bars, premium snacks, nut butters',
    regulatory: 'Permitted; nutritious. Allergen labelling required.',
    replacedBy: 'No replacement needed (mind allergies).'
  },
}

// ---- Lookup helpers (used by ProductDetail decoder & the body-toxicity chart)

// All searchable keys for an entry: its display name + alternative names.
function aliasesOf(entry) {
  return [entry.name, ...(entry.alternativeNames || [])].filter(Boolean)
}

// Best-effort match of a raw on-pack ingredient string to an encyclopedia entry.
export function findIngredient(raw) {
  if (!raw) return null
  const s = String(raw).toLowerCase()
  let best = null, bestLen = 0
  for (const key of Object.keys(ingredientsDb)) {
    const entry = ingredientsDb[key]
    for (const alias of [key, ...aliasesOf(entry)]) {
      const a = alias.toLowerCase()
      if (a.length < 3) continue
      if (s.includes(a) || a.includes(s)) {
        if (a.length > bestLen) { best = entry; bestLen = a.length }
      }
    }
    // match bare INS / E numbers e.g. "INS 621", "E211", "(102)"
    const codeMatch = s.match(/\b(?:ins|e)?\s*0?(\d{3}[a-d]?)\b/i)
    if (codeMatch) {
      const code = codeMatch[1]
      if (aliasesOf(entry).some(a => new RegExp(`\\b${code}\\b`, 'i').test(a)) && bestLen < 4) { best = entry; bestLen = 4 }
    }
  }
  return best
}

// Every entry that lists a given organ-system key, ranked high→low risk.
const RISK_RANK = { high: 3, medium: 2, low: 1 }
export function ingredientsForOrgan(organKey) {
  return Object.values(ingredientsDb)
    .filter(e => (e.organs || []).includes(organKey))
    .sort((a, b) => (RISK_RANK[b.risk] - RISK_RANK[a.risk]) || a.name.localeCompare(b.name))
}

// Toxic-load tally across the whole encyclopedia, per organ system.
export function organLoadIndex() {
  const idx = {}
  for (const key of Object.keys(ORGAN_SYSTEMS)) idx[key] = { high: 0, medium: 0, low: 0, total: 0 }
  for (const e of Object.values(ingredientsDb)) {
    for (const o of e.organs || []) {
      if (!idx[o]) continue
      idx[o][e.risk] = (idx[o][e.risk] || 0) + 1
      idx[o].total += 1
    }
  }
  return idx
}
