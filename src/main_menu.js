// main_menu.js - main menu, load menu, settings (UI + save logic only)
(function () {
  const SAVE_KEY = "truckgame_save_slots_v1";
  const SETTINGS_KEY = "truckgame_audio_settings_v1";
  const MAX_SLOTS = 3;

  let activeSlot = null;
  let initialSnapshot = null;

  function $(id) {
    return document.getElementById(id);
  }

  function isAnyMenuOpen() {
    return document.body.classList.contains("menu-open");
  }

  function toggleBodyForMenu(open) {
    document.body.classList.toggle("menu-open", !!open);
  }

  function hideAllOverlays() {
    ["main-menu-overlay", "load-menu-overlay", "settings-overlay", "credits-overlay"].forEach((id) => {
      const el = $(id);
      if (el) el.classList.remove("visible");
    });
  }

  function showOverlay(id) {
    hideAllOverlays();
    const el = $(id);
    if (el) el.classList.add("visible");
    toggleBodyForMenu(true);
  }

  function closeMenus() {
    hideAllOverlays();
    toggleBodyForMenu(false);
  }

  function blockGameplayKeys() {
    window.addEventListener(
      "keydown",
      (e) => {
        if (isAnyMenuOpen()) {
          e.stopImmediatePropagation();
          e.preventDefault();
        }
      },
      true
    );
  }

  function cloneStats(s) {
    if (!s) return null;
    return {
      money: s.money,
      jobsDelivered: s.jobsDelivered,
      truckHealth: s.truckHealth,
      engineHealth: s.engineHealth,
      tireHealth: s.tireHealth,
      dotReputation: s.dotReputation,
      fuel: s.fuel,
      activeWeather: s.activeWeather
    };
  }

  function applyStats(toStats, saved) {
    if (!toStats || !saved) return;
    Object.keys(saved).forEach((k) => {
      if (k in toStats) {
        toStats[k] = saved[k];
      }
    });
  }

  function currentSnapshot() {
    if (typeof window.getPlayerStats !== "function") return null;
    const stats = window.getPlayerStats();
    const cities = typeof window.getCities === "function" ? window.getCities() : null;
    const cityId = typeof window.getCurrentCityId === "function" ? window.getCurrentCityId() : 0;
    const milesDriven = typeof window.getWorldScroll === "function" ? Math.round(window.getWorldScroll()) : 0;
    return {
      stats: cloneStats(stats),
      cityId,
      milesDriven,
      timestamp: Date.now(),
      cityName: cities && cities[cityId] ? cities[cityId].name : "Unknown"
    };
  }

  function loadSlots() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return Array(MAX_SLOTS).fill(null);
      const parsed = JSON.parse(raw);
      const list = Array.isArray(parsed) ? parsed.slice(0, MAX_SLOTS) : [];
      while (list.length < MAX_SLOTS) list.push(null);
      return list;
    } catch {
      return Array(MAX_SLOTS).fill(null);
    }
  }

  function saveSlots(slots) {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(slots));
    } catch {
      /* ignore */
    }
  }

  function formatMiles(n) {
    if (n == null) return "0 mi";
    return `${Math.round(n)} mi`;
  }

  function renderSlots() {
    const container = $("slot-list");
    if (!container) return;
    const slots = loadSlots();
    container.innerHTML = "";
    slots.forEach((slot, idx) => {
      const card = document.createElement("div");
      card.className = "slot-card";
      const title = document.createElement("h4");
      title.textContent = `Save Slot #${idx + 1}`;
      card.appendChild(title);
      const meta = document.createElement("div");
      meta.className = "slot-meta";
      if (!slot) {
        meta.textContent = "Empty Slot";
      } else {
        const city = slot.cityName || "Unknown";
        meta.innerHTML = `
          Miles: ${formatMiles(slot.milesDriven || 0)}<br/>
          Money: $${slot.stats?.money ?? 0}<br/>
          City: ${city}
        `;
      }
      card.appendChild(meta);
      card.addEventListener("click", () => loadSlot(idx));
      container.appendChild(card);
    });
  }

  function applySnapshot(slot) {
    if (!slot || !slot.stats) return;
    const stats = window.getPlayerStats?.();
    if (stats) applyStats(stats, slot.stats);
    if (typeof window.setCurrentCity === "function" && Number.isFinite(slot.cityId)) {
      window.setCurrentCity(slot.cityId);
    }
  }

  function setActiveSlot(idx) {
    activeSlot = idx;
  }

  function loadSlot(idx) {
    const slots = loadSlots();
    const slot = slots[idx];
    if (!slot) return;
    setActiveSlot(idx);
    applySnapshot(slot);
    closeMenus();
  }

  function saveActiveSlot() {
    if (activeSlot == null) return;
    const slots = loadSlots();
    const snap = currentSnapshot();
    if (!snap) return;
    slots[activeSlot] = snap;
    saveSlots(slots);
  }

  function resetState() {
    if (typeof window.__returnToMainMenu === "function") {
      window.__returnToMainMenu();
    }
    if (typeof window.__applyCoreSave === "function") {
      const fresh = initialSnapshot || currentSnapshot();
      if (fresh) window.__applyCoreSave({ ...fresh, gameState: "CITY" });
    }
  }

  function handleNewGame() {
    setActiveSlot(0);
    resetState();
    closeMenus();
  }

  function initSettings() {
    const sliderMaster = $("slider-master");
    const sliderSfx = $("slider-sfx");
    const sliderMusic = $("slider-music");

    const defaults = { master: 100, sfx: 100, music: 100 };
    function loadSettings() {
      try {
        const raw = localStorage.getItem(SETTINGS_KEY);
        if (!raw) return defaults;
        const parsed = JSON.parse(raw);
        return {
          master: parsed.master ?? defaults.master,
          sfx: parsed.sfx ?? defaults.sfx,
          music: parsed.music ?? defaults.music
        };
      } catch {
        return defaults;
      }
    }

    function saveSettings(vals) {
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(vals));
      } catch {
        /* ignore */
      }
    }

    const current = loadSettings();
    if (sliderMaster) sliderMaster.value = current.master;
    if (sliderSfx) sliderSfx.value = current.sfx;
    if (sliderMusic) sliderMusic.value = current.music;

    function onChange() {
      const vals = {
        master: Number(sliderMaster?.value ?? current.master),
        sfx: Number(sliderSfx?.value ?? current.sfx),
        music: Number(sliderMusic?.value ?? current.music)
      };
      saveSettings(vals);
      window.__audioSettings = vals;
    }

    [sliderMaster, sliderSfx, sliderMusic].forEach((s) => {
      if (s) s.addEventListener("input", onChange);
    });

    window.__audioSettings = current;
  }

  function wireButtons() {
    $("btn-new-game")?.addEventListener("click", handleNewGame);
    $("btn-resume-game")?.addEventListener("click", () => {
      closeMenus();
    });
    $("btn-load-game")?.addEventListener("click", () => {
      if (typeof window.showSaveLoadPanel === "function") {
        window.showSaveLoadPanel();
      } else {
        renderSlots();
        showOverlay("load-menu-overlay");
      }
    });
    $("btn-settings")?.addEventListener("click", () => showOverlay("settings-overlay"));
    $("btn-credits")?.addEventListener("click", () => showOverlay("credits-overlay"));
    $("btn-load-back")?.addEventListener("click", () => showOverlay("main-menu-overlay"));
    $("btn-settings-back")?.addEventListener("click", () => showOverlay("main-menu-overlay"));
    $("btn-credits-back")?.addEventListener("click", () => showOverlay("main-menu-overlay"));
  }

  function bootstrap() {
    toggleBodyForMenu(true);
    hideAllOverlays();
    showOverlay("main-menu-overlay");
    blockGameplayKeys();
    wireButtons();
    initSettings();
    initialSnapshot = currentSnapshot();
    setInterval(saveActiveSlot, 8000);
  }

  document.addEventListener("DOMContentLoaded", bootstrap);
})();
