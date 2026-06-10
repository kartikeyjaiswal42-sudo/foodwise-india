export const products = [
  {
    id: 'maggi',
    name: '2-Minute Masala Noodles',
    brand: 'MAGGI',
    company: 'Nestlé India',
    category: 'Instant food',
    price: 15,
    size: '70 g pack',
    score: 38,
    grade: 'D',
    color: '#F2C84B',
    ink: '#C8202F',
    accent: 'MASALA',
    calories: 310,
    servingSize: '70g',
    nutrients: { sugar: 3.2, sodium: 870, satFat: 6.2 },
    concerns: [
      { name: 'High sodium', level: 'high', amount: '870 mg', note: '38% of the suggested daily limit (2,300 mg) in just one pack.' },
      { name: 'Refined flour (Maida)', level: 'high', amount: 'Main ingredient', note: 'Stripped of fiber, leading to rapid blood sugar spikes.' },
      { name: 'Palm oil', level: 'medium', amount: 'In noodle cake', note: 'Rich in saturated fats; highly processed cooking medium.' },
      { name: 'Flavour enhancer (635)', level: 'medium', amount: 'Permitted additive', note: 'Disodium 5\'-ribonucleotides can trigger reactions in sensitive individuals.' }
    ],
    ingredients: ['Refined wheat flour (Maida)', 'Palm oil', 'Iodised salt', 'Spices & condiments (Onion powder, Coriander, Turmeric, Cumin, Aniseed, Ginger, Fenugreek, Black pepper, Clove, Nutmeg, Cardamom)', 'Sugar', 'Wheat gluten', 'Flavour enhancer (INS 635)', 'Acidity regulators (INS 501(i), INS 500(i), INS 330)', 'Thickener (INS 412)', 'Humectant (INS 451(i))'],
    bestFor: 'Rare convenience',
    alternative: 'slurrp',
    alternativeCompare: {
      pricePerUnitDiffText: '₹1.08/g vs ₹0.21/g',
      ingredientsAvoided: ['Refined wheat flour (Maida)', 'Palm oil', 'INS 635 (Flavour enhancer)'],
      ingredientsReplacedWith: [
        { avoided: 'Refined wheat flour (Maida)', replaced: 'Foxtail & Little millet flours' },
        { avoided: 'Palm oil', replaced: 'Rice bran oil (low heat spray)' },
        { avoided: 'INS 635', replaced: 'Natural spices & onion powder' }
      ]
    }
  },
  {
    id: 'slurrp',
    name: 'Millet Noodles (Yummy Masala)',
    brand: 'Slurrp Farm',
    company: 'Wholsum Foods',
    category: 'Instant food',
    price: 65,
    size: '60 g pack',
    score: 84,
    grade: 'A',
    color: '#F3AA70',
    ink: '#22372E',
    accent: 'MILLETS',
    calories: 220,
    servingSize: '60g',
    nutrients: { sugar: 1.0, sodium: 380, satFat: 1.2 },
    concerns: [
      { name: 'Moderate sodium', level: 'medium', amount: '380 mg', note: 'Significantly lower than conventional noodles, but still counts toward daily limits.' }
    ],
    ingredients: ['Foxtail millet flour', 'Little millet flour', 'Whole wheat flour (Atta)', 'Rice bran oil', 'Salt', 'Spices & seasonings (Coriander, Cumin, Turmeric, Ginger, Black pepper)', 'Dehydrated vegetables (Carrot, Peas, Onion)', 'Acidity regulator (Citric acid)'],
    bestFor: 'Nutritious noodle alternative',
    alternative: 'maggi',
    alternativeCompare: {
      pricePerUnitDiffText: '₹1.08/g vs ₹0.21/g',
      ingredientsAvoided: [],
      ingredientsReplacedWith: []
    }
  },
  {
    id: 'lays',
    name: 'India’s Magic Masala Chips',
    brand: "Lay's",
    company: 'PepsiCo India',
    category: 'Snacks',
    price: 20,
    size: '48 g pack',
    score: 31,
    grade: 'D',
    color: '#315A9F',
    ink: '#FFF7C9',
    accent: 'MAGIC MASALA',
    calories: 257,
    servingSize: '48g',
    nutrients: { sugar: 2.1, sodium: 505, satFat: 6.8 },
    concerns: [
      { name: 'High saturated fat', level: 'high', amount: '6.8 g', note: 'Provides 34% of the daily saturated fat limit in a very small bag.' },
      { name: 'Palm oil', level: 'high', amount: 'Deep frying medium', note: 'Used to deep fry the chips, adding high calories and sat fats.' },
      { name: 'High sodium', level: 'high', amount: '505 mg', note: 'Highly concentrated salt content triggers overeating.' },
      { name: 'Flavour enhancers (627 & 631)', level: 'medium', amount: 'Chemical additives', note: 'Used to trigger umami taste receptors, promoting sensory-specific satiety override.' }
    ],
    ingredients: ['Potatoes', 'Edible vegetable oil (Palm oil)', 'Spices & condiments (Onion powder, Chilli powder, Coriander powder, Garlic powder, Ginger powder, Black pepper, Turmeric)', 'Iodised salt', 'Sugar', 'Flavour enhancers (INS 627, INS 631)', 'Acidity regulators (INS 330, INS 296)'],
    bestFor: 'Occasional indulgence',
    alternative: 'makhana',
    alternativeCompare: {
      pricePerUnitDiffText: '₹1.15/g vs ₹0.41/g',
      ingredientsAvoided: ['Palm oil', 'INS 627 (Flavour enhancer)', 'INS 631 (Flavour enhancer)'],
      ingredientsReplacedWith: [
        { avoided: 'Palm oil (Deep fried)', replaced: 'Rice bran oil (Roasted, not fried)' },
        { avoided: 'INS 627 & 631', replaced: 'Himalayan pink salt & natural black pepper' }
      ]
    }
  },
  {
    id: 'makhana',
    name: 'Himalayan Salt Roasted Makhana',
    brand: 'Farmley',
    company: 'Connedit Business Solutions',
    category: 'Snacks',
    price: 60,
    size: '50 g pack',
    score: 88,
    grade: 'A',
    color: '#EEF0D7',
    ink: '#426037',
    accent: 'ROASTED',
    calories: 180,
    servingSize: '50g',
    nutrients: { sugar: 0.2, sodium: 160, satFat: 0.6 },
    concerns: [
      { name: 'Added salt', level: 'low', amount: '160 mg', note: 'Low sodium load. A much safer alternative for blood pressure management.' }
    ],
    ingredients: ['Fox nuts (Makhana)', 'Olive oil / Rice bran oil (for seasoning)', 'Himalayan pink salt', 'Black pepper powder'],
    bestFor: 'Heart-healthy crunchy snack',
    alternative: 'lays',
    alternativeCompare: {
      pricePerUnitDiffText: '₹1.15/g vs ₹0.41/g',
      ingredientsAvoided: [],
      ingredientsReplacedWith: []
    }
  },
  {
    id: 'coke',
    name: 'Original Taste Cola',
    brand: 'Coca-Cola',
    company: 'Coca-Cola India',
    category: 'Beverages',
    price: 40,
    size: '250 ml bottle',
    score: 15,
    grade: 'E',
    color: '#D93832',
    ink: '#FFFFFF',
    accent: 'COLA',
    calories: 110,
    servingSize: '250ml',
    nutrients: { sugar: 27.5, sodium: 15, satFat: 0 },
    concerns: [
      { name: 'Ultra-high sugar', level: 'high', amount: '27.5 g', note: 'Over 100% of the recommended daily added sugar limit (25g) in one small bottle.' },
      { name: 'Caramel colour (Type IV)', level: 'high', amount: 'Colorant', note: 'Manufactured with ammonia, producing 4-MEI, a suspected carcinogen.' },
      { name: 'Phosphoric acid (INS 338)', level: 'medium', amount: 'Acidity regulator', note: 'Linked to calcium leaching from bones and enamel erosion over time.' }
    ],
    ingredients: ['Carbonated water', 'Sugar', 'Color (INS 150d / Caramel IV)', 'Acidity regulator (INS 338)', 'Caffeine', 'Natural flavours'],
    bestFor: 'Avoid if possible',
    alternative: 'lahori',
    alternativeCompare: {
      pricePerUnitDiffText: '₹0.08/ml vs ₹0.16/ml',
      ingredientsAvoided: ['Excessive added sugar', 'Caramel IV (150d)', 'Phosphoric acid (INS 338)', 'Caffeine'],
      ingredientsReplacedWith: [
        { avoided: 'Sugar (27.5g)', replaced: 'Sugar (12.5g) + Lemon juice & Spices' },
        { avoided: 'Caramel IV (suspicious dye)', replaced: 'Natural spices (Zeera) colouration' },
        { avoided: 'Phosphoric acid', replaced: 'Black salt & Citric acid (natural tang)' }
      ]
    }
  },
  {
    id: 'lahori',
    name: 'Lahori Zeera (Spiced Soda)',
    brand: 'Lahori Zeera',
    company: 'Archian Foods',
    category: 'Beverages',
    price: 20,
    size: '250 ml bottle',
    score: 69,
    grade: 'B',
    color: '#D5E76D',
    ink: '#243E32',
    accent: 'ZEERA',
    calories: 58,
    servingSize: '250ml',
    nutrients: { sugar: 12.5, sodium: 120, satFat: 0 },
    concerns: [
      { name: 'Moderate added sugar', level: 'medium', amount: '12.5 g', note: 'Contains about 3 teaspoons of sugar. Better than cola, but still drink in moderation.' },
      { name: 'Preservative (Sodium benzoate)', level: 'medium', amount: 'INS 211', note: 'Permitted preservative, but can react with vitamin C if present.' }
    ],
    ingredients: ['Carbonated water', 'Sugar', 'Lemon juice', 'Black salt', 'Cumin (Zeera) extract', 'Black pepper', 'Dry ginger', 'Acidity regulator (INS 330)', 'Preservative (INS 211)'],
    bestFor: 'Lower-sugar digestive soda',
    alternative: 'coke',
    alternativeCompare: {
      pricePerUnitDiffText: '₹0.08/ml vs ₹0.16/ml',
      ingredientsAvoided: [],
      ingredientsReplacedWith: []
    }
  },
  {
    id: 'bourbon',
    name: 'Bourbon Chocolate Biscuits',
    brand: 'Britannia',
    company: 'Britannia Industries',
    category: 'Biscuits',
    price: 35,
    size: '120 g pack',
    score: 26,
    grade: 'E',
    color: '#6B382D',
    ink: '#F8DB9F',
    accent: 'BOURBON',
    calories: 215,
    servingSize: '4 biscuits (~40g)',
    nutrients: { sugar: 16.5, sodium: 180, satFat: 5.8 },
    concerns: [
      { name: 'High sugar', level: 'high', amount: '16.5 g', note: 'Nearly 4 teaspoons of sugar in just 4 biscuits.' },
      { name: 'Refined Wheat Flour (Maida)', level: 'high', amount: 'Primary base', note: 'No beneficial dietary fiber, highly refined starch.' },
      { name: 'Hydrogenated vegetable fat', level: 'high', amount: 'In creme filling', note: 'Rich in saturated fats and contains potential trace trans fats.' },
      { name: 'Artificial flavouring', level: 'low', amount: 'Vanillin', note: 'Synthetic flavor compound instead of natural extract.' }
    ],
    ingredients: ['Refined wheat flour (Maida)', 'Sugar', 'Interesterified vegetable fat', 'Cocoa solids', 'Invert syrup', 'Raising agents (INS 503(ii), INS 500(ii))', 'Iodised salt', 'Emulsifier (INS 322 from soy)', 'Artificial flavouring substances (Chocolate & Vanilla)'],
    bestFor: 'Occasional treat',
    alternative: 'millet-cookie',
    alternativeCompare: {
      pricePerUnitDiffText: '₹0.42/g vs ₹0.29/g',
      ingredientsAvoided: ['Refined wheat flour (Maida)', 'Hydrogenated/Interesterified fat', 'Artificial chocolate flavors'],
      ingredientsReplacedWith: [
        { avoided: 'Refined wheat flour (Maida)', replaced: 'Ragi (Finger Millet) & Whole wheat flour' },
        { avoided: 'Interesterified fat', replaced: 'Cold-pressed Rice bran oil' },
        { avoided: 'Refined sugar', replaced: 'Organic Jaggery powder' }
      ]
    }
  },
  {
    id: 'millet-cookie',
    name: 'Ragi & Jaggery Millet Cookies',
    brand: 'Tata Soulfull',
    company: 'Tata Consumer Products',
    category: 'Biscuits',
    price: 50,
    size: '120 g pack',
    score: 78,
    grade: 'B',
    color: '#F6D263',
    ink: '#284234',
    accent: 'RAGI COOKIE',
    calories: 160,
    servingSize: '4 cookies (~40g)',
    nutrients: { sugar: 7.2, sodium: 90, satFat: 1.8 },
    concerns: [
      { name: 'Jaggery content', level: 'medium', amount: '7.2 g', note: 'Though healthier than white sugar, jaggery is still simple carbohydrates.' }
    ],
    ingredients: ['Ragi (Finger millet) flour (35%)', 'Whole wheat flour (Atta) (30%)', 'Organic Jaggery powder', 'Cold-pressed Rice bran oil', 'Milk solids', 'Raising agents (INS 500(ii))', 'Natural cardamom extract', 'Natural vanilla extract'],
    bestFor: 'Fiber-rich tea-time cookie',
    alternative: 'bourbon',
    alternativeCompare: {
      pricePerUnitDiffText: '₹0.42/g vs ₹0.29/g',
      ingredientsAvoided: [],
      ingredientsReplacedWith: []
    }
  },
  {
    id: 'cornflakes',
    name: 'Original Corn Flakes',
    brand: "Kellogg's",
    company: 'Kellogg India',
    category: 'Breakfast',
    price: 190,
    size: '475 g box',
    score: 61,
    grade: 'C',
    color: '#E9BC35',
    ink: '#BD1E2D',
    accent: 'CORN FLAKES',
    calories: 114,
    servingSize: '30g',
    nutrients: { sugar: 2.4, sodium: 238, satFat: 0.1 },
    concerns: [
      { name: 'High sodium', level: 'medium', amount: '238 mg', note: 'Deceptively high sodium (10% of daily limit) in a sweet-tasting breakfast cereal.' },
      { name: 'Malt extract', level: 'medium', amount: 'Sweetening agent', note: 'Highly refined sugar syrup with a very high glycemic index.' },
      { name: 'Low dietary fiber', level: 'medium', amount: '0.6 g', note: 'Stripped of original corn hull nutrients, making it digested very quickly.' }
    ],
    ingredients: ['Milled corn (91.4%)', 'Sugar', 'Malt extract (INS 1400 / Maltodextrin)', 'Iodised salt', 'Vitamins & Minerals (Vitamin C, Niacin, Vitamin B6, Riboflavin, Thiamine, Folate, Iron, Vitamin B12)'],
    bestFor: 'Quick breakfast with added nuts',
    alternative: 'muesli',
    alternativeCompare: {
      pricePerUnitDiffText: '₹0.87/g vs ₹0.40/g',
      ingredientsAvoided: ['Malt extract/Maltodextrin', 'De-hulled processed corn'],
      ingredientsReplacedWith: [
        { avoided: 'Milled corn (Low fiber)', replaced: 'Rolled Oats & Whole wheat flakes' },
        { avoided: 'Malt extract / White sugar', replaced: 'Dried raisins & raw honey' },
        { avoided: 'Added chemical sodium', replaced: 'Natural seed minerals' }
      ]
    }
  },
  {
    id: 'muesli',
    name: 'No Added Sugar Fruit & Nut Muesli',
    brand: 'Yoga Bar',
    company: 'Sproutlife Foods',
    category: 'Breakfast',
    price: 349,
    size: '400 g pouch',
    score: 93,
    grade: 'A',
    color: '#DCE9CA',
    ink: '#253C30',
    accent: 'YOGA MUESLI',
    calories: 135,
    servingSize: '30g',
    nutrients: { sugar: 1.1, sodium: 12, satFat: 0.4 },
    concerns: [
      { name: 'High calorie density', level: 'low', amount: '135 kcal', note: 'High nutrient density from nuts and seeds; keep portions in check.' }
    ],
    ingredients: ['Rolled oats (45%)', 'Whole wheat flakes', 'Dried fruits (Raisins, Cranberries)', 'Nuts & Seeds (Almonds, Pumpkin seeds, Flax seeds, Chia seeds)', 'Raw Honey', 'Natural cinnamon extract'],
    bestFor: 'Clean breakfast base',
    alternative: 'cornflakes',
    alternativeCompare: {
      pricePerUnitDiffText: '₹0.87/g vs ₹0.40/g',
      ingredientsAvoided: [],
      ingredientsReplacedWith: []
    }
  },
  {
    id: 'kool',
    name: 'Kool Café Milk Beverage',
    brand: 'Amul',
    company: 'GCMMF',
    category: 'Beverages',
    price: 40,
    size: '200 ml bottle',
    score: 45,
    grade: 'D',
    color: '#8D593D',
    ink: '#FFF8E9',
    accent: 'KOOL CAFE',
    calories: 154,
    servingSize: '200ml',
    nutrients: { sugar: 19.5, sodium: 110, satFat: 3.1 },
    concerns: [
      { name: 'High added sugar', level: 'high', amount: '19.5 g', note: 'Contains nearly 5 teaspoons of sugar, negating dairy protein benefits.' },
      { name: 'Stabiliser (INS 407 / Carrageenan)', level: 'high', amount: 'Texture additive', note: 'Linked to gut inflammation, ulcerative colitis symptoms, and mucosal disruption.' }
    ],
    ingredients: ['Toned milk', 'Sugar', 'Coffee extract (0.8%)', 'Stabiliser (INS 407 / Carrageenan)', 'Acidity regulator (INS 339(ii))'],
    bestFor: 'Occasional treat',
    alternative: 'lassi',
    alternativeCompare: {
      pricePerUnitDiffText: '₹0.22/ml vs ₹0.20/ml',
      ingredientsAvoided: ['Carrageenan (INS 407)', 'Excessive added sugar'],
      ingredientsReplacedWith: [
        { avoided: 'Carrageenan', replaced: 'Natural milk culture (no stabiliser needed)' },
        { avoided: 'Refined sugar (19.5g)', replaced: 'Naturally occurring lactose (lactic acid fermentation)' }
      ]
    }
  },
  {
    id: 'lassi',
    name: 'Unsweetened Probiotic Lassi',
    brand: "Sid's Farm",
    company: 'Sids Farm',
    category: 'Beverages',
    price: 45,
    size: '200 ml bottle',
    score: 94,
    grade: 'A',
    color: '#E9EFE1',
    ink: '#315849',
    accent: 'SID\'S LASSI',
    calories: 78,
    servingSize: '200ml',
    nutrients: { sugar: 0, sodium: 65, satFat: 1.6 },
    concerns: [
      { name: 'Natural milk sugars', level: 'low', amount: '4.8 g lactose', note: 'Contains no added sugar. Natural lactose from pasteurized cow milk.' }
    ],
    ingredients: ['Pasteurized toned cow milk', 'Active probiotic cultures (Lactobacillus acidophilus, Bifidobacterium)'],
    bestFor: 'Gut-supporting cooling drink',
    alternative: 'kool',
    alternativeCompare: {
      pricePerUnitDiffText: '₹0.22/ml vs ₹0.20/ml',
      ingredientsAvoided: [],
      ingredientsReplacedWith: []
    }
  },
  {
    id: 'kurkure',
    name: 'Masala Munch Crunchy Snacks',
    brand: 'Kurkure',
    company: 'PepsiCo India',
    category: 'Snacks',
    price: 20,
    size: '80 g pack',
    score: 28,
    grade: 'E',
    color: '#E06B2B',
    ink: '#FFF0D4',
    accent: 'MASALA MUNCH',
    calories: 440,
    servingSize: '80g',
    nutrients: { sugar: 3.8, sodium: 790, satFat: 11.2 },
    concerns: [
      { name: 'Extremely high saturated fat', level: 'high', amount: '11.2 g', note: 'Over 55% of your recommended daily saturated fat limit in one pack.' },
      { name: 'Deep fried in Palm oil', level: 'high', amount: 'Processed vegetable oil', note: 'Fried at high temperatures, producing trans fats and oxidation compounds.' },
      { name: 'High Sodium', level: 'high', amount: '790 mg', note: '34% of the daily limit. Can raise blood pressure rapidly.' },
      { name: 'Monosodium Glutamate (MSG / 621)', level: 'high', amount: 'Flavour enhancer', note: 'Chemical additive that overstimulates appetite and can cause sensitivity.' }
    ],
    ingredients: ['Rice meal', 'Corn meal', 'Edible vegetable oil (Palm oil)', 'Gram meal', 'Spices & condiments (Chilli powder, Onion powder, Garlic powder, Cumin powder, Turmeric)', 'Iodised salt', 'Sugar', 'Flavour enhancer (INS 621)', 'Acidity regulators (INS 330, INS 296)', 'Anticaking agent (INS 551)'],
    bestFor: 'Occasional snack only',
    alternative: 'roasted-chana',
    alternativeCompare: {
      pricePerUnitDiffText: '₹0.66/g vs ₹0.25/g',
      ingredientsAvoided: ['Palm oil', 'Monosodium glutamate (INS 621)', 'High-temperature fried starches'],
      ingredientsReplacedWith: [
        { avoided: 'Palm oil (Deep frying)', replaced: 'Cold-pressed Mustard oil (Light roasting spray)' },
        { avoided: 'MSG / INS 621', replaced: 'Rock salt & mango powder (Amchur)' },
        { avoided: 'Fried Rice & Corn meals', replaced: 'Whole roasted Bengal gram (Kala Chana)' }
      ]
    }
  },
  {
    id: 'roasted-chana',
    name: 'Spiced Roasted Chana',
    brand: 'Open Secret',
    company: 'Immensitas Private Limited',
    category: 'Snacks',
    price: 80,
    size: '120 g pack',
    score: 90,
    grade: 'A',
    color: '#DDD2BA',
    ink: '#4C3B24',
    accent: 'ROASTED CHANA',
    calories: 195,
    servingSize: '50g',
    nutrients: { sugar: 0.8, sodium: 190, satFat: 0.8 },
    concerns: [
      { name: 'High protein density', level: 'low', amount: '9.2 g', note: 'Excellent source of complex carbs and dietary fiber.' }
    ],
    ingredients: ['Whole roasted Bengal gram (Chana)', 'Cold-pressed mustard oil', 'Turmeric', 'Rock salt', 'Dry mango powder (Amchur)', 'Coriander powder', 'Black pepper'],
    bestFor: 'High-protein weight management snack',
    alternative: 'kurkure',
    alternativeCompare: {
      pricePerUnitDiffText: '₹0.66/g vs ₹0.25/g',
      ingredientsAvoided: [],
      ingredientsReplacedWith: []
    }
  },
  {
    id: 'real-juice',
    name: 'Real Activ 100% Mixed Fruit Juice',
    brand: 'Real',
    company: 'Dabur India',
    category: 'Beverages',
    price: 130,
    size: '1 L tetrapack',
    score: 51,
    grade: 'C',
    color: '#BD2031',
    ink: '#FFF8F8',
    accent: 'MIXED FRUIT',
    calories: 120,
    servingSize: '250ml',
    nutrients: { sugar: 24.8, sodium: 22, satFat: 0 },
    concerns: [
      { name: 'High free sugar spikes', level: 'high', amount: '24.8 g sugar', note: 'Though naturally derived from fruit juice concentrate, it lacks fruit fibers, causing fast blood sugar spikes.' },
      { name: 'Reconstituted juice base', level: 'medium', amount: 'Concentrate', note: 'Boiled down and re-hydrated, losing natural volatile aromatic compounds.' }
    ],
    ingredients: ['Reconstituted Mixed Fruit Juice (99.8%) (Apple, Orange, Guava, Pineapple, Passion Fruit, Mango pulp, Apricot)', 'Acidity regulator (INS 296)', 'Antioxidant (INS 300 / Vitamin C)'],
    bestFor: 'Quick hydration after exercise',
    alternative: 'coconut-water',
    alternativeCompare: {
      pricePerUnitDiffText: '₹0.20/ml vs ₹0.13/ml',
      ingredientsAvoided: ['High concentrated fruit sugars', 'INS 296 (Malic acid)'],
      ingredientsReplacedWith: [
        { avoided: 'Reconstituted juice concentrate', replaced: 'Raw fresh tender coconut water' },
        { avoided: 'Artificial tang (INS 296)', replaced: 'Natural electrolytes (Potassium & Sodium)' }
      ]
    }
  },
  {
    id: 'coconut-water',
    name: '100% Tender Coconut Water',
    brand: 'Raw Pressery',
    company: 'Rakyan Beverages',
    category: 'Beverages',
    price: 80,
    size: '400 ml bottle',
    score: 91,
    grade: 'A',
    color: '#84B082',
    ink: '#1D3B1C',
    accent: 'RAW COCONUT',
    calories: 44,
    servingSize: '200ml',
    nutrients: { sugar: 6.8, sodium: 45, satFat: 0 },
    concerns: [
      { name: 'Natural sugar', level: 'low', amount: '6.8 g', note: 'Naturally occurring coconut water sugars. Zero additives.' }
    ],
    ingredients: ['Tender coconut water', 'Bio-preservative (Nisin) (to extend shelf life safely)'],
    bestFor: 'Hydration & electrolyte replacement',
    alternative: 'real-juice',
    alternativeCompare: {
      pricePerUnitDiffText: '₹0.20/ml vs ₹0.13/ml',
      ingredientsAvoided: [],
      ingredientsReplacedWith: []
    }
  },
  {
    id: 'hersheys',
    name: 'Chocolate Flavor Syrup',
    brand: "Hershey's",
    company: 'Hershey India',
    category: 'Spreads',
    price: 230,
    size: '623 g bottle',
    score: 18,
    grade: 'E',
    color: '#522F26',
    ink: '#FFFFFF',
    accent: 'CHOCO SYRUP',
    calories: 100,
    servingSize: '20g (~1 tbsp)',
    nutrients: { sugar: 14.8, sodium: 25, satFat: 0.1 },
    concerns: [
      { name: 'Liquid Added Sugars', level: 'high', amount: '14.8 g sugar', note: 'Sugar is the absolute primary ingredient. Causes fatty liver risk.' },
      { name: 'Preservative (Sodium Benzoate)', level: 'high', amount: 'INS 211', note: 'Suspicious preservative; can react with vitamin C to create trace benzene.' },
      { name: 'Thickener (Xanthan Gum)', level: 'medium', amount: 'INS 415', note: 'Can disrupt gut bacteria balance in high quantities.' }
    ],
    ingredients: ['Sugar', 'Water', 'Cocoa powder (8%)', 'Invert sugar syrup', 'Liquid Glucose', 'Thickener (INS 415 / Xanthan Gum)', 'Preservative (INS 211 / Sodium Benzoate)', 'Salt', 'Artificial flavour (Vanillin)'],
    bestFor: 'Very rare topping',
    alternative: 'clean-cocoa-spread',
    alternativeCompare: {
      pricePerUnitDiffText: '₹1.10/g vs ₹0.37/g',
      ingredientsAvoided: ['Refined liquid sugar', 'Sodium Benzoate (INS 211)', 'Xanthan Gum (INS 415)', 'Liquid glucose'],
      ingredientsReplacedWith: [
        { avoided: 'Sugar & liquid glucose', replaced: 'Organic dates powder & whole hazelnuts' },
        { avoided: 'INS 211 (Preservative)', replaced: 'Natural fats (Hazelnut oil) for preservation' },
        { avoided: 'INS 415 (Thickener)', replaced: 'Stone-ground hazelnut butter' }
      ]
    }
  },
  {
    id: 'clean-cocoa-spread',
    name: 'Hazelnut Cocoa Spread (100% Clean)',
    brand: 'The Whole Truth',
    company: 'Fitshit Health Foods',
    category: 'Spreads',
    price: 385,
    size: '350 g jar',
    score: 87,
    grade: 'A',
    color: '#DFCDB7',
    ink: '#453526',
    accent: 'CLEAN HAZELNUT',
    calories: 124,
    servingSize: '20g (~1 tbsp)',
    nutrients: { sugar: 3.2, sodium: 5, satFat: 1.4 },
    concerns: [
      { name: 'Nut Allergens', level: 'medium', amount: 'Contains Hazelnut', note: 'Avoid if you have nut allergies.' }
    ],
    ingredients: ['Hazelnuts (45%)', 'Organic Date powder', 'Cocoa butter', 'Cocoa solids (15%)'],
    bestFor: 'Clean sweet spread',
    alternative: 'hersheys',
    alternativeCompare: {
      pricePerUnitDiffText: '₹1.10/g vs ₹0.37/g',
      ingredientsAvoided: [],
      ingredientsReplacedWith: []
    }
  },
  {
    id: 'knorr-soup',
    name: 'Mixed Vegetable Soup Mix',
    brand: 'Knor',
    company: 'Hindustan Unilever',
    category: 'Instant food',
    price: 55,
    size: '53 g pack',
    score: 35,
    grade: 'D',
    color: '#325E39',
    ink: '#FFFADF',
    accent: 'MIX VEG SOUP',
    calories: 52,
    servingSize: '15g (1 serving of soup)',
    nutrients: { sugar: 4.8, sodium: 690, satFat: 0.9 },
    concerns: [
      { name: 'Ultra-High Sodium', level: 'high', amount: '690 mg', note: '30% of daily sodium in one small starter cup of soup.' },
      { name: 'Refined flour & Corn Starch', level: 'high', amount: 'Thickener base', note: 'Refined carbohydrates used as bulking agents instead of real vegetables.' },
      { name: 'Added sugars', level: 'medium', amount: '4.8 g sugar', note: 'Added to balance flavor profile, adding hidden simple sugars.' },
      { name: 'Hydrolyzed vegetable protein', level: 'medium', amount: 'Flavouring agent', note: 'Often contains processed MSG by-products to enhance taste.' }
    ],
    ingredients: ['Refined wheat flour (Maida)', 'Corn starch', 'Sugar', 'Salt', 'Dehydrated vegetables (Carrot, Cabbage, Green peas, Onion, Garlic) (8%)', 'Palm oil', 'Hydrolyzed vegetable protein', 'Flavour enhancers (INS 627, INS 631)', 'Thickener (INS 415)', 'Anticaking agent (INS 551)'],
    bestFor: 'Rare use only',
    alternative: 'organic-soup',
    alternativeCompare: {
      pricePerUnitDiffText: '₹1.80/g vs ₹1.03/g',
      ingredientsAvoided: ['Corn starch & Maida base', 'Flavour enhancers INS 627 & 631', 'Excessive salt', 'Hydrolyzed protein'],
      ingredientsReplacedWith: [
        { avoided: 'Maida & starch base', replaced: 'Dehydrated lentil (Moong dal) flour' },
        { avoided: 'Flavour enhancers', replaced: 'Natural rock salt, coriander & black pepper' },
        { avoided: 'Dehydrated vegetables (8%)', replaced: 'Dehydrated organic farm vegetables (45%)' }
      ]
    }
  },
  {
    id: 'organic-soup',
    name: 'Organic Lentil & Veggie Soup',
    brand: 'Tata Sampann',
    company: 'Tata Consumer Products',
    category: 'Instant food',
    price: 90,
    size: '50 g pack',
    score: 82,
    grade: 'A',
    color: '#D4C49E',
    ink: '#3D311A',
    accent: 'ORGANIC SOUP',
    calories: 48,
    servingSize: '15g',
    nutrients: { sugar: 0.6, sodium: 280, satFat: 0.2 },
    concerns: [
      { name: 'Contains Sodium', level: 'low', amount: '280 mg', note: 'Low sodium soup, safe for regular consumption.' }
    ],
    ingredients: ['Dehydrated organic vegetables (Tomato, Carrot, Beetroot, Onion, Garlic) (45%)', 'Split moong lentil flour (25%)', 'Whole wheat flour (Atta)', 'Rock salt', 'Cumin powder', 'Black pepper', 'Coriander leaves'],
    bestFor: 'Nutritious evening starter',
    alternative: 'knorr-soup',
    alternativeCompare: {
      pricePerUnitDiffText: '₹1.80/g vs ₹1.03/g',
      ingredientsAvoided: [],
      ingredientsReplacedWith: []
    }
  },
  {
    id: 'bournvita',
    name: 'Cadbury Bournvita Health Drink',
    brand: 'Bournvita',
    company: 'Mondelez India',
    category: 'Beverages',
    price: 260,
    size: '500 g jar',
    score: 33,
    grade: 'D',
    color: '#D97A06',
    ink: '#FFFFFF',
    accent: 'BOURNVITA',
    calories: 76,
    servingSize: '20g',
    nutrients: { sugar: 14.2, sodium: 95, satFat: 0.3 },
    concerns: [
      { name: 'Extreme added sugar', level: 'high', amount: '14.2 g', note: 'Sugar and liquid glucose make up 71% of this "health drink" serving.' },
      { name: 'Maltodextrin & Liquid glucose', level: 'high', amount: 'Refined sweeteners', note: 'Ultra-processed corn syrup derivatives that cause rapid blood sugar surges.' },
      { name: 'Caramel Colour (150c)', level: 'medium', amount: 'Colorant', note: 'Chemical browning agent; clean food standards advise avoiding ammonia-based caramel dyes.' }
    ],
    ingredients: ['Sugar', 'Malt extract', 'Liquid Glucose', 'Cocoa solids', 'Milk solids', 'Maltodextrin', 'Color (INS 150c)', 'Emulsifiers (INS 322, INS 471)', 'Raising agent (INS 500(ii))', 'Vitamins & Minerals'],
    bestFor: 'Avoid for children',
    alternative: 'clean-cocoa-powder',
    alternativeCompare: {
      pricePerUnitDiffText: '₹1.50/g vs ₹0.52/g',
      ingredientsAvoided: ['Added white sugar', 'Liquid glucose', 'Maltodextrin', 'Ammonia Caramel colour'],
      ingredientsReplacedWith: [
        { avoided: 'Sugar & Liquid glucose', replaced: 'Natural date powder & milk lactose' },
        { avoided: 'INS 150c (Caramel)', replaced: 'Natural premium cocoa bean powder' },
        { avoided: 'Maltodextrin (Bulking agent)', replaced: 'Stone-ground almond & seed meals' }
      ]
    }
  },
  {
    id: 'clean-cocoa-powder',
    name: '100% Clean Almond Cocoa Drink',
    brand: 'The Whole Truth',
    company: 'Fitshit Health Foods',
    category: 'Beverages',
    price: 375,
    size: '250 g pouch',
    score: 92,
    grade: 'A',
    color: '#EADFC9',
    ink: '#453526',
    accent: 'CLEAN COCOA',
    calories: 68,
    servingSize: '15g',
    nutrients: { sugar: 0, sodium: 5, satFat: 0.6 },
    concerns: [
      { name: 'Nut Allergens', level: 'medium', amount: 'Contains almonds', note: 'Not suitable for people with nut allergies.' }
    ],
    ingredients: ['Almonds', 'Date powder', 'Cocoa powder (30%)', 'Whey protein concentrate'],
    bestFor: 'High-protein sugar-free morning beverage',
    alternative: 'bournvita',
    alternativeCompare: {
      pricePerUnitDiffText: '₹1.50/g vs ₹0.52/g',
      ingredientsAvoided: [],
      ingredientsReplacedWith: []
    }
  },
  {
    id: 'parleg',
    name: 'Parle-G Glucose Biscuits',
    brand: 'Parle',
    company: 'Parle Products',
    category: 'Biscuits',
    price: 10,
    size: '110 g pack',
    score: 30,
    grade: 'D',
    color: '#E2973D',
    ink: '#FFFFFF',
    accent: 'PARLE-G',
    calories: 180,
    servingSize: '8 biscuits (~40g)',
    nutrients: { sugar: 15.2, sodium: 140, satFat: 4.8 },
    concerns: [
      { name: 'Refined wheat flour (Maida)', level: 'high', amount: 'Primary ingredient', note: 'Stripped grain base that yields zero dietary fiber or micro-nutrients.' },
      { name: 'Added white sugar', level: 'high', amount: '15.2 g', note: 'Almost 4 teaspoons of sugar in a standard tea-dunking portion.' },
      { name: 'Palm oil', level: 'high', amount: 'Baking fat', note: 'Cheap industrial fat rich in saturated cholesterol-raising fats.' },
      { name: 'Invert sugar syrup', level: 'medium', amount: 'Liquid sweetener', note: 'Increases shelf stability but causes sharp glycemic insulin surges.' }
    ],
    ingredients: ['Refined wheat flour (Maida) (66%)', 'Sugar', 'Edible vegetable oil (Palm oil)', 'Invert sugar syrup', 'Raising agents (INS 503(ii), INS 500(ii))', 'Iodised salt', 'Milk solids', 'Emulsifier (INS 322)', 'Dough conditioner (INS 223)'],
    bestFor: 'Occasional snack',
    alternative: 'clean-ragi-biscuit',
    alternativeCompare: {
      pricePerUnitDiffText: '₹1.20/g vs ₹0.09/g',
      ingredientsAvoided: ['Refined wheat flour (Maida)', 'White sugar', 'Palm oil', 'INS 223 (Sulphites)'],
      ingredientsReplacedWith: [
        { avoided: 'Refined wheat flour (Maida)', replaced: 'Finger millet (Ragi) & Whole wheat Atta' },
        { avoided: 'Palm oil', replaced: 'Pure cow butter' },
        { avoided: 'Refined sugar', replaced: 'Organic palm jaggery' }
      ]
    }
  },
  {
    id: 'clean-ragi-biscuit',
    name: 'Organic Butter Ragi Biscuits',
    brand: 'Early Foods',
    company: 'Early Foods Private Limited',
    category: 'Biscuits',
    price: 180,
    size: '150 g box',
    score: 89,
    grade: 'A',
    color: '#D2C1A8',
    ink: '#3D2D1A',
    accent: 'RAGI BUTTER',
    calories: 140,
    servingSize: '4 biscuits (~30g)',
    nutrients: { sugar: 4.2, sodium: 35, satFat: 2.2 },
    concerns: [
      { name: 'Butter fats', level: 'medium', amount: 'Contains saturated fat', note: 'Made with real cow butter. Keep portion sizes balanced.' }
    ],
    ingredients: ['Organic Finger millet (Ragi) flour (40%)', 'Organic Whole wheat flour', 'Butter (20%)', 'Organic Jaggery powder', 'Milk', 'Almond powder', 'Cardamom'],
    bestFor: 'Healthy children snack with milk',
    alternative: 'parleg',
    alternativeCompare: {
      pricePerUnitDiffText: '₹1.20/g vs ₹0.09/g',
      ingredientsAvoided: [],
      ingredientsReplacedWith: []
    }
  },
  {
    id: 'kissan-jam',
    name: 'Kissan Mixed Fruit Jam',
    brand: 'Kissan',
    company: 'Hindustan Unilever',
    category: 'Spreads',
    price: 80,
    size: '350 g jar',
    score: 24,
    grade: 'E',
    color: '#DC1E34',
    ink: '#FFFFFF',
    accent: 'FRUIT JAM',
    calories: 56,
    servingSize: '15g (~1 tbsp)',
    nutrients: { sugar: 10.8, sodium: 10, satFat: 0 },
    concerns: [
      { name: 'Extremely high sugar', level: 'high', amount: '10.8 g sugar', note: '72% of the jam is pure added white sugar. Rapid blood glucose spikes.' },
      { name: 'Synthetic Colour (Carmoisine)', level: 'high', amount: 'INS 122 dye', note: 'A coal-tar derivative dye linked to hyperactivity in children; banned in US and Norway.' },
      { name: 'Preservative (Sodium Benzoate)', level: 'high', amount: 'INS 211', note: 'Preserved chemically; can form benzene when exposed to vitamin C.' }
    ],
    ingredients: ['Sugar', 'Mixed fruit pulp (45%) (Apple, Grape, Pineapple, Pear, Peach, Orange, Mango, Banana)', 'Acidity regulator (INS 330)', 'Thickener (INS 440 / Pectin)', 'Preservative (INS 211)', 'Synthetic food colour (INS 122 / Carmoisine)', 'Artificial mixed fruit flavours'],
    bestFor: 'Rare topping',
    alternative: 'clean-fruit-spread',
    alternativeCompare: {
      pricePerUnitDiffText: '₹0.85/g vs ₹0.22/g',
      ingredientsAvoided: ['Excess added white sugar', 'Carmoisine dye (INS 122)', 'Sodium Benzoate (INS 211)'],
      ingredientsReplacedWith: [
        { avoided: 'White sugar (72% load)', replaced: 'Natural fruit sugars & trace honey' },
        { avoided: 'Carmoisine synthetic dye', replaced: 'Naturally vibrant fruit pigmentation' },
        { avoided: 'INS 211 (Chemical preservative)', replaced: 'Hot-fill vacuum sealing & high fruit acidity' }
      ]
    }
  },
  {
    id: 'clean-fruit-spread',
    name: 'Organic Mixed Berry Fruit Spread',
    brand: 'Orchard Lane',
    company: 'Fresh Food Industries',
    category: 'Spreads',
    price: 295,
    size: '340 g jar',
    score: 86,
    grade: 'A',
    color: '#F4D2DE',
    ink: '#4D1D2F',
    accent: 'BERRY SPREAD',
    calories: 22,
    servingSize: '15g (~1 tbsp)',
    nutrients: { sugar: 3.2, sodium: 2, satFat: 0 },
    concerns: [
      { name: 'Natural fruit acidity', level: 'low', amount: 'Natural tang', note: 'Low glycemic load, sweetened naturally by organic berry juices.' }
    ],
    ingredients: ['Organic berries (Strawberry, Raspberry, Blueberry) (80%)', 'Organic Sugar / Honey (15%)', 'Lemon juice', 'Fruit pectin (INS 440)'],
    bestFor: 'Clean breakfast toast topping',
    alternative: 'kissan-jam',
    alternativeCompare: {
      pricePerUnitDiffText: '₹0.85/g vs ₹0.22/g',
      ingredientsAvoided: [],
      ingredientsReplacedWith: []
    }
  },
  {
    id: 'maggi-sauce',
    name: 'Rich Tomato Ketchup',
    brand: 'MAGGI',
    company: 'Nestlé India',
    category: 'Spreads',
    price: 120,
    size: '500 g squeeze pack',
    score: 35,
    grade: 'D',
    color: '#D41E2A',
    ink: '#FFFFFF',
    accent: 'TOMATO KETCHUP',
    calories: 24,
    servingSize: '15g (~1 tbsp)',
    nutrients: { sugar: 5.4, sodium: 158, satFat: 0.1 },
    concerns: [
      { name: 'Hidden added sugars', level: 'high', amount: '5.4 g sugar', note: '36% of the ketchup is pure sugar, heavily masking tomato tang.' },
      { name: 'High Sodium load', level: 'high', amount: '158 mg', note: 'Highly concentrated sodium to preserve and salt the sauce.' },
      { name: 'Thickener (Xanthan Gum)', level: 'medium', amount: 'INS 415', note: 'Used as stabilizer to emulsify watered-down tomato paste.' }
    ],
    ingredients: ['Water', 'Tomato paste (28%)', 'Sugar', 'Iodised salt', 'Acidity regulator (INS 260)', 'Thickener (INS 415 / Xanthan Gum)', 'Preservative (INS 211 / Sodium Benzoate)', 'Spices & Condiments (Onion powder, Garlic powder, Spices)'],
    bestFor: 'Occasional dip',
    alternative: 'clean-tomato-ketchup',
    alternativeCompare: {
      pricePerUnitDiffText: '₹0.60/g vs ₹0.24/g',
      ingredientsAvoided: ['Added sugar (36%)', 'Sodium Benzoate (INS 211)', 'Xanthan Gum (INS 415)'],
      ingredientsReplacedWith: [
        { avoided: 'White sugar', replaced: 'Organic jaggery syrup' },
        { avoided: 'Xanthan Gum (Thickener)', replaced: 'Highly concentrated tomato solids (no water dilution)' },
        { avoided: 'INS 211 (Preservative)', replaced: 'Natural apple cider vinegar & salt' }
      ]
    }
  },
  {
    id: 'clean-tomato-ketchup',
    name: '100% Clean Tomato Ketchup',
    brand: 'The Whole Truth',
    company: 'Fitshit Health Foods',
    category: 'Spreads',
    price: 180,
    size: '300 g bottle',
    score: 88,
    grade: 'A',
    color: '#EAD3CD',
    ink: '#4D1D1C',
    accent: 'CLEAN KETCHUP',
    calories: 14,
    servingSize: '15g',
    nutrients: { sugar: 1.2, sodium: 58, satFat: 0 },
    concerns: [
      { name: 'Natural spices tang', level: 'low', amount: 'Spiced with cumin', note: 'Low sodium and zero chemical additives.' }
    ],
    ingredients: ['Tomatoes (85%)', 'Organic Jaggery', 'Apple cider vinegar', 'Salt', 'Onion', 'Garlic', 'Spices (Cinnamon, Clove, Black pepper)'],
    bestFor: 'Everyday clean condiment dipping',
    alternative: 'maggi-sauce',
    alternativeCompare: {
      pricePerUnitDiffText: '₹0.60/g vs ₹0.24/g',
      ingredientsAvoided: [],
      ingredientsReplacedWith: []
    }
  },
  {
    id: 'quaker-masala-oats',
    name: 'Quaker Homestyle Masala Oats',
    brand: 'Quaker',
    company: 'PepsiCo India',
    category: 'Breakfast',
    price: 65,
    size: '160 g pouch',
    score: 48,
    grade: 'C',
    color: '#285943',
    ink: '#FFFFFF',
    accent: 'MASALA OATS',
    calories: 148,
    servingSize: '40g',
    nutrients: { sugar: 2.8, sodium: 490, satFat: 2.8 },
    concerns: [
      { name: 'High sodium load', level: 'high', amount: '490 mg', note: 'Contains 21% of the daily sodium limit in a single breakfast serving.' },
      { name: 'Palm oil', level: 'medium', amount: 'Flavor carrier', note: 'Used to fry and coat spices, adding saturated fats.' },
      { name: 'Flavour enhancers (627 & 631)', level: 'medium', amount: 'Chemical additives', note: 'Used to enhance umami taste artificially; promotes overeating.' }
    ],
    ingredients: ['Rolled oats (76%)', 'Salt', 'Spices & condiments (Onion powder, Coriander, Turmeric, Garlic, Fenugreek, Cumin, Red chilli, Black pepper)', 'Sugar', 'Edible vegetable oil (Palm oil)', 'Hydrolyzed vegetable protein', 'Flavour enhancers (INS 627, INS 631)', 'Anticaking agent (INS 551)'],
    bestFor: 'Occasional breakfast',
    alternative: 'clean-masala-oats',
    alternativeCompare: {
      pricePerUnitDiffText: '₹0.56/g vs ₹0.40/g',
      ingredientsAvoided: ['Palm oil coating', 'Chemical flavor enhancers (INS 627, 631)', 'Hydrolyzed vegetable protein'],
      ingredientsReplacedWith: [
        { avoided: 'Palm oil', replaced: 'No oil added (dry blending of spices)' },
        { avoided: 'INS 627 & 631', replaced: 'Natural rock salt & mango powder (Amchur)' },
        { avoided: 'Hydrolyzed protein', replaced: 'Natural spices & dehydrated green peas' }
      ]
    }
  },
  {
    id: 'clean-masala-oats',
    name: 'Tata Sampann Masala Oats (Classic)',
    brand: 'Tata Sampann',
    company: 'Tata Consumer Products',
    category: 'Breakfast',
    price: 90,
    size: '160 g pouch',
    score: 83,
    grade: 'A',
    color: '#D4C69E',
    ink: '#3D331A',
    accent: 'SAMPANN OATS',
    calories: 122,
    servingSize: '40g',
    nutrients: { sugar: 0.5, sodium: 180, satFat: 0.4 },
    concerns: [
      { name: 'Contains Sodium', level: 'low', amount: '180 mg', note: 'Safe level of sodium, typical of lightly salted home breakfasts.' }
    ],
    ingredients: ['Whole grain rolled oats (90%)', 'Spices & condiments (Coriander, Cumin, Turmeric, Dry mango powder, Fennel, Fenugreek)', 'Rock salt', 'Dehydrated vegetables (Carrots, Green beans, Coriander leaves)'],
    bestFor: 'Heart-healthy high-fiber breakfast',
    alternative: 'quaker-masala-oats',
    alternativeCompare: {
      pricePerUnitDiffText: '₹0.56/g vs ₹0.40/g',
      ingredientsAvoided: [],
      ingredientsReplacedWith: []
    }
  },
  {
    id: 'nutella',
    name: 'Nutella Hazelnut Spread',
    brand: 'Nutella',
    company: 'Ferrero India',
    category: 'Spreads',
    price: 330,
    size: '350 g jar',
    score: 22,
    grade: 'E',
    color: '#282524',
    ink: '#FFFFFF',
    accent: 'NUTELLA',
    calories: 160,
    servingSize: '20g (~1 tbsp)',
    nutrients: { sugar: 11.6, sodium: 12, satFat: 3.2 },
    concerns: [
      { name: 'Ultra-high sugar', level: 'high', amount: '11.6 g', note: '58% of this jar is pure added white sugar, not hazelnut.' },
      { name: 'Palm oil', level: 'high', amount: 'Fat emulsifier', note: 'Industrial palm oil is used to provide spreadable texture, raising saturated fat loads.' },
      { name: 'Artificial flavour (Vanillin)', level: 'low', amount: 'Synthetic flavor', note: 'Contains synthetic vanillin instead of natural vanilla extract.' }
    ],
    ingredients: ['Sugar', 'Palm oil', 'Hazelnuts (13%)', 'Skimmed milk powder (8.7%)', 'Low-fat cocoa powder (7.4%)', 'Emulsifier (INS 322 / Lecithin from soy)', 'Artificial flavouring (Vanillin)'],
    bestFor: 'Rare treat',
    alternative: 'clean-peanut-butter',
    alternativeCompare: {
      pricePerUnitDiffText: '₹0.48/g vs ₹0.94/g',
      ingredientsAvoided: ['Palm oil', '58% added white sugar', 'Vanillin artificial flavor'],
      ingredientsReplacedWith: [
        { avoided: 'Palm oil', replaced: 'Natural peanut/hazelnut oil' },
        { avoided: 'Refined sugar', replaced: 'No sugar (100% whole roasted peanuts)' },
        { avoided: 'Artificial vanillin', replaced: 'Natural roasted nut aromas' }
      ]
    }
  },
  {
    id: 'clean-peanut-butter',
    name: 'Unsweetened Creamy Peanut Butter',
    brand: 'Happy Jars',
    company: 'Happy Jars Private Limited',
    category: 'Spreads',
    price: 170,
    size: '350 g jar',
    score: 95,
    grade: 'A',
    color: '#EADBC9',
    ink: '#453526',
    accent: 'HAPPY JARS',
    calories: 125,
    servingSize: '20g (~1 tbsp)',
    nutrients: { sugar: 0, sodium: 2, satFat: 1.2 },
    concerns: [
      { name: 'Nut allergen', level: 'medium', amount: 'Contains Peanuts', note: 'Avoid if you suffer from peanut allergies.' }
    ],
    ingredients: ['Roasted peanuts (100%)'],
    bestFor: 'High-protein fitness spread',
    alternative: 'nutella',
    alternativeCompare: {
      pricePerUnitDiffText: '₹0.48/g vs  ₹0.94/g',
      ingredientsAvoided: [],
      ingredientsReplacedWith: []
    }
  },
  {
    id: 'nescafe-classic',
    name: 'Classic Instant Coffee',
    brand: 'Nescafé',
    company: 'Nestlé India',
    category: 'Beverages',
    price: 90,
    size: '50 g glass jar',
    score: 68,
    grade: 'B',
    color: '#3d261c',
    ink: '#ffffff',
    accent: 'NESCAFE',
    calories: 120,
    servingSize: '2g (1 cup)',
    nutrients: { sugar: 0, sodium: 1, satFat: 0 },
    concerns: [
      { name: 'High caffeine content', level: 'medium', amount: 'Moderate in serving', note: 'Can cause jitteriness, sleep cycle disruption, or high heart rate if consumed in excess.' }
    ],
    ingredients: ['100% pure soluble coffee beans'],
    bestFor: 'Daily morning energy boost',
    alternative: null,
    alternativeCompare: {
      pricePerUnitDiffText: '',
      ingredientsAvoided: [],
      ingredientsReplacedWith: []
    }
  },
  {
    id: 'kitkat',
    name: 'KitKat Chocolate Wafer',
    brand: 'KitKat',
    company: 'Nestlé India',
    category: 'Snacks',
    price: 30,
    size: '37 g 4-finger bar',
    score: 32,
    grade: 'D',
    color: '#df2027',
    ink: '#ffffff',
    accent: 'KITKAT',
    calories: 185,
    servingSize: '37g',
    nutrients: { sugar: 18.2, sodium: 58, satFat: 7.2 },
    concerns: [
      { name: 'High added sugar', level: 'high', amount: '18.2 g', note: 'Provides almost 73% of the daily added sugar limit in a small bar.' },
      { name: 'Palm oil', level: 'high', amount: 'Wafer fat layer', note: 'Cheap hydrogenated/palm fat used inside the wafer layer, adding high saturated fats.' },
      { name: 'Emulsifier (INS 476)', level: 'medium', amount: 'Chocolate coating', note: 'Synthetic PGPR emulsifier is added to thin chocolate coating, reducing cocoa butter ratio.' }
    ],
    ingredients: ['Sugar', 'Refined wheat flour (Maida)', 'Hydrogenated vegetable fats (Palm oil base)', 'Cocoa solids (10%)', 'Milk solids', 'Emulsifiers (INS 322, INS 476)', 'Raising agent (INS 500(ii))', 'Yeast'],
    bestFor: 'Very rare indulgence',
    alternative: 'amul-dark-chocolate',
    alternativeCompare: {
      pricePerUnitDiffText: '₹0.81/g vs ₹0.73/g',
      ingredientsAvoided: ['Refined wheat flour (Maida)', 'Hydrogenated vegetable fats', 'INS 476 (PGPR)'],
      ingredientsReplacedWith: [
        { avoided: 'Refined wheat flour (Maida)', replaced: 'Finger millet (Ragi) & Whole wheat Atta' },
        { avoided: 'Palm oil', replaced: 'Pure cocoa butter' },
        { avoided: 'INS 476', replaced: 'Natural soy lecithin (INS 322)' }
      ]
    }
  },
  {
    id: 'milkmaid',
    name: 'Sweetened Condensed Milk',
    brand: 'Milkmaid',
    company: 'Nestlé India',
    category: 'Spreads',
    price: 144,
    size: '400 g tin',
    score: 22,
    grade: 'E',
    color: '#0d47a1',
    ink: '#ffffff',
    accent: 'MILKMAID',
    calories: 65,
    servingSize: '20g (1 tbsp)',
    nutrients: { sugar: 11.2, sodium: 25, satFat: 1.2 },
    concerns: [
      { name: 'Extremely high sugar concentration', level: 'high', amount: '11.2 g sugar', note: 'Condensed milk is 56% added sugar by weight. Rapid insulin spikes.' }
    ],
    ingredients: ['Milk solids', 'Sugar'],
    bestFor: 'Rare festival baking only',
    alternative: null,
    alternativeCompare: {
      pricePerUnitDiffText: '',
      ingredientsAvoided: [],
      ingredientsReplacedWith: []
    }
  },
  {
    id: 'goodday-butter',
    name: 'Good Day Butter Cookies',
    brand: 'Good Day',
    company: 'Britannia Industries',
    category: 'Biscuits',
    price: 30,
    size: '200 g pack',
    score: 35,
    grade: 'D',
    color: '#b08b3e',
    ink: '#ffffff',
    accent: 'GOOD DAY',
    calories: 195,
    servingSize: '4 cookies (~40g)',
    nutrients: { sugar: 11.6, sodium: 135, satFat: 5.4 },
    concerns: [
      { name: 'Refined wheat flour (Maida)', level: 'high', amount: 'Primary cookie base', note: 'Lacks dietary fiber, causing rapid blood glucose spikes.' },
      { name: 'Palm oil', level: 'high', amount: 'Baking fat', note: 'Contains palm oil alongside butter to reduce costs, loading saturated fats.' },
      { name: 'Added white sugar', level: 'high', amount: '11.6 g', note: 'High sugar load, contributing to daily calorie limits.' }
    ],
    ingredients: ['Refined wheat flour (Maida)', 'Sugar', 'Edible vegetable oil (Palm oil)', 'Butter (2%)', 'Raising agents (INS 503(ii), INS 500(ii))', 'Iodised salt', 'Milk solids', 'Emulsifiers (INS 322, INS 471)', 'Artificial butter and vanilla flavors'],
    bestFor: 'Occasional tea-time treat',
    alternative: 'clean-ragi-biscuit',
    alternativeCompare: {
      pricePerUnitDiffText: '₹0.15/g vs ₹1.20/g',
      ingredientsAvoided: ['Refined wheat flour (Maida)', 'Palm oil', 'Artificial butter flavors'],
      ingredientsReplacedWith: [
        { avoided: 'Refined wheat flour (Maida)', replaced: 'Finger millet (Ragi) & Whole wheat Atta' },
        { avoided: 'Palm oil (Cheap fat)', replaced: '100% pure cow butter (20%)' },
        { avoided: 'Refined white sugar', replaced: 'Organic palm jaggery' }
      ]
    }
  },
  {
    id: 'mariegold',
    name: 'Marie Gold Biscuits',
    brand: 'Marie Gold',
    company: 'Britannia Industries',
    category: 'Biscuits',
    price: 15,
    size: '120 g pack',
    score: 42,
    grade: 'D',
    color: '#df691a',
    ink: '#ffffff',
    accent: 'MARIE GOLD',
    calories: 180,
    servingSize: '8 biscuits (~40g)',
    nutrients: { sugar: 9.2, sodium: 160, satFat: 2.2 },
    concerns: [
      { name: 'Refined wheat flour (Maida)', level: 'high', amount: 'Primary ingredient', note: 'Stripped grain base that yields zero dietary fiber.' },
      { name: 'Palm oil', level: 'medium', amount: 'Baking fat', note: 'Cheap processed fat rich in saturated cholesterol-raising fats.' },
      { name: 'Dough conditioner (INS 223)', level: 'medium', amount: 'Chemical conditioner', note: 'Contains metabisulphite which can release sulfur dioxide, triggering sensitivities.' }
    ],
    ingredients: ['Refined wheat flour (Maida) (69%)', 'Sugar', 'Edible vegetable oil (Palm oil)', 'Invert sugar syrup', 'Raising agents (INS 503(ii), INS 500(ii))', 'Milk solids', 'Iodised salt', 'Dough conditioner (INS 223)', 'Emulsifier (INS 322)'],
    bestFor: 'Occasional light tea snack',
    alternative: 'millet-cookie',
    alternativeCompare: {
      pricePerUnitDiffText: '₹0.12/g vs ₹0.42/g',
      ingredientsAvoided: ['Refined wheat flour (Maida)', 'Palm oil', 'Dough conditioner (INS 223)'],
      ingredientsReplacedWith: [
        { avoided: 'Refined wheat flour (Maida)', replaced: 'Ragi (Finger millet) & whole wheat' },
        { avoided: 'Palm oil', replaced: 'Cold-pressed Rice bran oil' },
        { avoided: 'Dough conditioner (INS 223)', replaced: 'Physical dough resting' }
      ]
    }
  },
  {
    id: 'tiger-glucose',
    name: 'Tiger Glucose Biscuits',
    brand: 'Tiger',
    company: 'Britannia Industries',
    category: 'Biscuits',
    price: 10,
    size: '120 g pack',
    score: 32,
    grade: 'D',
    color: '#ef4444',
    ink: '#ffffff',
    accent: 'TIGER',
    calories: 185,
    servingSize: '8 biscuits (~40g)',
    nutrients: { sugar: 14.8, sodium: 150, satFat: 4.2 },
    concerns: [
      { name: 'Refined wheat flour (Maida)', level: 'high', amount: 'Primary ingredient', note: 'No beneficial fiber, highly refined starch base.' },
      { name: 'Added white sugar', level: 'high', amount: '14.8 g', note: 'High added sugar load (almost 4 teaspoons of sugar) in a small serving.' },
      { name: 'Palm oil', level: 'high', amount: 'Baking fat', note: 'Cheap industrial fat rich in saturated cholesterol-raising fats.' }
    ],
    ingredients: ['Refined wheat flour (Maida)', 'Sugar', 'Edible vegetable oil (Palm oil)', 'Liquid Glucose', 'Raising agents (INS 503(ii), INS 500(ii))', 'Iodised salt', 'Milk solids', 'Emulsifier (INS 322)', 'Vitamins & Minerals'],
    bestFor: 'Occasional snack',
    alternative: 'clean-ragi-biscuit',
    alternativeCompare: {
      pricePerUnitDiffText: '₹0.08/g vs ₹1.20/g',
      ingredientsAvoided: ['Refined wheat flour (Maida)', 'Palm oil', 'Liquid Glucose'],
      ingredientsReplacedWith: [
        { avoided: 'Refined wheat flour (Maida)', replaced: 'Finger millet (Ragi) & Whole wheat Atta' },
        { avoided: 'Palm oil', replaced: 'Pure cow butter' },
        { avoided: 'Liquid Glucose & white sugar', replaced: 'Organic palm jaggery' }
      ]
    }
  },
  {
    id: 'haldirams-bhujia',
    name: 'Aloo Bhujia Namkeen',
    brand: "Haldiram's",
    company: "Haldiram's",
    category: 'Snacks',
    price: 45,
    size: '150 g pack',
    score: 25,
    grade: 'E',
    color: '#d69e2e',
    ink: '#ffffff',
    accent: 'ALOO BHUJIA',
    calories: 232,
    servingSize: '40g',
    nutrients: { sugar: 0.8, sodium: 380, satFat: 9.8 },
    concerns: [
      { name: 'Extremely high saturated fat', level: 'high', amount: '9.8 g', note: 'Consists of deep-fried potato and gram flour in palm oil, loading high saturated fats.' },
      { name: 'Palm oil frying medium', level: 'high', amount: 'Deep fried', note: 'Heavily processed oil used at high temperatures, increasing lipid strain.' },
      { name: 'High Sodium load', level: 'high', amount: '380 mg', note: 'Packed with salt and spices to trigger overeating.' }
    ],
    ingredients: ['Potatoes (44%)', 'Gram flour', 'Dew bean flour (Moth dal flour)', 'Edible vegetable oil (Palm oil)', 'Sago starch', 'Salt', 'Spices (Mango powder, Red chilli, Coriander, Cumin, Mint powder, Ginger, Black pepper)', 'Acidity regulator (Citric acid)'],
    bestFor: 'Very rare snacks consumption',
    alternative: 'makhana',
    alternativeCompare: {
      pricePerUnitDiffText: '₹0.30/g vs ₹1.20/g',
      ingredientsAvoided: ['Palm oil frying', 'Maida/starch fillers', 'Excess salt'],
      ingredientsReplacedWith: [
        { avoided: 'Palm oil deep fried base', replaced: 'Olive/Rice bran oil lightly sprayed' },
        { avoided: 'Potato starch & Gram flour', replaced: 'Whole puffed roasted Fox nuts (Makhana)' }
      ]
    }
  },
  {
    id: 'haldirams-soanpapdi',
    name: 'Traditional Soan Papdi',
    brand: "Haldiram's",
    company: "Haldiram's",
    category: 'Spreads',
    price: 120,
    size: '250 g box',
    score: 18,
    grade: 'E',
    color: '#e28743',
    ink: '#ffffff',
    accent: 'SOAN PAPDI',
    calories: 200,
    servingSize: '40g',
    nutrients: { sugar: 22.4, sodium: 5, satFat: 8.4 },
    concerns: [
      { name: 'Ultra-high added sugar', level: 'high', amount: '22.4 g', note: 'Over 56% of this traditional sweet is pure added white sugar.' },
      { name: 'Hydrogenated vegetable fat (Vanaspati)', level: 'high', amount: 'Structuring fat', note: 'Contains partially hydrogenated fats which are high in saturated fats and trace trans fats.' },
      { name: 'Refined wheat flour (Maida)', level: 'high', amount: 'Starch base', note: 'Combined with gram flour to create fine flakes; lacks any dietary fiber.' }
    ],
    ingredients: ['Sugar', 'Hydrogenated vegetable fat (Vanaspati)', 'Refined wheat flour (Maida)', 'Gram flour', 'Almond', 'Pistachio', 'Cardamom'],
    bestFor: 'Rare festival indulgence only',
    alternative: 'clean-cocoa-spread',
    alternativeCompare: {
      pricePerUnitDiffText: '₹0.48/g vs ₹1.10/g',
      ingredientsAvoided: ['Vanaspati (Hydrogenated fat)', 'Refined wheat flour (Maida)', 'White sugar (56% load)'],
      ingredientsReplacedWith: [
        { avoided: 'Vanaspati', replaced: 'Organic Date powder & Cocoa butter' },
        { avoided: 'Maida & Sugar', replaced: 'Hazelnuts & Cocoa solids (100% clean)' }
      ]
    }
  },
  {
    id: 'haldirams-bhujia-sev',
    name: 'Classic Bhujia Sev',
    brand: "Haldiram's",
    company: "Haldiram's",
    category: 'Snacks',
    price: 40,
    size: '150 g pack',
    score: 28,
    grade: 'E',
    color: '#d4af37',
    ink: '#ffffff',
    accent: 'BHUJIA SEV',
    calories: 228,
    servingSize: '40g',
    nutrients: { sugar: 0.5, sodium: 340, satFat: 8.8 },
    concerns: [
      { name: 'High saturated fat', level: 'high', amount: '8.8 g', note: 'Deep fried gram flour namkeen, containing significant saturated lipids.' },
      { name: 'Palm oil deep frying', level: 'high', amount: 'Processed fat base', note: 'Cheap industrial fat frying medium used for long shelf life.' },
      { name: 'High Sodium', level: 'high', amount: '340 mg', note: 'Savory sodium levels encourage rapid packet consumption.' }
    ],
    ingredients: ['Gram flour (Tepary Bean flour)', 'Edible vegetable oil (Palm oil)', 'Salt', 'Black pepper powder', 'Ginger powder', 'Clove powder', 'Cardamom powder', 'Nutmeg', 'Cinnamon'],
    bestFor: 'Occasional traditional snack',
    alternative: 'roasted-chana',
    alternativeCompare: {
      pricePerUnitDiffText: '₹0.26/g vs ₹0.66/g',
      ingredientsAvoided: ['Palm oil deep frying', 'Processed refined starch'],
      ingredientsReplacedWith: [
        { avoided: 'Palm oil frying', replaced: 'Mustard oil light spray (Roasted, not fried)' },
        { avoided: 'Gram flour deep fried', replaced: 'Whole Bengal gram roasted (high fiber & protein)' }
      ]
    }
  },
  {
    id: 'aashirvaad-atta',
    name: 'Aashirvaad Superior MP Atta',
    brand: 'Aashirvaad',
    company: 'ITC (Foods Division)',
    category: 'Staples',
    price: 260,
    size: '5 kg bag',
    score: 96,
    grade: 'A',
    color: '#c2185b',
    ink: '#ffffff',
    accent: 'ATTA',
    calories: 140,
    servingSize: '40g',
    nutrients: { sugar: 0, sodium: 2, satFat: 0.1 },
    concerns: [],
    ingredients: ['100% Whole Wheat flour (MP Wheat)'],
    bestFor: 'Daily staple cooking (Rotis & breads)',
    alternative: null,
    alternativeCompare: {
      pricePerUnitDiffText: '',
      ingredientsAvoided: [],
      ingredientsReplacedWith: []
    }
  },
  {
    id: 'sunfeast-darkfantasy',
    name: 'Dark Fantasy Choco Fills',
    brand: 'Sunfeast',
    company: 'ITC (Foods Division)',
    category: 'Biscuits',
    price: 45,
    size: '100 g pack',
    score: 20,
    grade: 'E',
    color: '#1e1b18',
    ink: '#f0c243',
    accent: 'DARK FANTASY',
    calories: 205,
    servingSize: '2 biscuits (~40g)',
    nutrients: { sugar: 15.6, sodium: 110, satFat: 6.4 },
    concerns: [
      { name: 'Very high sugar content', level: 'high', amount: '15.6 g', note: 'Provides almost 62% of the daily sugar limit in just two chocolate biscuits.' },
      { name: 'Hydrogenated vegetable fat', level: 'high', amount: 'Choco cream filling', note: 'Contains interesterified/hydrogenated oils with saturated fats.' },
      { name: 'Refined wheat flour (Maida)', level: 'high', amount: 'Cookie shell', note: 'No beneficial fiber, refined starch leads to rapid digestion.' }
    ],
    ingredients: ['Refined wheat flour (Maida)', 'Sugar', 'Interesterified vegetable fat', 'Cocoa solids (8%)', 'Hydrogenated vegetable oil', 'Raising agents (INS 503(ii), INS 500(ii))', 'Emulsifiers (INS 322, INS 476)', 'Iodised salt', 'Artificial chocolate flavour'],
    bestFor: 'Rare treat',
    alternative: 'clean-cocoa-spread',
    alternativeCompare: {
      pricePerUnitDiffText: '₹0.45/g vs ₹1.10/g',
      ingredientsAvoided: ['Refined wheat flour (Maida)', 'Hydrogenated vegetable fat', 'INS 476'],
      ingredientsReplacedWith: [
        { avoided: 'Refined wheat flour (Maida)', replaced: 'Stone-ground hazelnut butter' },
        { avoided: 'Hydrogenated cream', replaced: 'Cocoa butter & organic date powder' }
      ]
    }
  },
  {
    id: 'bingo-madangles',
    name: 'Bingo Mad Angles Achaari Masti',
    brand: 'Bingo',
    company: 'ITC (Foods Division)',
    category: 'Snacks',
    price: 20,
    size: '66 g pack',
    score: 27,
    grade: 'E',
    color: '#e65100',
    ink: '#ffffff',
    accent: 'MAD ANGLES',
    calories: 220,
    servingSize: '40g',
    nutrients: { sugar: 2.2, sodium: 420, satFat: 6.8 },
    concerns: [
      { name: 'High saturated fat', level: 'high', amount: '6.8 g', note: 'Fried cornmeal chips, containing high industrial fats.' },
      { name: 'Palm oil frying', level: 'high', amount: 'Frying medium', note: 'Used to fry snacks, increasing saturated lipid load.' },
      { name: 'Flavour enhancers (627 & 631)', level: 'medium', amount: 'Additive combination', note: 'Used to multiply savory taste to encourage overeating.' }
    ],
    ingredients: ['Cornmeal', 'Refined wheat flour (Maida)', 'Edible vegetable oil (Palm oil)', 'Spices & seasonings (Onion powder, Garlic powder, Mango powder, Achaar spice blend)', 'Salt', 'Sugar', 'Flavour enhancers (INS 627, INS 631)', 'Acidity regulators (INS 330, INS 296)'],
    bestFor: 'Occasional snacking',
    alternative: 'makhana',
    alternativeCompare: {
      pricePerUnitDiffText: '₹0.30/g vs ₹1.20/g',
      ingredientsAvoided: ['Palm oil', 'INS 627 & INS 631 flavor enhancers', 'Refined wheat flour (Maida)'],
      ingredientsReplacedWith: [
        { avoided: 'Palm oil (Deep fried)', replaced: 'Rice bran oil (Roasted Fox nuts)' },
        { avoided: 'Flavour enhancers', replaced: 'Himalayan pink salt & spices' }
      ]
    }
  },
  {
    id: 'yippee-noodles',
    name: 'Yippee Magic Masala Noodles',
    brand: 'Yippee',
    company: 'ITC (Foods Division)',
    category: 'Instant food',
    price: 15,
    size: '70 g pack',
    score: 32,
    grade: 'D',
    color: '#ff6d00',
    ink: '#ffffff',
    accent: 'YIPPEE',
    calories: 315,
    servingSize: '70g',
    nutrients: { sugar: 2.8, sodium: 890, satFat: 6.5 },
    concerns: [
      { name: 'High sodium', level: 'high', amount: '890 mg', note: 'Contains nearly 39% of the daily limit of sodium in one pack.' },
      { name: 'Refined wheat flour (Maida)', level: 'high', amount: 'Noodle cake', note: 'Processed white flour base with no fiber or nutrition.' },
      { name: 'Palm oil', level: 'high', amount: 'Fried noodle block', note: 'The noodle block is pre-fried in palm oil during processing.' },
      { name: 'Flavour enhancer (INS 635)', level: 'medium', amount: 'Taste enhancer', note: 'Synergistic chemical flavor enhancer; triggers gout and skin sensitivities.' }
    ],
    ingredients: ['Refined wheat flour (Maida)', 'Edible vegetable oil (Palm oil)', 'Iodised salt', 'Spices & condiments (Onion, Garlic, Turmeric, Cumin, Cardamom, Clove, Cinnamon)', 'Sugar', 'Flavour enhancer (INS 635)', 'Acidity regulators (INS 501(i), INS 500(i))', 'Thickener (INS 412)'],
    bestFor: 'Rare convenience snack',
    alternative: 'slurrp',
    alternativeCompare: {
      pricePerUnitDiffText: '₹0.21/g vs ₹1.08/g',
      ingredientsAvoided: ['Refined wheat flour (Maida)', 'Palm oil', 'INS 635'],
      ingredientsReplacedWith: [
        { avoided: 'Refined wheat flour (Maida)', replaced: 'Millet flour (Foxtail & Little millets)' },
        { avoided: 'Palm oil', replaced: 'Rice bran oil' },
        { avoided: 'INS 635', replaced: 'Natural spices' }
      ]
    }
  },
  {
    id: 'parle-monaco',
    name: 'Monaco Salted Biscuits',
    brand: 'Monaco',
    company: 'Parle Products',
    category: 'Biscuits',
    price: 10,
    size: '75 g pack',
    score: 35,
    grade: 'D',
    color: '#ffd54f',
    ink: '#3e2723',
    accent: 'MONACO',
    calories: 190,
    servingSize: '10 biscuits (~40g)',
    nutrients: { sugar: 3.2, sodium: 260, satFat: 4.8 },
    concerns: [
      { name: 'Refined wheat flour (Maida)', level: 'high', amount: 'Primary ingredient', note: 'Stripped grain base that yields zero dietary fiber.' },
      { name: 'High Sodium load', level: 'high', amount: '260 mg', note: 'Salty biscuit coating contains high levels of sodium per serving.' },
      { name: 'Palm oil', level: 'high', amount: 'Baking fat', note: 'Cheap baking oil high in saturated fats.' },
      { name: 'Dough conditioner (INS 223)', level: 'medium', amount: 'Chemical conditioner', note: 'Metabisulphites can cause allergic and respiratory reactions in sensitive people.' }
    ],
    ingredients: ['Refined wheat flour (Maida) (73%)', 'Edible vegetable oil (Palm oil)', 'Sugar', 'Raising agents (INS 503(ii), INS 500(ii))', 'Iodised salt', 'Invert sugar syrup', 'Dough conditioner (INS 223)', 'Emulsifier (INS 322)'],
    bestFor: 'Occasional light snack',
    alternative: 'clean-ragi-biscuit',
    alternativeCompare: {
      pricePerUnitDiffText: '₹0.13/g vs ₹1.20/g',
      ingredientsAvoided: ['Refined wheat flour (Maida)', 'Palm oil', 'Dough conditioner (INS 223)'],
      ingredientsReplacedWith: [
        { avoided: 'Refined wheat flour (Maida)', replaced: 'Finger millet (Ragi) & Whole wheat Atta' },
        { avoided: 'Palm oil', replaced: 'Pure cow butter' }
      ]
    }
  },
  {
    id: 'parle-hideandseek',
    name: 'Hide & Seek Chocolate Cookies',
    brand: 'Hide & Seek',
    company: 'Parle Products',
    category: 'Biscuits',
    price: 35,
    size: '120 g pack',
    score: 24,
    grade: 'E',
    color: '#0d47a1',
    ink: '#ffffff',
    accent: 'HIDE & SEEK',
    calories: 198,
    servingSize: '4 cookies (~40g)',
    nutrients: { sugar: 14.8, sodium: 98, satFat: 5.2 },
    concerns: [
      { name: 'High added sugar', level: 'high', amount: '14.8 g', note: 'High added sugar (nearly 4 teaspoons of sugar) in a small portion.' },
      { name: 'Refined wheat flour (Maida)', level: 'high', amount: 'Primary cookie base', note: 'Processed flour lacks fiber and raises blood sugar quickly.' },
      { name: 'Palm oil', level: 'high', amount: 'Baking oil fat', note: 'Industrial baking fat used in cookies, loading saturated fats.' }
    ],
    ingredients: ['Refined wheat flour (Maida)', 'Sugar', 'Chocolate chips (15%) [Sugar, Cocoa solids, Cocoa butter, Emulsifier (INS 322, INS 476)]', 'Edible vegetable oil (Palm oil)', 'Raising agents (INS 503(ii), INS 500(ii))', 'Iodised salt', 'Emulsifier (INS 322)', 'Artificial vanilla flavor'],
    bestFor: 'Rare treat',
    alternative: 'millet-cookie',
    alternativeCompare: {
      pricePerUnitDiffText: '₹0.29/g vs ₹0.42/g',
      ingredientsAvoided: ['Refined wheat flour (Maida)', 'Palm oil', 'INS 476 emulsifier'],
      ingredientsReplacedWith: [
        { avoided: 'Refined wheat flour (Maida)', replaced: 'Ragi (Finger millet) & whole wheat' },
        { avoided: 'Palm oil', replaced: 'Cold-pressed Rice bran oil' }
      ]
    }
  },
  {
    id: 'amul-butter',
    name: 'Pasteurised Salted Butter',
    brand: 'Amul',
    company: 'Amul (GCMMF)',
    category: 'Spreads',
    price: 56,
    size: '100 g pack',
    score: 72,
    grade: 'B',
    color: '#388e3c',
    ink: '#ffffff',
    accent: 'AMUL BUTTER',
    calories: 144,
    servingSize: '20g',
    nutrients: { sugar: 0, sodium: 168, satFat: 10.4 },
    concerns: [
      { name: 'High saturated fat', level: 'medium', amount: '10.4 g', note: 'Pure milk fat is highly rich in saturated fatty acids; consume in moderation.' },
      { name: 'Contains Sodium', level: 'medium', amount: '168 mg', note: 'Salted butter adds to daily sodium intake. Keep portions balanced.' }
    ],
    ingredients: ['Milk fat', 'Salt', 'Natural food color (INS 160b / Annatto)'],
    bestFor: 'Daily culinary spreading in moderation',
    alternative: null,
    alternativeCompare: {
      pricePerUnitDiffText: '',
      ingredientsAvoided: [],
      ingredientsReplacedWith: []
    }
  },
  {
    id: 'amul-cheese-slices',
    name: 'Amul Cheese Slices',
    brand: 'Amul',
    company: 'Amul (GCMMF)',
    category: 'Spreads',
    price: 130,
    size: '200 g (10 slices)',
    score: 48,
    grade: 'C',
    color: '#ffc107',
    ink: '#3e2723',
    accent: 'AMUL CHEESE',
    calories: 62,
    servingSize: '20g (1 slice)',
    nutrients: { sugar: 0.2, sodium: 280, satFat: 3.8 },
    concerns: [
      { name: 'High Sodium load', level: 'high', amount: '280 mg', note: '12% of the daily limit of sodium in just one single slice of cheese.' },
      { name: 'Emulsifying salts (INS 331, 339)', level: 'medium', amount: 'Processing salts', note: 'Used to blend cheese oils; high intake of phosphorus-based salts can affect bone health.' },
      { name: 'Preservative (INS 200)', level: 'medium', amount: 'Sorbic acid', note: 'Permitted preservative to prevent mold; can cause mild sensitivity.' }
    ],
    ingredients: ['Cheese', 'Milk solids', 'Emulsifying salts (INS 331, INS 339(iii))', 'Iodised salt', 'Preservative (INS 200)', 'Acidity regulator (INS 270)'],
    bestFor: 'Occasional cheese toast',
    alternative: 'motherdairy-classiccurd',
    alternativeCompare: {
      pricePerUnitDiffText: '₹0.65/g vs ₹0.15/g',
      ingredientsAvoided: ['Emulsifying salts (INS 331, 339)', 'Preservative (INS 200)', 'High sodium'],
      ingredientsReplacedWith: [
        { avoided: 'Processed emulsified cheese', replaced: 'Natural fresh Curd / Yogurt' }
      ]
    }
  },
  {
    id: 'amul-dark-chocolate',
    name: 'Amul Dark Chocolate 55% Cocoa',
    brand: 'Amul',
    company: 'Amul (GCMMF)',
    category: 'Snacks',
    price: 110,
    size: '150 g bar',
    score: 62,
    grade: 'C',
    color: '#2b1b17',
    ink: '#d4af37',
    accent: 'DARK CHOCO',
    calories: 140,
    servingSize: '25g',
    nutrients: { sugar: 11.2, sodium: 5, satFat: 5.6 },
    concerns: [
      { name: 'Moderate added sugar', level: 'medium', amount: '11.2 g', note: 'Contains added sugar to balance cocoa bitterness. Eat in moderation.' }
    ],
    ingredients: ['Cocoa solids (55%)', 'Sugar', 'Cocoa butter', 'Permitted emulsifiers (INS 322, INS 476)', 'Natural vanilla flavoring'],
    bestFor: 'Lower-sugar chocolate indulgence',
    alternative: 'clean-cocoa-spread',
    alternativeCompare: {
      pricePerUnitDiffText: '₹0.73/g vs ₹1.10/g',
      ingredientsAvoided: ['Added refined sugar', 'INS 476 emulsifier'],
      ingredientsReplacedWith: [
        { avoided: 'Refined sugar', replaced: 'Organic Date powder' },
        { avoided: 'INS 476', replaced: 'Cocoa butter' }
      ]
    }
  },
  {
    id: 'tropicana-orange',
    name: 'Tropicana 100% Orange Juice',
    brand: 'Tropicana',
    company: 'PepsiCo India',
    category: 'Beverages',
    price: 140,
    size: '1 L tetrapack',
    score: 45,
    grade: 'D',
    color: '#f57c00',
    ink: '#ffffff',
    accent: 'ORANGE JUICE',
    calories: 115,
    servingSize: '250ml',
    nutrients: { sugar: 23.6, sodium: 18, satFat: 0 },
    concerns: [
      { name: 'High sugar load', level: 'high', amount: '23.6 g sugar', note: 'Pure liquid fruit sugars are quickly absorbed by the liver, causing metabolic stress.' },
      { name: 'Reconstituted juice base', level: 'medium', amount: 'Juice concentrate', note: 'Boiled down and re-diluted with water, destroying natural fibers and fresh flavor.' }
    ],
    ingredients: ['Reconstituted Orange Juice (99.9%) from Orange Juice Concentrate', 'Natural orange flavors'],
    bestFor: 'Rare beverage use',
    alternative: 'coconut-water',
    alternativeCompare: {
      pricePerUnitDiffText: '₹0.14/ml vs ₹0.20/ml',
      ingredientsAvoided: ['Concentrated liquid sugars', 'Reconstituted water base'],
      ingredientsReplacedWith: [
        { avoided: 'Juice concentrate', replaced: 'Fresh raw tender coconut water' }
      ]
    }
  },
  {
    id: 'motherdairy-tonedmilk',
    name: 'Mother Dairy Toned Milk',
    brand: 'Mother Dairy',
    company: 'Mother Dairy',
    category: 'Beverages',
    price: 54,
    size: '1 L pouch',
    score: 85,
    grade: 'A',
    color: '#0288d1',
    ink: '#ffffff',
    accent: 'TONED MILK',
    calories: 116,
    servingSize: '200ml',
    nutrients: { sugar: 0, sodium: 90, satFat: 3.2 },
    concerns: [
      { name: 'Fortified Vitamins A & D', level: 'low', amount: 'Fortification', note: 'Synthetically added vitamins to meet regulatory nutrition mandates.' }
    ],
    ingredients: ['Pasteurized toned milk', 'Vitamin A', 'Vitamin D2'],
    bestFor: 'Daily dairy beverage consumption',
    alternative: null,
    alternativeCompare: {
      pricePerUnitDiffText: '',
      ingredientsAvoided: [],
      ingredientsReplacedWith: []
    }
  },
  {
    id: 'motherdairy-classiccurd',
    name: 'Mother Dairy Classic Curd',
    brand: 'Mother Dairy',
    company: 'Mother Dairy',
    category: 'Staples',
    price: 35,
    size: '400 g cup',
    score: 94,
    grade: 'A',
    color: '#00bcd4',
    ink: '#ffffff',
    accent: 'CLASSIC CURD',
    calories: 120,
    servingSize: '200g',
    nutrients: { sugar: 0, sodium: 60, satFat: 3.0 },
    concerns: [],
    ingredients: ['Pasteurized toned milk', 'Active lactic culture'],
    bestFor: 'Probiotic digestion booster with meals',
    alternative: null,
    alternativeCompare: {
      pricePerUnitDiffText: '',
      ingredientsAvoided: [],
      ingredientsReplacedWith: []
    }
  },
  {
    id: 'dhara-mustard-oil',
    name: 'Dhara Kachi Ghani Mustard Oil',
    brand: 'Dhara',
    company: 'Mother Dairy',
    category: 'Staples',
    price: 175,
    size: '1 L pouch',
    score: 88,
    grade: 'A',
    color: '#fbc02d',
    ink: '#3e2723',
    accent: 'MUSTARD OIL',
    calories: 180,
    servingSize: '20ml',
    nutrients: { sugar: 0, sodium: 0, satFat: 1.2 },
    concerns: [
      { name: 'Erucic acid presence', level: 'low', amount: 'Natural component', note: 'Mustard oil contains erucic acid naturally. Totally safe in standard culinary amounts.' }
    ],
    ingredients: ['100% pure cold-pressed Mustard Oil'],
    bestFor: 'Healthy traditional cooking & deep frying',
    alternative: null,
    alternativeCompare: {
      pricePerUnitDiffText: '',
      ingredientsAvoided: [],
      ingredientsReplacedWith: []
    }
  },
  {
    id: 'safal-peas',
    name: 'Safal Frozen Green Peas',
    brand: 'Safal',
    company: 'Mother Dairy',
    category: 'Staples',
    price: 120,
    size: '1 kg bag',
    score: 98,
    grade: 'A',
    color: '#4caf50',
    ink: '#ffffff',
    accent: 'SAFAL PEAS',
    calories: 78,
    servingSize: '100g',
    nutrients: { sugar: 0, sodium: 5, satFat: 0 },
    concerns: [],
    ingredients: ['100% frozen green peas'],
    bestFor: 'Adding fiber & nutrients to everyday dishes',
    alternative: null,
    alternativeCompare: {
      pricePerUnitDiffText: '',
      ingredientsAvoided: [],
      ingredientsReplacedWith: []
    }
  },
  {
    id: 'tata-salt',
    name: 'Tata Salt (Vacuum Evaporated)',
    brand: 'Tata Salt',
    company: 'Tata Consumer Products',
    category: 'Staples',
    price: 28,
    size: '1 kg packet',
    score: 75,
    grade: 'B',
    color: '#03a9f4',
    ink: '#ffffff',
    accent: 'TATA SALT',
    calories: 0,
    servingSize: '1g',
    nutrients: { sugar: 0, sodium: 387, satFat: 0 },
    concerns: [
      { name: 'High Sodium base', level: 'medium', amount: '387 mg per gram', note: 'Salt is pure sodium chloride. Consume within daily dietary limits (under 5g salt/day).' }
    ],
    ingredients: ['Edible common salt', 'Potassium iodate', 'Anticaking agent (INS 551)'],
    bestFor: 'Daily nutritional iodine & seasoning',
    alternative: null,
    alternativeCompare: {
      pricePerUnitDiffText: '',
      ingredientsAvoided: [],
      ingredientsReplacedWith: []
    }
  },
  {
    id: 'tata-tea-premium',
    name: 'Tata Tea Premium',
    brand: 'Tata Tea',
    company: 'Tata Consumer Products',
    category: 'Beverages',
    price: 140,
    size: '250 g pack',
    score: 98,
    grade: 'A',
    color: '#1b5e20',
    ink: '#ffffff',
    accent: 'TATA TEA',
    calories: 0,
    servingSize: '2g (1 cup tea)',
    nutrients: { sugar: 0, sodium: 0, satFat: 0 },
    concerns: [],
    ingredients: ['100% pure black tea leaves'],
    bestFor: 'Daily traditional Indian chai preparation',
    alternative: null,
    alternativeCompare: {
      pricePerUnitDiffText: '',
      ingredientsAvoided: [],
      ingredientsReplacedWith: []
    }
  },
  {
    id: 'tata-sampann-moongdal',
    name: 'Tata Sampann Unpolished Moong Dal',
    brand: 'Tata Sampann',
    company: 'Tata Consumer Products',
    category: 'Staples',
    price: 190,
    size: '1 kg packet',
    score: 98,
    grade: 'A',
    color: '#fbc02d',
    ink: '#1e1e1e',
    accent: 'MOONG DAL',
    calories: 138,
    servingSize: '40g',
    nutrients: { sugar: 0, sodium: 4, satFat: 0.1 },
    concerns: [],
    ingredients: ['100% unpolished split green gram lentils'],
    bestFor: 'High protein daily lentil soups (Dal)',
    alternative: null,
    alternativeCompare: {
      pricePerUnitDiffText: '',
      ingredientsAvoided: [],
      ingredientsReplacedWith: []
    }
  },
  {
    id: 'mtr-rava-idlimix',
    name: 'MTR Rava Idli Breakfast Mix',
    brand: 'MTR',
    company: 'MTR Foods / Mondelez (Cadbury)',
    category: 'Breakfast',
    price: 110,
    size: '500 g pack',
    score: 74,
    grade: 'B',
    color: '#c62828',
    ink: '#ffffff',
    accent: 'RAVA IDLI',
    calories: 145,
    servingSize: '40g',
    nutrients: { sugar: 0.8, sodium: 280, satFat: 1.4 },
    concerns: [
      { name: 'Hydrogenated vegetable fat', level: 'medium', amount: 'Spice seasoning', note: 'Contains small amount of hydrogenated palm/sesame fats in tempering.' }
    ],
    ingredients: ['Semolina (Suji) (75%)', 'Hydrogenated vegetable fat', 'Cashew nuts', 'Salt', 'Curry leaves', 'Mustard seeds', 'Raising agent (INS 500(ii))', 'Acidity regulator (INS 330)'],
    bestFor: 'Quick traditional South Indian breakfast',
    alternative: null,
    alternativeCompare: {
      pricePerUnitDiffText: '',
      ingredientsAvoided: [],
      ingredientsReplacedWith: []
    }
  },
  {
    id: 'cadbury-dairy-milk',
    name: 'Cadbury Dairy Milk Chocolate',
    brand: 'Cadbury',
    company: 'MTR Foods / Mondelez (Cadbury)',
    category: 'Snacks',
    price: 45,
    size: '50 g bar',
    score: 22,
    grade: 'E',
    color: '#4a148c',
    ink: '#ffffff',
    accent: 'DAIRY MILK',
    calories: 135,
    servingSize: '25g',
    nutrients: { sugar: 14.5, sodium: 32, satFat: 4.8 },
    concerns: [
      { name: 'Very high sugar concentration', level: 'high', amount: '14.5 g sugar', note: '58% of this milk chocolate bar is pure added white sugar. Rapid blood sugar surge.' },
      { name: 'Emulsifiers (INS 442 & 476)', level: 'medium', amount: 'Flow modifiers', note: 'Contains synthetic viscosity modifiers to speed up chocolate production lines.' }
    ],
    ingredients: ['Sugar', 'Milk solids (16%)', 'Cocoa butter', 'Cocoa solids', 'Emulsifiers (INS 442, INS 476)', 'Artificial vanilla flavor'],
    bestFor: 'Rare snack treat',
    alternative: 'amul-dark-chocolate',
    alternativeCompare: {
      pricePerUnitDiffText: '₹0.90/g vs ₹0.73/g',
      ingredientsAvoided: ['INS 476 emulsifier', 'INS 442 emulsifier', '58% added sugar'],
      ingredientsReplacedWith: [
        { avoided: 'INS 476', replaced: 'Natural pure cocoa butter' },
        { avoided: 'High added sugar (58%)', replaced: 'Cocoa solids 55%' }
      ]
    }
  },
  {
    id: 'oreo-original',
    name: 'Oreo Vanilla Creme Biscuit',
    brand: 'Oreo',
    company: 'MTR Foods / Mondelez (Cadbury)',
    category: 'Biscuits',
    price: 30,
    size: '120 g pack',
    score: 24,
    grade: 'E',
    color: '#0d47a1',
    ink: '#ffffff',
    accent: 'OREO COOKIE',
    calories: 196,
    servingSize: '4 biscuits (~40g)',
    nutrients: { sugar: 15.2, sodium: 198, satFat: 4.8 },
    concerns: [
      { name: 'High added white sugar', level: 'high', amount: '15.2 g', note: 'Sugar is a highly concentrated primary ingredient in both cookie and cream.' },
      { name: 'Refined wheat flour (Maida)', level: 'high', amount: 'Dark biscuit shells', note: 'Stripped of all fiber and bran. Spikes insulin levels rapidly.' },
      { name: 'Palm oil', level: 'high', amount: 'Cream filling emulsifier', note: 'Solid vegetable fat base for chocolate cookie dough and vanilla cream.' }
    ],
    ingredients: ['Refined wheat flour (Maida)', 'Sugar', 'Edible vegetable oil (Palm oil)', 'Cocoa solids (4%)', 'Invert syrup', 'Raising agents (INS 503(ii), INS 500(ii))', 'Iodised salt', 'Emulsifier (INS 322)', 'Artificial vanilla flavor'],
    bestFor: 'Rare snack treat only',
    alternative: 'millet-cookie',
    alternativeCompare: {
      pricePerUnitDiffText: '₹0.25/g vs ₹0.42/g',
      ingredientsAvoided: ['Refined wheat flour (Maida)', 'Palm oil', 'Refined sugar (38% load)'],
      ingredientsReplacedWith: [
        { avoided: 'Refined wheat flour (Maida)', replaced: 'Ragi (Finger millet) & whole wheat' },
        { avoided: 'Palm oil', replaced: 'Cold-pressed Rice bran oil' },
        { avoided: 'Refined white sugar', replaced: 'Organic palm jaggery' }
      ]
    }
  }
]

export const categories = ['All', 'Snacks', 'Beverages', 'Breakfast', 'Instant food', 'Biscuits', 'Spreads', 'Staples']
