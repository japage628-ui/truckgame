// ==============================================
// ui.js — HUD + Panels (v1.0.0 REALISM PATCH)
// ==============================================

console.log("%c[UI] Loaded.", "color:#5F5;");

function styleTopButtons() {
  const menuBtn = document.getElementById("main-menu-btn");
  const challengeBtn = document.getElementById("challenge-btn");
  if (menuBtn) {
    menuBtn.style.display = "none";
  }
  if (challengeBtn) {
    challengeBtn.style.display = "none";
  }
  if (!menuBtn && !challengeBtn) return;
  const btnW = 130;
  const btnH = 32;
  const spacing = 12;
  const radius = "8px";
  const fontSize = "12px";
  [menuBtn, challengeBtn].forEach((btn) => {
    btn.style.width = `${btnW}px`;
    btn.style.height = `${btnH}px`;
    btn.style.borderRadius = radius;
    btn.style.fontSize = fontSize;
    btn.style.padding = "0 12px";
    btn.style.lineHeight = `${btnH - 4}px`;
    btn.style.position = "absolute";
  });

  const total = btnW * 2 + spacing;
  const startX = window.innerWidth / 2 - total / 2;
  const top = 12;
  menuBtn.style.top = `${top}px`;
  challengeBtn.style.top = `${top}px`;
  menuBtn.style.left = `${startX}px`;
  challengeBtn.style.left = `${startX + btnW + spacing}px`;
  menuBtn.style.right = "auto";
  challengeBtn.style.right = "auto";
  menuBtn.style.transform = "none";
  challengeBtn.style.transform = "none";

}

function openJobBoard() {
  document.getElementById("job-board-dropdown")?.classList.add("open");
}

function closeJobBoard() {
  document.getElementById("job-board-dropdown")?.classList.remove("open");
}

function renderJobBoard() {
  const panel = document.getElementById("job_board_container") || document.getElementById("job-list-panel");
  const list = document.getElementById("job-list");
  if (!panel || !list) return;
  const tpl = document.getElementById("job-template");
  const jobs = window.getCurrentJobs ? window.getCurrentJobs() : [];
  const state = window.getGameState ? window.getGameState() : "START";
  if (state !== "CITY") {
    panel.classList.add("hidden");
    closeJobBoard();
    return;
  }
    panel.classList.remove("hidden");
  openJobBoard();
  list.innerHTML = "";
  jobs.forEach((job) => {
    const row = document.createElement("div");
    row.className = "job-item";
    const text = document.createElement("div");
    text.className = "job-text";
    const destEl = document.createElement("div");
    destEl.className = "job-dest";
    const distEl = document.createElement("div");
    distEl.className = "job-meta job-distance";
    const weightEl = document.createElement("div");
    weightEl.className = "job-meta job-weight";
    const payEl = document.createElement("div");
    payEl.className = "job-meta job-pay";
    text.appendChild(destEl);
    text.appendChild(distEl);
    text.appendChild(weightEl);
    text.appendChild(payEl);

    const btn = document.createElement("button");
    btn.className = "job-select-btn";
    btn.type = "button";
    btn.textContent = "Select";

    row.appendChild(text);
    row.appendChild(btn);

    const cities = window.getCities ? window.getCities() : [];
    const destName = cities && cities[job.destId] ? cities[job.destId].name : "Unknown";
    if (destEl) destEl.textContent = `\u25b6 ${destName}`;
    if (distEl) distEl.textContent = `Distance: ${job.distanceTotal} mi`;
    if (weightEl) weightEl.textContent = `Weight: ${job.weight}`;
    if (payEl) payEl.textContent = `Pay: $${job.payout}`;
    if (btn) {
      btn.textContent = "Select";
      btn.onclick = (e) => {
        e.preventDefault();
        if (typeof window.startJob === "function") {
          window.startJob(job);
          closeJobBoard();
          list.innerHTML = "";
        }
      };
      btn.addEventListener("touchstart", (e) => {
        e.preventDefault();
        btn.click();
      }, { passive: false });
    }
    list.appendChild(row);
  });
}

function initUIFixes() {
  styleTopButtons();
  renderJobBoard();
}

window.addEventListener("resize", styleTopButtons);
document.addEventListener("DOMContentLoaded", () => {
  initUIFixes();
  setInterval(renderJobBoard, 600);
});

window.addEventListener("templates:loaded", () => {
  initUIFixes();
  renderJobBoard();
  buildChallengesPanel();
  buildLizardPanel();
});

// ---------------- CHALLENGES MODAL ----------------
let challengesOverlay = null;

function buildChallengesPanel() {
  if (challengesOverlay) return;
  const overlay = document.createElement("div");
  overlay.className = "challenges-panel-overlay";
  overlay.id = "challenges-panel-overlay";

  const panel = document.createElement("div");
  panel.className = "challenges-panel";

  const closeBtn = document.createElement("button");
  closeBtn.className = "challenges-close";
  closeBtn.textContent = "X";

  const title = document.createElement("h3");
  title.textContent = "Challenges";

  const list = document.createElement("div");
  list.className = "challenges-list";
  list.id = "challenges-panel-list";

  panel.appendChild(closeBtn);
  panel.appendChild(title);
  panel.appendChild(list);
  overlay.appendChild(panel);
  document.body.appendChild(overlay);

  closeBtn.addEventListener("click", toggleChallengesPanel);

  const toggleBtn = document.getElementById("challenge-btn");
  if (toggleBtn) toggleBtn.addEventListener("click", toggleChallengesPanel);

  challengesOverlay = overlay;
  renderChallengesPanel();
}

function renderChallengesPanel() {
  const listEl = document.getElementById("challenges-panel-list");
  if (!listEl) return;
  listEl.innerHTML = "";
  const data = window.Challenges?.list ? window.Challenges.list() : null;
  if (!data || !data.length) {
    const empty = document.createElement("div");
    empty.textContent = "No active challenges.";
    listEl.appendChild(empty);
    return;
  }

  data.forEach((ch) => {
    const row = document.createElement("div");
    row.className = "challenge-row";

    const header = document.createElement("div");
    header.className = "challenge-header";
    const name = document.createElement("div");
    name.className = "challenge-name";
    name.textContent = ch.name;
    const claimBtn = document.createElement("button");
    claimBtn.className = "challenge-claim-btn";
    claimBtn.textContent = ch.claimed ? "Claimed" : ch.completed ? "Claim" : "In Progress";
    claimBtn.disabled = !ch.completed || ch.claimed;
    claimBtn.addEventListener("click", () => {
      if (window.Challenges?.claim) {
        window.Challenges.claim(ch.id);
        renderChallengesPanel();
      }
    });
    header.appendChild(name);
    header.appendChild(claimBtn);

    const desc = document.createElement("div");
    desc.className = "challenge-desc";
    const rewardText = ch.reward?.money ? `Reward: $${ch.reward.money}` : "Reward available";
    desc.textContent = `${rewardText} • Goal: ${ch.target}`;

    const progressBar = document.createElement("div");
    progressBar.className = "challenge-progress-bar";
    const bar = document.createElement("span");
    bar.style.width = `${ch.pct}%`;
    progressBar.appendChild(bar);

    const footer = document.createElement("div");
    footer.className = "challenge-footer";
    const status = document.createElement("div");
    status.textContent = ch.claimed
      ? "Claimed"
      : ch.completed
        ? "Completed - Claim Reward"
        : "In Progress";
    const progressText = document.createElement("div");
    progressText.textContent = `${ch.progress.toFixed(0)} / ${ch.target}`;
    footer.appendChild(status);
    footer.appendChild(progressText);

    row.appendChild(header);
    row.appendChild(desc);
    row.appendChild(progressBar);
    row.appendChild(footer);
    listEl.appendChild(row);
  });
}

function toggleChallengesPanel() {
  if (!challengesOverlay) return;
  const isOpen = challengesOverlay.classList.contains("visible");
  if (isOpen) {
    challengesOverlay.classList.remove("visible");
  } else {
    renderChallengesPanel();
    challengesOverlay.classList.add("visible");
  }
}

// ---------------- LIZARD MINI-GAME UI ----------------
let lizardOverlay = null;

function buildLizardPanel() {
  if (lizardOverlay) return;
  const overlay = document.createElement("div");
  overlay.className = "lizard-overlay";
  overlay.id = "lizard-overlay";

  const panel = document.createElement("div");
  panel.className = "lizard-panel";

  const closeBtn = document.createElement("button");
  closeBtn.className = "lizard-close";
  closeBtn.textContent = "X";

  const title = document.createElement("h3");
  title.className = "lizard-title";
  title.textContent = "Lizard Encounter";

  const imgWrap = document.createElement("div");
  imgWrap.className = "lizard-img-wrap";
  const img = document.createElement("img");
  img.className = "lizard-img";
  img.id = "lizard-img";
  img.src = "assets/lizard/lizard.png";
  img.alt = "Lizard";
  img.addEventListener("click", () => window.squashLizard && window.squashLizard());
  img.addEventListener("touchstart", (e) => { e.preventDefault(); window.squashLizard && window.squashLizard(); }, { passive: false });
  imgWrap.appendChild(img);

  const rewardBox = document.createElement("div");
  rewardBox.className = "lizard-reward-popup";
  rewardBox.id = "lizard-reward-popup";
  const rewardText = document.createElement("div");
  rewardText.id = "lizard-reward-text";
  const rewardActions = document.createElement("div");
  rewardActions.className = "lizard-reward-actions";
  const rewardClose = document.createElement("button");
  rewardClose.id = "lizard-reward-close-btn";
  rewardClose.textContent = "Close";
  rewardClose.addEventListener("click", () => window.closeLizardRewardPopup && window.closeLizardRewardPopup());
  rewardActions.appendChild(rewardClose);
  rewardBox.appendChild(rewardText);
  rewardBox.appendChild(rewardActions);

  panel.appendChild(closeBtn);
  panel.appendChild(title);
  panel.appendChild(imgWrap);
  panel.appendChild(rewardBox);
  overlay.appendChild(panel);
  document.body.appendChild(overlay);

  closeBtn.addEventListener("click", () => window.closeLizardRewardPopup && window.closeLizardRewardPopup());

  lizardOverlay = overlay;
  if (window.initLizardGame) window.initLizardGame();
}

window.addEventListener("templates:loaded", () => {
  initUIFixes();
});

// ---------------- BREAKDOWN MODAL ----------------
let breakdownOverlay = null;

function ensureBreakdownPanel() {
  if (breakdownOverlay) return breakdownOverlay;
  const overlay = document.createElement("div");
  overlay.className = "breakdown-overlay";
  overlay.id = "breakdown-overlay";

  const panel = document.createElement("div");
  panel.className = "breakdown-panel";

  const closeBtn = document.createElement("button");
  closeBtn.className = "breakdown-close";
  closeBtn.textContent = "X";
  closeBtn.addEventListener("click", () => window.abandonTrip && window.abandonTrip());

  const title = document.createElement("h3");
  title.className = "breakdown-title";
  title.textContent = "Breakdown Event";

  const desc = document.createElement("div");
  desc.className = "breakdown-desc";
  desc.id = "breakdown-desc";

  const cost = document.createElement("div");
  cost.className = "breakdown-cost";
  cost.id = "breakdown-cost";

  const actions = document.createElement("div");
  actions.className = "breakdown-actions";

  const payBtn = document.createElement("button");
  payBtn.className = "breakdown-btn pay";
  payBtn.textContent = "Pay for Roadside Service";
  payBtn.addEventListener("click", () => window.confirmRoadsideService && window.confirmRoadsideService());

  const abandonBtn = document.createElement("button");
  abandonBtn.className = "breakdown-btn abandon";
  abandonBtn.textContent = "Abandon Trip";
  abandonBtn.addEventListener("click", () => window.abandonTrip && window.abandonTrip());

  actions.appendChild(payBtn);
  actions.appendChild(abandonBtn);

  panel.appendChild(closeBtn);
  panel.appendChild(title);
  panel.appendChild(desc);
  panel.appendChild(cost);
  panel.appendChild(actions);
  overlay.appendChild(panel);
  document.body.appendChild(overlay);

  breakdownOverlay = overlay;
  return overlay;
}

window.showBreakdownUI = function (description, costValue) {
  const overlay = ensureBreakdownPanel();
  const descEl = overlay.querySelector("#breakdown-desc");
  const costEl = overlay.querySelector("#breakdown-cost");
  if (descEl) descEl.textContent = description || "Unexpected breakdown detected.";
  if (costEl) costEl.textContent = `Roadside service cost: $${costValue || 0}`;
  overlay.classList.add("visible");
};

window.hideBreakdownUI = function () {
  if (breakdownOverlay) {
    breakdownOverlay.classList.remove("visible");
  }
};

// ---------------- SAVE / LOAD PANEL ----------------
let saveLoadOverlay = null;

function buildSaveLoadPanel() {
  if (saveLoadOverlay) return saveLoadOverlay;
  const overlay = document.createElement("div");
  overlay.className = "save-overlay";
  overlay.id = "save-load-overlay";

  const panel = document.createElement("div");
  panel.className = "save-panel";

  const closeBtn = document.createElement("button");
  closeBtn.className = "save-close";
  closeBtn.textContent = "X";
  closeBtn.addEventListener("click", hideSaveLoadPanel);

  const title = document.createElement("h3");
  title.className = "save-title";
  title.textContent = "Save / Load";

  const slotsWrap = document.createElement("div");
  slotsWrap.className = "save-slots";
  slotsWrap.id = "save-slots-container";

  panel.appendChild(closeBtn);
  panel.appendChild(title);
  panel.appendChild(slotsWrap);
  overlay.appendChild(panel);
  document.body.appendChild(overlay);

  saveLoadOverlay = overlay;
  refreshSaveSlots();
  return overlay;
}

function saveSlotKey(idx) {
  return ["slot1", "slot2", "slot3"][idx] || "slot1";
}

function formatTimestamp(ts) {
  if (!ts) return "Never";
  const d = new Date(ts);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
}

function refreshSaveSlots() {
  const container = document.getElementById("save-slots-container");
  if (!container) return;
  const slots = typeof window.listSlots === "function" ? window.listSlots() : [];
  container.innerHTML = "";
  for (let i = 0; i < 3; i++) {
    const info = slots[i] || null;
    const row = document.createElement("div");
    row.className = "save-row";

    const meta = document.createElement("div");
    meta.className = "save-meta";
    const label = document.createElement("div");
    label.className = "save-label";
    label.textContent = `Slot ${i + 1}`;
    const status = document.createElement("div");
    status.className = "save-status";
    if (!info) {
      status.textContent = "Empty Slot";
    } else {
      status.innerHTML = `Last Saved: ${formatTimestamp(info.savedAt)}<br/>City: ${info.cityName || "Unknown"}<br/>Money: $${info.money ?? 0}`;
    }
    meta.appendChild(label);
    meta.appendChild(status);

    const actions = document.createElement("div");
    actions.className = "save-actions";
    const saveBtn = document.createElement("button");
    saveBtn.className = "save-btn";
    saveBtn.textContent = "Save";
    saveBtn.addEventListener("click", () => {
      if (typeof window.saveGame === "function") {
        window.saveGame(saveSlotKey(i));
        refreshSaveSlots();
      }
    });
    const loadBtn = document.createElement("button");
    loadBtn.className = "save-btn";
    loadBtn.textContent = "Load";
    loadBtn.addEventListener("click", () => {
      if (typeof window.loadGame === "function") {
        window.loadGame(saveSlotKey(i));
        hideSaveLoadPanel();
      }
    });
    actions.appendChild(saveBtn);
    actions.appendChild(loadBtn);

    row.appendChild(meta);
    row.appendChild(actions);
    container.appendChild(row);
  }
}

function showSaveLoadPanel() {
  const overlay = buildSaveLoadPanel();
  refreshSaveSlots();
  overlay.classList.add("visible");
  document.body.classList.add("menu-open");
}

function hideSaveLoadPanel() {
  if (saveLoadOverlay) {
    saveLoadOverlay.classList.remove("visible");
  }
  document.body.classList.remove("menu-open");
}

window.showSaveLoadPanel = showSaveLoadPanel;
window.hideSaveLoadPanel = hideSaveLoadPanel;
