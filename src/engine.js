// ===========================================================
// engine.js - core game logic (v1.0.0)
// ===========================================================

// ---------------- GAME STATE ----------------
let gameState = "START";
window.getGameState = () => gameState;

const cities = window.GameData.cities;
let currentCityId = 0;
window.getCities = () => cities;
window.getCurrentCityId = () => currentCityId;
window.setCurrentCity = (id) => {
  if (id >= 0 && id < cities.length) currentCityId = id;
};

// World scroll
let worldScroll = 0;
window.getWorldScroll = () => worldScroll;

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
window.getUpgrades = () => upgrades;

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
  return 120 + (upgrades.tank - 1) * 20;
}

window.getFuelPercent = () => {
  return Math.max(0, (stats.fuel / getTankCapacity()) * 100);
};

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

window.getCurrentJobs = () => cachedJobs;

window.startJob = (job) => {
  activeJob = job;
  jobRemaining = job.distanceTotal;
  stats.activeWeather = "clear";
  const dest = cities[job.destId];
  const destName = dest ? dest.name : "Unknown";
  setMessage("Hauling to " + destName, 3);
  gameState = "DRIVING";
};

// ---------------- DOT MINI GAME ----------------
let dotMini = { checks: [], index: 0, timer: 0, score: 0 };

window.getDotMiniState = () => dotMini;

window.startDotMinigame = () => {
  dotMini = {
    checks: [
      { label: "Logs", key: "l" },
      { label: "Tires", key: "t" },
      { label: "Lights", key: "g" },
      { label: "Brakes", key: "b" },
      { label: "Paperwork", key: "p" },
      { label: "Securement", key: "s" }
    ],
    index: 0,
    timer: 6,
    score: 0
  };

  setMessage("DOT inspection in progress...", 2);
  gameState = "DOT_MINIGAME";
};

function dotMiniInput(key) {
  const cur = dotMini.checks[dotMini.index];
  if (!cur) return;

  if (key === cur.key) dotMini.score++;
  dotMini.index++;

  if (dotMini.index >= dotMini.checks.length) {
    finalizeDotMinigame();
  }
}

function updateDotMinigame(dt) {
  dotMini.timer -= dt;
  if (dotMini.timer <= 0) finalizeDotMinigame();
}

function finalizeDotMinigame() {
  const payout = dotMini.score * 25;
  stats.money += payout;
  stats.dotReputation = Math.min(100, stats.dotReputation + dotMini.score * 2);
  setMessage(`DOT check done: +$${payout}`, 3);

  gameState = activeJob ? "DRIVING" : "CITY";
}

// ---------------- DRIVING UPDATE ----------------
function handleDriving(dt) {
  if (!activeJob) return;

  // speed based on upgrades
  const baseSpeed = window.GameData.baseSpeed;
  const mph = baseSpeed * (1 + (upgrades.engine - 1) * 0.05);

  // movement
  jobRemaining -= mph * dt;
  worldScroll += mph * dt;

  // fuel usage
  stats.fuel -= (mph * dt) * 0.04;
  if (stats.fuel < 0) stats.fuel = 0;

  // if out of fuel -> stop truck
  if (stats.fuel <= 0) {
    setMessage("Out of fuel! Press R in a city to refuel.", 4);
    gameState = "CITY";
    return;
  }

  // arrival
  if (jobRemaining <= 0) {
    stats.money += activeJob.payout;
    stats.jobsDelivered++;

    setMessage("Delivered! +$" + activeJob.payout, 3);

    const destId = activeJob.destId;
    currentCityId = destId;
    cachedJobs = makeJobsForCity(destId);

    activeJob = null;
    jobRemaining = 0;
    gameState = "CITY";
  }
}

// ---------------- UPDATE LOOP ----------------
function update(dt) {
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

  if (gameState === "DOT_MINIGAME") {
    updateDotMinigame(dt);
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

  // DOT MINI
  if (gameState === "DOT_MINIGAME") {
    dotMiniInput(key);
    return;
  }

  // CITY MODE
  if (gameState === "CITY") {
    // Select job 1-4
    if (["1", "2", "3", "4"].includes(key)) {
      const idx = Number(key) - 1;
      const jobs = window.getCurrentJobs();
      if (jobs[idx]) window.startJob(jobs[idx]);
      return;
    }

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
