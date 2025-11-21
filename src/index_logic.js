(function () {
  let listenersAttached = false;
  let refuelBtn = null;
  let startTapAttached = false;
  let breakdownScriptLoaded = false;
  let saveSystemLoaded = false;

  function isMobile() {
    return window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
  }

  function sendKey(key) {
    const evt = new KeyboardEvent("keydown", { key, bubbles: true });
    window.dispatchEvent(evt);
  }

  function toggleRefuel() {
    return;
  }

  function attachHandlers() {
    if (listenersAttached) return;

    const mainMenuBtn = document.getElementById("main-menu-btn");
    const challengeBtn = document.getElementById("challenge-btn");

    if (mainMenuBtn) {
      mainMenuBtn.addEventListener("click", (e) => {
        e.preventDefault();
        ["main-menu-overlay", "load-menu-overlay", "settings-overlay", "credits-overlay"].forEach((id) => {
          const el = document.getElementById(id);
          if (!el) return;
          if (id === "main-menu-overlay") {
            el.classList.add("visible");
          } else {
            el.classList.remove("visible");
          }
        });
        document.body.classList.add("menu-open");
      });
    }

    if (challengeBtn) {
      challengeBtn.addEventListener("click", () => {
        const modal = document.getElementById("challenge-modal");
        if (modal) modal.classList.add("visible");
      });
    }

    listenersAttached = !!(mainMenuBtn || challengeBtn);
  }

  function ensureBreakdownScript() {
    if (breakdownScriptLoaded) return;
    const script = document.createElement("script");
    script.src = "src/breakdown.js";
    script.async = false;
    document.head.appendChild(script);
    breakdownScriptLoaded = true;
  }

  function ensureSaveSystemScript() {
    if (saveSystemLoaded) return;
    const script = document.createElement("script");
    script.src = "src/save_system.js";
    script.async = false;
    document.head.appendChild(script);
    saveSystemLoaded = true;
  }

  function attachStartTap() {
    if (startTapAttached) return;
    const tapHandler = (e) => {
      const state = typeof window.getGameState === "function" ? window.getGameState() : "START";
      if (state === "START") {
        const evt = new KeyboardEvent("keydown", { key: "Enter", bubbles: true });
        window.dispatchEvent(evt);
        e.preventDefault();
      }
    };
    document.addEventListener("pointerdown", tapHandler, { passive: false });
    startTapAttached = true;
  }

function tick() {
  attachHandlers();
  toggleRefuel();
  attachStartTap();
  ensureBreakdownScript();
  ensureSaveSystemScript();
}

document.addEventListener("DOMContentLoaded", () => {
  tick();
  setInterval(tick, 500);
});

document.addEventListener("keydown", (e) => {
  if (e.key === "j") {
    const board = document.getElementById("job-board-dropdown");
    board?.classList.toggle("open");
  }
});

window.addEventListener("templates:loaded", tick);

document.addEventListener("DOMContentLoaded", () => {

  const mainIcon = document.getElementById("btn-mainmenu");
  if (mainIcon) {
    mainIcon.innerHTML = '<img src="assets/icons/home_icon.png" class="menu-icon">';
  }

  const jobsIcon = document.getElementById("btn-jobs");
  if (jobsIcon) {
    jobsIcon.innerHTML = '<img src="assets/icons/clipboard_icon.png" class="menu-icon">';
  }

  const settingsIcon = document.getElementById("btn-settings");
  if (settingsIcon) {
    settingsIcon.innerHTML = '<img src="assets/icons/gear_icon.png" class="menu-icon">';
  }

  const mapIcon = document.getElementById("btn-map");
  if (mapIcon) {
    mapIcon.innerHTML = '<img src="assets/icons/pin_icon.jpg" class="menu-icon">';
  }

  const btnMain = document.getElementById("btn-mainmenu");
  const btnJobs = document.getElementById("btn-jobs");
  const btnSet = document.getElementById("btn-settings");
  const btnMap = document.getElementById("btn-map");

  // Main Menu Panel
  if (btnMain) btnMain.onclick = () => {
    const menu = document.getElementById("start-screen-container");
    if (menu) menu.classList.remove("hidden");
  };

  // Job Board
  if (btnJobs) btnJobs.onclick = () => {
    const jb = document.getElementById("job_board_container");
    if (jb) jb.classList.toggle("hidden");
  };

  // Settings Overlay
  if (btnSet) btnSet.onclick = () => {
    const s = document.getElementById("settings-overlay");
    if (s) s.classList.toggle("hidden");
  };

  // Minimap Toggle
  if (btnMap) btnMap.onclick = () => {
    const mm = document.getElementById("minimap-container");
    if (mm) mm.classList.toggle("hidden");
  };

  // Refuel
  const btnRefuel = document.getElementById("refuel-btn");
  if (btnRefuel) btnRefuel.addEventListener("click", () => {
    sendKey("r");
  });

});
})();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js")
      .then(reg => console.log("SW registered:", reg.scope))
      .catch(err => console.warn("SW failed:", err));
  });
}
