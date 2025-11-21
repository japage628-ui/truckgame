// ===========================================================
// engine.js - core game logic (v1.0.0)
// ===========================================================

// ---------------- GAME STATE ----------------
let gameState = "START";
window.getGameState = () => gameState;
window.__setGameStateFromDot = (state) => {
  if (state === "DRIVING" || state === "CITY") {
    gameState = state;
  }
};
window.__setGameState = (state) => {
  gameState = state;
};

const cities = window.GameData.cities;
let currentCityId = 0;
let tripOriginCityId = 0;
window.getCities = () => cities;
window.getCurrentCityId = () => currentCityId;
window.setCurrentCity = (id) => {
  if (id >= 0 && id < cities.length) currentCityId = id;
  syncMiniMapToCity();
};
window.__setTripOriginCityId = (id) => {
  if (Number.isFinite(id) && id >= 0 && id < cities.length) {
    tripOriginCityId = id;
  }
};
window.__getTripOriginCityId = () => tripOriginCityId;

function syncMiniMapToCity() {
  const city = cities && cities[currentCityId];
  if (city && typeof window.updateMiniMap === "function") {
    window.updateMiniMap(city.lat, city.lon);
  }
}

// World scroll
let worldScroll = 0;
window.getWorldScroll = () => worldScroll;
window.__breakdownActive = false;
window.__setWorldScroll = (v) => {
  if (Number.isFinite(v)) worldScroll = v;
};

// ---------------- PLAYER STATS ----------------
let stats = {
  money: 800,
  jobsDelivered: 0,
  truckHealth: 100,
  engineHealth: 100,
  tireHealth: 100,
  dotReputation: 50,
  fuel: 120,
  activeWeather: "clear"
};
window.getPlayerStats = () => stats;
window.getWeather = () => stats.activeWeather;
window.__setStats = (data) => {
  if (!data) return;
  Object.keys(stats).forEach((k) => {
    if (k in data && Number.isFinite(data[k])) {
      stats[k] = data[k];
    }
  });
};

// ---------------- UPGRADES ----------------
let upgrades = {
  engine: 1,
  transmission: 1,
  tires: 1,
  tank: 1,
  reefer: 1,
  aero: 1,
  suspension: 1,
  safety: 1,
  comfort: 1
};
const UPGRADE_STORAGE_KEY = "truckgame_upgrades_v1";
window.getUpgrades = () => upgrades;
window.__setUpgrades = (data) => {
  if (!data) return;
  Object.keys(upgrades).forEach((k) => {
    if (k in data && Number.isFinite(data[k])) {
      upgrades[k] = data[k];
    }
  });
  applyUpgradeEffects();
};

function loadUpgradesFromStorage() {
  try {
    const raw = localStorage.getItem(UPGRADE_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return;
    Object.keys(upgrades).forEach((key) => {
      const val = Number(parsed[key]);
      if (Number.isFinite(val) && val >= 1) {
        upgrades[key] = val;
      }
    });
  } catch (e) {
    console.warn("[Upgrades] load failed", e);
  }
}

function saveUpgrades() {
  try {
    localStorage.setItem(UPGRADE_STORAGE_KEY, JSON.stringify(upgrades));
  } catch (e) {
    console.warn("[Upgrades] save failed", e);
  }
}

function applyUpgradeEffects() {
  stats.fuel = Math.min(stats.fuel, getTankCapacity());
}

loadUpgradesFromStorage();

window.purchaseUpgrade = (name) => {
  if (gameState !== "CITY") {
    setMessage("Upgrades available in city only", 2);
    return { ok: false, reason: "not_in_city" };
  }

  const costs = window.GameData.upgradeCosts[name];
  if (!costs) return { ok: false, reason: "no_upgrade" };

  const current = upgrades[name] || 1;
  const nextIndex = current - 1;
  if (nextIndex >= costs.length) {
    setMessage("Already maxed", 2);
    return { ok: false, reason: "max" };
  }

  const cost = costs[nextIndex];
  if (stats.money < cost) {
    setMessage("Need $" + cost + " for upgrade", 2);
    return { ok: false, reason: "poor" };
  }

  stats.money -= cost;
  upgrades[name] = current + 1;
  applyUpgradeEffects();
  saveUpgrades();
  setMessage(name + " upgraded to L" + upgrades[name], 2.5);
  return { ok: true };
};

// ---------------- MESSAGE SYSTEM ----------------
let messageText = "";
let messageTimer = 0;

window.getMessage = () => messageText;

function setMessage(t, duration = 2) {
  messageText = t;
  messageTimer = duration;
}
window.setMessage = setMessage;

// ---------------- FUEL SYSTEM ----------------
function getTankCapacity() {
  const baseMaxFuel = 120;
  const level = upgrades.tank || 0;
  return baseMaxFuel * (1 + level * 0.15);
}

window.getFuelPercent = () => {
  return Math.max(0, (stats.fuel / getTankCapacity()) * 100);
};

applyUpgradeEffects();
saveUpgrades();

// ---------------- JOB SYSTEM ----------------
let activeJob = null;
let jobRemaining = 0;
window.getActiveJob = () => activeJob;
window.getMilesRemaining = () => Math.max(0, jobRemaining);
window.getProgressPercent = () => {
  if (!activeJob || !activeJob.distanceTotal) return 0;
  const pct = 100 - (jobRemaining / activeJob.distanceTotal) * 100;
  return Math.min(100, Math.max(0, pct));
};
window.__getJobState = () => ({
  activeJob,
  jobRemaining,
  tripOriginCityId
});

window.__applyJobState = (data) => {
  activeJob = data?.activeJob || null;
  jobRemaining = Number(data?.jobRemaining) || 0;
  if (Number.isFinite(data?.tripOriginCityId)) {
    tripOriginCityId = data.tripOriginCityId;
  }
};

function makeJobsForCity(cityId) {
  const jobs = [];
  for (let i = 0; i < 4; i++) {
    const destId = (cityId + 1 + i) % cities.length;
    const miles = window.getDistanceMiles(cityId, destId);
    const weightClass = i % 2 === 0 ? "med" : "light";
    const weightStr = weightClass === "med" ? "30k" : "20k";
    const baseRate = weightClass === "med" ? 1.3 : 1.1;
    const payout = Math.round(miles * baseRate);

    jobs.push({
      destId,
      distanceTotal: miles,
      weight: weightStr,
      payout
    });
  }
  return jobs;
}

let cachedJobs = makeJobsForCity(currentCityId);
syncMiniMapToCity();
let __lastMoneyForChallenges = stats.money;

window.getCurrentJobs = () => cachedJobs;

window.startJob = (job) => {
  tripOriginCityId = currentCityId;
  activeJob = job;
  jobRemaining = job.distanceTotal;
  stats.activeWeather = "clear";
  const dest = cities[job.destId];
  const destName = dest ? dest.name : "Unknown";
  setMessage("Hauling to " + destName, 3);
  gameState = "DRIVING";
  syncMiniMapToCity();
  window.__dotViolationThisJob = false;
  if (typeof window.resetEventTimer === "function") {
    window.resetEventTimer();
  }
  if (typeof window.autoSaveSlot === "function") {
    window.autoSaveSlot();
  }
};

window.__returnToMainMenu = () => {
  activeJob = null;
  jobRemaining = 0;
  gameState = "START";
  setMessage("Welcome back!", 2);
};

window.__abandonActiveJob = (reason = "Trip cancelled.") => {
  activeJob = null;
  jobRemaining = 0;
  currentCityId = tripOriginCityId;
  cachedJobs = makeJobsForCity(currentCityId);
  syncMiniMapToCity();
  window.__dotViolationThisJob = false;
  gameState = "CITY";
  window.__breakdownActive = false;
  setMessage(reason, 3);
  if (typeof window.autoSaveSlot === "function") {
    window.autoSaveSlot();
  }
};

window.__getCoreSave = () => {
  return {
    gameState,
    currentCityId,
    tripOriginCityId,
    worldScroll,
    stats: { ...stats },
    upgrades: { ...upgrades },
    job: { activeJob, jobRemaining, tripOriginCityId },
    cachedJobs
  };
};

window.__applyCoreSave = (data) => {
  if (!data) return;
  if (typeof data.currentCityId === "number") {
    currentCityId = Math.max(0, Math.min(cities.length - 1, data.currentCityId));
  }
  if (typeof data.tripOriginCityId === "number") {
    tripOriginCityId = Math.max(0, Math.min(cities.length - 1, data.tripOriginCityId));
  }
  if (typeof data.worldScroll === "number") {
    worldScroll = data.worldScroll;
  }
  if (data.stats) {
    Object.keys(stats).forEach((k) => {
      if (k in data.stats) stats[k] = data.stats[k];
    });
  }
  if (data.upgrades) {
    Object.keys(upgrades).forEach((k) => {
      if (k in data.upgrades) upgrades[k] = data.upgrades[k];
    });
  }
  applyUpgradeEffects();

  if (data.job) {
    activeJob = data.job.activeJob || null;
    jobRemaining = Number(data.job.jobRemaining) || 0;
    if (typeof data.job.tripOriginCityId === "number") {
      tripOriginCityId = Math.max(0, Math.min(cities.length - 1, data.job.tripOriginCityId));
    }
  }
  if (data.cachedJobs && Array.isArray(data.cachedJobs)) {
    cachedJobs = data.cachedJobs;
  } else {
    cachedJobs = makeJobsForCity(currentCityId);
  }
  syncMiniMapToCity();
  if (typeof data.gameState === "string") {
    gameState = data.gameState;
  }
};

// ---------------- DRIVING UPDATE ----------------
function handleDriving(dt) {
  if (window.__lizardActive || window.__breakdownActive) return;
  if (!activeJob) return;

  // speed based on upgrades
  const baseSpeed = window.GameData.baseSpeed;
  const engineLevel = upgrades.engine || 0;
  const mph = baseSpeed * (1 + engineLevel * 0.10);

  // movement
  jobRemaining -= mph * dt;
  worldScroll += mph * dt;
  if (typeof window.Challenges?.recordMiles === "function") {
    window.Challenges.recordMiles(mph * dt);
  }

  // fuel usage
  stats.fuel -= (mph * dt) * 0.04;
  if (stats.fuel < 0) stats.fuel = 0;

  // if out of fuel -> stop truck
  if (stats.fuel <= 0) {
    const roadsideCost = 250;
    if (stats.money >= roadsideCost) {
      stats.money -= roadsideCost;
      stats.fuel = getTankCapacity() * 0.25;
      setMessage("Roadside service: refueled (-$250)", 3);
      return;
    }
    setMessage("Out of fuel - towed back.", 4);
    stats.fuel = getTankCapacity() * 0.10;
    activeJob = null;
    jobRemaining = 0;
    currentCityId = tripOriginCityId;
    cachedJobs = makeJobsForCity(currentCityId);
    syncMiniMapToCity();
    window.__dotViolationThisJob = false;
    gameState = "CITY";
    return;
  }

  // arrival
  if (jobRemaining <= 0) {
    stats.money += activeJob.payout;
    stats.jobsDelivered++;
    if (typeof window.Challenges?.recordJobComplete === "function") {
      window.Challenges.recordJobComplete(!window.__dotViolationThisJob);
    }

    setMessage("Delivered! +$" + activeJob.payout, 3);

    const destId = activeJob.destId;
    currentCityId = destId;
    cachedJobs = makeJobsForCity(destId);
    syncMiniMapToCity();
    window.__dotViolationThisJob = false;

    activeJob = null;
    jobRemaining = 0;
    gameState = "CITY";
    if (typeof window.autoSaveSlot === "function") {
      window.autoSaveSlot();
    }
  }
}

// ---------------- UPDATE LOOP ----------------
function update(dt) {
  if (typeof window.Challenges?.tickMoney === "function") {
    window.Challenges.tickMoney();
  }
  if (typeof window.updateBreakdown === "function") {
    window.updateBreakdown(dt);
  }
  if (messageTimer > 0) {
    messageTimer -= dt;
    if (messageTimer <= 0) {
      messageTimer = 0;
      messageText = "";
    }
  }

  if (gameState === "DRIVING" && activeJob) {
    handleDriving(dt);
  }

  if (typeof window.updateEvents === "function") {
    window.updateEvents(dt);
  }
}
window.update = update;

// ===========================================================
// INPUT HANDLING (FULLY FIXED)
// ===========================================================
window.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();

  // START -> CITY
  if (gameState === "START") {
    gameState = "CITY";
    return;
  }

  // CITY MODE
  if (gameState === "CITY") {
    // REFUEL
    if (key === "r") {
      if (stats.money >= 50) {
        stats.money -= 50;
        stats.fuel = getTankCapacity();
        setMessage("Refueled for $50", 2);
      } else {
        setMessage("Not enough money!", 2);
      }
      return;
    }

    return;
  }

  // DRIVING DEBUG
  if (gameState === "DRIVING") {
    if (key === "c") {
      gameState = "CITY";
    }
  }
});
