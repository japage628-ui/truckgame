// ==============================================
// ui.js — HUD + Panels (v1.0.0 REALISM PATCH)
// ==============================================

console.log("%c[UI] Loaded.", "color:#5F5;");

function styleTopButtons() {
  const menuBtn = document.getElementById("main-menu-btn");
  const challengeBtn = document.getElementById("challenge-btn");
  if (!menuBtn || !challengeBtn) return;
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

function renderJobBoard() {
  const panel = document.getElementById("job-list-panel");
  const list = document.getElementById("job-list");
  if (!panel || !list) return;
  const tpl = document.getElementById("job-template");
  const jobs = window.getCurrentJobs ? window.getCurrentJobs() : [];
  const state = window.getGameState ? window.getGameState() : "START";
  if (state !== "CITY") {
    panel.classList.add("hidden");
    return;
  }
  panel.classList.remove("hidden");
  list.innerHTML = "";
  jobs.forEach((job) => {
    let row;
    if (tpl && tpl.content) {
      row = tpl.content.cloneNode(true);
    } else {
      row = document.createElement("div");
      row.className = "job-item";
      const text = document.createElement("div");
      text.className = "job-text";
      const btn = document.createElement("button");
      btn.className = "job-select-btn";
      btn.type = "button";
      btn.textContent = "Select";
      row.appendChild(text);
      row.appendChild(btn);
    }
    const destEl = row.querySelector(".job-dest");
    const distEl = row.querySelector(".job-distance");
    const weightEl = row.querySelector(".job-weight");
    const payEl = row.querySelector(".job-pay");
    const btn = row.querySelector(".job-select-btn");
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
          panel.classList.add("hidden");
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
});
