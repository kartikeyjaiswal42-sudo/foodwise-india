export const ingredientsDb = {
  'Refined wheat flour (Maida)': {
    name: 'Refined wheat flour (Maida)',
    alternativeNames: ['Maida', 'Refined wheat flour', 'Enriched flour'],
    risk: 'high',
    organs: ['gut', 'metabolic'],
    issues: 'Stripped of fiber, bran, and germ, leaving pure starch. It digests extremely fast, causing severe blood glucose spikes. Over consumption forces high insulin releases, leading to insulin resistance, visceral fat gain, and sluggish gut motility (constipation). It is also bleached with chemical agents (like benzoyl peroxide or chlorine) in some industrial settings.',
    sources: 'Noodles, biscuits, cookies, white bread, frozen snacks',
    regulatory: 'Permitted globally, but public health agencies urge reduction in favor of whole grains.',
    replacedBy: 'Whole grains like whole wheat (Atta), Ragi, Jowar, Bajra, Foxtail millet, Oats flour.'
  },
  'Palm oil': {
    name: 'Edible Vegetable Oil (Palm oil)',
    alternativeNames: ['Palm oil', 'Palmolein oil', 'Hydrogenated palm fat'],
    risk: 'high',
    organs: ['heart', 'metabolic'],
    issues: 'Consists of ~50% saturated fatty acids (mostly palmitic acid), which raises LDL (bad) cholesterol, leading to arterial plaque formation and coronary artery disease. Often heavily refined and deodorized at high temperatures (>200°C), which creates genotoxic and carcinogenic process contaminants (MCPD esters and glycidyl fatty acid esters).',
    sources: 'Instant noodles, potato chips, commercial cookies, chocolate creams',
    regulatory: 'Permitted worldwide, but requires labeling as "Palm Oil" in the EU instead of generic "Vegetable Oil" to aid consumer transparency.',
    replacedBy: 'Cold-pressed oils (mustard, sesame, peanut, coconut), rice bran oil, butter (in moderation), or dry-roasting.'
  },
  'Sugar': {
    name: 'Refined Sugar',
    alternativeNames: ['White sugar', 'Sucrose', 'Added sugars'],
    risk: 'high',
    organs: ['metabolic', 'liver'],
    issues: 'Consists of 50% glucose and 50% fructose. Fructose must be metabolized by the liver; an overload causes the liver to convert excess sugar directly into fat, leading to Non-Alcoholic Fatty Liver Disease (NAFLD) and insulin resistance. High consumption is the primary driver of type 2 diabetes, tooth decay, systemic inflammation, and metabolic syndrome.',
    sources: 'Carbonated beverages, chocolate syrups, cream biscuits, breakfast cereals',
    regulatory: 'WHO recommends keeping added sugars under 5% of daily calories (approx 25g/day).',
    replacedBy: 'Organic date powder, whole fruit pulp, stevia extract, monk fruit, or small amounts of raw jaggery/honey.'
  },
  'Liquid Glucose': {
    name: 'Liquid Glucose',
    alternativeNames: ['Glucose syrup', 'Corn syrup', 'HFCS'],
    risk: 'high',
    organs: ['metabolic', 'liver'],
    issues: 'Concentrated solution of glucose and maltose, absorbed almost immediately into the bloodstream. It triggers a massive insulin surge, stressing the pancreas. Over time, frequent consumption leads to metabolic exhaustion, fat deposition, and increased hunger signals (by suppressing leptin, the satiety hormone).',
    sources: 'Confectionery, chocolates, syrups, jams',
    regulatory: 'Permitted globally, but treated as an added free sugar with strict daily recommended limits.',
    replacedBy: 'Naturally sweet whole foods like dates, raisins, or fresh fruits.'
  },
  'Invert sugar syrup': {
    name: 'Invert Sugar Syrup',
    alternativeNames: ['Invert syrup', 'Inverted sugar'],
    risk: 'high',
    organs: ['metabolic', 'liver'],
    issues: 'Liquid mixture of glucose and fructose prepared by heating sucrose with acid. Absorbed faster than regular table sugar, causing sharper insulin spikes. Contributes heavily to hepatic fat storage and cellular inflammation when eaten frequently in packaged baked goods.',
    sources: 'Cream biscuits, cookies, confectionery, ketchups',
    regulatory: 'Approved globally as a sweetener.',
    replacedBy: 'Natural unrefined sweeteners like dates paste, applesauce, or raw jaggery.'
  },
  'Malt extract (INS 1400 / Maltodextrin)': {
    name: 'Malt Extract / Maltodextrin',
    alternativeNames: ['Maltodextrin', 'INS 1400', 'Malt extract'],
    risk: 'high',
    organs: ['metabolic', 'gut'],
    issues: 'An ultra-processed starch derivative. Has a glycemic index of 110-136—significantly higher than table sugar! This causes dangerous blood glucose spikes. Furthermore, research shows maltodextrin alters gut bacteria composition, impairing the protective mucosal lining of the intestine, increasing susceptibility to inflammatory bowel diseases (IBD), and feeding harmful microbes.',
    sources: 'Packaged soups, spice mixes, nutritional health drinks, energy bars, instant cereals',
    regulatory: 'Approved as a safe food additive, but highly criticized by metabolists and gastroenterologists.',
    replacedBy: 'Natural thickeners like lentil flour, whole-grain starches, or no thickeners.'
  },
  'Maltodextrin': {
    name: 'Maltodextrin',
    alternativeNames: ['Maltodextrin starch', 'INS 1400'],
    risk: 'high',
    organs: ['metabolic', 'gut'],
    issues: 'Starch derivative with an exceptionally high glycemic index. Causes blood sugar spikes higher than glucose. Can alter gut microbiota, reducing beneficial bacteria and thinning the protective intestinal mucus layer, potentially leading to gut permeability issues.',
    sources: 'Health drink powders, seasonings, instant gravies, energy bars',
    regulatory: 'Permitted globally; widely used as a cheap bulking agent.',
    replacedBy: 'Whole food flours, almond powders, or leaving seasonings dry.'
  },
  'Stabiliser (INS 407 / Carrageenan)': {
    name: 'Carrageenan (INS 407)',
    alternativeNames: ['INS 407', 'Carrageenan', 'E407'],
    risk: 'high',
    organs: ['gut'],
    issues: 'A seaweed-derived thickening agent. In the gastrointestinal tract, carrageenan acts as a severe inflammatory agent. It degrades the gut tight junctions (causing "leaky gut" syndrome) and triggers mucosal inflammation similar to ulcerative colitis. Chronic ingestion is associated with bloating, irritable bowel syndrome (IBS), food allergies, and altered microbiome flora.',
    sources: 'Packaged chocolate milk, milkshakes, ice creams, whipping creams',
    regulatory: 'Approved in India and US; prohibited in organic foods in the US, and restricted in infant formulas in the EU due to gastrointestinal concerns.',
    replacedBy: 'Sunflower lecithin, guar gum (natural seed fiber), locust bean gum, or simple physical emulsification.'
  },
  'Flavour enhancer (INS 635)': {
    name: 'Disodium 5\'-ribonucleotides (INS 635)',
    alternativeNames: ['INS 635', 'Disodium ribonucleotides', 'E635'],
    risk: 'medium',
    organs: ['cellular'],
    issues: 'A mixture of disodium inosinate and disodium guanylate. Synergizes with MSG to multiply the savory flavor of foods, tricking the brain into overeating. In sensitive individuals, it can cause skin rashes, itching, and hives. Should be strictly avoided by people with gout or uric acid issues, as it metabolizes into purines.',
    sources: 'Instant noodles, seasoned potato chips, instant soups, packed gravies',
    regulatory: 'Approved in India and EU, but prohibited in foods specifically targeted at infants and toddlers.',
    replacedBy: 'Natural flavor ingredients like tomato powder, yeast extract, dehydrated mushrooms, sea salt, or pure spices.'
  },
  'Flavour enhancers (INS 627, INS 631)': {
    name: 'Disodium Guanylate (INS 627) & Disodium Inosinate (INS 631)',
    alternativeNames: ['INS 627', 'INS 631', 'Sodium guanylate', 'Sodium inosinate'],
    risk: 'medium',
    organs: ['cellular'],
    issues: 'Works as chemical flavor enhancers that over-stimulate taste buds. These additives bypass natural satiety mechanisms, causing customers to eat larger portions of processed food. Can cause mild allergic reactions and are metabolized into uric acid, making them unsuitable for gout sufferers.',
    sources: 'Flavored potato chips, snacks, instant soups, instant noodles',
    regulatory: 'Permitted food additives, but must be explicitly declared on labels.',
    replacedBy: 'Natural seasonings, sea salt, black pepper, herbs.'
  },
  'Flavour enhancer (INS 621)': {
    name: 'Monosodium Glutamate (INS 621 / MSG)',
    alternativeNames: ['INS 621', 'MSG', 'Monosodium Glutamate', 'Ajinomoto'],
    risk: 'high',
    organs: ['cellular', 'metabolic'],
    issues: 'MSG is an excitotoxin that overstimulates neurotransmitters in the brain. Can cause "MSG Symptom Complex" (headaches, sweating, flushing, chest tightness, numbness) in sensitive individuals. It artificially enhances food palatability, which overrides metabolic full signals, promoting obesity and food addiction cycles.',
    sources: 'Chinese food seasonings, instant noodles, potato chips, spicy snack mixes',
    regulatory: 'Permitted in most countries with strict labeling rules. Prohibited in foods for infants.',
    replacedBy: 'Natural fermentation products (tamari, soy sauce), yeast extract, sea salt, spices.'
  },
  'Color (INS 150d / Caramel IV)': {
    name: 'Caramel IV - Acid Sulfite Ammonia (INS 150d)',
    alternativeNames: ['INS 150d', 'Caramel IV', 'Sulfite ammonia caramel', 'E150d'],
    risk: 'high',
    organs: ['cellular'],
    issues: 'Manufactured by heating carbohydrates in the presence of sulfite and ammonium compounds. This chemical reaction produces a byproduct called 4-methylimidazole (4-MEI). The World Health Organization (IARC) has classified 4-MEI as "possibly carcinogenic to humans." It is also linked to immune suppression in high animal doses.',
    sources: 'Cola soft drinks, chocolate syrups, dark beers, bakery toppings',
    regulatory: 'Permitted in India and EU with maximum limits. In California, foods containing 4-MEI above a threshold must carry a cancer warning label (Proposition 65).',
    replacedBy: 'Natural colorants like beetroot juice extract, roasted chicory, cocoa powder, or leaving the food dye-free.'
  },
  'Synthetic food colour (INS 122 / Carmoisine)': {
    name: 'Carmoisine / Azorubine (INS 122)',
    alternativeNames: ['INS 122', 'Carmoisine', 'Red dye 122', 'E122'],
    risk: 'high',
    organs: ['cellular'],
    issues: 'A red synthetic azo dye derived from petroleum. Highly linked to allergic responses (hives, asthma flares, skin itching) and linked to hyperactive behavior and ADHD symptoms in children. The European Union requires warnings on food containing azo dyes stating they "may have an adverse effect on activity and attention in children."',
    sources: 'Mixed fruit jams, candies, red syrups, aerated red drinks',
    regulatory: 'Banned in the United States, Canada, Japan, and Norway due to safety concerns. Allowed in India with strict concentration limits.',
    replacedBy: 'Natural red colorants like beetroot red, hibiscus extract, or elderberry juice.'
  },
  'Preservative (INS 211 / Sodium Benzoate)': {
    name: 'Sodium Benzoate (INS 211)',
    alternativeNames: ['INS 211', 'Sodium benzoate', 'E211'],
    risk: 'high',
    organs: ['cellular', 'gut'],
    issues: 'A synthetic chemical preservative. In the presence of Vitamin C (ascorbic acid) in soft drinks or juices, sodium benzoate can react to form Benzene—a highly toxic chemical and known human carcinogen. In addition, sodium benzoate has been linked to increased hyperactivity and ADHD symptoms in children, and cell oxidative stress.',
    sources: 'Sauces, fruit squashes, carbonated soft drinks, packaged fruit juices, pickles',
    regulatory: 'Permitted with strict parts-per-million (ppm) limits. Health advocates recommend avoiding products that pair INS 211 with Vitamin C.',
    replacedBy: 'Natural preservatives like vinegar, citric acid, cold-pressed oils, pasteurization, or cold-chain storage.'
  },
  'Dough conditioner (INS 223)': {
    name: 'Sodium Metabisulphite (INS 223)',
    alternativeNames: ['INS 223', 'Sodium metabisulphite', 'Sulphites'],
    risk: 'high',
    organs: ['cellular', 'gut'],
    issues: 'A chemical chemical bleaching and conditioning agent. Releases sulfur dioxide gas, which can trigger severe, life-threatening asthma attacks and respiratory distress in sulphite-sensitive individuals. Also destroys Thiamine (Vitamin B1) in the food and can irritate the gastrointestinal tract.',
    sources: 'Glucose biscuits, commercial flour doughs, dried potato flakes',
    regulatory: 'Approved with maximum limits. Must carry warning declarations in the EU/US if concentrations exceed 10mg/kg.',
    replacedBy: 'Physical dough rest, enzymes, or leaving the flour natural.'
  },
  'Thickener (INS 415 / Xanthan Gum)': {
    name: 'Xanthan Gum (INS 415)',
    alternativeNames: ['INS 415', 'Xanthan gum', 'E415'],
    risk: 'medium',
    organs: ['gut'],
    issues: 'A polysaccharide produced by fermenting simple sugars with the bacteria Xanthomonas campestris. While generally safe in low quantities, in high doses it acts as an osmotic laxative, drawing water into the bowel. It can cause bloating, gas, loose stools, and alter the gut microbiome in sensitive people by selectively feeding certain gas-producing bacteria strains.',
    sources: 'Chocolate syrups, salad dressings, gluten-free baked goods, ketchup',
    regulatory: 'Approved globally as a food additive.',
    replacedBy: 'Stone-ground nut/seed paste, arrowroot powder, tapioca starch, or physical thickening.'
  },
  'INS 440 / Pectin': {
    name: 'Pectin (INS 440)',
    alternativeNames: ['INS 440', 'Pectin', 'Fruit pectin'],
    risk: 'low',
    organs: ['gut'],
    issues: 'A natural structural heteropolysaccharide found in the primary cell walls of terrestrial plants (typically apples/citrus). Acts as a dietary fiber and is generally safe, although industrial extractions use acid washes. Can cause mild gas or loose stools in highly sensitive people if eaten in massive quantities.',
    sources: 'Jams, jellies, marmalades, dessert sauces',
    regulatory: 'Approved globally as a safe, natural thickener.',
    replacedBy: 'No replacement needed; pectin itself is a clean fiber.'
  }
}
