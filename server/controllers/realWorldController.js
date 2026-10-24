// server/controllers/realWorldController.js
import RealWorldProgress from "../models/RealWorldProgress.js";
import User from "../models/User.js";
import RewardHistory from "../models/RewardHistory.js";

// Canonical 10 Real-World Locations and their Missions
export const REAL_WORLD_LOCATIONS = [
  {
    id: "supermarket",
    title: "Supermarket City",
    shortTitle: "Supermarket",
    icon: "🛒",
    badgeEmoji: "🛍️",
    topic: "Shopping, Prices, Totals, Discounts & Change",
    themeColor: "from-amber-500/20 to-orange-600/20",
    borderColor: "border-amber-500/40",
    description: "Navigate supermarket aisles, manage a shopping budget, calculate exact change, and hunt for discount deals!",
    initialBudget: 500,
    items: [
      { id: "rice", name: "Fragrant Rice (1kg)", price: 180, icon: "🌾" },
      { id: "milk", name: "Fresh Milk (1L)", price: 60, icon: "🥛" },
      { id: "fruits", name: "Seasonal Fruits", price: 120, icon: "🍎" },
      { id: "bread", name: "Whole Grain Bread", price: 40, icon: "🍞" },
      { id: "cheese", name: "Artisan Cheese", price: 110, icon: "🧀" },
      { id: "juice", name: "Organic Orange Juice", price: 70, icon: "🧃" },
    ],
    missions: [
      {
        index: 0,
        title: "The Basket Budget Quest",
        story: "You enter Supermarket City with ₹500 in your adventure wallet. The village elder requested staples for the banquet.",
        objective: "Pick Rice (₹180), Fresh Milk (₹60), and Apples (₹120). Calculate how much change remains in your wallet.",
        question: "You buy Rice (₹180), Milk (₹60), and Apples (₹120) with a ₹500 note. How much money remains?",
        options: ["₹120", "₹140", "₹160", "₹180"],
        correctAnswer: "₹140",
        hint: "Step 1: Calculate total cost: ₹180 + ₹60 + ₹120. Step 2: Subtract from ₹500.",
        explanation: "Total spent = ₹180 + ₹60 + ₹120 = ₹360.\nChange remaining = ₹500 − ₹360 = ₹140.",
        rewardCoins: 40,
        rewardXp: 30,
        rewardStars: 1,
        achievementKey: "smart_shopper",
        achievementName: "Smart Shopper",
      },
      {
        index: 1,
        title: "Best Deal Unit Price Comparison",
        story: "The market vendor offers two sizes of sweet strawberry jam. You want to get the best value per kilogram.",
        objective: "Brand A sells 500g for ₹90. Brand B sells 1 kg (1000g) for ₹160. Which brand is cheaper per kg, and by how much?",
        question: "Brand A: 500g = ₹90. Brand B: 1kg (1000g) = ₹160. Which is cheaper per kg and by how much?",
        options: [
          "Brand B is cheaper by ₹20/kg",
          "Brand A is cheaper by ₹10/kg",
          "Both cost the exact same",
          "Brand B is cheaper by ₹30/kg",
        ],
        correctAnswer: "Brand B is cheaper by ₹20/kg",
        hint: "Double Brand A's 500g price to find 1000g (1 kg): ₹90 × 2 = ₹180. Compare to Brand B's ₹160.",
        explanation: "Brand A cost per kg = ₹90 × 2 = ₹180.\nBrand B cost per kg = ₹160.\nBrand B is cheaper by ₹180 − ₹160 = ₹20 per kg!",
        rewardCoins: 45,
        rewardXp: 35,
        rewardStars: 1,
      },
      {
        index: 2,
        title: "Coupon Discount Calculation",
        story: "You found a golden coupon at the checkout counter offering a 15% discount on your entire ₹400 bill!",
        objective: "Calculate the discount savings and the final amount to pay.",
        question: "A 15% discount is applied to a bill of ₹400. What is the final amount you need to pay?",
        options: ["₹320", "₹340", "₹350", "₹360"],
        correctAnswer: "₹340",
        hint: "15% of ₹400 = (15 / 100) × 400 = ₹60. Subtract ₹60 from ₹400.",
        explanation: "Discount = 15% of ₹400 = (15/100) × 400 = ₹60.\nFinal amount = ₹400 − ₹60 = ₹340.",
        rewardCoins: 50,
        rewardXp: 40,
        rewardStars: 1,
      },
    ],
  },
  {
    id: "pizza",
    title: "Pizza Kingdom",
    shortTitle: "Pizza",
    icon: "🍕",
    badgeEmoji: "🍕",
    topic: "Fractions, Equal Sharing & Portions",
    themeColor: "from-rose-500/20 to-red-600/20",
    borderColor: "border-rose-500/40",
    description: "Bake artisanal pizzas, slice into equal fractional portions, satisfy royal customers, and discover equivalent fractions!",
    missions: [
      {
        index: 0,
        title: "The Knight's Feast Slices",
        story: "A royal pizza is freshly sliced into 8 equal slices. Sir Valor arrives after battle and eats 3 slices.",
        objective: "Determine what fractional portion of the pizza is still left on the wooden serving board.",
        question: "A pizza is cut into 8 equal slices. If 3 slices are eaten, what fraction remains?",
        options: ["3/8", "5/8", "4/8", "1/2"],
        correctAnswer: "5/8",
        hint: "Total slices = 8. Slices left = 8 − 3 = 5. Write remaining slices over total slices.",
        explanation: "Remaining slices = 8 − 3 = 5 slices.\nFraction remaining = 5/8 (five eighths).",
        rewardCoins: 40,
        rewardXp: 30,
        rewardStars: 1,
        achievementKey: "fraction_chef",
        achievementName: "Fraction Chef",
      },
      {
        index: 1,
        title: "Equivalent Pizza Towers",
        story: "The Grand Chef wants two tables to receive matching pizza quantities even though one pizza is cut into 4 slices and the other into 8.",
        objective: "Find the fraction equivalent to 2/4.",
        question: "Which of the following fractions is equivalent to 2/4?",
        options: ["1/4", "3/8", "4/8", "5/8"],
        correctAnswer: "4/8",
        hint: "Multiply numerator and denominator of 2/4 by 2: (2×2) / (4×2).",
        explanation: "2/4 simplified = 1/2.\nIn eighths: 1/2 = 4/8. Thus, 2/4 is equivalent to 4/8!",
        rewardCoins: 45,
        rewardXp: 35,
        rewardStars: 1,
      },
      {
        index: 2,
        title: "Multi-Guest Fair Sharing",
        story: "12 equal slices of supreme mushroom pizza are to be shared equally among 4 eager adventurers.",
        objective: "Calculate what fraction of the whole pizza each adventurer receives.",
        question: "12 slices are shared equally among 4 adventurers. What fraction of the whole pizza does each receive?",
        options: ["1/4", "1/3", "1/6", "3/8"],
        correctAnswer: "1/4",
        hint: "Each gets 12 ÷ 4 = 3 slices. As a fraction of the 12-slice whole: 3/12.",
        explanation: "Each gets 12 ÷ 4 = 3 slices.\nAs a fraction: 3/12 = 1/4 (one quarter of the whole pizza).",
        rewardCoins: 50,
        rewardXp: 40,
        rewardStars: 1,
      },
    ],
  },
  {
    id: "treasure",
    title: "Treasure Forest",
    shortTitle: "Treasure",
    icon: "🗺️",
    badgeEmoji: "💎",
    topic: "Number Puzzles, Arithmetic & Cryptic Clues",
    themeColor: "from-emerald-500/20 to-teal-600/20",
    borderColor: "border-emerald-500/40",
    description: "Solve ancient stone code locks, decipher path equations, and unlock magical treasure chests buried deep in the forest!",
    missions: [
      {
        index: 0,
        title: "The Ancient Gate Tumbler",
        story: "A mossy stone gate blocks the trail into Treasure Forest. Three numerical tumblers require correct arithmetic values.",
        objective: "Solve Tumbler 1: 14 + 18 − 25 = ?",
        question: "What is the code for Tumbler 1: 14 + 18 − 25?",
        options: ["5", "7", "9", "11"],
        correctAnswer: "7",
        hint: "First add: 14 + 18 = 32. Then subtract 25.",
        explanation: "Step 1: 14 + 18 = 32.\nStep 2: 32 − 25 = 7. The tumbler clicks open to 7!",
        rewardCoins: 40,
        rewardXp: 30,
        rewardStars: 1,
        achievementKey: "treasure_explorer",
        achievementName: "Treasure Explorer",
      },
      {
        index: 1,
        title: "The Missing Pattern Gem",
        story: "To cross the whispering stream, you must step only on stones that follow a doubling multiplication pattern.",
        objective: "Identify the missing number in the sequence: 3, 6, 12, 24, [ ? ], 96.",
        question: "Find the missing number in the sequence: 3, 6, 12, 24, [ ? ], 96",
        options: ["36", "42", "48", "54"],
        correctAnswer: "48",
        hint: "Each number is multiplied by 2: 3×2=6, 6×2=12, 12×2=24. What is 24 × 2?",
        explanation: "Pattern rule: Multiply by 2 at each step.\n24 × 2 = 48, and 48 × 2 = 96. The missing number is 48!",
        rewardCoins: 45,
        rewardXp: 35,
        rewardStars: 1,
      },
      {
        index: 2,
        title: "Chest of Golden Division",
        story: "The golden treasure chest is locked with 48 gold gems that must be packed into 6 equal slots.",
        objective: "Calculate 48 ÷ 6 to reveal the chest key.",
        question: "How many gems go into each of the 6 slots if 48 gems are shared equally?",
        options: ["6", "7", "8", "9"],
        correctAnswer: "8",
        hint: "Think: 6 × what number equals 48?",
        explanation: "48 ÷ 6 = 8. Each slot receives 8 gems, unlocking the chest!",
        rewardCoins: 50,
        rewardXp: 40,
        rewardStars: 1,
      },
    ],
  },
  {
    id: "cooking",
    title: "Cooking Academy",
    shortTitle: "Cooking",
    icon: "🍳",
    badgeEmoji: "🥞",
    topic: "Measurements, Recipe Scaling & Ratios",
    themeColor: "from-yellow-500/20 to-amber-600/20",
    borderColor: "border-yellow-500/40",
    description: "Scale gourmet pancake recipes, convert fractional cups, and measure liquid ingredients accurately for royal feasts!",
    missions: [
      {
        index: 0,
        title: "Royal Pancake Batch Scaling",
        story: "The standard pancake recipe serves 2 people and requires 1/2 cup of flour. The head chef wants to prepare pancakes for 6 guests.",
        objective: "Calculate how many cups of flour are needed for 6 guests.",
        question: "A recipe for 2 people needs 1/2 cup of flour. How many cups of flour are needed for 6 people?",
        options: ["1 cup", "1 and 1/2 cups", "2 cups", "3/4 cup"],
        correctAnswer: "1 and 1/2 cups",
        hint: "Multiplier = 6 ÷ 2 = 3 batches. Multiply 3 by 1/2 cup.",
        explanation: "Multiplier = 6 guests ÷ 2 guests = 3 batches.\nFlour needed = 3 × 1/2 = 3/2 = 1 and 1/2 cups (1.5 cups)!",
        rewardCoins: 40,
        rewardXp: 30,
        rewardStars: 1,
        achievementKey: "master_chef",
        achievementName: "Master Chef",
      },
      {
        index: 1,
        title: "Liquid Milk Conversion",
        story: "If 1 serving needs 1/4 cup of milk, how much milk is needed for 8 servings?",
        objective: "Multiply 8 by 1/4 cup.",
        question: "Each serving requires 1/4 cup of fresh milk. How many cups are needed for 8 servings?",
        options: ["1 cup", "2 cups", "3 cups", "4 cups"],
        correctAnswer: "2 cups",
        hint: "8 × (1/4) = 8/4 cups.",
        explanation: "8 × (1/4) = 8/4 = 2 whole cups of milk!",
        rewardCoins: 45,
        rewardXp: 35,
        rewardStars: 1,
      },
    ],
  },
  {
    id: "travel",
    title: "Travel Explorer",
    shortTitle: "Travel",
    icon: "🚗",
    badgeEmoji: "🚆",
    topic: "Distance, Speed, Time & Journey Budgets",
    themeColor: "from-blue-500/20 to-indigo-600/20",
    borderColor: "border-blue-500/40",
    description: "Plot road trips, calculate travel times using Speed = Distance / Time, and choose eco-friendly transport within budget!",
    missions: [
      {
        index: 0,
        title: "Express Train to Observatory",
        story: "The distance from Capital City to Mountain Observatory is 180 km. The High-Speed Train travels at 90 km/h.",
        objective: "Calculate the total travel time in hours.",
        question: "Distance = 180 km. Speed = 90 km/h. How many hours will the journey take?",
        options: ["1.5 hours", "2 hours", "2.5 hours", "3 hours"],
        correctAnswer: "2 hours",
        hint: "Use formula: Time = Distance ÷ Speed.",
        explanation: "Time = Distance ÷ Speed = 180 km ÷ 90 km/h = 2 hours exactly!",
        rewardCoins: 40,
        rewardXp: 30,
        rewardStars: 1,
        achievementKey: "travel_calculator",
        achievementName: "Travel Calculator",
      },
      {
        index: 1,
        title: "Electric Vehicle Energy Cost",
        story: "An electric car uses 1 kWh of electricity every 6 km. For a 180 km trip with electricity at ₹8/kWh, what is the fuel cost?",
        objective: "Calculate energy consumed and multiply by the unit rate.",
        question: "An EV travels 180 km (1 kWh per 6 km). Electricity is ₹8 per kWh. What is the total cost?",
        options: ["₹200", "₹240", "₹280", "₹320"],
        correctAnswer: "₹240",
        hint: "First: 180 ÷ 6 = 30 kWh. Next: 30 × ₹8.",
        explanation: "Energy needed = 180 km ÷ 6 km/kWh = 30 kWh.\nTotal cost = 30 kWh × ₹8 = ₹240!",
        rewardCoins: 50,
        rewardXp: 40,
        rewardStars: 1,
      },
    ],
  },
  {
    id: "builder",
    title: "Builder's Workshop",
    shortTitle: "Builder",
    icon: "🏡",
    badgeEmoji: "📐",
    topic: "Geometry, Area, Perimeter & Materials",
    themeColor: "from-cyan-500/20 to-blue-600/20",
    borderColor: "border-cyan-500/40",
    description: "Construct boundary fences, lay square meter lawn turf, and estimate construction costs with real architectural math!",
    missions: [
      {
        index: 0,
        title: "Community Garden Perimeter Fencing",
        story: "You are building a wooden fence around a rectangular community garden of length 12 meters and width 8 meters.",
        objective: "Calculate the total perimeter fence length required.",
        question: "Garden length = 12m, width = 8m. What is the perimeter of the garden fence?",
        options: ["36 meters", "40 meters", "48 meters", "96 meters"],
        correctAnswer: "40 meters",
        hint: "Perimeter formula: P = 2 × (Length + Width).",
        explanation: "Perimeter P = 2 × (12m + 8m) = 2 × 20m = 40 meters of fencing!",
        rewardCoins: 40,
        rewardXp: 30,
        rewardStars: 1,
        achievementKey: "master_builder",
        achievementName: "Master Builder",
      },
      {
        index: 1,
        title: "Lawn Turf Material Budget",
        story: "The garden has Length = 12m and Width = 8m (Area = 96 m²). Turf grass costs ₹50 per square meter.",
        objective: "Calculate total turfing expense.",
        question: "Area = 96 m². Turf costs ₹50/m². What is the total turfing cost?",
        options: ["₹4,200", "₹4,800", "₹5,200", "₹5,600"],
        correctAnswer: "₹4,800",
        hint: "Multiply 96 m² by ₹50.",
        explanation: "Total cost = 96 m² × ₹50/m² = ₹4,800!",
        rewardCoins: 50,
        rewardXp: 40,
        rewardStars: 1,
      },
    ],
  },
  {
    id: "finance",
    title: "Money Management Town",
    shortTitle: "Finance",
    icon: "💰",
    badgeEmoji: "🏦",
    topic: "Income, Expenses, Savings & Simple Interest",
    themeColor: "from-emerald-500/20 to-green-600/20",
    borderColor: "border-emerald-500/40",
    description: "Master the 50/30/20 allowance rule, set target savings for dream items, and compute simple interest earnings!",
    missions: [
      {
        index: 0,
        title: "Target Savings Goal for Telescope",
        story: "You receive ₹1,000 monthly allowance and save 20% each month for a science telescope costing ₹800.",
        objective: "Calculate how many months of saving are required.",
        question: "You save 20% of ₹1,000 monthly. How many months to save ₹800 for the telescope?",
        options: ["3 months", "4 months", "5 months", "6 months"],
        correctAnswer: "4 months",
        hint: "Monthly savings = 20% of ₹1,000 = ₹200. Divide ₹800 by ₹200.",
        explanation: "Monthly savings = 0.20 × ₹1,000 = ₹200.\nMonths needed = ₹800 ÷ ₹200 = 4 months!",
        rewardCoins: 45,
        rewardXp: 35,
        rewardStars: 1,
        achievementKey: "budget_planner",
        achievementName: "Budget Planner",
      },
      {
        index: 1,
        title: "Post Office Simple Interest Growth",
        story: "You deposit ₹5,000 into a children's savings bond earning 6% simple annual interest for 2 years.",
        objective: "Calculate the interest earned using I = (P × R × T) / 100.",
        question: "Principal = ₹5,000, Rate = 6% per year, Time = 2 years. How much simple interest is earned?",
        options: ["₹300", "₹500", "₹600", "₹800"],
        correctAnswer: "₹600",
        hint: "I = (5,000 × 6 × 2) ÷ 100 = 60,000 ÷ 100.",
        explanation: "I = (P × R × T) / 100 = (5,000 × 6 × 2) / 100 = 60,000 / 100 = ₹600!",
        rewardCoins: 50,
        rewardXp: 40,
        rewardStars: 1,
      },
    ],
  },
  {
    id: "space",
    title: "Space Science Station",
    shortTitle: "Space Station",
    icon: "🚀",
    badgeEmoji: "🛰️",
    topic: "Coordinates, Navigation & Geometry Patterns",
    themeColor: "from-indigo-500/20 to-purple-600/20",
    borderColor: "border-indigo-500/40",
    description: "Guide a space probe on a coordinate grid, dock with orbital stations, and compute light-year trajectory speeds!",
    missions: [
      {
        index: 0,
        title: "Orbital Coordinate Docking",
        story: "The deep space research outpost is located at coordinates (3, 4) on the station radar grid.",
        objective: "Calculate the straight-line distance from the origin (0, 0) to the station using 3-4-5 right triangle geometry.",
        question: "A spacecraft at (0, 0) travels to station at (3, 4). Using √(3² + 4²), what is the distance?",
        options: ["4 units", "5 units", "6 units", "7 units"],
        correctAnswer: "5 units",
        hint: "3² = 9, 4² = 16. 9 + 16 = 25. What is √25?",
        explanation: "Distance = √(3² + 4²) = √(9 + 16) = √25 = 5 units exactly!",
        rewardCoins: 45,
        rewardXp: 35,
        rewardStars: 1,
      },
    ],
  },
  {
    id: "sports",
    title: "Sports Arena",
    shortTitle: "Sports Arena",
    icon: "🏀",
    badgeEmoji: "🏅",
    topic: "Scores, Averages, Statistics & Percentages",
    themeColor: "from-fuchsia-500/20 to-pink-600/20",
    borderColor: "border-fuchsia-500/40",
    description: "Analyze tournament match stats, calculate team scoring averages, and determine free-throw success percentages!",
    missions: [
      {
        index: 0,
        title: "Player Scoring Average",
        story: "In a four-quarter championship match, Captain Dash scored 18, 22, 14, and 26 points.",
        objective: "Calculate the player's average points per quarter.",
        question: "Points scored: 18, 22, 14, and 26 across 4 quarters. What is the average points per quarter?",
        options: ["18 points", "19 points", "20 points", "21 points"],
        correctAnswer: "20 points",
        hint: "Sum the four scores (18 + 22 + 14 + 26 = 80) and divide by 4.",
        explanation: "Total points = 18 + 22 + 14 + 26 = 80.\nAverage = 80 ÷ 4 = 20 points per quarter!",
        rewardCoins: 40,
        rewardXp: 30,
        rewardStars: 1,
      },
    ],
  },
  {
    id: "farm",
    title: "Farm Adventure",
    shortTitle: "Farm",
    icon: "🌾",
    badgeEmoji: "🚜",
    topic: "Harvest Quantities, Packaging & Profit Ratios",
    themeColor: "from-lime-500/20 to-emerald-600/20",
    borderColor: "border-lime-500/40",
    description: "Harvest golden orchard apples, package them into crates, calculate production costs, and maximize farm revenue!",
    missions: [
      {
        index: 0,
        title: "Apple Harvest Crate Packaging",
        story: "The orchard harvested 240 crisp apples. Each transport crate holds exactly 12 apples.",
        objective: "Calculate how many crates can be completely filled.",
        question: "240 apples are packed into crates of 12 apples each. How many crates are filled?",
        options: ["18 crates", "20 crates", "22 crates", "24 crates"],
        correctAnswer: "20 crates",
        hint: "Divide total apples by crate capacity: 240 ÷ 12.",
        explanation: "Crates filled = 240 ÷ 12 = 20 crates!",
        rewardCoins: 40,
        rewardXp: 30,
        rewardStars: 1,
        achievementKey: "real_world_champion",
        achievementName: "Real-World Champion",
      },
    ],
  },
];

// GET /api/real-world/locations
export async function getRealWorldLocations(req, res) {
  try {
    const userId = req.user?.id;

    // Fetch user progress for real-world missions if authenticated
    let completedSet = new Set();
    let starsMap = new Map();

    if (userId) {
      const records = await RealWorldProgress.find({ userId });
      records.forEach((r) => {
        const key = `${r.locationId}-${r.missionIndex}`;
        completedSet.add(key);
        starsMap.set(key, r.starsEarned);
      });
    }

    const locationsWithProgress = REAL_WORLD_LOCATIONS.map((loc) => {
      const missionsWithStatus = loc.missions.map((m) => {
        const key = `${loc.id}-${m.index}`;
        const isDone = completedSet.has(key);
        return {
          ...m,
          completed: isDone,
          starsEarned: isDone ? starsMap.get(key) || 1 : 0,
        };
      });

      const completedCount = missionsWithStatus.filter((m) => m.completed).length;

      return {
        ...loc,
        missions: missionsWithStatus,
        totalMissions: loc.missions.length,
        completedMissions: completedCount,
        isCompleted: completedCount === loc.missions.length,
      };
    });

    const totalCompleted = completedSet.size;
    const totalAvailable = REAL_WORLD_LOCATIONS.reduce((sum, l) => sum + l.missions.length, 0);

    res.json({
      locations: locationsWithProgress,
      totalCompleted,
      totalAvailable,
      progressPercentage: Math.round((totalCompleted / (totalAvailable || 1)) * 100),
    });
  } catch (err) {
    console.error("Get real-world locations error:", err);
    res.status(500).json({ message: "Failed to load real-world locations." });
  }
}

// POST /api/real-world/submit
export async function submitRealWorldMission(req, res) {
  try {
    const userId = req.user?.id;
    const { locationId, missionIndex, selectedAnswer } = req.body;

    const location = REAL_WORLD_LOCATIONS.find((l) => l.id === locationId);
    if (!location) {
      return res.status(404).json({ message: "Location not found." });
    }

    const mission = location.missions.find((m) => m.index === Number(missionIndex));
    if (!mission) {
      return res.status(404).json({ message: "Mission not found." });
    }

    const isCorrect = String(selectedAnswer).trim().toLowerCase() === String(mission.correctAnswer).trim().toLowerCase();

    if (!isCorrect) {
      return res.json({
        isCorrect: false,
        explanation: mission.explanation,
        hint: mission.hint,
        message: "Keep trying! Check Professor Pi's calculation steps and try again.",
      });
    }

    // Correct Answer Handling & Reward Calculation
    let coinsEarned = mission.rewardCoins || 40;
    let xpEarned = mission.rewardXp || 30;
    let starsEarned = mission.rewardStars || 1;
    let isFirstCompletion = true;

    if (userId) {
      const existing = await RealWorldProgress.findOne({
        userId,
        locationId,
        missionIndex: Number(missionIndex),
      });

      if (existing) {
        isFirstCompletion = false;
        // Replay reward (smaller XP & coins, no extra stars)
        coinsEarned = 15;
        xpEarned = 10;
        starsEarned = 0;
        existing.attemptsCount += 1;
        existing.lastPlayedAt = new Date();
        await existing.save();
      } else {
        await RealWorldProgress.create({
          userId,
          locationId,
          missionIndex: Number(missionIndex),
          completed: true,
          starsEarned,
          coinsEarned,
          xpEarned,
        });

        // Record reward history
        await RewardHistory.create({
          userId,
          rewardType: "real_world_mission",
          coins: coinsEarned,
          xp: xpEarned,
          stars: starsEarned,
          reason: `Completed Real-World Mission: ${location.title} - ${mission.title}`,
        });
      }

      // Atomically increment user rewards
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          $inc: {
            totalCoins: coinsEarned,
            totalXP: xpEarned,
            totalPoints: xpEarned,
            totalStars: starsEarned,
          },
        },
        { new: true, select: "-passwordHash" }
      );

      return res.json({
        isCorrect: true,
        isFirstCompletion,
        coinsEarned,
        xpEarned,
        starsEarned,
        explanation: mission.explanation,
        achievementAwarded: isFirstCompletion && mission.achievementName ? mission.achievementName : null,
        user: {
          totalCoins: updatedUser.totalCoins,
          totalXP: updatedUser.totalXP,
          totalStars: updatedUser.totalStars,
          currentLevel: updatedUser.currentLevel,
        },
      });
    }

    // Guest / Offline fallback
    res.json({
      isCorrect: true,
      isFirstCompletion: true,
      coinsEarned,
      xpEarned,
      starsEarned,
      explanation: mission.explanation,
    });
  } catch (err) {
    console.error("Submit real-world mission error:", err);
    res.status(500).json({ message: "Failed to process mission answer." });
  }
}
