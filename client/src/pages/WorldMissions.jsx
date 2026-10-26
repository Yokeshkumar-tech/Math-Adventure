// client/src/pages/WorldMissions.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import CharacterSprite from "../components/game/CharacterSprite";
import { playClickSound } from "../utils/soundEffects";
import { API_BASE_URL } from "../services/api";
import "./WorldMissions.css";

export default function WorldMissions() {
  const { worldSlug } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [world, setWorld] = useState(null);
  const [missions, setMissions] = useState([]);
  const [playerStats, setPlayerStats] = useState(null);
  const [selectedMission, setSelectedMission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchWorldMissions();
  }, [worldSlug, token]);

  const fetchWorldMissions = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/worlds/${worldSlug}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load missions.");
      setWorld(data.world);
      setMissions(data.missions || []);
      setPlayerStats(data.playerStats);
    } catch (err) {
      setError(err.message || "Error loading missions.");
    } finally {
      setLoading(false);
    }
  };

  const handleNodeClick = (mission) => {
    if (!mission.isUnlocked) return;
    playClickSound();
    setSelectedMission(mission);
  };

  const handleStartMission = (mission) => {
    playClickSound();
    if (mission.isBoss) {
      navigate(`/boss/${mission._id}`);
    } else {
      navigate(`/mission/${mission._id}`);
    }
  };

  return (
    <div className="world-missions-page">
      {/* Top Navigation Bar */}
      <header className="missions-nav-bar">
        <button
          type="button"
          className="missions-back-btn"
          onClick={() => {
            playClickSound();
            navigate("/map");
          }}
        >
          ← Return to World Map
        </button>

        {world && (
          <div className="missions-world-header">
            <span className="missions-world-icon">{world.icon}</span>
            <div className="missions-world-title">
              <h1>{world.name}</h1>
              <span className="missions-topic-badge">{world.topic}</span>
            </div>
          </div>
        )}

        <div className="missions-player-corner">
          <CharacterSprite
            characterId={user?.selectedCharacter?.id || "knight"}
            costume={user?.selectedCharacter?.costume || "default"}
            accessory={user?.selectedCharacter?.accessory || "none"}
            size="sm"
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="missions-main-container">
        {error && <div className="missions-error-banner">{error}</div>}

        {loading ? (
          <div className="missions-loading">
            <div className="missions-spinner" />
            <p>Gathering mission intelligence...</p>
          </div>
        ) : (
          <div className="mission-trail-wrapper">
            <div className="mission-trail-header">
              <h2>Adventure Trail</h2>
              <p>Complete each milestone to earn stars, coins, and unlock the final Boss Lair!</p>
            </div>

            {/* Path Nodes */}
            <div className="mission-nodes-trail">
              {missions.map((mission, idx) => {
                const isLocked = !mission.isUnlocked;
                const isCompleted = mission.isCompleted;
                const stars = mission.starsEarned || 0;

                return (
                  <div key={mission._id} className="trail-node-row">
                    {/* Connecting line between nodes */}
                    {idx < missions.length - 1 && (
                      <div
                        className={`trail-connector-line ${
                          isCompleted ? "connector-completed" : ""
                        }`}
                      />
                    )}

                    <div
                      className={`trail-node-card ${
                        isLocked
                          ? "node-locked"
                          : isCompleted
                          ? "node-completed"
                          : "node-current"
                      } ${mission.isBoss ? "node-boss" : ""}`}
                      onClick={() => handleNodeClick(mission)}
                      role="button"
                      tabIndex={isLocked ? -1 : 0}
                    >
                      {/* Node Left Indicator */}
                      <div className="node-indicator">
                        {isLocked ? (
                          <span className="node-icon-lock">🔒</span>
                        ) : mission.isBoss ? (
                          <span className="node-icon-boss">👺</span>
                        ) : isCompleted ? (
                          <span className="node-icon-check">✓</span>
                        ) : (
                          <span className="node-number">{mission.missionNumber}</span>
                        )}
                      </div>

                      {/* Node Content */}
                      <div className="node-details">
                        <div className="node-top-row">
                          <span className="node-stage-tag">
                            {mission.isBoss ? "🔥 Boss Battle" : `Mission ${mission.missionNumber}`}
                          </span>
                          <span className={`node-diff-badge diff-${mission.difficulty}`}>
                            {mission.difficulty}
                          </span>
                        </div>

                        <h3 className="node-title">{mission.title}</h3>
                        <p className="node-objective">{mission.objective}</p>

                        {/* Stars earned for this mission */}
                        <div className="node-stars-row">
                          {[1, 2, 3].map((starIdx) => (
                            <span
                              key={starIdx}
                              className={`star-token ${starIdx <= stars ? "filled" : "empty"}`}
                            >
                              ★
                            </span>
                          ))}
                          <span className="node-score-text">
                            {isCompleted
                              ? `Best: ${mission.bestScore || 0}% (${stars}⭐)`
                              : isLocked
                              ? "Locked"
                              : "Ready to explore"}
                          </span>
                        </div>
                      </div>

                      {/* Right Action */}
                      <div className="node-right-action">
                        <button
                          type="button"
                          className="node-play-btn"
                          disabled={isLocked}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isLocked) handleStartMission(mission);
                          }}
                        >
                          {isLocked
                            ? "Locked"
                            : isCompleted
                            ? "Replay 🔄"
                            : mission.isBoss
                            ? "Fight Boss ⚔️"
                            : "Play ▶"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Mission Briefing Modal */}
      {selectedMission && (
        <div className="briefing-modal-backdrop" onClick={() => setSelectedMission(null)}>
          <div className="briefing-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="briefing-modal-header">
              <span className="briefing-badge">
                {selectedMission.isBoss
                  ? "🔥 Final Realm Boss"
                  : `Mission ${selectedMission.missionNumber}`}
              </span>
              <button
                type="button"
                className="briefing-close-btn"
                onClick={() => setSelectedMission(null)}
              >
                ✕
              </button>
            </div>

            <h2 className="briefing-title">{selectedMission.title}</h2>

            <div className="briefing-dialogue-box">
              <div className="briefing-avatar">🧙‍♂️</div>
              <p className="briefing-dialogue-text">
                “{selectedMission.characterDialogue || selectedMission.story}”
              </p>
            </div>

            <div className="briefing-section">
              <h4>🎯 Mission Objective</h4>
              <p>{selectedMission.objective}</p>
            </div>

            <div className="briefing-rewards-grid">
              <div className="reward-item">
                <span className="reward-icon">🪙</span>
                <div>
                  <strong>+{selectedMission.rewardRules?.coinsPerCorrect || 20} Coins</strong>
                  <small>Per correct answer</small>
                </div>
              </div>

              <div className="reward-item">
                <span className="reward-icon">⚡</span>
                <div>
                  <strong>+{selectedMission.rewardRules?.xpPerCorrect || 10} XP</strong>
                  <small>Per correct answer</small>
                </div>
              </div>

              <div className="reward-item">
                <span className="reward-icon">🎁</span>
                <div>
                  <strong>+{selectedMission.rewardRules?.bonusCoinsOnComplete || 50} Coins</strong>
                  <small>Mission complete bonus</small>
                </div>
              </div>
            </div>

            <div className="briefing-stars-guide">
              <h4>⭐ Star Rating System</h4>
              <div className="stars-rules">
                <span>★★★ : Score ≥ 80%</span>
                <span>★★☆ : Score 60% – 79%</span>
                <span>★☆☆ : Complete below 60%</span>
              </div>
            </div>

            <div className="briefing-modal-actions">
              <button
                type="button"
                className="briefing-cancel-btn"
                onClick={() => setSelectedMission(null)}
              >
                Back
              </button>
              <button
                type="button"
                className="briefing-start-btn"
                onClick={() => handleStartMission(selectedMission)}
              >
                {selectedMission.isBoss ? "⚔️ Challenge Boss!" : "🚀 Embark on Mission"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
