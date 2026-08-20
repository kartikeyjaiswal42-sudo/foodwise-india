// INDIAN COOKED-FOOD REFERENCE TABLE
// ============================================================================
// The packaged-food catalog (`foodDatabase.js`) answers "what is in this pack".
// This answers the other half of an Indian diet, which is most of it: dal, sabzi,
// roti, rice, chaat, mithai — food that arrives on a plate with no label at all.
//
// It is the shared backbone of three features: the meal photo estimator, the
// home-cooked meal builder, and the eating-out catalog. One table, so a katori
// of dal weighs the same whether you photographed it, built it, or picked it.
//
// BASIS, stated rather than implied
// ---------------------------------
// Values are per ONE standard serving of the dish as normally cooked at HOME,
// derived from IFCT 2017 (Indian Food Composition Tables, NIN Hyderabad)
// composition data applied to the standard household measures NIN uses in its
// Dietary Guidelines for Indians:
//
//     1 katori  = 150 ml serving bowl        1 roti  = ~40 g (from ~30 g atta)
//     1 glass   = 250 ml                     1 cup   = 150 ml
//     1 plate   = a single-person restaurant/stall portion
//
// These are REFERENCE values for a typical preparation, not a measurement of
// anyone's specific cooking. Two households cook the same dal to a 40% calorie
// spread depending on the tadka alone. Every consumer of this table must show a
// RANGE, never a bare number — see `lib/mealEstimate.js`, which enforces it.
//
// WHY "ghar ki daal" AND "restaurant ki daal" ARE DIFFERENT ROWS OF THE SAME DISH
// -------------------------------------------------------------------------------
// They are not the same food. The difference is almost entirely added fat:
// restaurant dal makhani carries butter and cream a home cooker does not add,
// and a dhaba finishes with far more oil than either. Rather than bury this in a
// vague multiplier, each CATEGORY declares how much fat a non-home preparation
// adds per serving (`CONTEXT_FAT`), so the UI can state the assumption out loud:
// "restaurant version assumes ~9 g extra butter/cream per katori".
//
// Fat is added at 9 kcal/g, with the saturated share set by what is actually
// being added (cream and butter in a restaurant gravy, refined oil at a stall).

/* --------------------------------------------------------------------------
 * Serving units
 * ------------------------------------------------------------------------ */

export const UNITS = {
  katori: { label: 'katori', plural: 'katoris', hint: '150 ml bowl', grams: 150 },
  plate: { label: 'plate', plural: 'plates', hint: 'one-person portion', grams: 250 },
  piece: { label: 'piece', plural: 'pieces', hint: 'one item', grams: 50 },
  roti: { label: 'roti', plural: 'rotis', hint: '~40 g, from 30 g atta', grams: 40 },
  glass: { label: 'glass', plural: 'glasses', hint: '250 ml', grams: 250 },
  cup: { label: 'cup', plural: 'cups', hint: '150 ml', grams: 150 },
  bowl: { label: 'bowl', plural: 'bowls', hint: '250 ml large bowl', grams: 250 },
  tbsp: { label: 'tbsp', plural: 'tbsp', hint: '15 ml', grams: 15 },
}

/* --------------------------------------------------------------------------
 * Cooking context
 * ------------------------------------------------------------------------ */

export const CONTEXTS = {
  home: {
    id: 'home', label: 'Ghar ka', english: 'Home-cooked',
    note: 'Cooked at home with everyday amounts of oil or ghee.',
  },
  homeRich: {
    id: 'homeRich', label: 'Ghar ka (rich)', english: 'Home, festive',
    note: 'Home cooking with a heavy tadka, extra ghee or cream — tyohaar style.',
  },
  restaurant: {
    id: 'restaurant', label: 'Restaurant', english: 'Restaurant / hotel',
    note: 'Restaurant kitchens finish gravies with butter, cream and more oil than home cooking.',
  },
  dhaba: {
    id: 'dhaba', label: 'Dhaba', english: 'Dhaba / roadside',
    note: 'Roadside dhaba cooking — generous oil and ghee, larger portions.',
  },
  street: {
    id: 'street', label: 'Thela / street', english: 'Street stall',
    note: 'Street preparation — typically deep fried, often in reused oil.',
  },
}

/**
 * Extra fat a non-home preparation adds, by dish category.
 *
 * THE UNIT HERE IS "GRAMS OF ADDED FAT PER 150 g OF SERVING", scaled in
 * `servingFor` by how big the serving actually is. The first version of this
 * table declared grams per SERVING, which quietly assumed every serving was a
 * katori — so a 15 g tablespoon of achar was credited with the same 4 g of
 * restaurant oil as a 150 g bowl of raita, and rendered as "+36 kcal, +86%" on a
 * spoon of pickle. Nobody butters a pickle. Scaling by the serving's real weight
 * is the fix, and it is also what makes the roti numbers reconcile: a 50 g naan
 * picks up 6 g of butter, taking plain naan's 258 kcal to 312 — which is exactly
 * the independently-written butter-naan row.
 *
 * `sat` is the saturated FRACTION of the added fat, and it differs by context on
 * purpose: a restaurant gravy is enriched with butter and cream (~60% saturated)
 * while a street stall fries in refined oil (~15%). Collapsing both into one
 * number would make street food look like it damages blood lipids the same way
 * a cream gravy does, which is not what the evidence says.
 *
 * `null` means the context is not offered for that category — there is no
 * meaningful "street" version of a home dal, and pretending there is invites a
 * user to log a number nobody cooked.
 */
export const CONTEXT_FAT = {
  //                       homeRich   restaurant    dhaba        street
  DAL: { homeRich: 4, restaurant: 8, dhaba: 11, street: null },
  SABZI: { homeRich: 3, restaurant: 6, dhaba: 9, street: null },
  PANEER: { homeRich: 6, restaurant: 13, dhaba: 15, street: null },
  NONVEG: { homeRich: 5, restaurant: 11, dhaba: 14, street: null },
  RICE: { homeRich: 3, restaurant: 6, dhaba: 8, street: null },
  // Breads carry fat far more concentrated than a gravy does — the butter goes
  // on the surface of a 40 g roti, not through a 150 g bowl.
  ROTI: { homeRich: 12, restaurant: 18, dhaba: 24, street: null },
  SOUTH: { homeRich: 3, restaurant: 7, dhaba: null, street: 8 },
  BREAKFAST: { homeRich: 3, restaurant: 6, dhaba: null, street: 7 },
  STREET: { homeRich: null, restaurant: 4, dhaba: 5, street: 3 },
  SWEET: { homeRich: 4, restaurant: 6, dhaba: null, street: 5 },
  // Drinks get NO non-home model. A restaurant does not add ghee to nimbu pani,
  // and while a cafe chai probably does carry more milk and sugar than a home
  // one, we have no figure for it — so the honest thing is to offer no
  // comparison rather than invent a plausible-looking one. `homeRich` stays for
  // the genuinely richer home preparations (badam milk, thandai with malai).
  DRINK: { homeRich: 2, restaurant: null, dhaba: null, street: null },
  THALI: { homeRich: 8, restaurant: 18, dhaba: 24, street: null },
  SIDE: { homeRich: 2, restaurant: 4, dhaba: 5, street: 4 },
}

/**
 * Reference serving the CONTEXT_FAT figures are quoted against, and the ceiling
 * on how far a large serving scales them up. A 250 g plate is not 1.7x as oily
 * as a katori — restaurant portions grow more in food than in fat.
 */
export const CONTEXT_FAT_REFERENCE_G = 150
export const CONTEXT_FAT_MAX_SCALE = 1.4

/** Saturated fraction of the fat each context adds. */
export const CONTEXT_SAT_FRACTION = {
  homeRich: 0.55,     // ghee
  restaurant: 0.58,   // butter + cream
  dhaba: 0.35,        // ghee/vanaspati mix
  street: 0.18,       // refined frying oil
}

export const CATEGORY_LABEL = {
  DAL: 'Dal & pulses',
  SABZI: 'Sabzi & vegetables',
  PANEER: 'Paneer & rich gravies',
  NONVEG: 'Chicken, mutton, fish & egg',
  RICE: 'Rice dishes',
  ROTI: 'Roti & breads',
  SOUTH: 'South Indian',
  BREAKFAST: 'Breakfast & light meals',
  STREET: 'Street food & chaat',
  SWEET: 'Mithai & desserts',
  DRINK: 'Drinks',
  THALI: 'Thali & combos',
  SIDE: 'Sides & accompaniments',
}

/* --------------------------------------------------------------------------
 * The table
 * ------------------------------------------------------------------------ */

// Compact tuples on purpose — this ships to the browser and is never hand-edited
// row by row. Decoded into objects once, below.
//
// [ id, name, category, unit, kcal, protein, carbs, fat, satFat, sugar, sodium, fibre, diet, aka ]
//   diet: 'v' vegetarian · 'e' contains egg · 'n' contains meat/fish
//   All figures are for ONE `unit`, HOME preparation.

const ROWS = [
  /* ---- DAL & PULSES ---------------------------------------------------- */
  ['dal-tadka', 'Dal Tadka', 'DAL', 'katori', 148, 7.4, 18, 5, 1.7, 1.4, 380, 5, 'v', 'toor dal|arhar dal|yellow dal|dal fry|pili dal'],
  ['dal-fry', 'Dal Fry', 'DAL', 'katori', 165, 7.2, 18, 6.5, 2.2, 1.6, 420, 5, 'v', 'dal|fried dal'],
  ['dal-makhani', 'Dal Makhani', 'DAL', 'katori', 232, 8.5, 20, 12.5, 6.4, 2.4, 460, 6, 'v', 'kali dal|black dal|urad makhani'],
  ['chana-masala', 'Chana Masala', 'DAL', 'katori', 182, 8, 24, 6, 1.4, 3.2, 480, 7.5, 'v', 'chole|chhole|chickpea curry|kabuli chana'],
  ['rajma', 'Rajma', 'DAL', 'katori', 172, 8.2, 24, 5, 1.2, 2.6, 450, 8, 'v', 'kidney bean curry|rajma masala'],
  ['sambar', 'Sambar', 'DAL', 'katori', 112, 5, 15, 4, 1.1, 2.8, 420, 4.5, 'v', 'sambhar|sambar dal'],
  ['rasam', 'Rasam', 'DAL', 'katori', 62, 2.2, 8, 2.4, 0.7, 1.8, 400, 1.5, 'v', 'saaru|charu|pepper rasam'],
  ['kadhi', 'Kadhi', 'DAL', 'katori', 142, 5.4, 12, 8, 3.2, 3, 430, 1.5, 'v', 'kadhi pakora|besan kadhi|majjige huli'],
  ['dal-palak', 'Dal Palak', 'DAL', 'katori', 138, 7.6, 15, 5, 1.6, 1.4, 390, 5.5, 'v', 'palak dal|spinach dal'],
  ['moong-dal', 'Moong Dal', 'DAL', 'katori', 132, 7.8, 17, 3.6, 1, 1.2, 360, 4.5, 'v', 'yellow moong|dhuli moong|green gram dal'],
  ['masoor-dal', 'Masoor Dal', 'DAL', 'katori', 140, 7.6, 18, 4.2, 1.2, 1.4, 370, 5, 'v', 'red lentil|lal masoor'],
  ['urad-dal', 'Urad Dal', 'DAL', 'katori', 158, 8.2, 19, 5.4, 1.8, 1.2, 380, 5.5, 'v', 'black gram dal|maa ki dal'],
  ['chana-dal', 'Chana Dal', 'DAL', 'katori', 172, 8.4, 22, 5.2, 1.4, 1.8, 380, 6.5, 'v', 'split bengal gram'],
  ['panchmel-dal', 'Panchmel Dal', 'DAL', 'katori', 176, 8.6, 21, 6.2, 2.2, 1.6, 400, 6, 'v', 'panchratna dal|five lentil dal'],
  ['lobia', 'Lobia', 'DAL', 'katori', 164, 8, 23, 4.4, 1.1, 2.2, 430, 7, 'v', 'black eyed peas|chawli|rongi'],
  ['dal-dhokli', 'Dal Dhokli', 'DAL', 'bowl', 320, 11, 46, 10, 3.2, 5, 620, 7, 'v', 'dal dhokli gujarati'],
  ['misal', 'Misal', 'DAL', 'bowl', 296, 11, 33, 13, 3, 4, 720, 9, 'v', 'misal usal|matki misal'],
  ['sundal', 'Sundal', 'DAL', 'katori', 148, 7, 21, 4, 1.6, 1.8, 300, 6.5, 'v', 'chana sundal|kondakadalai'],
  ['sprouts-salad', 'Sprouts Salad', 'DAL', 'katori', 96, 7.2, 15, 0.8, 0.2, 2.4, 180, 5.5, 'v', 'moong sprouts|ankurit'],
  ['sambhar-vada-dal', 'Dal Makhani (Amritsari)', 'DAL', 'katori', 258, 9, 21, 15, 8, 2.6, 480, 6, 'v', 'amritsari dal|maa chole di dal'],

  /* ---- SABZI & VEGETABLES ---------------------------------------------- */
  ['aloo-gobi', 'Aloo Gobi', 'SABZI', 'katori', 152, 3.4, 19, 7.5, 1.9, 3, 400, 4, 'v', 'potato cauliflower|gobi aloo'],
  ['bhindi-masala', 'Bhindi Masala', 'SABZI', 'katori', 158, 2.8, 12, 11, 2.4, 3.4, 380, 4.5, 'v', 'okra|lady finger|bhindi fry'],
  ['baingan-bharta', 'Baingan Bharta', 'SABZI', 'katori', 142, 2.6, 12, 9.5, 2.1, 4.5, 400, 5, 'v', 'brinjal mash|eggplant bharta|vangi'],
  ['mixed-veg', 'Mixed Vegetable Sabzi', 'SABZI', 'katori', 138, 3.4, 15, 7.4, 1.8, 4.2, 390, 4.5, 'v', 'mix veg|subzi|veg curry'],
  ['aloo-matar', 'Aloo Matar', 'SABZI', 'katori', 158, 4.4, 21, 6.4, 1.6, 3.6, 400, 4.5, 'v', 'potato peas curry'],
  ['palak-sabzi', 'Palak Sabzi', 'SABZI', 'katori', 112, 4, 8, 7.4, 1.8, 1.6, 380, 4, 'v', 'spinach sabzi|saag|palak bhaji'],
  ['sarson-ka-saag', 'Sarson Ka Saag', 'SABZI', 'katori', 186, 5.6, 12, 13, 5.6, 2.4, 420, 6, 'v', 'mustard greens|saag'],
  ['aloo-jeera', 'Aloo Jeera', 'SABZI', 'katori', 168, 3, 25, 6.8, 1.6, 1.6, 360, 3, 'v', 'jeera aloo|cumin potato'],
  ['lauki-sabzi', 'Lauki Sabzi', 'SABZI', 'katori', 88, 1.8, 8, 5.6, 1.3, 3, 340, 2.5, 'v', 'bottle gourd|ghiya|dudhi'],
  ['tinda-sabzi', 'Tinda Sabzi', 'SABZI', 'katori', 92, 1.8, 8, 6, 1.4, 2.8, 340, 2.6, 'v', 'apple gourd'],
  ['karela-sabzi', 'Karela Sabzi', 'SABZI', 'katori', 126, 2.4, 10, 8.6, 1.9, 2, 380, 3.5, 'v', 'bitter gourd|bitter melon'],
  ['cabbage-sabzi', 'Cabbage Sabzi', 'SABZI', 'katori', 96, 2.2, 9, 6, 1.4, 3.6, 340, 3.2, 'v', 'patta gobi|cabbage poriyal'],
  ['gobi-masala', 'Gobi Masala', 'SABZI', 'katori', 140, 3, 13, 8.8, 2, 3.8, 400, 4, 'v', 'cauliflower masala'],
  ['methi-aloo', 'Methi Aloo', 'SABZI', 'katori', 164, 3.6, 21, 7.4, 1.8, 2, 380, 4.5, 'v', 'fenugreek potato'],
  ['bharwa-bhindi', 'Bharwa Bhindi', 'SABZI', 'katori', 192, 4.4, 14, 13.5, 2.8, 3.2, 400, 5.5, 'v', 'stuffed okra'],
  ['aloo-beans', 'Aloo Beans', 'SABZI', 'katori', 148, 3.4, 18, 7.2, 1.7, 2.8, 380, 4.5, 'v', 'french beans potato'],
  ['kaddu-sabzi', 'Kaddu Sabzi', 'SABZI', 'katori', 110, 1.8, 15, 5.4, 1.2, 7, 340, 2.5, 'v', 'pumpkin sabzi|khatta meetha kaddu'],
  ['tori-sabzi', 'Tori Sabzi', 'SABZI', 'katori', 92, 1.9, 8, 6, 1.4, 3, 340, 2.6, 'v', 'ridge gourd|turai|beerakaya'],
  ['avial', 'Avial', 'SABZI', 'katori', 168, 3.4, 13, 12, 7.4, 3.4, 380, 4.5, 'v', 'aviyal|kerala mixed veg'],
  ['thoran', 'Thoran', 'SABZI', 'katori', 118, 3, 10, 7.6, 5, 3, 320, 4, 'v', 'poriyal|cabbage thoran'],
  ['veg-kolhapuri', 'Veg Kolhapuri', 'SABZI', 'katori', 196, 4.6, 16, 13, 3.4, 4.4, 520, 5, 'v', 'kolhapuri vegetable'],
  ['chana-saag', 'Chana Saag', 'SABZI', 'katori', 172, 7.4, 18, 8, 2, 2.8, 420, 6.5, 'v', 'chole palak'],
  ['aloo-shimla', 'Aloo Shimla Mirch', 'SABZI', 'katori', 158, 3.2, 21, 7, 1.6, 3, 370, 3.8, 'v', 'potato capsicum'],
  ['soya-chunk-curry', 'Soya Chunk Curry', 'SABZI', 'katori', 186, 14, 14, 8.4, 2, 3, 460, 5, 'v', 'nutrela|meal maker|soya curry'],

  /* ---- PANEER & RICH GRAVIES ------------------------------------------- */
  ['paneer-butter-masala', 'Paneer Butter Masala', 'PANEER', 'katori', 272, 11, 13, 21, 11.5, 6, 520, 2.5, 'v', 'pbm|paneer makhani|butter paneer'],
  ['palak-paneer', 'Palak Paneer', 'PANEER', 'katori', 218, 11.5, 9, 16, 8.6, 2.6, 480, 3.5, 'v', 'spinach paneer|saag paneer'],
  ['matar-paneer', 'Matar Paneer', 'PANEER', 'katori', 232, 11, 15, 15, 8, 4.4, 490, 4, 'v', 'peas paneer'],
  ['kadai-paneer', 'Kadai Paneer', 'PANEER', 'katori', 248, 11.5, 12, 18, 9.4, 4.6, 520, 3, 'v', 'karahi paneer'],
  ['shahi-paneer', 'Shahi Paneer', 'PANEER', 'katori', 288, 11, 15, 21.5, 12, 8, 500, 2, 'v', 'royal paneer'],
  ['paneer-bhurji', 'Paneer Bhurji', 'PANEER', 'katori', 246, 14, 8, 18, 9.8, 3.4, 480, 1.8, 'v', 'scrambled paneer'],
  ['paneer-tikka', 'Paneer Tikka', 'PANEER', 'plate', 292, 17, 10, 21, 11, 4, 620, 2, 'v', 'grilled paneer|tandoori paneer'],
  ['malai-kofta', 'Malai Kofta', 'PANEER', 'katori', 342, 9.5, 22, 25, 12.5, 7, 540, 3, 'v', 'kofta curry'],
  ['navratan-korma', 'Navratan Korma', 'PANEER', 'katori', 288, 8, 20, 20, 9.5, 8.5, 500, 3.5, 'v', 'korma|veg korma'],
  ['chilli-paneer', 'Chilli Paneer', 'PANEER', 'plate', 316, 15, 18, 21, 10, 6, 880, 2, 'v', 'paneer chilli|indo chinese paneer'],
  ['paneer-do-pyaza', 'Paneer Do Pyaza', 'PANEER', 'katori', 254, 11.5, 14, 18, 9.2, 5.5, 500, 3, 'v', 'do pyaza paneer'],
  ['dahi-paneer', 'Paneer Lababdar', 'PANEER', 'katori', 276, 11, 14, 20.5, 11, 6.2, 520, 2.6, 'v', 'lababdar|paneer handi'],

  /* ---- NON-VEG ---------------------------------------------------------- */
  ['butter-chicken', 'Butter Chicken', 'NONVEG', 'katori', 328, 21, 10, 23, 11.5, 6, 600, 1.5, 'n', 'murgh makhani|chicken makhani'],
  ['chicken-curry', 'Chicken Curry', 'NONVEG', 'katori', 224, 22, 7, 12.5, 4, 2.6, 540, 1.6, 'n', 'murgh curry|desi chicken|chicken masala'],
  ['chicken-tikka-masala', 'Chicken Tikka Masala', 'NONVEG', 'katori', 288, 23, 10, 18, 7.6, 5, 620, 1.8, 'n', 'ctm'],
  ['chicken-tikka', 'Chicken Tikka', 'NONVEG', 'plate', 246, 30, 5, 12, 3.6, 2.4, 700, 0.8, 'n', 'tikka|grilled chicken'],
  ['tandoori-chicken', 'Tandoori Chicken', 'NONVEG', 'plate', 268, 32, 4, 14, 4.2, 2, 720, 0.6, 'n', 'tandoori murgh'],
  ['chicken-65', 'Chicken 65', 'NONVEG', 'plate', 348, 25, 16, 21, 5.4, 3, 880, 1, 'n', 'chicken sixty five'],
  ['mutton-curry', 'Mutton Curry', 'NONVEG', 'katori', 312, 22, 7, 22, 8.6, 2.4, 560, 1.5, 'n', 'gosht|lamb curry|mutton masala'],
  ['rogan-josh', 'Rogan Josh', 'NONVEG', 'katori', 334, 23, 8, 24, 9.6, 3, 580, 1.6, 'n', 'kashmiri mutton'],
  ['keema', 'Keema', 'NONVEG', 'katori', 296, 21, 8, 20, 8, 2.4, 560, 1.8, 'n', 'mutton keema|minced meat|kheema'],
  ['fish-curry', 'Fish Curry', 'NONVEG', 'katori', 186, 20, 6, 9, 3.6, 2.4, 540, 1.4, 'n', 'machli curry|meen curry'],
  ['fish-fry', 'Fish Fry', 'NONVEG', 'plate', 268, 24, 9, 15, 3.4, 1, 620, 0.6, 'n', 'tawa fish|fried fish'],
  ['prawn-curry', 'Prawn Curry', 'NONVEG', 'katori', 198, 19, 7, 10.5, 4.4, 2.6, 620, 1.4, 'n', 'jhinga|chemmeen'],
  ['egg-curry', 'Egg Curry', 'NONVEG', 'katori', 246, 14, 8, 18, 5.4, 3, 500, 1.6, 'e', 'anda curry|egg masala'],
  ['egg-bhurji', 'Egg Bhurji', 'NONVEG', 'katori', 218, 14, 5, 16, 4.6, 2, 460, 0.8, 'e', 'anda bhurji|scrambled egg'],
  ['boiled-egg', 'Boiled Egg', 'NONVEG', 'piece', 78, 6.3, 0.6, 5.3, 1.6, 0.6, 62, 0, 'e', 'uble ande|anda'],
  ['omelette', 'Omelette', 'NONVEG', 'piece', 168, 11, 2, 13, 3.6, 1, 320, 0.4, 'e', 'masala omelette|anda omelette'],
  ['chicken-biryani', 'Chicken Biryani', 'NONVEG', 'plate', 486, 26, 58, 17, 6.4, 4, 940, 3, 'n', 'murgh biryani|hyderabadi biryani'],
  ['mutton-biryani', 'Mutton Biryani', 'NONVEG', 'plate', 542, 26, 58, 23, 9, 4, 960, 3, 'n', 'gosht biryani'],
  ['chicken-kebab', 'Seekh Kebab', 'NONVEG', 'plate', 288, 24, 6, 19, 6.6, 1.6, 700, 0.8, 'n', 'seekh|kebab|kabab'],
  ['butter-chicken-boneless', 'Chicken Korma', 'NONVEG', 'katori', 306, 22, 9, 21, 8.4, 4, 580, 1.4, 'n', 'korma|shahi chicken'],

  /* ---- RICE ------------------------------------------------------------- */
  ['plain-rice', 'Plain Rice', 'RICE', 'katori', 198, 4, 44, 0.5, 0.1, 0.1, 5, 0.8, 'v', 'chawal|steamed rice|bhaat|sada chawal'],
  ['jeera-rice', 'Jeera Rice', 'RICE', 'katori', 236, 4.2, 44, 5.4, 2.4, 0.2, 300, 1, 'v', 'cumin rice'],
  ['veg-pulao', 'Veg Pulao', 'RICE', 'katori', 228, 5, 40, 5.8, 2, 2, 360, 2.4, 'v', 'pulav|pilaf|veg rice'],
  ['veg-biryani', 'Veg Biryani', 'RICE', 'plate', 396, 9, 62, 12.5, 5, 4, 780, 4.5, 'v', 'vegetable biryani'],
  ['khichdi', 'Khichdi', 'RICE', 'katori', 186, 6.4, 30, 4.6, 1.9, 0.8, 340, 2.6, 'v', 'khichari|moong dal khichdi'],
  ['curd-rice', 'Curd Rice', 'RICE', 'katori', 182, 5.6, 30, 4.4, 2.4, 3, 320, 0.9, 'v', 'dahi chawal|thayir sadam|mosaranna'],
  ['lemon-rice', 'Lemon Rice', 'RICE', 'katori', 216, 4.2, 38, 6, 1.4, 0.6, 380, 1.4, 'v', 'chitranna|nimmakaya pulihora'],
  ['tamarind-rice', 'Tamarind Rice', 'RICE', 'katori', 232, 4.4, 40, 6.4, 1.5, 2.6, 420, 1.8, 'v', 'puliyodarai|pulihora|imli rice'],
  ['fried-rice', 'Veg Fried Rice', 'RICE', 'plate', 342, 7.4, 54, 11, 2.4, 3, 820, 3, 'v', 'chinese fried rice'],
  ['ghee-rice', 'Ghee Rice', 'RICE', 'katori', 262, 4.2, 44, 8.4, 5.2, 0.4, 320, 1, 'v', 'nei choru|ney soru'],
  ['bisibelebath', 'Bisi Bele Bath', 'RICE', 'katori', 244, 7.4, 38, 7.4, 3, 1.8, 480, 3.4, 'v', 'bisibelabath|sambar rice'],
  ['coconut-rice', 'Coconut Rice', 'RICE', 'katori', 244, 4.4, 40, 8, 5.6, 1.4, 360, 2, 'v', 'thengai sadam'],

  /* ---- ROTI & BREADS ---------------------------------------------------- */
  ['chapati', 'Chapati / Phulka', 'ROTI', 'roti', 104, 3.2, 20, 1.4, 0.3, 0.3, 110, 2.6, 'v', 'roti|phulka|atta roti|gehu roti'],
  ['tandoori-roti', 'Tandoori Roti', 'ROTI', 'roti', 128, 3.8, 24, 1.8, 0.4, 0.4, 240, 2.8, 'v', 'tandoor roti'],
  ['rumali-roti', 'Rumali Roti', 'ROTI', 'roti', 118, 3.2, 23, 1.4, 0.3, 0.4, 200, 1, 'v', 'roomali'],
  ['naan', 'Naan', 'ROTI', 'piece', 258, 7.4, 45, 5.4, 2.2, 3, 420, 1.8, 'v', 'plain naan'],
  ['butter-naan', 'Butter Naan', 'ROTI', 'piece', 312, 7.6, 45, 11.5, 6, 3, 460, 1.8, 'v', 'makhani naan'],
  ['garlic-naan', 'Garlic Naan', 'ROTI', 'piece', 302, 7.8, 46, 10, 5, 3, 480, 2, 'v', 'lehsuni naan'],
  ['kulcha', 'Kulcha', 'ROTI', 'piece', 268, 7, 46, 6.4, 2.6, 3, 440, 1.8, 'v', 'amritsari kulcha'],
  ['paratha-plain', 'Plain Paratha', 'ROTI', 'piece', 212, 4.2, 27, 9.6, 4.4, 0.5, 240, 3, 'v', 'paratha|sada paratha|lachha'],
  ['aloo-paratha', 'Aloo Paratha', 'ROTI', 'piece', 292, 6, 40, 12, 5.4, 1.4, 420, 4, 'v', 'potato paratha'],
  ['gobi-paratha', 'Gobi Paratha', 'ROTI', 'piece', 272, 6, 36, 11.6, 5.2, 1.8, 420, 4.4, 'v', 'cauliflower paratha'],
  ['paneer-paratha', 'Paneer Paratha', 'ROTI', 'piece', 328, 11, 36, 16, 8, 1.8, 440, 3.4, 'v', 'cottage cheese paratha'],
  ['missi-roti', 'Missi Roti', 'ROTI', 'roti', 158, 5.4, 22, 5.4, 1.8, 0.6, 280, 3.6, 'v', 'besan roti'],
  ['makki-roti', 'Makki Di Roti', 'ROTI', 'roti', 168, 3.6, 26, 5.6, 2.4, 0.6, 240, 3.2, 'v', 'maize roti|corn roti'],
  ['bajra-roti', 'Bajra Roti', 'ROTI', 'roti', 148, 4.4, 24, 3.8, 1, 0.4, 180, 4, 'v', 'pearl millet roti|sajje rotti'],
  ['jowar-roti', 'Jowar Roti', 'ROTI', 'roti', 138, 3.8, 26, 2.2, 0.5, 0.4, 170, 3.6, 'v', 'jolada rotti|sorghum roti'],
  ['thepla', 'Thepla', 'ROTI', 'piece', 158, 4, 21, 6.4, 2, 0.8, 260, 3, 'v', 'methi thepla|gujarati thepla'],
  ['puri', 'Puri', 'ROTI', 'piece', 102, 2, 13, 4.8, 1.2, 0.2, 90, 1.2, 'v', 'poori|luchi'],
  ['bhatura', 'Bhatura', 'ROTI', 'piece', 288, 6, 40, 11.5, 3, 1.6, 340, 1.6, 'v', 'bhature'],
  ['appam', 'Appam', 'SOUTH', 'piece', 122, 2.2, 24, 2, 1.4, 1.6, 140, 0.8, 'v', 'palappam'],

  /* ---- SOUTH INDIAN ----------------------------------------------------- */
  ['idli', 'Idli', 'SOUTH', 'piece', 58, 2, 12, 0.3, 0.1, 0.2, 130, 0.6, 'v', 'idly|steamed rice cake'],
  ['rava-idli', 'Rava Idli', 'SOUTH', 'piece', 84, 2.4, 14, 2.2, 1, 0.4, 190, 0.8, 'v', 'sooji idli'],
  ['plain-dosa', 'Plain Dosa', 'SOUTH', 'piece', 138, 3.2, 22, 4.2, 1.4, 0.4, 190, 1, 'v', 'dosai|sada dosa'],
  ['masala-dosa', 'Masala Dosa', 'SOUTH', 'piece', 248, 5, 38, 8.6, 2.8, 1.4, 420, 2.8, 'v', 'masale dose'],
  ['rava-dosa', 'Rava Dosa', 'SOUTH', 'piece', 208, 3.6, 28, 9, 2.6, 0.6, 380, 1.2, 'v', 'sooji dosa'],
  ['set-dosa', 'Set Dosa', 'SOUTH', 'piece', 118, 2.8, 19, 3.4, 1.2, 0.4, 180, 0.8, 'v', 'sponge dosa'],
  ['neer-dosa', 'Neer Dosa', 'SOUTH', 'piece', 78, 1.4, 15, 1.4, 0.9, 0.2, 110, 0.4, 'v', 'water dosa'],
  ['uttapam', 'Uttapam', 'SOUTH', 'piece', 186, 4.4, 29, 5.6, 1.8, 1.6, 320, 1.8, 'v', 'uthappam|onion uttapam'],
  ['medu-vada', 'Medu Vada', 'SOUTH', 'piece', 132, 4, 13, 7, 1.7, 0.3, 220, 1.8, 'v', 'vada|uddina vade|urad vada'],
  ['upma', 'Upma', 'SOUTH', 'katori', 198, 4.4, 29, 7, 2.4, 1.4, 420, 1.8, 'v', 'uppittu|rava upma'],
  ['pongal', 'Ven Pongal', 'SOUTH', 'katori', 246, 7, 34, 9, 4.6, 0.4, 400, 2.2, 'v', 'khara pongal|ghee pongal'],
  ['idiyappam', 'Idiyappam', 'SOUTH', 'piece', 96, 1.8, 21, 0.6, 0.4, 0.2, 90, 0.6, 'v', 'string hopper|sevai nool'],
  ['puttu', 'Puttu', 'SOUTH', 'katori', 186, 3.8, 38, 2.4, 1.8, 0.6, 140, 2.4, 'v', 'pittu'],
  ['coconut-chutney', 'Coconut Chutney', 'SIDE', 'tbsp', 42, 0.7, 1.6, 3.8, 3, 0.6, 60, 0.8, 'v', 'nariyal chutney|thengai chutney'],
  ['tomato-chutney', 'Tomato Chutney', 'SIDE', 'tbsp', 26, 0.4, 2.4, 1.7, 0.3, 1.2, 90, 0.5, 'v', 'thakkali chutney'],

  /* ---- BREAKFAST & LIGHT MEALS ------------------------------------------ */
  ['poha', 'Poha', 'BREAKFAST', 'plate', 248, 5, 40, 7.6, 2, 2.4, 460, 2.6, 'v', 'kanda poha|pohe|aval|chivda poha'],
  ['sabudana-khichdi', 'Sabudana Khichdi', 'BREAKFAST', 'katori', 268, 3.4, 42, 10, 3, 1.6, 320, 1.4, 'v', 'sago khichdi|javvarisi'],
  ['dhokla', 'Dhokla', 'BREAKFAST', 'piece', 62, 2.4, 9, 1.8, 0.4, 1.6, 180, 1, 'v', 'khaman|khaman dhokla'],
  ['besan-chilla', 'Besan Chilla', 'BREAKFAST', 'piece', 138, 6.4, 14, 6.4, 1.4, 1, 300, 3, 'v', 'chila|pudla|besan omelette'],
  ['moong-chilla', 'Moong Dal Chilla', 'BREAKFAST', 'piece', 124, 6.8, 15, 4.4, 1, 0.8, 280, 3, 'v', 'pesarattu'],
  ['oats-porridge', 'Oats Porridge (with milk)', 'BREAKFAST', 'bowl', 218, 9, 32, 6.2, 2.8, 8, 120, 4, 'v', 'oats|daliya oats'],
  ['daliya', 'Daliya', 'BREAKFAST', 'katori', 168, 5.4, 32, 2.4, 0.8, 1.2, 260, 4.4, 'v', 'broken wheat|lapsi|godhuma rava'],
  ['cornflakes-milk', 'Cornflakes with Milk', 'BREAKFAST', 'bowl', 232, 8, 40, 4.8, 2.8, 16, 320, 1.4, 'v', 'cereal milk'],
  ['bread-butter', 'Bread & Butter', 'BREAKFAST', 'piece', 132, 3, 15, 6.6, 3.8, 1.4, 220, 0.8, 'v', 'buttered toast|makhan bread'],
  ['bread-omelette', 'Bread Omelette', 'BREAKFAST', 'plate', 328, 15, 32, 16, 5, 2.6, 620, 1.8, 'e', 'anda bread'],
  ['sandwich-veg', 'Veg Sandwich', 'BREAKFAST', 'piece', 246, 7, 34, 9, 3.4, 4, 520, 3, 'v', 'grilled sandwich|bombay sandwich'],
  ['upma-poha-mix', 'Vermicelli Upma', 'BREAKFAST', 'katori', 212, 5, 34, 6.4, 2, 1.8, 420, 1.6, 'v', 'semiya upma|seviyan'],
  ['paratha-curd', 'Paratha with Curd', 'BREAKFAST', 'plate', 320, 9, 34, 16, 7.6, 3.4, 380, 3.2, 'v', 'paratha dahi'],
  ['ragi-malt', 'Ragi Malt', 'BREAKFAST', 'glass', 178, 5.4, 32, 3.4, 1.8, 12, 90, 3, 'v', 'ragi java|finger millet drink|ambali'],

  /* ---- STREET FOOD & CHAAT ---------------------------------------------- */
  ['samosa', 'Samosa', 'STREET', 'piece', 262, 4.4, 30, 14, 4, 1.6, 420, 2.6, 'v', 'singhara|samosas'],
  ['kachori', 'Kachori', 'STREET', 'piece', 224, 4.4, 24, 12.5, 3.4, 1, 380, 2.4, 'v', 'khasta kachori|pyaz kachori'],
  ['vada-pav', 'Vada Pav', 'STREET', 'piece', 286, 6.6, 40, 11.5, 3.4, 3.4, 620, 3, 'v', 'wada pav|batata vada pav'],
  ['pav-bhaji', 'Pav Bhaji', 'STREET', 'plate', 448, 10, 58, 19, 10, 8, 1080, 7, 'v', 'bhaji pav'],
  ['misal-pav', 'Misal Pav', 'STREET', 'plate', 412, 13, 52, 17, 4.6, 5, 980, 9, 'v', 'misal'],
  ['pani-puri', 'Pani Puri (6)', 'STREET', 'plate', 178, 3.4, 28, 6, 1.4, 3.4, 640, 2.6, 'v', 'golgappa|puchka|gupchup|batasha'],
  ['bhel-puri', 'Bhel Puri', 'STREET', 'plate', 252, 5.4, 40, 8.4, 2, 6, 780, 4, 'v', 'bhelpuri|jhal muri'],
  ['sev-puri', 'Sev Puri', 'STREET', 'plate', 298, 6, 40, 13, 3, 6.4, 820, 4, 'v', 'sevpuri'],
  ['dahi-puri', 'Dahi Puri', 'STREET', 'plate', 288, 7, 40, 11, 3.4, 8, 720, 3.6, 'v', 'dahi batata puri'],
  ['papdi-chaat', 'Papdi Chaat', 'STREET', 'plate', 312, 7, 40, 14, 4, 8, 820, 3.6, 'v', 'papri chaat'],
  ['aloo-tikki', 'Aloo Tikki', 'STREET', 'piece', 128, 2.2, 17, 5.8, 1.4, 1, 280, 1.8, 'v', 'tikki|potato patty'],
  ['ragda-pattice', 'Ragda Pattice', 'STREET', 'plate', 368, 11, 50, 14, 3.4, 5, 880, 8, 'v', 'ragda patties'],
  ['dahi-vada', 'Dahi Vada', 'STREET', 'piece', 116, 4, 13, 5.4, 1.8, 3, 260, 1.4, 'v', 'dahi bhalla|thayir vadai'],
  ['chole-bhature', 'Chole Bhature', 'STREET', 'plate', 682, 17, 84, 30, 8.4, 6, 1240, 11, 'v', 'chhole bhature'],
  ['pakora', 'Pakora (100 g)', 'STREET', 'plate', 316, 7.4, 26, 20, 4.6, 2, 480, 4.4, 'v', 'bhajji|bhajiya|fritters|onion pakoda'],
  ['momos-veg', 'Veg Momos (6, steamed)', 'STREET', 'plate', 216, 6.4, 36, 5, 1.4, 2.4, 560, 2.6, 'v', 'dumpling|dim sum|steamed momo'],
  ['momos-fried', 'Fried Momos (6)', 'STREET', 'plate', 348, 7, 38, 18, 4.4, 2.6, 640, 2.8, 'v', 'kurkure momos'],
  ['kathi-roll', 'Kathi Roll', 'STREET', 'piece', 352, 12, 40, 16, 5.6, 3.4, 720, 3, 'v', 'frankie|wrap|veg roll'],
  ['egg-roll', 'Egg Roll', 'STREET', 'piece', 396, 15, 40, 20, 6.4, 3.4, 780, 3, 'e', 'anda roll|kolkata roll'],
  ['chowmein', 'Chowmein', 'STREET', 'plate', 368, 9, 56, 12, 2.8, 4, 1080, 4, 'v', 'hakka noodles|chow|veg noodles'],
  ['gobi-manchurian', 'Gobi Manchurian', 'STREET', 'plate', 386, 8, 44, 20, 4.6, 8, 1180, 4.4, 'v', 'manchurian|cauliflower manchurian'],
  ['spring-roll', 'Spring Roll', 'STREET', 'piece', 158, 3.4, 19, 7.6, 1.8, 1.6, 340, 1.4, 'v', 'veg spring roll'],
  ['dabeli', 'Dabeli', 'STREET', 'piece', 292, 6, 42, 11, 3.6, 6, 640, 3.4, 'v', 'kutchi dabeli'],
  ['samosa-chaat', 'Samosa Chaat', 'STREET', 'plate', 392, 9, 46, 19, 5.4, 6, 880, 5, 'v', 'samosa chana chaat'],
  ['corn-chaat', 'Corn Chaat', 'STREET', 'katori', 168, 4.4, 28, 5, 2.2, 4, 320, 3.4, 'v', 'masala corn|bhutta chaat'],
  ['bhutta', 'Bhutta (roasted corn)', 'STREET', 'piece', 128, 4, 26, 1.6, 0.3, 4.4, 180, 3, 'v', 'roasted corn|makai'],
  ['idli-vada-plate', 'Idli Vada Plate', 'STREET', 'plate', 356, 11, 52, 12, 3.4, 2, 780, 4.4, 'v', 'idli vada sambar'],
  ['maggi-street', 'Maggi (street style)', 'STREET', 'plate', 396, 9, 54, 16, 7, 3, 1240, 3, 'v', 'masala maggi|noodles'],
  ['omelette-pav', 'Omelette Pav', 'STREET', 'plate', 348, 15, 34, 17, 5.4, 3, 680, 1.8, 'e', 'anda pav'],
  ['jalebi', 'Jalebi (2 pc)', 'STREET', 'plate', 216, 1.4, 38, 7, 3.4, 30, 60, 0.2, 'v', 'jilebi|imarti'],

  /* ---- MITHAI & DESSERTS ------------------------------------------------- */
  ['gulab-jamun', 'Gulab Jamun', 'SWEET', 'piece', 148, 2.2, 22, 6, 3.2, 19, 40, 0.2, 'v', 'gulaab jamun'],
  ['rasgulla', 'Rasgulla', 'SWEET', 'piece', 124, 3, 24, 1.6, 1, 22, 30, 0, 'v', 'rosogolla|rasagola'],
  ['rasmalai', 'Rasmalai', 'SWEET', 'piece', 178, 5.4, 22, 8, 4.8, 20, 50, 0, 'v', 'ras malai'],
  ['motichoor-laddu', 'Motichoor Laddu', 'SWEET', 'piece', 182, 2.4, 24, 8.6, 4.6, 18, 30, 0.6, 'v', 'ladoo|laddoo|boondi laddu'],
  ['besan-laddu', 'Besan Laddu', 'SWEET', 'piece', 188, 3.6, 22, 9.6, 5.4, 16, 20, 1.2, 'v', 'besan ladoo'],
  ['barfi', 'Barfi', 'SWEET', 'piece', 152, 3.2, 18, 7.6, 4.6, 16, 30, 0.2, 'v', 'burfi|kaju katli|milk barfi'],
  ['mysore-pak', 'Mysore Pak', 'SWEET', 'piece', 188, 2.2, 20, 11.5, 7, 16, 20, 0.6, 'v', 'mysurpa'],
  ['gajar-halwa', 'Gajar Halwa', 'SWEET', 'katori', 346, 5.4, 44, 17, 10.5, 36, 90, 3, 'v', 'carrot halwa|gajrela'],
  ['sooji-halwa', 'Sooji Halwa', 'SWEET', 'katori', 322, 4.4, 44, 14.5, 8.6, 26, 60, 1.2, 'v', 'rava halwa|sheera|kesari bath'],
  ['moong-halwa', 'Moong Dal Halwa', 'SWEET', 'katori', 396, 7.4, 44, 21, 12.5, 30, 60, 2.4, 'v', 'moong dal ka halwa'],
  ['kheer', 'Kheer', 'SWEET', 'katori', 248, 6.4, 36, 8.6, 5.2, 28, 90, 0.6, 'v', 'payasam|payesh|rice kheer'],
  ['shrikhand', 'Shrikhand', 'SWEET', 'katori', 282, 7.4, 38, 11, 7, 34, 90, 0.2, 'v', 'srikhand|amrakhand'],
  ['sandesh', 'Sandesh', 'SWEET', 'piece', 118, 4.4, 15, 4.4, 2.8, 13, 30, 0, 'v', 'shondesh'],
  ['peda', 'Peda', 'SWEET', 'piece', 128, 3, 17, 5.4, 3.4, 15, 30, 0, 'v', 'pedha|milk peda'],
  ['malpua', 'Malpua', 'SWEET', 'piece', 216, 3, 30, 9.6, 4.6, 20, 60, 0.4, 'v', 'malpuwa'],
  ['modak', 'Modak', 'SWEET', 'piece', 132, 1.8, 20, 5.2, 3.8, 12, 30, 1, 'v', 'ukadiche modak|kozhukattai'],
  ['chikki', 'Chikki', 'SWEET', 'piece', 148, 3.4, 18, 7.4, 1.6, 15, 20, 1.2, 'v', 'gajak|peanut chikki|patti'],
  ['kulfi', 'Kulfi', 'SWEET', 'piece', 198, 4.4, 24, 9.6, 6, 22, 60, 0.2, 'v', 'kulfi falooda|matka kulfi'],
  ['falooda', 'Falooda', 'SWEET', 'glass', 348, 7.4, 56, 11, 6.4, 44, 140, 1.4, 'v', 'faluda'],
  ['ice-cream-scoop', 'Ice Cream (1 scoop)', 'SWEET', 'piece', 148, 2.6, 18, 7.4, 4.8, 16, 60, 0.4, 'v', 'icecream'],
  ['halwa-atta', 'Atta Halwa', 'SWEET', 'katori', 338, 5, 44, 16, 9.4, 24, 60, 2, 'v', 'kada prasad|wheat halwa'],

  /* ---- DRINKS ------------------------------------------------------------ */
  ['masala-chai', 'Masala Chai', 'DRINK', 'cup', 92, 2.4, 12, 3.4, 2.1, 11, 40, 0, 'v', 'chai|tea|doodh patti|adrak chai'],
  ['cutting-chai', 'Cutting Chai', 'DRINK', 'cup', 62, 1.6, 8, 2.3, 1.4, 7.5, 26, 0, 'v', 'cutting|half chai'],
  ['black-tea', 'Black Tea (with sugar)', 'DRINK', 'cup', 42, 0.1, 10, 0, 0, 10, 8, 0, 'v', 'kali chai|lemon tea|nimbu chai'],
  ['green-tea', 'Green Tea (no sugar)', 'DRINK', 'cup', 3, 0, 0.5, 0, 0, 0, 5, 0, 'v', 'hari chai'],
  ['filter-coffee', 'Filter Coffee', 'DRINK', 'cup', 112, 3.4, 14, 4.6, 2.9, 12, 60, 0, 'v', 'kaapi|degree coffee|south indian coffee'],
  ['instant-coffee-milk', 'Milk Coffee', 'DRINK', 'cup', 96, 3, 12, 3.6, 2.2, 10, 50, 0, 'v', 'nescafe|coffee'],
  ['sweet-lassi', 'Sweet Lassi', 'DRINK', 'glass', 262, 8, 38, 8.4, 5.2, 34, 120, 0, 'v', 'lassi|mishti doi drink'],
  ['salted-lassi', 'Salted Lassi', 'DRINK', 'glass', 138, 8, 12, 7, 4.4, 11, 480, 0, 'v', 'namkeen lassi'],
  ['chaas', 'Chaas / Buttermilk', 'DRINK', 'glass', 64, 3.4, 6, 2.6, 1.6, 5.5, 420, 0, 'v', 'buttermilk|majjige|mor|neer mor'],
  ['badam-milk', 'Badam Milk', 'DRINK', 'glass', 212, 8.4, 26, 8.6, 4.6, 24, 130, 0.6, 'v', 'almond milk|badam doodh'],
  ['nimbu-pani', 'Nimbu Pani (sweet)', 'DRINK', 'glass', 92, 0.2, 23, 0, 0, 22, 60, 0.2, 'v', 'shikanji|lemonade|lemon water'],
  ['sugarcane-juice', 'Sugarcane Juice', 'DRINK', 'glass', 182, 0.4, 44, 0.2, 0, 42, 30, 0.2, 'v', 'ganne ka ras|karumbu juice'],
  ['coconut-water', 'Coconut Water', 'DRINK', 'glass', 46, 0.6, 10, 0.2, 0.2, 8, 105, 0.2, 'v', 'nariyal pani|elaneer'],
  ['thandai', 'Thandai', 'DRINK', 'glass', 268, 7.4, 34, 12, 5.4, 30, 90, 1.2, 'v', 'sardai'],
  ['mango-shake', 'Mango Shake', 'DRINK', 'glass', 288, 7, 48, 8, 4.6, 44, 100, 1.4, 'v', 'aam shake|mango lassi'],
  ['aam-panna', 'Aam Panna', 'DRINK', 'glass', 118, 0.4, 29, 0.2, 0, 26, 320, 0.6, 'v', 'raw mango drink'],
  ['plain-milk', 'Milk (full cream)', 'DRINK', 'glass', 162, 8, 12, 8.6, 5.4, 12, 105, 0, 'v', 'doodh|milk'],
  ['curd-bowl', 'Curd / Dahi', 'SIDE', 'katori', 92, 5, 7, 5, 3.2, 6.5, 70, 0, 'v', 'dahi|yoghurt|thayir|mosaru'],

  /* ---- THALI & COMBOS ----------------------------------------------------- */
  ['veg-thali', 'Veg Thali', 'THALI', 'plate', 742, 22, 108, 25, 9.5, 14, 1680, 15, 'v', 'thali|veg meals|full meals'],
  ['nonveg-thali', 'Non-veg Thali', 'THALI', 'plate', 928, 40, 108, 38, 14, 12, 1880, 13, 'n', 'chicken thali|mutton thali'],
  ['south-meals', 'South Indian Meals', 'THALI', 'plate', 686, 18, 112, 19, 8.4, 10, 1560, 13, 'v', 'sadhya|banana leaf meals|full meals'],
  ['dal-chawal', 'Dal Chawal', 'THALI', 'plate', 352, 11, 62, 6, 2, 1.6, 400, 6, 'v', 'dal rice|dal bhat'],
  ['rajma-chawal', 'Rajma Chawal', 'THALI', 'plate', 386, 12, 68, 7, 1.6, 3, 470, 9, 'v', 'rajma rice'],
  ['chole-chawal', 'Chole Chawal', 'THALI', 'plate', 392, 12, 68, 7.6, 1.8, 3.4, 500, 8.6, 'v', 'chana rice'],
  ['roti-sabzi', 'Roti Sabzi (2 roti + sabzi)', 'THALI', 'plate', 348, 9, 53, 11, 2.6, 4.6, 620, 9, 'v', 'roti sabji|chapati sabzi'],
  ['dal-roti', 'Dal Roti (2 roti + dal)', 'THALI', 'plate', 356, 14, 58, 8, 2.4, 2, 600, 10, 'v', 'roti dal'],
  ['curd-rice-pickle', 'Curd Rice with Pickle', 'THALI', 'plate', 232, 6, 36, 7, 2.8, 3.2, 780, 1.2, 'v', 'thayir sadam achar'],

  /* ---- SIDES ------------------------------------------------------------- */
  ['papad', 'Papad (roasted)', 'SIDE', 'piece', 38, 2.2, 5.4, 0.4, 0.1, 0.2, 220, 0.9, 'v', 'papadum|appalam|happala'],
  ['papad-fried', 'Papad (fried)', 'SIDE', 'piece', 72, 2.1, 5.4, 4.6, 1.1, 0.2, 230, 0.9, 'v', 'fried papad'],
  ['achar', 'Achar / Pickle', 'SIDE', 'tbsp', 42, 0.3, 1.6, 3.8, 0.5, 0.8, 620, 0.4, 'v', 'pickle|aam ka achar|nimbu achar'],
  ['green-chutney', 'Green Chutney', 'SIDE', 'tbsp', 18, 0.5, 1.6, 1.1, 0.2, 0.5, 120, 0.6, 'v', 'hari chutney|pudina chutney|dhaniya chutney'],
  ['raita', 'Raita', 'SIDE', 'katori', 84, 4.2, 7, 4.4, 2.7, 5.4, 300, 0.6, 'v', 'boondi raita|cucumber raita|dahi raita'],
  ['salad-kachumber', 'Kachumber Salad', 'SIDE', 'katori', 38, 1.2, 7, 0.4, 0.1, 3.6, 180, 1.8, 'v', 'salad|kachumbar|onion salad'],
  ['ghee-tsp', 'Ghee (1 tsp)', 'SIDE', 'tbsp', 45, 0, 0, 5, 3.1, 0, 0, 0, 'v', 'desi ghee|clarified butter'],
  ['butter-pat', 'Butter (1 tbsp)', 'SIDE', 'tbsp', 108, 0.1, 0.1, 12, 7.5, 0.1, 90, 0, 'v', 'makhan|amul butter'],
  ['pav', 'Pav', 'SIDE', 'piece', 124, 3.6, 23, 1.8, 0.7, 2.4, 230, 1, 'v', 'ladi pav|bun|bread roll'],
]

const FIELD = [
  'id', 'name', 'category', 'unit', 'kcal', 'protein', 'carbs', 'fat',
  'satFat', 'sugar', 'sodium', 'fibre', 'diet', 'aka',
]

/** Decoded dish list. One object per row, `aka` split into a search array. */
export const dishes = ROWS.map((row) => {
  const d = {}
  FIELD.forEach((f, i) => { d[f] = row[i] })
  d.aka = String(d.aka || '').split('|').filter(Boolean)
  d.categoryLabel = CATEGORY_LABEL[d.category] || d.category
  // Which cooking contexts are meaningful for this dish. `home` always is.
  const fats = CONTEXT_FAT[d.category] || {}
  d.contexts = ['home', ...Object.keys(fats).filter((c) => fats[c] != null)]
  return d
})

export const dishById = Object.fromEntries(dishes.map((d) => [d.id, d]))

export const dishCategories = Object.keys(CATEGORY_LABEL)
  .filter((c) => dishes.some((d) => d.category === c))

/**
 * Free-text dish search. Matches name, id and the `aka` alias list, which is
 * what makes "golgappa", "puchka" and "pani puri" all find the same row — the
 * same food has a different name in every state, and a search that only knows
 * the name we happened to type would fail most of the country.
 */
export function searchDishes(query, limit = 40) {
  const q = String(query || '').trim().toLowerCase()
  if (!q) return dishes.slice(0, limit)
  const terms = q.split(/\s+/).filter(Boolean)
  const scored = []
  for (const d of dishes) {
    const hay = `${d.name} ${d.id} ${d.aka.join(' ')}`.toLowerCase()
    let score = 0
    for (const t of terms) {
      if (!hay.includes(t)) { score = -1; break }
      if (d.name.toLowerCase().startsWith(t)) score += 6
      else if (d.name.toLowerCase().includes(t)) score += 4
      else if (d.aka.some((a) => a.startsWith(t))) score += 3
      else score += 1
    }
    if (score > 0) scored.push([score, d])
  }
  scored.sort((a, b) => b[0] - a[0] || a[1].name.localeCompare(b[1].name))
  return scored.slice(0, limit).map(([, d]) => d)
}
