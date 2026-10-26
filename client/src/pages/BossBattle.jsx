// client/src/pages/BossBattle.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import CharacterSprite from "../components/game/CharacterSprite";
import BossSprite, { BOSS_DEFINITIONS } from "../components/game/BossSprite";
import HealthBar from "../components/game/HealthBar";
import MathRenderer from "../components/MathRenderer.jsx";
import {
  playClickSound,
  playCoinSound,
  playCorrectSound,
  playWrongSound,
  playBossHitSound,
  playVictorySound,
} from "../utils/soundEffects";
import { API_BASE_URL } from "../services/api";
import "./BossBattle.css";

export default function BossBattle() {
  const { missionId } = useParams();
  const { user, token, setUser } = useAuth();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [mission, setMission] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Boss Stats & HP
  const [bossHp, setBossHp] = useState(100);
  const [maxBossHp, setMaxBossHp] = useState(100);
  const [bossAnim, setBossAnim] = useState("idle");
  const [bossSpeech, setBossSpeech] = useState("");
  const [charAnim, setCharAnim] = useState("idle");
  const [flashHealth, setFlashHealth] = useState(false);

  // Selection & Feedback
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [completionResult, setCompletionResult] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const questionStartTime = useRef(Date.now());

  useEffect(() => {
    initBossFight();
  }, [missionId, token]);

  const initBossFight = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_BASE_URL}/game/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ missionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to start boss battle.");

      setSession(data.session);
      setMission(data.mission);
      setQuestions(data.questions || []);
      setCurrentIndex(0);
      setCoinsEarned(0);
      setXpEarned(0);
      setCompletionResult(null);
      setFeedback(null);

      const totalQ = data.questions?.length || 5;
      const initialHp = totalQ * 25;
      setBossHp(initialHp);
      setMaxBossHp(initialHp);

      const bossKey = data.mission?.bossData?.sprite || "goblin-king";
      const bossDef = BOSS_DEFINITIONS[bossKey] || BOSS_DEFINITIONS["goblin-king"];
      setBossSpeech(bossDef.dialogue);

      questionStartTime.current = Date.now();
    } catch (err) {
      setError(err.message || "Could not summon the Boss.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (opt) => {
    if (feedback || isSubmitting) return;
    playClickSound();
    setSelectedOption(opt);
  };

  const handleSubmitAnswer = async () => {
    if (!selectedOption || !session || feedback || isSubmitting) return;
    setIsSubmitting(true);

    const currentQ = questions[currentIndex];
    const timeSpent = Math.max(1, Math.round((Date.now() - questionStartTime.current) / 1000));

    try {
      const res = await fetch(`${API_BASE_URL}/game/answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sessionId: session._id,
          questionId: currentQ._id,
          selectedAnswer: selectedOption,
          timeSpentSeconds: timeSpent,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to strike boss.");

      if (data.isCorrect) {
        // Hero attacks, Boss takes heavy damage!
        playCorrectSound();
        playBossHitSound();
        playCoinSound();
        setCharAnim("attack");
        setBossAnim("hit");
        setFlashHealth(true);
        setBossHp((prev) => Math.max(0, prev - 25));
        setCoinsEarned((prev) => prev + (data.coinsEarned || 25));
        setXpEarned((prev) => prev + (data.xpEarned || 20));
        setBossSpeech("Oof! Your math calculation pierced my armor!");

        setTimeout(() => {
          setCharAnim("idle");
          setBossAnim("idle");
          setFlashHealth(false);
        }, 700);
      } else {
        // Hero hurts, Boss taunts!
        playWrongSound();
        setCharAnim("hurt");
        setBossAnim("attack");
        setBossSpeech("Mwahaha! Your numbers fail you! Try recalculating!");

        setTimeout(() => {
          setCharAnim("idle");
          setBossAnim("idle");
        }, 700);
      }

      setFeedback({
        isCorrect: data.isCorrect,
        explanation: data.explanation || "Review the formula and strike again!",
        coins: data.coinsEarned || 0,
        xp: data.xpEarned || 0,
      });
    } catch (err) {
      setError(err.message || "Error during boss attack.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextTurn = () => {
    playClickSound();
    setFeedback(null);
    setSelectedOption(null);

    if (currentIndex + 1 < questions.length && bossHp > 0) {
      setCurrentIndex((prev) => prev + 1);
      questionStartTime.current = Date.now();
    } else {
      finishBossBattle();
    }
  };

  const handleRetryTurn = () => {
    playClickSound();
    setFeedback(null);
    setSelectedOption(null);
    questionStartTime.current = Date.now();
  };

  const finishBossBattle = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/game/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ sessionId: session._id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to finalize boss battle.");

      playVictorySound();
      setBossAnim("defeat");
      setCharAnim("victory");
      setCompletionResult(data);

      if (setUser) {
        setUser((prev) => ({
          ...prev,
          totalCoins: (prev?.totalCoins || 0) + (data.totalCoinsEarned || 0),
          totalStars: (prev?.totalStars || 0) + (data.starsEarned || 0),
          totalXP: (prev?.totalXP || 0) + (data.totalXpEarned || 0),
        }));
      }
    } catch (err) {
      setError(err.message || "Could not finish boss battle.");
    } finally {
      setLoading(false);
    }
  };

  const currentQ = questions[currentIndex];
  const bossKey = mission?.bossData?.sprite || "goblin-king";

  return (
    <div className={`boss-battle-page theme-${mission?.worldSlug || "number-forest"}`}>
      {/* Top Arena Header */}
      <header className="boss-arena-header">
        <button
          type="button"
          className="boss-quit-btn"
          onClick={() => {
            playClickSound();
            navigate(`/worlds/${mission?.worldSlug || "number-forest"}`);
          }}
        >
          🚪 Retreat
        </button>

        <div className="boss-meter-central">
          <HealthBar
            current={bossHp}
            max={maxBossHp}
            label={`Boss Challenge Meter: ${mission?.bossData?.name || "Realm Boss"}`}
            color="#ef4444"
            animateHit={flashHealth}
          />
        </div>

        <div className="boss-loot-tracker">
          <div className="loot-chip">
            <span>🪙</span>
            <strong>+{coinsEarned}</strong>
          </div>
          <div className="loot-chip">
            <span>⚡</span>
            <strong>+{xpEarned}</strong>
          </div>
        </div>
      </header>

      {/* Main Boss Arena */}
      <main className="boss-arena-stage">
        {error && <div className="boss-error-toast">{error}</div>}

        {loading ? (
          <div className="boss-loading-box">
            <div className="boss-loading-flame" />
            <p>Summoning the Realm Boss into the arena...</p>
          </div>
        ) : completionResult ? (
          /* BOSS DEFEATED VICTORY SCREEN */
          <div className="boss-victory-modal">
            <div className="boss-victory-hero">
              <CharacterSprite
                characterId={user?.selectedCharacter?.id || "knight"}
                costume={user?.selectedCharacter?.costume || "default"}
                accessory={user?.selectedCharacter?.accessory || "none"}
                pet={user?.selectedCharacter?.pet || "none"}
                animation="victory"
                size="lg"
              />
            </div>

            <h1 className="boss-conquered-title">⚔️ BOSS CONQUERED!</h1>
            <p className="boss-conquered-sub">
              {mission?.bossData?.name || "The Boss"} has been defeated by your mathematical prowess!
            </p>

            {/* Victory Badge Award */}
            {completionResult.unlockedBadge && (
              <div className="boss-badge-awarded">
                <span className="badge-trophy-icon">🏆</span>
                <div>
                  <strong>{completionResult.unlockedBadge}</strong>
                  <small>Realm Champion Badge Unlocked</small>
                </div>
              </div>
            )}

            {/* Next World Portal Unlocked */}
            {completionResult.nextWorldUnlocked && (
              <div className="boss-world-unlocked">
                <span className="world-portal-icon">🌟</span>
                <div>
                  <strong>Realm Portal Opened!</strong>
                  <p>You can now explore {completionResult.nextWorldUnlocked} on the World Map!</p>
                </div>
              </div>
            )}

            <div className="boss-rewards-grid">
              <div className="boss-reward-tile">
                <span className="tile-icon">🪙</span>
                <strong>+{completionResult.totalCoinsEarned}</strong>
                <small>Coins</small>
              </div>
              <div className="boss-reward-tile">
                <span className="tile-icon">⭐</span>
                <strong>+{completionResult.starsEarned}</strong>
                <small>Stars Earned</small>
              </div>
              <div className="boss-reward-tile">
                <span className="tile-icon">⚡</span>
                <strong>+{completionResult.totalXpEarned}</strong>
                <small>Hero XP</small>
              </div>
            </div>

            <button
              type="button"
              className="boss-btn-proceed"
              onClick={() => {
                playClickSound();
                navigate("/map");
              }}
            >
              🗺️ Enter World Map
            </button>
          </div>
        ) : (
          /* ACTIVE COMBAT ARENA */
          <div className="boss-combat-field">
            {/* Visual Confrontation: Hero vs Boss */}
            <div className="combat-sprites-row">
              <div className="combat-hero-side">
                <CharacterSprite
                  characterId={user?.selectedCharacter?.id || "knight"}
                  costume={user?.selectedCharacter?.costume || "default"}
                  accessory={user?.selectedCharacter?.accessory || "none"}
                  pet={user?.selectedCharacter?.pet || "none"}
                  animation={charAnim}
                  size="lg"
                  showName={true}
                  nickname={user?.nickname || user?.displayName || user?.name || "Hero"}
                  level={user?.currentLevel || 1}
                />
              </div>

              <div className="combat-vs-symbol">VS</div>

              <div className="combat-boss-side">
                <BossSprite
                  bossKey={bossKey}
                  animation={bossAnim}
                  speechText={bossSpeech}
                  size="lg"
                />
              </div>
            </div>

            {/* Tactical Question Terminal */}
            <div className="boss-math-card">
              <div className="boss-card-header">
                <span className="boss-turn-counter">
                  Challenge {currentIndex + 1} of {questions.length}
                </span>
                <span className="boss-attack-type">
                  Boss Attack: {BOSS_DEFINITIONS[bossKey]?.attackName || "Math Barrier"}
                </span>
              </div>

              <div className="boss-question-statement">
                <h2><MathRenderer content={currentQ?.questionText || currentQ?.question || ""} /></h2>
              </div>

              <div className="boss-options-grid">
                {currentQ?.options?.map((opt, idx) => {
                  const isSelected = selectedOption === opt;
                  return (
                    <button
                      key={idx}
                      type="button"
                      className={`boss-option-btn ${isSelected ? "selected" : ""}`}
                      onClick={() => handleSelectOption(opt)}
                      disabled={feedback !== null || isSubmitting}
                    >
                      <span className="boss-opt-letter">{["A", "B", "C", "D"][idx]}</span>
                      <span className="boss-opt-text"><MathRenderer content={opt} /></span>
                    </button>
                  );
                })}
              </div>

              {!feedback ? (
                <button
                  type="button"
                  className="boss-strike-btn"
                  onClick={handleSubmitAnswer}
                  disabled={!selectedOption || isSubmitting}
                >
                  {isSubmitting ? "Channeling Strike..." : "⚔️ Strike the Boss!"}
                </button>
              ) : (
                <div
                  className={`boss-turn-feedback ${
                    feedback.isCorrect ? "turn-success" : "turn-failure"
                  }`}
                >
                  <div className="turn-feedback-text"><MathRenderer content={feedback.explanation} /></div>
                  <div className="turn-feedback-buttons">
                    {feedback.isCorrect ? (
                      <button
                        type="button"
                        className="turn-continue-btn"
                        onClick={handleNextTurn}
                      >
                        {currentIndex + 1 < questions.length && bossHp > 0
                          ? "Next Attack ⚔️"
                          : "Finish Boss Battle 🏆"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="turn-retry-btn"
                        onClick={handleRetryTurn}
                      >
                        🔄 Recalculate & Retaliate!
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
