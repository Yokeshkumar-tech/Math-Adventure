// client/src/pages/RealWorldMath.jsx - Premium Interactive Real-World Math Adventure
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import confetti from "canvas-confetti";
import {
  playClickSound,
  playCorrectSound,
  playWrongSound,
  playVictorySound,
  playCoinSound,
  isSoundEnabled,
  setSoundEnabled,
  isMusicEnabled,
  setMusicEnabled,
} from "../utils/soundEffects.js";
import api from "../services/api.js";
import {
  Sparkles,
  ShoppingBag,
  Clock,
  Compass,
  Trophy,
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Lightbulb,
  RotateCcw,
  Volume2,
  VolumeX,
  Music,
  Pause,
  Play,
  ArrowRight,
  ChevronRight,
  Flame,
  Star,
  ShieldCheck,
  Search,
  BookOpen,
} from "lucide-react";
import "./RealWorldMath.css";

// 10 Canonical Real-World Locations with detailed interactive missions
export const REAL_WORLD_DATA = [
  {
    id: "supermarket",
    title: "Supermarket City",
    shortTitle: "Supermarket",
    icon: "🛒",
    badgeEmoji: "🛍️",
    topic: "Shopping, Prices, Totals, Discounts & Change",
    themeClass: "theme-amber",
    tagline: "Manage wallets, calculate discounts, and hunt for the best value deals!",
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
        objective: "Pick Rice (₹180), Fresh Milk (₹60), and Fruits (₹120). Calculate how much change remains in your wallet.",
        question: "You buy Rice (₹180), Milk (₹60), and Fruits (₹120) with a ₹500 note. How much money remains?",
        options: ["₹120", "₹140", "₹160", "₹180"],
        correctAnswer: "₹140",
        hint: "Step 1: Calculate total cost: ₹180 + ₹60 + ₹120. Step 2: Subtract this total from ₹500.",
        explanation: "Step 1: Total bill = ₹180 + ₹60 + ₹120 = ₹360.\nStep 2: Remaining change = ₹500 − ₹360 = ₹140.",
        rewardCoins: 40,
        rewardXp: 30,
        rewardStars: 1,
        achievementName: "Smart Shopper",
      },
      {
        index: 1,
        title: "Best Deal Unit Price Comparison",
        story: "The market vendor offers two sizes of sweet strawberry jam. You want to get the best value per kilogram.",
        objective: "Brand A sells 500g for ₹90. Brand B sells 1 kg (1000g) for ₹160. Which brand is cheaper per kg, and by how much?",
        question: "Brand A: 500g = ₹90. Brand B: 1kg (1000g) = ₹160. Which brand is cheaper per kg and by how much?",
        options: [
          "Brand B is cheaper by ₹20/kg",
          "Brand A is cheaper by ₹10/kg",
          "Both cost the exact same",
          "Brand B is cheaper by ₹30/kg",
        ],
        correctAnswer: "Brand B is cheaper by ₹20/kg",
        hint: "Double Brand A's 500g price to find 1000g (1 kg): ₹90 × 2 = ₹180. Compare that to Brand B's ₹160.",
        explanation: "Brand A per kg = ₹90 × 2 = ₹180.\nBrand B per kg = ₹160.\nBrand B is cheaper by ₹180 − ₹160 = ₹20 per kg!",
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
    themeClass: "theme-rose",
    tagline: "Slice pizzas into equal fractional portions, satisfy royal orders, and find equivalent fractions!",
    missions: [
      {
        index: 0,
        title: "The Knight's Feast Slices",
        story: "A royal pizza is freshly sliced into 8 equal slices. Sir Valor arrives after battle and eats 3 slices.",
        objective: "Determine what fractional portion of the pizza is still left on the wooden serving board.",
        question: "A pizza is cut into 8 equal slices. If 3 slices are eaten, what fraction of the pizza remains?",
        options: ["3/8", "5/8", "4/8", "1/2"],
        correctAnswer: "5/8",
        hint: "Total slices = 8. Slices left = 8 − 3 = 5. Write remaining slices over total slices.",
        explanation: "Remaining slices = 8 − 3 = 5 slices.\nFraction remaining = 5/8 (five eighths).",
        rewardCoins: 40,
        rewardXp: 30,
        rewardStars: 1,
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
    themeClass: "theme-emerald",
    tagline: "Solve ancient stone code locks, decipher path equations, and unlock magical treasure chests!",
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
    themeClass: "theme-yellow",
    tagline: "Scale recipes for banquets, convert liquid cups, and balance flavor ratios!",
    recipeName: "Royal Starry Pancakes",
    baseServings: 2,
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
    themeClass: "theme-blue",
    tagline: "Plot scenic routes, calculate travel hours using Speed = Distance / Time, and budget transport!",
    distanceKm: 180,
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
    themeClass: "theme-cyan",
    tagline: "Construct boundary fences, lay square meter lawn turf, and estimate construction materials!",
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
    themeClass: "theme-emerald",
    tagline: "Master the 50/30/20 allowance rule, set target savings goals, and compute interest!",
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
    themeClass: "theme-indigo",
    tagline: "Guide space probes on a coordinate grid, dock with orbital stations, and compute trajectories!",
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
        achievementName: "Cosmic Navigator",
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
    themeClass: "theme-fuchsia",
    tagline: "Analyze tournament match statistics, calculate team scoring averages, and determine percentages!",
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
        achievementName: "Arena Champion",
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
    themeClass: "theme-lime",
    tagline: "Harvest orchard fruit, package into crates, calculate production costs, and maximize revenue!",
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
        achievementName: "Real-World Champion",
      },
    ],
  },
];

export default function RealWorldMath() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  // Mode: "HUB" (location selector) vs "GAME" (interactive playable mission)
  const [viewMode, setViewMode] = useState("HUB");
  const [activeLocationId, setActiveLocationId] = useState("supermarket");
  const [activeMissionIndex, setActiveMissionIndex] = useState(0);

  // Locations state with progress
  const [locations, setLocations] = useState(REAL_WORLD_DATA);
  const [completedSet, setCompletedSet] = useState(new Set());
  const [loadingLocations, setLoadingLocations] = useState(true);

  // Selected Option & Feedback in active game
  const [selectedOption, setSelectedOption] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [showProfessorPi, setShowProfessorPi] = useState(false);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);

  // Audio settings
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [musicOn, setMusicOn] = useState(isMusicEnabled());

  // Interactive Game Specific States
  // 1. Supermarket City states
  const [cartItems, setCartItems] = useState({ rice: 1, milk: 1, fruits: 1 });
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [couponInput, setCouponInput] = useState("");

  // 2. Pizza Kingdom states
  const [pizzaSlices, setPizzaSlices] = useState([true, true, true, false, false, false, false, false]); // 3 eaten (true), 5 left (false)

  // 3. Treasure Forest states
  const [tumbler1, setTumbler1] = useState(7);
  const [tumbler2, setTumbler2] = useState(48);
  const [tumbler3, setTumbler3] = useState(8);

  // 4. Cooking Academy states
  const [cookingServings, setCookingServings] = useState(6);

  // 5. Travel Explorer states
  const [travelDistance, setTravelDistance] = useState(180);
  const [travelSpeed, setTravelSpeed] = useState(90);

  // 6. Builder's Workshop states
  const [gardenLength, setGardenLength] = useState(12);
  const [gardenWidth, setGardenWidth] = useState(8);

  // 7. Money Management states
  const [allowanceSavingsRate, setAllowanceSavingsRate] = useState(20);

  // 8. Space Science Station states
  const [probeX, setProbeX] = useState(3);
  const [probeY, setProbeY] = useState(4);

  // 9. Sports Arena states
  const [qScores, setQScores] = useState([18, 22, 14, 26]);

  // 10. Farm Adventure states
  const [totalApples, setTotalApples] = useState(240);
  const [crateSize, setCrateSize] = useState(12);

  // Fetch real-world location status from server on mount
  useEffect(() => {
    async function loadProgress() {
      try {
        const res = await api.get("/real-world/locations");
        if (res.data?.locations) {
          setLocations(res.data.locations);
          const done = new Set();
          res.data.locations.forEach((loc) => {
            loc.missions?.forEach((m) => {
              if (m.completed) done.add(`${loc.id}-${m.index}`);
            });
          });
          setCompletedSet(done);
        }
      } catch (err) {
        console.warn("Using offline canonical real-world locations data:", err);
      } finally {
        setLoadingLocations(false);
      }
    }
    loadProgress();
  }, []);

  const activeLocation = locations.find((l) => l.id === activeLocationId) || locations[0] || REAL_WORLD_DATA[0];
  const activeMission = activeLocation?.missions?.[activeMissionIndex] || activeLocation?.missions?.[0] || REAL_WORLD_DATA[0].missions[0];

  // Total completed calculation
  const totalMissions = locations.reduce((sum, l) => sum + l.missions.length, 0);
  const completedCount = completedSet.size;
  const progressPercentage = Math.round((completedCount / (totalMissions || 1)) * 100);

  // Audio toggles
  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
  };
  const toggleMusic = () => {
    const next = !musicOn;
    setMusicOn(next);
    setMusicEnabled(next);
  };

  // Launch a location's mission
  const handleOpenLocation = (locId, missionIdx = 0) => {
    playClickSound();
    setActiveLocationId(locId);
    setActiveMissionIndex(missionIdx);
    setSelectedOption("");
    setFeedback(null);
    setShowHint(false);
    setShowProfessorPi(false);
    setShowStoryModal(true);
  };

  const handleStartMissionGame = () => {
    playClickSound();
    setShowStoryModal(false);
    setViewMode("GAME");
  };

  // Supermarket cart item count updater
  const handleUpdateItemQty = (itemId, delta) => {
    playClickSound();
    setCartItems((prev) => {
      const current = prev[itemId] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [itemId]: next };
    });
  };

  const calculateSupermarketTotal = () => {
    const items = activeLocation?.items || REAL_WORLD_DATA[0].items || [];
    let subtotal = 0;
    items.forEach((item) => {
      const qty = cartItems[item.id] || 0;
      subtotal += item.price * qty;
    });
    if (appliedCoupon === "SAVE15") subtotal = Math.round(subtotal * 0.85);
    else if (appliedCoupon === "SAVE10") subtotal = Math.round(subtotal * 0.9);
    return subtotal;
  };

  // Answer submission with server persistence
  const handleSubmitAnswer = async () => {
    if (!selectedOption || submitting || feedback?.isCorrect) return;
    setSubmitting(true);

    try {
      // Call backend validation API
      const res = await api.post("/real-world/submit", {
        locationId: activeLocation.id,
        missionIndex: activeMission.index,
        selectedAnswer: selectedOption,
      });

      if (res.data?.isCorrect) {
        playCorrectSound();
        playCoinSound();
        playVictorySound();
        confetti({ particleCount: 90, spread: 65, origin: { y: 0.6 } });

        const coinsEarned = res.data.coinsEarned || activeMission.rewardCoins || 40;
        const xpEarned = res.data.xpEarned || activeMission.rewardXp || 30;
        const starsEarned = res.data.starsEarned || 1;

        setFeedback({
          isCorrect: true,
          explanation: res.data.explanation || activeMission.explanation,
          coinsEarned,
          xpEarned,
          starsEarned,
          achievement: res.data.achievementAwarded || activeMission.achievementName,
        });

        const key = `${activeLocation.id}-${activeMission.index}`;
        setCompletedSet((prev) => new Set(prev).add(key));

        // Update local user auth state
        if (res.data?.user && setUser) {
          setUser((prev) => ({
            ...prev,
            ...res.data.user,
          }));
        }
      } else {
        playWrongSound();
        setFeedback({
          isCorrect: false,
          explanation: res.data?.message || "Not quite! Check the calculation steps and try again.",
        });
      }
    } catch (err) {
      console.warn("Offline submission check:", err);
      // Deterministic fallback check
      const isCorrect =
        String(selectedOption).trim().toLowerCase() ===
        String(activeMission.correctAnswer).trim().toLowerCase();

      if (isCorrect) {
        playCorrectSound();
        playCoinSound();
        playVictorySound();
        confetti({ particleCount: 90, spread: 65, origin: { y: 0.6 } });

        setFeedback({
          isCorrect: true,
          explanation: activeMission.explanation,
          coinsEarned: activeMission.rewardCoins || 40,
          xpEarned: activeMission.rewardXp || 30,
          starsEarned: 1,
          achievement: activeMission.achievementName,
        });

        const key = `${activeLocation.id}-${activeMission.index}`;
        setCompletedSet((prev) => new Set(prev).add(key));
      } else {
        playWrongSound();
        setFeedback({
          isCorrect: false,
          explanation: "Almost! Review the formula or click '🦉 Ask Professor Pi' for step-by-step help.",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextMission = () => {
    playClickSound();
    setFeedback(null);
    setSelectedOption("");
    setShowHint(false);
    setShowProfessorPi(false);

    if (activeMissionIndex + 1 < activeLocation.missions.length) {
      setActiveMissionIndex((prev) => prev + 1);
    } else {
      // Find next location
      const currentLocIdx = locations.findIndex((l) => l.id === activeLocation.id);
      const nextLocIdx = (currentLocIdx + 1) % locations.length;
      setActiveLocationId(locations[nextLocIdx].id);
      setActiveMissionIndex(0);
      setViewMode("HUB");
    }
  };

  // =========================================================================
  // RENDER VIEW 1: REAL-WORLD ADVENTURE MAIN SCREEN (HUB)
  // =========================================================================
  if (viewMode === "HUB") {
    return (
      <div className="rwm-page-wrapper">
        <div className="rwm-inner-container">
          {/* Top Hub Navigation Bar */}
          <div className="rwm-nav-bar">
            <button
              type="button"
              className="rwm-btn-secondary"
              onClick={() => {
                playClickSound();
                navigate("/map");
              }}
            >
              ← Adventure Map
            </button>

            {/* Player Stats HUD */}
            <div className="rwm-hud-pill-group">
              <div className="rwm-hud-pill">
                <span>{user?.avatar === "mage" ? "🧙" : user?.avatar === "archer" ? "🏹" : "⚔️"}</span>
                <strong>Level {user?.currentLevel || 1}</strong>
              </div>
              <div className="rwm-hud-pill">
                <span>🪙</span>
                <strong>{user?.totalCoins || 0} Coins</strong>
              </div>
              <div className="rwm-hud-pill">
                <span>⭐</span>
                <strong>{user?.totalStars || 0} Stars</strong>
              </div>
              <div className="rwm-hud-pill">
                <span>⚡</span>
                <strong>{user?.totalXP || 0} XP</strong>
              </div>
              <div className="rwm-hud-pill">
                <span>🔥</span>
                <strong>{user?.currentStreak || 1} Streak</strong>
              </div>
            </div>
          </div>

          {/* Hero Banner Section */}
          <section className="rwm-hero-card">
            <div className="rwm-tag-badge">
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin-slow" />
              <span>Interactive Everyday Mathematics Simulator</span>
            </div>

            <h1 className="rwm-main-title">
              REAL-WORLD ADVENTURE — MATH IN ACTION
            </h1>

            <p className="rwm-subtitle">
              Put mathematical formulas to work in genuine everyday scenarios! Manage supermarkets,
              bake gourmet pizzas, decipher ancient forest number locks, scale recipes, and master personal savings.
            </p>

            {/* Quick Action Navigation Buttons */}
            <div className="rwm-hero-actions">
              <button
                type="button"
                className="rwm-btn-primary"
                onClick={() => handleOpenLocation("supermarket", 0)}
              >
                <span>🛒 Continue Adventure</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                className="rwm-btn-accent"
                onClick={() => {
                  playClickSound();
                  const target = document.getElementById("location-cards-grid");
                  if (target) target.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <Compass className="w-4 h-4" />
                <span>Explore All 10 Locations</span>
              </button>

              <button
                type="button"
                className="rwm-btn-secondary"
                onClick={() => {
                  playClickSound();
                  navigate("/challenges/daily");
                }}
              >
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Daily Real-World Challenge</span>
              </button>
            </div>

            {/* Overall Progress Tracker Bar */}
            <div className="rwm-progress-box">
              <div className="rwm-progress-labels">
                <span>
                  Real-World Missions Mastered: <strong>{completedCount} of {totalMissions}</strong>
                </span>
                <span className="text-amber-400 font-extrabold">{progressPercentage}% Complete</span>
              </div>
              <div className="rwm-progress-track">
                <div
                  className="rwm-progress-fill"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </section>

          {/* Recommended Next Mission Banner */}
          <div className="rwm-recommended-card">
            <div className="flex items-center gap-3">
              <span className="text-3xl">⭐</span>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Recommended Next Mission
                </span>
                <h3 className="text-base font-bold text-white font-fredoka">
                  Supermarket City: The Basket Budget Quest
                </h3>
                <p className="text-xs text-slate-300">
                  Master calculating multiple prices, stay within a ₹500 budget, and calculate remaining change!
                </p>
              </div>
            </div>
            <button
              type="button"
              className="rwm-btn-primary shrink-0"
              onClick={() => handleOpenLocation("supermarket", 0)}
            >
              Play Now ➔
            </button>
          </div>

          {/* The 10 Interactive Real-World Location Cards Grid */}
          <section id="location-cards-grid" className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold font-fredoka text-white">
                  10 Interactive Adventure Locations
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  Select any realm to explore hands-on interactive mathematical simulations!
                </p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 bg-slate-800 rounded-full border border-slate-700 text-slate-300">
                100% Playable • Zero Forced Locks
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {locations.map((loc) => {
                const completedInLoc = loc.missions.filter((m) =>
                  completedSet.has(`${loc.id}-${m.index}`)
                ).length;
                const isFullyDone = completedInLoc === loc.missions.length;

                return (
                  <div
                    key={loc.id}
                    className={`rwm-location-card ${isFullyDone ? "completed" : ""}`}
                    onClick={() => handleOpenLocation(loc.id, 0)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-4xl p-2.5 rounded-2xl bg-slate-950/60 border border-slate-700 shadow-inner">
                        {loc.icon}
                      </span>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-slate-700">
                          {completedInLoc}/{loc.missions.length} Done
                        </span>
                        {isFullyDone && (
                          <span className="block text-[10px] text-emerald-400 font-bold mt-1">
                            ✓ Mastered
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-3">
                      <h3 className="text-lg font-bold font-fredoka text-white group-hover:text-amber-400">
                        {loc.title}
                      </h3>
                      <span className="text-xs font-semibold text-indigo-300 block mt-0.5">
                        Topic: {loc.topic}
                      </span>
                      <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                        {loc.tagline || loc.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-400">
                        ⭐ {loc.missions.length} Missions
                      </span>
                      <button
                        type="button"
                        className="text-xs font-bold text-indigo-400 hover:text-indigo-200 flex items-center gap-1"
                      >
                        <span>Enter Location</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* LOCATION STORY & MISSION BRIEFING MODAL */}
        {showStoryModal && (
          <div className="rwm-modal-backdrop" onClick={() => setShowStoryModal(false)}>
            <div
              className="rwm-briefing-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{activeLocation.icon}</span>
                  <div>
                    <h3 className="text-lg font-bold text-white font-fredoka">
                      {activeLocation.title}
                    </h3>
                    <span className="text-xs text-amber-400 font-semibold">
                      Topic: {activeLocation.topic}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="text-slate-400 hover:text-white font-bold text-xl"
                  onClick={() => setShowStoryModal(false)}
                >
                  ✕
                </button>
              </div>

              {/* Story Narrative Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/80 to-purple-950/80 border border-indigo-500/30 text-slate-200 text-xs sm:text-sm leading-relaxed">
                <strong className="text-amber-300 block mb-1">📖 Adventure Lore:</strong>
                {activeMission.story}
              </div>

              {/* Learning Objective & Rewards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Learning Goal
                  </span>
                  <span className="text-xs text-white font-semibold mt-0.5 block">
                    {activeMission.objective}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Eligible Rewards
                  </span>
                  <div className="flex items-center gap-2 mt-1 text-xs font-bold text-amber-300">
                    <span>🪙 +{activeMission.rewardCoins} Coins</span>
                    <span>⚡ +{activeMission.rewardXp} XP</span>
                    <span>⭐ +1 Star</span>
                  </div>
                </div>
              </div>

              {/* Missions in this location */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400">Available Missions in this Location:</span>
                {activeLocation.missions.map((m, idx) => {
                  const isCurrent = idx === activeMissionIndex;
                  const isDone = completedSet.has(`${activeLocation.id}-${m.index}`);
                  return (
                    <div
                      key={m.index}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                        isCurrent
                          ? "bg-purple-900/50 border-amber-400 text-white"
                          : "bg-slate-800/40 border-slate-700 text-slate-300 hover:bg-slate-800/80"
                      }`}
                      onClick={() => setActiveMissionIndex(idx)}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">{isDone ? "✅" : "⚔️"}</span>
                        <div>
                          <p className="text-xs font-bold">
                            Mission {idx + 1}: {m.title}
                          </p>
                          <span className="text-[10px] text-slate-400 line-clamp-1">{m.objective}</span>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-indigo-300">
                        {isCurrent ? "Selected" : "Select"}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Enter Game CTA Button */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  className="rwm-btn-secondary"
                  onClick={() => setShowStoryModal(false)}
                >
                  Back to Hub
                </button>
                <button
                  type="button"
                  className="rwm-btn-primary"
                  onClick={handleStartMissionGame}
                >
                  <span>Enter Playable Simulation ➔</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // RENDER VIEW 2: ACTIVE REAL-WORLD PLAYABLE GAME SCENE
  // =========================================================================
  return (
    <div className="rwm-game-page">
      <div className="rwm-game-inner">
        {/* Top Game HUD Bar */}
        <header className="rwm-game-hud">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rwm-btn-secondary text-xs py-1.5 px-3"
              onClick={() => {
                playClickSound();
                setViewMode("HUB");
              }}
            >
              ← All Locations
            </button>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{activeLocation.icon}</span>
              <div>
                <h3 className="text-sm font-bold text-white font-fredoka">
                  {activeLocation.title}
                </h3>
                <span className="text-[10px] text-amber-300 font-semibold">
                  Mission {activeMissionIndex + 1} of {activeLocation.missions.length}: {activeMission.title}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs font-bold bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-700">
              <span>🪙 {user?.totalCoins || 0}</span>
              <span>⭐ {user?.totalStars || 0}</span>
              <span>⚡ {user?.totalXP || 0}</span>
            </div>

            <button
              type="button"
              className="rwm-btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
              onClick={() => setShowPauseModal(true)}
              title="Pause Simulation & Settings"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>Pause</span>
            </button>
          </div>
        </header>

        {/* Main Playable Grid: Left = Simulation Scene, Right = Challenge Panel */}
        <main className="rwm-game-grid">
          {/* ================================================================
              LEFT: DYNAMIC INTERACTIVE SIMULATION SCENE
              ================================================================ */}
          <section className="rwm-sim-viewport">
            {/* Header info */}
            <div className="mb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                Interactive Math Lab: {activeLocation.topic}
              </span>
              <h2 className="text-lg sm:text-xl font-bold font-fredoka text-white mt-1">
                {activeMission.title}
              </h2>
              <p className="text-xs text-slate-300">{activeMission.objective}</p>
            </div>

            {/* SCENARIO 1: SUPERMARKET CITY */}
            {activeLocation.id === "supermarket" && (
              <div className="rwm-sim-box">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    🛒 Virtual Supermarket Aisles & Cash Register
                  </h4>
                  <span className="text-xs font-bold text-slate-300">
                    Wallet Starting Budget: <strong className="text-emerald-400">₹500</strong>
                  </span>
                </div>

                {/* Shelves Items */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-3">
                  {(activeLocation?.items || REAL_WORLD_DATA[0].items || []).map((item) => {
                    const qty = cartItems[item.id] || 0;
                    return (
                      <div
                        key={item.id}
                        className={`p-3 rounded-xl border text-center transition ${
                          qty > 0
                            ? "bg-purple-900/40 border-amber-400/80 shadow-md"
                            : "bg-slate-900/60 border-slate-800 text-slate-300"
                        }`}
                      >
                        <span className="text-3xl block mb-1">{item.icon}</span>
                        <div className="text-xs font-bold text-white line-clamp-1">{item.name}</div>
                        <div className="text-xs font-extrabold text-amber-400 mt-0.5">₹{item.price}</div>

                        <div className="flex items-center justify-center gap-2 mt-2">
                          <button
                            type="button"
                            className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
                            onClick={() => handleUpdateItemQty(item.id, -1)}
                          >
                            -
                          </button>
                          <span className="text-xs font-bold text-white w-4">{qty}</span>
                          <button
                            type="button"
                            className="w-6 h-6 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                            onClick={() => handleUpdateItemQty(item.id, 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Cart Tally & Coupon */}
                <div className="mt-4 p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Basket Subtotal:</span>
                    <strong className="text-amber-400 text-sm">₹{calculateSupermarketTotal()}</strong>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Remaining from ₹500:</span>
                    <strong
                      className={`text-sm font-extrabold ${
                        500 - calculateSupermarketTotal() >= 0 ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      ₹{500 - calculateSupermarketTotal()}
                    </strong>
                  </div>

                  {/* Coupon Box */}
                  <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Try code SAVE15 for 15% off"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white flex-1"
                    />
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                      onClick={() => {
                        playClickSound();
                        if (couponInput.toUpperCase() === "SAVE15") setAppliedCoupon("SAVE15");
                        else alert("Enter SAVE15 to unlock a 15% discount!");
                      }}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SCENARIO 2: PIZZA KINGDOM */}
            {activeLocation.id === "pizza" && (
              <div className="rwm-sim-box text-center">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                  🍕 Interactive Royal Pizza Slicer
                </h4>
                <p className="text-xs text-slate-300 mb-3">
                  Click any slice to toggle between Eaten (dim) and Remaining (glowing)!
                </p>

                {/* Interactive SVG Pizza with 8 slices */}
                <div className="relative w-56 h-56 mx-auto my-3">
                  <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-xl">
                    <circle cx="100" cy="100" r="95" fill="#f59e0b" stroke="#78350f" strokeWidth="6" />
                    <circle cx="100" cy="100" r="85" fill="#ef4444" />
                    <circle cx="100" cy="100" r="78" fill="#fbbf24" />

                    {/* 8 Slices */}
                    {pizzaSlices.map((isEaten, idx) => {
                      const angle = idx * 45;
                      const rad = (angle * Math.PI) / 180;
                      const nextRad = ((angle + 45) * Math.PI) / 180;
                      const x1 = 100 + 75 * Math.cos(rad);
                      const y1 = 100 + 75 * Math.sin(rad);
                      const x2 = 100 + 75 * Math.cos(nextRad);
                      const y2 = 100 + 75 * Math.sin(nextRad);
                      const d = `M 100 100 L ${x1} ${y1} A 75 75 0 0 1 ${x2} ${y2} Z`;

                      return (
                        <path
                          key={idx}
                          d={d}
                          fill={isEaten ? "rgba(30, 41, 59, 0.85)" : "#fef08a"}
                          stroke="#b45309"
                          strokeWidth="2"
                          className="cursor-pointer transition-all hover:opacity-80"
                          onClick={() => {
                            playClickSound();
                            setPizzaSlices((prev) => {
                              const copy = [...prev];
                              copy[idx] = !copy[idx];
                              return copy;
                            });
                          }}
                        />
                      );
                    })}
                  </svg>
                </div>

                <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-around text-xs">
                  <div>
                    <span className="text-slate-400 block">Slices Eaten</span>
                    <strong className="text-rose-400 text-sm">
                      {pizzaSlices.filter(Boolean).length} / 8
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Slices Remaining</span>
                    <strong className="text-emerald-400 text-sm">
                      {pizzaSlices.filter((s) => !s).length} / 8
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Remaining Fraction</span>
                    <strong className="text-amber-400 text-sm">
                      {pizzaSlices.filter((s) => !s).length}/8
                    </strong>
                  </div>
                </div>
              </div>
            )}

            {/* SCENARIO 3: TREASURE FOREST */}
            {activeLocation.id === "treasure" && (
              <div className="rwm-sim-box text-center">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                  🗺️ Ancient 3-Tumbler Code Gate
                </h4>
                <p className="text-xs text-slate-300 mb-4">
                  Adjust the tumblers using the arithmetic clues on the ancient stone tablet!
                </p>

                <div className="flex items-center justify-center gap-4 my-4">
                  <div className="p-4 rounded-2xl bg-slate-950 border-2 border-amber-400/80 text-center w-24">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Tumbler 1</span>
                    <button
                      type="button"
                      className="text-xs text-slate-400 hover:text-white"
                      onClick={() => setTumbler1((p) => p + 1)}
                    >
                      ▲
                    </button>
                    <div className="text-2xl font-extrabold text-white my-1 font-fredoka">{tumbler1}</div>
                    <button
                      type="button"
                      className="text-xs text-slate-400 hover:text-white"
                      onClick={() => setTumbler1((p) => Math.max(0, p - 1))}
                    >
                      ▼
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border-2 border-indigo-400/80 text-center w-24">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Tumbler 2</span>
                    <button
                      type="button"
                      className="text-xs text-slate-400 hover:text-white"
                      onClick={() => setTumbler2((p) => p + 1)}
                    >
                      ▲
                    </button>
                    <div className="text-2xl font-extrabold text-white my-1 font-fredoka">{tumbler2}</div>
                    <button
                      type="button"
                      className="text-xs text-slate-400 hover:text-white"
                      onClick={() => setTumbler2((p) => Math.max(0, p - 1))}
                    >
                      ▼
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border-2 border-emerald-400/80 text-center w-24">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Tumbler 3</span>
                    <button
                      type="button"
                      className="text-xs text-slate-400 hover:text-white"
                      onClick={() => setTumbler3((p) => p + 1)}
                    >
                      ▲
                    </button>
                    <div className="text-2xl font-extrabold text-white my-1 font-fredoka">{tumbler3}</div>
                    <button
                      type="button"
                      className="text-xs text-slate-400 hover:text-white"
                      onClick={() => setTumbler3((p) => Math.max(0, p - 1))}
                    >
                      ▼
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-indigo-950/50 rounded-xl border border-indigo-500/30 text-xs text-indigo-200">
                  Ancient Clue: <strong>14 + 18 − 25 = 7</strong> • Sequence: <strong>3, 6, 12, 24, [48], 96</strong>
                </div>
              </div>
            )}

            {/* SCENARIO 4: COOKING ACADEMY */}
            {activeLocation.id === "cooking" && (
              <div className="rwm-sim-box">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    🥞 Royal Starry Pancakes — Recipe Portion Scaler
                  </h4>
                  <span className="text-xs text-slate-300">Base: 2 Servings</span>
                </div>

                {/* Slider */}
                <div className="my-4">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-400">Banquet Guests to Serve:</span>
                    <strong className="text-amber-400 text-sm font-bold">
                      {cookingServings} Guests ({cookingServings / 2}x Multiplier)
                    </strong>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="10"
                    step="2"
                    value={cookingServings}
                    onChange={(e) => setCookingServings(Number(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>

                {/* Ingredient Boxes */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                    <span className="text-2xl">🌾</span>
                    <div className="text-[11px] text-slate-400">Flour</div>
                    <strong className="text-sm text-white">{(0.5 * (cookingServings / 2)).toFixed(1)} cups</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                    <span className="text-2xl">🥛</span>
                    <div className="text-[11px] text-slate-400">Milk</div>
                    <strong className="text-sm text-white">{(0.25 * (cookingServings / 2)).toFixed(2)} cups</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                    <span className="text-2xl">🥚</span>
                    <div className="text-[11px] text-slate-400">Eggs</div>
                    <strong className="text-sm text-white">{2 * (cookingServings / 2)} units</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                    <span className="text-2xl">🍯</span>
                    <div className="text-[11px] text-slate-400">Sugar</div>
                    <strong className="text-sm text-white">{(0.125 * (cookingServings / 2)).toFixed(2)} cups</strong>
                  </div>
                </div>
              </div>
            )}

            {/* SCENARIO 5: TRAVEL EXPLORER */}
            {activeLocation.id === "travel" && (
              <div className="rwm-sim-box">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    🚗 Route: Capital City ➔ Mountain Observatory (180 km)
                  </h4>
                  <span className="text-xs text-slate-300">Physics: Time = Distance ÷ Speed</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 my-4">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                    <span className="text-2xl">🚆</span>
                    <div className="text-xs font-bold text-white mt-1">High-Speed Train</div>
                    <div className="text-xs text-amber-400">Speed: 90 km/h</div>
                    <div className="text-xs text-emerald-400 font-extrabold mt-1">Time: 2.0 hrs</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                    <span className="text-2xl">🚌</span>
                    <div className="text-xs font-bold text-white mt-1">Highway Bus</div>
                    <div className="text-xs text-amber-400">Speed: 60 km/h</div>
                    <div className="text-xs text-emerald-400 font-extrabold mt-1">Time: 3.0 hrs</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                    <span className="text-2xl">⚡🚗</span>
                    <div className="text-xs font-bold text-white mt-1">Family EV</div>
                    <div className="text-xs text-amber-400">Rate: 1 kWh / 6 km</div>
                    <div className="text-xs text-emerald-400 font-extrabold mt-1">Fuel: ₹240</div>
                  </div>
                </div>
              </div>
            )}

            {/* SCENARIO 6: BUILDER'S WORKSHOP */}
            {activeLocation.id === "builder" && (
              <div className="rwm-sim-box">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    🏡 Architectural Landscape Planner
                  </h4>
                  <span className="text-xs text-slate-300">
                    Length = {gardenLength}m • Width = {gardenWidth}m
                  </span>
                </div>

                {/* Dimension Sliders */}
                <div className="grid grid-cols-2 gap-3 my-3">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Garden Length (m): {gardenLength}</label>
                    <input
                      type="range"
                      min="6"
                      max="16"
                      value={gardenLength}
                      onChange={(e) => setGardenLength(Number(e.target.value))}
                      className="w-full accent-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Garden Width (m): {gardenWidth}</label>
                    <input
                      type="range"
                      min="4"
                      max="12"
                      value={gardenWidth}
                      onChange={(e) => setGardenWidth(Number(e.target.value))}
                      className="w-full accent-cyan-400"
                    />
                  </div>
                </div>

                {/* Calculations Panel */}
                <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-around text-xs">
                  <div>
                    <span className="text-slate-400 block">Perimeter Fencing</span>
                    <strong className="text-cyan-400 text-sm">
                      2 × ({gardenLength} + {gardenWidth}) = {2 * (gardenLength + gardenWidth)}m
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Lawn Area</span>
                    <strong className="text-emerald-400 text-sm">
                      {gardenLength} × {gardenWidth} = {gardenLength * gardenWidth} m²
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Turf Cost (@ ₹50/m²)</span>
                    <strong className="text-amber-400 text-sm">
                      ₹{gardenLength * gardenWidth * 50}
                    </strong>
                  </div>
                </div>
              </div>
            )}

            {/* SCENARIO 7: MONEY MANAGEMENT */}
            {activeLocation.id === "finance" && (
              <div className="rwm-sim-box">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    💰 50/30/20 Monthly Allowance Rule (₹1,000)
                  </h4>
                  <span className="text-xs text-slate-300">Target Goal: ₹800 Telescope</span>
                </div>

                <div className="grid grid-cols-3 gap-2.5 my-4">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                    <span className="text-xs font-bold text-blue-400 block">50% Needs</span>
                    <span className="text-[10px] text-slate-400">Books & Supplies</span>
                    <div className="text-sm font-bold text-white mt-1">₹500</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                    <span className="text-xs font-bold text-purple-400 block">30% Wants</span>
                    <span className="text-[10px] text-slate-400">Games & Treats</span>
                    <div className="text-sm font-bold text-white mt-1">₹300</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                    <span className="text-xs font-bold text-emerald-400 block">20% Savings</span>
                    <span className="text-[10px] text-slate-400">Savings Vault</span>
                    <div className="text-sm font-bold text-emerald-400 mt-1">₹200</div>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-center text-slate-300">
                  Saving <strong>₹200 per month</strong> reaches the <strong>₹800 telescope</strong> in exactly{" "}
                  <strong className="text-amber-400">800 ÷ 200 = 4 months</strong>!
                </div>
              </div>
            )}

            {/* SCENARIO 8: SPACE SCIENCE */}
            {activeLocation.id === "space" && (
              <div className="rwm-sim-box text-center">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                  🚀 Deep Space Radar Coordinates (3, 4)
                </h4>
                <div className="w-48 h-48 mx-auto my-3 border-2 border-indigo-500/40 rounded-2xl bg-slate-950 relative flex items-center justify-center">
                  <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-20 pointer-events-none">
                    {Array.from({ length: 36 }).map((_, i) => (
                      <div key={i} className="border border-indigo-500" />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-white bg-indigo-600 px-2.5 py-1 rounded-full shadow-lg">
                    Docking Target (3, 4)
                  </span>
                </div>
                <div className="text-xs text-indigo-300 font-semibold">
                  Distance = √(3² + 4²) = √(9 + 16) = √25 = <strong>5 Units</strong>
                </div>
              </div>
            )}

            {/* SCENARIO 9: SPORTS ARENA */}
            {activeLocation.id === "sports" && (
              <div className="rwm-sim-box text-center">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                  🏀 Match Scoreboard & Scoring Average
                </h4>
                <div className="grid grid-cols-4 gap-2 my-3">
                  {qScores.map((score, i) => (
                    <div key={i} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-bold">Quarter {i + 1}</span>
                      <strong className="text-base text-white font-fredoka">{score} pts</strong>
                    </div>
                  ))}
                </div>
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs">
                  Total Points = 18 + 22 + 14 + 26 = <strong>80 points</strong> • Average = 80 ÷ 4 ={" "}
                  <strong className="text-amber-400">20.0 pts/quarter</strong>
                </div>
              </div>
            )}

            {/* SCENARIO 10: FARM ADVENTURE */}
            {activeLocation.id === "farm" && (
              <div className="rwm-sim-box text-center">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                  🌾 Orchard Harvest Crate Packaging
                </h4>
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 my-3">
                  <span className="text-4xl">🍎📦</span>
                  <div className="text-xs font-bold text-white mt-1">240 Golden Apples Harvested</div>
                  <div className="text-xs text-slate-400 mt-0.5">Capacity per crate = 12 apples</div>
                </div>
                <div className="text-xs text-emerald-300 font-semibold">
                  240 apples ÷ 12 apples/crate = <strong className="text-amber-400">20 Crates Filled!</strong>
                </div>
              </div>
            )}
          </section>

          {/* ================================================================
              RIGHT: MATHEMATICAL CHALLENGE & PROFESSOR PI PANEL
              ================================================================ */}
          <aside className="rwm-challenge-column">
            {/* Mission Step Badge */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
                🎯 Challenge {activeMissionIndex + 1} of {activeLocation.missions.length}
              </span>

              <button
                type="button"
                className="text-xs font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1"
                onClick={() => setShowProfessorPi(!showProfessorPi)}
              >
                <span>🦉 Ask Professor Pi</span>
              </button>
            </div>

            {/* Large Readable Question */}
            <h3 className="text-base sm:text-lg font-bold font-fredoka text-white mt-2 leading-relaxed">
              {activeMission.question}
            </h3>

            {/* Interactive Answer Option Cards */}
            <div className="space-y-2 mt-4">
              {activeMission.options.map((opt, idx) => {
                const isSelected = selectedOption === opt;
                const isCorrect = feedback?.isCorrect && opt === activeMission.correctAnswer;
                const isWrong = feedback && !feedback.isCorrect && isSelected;

                let btnStyle = "bg-slate-900/80 border-slate-800 text-slate-200 hover:border-slate-600";
                if (isCorrect) btnStyle = "bg-emerald-950/80 border-emerald-400 text-emerald-200 font-bold";
                else if (isWrong) btnStyle = "bg-rose-950/80 border-rose-500 text-rose-200";
                else if (isSelected) btnStyle = "bg-purple-900/80 border-amber-400 text-white font-bold";

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={feedback?.isCorrect}
                    className={`w-full p-3.5 rounded-2xl border-2 text-left transition flex items-center justify-between text-xs sm:text-sm ${btnStyle}`}
                    onClick={() => {
                      playClickSound();
                      setSelectedOption(opt);
                    }}
                  >
                    <span>{opt}</span>
                    {isSelected && <span className="text-amber-400">●</span>}
                  </button>
                );
              })}
            </div>

            {/* Primary Submit and Hint Controls */}
            <div className="flex items-center gap-2 mt-4">
              <button
                type="button"
                disabled={!selectedOption || submitting || feedback?.isCorrect}
                className="rwm-btn-primary flex-1 py-3 text-xs sm:text-sm font-bold"
                onClick={handleSubmitAnswer}
              >
                {feedback?.isCorrect ? "✓ Verified Correct!" : "⚡ Submit Calculation"}
              </button>

              <button
                type="button"
                className="rwm-btn-secondary py-3 px-3.5 text-xs"
                onClick={() => setShowHint(!showHint)}
                title="View Hint"
              >
                <Lightbulb className="w-4 h-4 text-amber-400" />
              </button>
            </div>

            {/* Clue Hint Box */}
            {showHint && (
              <div className="mt-3 p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-200">
                <strong>💡 Calculation Clue:</strong> {activeMission.hint}
              </div>
            )}

            {/* Professor Pi Guided Teaching Assistant Box */}
            {showProfessorPi && (
              <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-950/90 to-purple-950/90 border-2 border-amber-400/80 shadow-xl space-y-2 text-xs text-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🦉</span>
                  <strong className="text-amber-300 text-sm font-fredoka">
                    Professor Pi's Step-by-Step Guide
                  </strong>
                </div>
                <p className="whitespace-pre-line text-slate-300 leading-relaxed">
                  {activeMission.explanation}
                </p>
                <span className="text-[10px] text-amber-400 font-semibold block">
                  Remember: Zero penalties for asking for help! Practice makes masters.
                </span>
              </div>
            )}

            {/* Immediate Result & Step-by-Step Explanation Banner */}
            {feedback && (
              <div
                className={`mt-4 p-4 rounded-2xl border-2 text-xs leading-relaxed space-y-2 ${
                  feedback.isCorrect
                    ? "bg-emerald-950/80 border-emerald-400 text-emerald-200"
                    : "bg-rose-950/80 border-rose-500 text-rose-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <strong className="text-sm font-bold font-fredoka">
                    {feedback.isCorrect ? "🎉 Brilliant Solution!" : "❌ Not Quite!"}
                  </strong>
                  {feedback.isCorrect && (
                    <div className="flex items-center gap-2 font-bold text-amber-300">
                      <span>🪙 +{feedback.coinsEarned}</span>
                      <span>⚡ +{feedback.xpEarned} XP</span>
                      <span>⭐ +1 Star</span>
                    </div>
                  )}
                </div>

                <p className="whitespace-pre-line text-slate-200">{feedback.explanation}</p>

                {feedback.achievement && (
                  <div className="p-2 bg-amber-500/20 border border-amber-400/40 rounded-xl text-amber-200 font-bold flex items-center gap-2 mt-2">
                    <span>🏅 Achievement Earned:</span>
                    <span>{feedback.achievement}</span>
                  </div>
                )}

                {feedback.isCorrect && (
                  <button
                    type="button"
                    className="w-full mt-3 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md"
                    onClick={handleNextMission}
                  >
                    Continue to Next Mission ➔
                  </button>
                )}
              </div>
            )}
          </aside>
        </main>
      </div>

      {/* PAUSE & SETTINGS MODAL */}
      {showPauseModal && (
        <div className="rwm-modal-backdrop" onClick={() => setShowPauseModal(false)}>
          <div
            className="rwm-pause-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold font-fredoka text-white text-center mb-1">
              Simulation Paused
            </h3>
            <p className="text-xs text-slate-400 text-center mb-4">
              Take a breather or customize your audio settings
            </p>

            <div className="space-y-2 mb-6">
              <button
                type="button"
                className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-between text-xs font-bold text-white"
                onClick={toggleSound}
              >
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-blue-400" />
                  <span>Sound Effects</span>
                </div>
                <span>{soundOn ? "Enabled" : "Muted"}</span>
              </button>

              <button
                type="button"
                className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-between text-xs font-bold text-white"
                onClick={toggleMusic}
              >
                <div className="flex items-center gap-2">
                  <Music className="w-4 h-4 text-purple-400" />
                  <span>Background Music</span>
                </div>
                <span>{musicOn ? "Enabled" : "Muted"}</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                className="rwm-btn-secondary flex-1 py-2 text-xs"
                onClick={() => {
                  setShowPauseModal(false);
                  setViewMode("HUB");
                }}
              >
                Exit to Locations
              </button>

              <button
                type="button"
                className="rwm-btn-primary flex-1 py-2 text-xs"
                onClick={() => setShowPauseModal(false)}
              >
                Resume Game
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
