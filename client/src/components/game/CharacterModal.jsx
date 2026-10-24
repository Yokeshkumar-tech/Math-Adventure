// client/src/components/game/CharacterModal.jsx
import React, { useState } from "react";
import CharacterSprite, { CHARACTER_CLASSES } from "./CharacterSprite";
import { playClickSound, playCorrectSound } from "../../utils/soundEffects";
import { useAuth } from "../../context/AuthContext";
import "./CharacterModal.css";

export default function CharacterModal({ isOpen, onClose, onSaved }) {
  const { user, token, setUser } = useAuth();
  const currentClass = user?.selectedCharacter?.id || "knight";
  const [selectedId, setSelectedId] = useState(currentClass);
  const [nickname, setNickname] = useState(user?.nickname || user?.displayName || user?.name || "MathHero");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSelect = (id) => {
    playClickSound();
    setSelectedId(id);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setError("Please choose a nickname for your adventurer!");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/player/character", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          characterId: selectedId,
          nickname: nickname.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update character.");

      playCorrectSound();
      if (setUser) {
        setUser((prev) => ({
          ...prev,
          nickname: data.nickname,
          displayName: data.nickname,
          avatar: selectedId,
          selectedCharacter: data.selectedCharacter,
        }));
      }
      if (onSaved) onSaved(data);
      onClose();
    } catch (err) {
      setError(err.message || "Could not save character.");
    } finally {
      setLoading(false);
    }
  };

  const activeChar = CHARACTER_CLASSES[selectedId] || CHARACTER_CLASSES.knight;

  return (
    <div className="char-modal-backdrop" onClick={onClose}>
      <div className="char-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="char-modal-header">
          <h2>⚔️ Choose Your Hero</h2>
          <button className="char-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {error && <div className="char-modal-error">{error}</div>}

        <div className="char-modal-body">
          {/* Live Preview Pane */}
          <div className="char-preview-pane">
            <div className="char-preview-stage">
              <CharacterSprite
                characterId={selectedId}
                costume={user?.selectedCharacter?.costume || "default"}
                accessory={user?.selectedCharacter?.accessory || "none"}
                pet={user?.selectedCharacter?.pet || "none"}
                animation="idle"
                size="xl"
                showName={true}
                nickname={nickname}
                level={user?.currentLevel || 1}
              />
            </div>
            <div className="char-preview-info">
              <h3>{activeChar.name}</h3>
              <span className="char-preview-role">{activeChar.role}</span>
              <p className="char-preview-quote">“{activeChar.quote}”</p>
            </div>
          </div>

          {/* Form & Selection Options */}
          <div className="char-selection-pane">
            <div className="char-field-group">
              <label htmlFor="adventurer-nickname">Adventurer Nickname</label>
              <input
                id="adventurer-nickname"
                type="text"
                maxLength={20}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Enter hero nickname..."
              />
            </div>

            <div className="char-classes-grid">
              {Object.values(CHARACTER_CLASSES).map((cls) => {
                const isSelected = cls.id === selectedId;
                return (
                  <button
                    key={cls.id}
                    type="button"
                    className={`char-class-card ${isSelected ? "selected" : ""}`}
                    onClick={() => handleSelect(cls.id)}
                  >
                    <span className="char-card-emoji">{cls.baseEmoji}</span>
                    <div className="char-card-text">
                      <strong>{cls.name.split(" ")[0]}</strong>
                      <small>{cls.role}</small>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="char-modal-footer">
          <button type="button" className="char-btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="char-btn-confirm"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Saving..." : "🌟 Confirm Hero"}
          </button>
        </div>
      </div>
    </div>
  );
}
