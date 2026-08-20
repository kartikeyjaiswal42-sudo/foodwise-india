// RAW INGREDIENT TABLE — the input to the home-cooked meal builder
// ============================================================================
// `indianDishes.js` answers "roughly what is a katori of dal". This answers
// "exactly what is MY dal", because you are the one who measured the ghee.
//
// That is the whole point of the builder: a dish estimate has to assume how much
// oil went in, and that assumption is the single largest source of error in the
// whole app (±16% on its own). If you tell us it was one teaspoon, the assumption
// disappears and the estimate stops being an estimate.
//
// Per 100 g of the RAW ingredient, from IFCT 2017 (Indian Food Composition
// Tables, NIN Hyderabad) and standard composition data.
//
// COOKING YIELD — the trap this table has to avoid
// ------------------------------------------------
// 100 g of raw dal is not 100 g of cooked dal; it absorbs water and roughly
// triples in weight. Calories do not change (water has none), but the SERVING
// does: one katori of cooked dal holds only about 50 g of raw dal. So dry goods
// carry a `yield` factor and offer a "katori (cooked)" measure whose gram weight
// is the RAW equivalent. Getting this backwards would triple every rice and dal
// figure in the app — the commonest way a calorie counter goes wrong in India.

/* --------------------------------------------------------------------------
 * Household measures
 * ------------------------------------------------------------------------ */

/** Grams for measures that mean the same thing whatever they hold. */
export const MEASURE_G = {
  tsp: 5,
  tbsp: 15,
  cup: 150,
  katori: 150,
  glass: 250,
}

// [ id, name, group, kcal, protein, carbs, fat, satFat, sugar, sodium, fibre, yield, measures, aka ]
//   All nutrition per 100 g RAW.
//   yield = cooked weight ÷ raw weight (1 = unchanged).
//   measures = "label:grams" pairs, in the order the picker should show them.

const ROWS = [
  /* ---- Flours & grains -------------------------------------------------- */
  ['atta', 'Wheat flour (atta)', 'Grains & flours', 341, 12.1, 69.4, 1.7, 0.3, 0.4, 17, 11.2, 1, 'katori (raw):120|cup:120|tbsp:9|g:1|roti worth:30', 'gehu atta|whole wheat flour|chakki atta'],
  ['maida', 'Refined flour (maida)', 'Grains & flours', 348, 11, 73.9, 0.9, 0.1, 0.3, 2, 2.7, 1, 'katori (raw):120|cup:120|tbsp:9|g:1', 'all purpose flour|white flour'],
  ['rice-raw', 'Rice (raw)', 'Grains & flours', 356, 7.9, 78.2, 0.5, 0.1, 0.1, 5, 1.4, 3, 'katori (cooked):50|katori (raw):150|cup:150|g:1', 'chawal|basmati|sona masoori'],
  ['brown-rice', 'Brown rice (raw)', 'Grains & flours', 346, 7.9, 76, 2.7, 0.6, 0.7, 5, 4.4, 3, 'katori (cooked):50|katori (raw):150|g:1', 'unpolished rice'],
  ['poha-raw', 'Poha (flattened rice)', 'Grains & flours', 346, 6.6, 77.3, 1.2, 0.3, 0.2, 10, 2.4, 2.6, 'katori:60|cup:60|g:1', 'aval|chivda|beaten rice'],
  ['rava', 'Rava / Suji', 'Grains & flours', 348, 10.4, 74.8, 0.8, 0.2, 0.3, 5, 2.1, 3, 'katori (raw):130|cup:130|tbsp:10|g:1', 'semolina|sooji'],
  ['besan', 'Besan (gram flour)', 'Grains & flours', 372, 22.4, 57.8, 5.6, 0.6, 3.5, 60, 10.8, 1, 'katori (raw):110|cup:110|tbsp:8|g:1', 'gram flour|chickpea flour'],
  ['bajra', 'Bajra', 'Grains & flours', 361, 11.6, 67.5, 5, 1, 0.5, 12, 11.5, 1, 'roti worth:35|katori (raw):130|g:1', 'pearl millet|sajje'],
  ['jowar', 'Jowar', 'Grains & flours', 349, 10.4, 72.6, 1.9, 0.4, 0.5, 8, 9.7, 1, 'roti worth:35|katori (raw):130|g:1', 'sorghum|jolada'],
  ['ragi', 'Ragi', 'Grains & flours', 328, 7.3, 72, 1.3, 0.3, 0.5, 11, 11.2, 1, 'katori (raw):130|tbsp:10|g:1', 'finger millet|nachni|mandua'],
  ['oats-raw', 'Oats', 'Grains & flours', 389, 16.9, 66.3, 6.9, 1.2, 1, 2, 10.6, 3, 'katori (raw):40|cup:40|tbsp:8|g:1', 'rolled oats|jai'],
  ['daliya-raw', 'Daliya (broken wheat)', 'Grains & flours', 342, 12, 69, 1.5, 0.3, 0.4, 15, 12.5, 3, 'katori (raw):50|g:1', 'lapsi|godhuma rava|bulgur'],
  ['sabudana-raw', 'Sabudana', 'Grains & flours', 351, 0.2, 87.1, 0.2, 0.1, 0.2, 6, 0.9, 2.5, 'katori (raw):60|cup:60|g:1', 'sago|javvarisi|tapioca pearls'],
  ['vermicelli', 'Vermicelli (seviyan)', 'Grains & flours', 352, 10.5, 74, 1.2, 0.3, 0.4, 8, 2.5, 2.5, 'katori (raw):50|g:1', 'semiya|sevai'],
  ['bread-slice', 'Bread', 'Grains & flours', 265, 8.5, 49, 3.2, 0.7, 5, 490, 2.4, 1, 'slice:25|g:1', 'pav|double roti'],

  /* ---- Dals & pulses ----------------------------------------------------- */
  ['toor-dal', 'Toor dal (arhar)', 'Dals & pulses', 335, 22.3, 57.6, 1.7, 0.5, 1.6, 30, 15.5, 2.8, 'katori (cooked):50|katori (raw):150|cup:150|tbsp:12|g:1', 'arhar|pigeon pea|tur'],
  ['moong-dal-raw', 'Moong dal', 'Dals & pulses', 348, 24.5, 59.9, 1.2, 0.4, 1.5, 28, 16.3, 2.8, 'katori (cooked):50|katori (raw):150|g:1', 'yellow moong|dhuli moong'],
  ['moong-whole', 'Whole moong', 'Dals & pulses', 334, 24, 56.7, 1.2, 0.4, 1.6, 30, 16.3, 2.8, 'katori (cooked):50|katori (raw):150|g:1', 'green gram|sabut moong'],
  ['masoor-dal-raw', 'Masoor dal', 'Dals & pulses', 343, 25.1, 59, 1.1, 0.2, 1.8, 25, 15.5, 2.8, 'katori (cooked):50|katori (raw):150|g:1', 'red lentil|lal masoor'],
  ['urad-dal-raw', 'Urad dal', 'Dals & pulses', 347, 24, 59.6, 1.4, 0.4, 1.5, 30, 18.3, 2.8, 'katori (cooked):50|katori (raw):150|g:1', 'black gram|kali dal'],
  ['chana-dal-raw', 'Chana dal', 'Dals & pulses', 360, 20.8, 59.8, 5.6, 0.6, 3, 40, 15.8, 2.8, 'katori (cooked):50|katori (raw):150|g:1', 'split bengal gram'],
  ['rajma-raw', 'Rajma', 'Dals & pulses', 346, 22.9, 60.6, 1.3, 0.2, 2.2, 25, 17.6, 2.6, 'katori (cooked):55|katori (raw):150|g:1', 'kidney beans'],
  ['kabuli-chana', 'Kabuli chana', 'Dals & pulses', 360, 17.1, 60.9, 5.3, 0.6, 10.7, 30, 18.6, 2.6, 'katori (cooked):55|katori (raw):150|g:1', 'chickpeas|chole|safed chana'],
  ['kala-chana', 'Kala chana', 'Dals & pulses', 360, 20.5, 59, 5.6, 0.6, 5, 35, 20, 2.6, 'katori (cooked):55|katori (raw):150|g:1', 'brown chickpea|desi chana'],
  ['lobia-raw', 'Lobia', 'Dals & pulses', 343, 23.5, 60, 1.3, 0.3, 2.4, 20, 18, 2.6, 'katori (cooked):55|katori (raw):150|g:1', 'black eyed peas|chawli'],
  ['soya-chunks', 'Soya chunks', 'Dals & pulses', 345, 52, 33, 0.5, 0.1, 11, 15, 13, 2.8, 'katori (raw):40|cup:40|g:1', 'nutrela|meal maker|soya nuggets'],

  /* ---- Fats & oils -------------------------------------------------------- */
  ['ghee', 'Ghee', 'Fats & oils', 900, 0, 0, 100, 62, 0, 0, 0, 1, 'tsp:5|tbsp:15|g:1', 'desi ghee|clarified butter|tup'],
  ['mustard-oil', 'Mustard oil', 'Fats & oils', 900, 0, 0, 100, 12, 0, 0, 0, 1, 'tsp:5|tbsp:15|g:1', 'sarson ka tel|kachi ghani'],
  ['sunflower-oil', 'Sunflower / refined oil', 'Fats & oils', 900, 0, 0, 100, 11, 0, 0, 0, 1, 'tsp:5|tbsp:15|g:1', 'refined oil|cooking oil|tel'],
  ['groundnut-oil', 'Groundnut oil', 'Fats & oils', 900, 0, 0, 100, 19, 0, 0, 0, 1, 'tsp:5|tbsp:15|g:1', 'peanut oil|moongphali tel'],
  ['coconut-oil', 'Coconut oil', 'Fats & oils', 900, 0, 0, 100, 90, 0, 0, 0, 1, 'tsp:5|tbsp:15|g:1', 'nariyal tel'],
  ['butter', 'Butter', 'Fats & oils', 717, 0.9, 0.1, 81, 51, 0.1, 640, 0, 1, 'tsp:5|tbsp:15|g:1', 'makhan|amul butter'],
  ['vanaspati', 'Vanaspati', 'Fats & oils', 900, 0, 0, 100, 45, 0, 0, 0, 1, 'tsp:5|tbsp:15|g:1', 'dalda|hydrogenated fat'],
  ['fresh-cream', 'Fresh cream', 'Fats & oils', 292, 2.1, 2.9, 30, 19, 2.9, 40, 0, 1, 'tbsp:15|katori:150|g:1', 'malai|amul cream'],

  /* ---- Dairy --------------------------------------------------------------- */
  ['milk-full', 'Milk (full cream)', 'Dairy', 65, 3.2, 4.7, 4.1, 2.6, 4.7, 42, 0, 1, 'glass:250|cup:150|katori:150|tbsp:15|ml:1', 'doodh|whole milk'],
  ['milk-toned', 'Milk (toned)', 'Dairy', 58, 3.1, 4.8, 3, 1.9, 4.8, 42, 0, 1, 'glass:250|cup:150|ml:1', 'toned doodh'],
  ['curd', 'Curd', 'Dairy', 61, 3.5, 4.7, 3.3, 2.1, 4.7, 46, 0, 1, 'katori:150|cup:150|tbsp:15|g:1', 'dahi|yoghurt|thayir|mosaru'],
  ['paneer', 'Paneer', 'Dairy', 296, 18.3, 6.1, 22.8, 14.5, 6.1, 22, 0, 1, 'katori:100|cube:15|g:1', 'cottage cheese|chena'],
  ['cheese', 'Cheese', 'Dairy', 348, 24, 2.2, 27, 17, 0.5, 620, 0, 1, 'slice:20|cube:15|g:1', 'processed cheese'],
  ['khoya', 'Khoya / Mawa', 'Dairy', 421, 14.6, 25.2, 31, 19.5, 25, 80, 0, 1, 'katori:100|tbsp:15|g:1', 'mawa|khoa'],
  ['condensed-milk', 'Condensed milk', 'Dairy', 321, 7.9, 54.4, 8.7, 5.5, 54, 127, 0, 1, 'tbsp:20|g:1', 'milkmaid'],

  /* ---- Vegetables ---------------------------------------------------------- */
  ['onion', 'Onion', 'Vegetables', 50, 1.2, 11.1, 0.1, 0, 4.2, 4, 1.7, 1, 'medium:100|small:60|large:150|g:1', 'pyaz|kanda|ullipaya'],
  ['tomato', 'Tomato', 'Vegetables', 20, 0.9, 3.9, 0.2, 0, 2.6, 5, 1.2, 1, 'medium:80|small:50|large:120|g:1', 'tamatar|thakkali'],
  ['potato', 'Potato', 'Vegetables', 97, 1.6, 22.6, 0.1, 0, 1.2, 6, 1.7, 1, 'medium:100|small:60|large:150|katori:150|g:1', 'aloo|batata|urulaikizhangu'],
  ['cauliflower', 'Cauliflower', 'Vegetables', 30, 2.6, 4.1, 0.4, 0.1, 1.9, 30, 2.6, 1, 'katori:100|medium head:500|g:1', 'gobi|phool gobi'],
  ['brinjal', 'Brinjal', 'Vegetables', 24, 1.4, 4, 0.3, 0.1, 2.4, 3, 3, 1, 'medium:120|katori:100|g:1', 'baingan|eggplant|vangi|kathirikai'],
  ['okra', 'Okra', 'Vegetables', 35, 1.9, 6.4, 0.2, 0.1, 1.5, 7, 3.2, 1, 'katori:100|g:1', 'bhindi|lady finger|vendakkai'],
  ['spinach', 'Spinach', 'Vegetables', 26, 2, 2.9, 0.7, 0.1, 0.4, 58, 2.2, 1, 'bunch:200|katori:70|g:1', 'palak|keerai'],
  ['methi-leaves', 'Methi leaves', 'Vegetables', 49, 4.4, 6, 0.9, 0.2, 0.5, 76, 4.9, 1, 'bunch:150|katori:60|g:1', 'fenugreek leaves|menthi'],
  ['carrot', 'Carrot', 'Vegetables', 48, 0.9, 10.6, 0.2, 0, 5.6, 69, 2.8, 1, 'medium:70|katori:110|g:1', 'gajar|carrot'],
  ['green-peas', 'Green peas', 'Vegetables', 93, 7.2, 15.9, 0.1, 0, 5.7, 5, 5.1, 1, 'katori:120|cup:120|g:1', 'matar|hare matar'],
  ['capsicum', 'Capsicum', 'Vegetables', 24, 1.3, 4.3, 0.3, 0.1, 2.4, 4, 1.8, 1, 'medium:90|katori:90|g:1', 'shimla mirch|bell pepper'],
  ['bottle-gourd', 'Bottle gourd', 'Vegetables', 12, 0.2, 2.5, 0.1, 0, 1.2, 2, 0.6, 1, 'katori:120|medium:600|g:1', 'lauki|ghiya|dudhi|sorakaya'],
  ['cabbage', 'Cabbage', 'Vegetables', 27, 1.8, 4.6, 0.1, 0, 2.6, 15, 2.7, 1, 'katori:90|g:1', 'patta gobi|band gobi'],
  ['french-beans', 'French beans', 'Vegetables', 26, 1.7, 4.5, 0.1, 0, 1.4, 4, 3.3, 1, 'katori:100|g:1', 'beans|fansi'],
  ['pumpkin', 'Pumpkin', 'Vegetables', 25, 1.4, 4.6, 0.1, 0, 2.8, 5, 0.7, 1, 'katori:120|g:1', 'kaddu|sitaphal|parangikai'],
  ['bitter-gourd', 'Bitter gourd', 'Vegetables', 25, 1.6, 4.2, 0.2, 0, 1.9, 5, 2.9, 1, 'medium:80|katori:100|g:1', 'karela|pavakkai'],
  ['ridge-gourd', 'Ridge gourd', 'Vegetables', 17, 0.5, 3.4, 0.1, 0, 1.7, 3, 0.5, 1, 'katori:110|g:1', 'turai|tori|beerakaya'],
  ['cucumber', 'Cucumber', 'Vegetables', 16, 0.4, 3.5, 0.1, 0, 1.8, 2, 0.5, 1, 'medium:150|katori:100|g:1', 'kheera|kakdi'],
  ['radish', 'Radish', 'Vegetables', 17, 0.7, 3.4, 0.1, 0, 1.9, 33, 1.6, 1, 'medium:100|katori:100|g:1', 'mooli'],
  ['beetroot', 'Beetroot', 'Vegetables', 43, 1.6, 9.6, 0.2, 0, 6.8, 78, 2.8, 1, 'medium:100|katori:120|g:1', 'chukandar'],
  ['drumstick', 'Drumstick', 'Vegetables', 37, 2.1, 8.5, 0.2, 0, 2, 42, 3.2, 1, 'piece:40|g:1', 'moringa|sahjan|murungakkai'],
  ['mushroom', 'Mushroom', 'Vegetables', 22, 3.1, 3.3, 0.3, 0.1, 2, 5, 1, 1, 'katori:70|g:1', 'khumb|button mushroom'],
  ['sweet-corn', 'Sweet corn', 'Vegetables', 86, 3.2, 19, 1.2, 0.2, 3.2, 15, 2.7, 1, 'katori:140|cob:90|g:1', 'bhutta|makai'],

  /* ---- Meat, fish & egg ---------------------------------------------------- */
  ['chicken-raw', 'Chicken (skinless)', 'Meat, fish & egg', 109, 20, 0, 3, 0.9, 0, 70, 0, 0.75, 'katori:120|piece:60|g:1', 'murgh|kozhi'],
  ['mutton-raw', 'Mutton', 'Meat, fish & egg', 194, 18.5, 0, 13.3, 6, 0, 65, 0, 0.75, 'katori:120|piece:50|g:1', 'goat meat|gosht|lamb'],
  ['fish-raw', 'Fish (rohu)', 'Meat, fish & egg', 97, 16.6, 0, 1.4, 0.4, 0, 55, 0, 0.8, 'piece:80|katori:120|g:1', 'machli|meen|rohu|katla'],
  ['prawn-raw', 'Prawn', 'Meat, fish & egg', 89, 19.1, 0.9, 0.8, 0.2, 0, 148, 0, 0.75, 'katori:100|g:1', 'jhinga|chemmeen'],
  ['egg-raw', 'Egg', 'Meat, fish & egg', 143, 12.6, 0.7, 9.5, 3.1, 0.4, 124, 0, 1, 'whole egg:50|white only:33|g:1', 'anda|mutta'],

  /* ---- Nuts & seeds --------------------------------------------------------- */
  ['peanut', 'Peanut', 'Nuts & seeds', 567, 25.3, 16.1, 49.2, 6.3, 4, 18, 8.5, 1, 'katori:100|tbsp:12|handful:20|g:1', 'moongphali|groundnut|shengdana'],
  ['cashew', 'Cashew', 'Nuts & seeds', 553, 18.2, 30.2, 43.8, 7.8, 5.9, 12, 3.3, 1, 'tbsp:12|handful:20|piece:1.5|g:1', 'kaju|mundiri'],
  ['almond', 'Almond', 'Nuts & seeds', 579, 21.2, 21.6, 49.9, 3.8, 4.4, 1, 12.5, 1, 'tbsp:12|handful:20|piece:1.2|g:1', 'badam'],
  ['coconut-fresh', 'Coconut (fresh)', 'Nuts & seeds', 354, 3.3, 15.2, 33.5, 29.7, 6.2, 20, 9, 1, 'katori:80|tbsp:10|g:1', 'nariyal|thengai|kobbari'],
  ['sesame', 'Sesame seeds', 'Nuts & seeds', 573, 17.7, 23.4, 49.7, 7, 0.3, 11, 11.8, 1, 'tsp:4|tbsp:10|g:1', 'til|ellu'],
  ['walnut', 'Walnut', 'Nuts & seeds', 654, 15.2, 13.7, 65.2, 6.1, 2.6, 2, 6.7, 1, 'tbsp:12|piece:5|g:1', 'akhrot'],

  /* ---- Sweeteners ----------------------------------------------------------- */
  ['sugar', 'Sugar', 'Sweeteners', 398, 0, 99.5, 0, 0, 99.5, 1, 0, 1, 'tsp:5|tbsp:15|g:1', 'cheeni|shakkar'],
  ['jaggery', 'Jaggery', 'Sweeteners', 383, 0.4, 95, 0.1, 0, 85, 30, 0, 1, 'tsp:6|tbsp:18|piece:20|g:1', 'gur|bella|vellam'],
  ['honey', 'Honey', 'Sweeteners', 319, 0.3, 79.5, 0, 0, 79, 4, 0.2, 1, 'tsp:7|tbsp:21|g:1', 'shahad|madhu'],

  /* ---- Flavour & other ------------------------------------------------------ */
  ['salt', 'Salt', 'Flavour & other', 0, 0, 0, 0, 0, 0, 38758, 0, 1, 'tsp:5|pinch:0.4|g:1', 'namak|uppu'],
  ['ginger', 'Ginger', 'Flavour & other', 67, 2.3, 12.3, 0.9, 0.2, 1.7, 13, 2.4, 1, 'tsp:5|inch piece:10|g:1', 'adrak|inji'],
  ['garlic', 'Garlic', 'Flavour & other', 145, 6.3, 29.8, 0.5, 0.1, 1, 17, 2.1, 1, 'clove:3|tsp:5|g:1', 'lehsun|poondu'],
  ['green-chilli', 'Green chilli', 'Flavour & other', 40, 1.9, 8.8, 0.4, 0, 5.1, 9, 1.5, 1, 'piece:5|g:1', 'hari mirch|pachi mirchi'],
  ['coriander-leaves', 'Coriander leaves', 'Flavour & other', 23, 2.1, 3.7, 0.5, 0, 0.9, 46, 2.8, 1, 'tbsp:4|bunch:80|g:1', 'dhaniya patta|kothmir|kothamalli'],
  ['tamarind', 'Tamarind', 'Flavour & other', 239, 2.8, 62.5, 0.6, 0.3, 57, 28, 5.1, 1, 'tbsp:15|lemon size:25|g:1', 'imli|puli|chinch'],
  ['lemon-juice', 'Lemon juice', 'Flavour & other', 22, 0.4, 6.9, 0.2, 0, 2.5, 1, 0.3, 1, 'tsp:5|whole lemon:30|g:1', 'nimbu|elumichai'],
  ['garam-masala', 'Garam masala', 'Flavour & other', 379, 14, 45, 15, 3, 2, 60, 25, 1, 'tsp:3|g:1', 'masala|spice mix'],
  ['turmeric', 'Turmeric', 'Flavour & other', 354, 7.8, 64.9, 9.9, 3.1, 3.2, 38, 21, 1, 'tsp:3|g:1', 'haldi|manjal'],
  ['red-chilli-powder', 'Red chilli powder', 'Flavour & other', 314, 12, 56.6, 17.3, 3.3, 10.3, 30, 27.2, 1, 'tsp:3|g:1', 'lal mirch|mirchi powder'],
  ['cumin-seeds', 'Cumin seeds', 'Flavour & other', 375, 17.8, 44.2, 22.3, 1.5, 2.3, 168, 10.5, 1, 'tsp:3|g:1', 'jeera|jeeragam'],
  ['mustard-seeds', 'Mustard seeds', 'Flavour & other', 508, 26, 28, 36, 2, 6.8, 13, 12.2, 1, 'tsp:4|g:1', 'rai|sarson|kadugu'],
  ['hing', 'Hing (asafoetida)', 'Flavour & other', 297, 4, 68, 1.1, 0.2, 0, 50, 4, 1, 'pinch:0.3|tsp:3|g:1', 'asafoetida|perungayam'],
]

const FIELD = [
  'id', 'name', 'group', 'kcal', 'protein', 'carbs', 'fat', 'satFat',
  'sugar', 'sodium', 'fibre', 'yield', 'measuresRaw', 'aka',
]

export const ingredients = ROWS.map((row) => {
  const g = {}
  FIELD.forEach((f, i) => { g[f] = row[i] })
  g.aka = String(g.aka || '').split('|').filter(Boolean)
  g.measures = String(g.measuresRaw).split('|').map((m) => {
    const [label, grams] = m.split(':')
    return { label, grams: Number(grams) }
  }).filter((m) => m.label && isFinite(m.grams))
  delete g.measuresRaw
  return g
})

export const ingredientById = Object.fromEntries(ingredients.map((g) => [g.id, g]))

export const ingredientGroups = [...new Set(ingredients.map((g) => g.group))]

export function searchIngredients(query, limit = 30) {
  const q = String(query || '').trim().toLowerCase()
  if (!q) return ingredients.slice(0, limit)
  const out = []
  for (const g of ingredients) {
    const hay = `${g.name} ${g.id} ${g.aka.join(' ')}`.toLowerCase()
    if (!hay.includes(q)) continue
    const rank = g.name.toLowerCase().startsWith(q) ? 0
      : g.name.toLowerCase().includes(q) ? 1 : 2
    out.push([rank, g])
  }
  out.sort((a, b) => a[0] - b[0] || a[1].name.localeCompare(b[1].name))
  return out.slice(0, limit).map(([, g]) => g)
}

/**
 * Nutrition for one measured amount of an ingredient.
 *
 * `grams` is always the RAW weight, because that is what the composition table
 * describes. A "katori (cooked)" measure already carries its raw-equivalent
 * weight, so no yield maths happens here — doing it in both places is how a
 * portion gets divided by three twice.
 */
export function amountNutrition(ingredientId, grams) {
  const g = ingredientById[ingredientId]
  if (!g || !(grams > 0)) return null
  const f = grams / 100
  const r = (v, d = 1) => Math.round(v * f * 10 ** d) / 10 ** d
  return {
    kcal: Math.round(g.kcal * f),
    protein: r(g.protein), carbs: r(g.carbs), fat: r(g.fat),
    satFat: r(g.satFat), sugar: r(g.sugar),
    sodium: Math.round(g.sodium * f), fibre: r(g.fibre),
  }
}
