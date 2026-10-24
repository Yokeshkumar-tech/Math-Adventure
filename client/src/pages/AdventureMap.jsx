// client/src/pages/AdventureMap.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import CharacterSprite from "../components/game/CharacterSprite";
import CharacterModal from "../components/game/CharacterModal";
import {
  playClickSound,
  playCoinSound,
  isSoundEnabled,
  setSoundEnabled,
  isMusicEnabled,
  setMusicEnabled,
  startBgm,
} from "../utils/soundEffects";
import "./AdventureMap.css";

export default function AdventureMap() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [worlds, setWorlds] = useState([]);
  const [playerStats, setPlayerStats] = useState({
    totalStars: user?.totalStars || 0,
    totalCoins: user?.totalCoins || 0,
    totalXP: user?.totalXP || 0,
    currentLevel: user?.currentLevel || 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCharModalOpen, setIsCharModalOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [musicOn, setMusicOn] = useState(isMusicEnabled());

  useEffect(() => {
    fetchWorlds();
  }, [token]);

  const fetchWorlds = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/worlds", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load worlds.");
      setWorlds(data.worlds || []);
      if (data.playerStats) {
        setPlayerStats(data.playerStats);
      }
    } catch (err) {
      setError(err.message || "Error loading adventure map.");
    } finally {
      setLoading(false);
    }
  };

  const handleSoundToggle = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) playCoinSound();
  };

  const handleMusicToggle = () => {
    const next = !musicOn;
    setMusicOn(next);
    setMusicEnabled(next);
    if (next && soundOn) {
      startBgm();
    }
  };

  const handleEnterWorld = (world) => {
    if (!world.isUnlocked) {
      return;
    }
    playClickSound();
    navigate(`/worlds/${world.slug}`);
  };

  return (
    <div className="adventure-map-page">
      {/* Top Game Bar HUD */}
      <div className="map-hud-wrapper">
        <header className="map-hud-bar">
          <div className="map-player-summary" onClick={() => setIsCharModalOpen(true)}>
            <CharacterSprite
              characterId={user?.selectedCharacter?.id || "knight"}
              costume={user?.selectedCharacter?.costume || "default"}
              accessory={user?.selectedCharacter?.accessory || "none"}
              pet={user?.selectedCharacter?.pet || "none"}
              size="sm"
            />
            <div className="map-player-text">
              <strong>{user?.nickname || user?.displayName || user?.name || "Hero"}</strong>
              <span className="map-player-level-badge">Level {playerStats.currentLevel}</span>
            </div>
            <span className="map-edit-avatar-hint">✏️ Edit</span>
          </div>

          <div className="map-stats-counters">
            <div className="map-stat-pill coins-pill">
              <span className="pill-icon">🪙</span>
              <strong>{playerStats.totalCoins}</strong>
              <small>Coins</small>
            </div>

            <div className="map-stat-pill stars-pill">
              <span className="pill-icon">⭐</span>
              <strong>{playerStats.totalStars}</strong>
              <small>Stars</small>
            </div>

            <div className="map-stat-pill xp-pill">
              <span className="pill-icon">⚡</span>
              <strong>{playerStats.totalXP}</strong>
              <small>XP</small>
            </div>
          </div>

          <div className="map-quick-actions">
            <button
              type="button"
              className="map-audio-btn"
              onClick={handleMusicToggle}
              title={musicOn ? "Music On (Click to Mute)" : "Music Muted"}
            >
              {musicOn ? "🎵" : "🔇"}
            </button>
            <button
              type="button"
              className="map-audio-btn"
              onClick={handleSoundToggle}
              title={soundOn ? "Sound FX On" : "Sound FX Muted"}
            >
              {soundOn ? "🔊" : "🔈"}
            </button>
            <button
              type="button"
              className="map-shop-link-btn"
              onClick={() => {
                playClickSound();
                navigate("/real-world");
              }}
            >
              ✨ Real-World
            </button>
            <button
              type="button"
              className="map-shop-link-btn"
              onClick={() => {
                playClickSound();
                navigate("/arena");
              }}
            >
              ⚔️ Arena
            </button>
            <button
              type="button"
              className="map-shop-link-btn"
              onClick={() => {
                playClickSound();
                navigate("/shop");
              }}
            >
              🛒 Armory
            </button>
          </div>
        </header>
      </div>

      {/* Main Realm Map Content */}
      <main className="map-main-stage">
        <div className="map-header-banner">
          <h1>🗺️ Realm of Mathematics</h1>
          <p>
            Journey across enchanted lands, solve mathematical mysteries, conquer ferocious bosses,
            and earn legendary stars!
          </p>
        </div>

        {error && <div className="map-error-banner">{error}</div>}

        {loading ? (
          <div className="map-loading-container">
            <div className="map-spinner" />
            <p>Unrolling ancient parchment map...</p>
          </div>
        ) : (
          <div className="map-worlds-track">
            {worlds.map((world, idx) => {
              const isLocked = !world.isUnlocked;
              return (
                <div
                  key={world.id || world.slug}
                  className={`world-realm-card ${isLocked ? "locked" : "unlocked"}`}
                  onClick={() => !isLocked && handleEnterWorld(world)}
                  tabIndex={isLocked ? -1 : 0}
                  role="button"
                  aria-disabled={isLocked}
                >
                  {/* Lock Overlay */}
                  {isLocked && (
                    <div className="world-lock-overlay">
                      <div className="world-lock-icon">🔒</div>
                      <span className="world-lock-req">
                        Requires {world.minStarsRequired} ⭐ Total Stars
                      </span>
                      <small className="world-lock-hint">
                        ({Math.max(0, world.minStarsRequired - playerStats.totalStars)} more needed)
                      </small>
                    </div>
                  )}

                  {/* World Card Header */}
                  <div className="world-card-top" style={{ borderColor: world.themeColor }}>
                    <div className="world-icon-badge" style={{ background: world.themeColor }}>
                      <span>{world.icon}</span>
                    </div>
                    <div className="world-badge-info">
                      <span className="world-realm-order">Realm {world.order} of 5</span>
                      <h3 className="world-title">{world.name}</h3>
                      <span className="world-topic-tag">{world.topic}</span>
                    </div>
                  </div>

                  {/* World Description */}
                  <p className="world-desc">{world.description}</p>

                  {/* Boss preview info */}
                  <div className="world-boss-preview">
                    <span className="boss-badge-label">Boss:</span>
                    <strong>{world.bossName}</strong>
                  </div>

                  {/* Stars and Missions progress */}
                  <div className="world-progress-footer">
                    <div className="world-star-counter">
                      <span>⭐ {world.starsEarned} / {world.maxStars}</span>
                    </div>
                    <div className="world-mission-counter">
                      <span>
                        🎯 {world.completedMissions} / {world.totalMissions} Missions
                      </span>
                    </div>
                  </div>

                  {/* Action button */}
                  <button
                    type="button"
                    className={`world-enter-btn ${isLocked ? "disabled" : ""}`}
                    disabled={isLocked}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEnterWorld(world);
                    }}
                  >
                    {isLocked ? "🔒 Locked" : "⚡ Enter Realm"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Character Selection Modal */}
      <CharacterModal
        isOpen={isCharModalOpen}
        onClose={() => setIsCharModalOpen(false)}
        onSaved={() => fetchWorlds()}
      />
    </div>
  );
}
