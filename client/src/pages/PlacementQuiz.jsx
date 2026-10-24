// client/src/pages/PlacementQuiz.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import { useAuth } from "../context/AuthContext";
import CharacterSprite, { CHARACTER_CLASSES } from "../components/game/CharacterSprite";
import {
  playClickSound,
  playCorrectSound,
  playWrongSound,
  playVictorySound,
  playCoinSound,
} from "../utils/soundEffects";
import api from "../services/api";

const PLACEMENT_QUESTIONS = [
  {
    topic: "Arithmetic Power",
    question: "Evaluate: (14 × 5) − (28 ÷ 4)",
    options: ["58", "63", "65", "70"],
    correctAnswer: "63",
    explanation: "Order of operations: 14 × 5 = 70, and 28 ÷ 4 = 7. Then 70 − 7 = 63.",
  },
  {
    topic: "Fractional Reasoning",
    question: "Which of the following fractions is equivalent to 3/4?",
    options: ["6/10", "9/12", "12/18", "15/24"],
    correctAnswer: "9/12",
    explanation: "Multiply numerator and denominator of 3/4 by 3: (3×3)/(4×3) = 9/12.",
  },
  {
    topic: "Geometric Logic",
    question: "A square garden has a perimeter of 36 meters. What is the area of the garden?",
    options: ["64 m²", "72 m²", "81 m²", "144 m²"],
    correctAnswer: "81 m²",
    explanation: "Side length of square = 36 ÷ 4 = 9 meters. Area = Side × Side = 9 × 9 = 81 m².",
  },
  {
    topic: "Everyday Math",
    question: "A bag of 4 notebooks costs ₹160. How much will 7 notebooks cost at the same rate?",
    options: ["₹240", "₹260", "₹280", "₹300"],
    correctAnswer: "₹280",
    explanation: "Unit cost per notebook = ₹160 ÷ 4 = ₹40. Total for 7 notebooks = 7 × ₹40 = ₹280.",
  },
];

export default function PlacementQuiz() {
  const { user, updateProfile, setUser } = useAuth();
  const navigate = useNavigate();

  // Steps: 'avatar' -> 'quiz' -> 'results'
  const [step, setStep] = useState("avatar");
  const [chosenAvatar, setChosenAvatar] = useState(user?.selectedCharacter?.id || "knight");
  const [nickname, setNickname] = useState(user?.nickname || user?.name || "MathHero");

  // Quiz state
  const [qIndex, setQIndex] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState("");
  const [answers, setAnswers] = useState([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [calculatedRank, setCalculatedRank] = useState("Math Adventurer");

  const handleSelectAvatar = (classKey) => {
    playClickSound();
    setChosenAvatar(classKey);
  };

  const handleProceedToQuiz = () => {
    playClickSound();
    setStep("quiz");
  };

  const handleSelectAnswer = (opt) => {
    playClickSound();
    setSelectedOpt(opt);
  };

  const handleNextQuestion = () => {
    const currentQ = PLACEMENT_QUESTIONS[qIndex];
    const isCorrect = selectedOpt === currentQ.correctAnswer;
    const nextAnswers = [...answers, { isCorrect, selected: selectedOpt }];
    setAnswers(nextAnswers);

    const newCorrect = isCorrect ? correctCount + 1 : correctCount;
    setCorrectCount(newCorrect);

    if (isCorrect) {
      playCorrectSound();
    } else {
      playWrongSound();
    }

    setSelectedOpt("");

    if (qIndex + 1 < PLACEMENT_QUESTIONS.length) {
      setQIndex(qIndex + 1);
    } else {
      // Evaluate Rank
      let rank = "Apprentice Mathematician";
      if (newCorrect === 4) rank = "Grand Math Master";
      else if (newCorrect >= 2) rank = "Noble Math Adventurer";
      setCalculatedRank(rank);

      playVictorySound();
      playCoinSound();
      confetti({ particleCount: 90, spread: 70 });
      setStep("results");

      // Save to user profile: award starter bonus
      const starterBonusCoins = 150;
      const starterBonusStars = Math.max(3, newCorrect * 2);
      const starterBonusXP = 100;

      api.patch("/auth/users/me", {
        nickname: nickname.trim(),
        avatar: chosenAvatar,
        selectedCharacter: {
          id: chosenAvatar,
          costume: "default",
          accessory: "none",
          pet: "none",
        },
        totalCoins: (user?.totalCoins || 0) + starterBonusCoins,
        totalStars: (user?.totalStars || 0) + starterBonusStars,
        totalXP: (user?.totalXP || 0) + starterBonusXP,
      }).then(() => {
        if (setUser) {
          setUser((prev) => ({
            ...prev,
            nickname: nickname.trim(),
            avatar: chosenAvatar,
            selectedCharacter: {
              id: chosenAvatar,
              costume: "default",
              accessory: "none",
              pet: "none",
            },
            totalCoins: (prev?.totalCoins || 0) + starterBonusCoins,
            totalStars: (prev?.totalStars || 0) + starterBonusStars,
            totalXP: (prev?.totalXP || 0) + starterBonusXP,
          }));
        }
      }).catch(console.error);
    }
  };

  return (
    <div className="min-h-screen bg-radial from-slate-900 via-indigo-950 to-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-slate-900/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-indigo-950">
        
        {/* STEP 1: AVATAR & NICKNAME */}
        {step === "avatar" && (
          <div className="space-y-6 text-center">
            <div className="inline-block px-3 py-1 bg-indigo-500/20 border border-indigo-400 text-indigo-300 font-bold text-xs rounded-full">
              Step 1 of 2 • Character Calibration
            </div>
            <h1 className="text-3xl font-extrabold text-amber-400">Choose Your Hero Avatar</h1>
            <p className="text-slate-300 text-sm max-w-md mx-auto">
              Select your guardian class and enter a hero nickname before embarking onto the Adventure Map!
            </p>

            {/* Avatar Preview */}
            <div className="my-4 flex justify-center">
              <CharacterSprite
                characterId={chosenAvatar}
                costume="default"
                accessory="none"
                pet="none"
                animation="idle"
                size="xl"
                showName={true}
                nickname={nickname}
              />
            </div>

            {/* Class Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {Object.keys(CHARACTER_CLASSES).map((key) => {
                const c = CHARACTER_CLASSES[key];
                const isSelected = chosenAvatar === key;
                return (
                  <button
                    key={key}
                    type="button"
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      isSelected
                        ? "bg-indigo-600/30 border-amber-400 shadow-lg shadow-amber-400/20 scale-105"
                        : "bg-slate-800/60 border-slate-700 hover:border-slate-500"
                    }`}
                    onClick={() => handleSelectAvatar(key)}
                  >
                    <div className="text-2xl mb-1">{c.baseEmoji}</div>
                    <div className="text-xs font-bold text-slate-200">{c.name.split(" ")[0]}</div>
                  </button>
                );
              })}
            </div>

            {/* Nickname Input */}
            <div className="max-w-xs mx-auto text-left">
              <label className="block text-xs font-bold text-slate-300 mb-1">Hero Nickname:</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={18}
                className="w-full bg-slate-800 border-2 border-slate-700 focus:border-amber-400 px-4 py-2.5 rounded-xl text-amber-300 font-bold text-center text-lg outline-none"
              />
            </div>

            <button
              type="button"
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-900 font-extrabold text-base rounded-2xl shadow-lg transition-transform hover:scale-105"
              onClick={handleProceedToQuiz}
            >
              Start Placement Quiz ➔
            </button>
          </div>
        )}

        {/* STEP 2: PLACEMENT QUIZ */}
        {step === "quiz" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-700/60 pb-3">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Question {qIndex + 1} of {PLACEMENT_QUESTIONS.length} • {PLACEMENT_QUESTIONS[qIndex].topic}
              </span>
              <span className="text-xs text-slate-400">Diagnostic Placement</span>
            </div>

            <h2 className="text-xl font-bold text-slate-100 leading-snug">
              {PLACEMENT_QUESTIONS[qIndex].question}
            </h2>

            <div className="space-y-3">
              {PLACEMENT_QUESTIONS[qIndex].options.map((opt) => {
                const isSelected = selectedOpt === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    className={`w-full p-4 rounded-xl border text-left font-bold text-base transition-all flex items-center justify-between ${
                      isSelected
                        ? "bg-indigo-600/30 border-amber-400 text-amber-300 shadow-md"
                        : "bg-slate-800/60 border-slate-700 hover:border-slate-500 text-slate-200"
                    }`}
                    onClick={() => handleSelectAnswer(opt)}
                  >
                    <span>{opt}</span>
                    {isSelected && <span className="text-amber-400">✓</span>}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-extrabold rounded-xl shadow-md transition-all hover:scale-105 disabled:opacity-40"
                disabled={!selectedOpt}
                onClick={handleNextQuestion}
              >
                {qIndex + 1 === PLACEMENT_QUESTIONS.length ? "Finish Placement" : "Next Question ➔"}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: RESULTS & CEREMONY */}
        {step === "results" && (
          <div className="text-center space-y-6">
            <div className="text-5xl">👑</div>
            <h1 className="text-3xl font-extrabold text-amber-400">Placement Assessment Complete!</h1>
            
            <div className="p-4 bg-slate-800/80 border border-amber-500/40 rounded-2xl max-w-sm mx-auto">
              <div className="text-xs font-bold text-slate-400 uppercase">Calibrated Hero Title:</div>
              <div className="text-2xl font-black text-amber-300 mt-1">{calculatedRank}</div>
              <div className="text-sm font-bold text-emerald-400 mt-1">
                Score: {correctCount} / {PLACEMENT_QUESTIONS.length} Questions Correct
              </div>
            </div>

            <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl max-w-md mx-auto">
              <h3 className="font-bold text-emerald-300 text-sm mb-2">🎁 Starter Hero Rewards Deposited!</h3>
              <div className="flex justify-center gap-4 text-xs font-bold">
                <span className="text-amber-300">🪙 +150 Coins</span>
                <span className="text-amber-400">⭐ +3 Starter Stars</span>
                <span className="text-blue-300">⚡ +100 XP</span>
              </div>
            </div>

            <p className="text-slate-300 text-sm max-w-md mx-auto">
              Your hero profile is calibrated! Number Forest is unlocked and waiting for your mathematics adventure.
            </p>

            <button
              type="button"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 font-extrabold text-lg rounded-2xl shadow-xl transition-transform hover:scale-105"
              onClick={() => {
                playClickSound();
                navigate("/map");
              }}
            >
              🗺️ Enter Adventure World Map
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
