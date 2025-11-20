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

window.updateEvents = function(dt){
  if (window.getGameState() !== "DRIVING") return;

  eventTimer += dt;
  if (eventTimer >= nextEventIn) {
    eventTimer = 0;
    nextEventIn = rand(15,25);
    triggerRandomEvent();
  }
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
  if (typeof window.startDotWheel === "function") {
    if (typeof window.__setGameStateFromDot === "function") {
      window.__setGameStateFromDot("CITY");
    }
    window.startDotWheel();
  }
}

// breakdown
function triggerBreak(){
  const s = window.getPlayerStats();
  const dmg = rand(5,15)|0;
  s.engineHealth = Math.max(0, s.engineHealth - dmg);
  s.money -= dmg*10;
  window.setMessage(`Engine hiccup -${dmg}%`,3);
}

// tire
function triggerTire(){
  const s = window.getPlayerStats();
  const dmg = rand(8,20)|0;
  s.tireHealth = Math.max(0, s.tireHealth - dmg);
  s.money -= dmg*7;
  window.setMessage(`Tire damage -${dmg}%`,3);
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
// Mobile touch controls -> synthetic keys
// ------------------------------------------
(function setupMobileTouchControls() {
  const container = document.getElementById("mobile-controls");
  if (!container) return;
  const buttons = container.querySelectorAll("button[data-key]");
  if (!buttons.length) return;

  const activeKeys = new Set();

  const sendKeyEvent = (type, key) => {
    const evt = new KeyboardEvent(type, { key, bubbles: true });
    window.dispatchEvent(evt);
  };

  const handleDown = (key, btn) => {
    if (activeKeys.has(key)) return;
    activeKeys.add(key);
    btn.classList.add("pressed");
    sendKeyEvent("keydown", key);
  };

  const handleUp = (key, btn) => {
    if (!activeKeys.has(key)) return;
    activeKeys.delete(key);
    btn.classList.remove("pressed");
    sendKeyEvent("keyup", key);
  };

  buttons.forEach((btn) => {
    const key = btn.getAttribute("data-key");
    if (!key) return;

    btn.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      handleDown(key, btn);
    });

    ["pointerup", "pointerleave", "pointercancel"].forEach((type) => {
      btn.addEventListener(type, (e) => {
        e.preventDefault();
        handleUp(key, btn);
      });
    });
  });

  window.addEventListener("blur", () => {
    activeKeys.forEach((key) => sendKeyEvent("keyup", key));
    activeKeys.clear();
    buttons.forEach((btn) => btn.classList.remove("pressed"));
  });
})();
