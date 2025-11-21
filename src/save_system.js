// save_system.js - slot-based save/load using localStorage

const SAVE_SLOTS = ["slot1", "slot2", "slot3"];

function deepClone(obj) {
  return obj ? JSON.parse(JSON.stringify(obj)) : obj;
}

function getCityName(id) {
  const cities = typeof window.getCities === "function" ? window.getCities() : null;
  if (!cities || !cities[id]) return "Unknown";
  return cities[id].name || "Unknown";
}

function getSaveData() {
  const core = typeof window.__getCoreSave === "function" ? window.__getCoreSave() : null;
  const challenges = window.Challenges?.exportState ? window.Challenges.exportState() : null;
  const breakdown = typeof window.getBreakdownState === "function" ? window.getBreakdownState() : null;
  const lizard = typeof window.getLizardState === "function" ? window.getLizardState() : null;

  return {
    version: 1,
    savedAt: Date.now(),
    core: deepClone(core),
    challenges: deepClone(challenges),
    breakdown: deepClone(breakdown),
    lizard: deepClone(lizard),
    cityName: core ? getCityName(core.currentCityId) : "Unknown"
  };
}

function applySaveData(data) {
  if (!data) return;
  if (data.core && typeof window.__applyCoreSave === "function") {
    window.__applyCoreSave(data.core);
  }
  if (data.breakdown && typeof window.setBreakdownState === "function") {
    window.setBreakdownState(data.breakdown);
  }
  if (data.lizard && typeof window.restoreLizardState === "function") {
    window.restoreLizardState(data.lizard);
  }
  if (data.challenges && window.Challenges?.importState) {
    window.Challenges.importState(data.challenges);
  }
  if (data.core?.gameState === "DRIVING" && typeof window.getActiveJob === "function") {
    if (!window.getActiveJob()) {
      if (typeof window.__setGameState === "function") {
        window.__setGameState("CITY");
      }
    }
  }
  ["main-menu-overlay", "load-menu-overlay", "settings-overlay", "credits-overlay"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.classList.remove("visible");
  });
  document.body.classList.remove("menu-open");
  if (typeof window.setMessage === "function") {
    window.setMessage("Save loaded", 2.5);
  }
}

function saveGame(slot = "slot1") {
  const data = getSaveData();
  try {
    localStorage.setItem(slot, JSON.stringify(data));
  } catch (e) {
    console.warn("[Save] failed to write", e);
  }
  return data;
}

function loadGame(slot = "slot1") {
  try {
    const raw = localStorage.getItem(slot);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    applySaveData(parsed);
    return parsed;
  } catch (e) {
    console.warn("[Save] failed to load", e);
    return null;
  }
}

function deleteSave(slot = "slot1") {
  try {
    localStorage.removeItem(slot);
  } catch {
    /* ignore */
  }
}

function slotInfo(slot = "slot1") {
  try {
    const raw = localStorage.getItem(slot);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      savedAt: parsed.savedAt,
      cityName: parsed.cityName,
      money: parsed.core?.stats?.money,
      gameState: parsed.core?.gameState
    };
  } catch {
    return null;
  }
}

function listSlots() {
  return SAVE_SLOTS.map((s) => slotInfo(s));
}

function autoSaveSlot() {
  saveGame("slot1");
}

window.saveGame = saveGame;
window.loadGame = loadGame;
window.getSaveData = getSaveData;
window.applySaveData = applySaveData;
window.deleteSave = deleteSave;
window.listSlots = listSlots;
window.slotInfo = slotInfo;
window.autoSaveSlot = autoSaveSlot;
