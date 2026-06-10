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
  }
]

export const categories = ['All', 'Snacks', 'Beverages', 'Breakfast', 'Instant food', 'Biscuits', 'Spreads']
