// challenges.js - long-term goals, progress, and UI
(function () {
  const STORAGE_KEY = "truckgame_challenges_v1";

  const CHALLENGES = [
    { id: "miles_5000", name: "Drive 5000 miles", target: 5000, reward: { money: 500 }, type: "miles" },
    { id: "jobs_20", name: "Complete 20 jobs", target: 20, reward: { money: 750 }, type: "jobs" },
    { id: "clean_10", name: "Avoid DOT violations for 10 jobs", target: 10, reward: { money: 1000 }, type: "clean_jobs" },
    { id: "cash_50000", name: "Earn $50,000 total", target: 50000, reward: { money: 1500 }, type: "earnings" }
  ];

  const defaultState = () => ({
    progress: {
      miles_5000: 0,
      jobs_20: 0,
      clean_10: 0,
      cash_50000: 0
    },
    completed: {}
  });

  let state = load();
  let lastMoney = getMoney();

  function getMoney() {
    return (window.getPlayerStats && (window.getPlayerStats().money || 0)) || 0;
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      return {
        progress: { ...defaultState().progress, ...(parsed.progress || {}) },
        completed: parsed.completed || {}
      };
    } catch (e) {
      console.warn("[Challenges] failed to load", e);
      return defaultState();
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn("[Challenges] failed to save", e);
    }
  }

  function grantReward(reward) {
    if (!reward) return;
    if (reward.money && window.getPlayerStats) {
      const stats = window.getPlayerStats();
      stats.money += reward.money;
    }
  }

  function showPopup(text) {
    const box = document.getElementById("challenge-popup");
    if (!box) return;
    box.textContent = text;
    box.style.display = "block";
    clearTimeout(showPopup._t);
    showPopup._t = setTimeout(() => {
      box.style.display = "none";
    }, 3500);
  }

  function maybeComplete(id) {
    const ch = CHALLENGES.find(c => c.id === id);
    if (!ch || state.completed[id]) return;
    if (state.progress[id] >= ch.target) {
      state.completed[id] = true;
      grantReward(ch.reward);
      save();
      showPopup(`Challenge complete: ${ch.name}! Reward: ${ch.reward.money ? "$" + ch.reward.money : "bonus"}`);
      renderList();
    }
  }

  function recordMiles(delta) {
    if (delta <= 0) return;
    state.progress.miles_5000 = Math.min(challengeTarget("miles_5000"), state.progress.miles_5000 + delta);
    maybeComplete("miles_5000");
  }

  function recordJobComplete(clean) {
    state.progress.jobs_20 = Math.min(challengeTarget("jobs_20"), state.progress.jobs_20 + 1);
    if (clean) {
      state.progress.clean_10 = Math.min(challengeTarget("clean_10"), state.progress.clean_10 + 1);
    } else {
      state.progress.clean_10 = 0;
    }
    maybeComplete("jobs_20");
    maybeComplete("clean_10");
  }

  function recordEarnings(amount) {
    if (amount <= 0) return;
    state.progress.cash_50000 = Math.min(challengeTarget("cash_50000"), state.progress.cash_50000 + amount);
    maybeComplete("cash_50000");
  }

  function recordViolation() {
    state.progress.clean_10 = 0;
  }

  function challengeTarget(id) {
    const ch = CHALLENGES.find(c => c.id === id);
    return ch ? ch.target : 0;
  }

  function renderList() {
    const container = document.getElementById("challenge-list");
    if (!container) return;
    container.innerHTML = "";
    CHALLENGES.forEach((ch) => {
      const progress = Math.min(state.progress[ch.id] || 0, ch.target);
      const pct = Math.min(100, (progress / ch.target) * 100);
      const item = document.createElement("div");
      item.className = "challenge-item";
      const rewardText = ch.reward?.money ? `Reward: $${ch.reward.money}` : "Reward available";
      item.innerHTML = `
        <div><strong>${ch.name}</strong></div>
        <div>${progress.toFixed(0)} / ${ch.target} — ${rewardText}</div>
        <div class="challenge-progress"><span style="width:${pct}%"></span></div>
        ${state.completed[ch.id] ? "<div style='color:#3dd185;'>Completed</div>" : ""}
      `;
      container.appendChild(item);
    });
  }

  function openModal() {
    const modal = document.getElementById("challenge-modal");
    if (!modal) return;
    renderList();
    modal.classList.add("visible");
  }

  function closeModal() {
    const modal = document.getElementById("challenge-modal");
    if (!modal) return;
    modal.classList.remove("visible");
  }

  function setupUI() {
    const btn = document.getElementById("challenge-btn");
    if (btn) btn.addEventListener("click", openModal);
    const close = document.getElementById("challenge-close-btn");
    if (close) close.addEventListener("click", closeModal);
  }

  // observe money increases without altering core logic
  function trackMoneyDelta() {
    const current = getMoney();
    const delta = current - lastMoney;
    if (delta > 0) {
      recordEarnings(delta);
      save();
    }
    lastMoney = current;
  }

  window.Challenges = {
    recordMiles: (d) => { recordMiles(d); save(); },
    recordJobComplete: (clean) => { recordJobComplete(clean); save(); },
    recordViolation: () => { recordViolation(); save(); },
    tickMoney: trackMoneyDelta
  };

  // init
  document.addEventListener("DOMContentLoaded", () => {
    setupUI();
    renderList();
    setInterval(trackMoneyDelta, 2000);
  });
})();
