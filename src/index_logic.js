(function () {
  let listenersAttached = false;
  let refuelBtn = null;
  let startTapAttached = false;

  function isMobile() {
    return window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
  }

  function sendKey(key) {
    const evt = new KeyboardEvent("keydown", { key, bubbles: true });
    window.dispatchEvent(evt);
  }

  function toggleRefuel() {
    if (!refuelBtn) return;
    if (!refuelBtn) return;
    const state = window.getGameState ? window.getGameState() : "START";
    const show = isMobile() && state === "CITY";
    refuelBtn.style.display = show ? "block" : "none";
  }

  function attachHandlers() {
    if (listenersAttached) return;

    refuelBtn = document.getElementById("mobile-refuel-btn");
    const mainMenuBtn = document.getElementById("main-menu-btn");
    const challengeBtn = document.getElementById("challenge-btn");

    if (refuelBtn) {
      refuelBtn.addEventListener("click", (e) => {
        e.preventDefault();
        sendKey("r");
      });
    }

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

    listenersAttached = !!(mainMenuBtn || challengeBtn || refuelBtn);
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
  }

  document.addEventListener("DOMContentLoaded", () => {
    tick();
    setInterval(tick, 500);
  });

  window.addEventListener("templates:loaded", tick);
})();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js")
      .then(reg => console.log("SW registered:", reg.scope))
      .catch(err => console.warn("SW failed:", err));
  });
}
