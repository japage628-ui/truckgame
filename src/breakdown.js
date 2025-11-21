// breakdown.js - dedicated breakdown event and UI hooks

const breakdownChance = 0.015; // adjustable probability per interval
const BREAKDOWN_CHECK_INTERVAL = 8; // seconds between checks while driving

let breakdownTimer = 0;
let breakdownActive = false;
let pendingBreakdownCost = 0;

function resetBreakdownTimer() {
  breakdownTimer = 0;
}

function randomDescription() {
  const options = [
    "Engine trouble detected. Power loss imminent.",
    "Tire blowout! Truck shudders to a halt.",
    "Electrical issue: dashboard flickers wildly.",
    "Coolant leak spotted. Temperature spiking."
  ];
  return options[(Math.random() * options.length) | 0];
}

function computeRoadsideCost() {
  const milesLeft = typeof window.getMilesRemaining === "function" ? window.getMilesRemaining() : 0;
  const base = 180;
  const distanceFactor = Math.min(400, milesLeft * 0.08);
  return Math.max(90, Math.round(base + distanceFactor));
}

function updateBreakdown(dt) {
  const state = typeof window.getGameState === "function" ? window.getGameState() : "START";
  const activeJob = typeof window.getActiveJob === "function" ? window.getActiveJob() : null;

  if (window.__lizardActive || window.__breakdownActive) {
    return;
  }

  if (state !== "DRIVING" || !activeJob) {
    resetBreakdownTimer();
    return;
  }

  breakdownTimer += dt;
  if (breakdownTimer >= BREAKDOWN_CHECK_INTERVAL) {
    breakdownTimer = 0;
    if (Math.random() < breakdownChance) {
      triggerBreakdown();
    }
  }
}

function triggerBreakdown() {
  const state = typeof window.getGameState === "function" ? window.getGameState() : "START";
  const activeJob = typeof window.getActiveJob === "function" ? window.getActiveJob() : null;
  if (state !== "DRIVING" || !activeJob || window.__lizardActive || window.__breakdownActive) return;

  breakdownActive = true;
  window.__breakdownActive = true;
  pendingBreakdownCost = computeRoadsideCost();
  const desc = randomDescription();
  showBreakdownPopup(desc, pendingBreakdownCost);
}

function showBreakdownPopup(description, cost) {
  if (typeof window.showBreakdownUI === "function") {
    window.showBreakdownUI(description, cost);
  }
}

function confirmRoadsideService() {
  if (!breakdownActive) return;
  const stats = typeof window.getPlayerStats === "function" ? window.getPlayerStats() : null;
  if (!stats) return;
  if (stats.money < pendingBreakdownCost) {
    if (typeof window.setMessage === "function") {
      window.setMessage("Not enough money for roadside service", 3);
    }
    return;
  }
  stats.money -= pendingBreakdownCost;
  resumeTripAfterBreakdown("Roadside service dispatched.");
}

function abandonTrip() {
  if (typeof window.__abandonActiveJob === "function") {
    window.__abandonActiveJob("Trip abandoned after breakdown.");
  }
  if (typeof window.hideBreakdownUI === "function") {
    window.hideBreakdownUI();
  }
  breakdownActive = false;
  window.__breakdownActive = false;
}

function resumeTripAfterBreakdown(message = "Trip resumed.") {
  if (typeof window.hideBreakdownUI === "function") {
    window.hideBreakdownUI();
  }
  breakdownActive = false;
  window.__breakdownActive = false;
  pendingBreakdownCost = 0;
  if (typeof window.setMessage === "function") {
    window.setMessage(message, 3);
  }
  const activeJob = typeof window.getActiveJob === "function" ? window.getActiveJob() : null;
  if (activeJob && typeof window.__setGameStateFromDot === "function") {
    window.__setGameStateFromDot("DRIVING");
  }
}

window.updateBreakdown = updateBreakdown;
window.triggerBreakdown = triggerBreakdown;
window.showBreakdownPopup = showBreakdownPopup;
window.confirmRoadsideService = confirmRoadsideService;
window.abandonTrip = abandonTrip;
window.resumeTripAfterBreakdown = resumeTripAfterBreakdown;
window.__resetBreakdownTimer = resetBreakdownTimer;
window.getBreakdownState = function () {
  return {
    active: window.__breakdownActive || breakdownActive,
    timer: breakdownTimer,
    pendingCost: pendingBreakdownCost
  };
};
window.setBreakdownState = function (data) {
  breakdownTimer = Number(data?.timer) || 0;
  pendingBreakdownCost = Number(data?.pendingCost) || 0;
  const active = !!data?.active;
  breakdownActive = active;
  window.__breakdownActive = active;
  if (active) {
    triggerBreakdown();
  }
};
