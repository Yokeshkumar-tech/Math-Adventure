// client/src/pages/Shop.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import CharacterSprite from "../components/game/CharacterSprite";
import {
  playClickSound,
  playCoinSound,
  playCorrectSound,
  playWrongSound,
} from "../utils/soundEffects";
import { API_BASE_URL } from "../services/api";
import "./Shop.css";

export default function Shop() {
  const { user, token, setUser } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [playerCoins, setPlayerCoins] = useState(user?.totalCoins || 0);
  const [selectedCharacter, setSelectedCharacter] = useState(
    user?.selectedCharacter || { id: "knight", costume: "default", accessory: "none", pet: "none" }
  );
  const [previewCostume, setPreviewCostume] = useState(selectedCharacter.costume || "default");
  const [previewAccessory, setPreviewAccessory] = useState(selectedCharacter.accessory || "none");
  const [previewPet, setPreviewPet] = useState(selectedCharacter.pet || "none");
  const [filterCategory, setFilterCategory] = useState("all"); // 'all' | 'costume' | 'accessory' | 'pet'

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchShopItems();
  }, [token]);

  const fetchShopItems = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/shop`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load shop items.");

      setItems(data.items || []);
      setPlayerCoins(data.playerCoins || 0);
      if (data.selectedCharacter) {
        setSelectedCharacter(data.selectedCharacter);
        setPreviewCostume(data.selectedCharacter.costume || "default");
        setPreviewAccessory(data.selectedCharacter.accessory || "none");
        setPreviewPet(data.selectedCharacter.pet || "none");
      }
    } catch (err) {
      setError(err.message || "Error loading shop.");
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (item) => {
    if (playerCoins < item.priceCoins) {
      playWrongSound();
      setError(`Not enough coins! You need ${item.priceCoins - playerCoins} more coins.`);
      setTimeout(() => setError(""), 3500);
      return;
    }

    try {
      setActionLoading(true);
      setError("");
      const res = await fetch(`${API_BASE_URL}/shop/purchase`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ itemId: item.itemId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Purchase failed.");

      playCoinSound();
      playCorrectSound();
      setMessage(`Successfully acquired ${item.name}!`);
      setTimeout(() => setMessage(""), 3500);

      // Update state
      setPlayerCoins(data.playerCoins);
      setItems((prev) =>
        prev.map((i) => (i.itemId === item.itemId ? { ...i, isOwned: true } : i))
      );

      if (setUser) {
        setUser((prev) => ({
          ...prev,
          totalCoins: data.playerCoins,
        }));
      }
    } catch (err) {
      playWrongSound();
      setError(err.message || "Could not purchase item.");
      setTimeout(() => setError(""), 3500);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEquip = async (item) => {
    try {
      setActionLoading(true);
      setError("");
      const res = await fetch(`${API_BASE_URL}/shop/equip`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          itemId: item.itemId,
          category: item.category,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Equip failed.");

      playClickSound();
      setMessage(`Equipped ${item.name}!`);
      setTimeout(() => setMessage(""), 3000);

      setSelectedCharacter(data.selectedCharacter);
      if (item.category === "costume") {
        setPreviewCostume(item.itemId);
      } else if (item.category === "accessory") {
        setPreviewAccessory(item.itemId);
      } else if (item.category === "pet") {
        setPreviewPet(item.itemId);
      }

      setItems((prev) =>
        prev.map((i) => {
          if (i.category === item.category) {
            return { ...i, isEquipped: i.itemId === item.itemId };
          }
          return i;
        })
      );

      if (setUser) {
        setUser((prev) => ({
          ...prev,
          selectedCharacter: data.selectedCharacter,
        }));
      }
    } catch (err) {
      setError(err.message || "Could not equip item.");
      setTimeout(() => setError(""), 3500);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePreview = (item) => {
    playClickSound();
    if (item.category === "costume") {
      setPreviewCostume(item.itemId);
    } else if (item.category === "accessory") {
      setPreviewAccessory(item.itemId);
    } else if (item.category === "pet") {
      setPreviewPet(item.itemId);
    }
  };

  const filteredItems = items.filter((i) => {
    if (filterCategory === "all") return true;
    return i.category === filterCategory;
  });

  return (
    <div className="shop-page">
      {/* Top Header */}
      <header className="shop-header">
        <button
          type="button"
          className="shop-back-btn"
          onClick={() => {
            playClickSound();
            navigate("/map");
          }}
        >
          ← Return to World Map
        </button>

        <div className="shop-title-area">
          <h1>🛒 Royal Armory & Wardrobe</h1>
          <p>Customize your hero with legendary math armor, cloaks, and mythical treasures!</p>
        </div>

        <div className="shop-coins-badge">
          <span className="shop-coins-icon">🪙</span>
          <strong>{playerCoins}</strong>
          <small>Coins Available</small>
        </div>
      </header>

      {/* Main Content */}
      <main className="shop-main-layout">
        {/* Left Character Live Fitting Room */}
        <aside className="shop-fitting-room">
          <div className="fitting-room-title">
            <h3>Hero Fitting Room</h3>
            <span className="fitting-room-sub">Live 2D Preview</span>
          </div>

          <div className="fitting-stage">
            <CharacterSprite
              characterId={selectedCharacter.id || "knight"}
              costume={previewCostume}
              accessory={previewAccessory}
              pet={previewPet}
              animation="idle"
              size="xl"
              showName={true}
              nickname={user?.nickname || user?.displayName || user?.name || "Hero"}
              level={user?.currentLevel || 1}
            />
          </div>

          <div className="fitting-active-tags">
            <div className="fitting-tag">
              <span className="tag-label">Costume:</span>
              <strong>{previewCostume}</strong>
            </div>
            <div className="fitting-tag">
              <span className="tag-label">Accessory:</span>
              <strong>{previewAccessory}</strong>
            </div>
            <div className="fitting-tag">
              <span className="tag-label">Pet:</span>
              <strong>{previewPet}</strong>
            </div>
          </div>

          <button
            type="button"
            className="fitting-reset-btn"
            onClick={() => {
              playClickSound();
              setPreviewCostume(selectedCharacter.costume || "default");
              setPreviewAccessory(selectedCharacter.accessory || "none");
              setPreviewPet(selectedCharacter.pet || "none");
            }}
          >
            ↺ Reset Preview
          </button>
        </aside>

        {/* Right Catalog */}
        <section className="shop-catalog-section">
          {message && <div className="shop-alert alert-success">{message}</div>}
          {error && <div className="shop-alert alert-error">{error}</div>}

          {/* Filter Tabs */}
          <div className="shop-filter-tabs">
            <button
              type="button"
              className={`shop-tab-btn ${filterCategory === "all" ? "active" : ""}`}
              onClick={() => {
                playClickSound();
                setFilterCategory("all");
              }}
            >
              All Items ({items.length})
            </button>
            <button
              type="button"
              className={`shop-tab-btn ${filterCategory === "costume" ? "active" : ""}`}
              onClick={() => {
                playClickSound();
                setFilterCategory("costume");
              }}
            >
              👗 Costumes
            </button>
            <button
              type="button"
              className={`shop-tab-btn ${filterCategory === "accessory" ? "active" : ""}`}
              onClick={() => {
                playClickSound();
                setFilterCategory("accessory");
              }}
            >
              👑 Accessories
            </button>
            <button
              type="button"
              className={`shop-tab-btn ${filterCategory === "pet" ? "active" : ""}`}
              onClick={() => {
                playClickSound();
                setFilterCategory("pet");
              }}
            >
              🐾 Magical Pets
            </button>
          </div>

          {loading ? (
            <div className="shop-loading-card">
              <div className="shop-spinner" />
              <p>Opening armory vaults...</p>
            </div>
          ) : (
            <div className="shop-items-grid">
              {filteredItems.map((item) => {
                const isOwned = item.isOwned;
                const isEquipped = item.isEquipped;
                const canAfford = playerCoins >= item.priceCoins;

                return (
                  <div
                    key={item.itemId}
                    className={`shop-item-card ${isOwned ? "item-owned" : ""} ${
                      isEquipped ? "item-equipped" : ""
                    }`}
                  >
                    <div className="item-icon-stage">
                      <span className="item-big-icon">{item.icon}</span>
                      {isEquipped && <span className="item-badge-equipped">Equipped</span>}
                      {isOwned && !isEquipped && (
                        <span className="item-badge-owned">Owned</span>
                      )}
                    </div>

                    <div className="item-info">
                      <h4 className="item-name">{item.name}</h4>
                      <p className="item-desc">{item.description}</p>
                      <span className="item-stat-bonus">{item.statBonus}</span>
                    </div>

                    <div className="item-actions">
                      <button
                        type="button"
                        className="item-btn-preview"
                        onClick={() => handlePreview(item)}
                        title="Preview on your hero"
                      >
                        👁️ Preview
                      </button>

                      {isOwned ? (
                        <button
                          type="button"
                          className={`item-btn-equip ${isEquipped ? "equipped" : ""}`}
                          disabled={isEquipped || actionLoading}
                          onClick={() => handleEquip(item)}
                        >
                          {isEquipped ? "✓ Equipped" : "⚡ Equip"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="item-btn-buy"
                          disabled={!canAfford || actionLoading}
                          onClick={() => handlePurchase(item)}
                        >
                          🪙 {item.priceCoins} Coins
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
