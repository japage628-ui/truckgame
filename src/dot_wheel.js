// dot_wheel.js - DOT Random Intervention Wheel (HUD hybrid)

const DOT_WHEEL_OUTCOMES = [
  { name: "BYPASS",         effect: "rep_plus",    weight: 25, desc: "Bypass granted. Smooth sailing." },
  { name: "LEVEL 2",        effect: "delay_minor", weight: 20, desc: "Minor inspection. Light delay." },
  { name: "LEVEL 1",        effect: "delay_major", weight: 15, desc: "Full inspection. Major delay risk." },
  { name: "WARNING",        effect: "rep_minus",   weight: 15, desc: "Written warning on file." },
  { name: "TICKET",         effect: "fine",        weight: 10, desc: "Citation issued. Wallet hit." },
  { name: "BONUS PAY",      effect: "bonus_cash",  weight: 5,  desc: "DOT loves you. Bonus payout." },
  { name: "CHECKPOINT",     effect: "nuisance",    weight: 5,  desc: "Random checkpoint. Time wasted." },
  { name: "OUT OF SERVICE", effect: "big_penalty", weight: 5,  desc: "Out-of-service order. Big trouble." }
];

(function () {
  const overlay   = document.getElementById("dot-wheel-overlay");
  const wheelCan  = document.getElementById("dot-wheel-canvas");
  const spinBtn   = document.getElementById("dot-spin-btn");
  const resultEl  = document.getElementById("dot-result-line");
  const closeBtn  = document.getElementById("dot-close-btn");
  const rewardPopup = document.getElementById("dot-reward-popup");
  const rewardTextEl = document.getElementById("dot-reward-text");
  const collectBtn = document.getElementById("dot-collect-btn");

  if (!overlay || !wheelCan || !spinBtn || !resultEl) {
    console.warn("[DOT WHEEL] Overlay elements not found.");
    return;
  }

  const ctx = wheelCan.getContext("2d");
  const centerX = wheelCan.width / 2;
  const centerY = wheelCan.height / 2;
  const radius  = Math.min(centerX, centerY) - 10;

  let isActive = false;
  let isSpinning = false;
  let angle = 0;
  let targetAngle = 0;
  let spinTime = 0;
  let spinDuration = 0;
  let chosenOutcome = null;
  let rewardPending = false;

  function weightedPick() {
    const total = DOT_WHEEL_OUTCOMES.reduce((s, o) => s + o.weight, 0);
    let r = Math.random() * total;
    for (const o of DOT_WHEEL_OUTCOMES) {
      if (r < o.weight) return o;
      r -= o.weight;
    }
    return DOT_WHEEL_OUTCOMES[0];
  }

  function openOverlay() {
    overlay.classList.remove("dot-hidden");
    isActive = true;
    isSpinning = false;
    rewardPending = false;
    resultEl.textContent = "Press SPIN to begin automated inspection...";
    if (rewardPopup) rewardPopup.style.display = "none";
    if (closeBtn) closeBtn.disabled = false;
  }

  function closeOverlay() {
    overlay.classList.add("dot-hidden");
    isActive = false;
  }

  function startSpin() {
    if (!isActive || isSpinning || rewardPending) return;

    chosenOutcome = weightedPick();
    rewardPending = false;
    if (rewardPopup) rewardPopup.style.display = "none";
    if (closeBtn) closeBtn.disabled = false;

    const slice = (Math.PI * 2) / DOT_WHEEL_OUTCOMES.length;
    const index = DOT_WHEEL_OUTCOMES.indexOf(chosenOutcome);

    const baseTarget = -Math.PI / 2 - index * slice;

    const extraTurns = 3.5 + Math.random() * 1.2;
    targetAngle = baseTarget + extraTurns * Math.PI * 2;

    spinTime = 0;
    spinDuration = 4.6 + Math.random() * 1.2;
    isSpinning = true;
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function updateWheel(dt) {
    if (!isActive || !isSpinning) return;

    spinTime += dt;
    let t = spinTime / spinDuration;
    if (t >= 1) {
      t = 1;
    }

    const eased = easeOutCubic(t);
    angle = targetAngle * eased;

    if (t >= 1) {
      isSpinning = false;
      finalizeOutcome(chosenOutcome);
    }

    drawWheel();
  }

  function drawWheel() {
    ctx.clearRect(0, 0, wheelCan.width, wheelCan.height);

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(angle);

    const slice = (Math.PI * 2) / DOT_WHEEL_OUTCOMES.length;

    DOT_WHEEL_OUTCOMES.forEach((o, i) => {
      const start = i * slice;
      const end = start + slice;

      const baseHue = 190;
      const hue = baseHue + i * 6;

      const grad = ctx.createRadialGradient(0, 0, radius * 0.15, 0, 0, radius);
      grad.addColorStop(0, `hsla(${hue}, 80%, 60%, 0.9)`);
      grad.addColorStop(1, `hsla(${hue}, 80%, 30%, 0.75)`);

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, start, end);
      ctx.closePath();

      ctx.fillStyle = grad;
      ctx.fill();

      ctx.strokeStyle = "rgba(0,255,255,0.9)";
      ctx.lineWidth = 1;
      ctx.stroke();

      const mid = start + slice / 2;
      const textRadius = radius * 0.62;
      ctx.save();
      ctx.rotate(mid);
      ctx.translate(textRadius, 0);
      ctx.rotate(Math.PI / 2);
      ctx.fillStyle = "#001318";
      ctx.font = "11px monospace";
      ctx.textAlign = "center";
      ctx.fillText(o.name, 0, 4);
      ctx.restore();
    });

    ctx.restore();

    // center hub
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.fillStyle = "rgba(0,0,0,0.95)";
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.32, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(0,255,255,0.8)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#7dfff7";
    ctx.font = "11px monospace";
    ctx.textAlign = "center";
    ctx.fillText("DOT", 0, -4);
    ctx.fillText("WHEEL", 0, 10);
    ctx.restore();

    // top pointer
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.fillStyle = "#fffbcc";
    ctx.beginPath();
    ctx.moveTo(0, -radius - 6);
    ctx.lineTo(-8, -radius - 26);
    ctx.lineTo(8, -radius - 26);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function dotViolationChance() {
    const ups = window.getUpgrades?.();
    const level = ups?.tires || 1;
    const chance = 1 - level * 0.10;
    return Math.max(0, Math.min(1, chance));
  }

  function shouldFlagViolation() {
    return Math.random() < dotViolationChance();
  }

  function applyOutcome(outcome) {
    const stats = window.getPlayerStats?.();
    if (!stats) return "";

    let msg = "";
    const markViolation = () => {
      window.__dotViolationThisJob = true;
      if (typeof window.Challenges?.recordViolation === "function") {
        window.Challenges.recordViolation();
      }
    };
    switch (outcome.effect) {
      case "rep_plus":
        stats.dotReputation = Math.min(100, stats.dotReputation + 6);
        msg = "Bypass: DOT rep boosted.";
        break;
      case "delay_minor":
        msg = "Minor inspection: short delay.";
        break;
      case "delay_major":
        msg = "Level 1 inspection: big delay.";
        break;
      case "rep_minus":
        stats.dotReputation = Math.max(0, stats.dotReputation - 4);
        msg = "Warning on file. Watch it.";
        if (shouldFlagViolation()) markViolation();
        break;
      case "fine":
        {
          const fine = 80 + (Math.random() * 120) | 0;
          stats.money = Math.max(0, stats.money - fine);
          msg = "Ticket issued: -$" + fine;
        }
        if (shouldFlagViolation()) markViolation();
        break;
      case "bonus_cash":
        {
          const bonus = 120 + (Math.random() * 180) | 0;
          stats.money += bonus;
          msg = "DOT bonus payout: +$" + bonus;
        }
        break;
      case "nuisance":
        msg = "Checkpoint only. Time wasted, no ticket.";
        break;
      case "big_penalty":
        {
          const fine = 200 + (Math.random() * 300) | 0;
          stats.money = Math.max(0, stats.money - fine);
          stats.dotReputation = Math.max(0, stats.dotReputation - 10);
          msg = "Out-of-service penalty: -$" + fine;
        }
        if (shouldFlagViolation()) markViolation();
        break;
    }

    window.setMessage?.(msg, 3);
    resultEl.textContent = outcome.name + " - " + outcome.desc;
    return msg || outcome.name;
  }

  function finalizeOutcome(outcome) {
    const rewardMsg = applyOutcome(outcome);
    const rewardLabel = outcome?.name || rewardMsg || "Reward ready";
    rewardPending = true;
    angle = targetAngle;
    drawWheel();
    showRewardPopup(rewardLabel);
  }

  spinBtn.addEventListener("click", (e) => {
    e.preventDefault();
    startSpin();
  });

  spinBtn.addEventListener("touchstart", (e) => {
    e.preventDefault();
    startSpin();
  });

  function showRewardPopup(text) {
    if (!rewardPopup || !rewardTextEl) return;
    rewardTextEl.textContent = "You won: " + text;
    rewardPopup.style.display = "block";
    if (closeBtn) closeBtn.disabled = true;
  }

  function finishWheel(forceClose = false) {
    if (rewardPending && !forceClose) return;
    rewardPending = false;
    if (rewardPopup) rewardPopup.style.display = "none";
    if (closeBtn) closeBtn.disabled = false;
    closeOverlay();
    const activeJob = window.getActiveJob?.();
    const nextState = activeJob ? "DRIVING" : "CITY";
    if (typeof window.__setGameStateFromDot === "function") {
      window.__setGameStateFromDot(nextState);
    }
  }

  if (collectBtn) {
    collectBtn.addEventListener("click", (e) => {
      e.preventDefault();
      finishWheel(true);
    });
    collectBtn.addEventListener("touchstart", (e) => {
      e.preventDefault();
      finishWheel(true);
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      finishWheel();
    });
    closeBtn.addEventListener("touchstart", (e) => {
      e.preventDefault();
      finishWheel();
    });
  }

  // Public hooks for engine
  window.startDotWheel = function () {
    openOverlay();
    angle = 0;
    drawWheel();
  };

  window.updateDotWheel = function (dt) {
    if (!isActive) return;
    updateWheel(dt);
  };
})();


