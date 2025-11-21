// ==========================================
// events.js — CLEAN RANDOM EVENT SYSTEM
// ==========================================

console.log("%c[EVENTS] Loaded.","color:#7CF;");

let eventTimer = 0;
let nextEventIn = rand(15,25);

function rand(a,b){ return Math.random()*(b-a)+a;}
function chance(p){ return Math.random()<p;}
function pick(a){ return a[(Math.random()*a.length)|0];}

const EVENT_CHANCE = {
  dot: 0.05,
  breakdown: 0.18,
  tire: 0.12,
  weather: 0.20,
  bonus: 0.07
};

function durabilityMitigation() {
  const ups = window.getUpgrades?.();
  const level = ups?.truck || 1;
  const mult = 1 - level * 0.10;
  return Math.max(0, mult);
}

window.updateEvents = function(dt){
  if (window.getGameState() !== "DRIVING") return;

  eventTimer += dt;
  if (eventTimer >= nextEventIn) {
    eventTimer = 0;
    nextEventIn = rand(15,25);
    triggerRandomEvent();
  }
};

window.resetEventTimer = function () {
  eventTimer = 0;
  nextEventIn = rand(15,25);
};

function triggerRandomEvent(){
  if (chance(EVENT_CHANCE.dot)) return triggerDOT();
  if (chance(EVENT_CHANCE.breakdown)) return triggerBreak();
  if (chance(EVENT_CHANCE.tire)) return triggerTire();
  if (chance(EVENT_CHANCE.weather)) return triggerShift();
  if (chance(EVENT_CHANCE.bonus)) return triggerBonus();
}

// DOT
function triggerDOT(){
  window.setMessage("Random DOT check!",2);
  if (typeof window.spawnLizard === "function") {
    if (typeof window.__setGameStateFromDot === "function") {
      window.__setGameStateFromDot("CITY");
    }
    setTimeout(() => window.spawnLizard(), 0);
  }
}

// breakdown
function triggerBreak(){
  const s = window.getPlayerStats();
  const dmg = rand(5,15)|0;
  const applied = Math.max(1, Math.round(dmg * durabilityMitigation()));
  s.engineHealth = Math.max(0, s.engineHealth - applied);
  s.money -= applied*10;
  window.setMessage(`Engine hiccup -${applied}%`,3);
}

// tire
function triggerTire(){
  const s = window.getPlayerStats();
  const dmg = rand(8,20)|0;
  const applied = Math.max(1, Math.round(dmg * durabilityMitigation()));
  s.tireHealth = Math.max(0, s.tireHealth - applied);
  s.money -= applied*7;
  window.setMessage(`Tire damage -${applied}%`,3);
}

// weather shift
function triggerShift(){
  const s = window.getPlayerStats();
  const opts = ["clear","rain","storm","fog"];
  s.activeWeather = pick(opts);
  window.setMessage("Weather changed",3);
}

// bonus
function triggerBonus(){
  const s = window.getPlayerStats();
  const amt = rand(20,80)|0;
  s.money += amt;
  window.setMessage("Bonus: +$"+amt,3);
}

// ------------------------------------------
// (mobile touch buttons removed)
