// ===========================================================
// render.js - world, HUD, sky, parallax, overlays (v1.0.0)
// ===========================================================

// --- Canvas setup -------------------------------------------------
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// expose for ui.js
window.canvas = canvas;
window.ctx = ctx;

let hudPanel = { x: 0, y: 0, w: 0, h: 0 };
let garageBtnRect = { x: 0, y: 0, w: 28, h: 28 };
let garageOpen = false;
let upgradeMenuRects = [];
window.__mouseX = 0;
window.__mouseY = 0;

function pointInRect(p, r) {
  return p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
}

function getCanvasCoords(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY
  };
}

canvas.addEventListener("mousemove", (e) => {
  const pos = getCanvasCoords(e);
  window.__mouseX = pos.x;
  window.__mouseY = pos.y;
});

canvas.addEventListener("click", (e) => {
  const pos = getCanvasCoords(e);

  // garage toggle
  if (pointInRect(pos, garageBtnRect)) {
    garageOpen = !garageOpen;
    return;
  }

  // upgrades menu clicks
  if (garageOpen && upgradeMenuRects.length) {
    const hit = upgradeMenuRects.find(r => pointInRect(pos, r));
    if (hit && typeof window.purchaseUpgrade === "function") {
      window.purchaseUpgrade(hit.name);
    }
  }
});

function resizeCanvas() {
  const baseW = 960;
  const baseH = 540;
  const maxW = window.innerWidth;
  const maxH = window.innerHeight;

  const scale = Math.min(maxW / baseW, maxH / baseH);

  canvas.width = baseW;
  canvas.height = baseH;
  canvas.style.width = baseW * scale + "px";
  canvas.style.height = baseH * scale + "px";
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// --- Main draw / loop --------------------------------------------

let lastTime = performance.now();

function gameLoop(ts) {
  const dt = (ts - lastTime) / 1000;
  lastTime = ts;

  if (typeof window.update === "function") {
    window.update(dt);
  }
  if (typeof window.updateDotWheel === "function") {
    window.updateDotWheel(dt);
  }

  drawFrame();
  requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);

function drawFrame() {
  const state = window.getGameState ? window.getGameState() : "START";
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // always draw background world
  drawWorldLayer();

  if (state === "START") {
    drawStartScreen();
    return;
  }

  if (state === "CITY") {
    drawCityLayer();
  }

  // HUD is visible in CITY and DRIVING
  if (state === "CITY" || state === "DRIVING") {
    if (typeof drawHudPanel === "function") {
      drawHudPanel();
    }
    if (typeof drawHudStats === "function") {
      drawHudStats();
    }
    if (garageOpen && typeof drawGarageMenu === "function") {
      drawGarageMenu();
    }
  }

}

// ===========================================================
// WORLD LAYER
// ===========================================================

let truckImg = new Image();
let truckLoaded = false;
truckImg.src = "assets/sprites/truck_side.png";
truckImg.onload = () => { truckLoaded = true; };

function drawWorldLayer() {
  const cities = window.getCities ? window.getCities() : null;
  const cityId = window.getCurrentCityId ? window.getCurrentCityId() : 0;
  const city = cities && cities[cityId] ? cities[cityId] : null;
  const region = city && city.region ? city.region : "plains";
  const scroll = window.getWorldScroll ? window.getWorldScroll() : 0;
  const state = window.getGameState ? window.getGameState() : "START";

  const driving = state === "DRIVING";
  if (typeof window.drawBackgroundParallax === "function") {
    window.drawBackgroundParallax(ctx, canvas, region, scroll, driving);
  }

  drawWeatherOverlay();
  drawRoad();
  drawTruck();
}

// --- Parallax background ------------------------------------------

function drawRoad() {
  const w = canvas.width;
  const h = canvas.height;
  const top = h * 0.8;
  const hgt = h * 0.2;

  const grad = ctx.createLinearGradient(0, top, 0, top + hgt);
  grad.addColorStop(0, "#3b3b3c");
  grad.addColorStop(1, "#1a1a1c");
  ctx.fillStyle = grad;
  ctx.fillRect(0, top, w, hgt);

  ctx.strokeStyle = "#ffd55c";
  ctx.setLineDash([40, 40]);
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, top + hgt * 0.4);
  ctx.lineTo(w, top + hgt * 0.4);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawTruck() {
  const w = canvas.width;
  const h = canvas.height;
  const roadTop = h * 0.8;

  const baseX = w * 0.18;
  const t = performance.now() / 1000;
  const bounce = Math.sin(t * 3) * 2.5;

  const desiredWidth = w * 0.35;
  const scale = truckLoaded ? desiredWidth / truckImg.width : 1;
  const dw = truckLoaded ? truckImg.width * scale : desiredWidth;
  const dh = truckLoaded ? truckImg.height * scale : 90;
  const y = roadTop - dh * 0.45 + bounce;

  // truck cab or sprite
  if (truckLoaded) {
    ctx.drawImage(truckImg, baseX, y, dw, dh);
  } else {
    const cabGrad = ctx.createLinearGradient(baseX, y, baseX, y + dh);
    cabGrad.addColorStop(0, "#8fd5ff");
    cabGrad.addColorStop(1, "#4a8bb5");
    ctx.fillStyle = cabGrad;
    ctx.fillRect(baseX, y, dw, dh * 0.65);
    ctx.fillStyle = "#2c3e50";
    ctx.fillRect(baseX + dw * 0.55, y + dh * 0.2, dw * 0.35, dh * 0.25);
  }

  // wheels (only for placeholder draw)
  if (!truckLoaded) {
    const wheelY = roadTop - 10;
    const wheelPositions = [
      baseX + dw * 0.18,
      baseX + dw * 0.48
    ];
    ctx.fillStyle = "#111";
    wheelPositions.forEach(wx => {
      ctx.beginPath();
      ctx.arc(wx, wheelY, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ccc";
      ctx.beginPath();
      ctx.arc(wx, wheelY, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#111";
    });
  }
}

// --- Weather overlay ---------------------------------------------

function drawWeatherOverlay() {
  const weather = window.getWeather ? window.getWeather() : "clear";
  const w = canvas.width;
  const h = canvas.height;
  if (!weather || weather === "clear") return;

  if (weather === "rain" || weather === "storm") {
    ctx.save();
    ctx.globalAlpha = weather === "storm" ? 0.32 : 0.25;
    ctx.strokeStyle = "rgba(200,220,255,0.7)";
    ctx.lineWidth = 1;
    const t = performance.now() / 16;
    for (let i = 0; i < 80; i++) {
      const x = ((i * 37) + t) % w;
      const y = ((i * 97) + t * 4) % h;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 6, y + 12);
      ctx.stroke();
    }
    ctx.restore();
  } else if (weather === "snow") {
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = "#FFFFFF";
    const t = performance.now() / 40;
    for (let i = 0; i < 70; i++) {
      const x = ((i * 53) + t) % w;
      const y = ((i * 89) + t * 1.5) % h;
      ctx.fillRect(x, y, 2, 2);
    }
    ctx.restore();
  } else if (weather === "fog") {
    ctx.save();
    const fog = ctx.createLinearGradient(0, 0, 0, h);
    fog.addColorStop(0, "rgba(255,255,255,0.08)");
    fog.addColorStop(1, "rgba(255,255,255,0.22)");
    ctx.fillStyle = fog;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
}

// ===========================================================
// HUD + GARAGE
// ===========================================================

function drawHudPanel() {
  const boxW = 230;
  const boxH = 240;
  const x = canvas.width - boxW - 16;
  const y = 16;
  hudPanel = { x, y, w: boxW, h: boxH };

  ctx.fillStyle = "rgba(0,0,0,0.72)";
  ctx.fillRect(x, y, boxW, boxH);
  ctx.strokeStyle = "#FFFFFF";
  ctx.strokeRect(x, y, boxW, boxH);

  drawGarageButton();
}

function drawGarageButton() {
  garageBtnRect.w = 28;
  garageBtnRect.h = 28;
  garageBtnRect.x = hudPanel.x + hudPanel.w - garageBtnRect.w - 10;
  garageBtnRect.y = hudPanel.y + 10;

  ctx.fillStyle = garageOpen ? "#2fa36a" : "#1c1c1c";
  ctx.fillRect(garageBtnRect.x, garageBtnRect.y, garageBtnRect.w, garageBtnRect.h);
  ctx.strokeStyle = "#FFFFFF";
  ctx.strokeRect(garageBtnRect.x, garageBtnRect.y, garageBtnRect.w, garageBtnRect.h);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "16px monospace";
  ctx.fillText("G", garageBtnRect.x + 8, garageBtnRect.y + 19);
}

function drawHudStats() {
  const stats = window.getPlayerStats ? window.getPlayerStats() : null;
  const cities = window.getCities ? window.getCities() : null;
  const cityId = window.getCurrentCityId ? window.getCurrentCityId() : 0;
  const city = cities && cities[cityId] ? cities[cityId] : null;
  const msg = window.getMessage ? window.getMessage() : "";
  if (!stats || !city) return;

  const x = hudPanel.x + 14;
  let y = hudPanel.y + 38;
  const barW = hudPanel.w - 28;

  ctx.fillStyle = "#C8E6FF";
  ctx.font = "18px monospace";
  ctx.fillText("City: " + city.name, x, y);

  y += 26;
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText("Money: $" + stats.money, x, y);

  y += 22;
  ctx.fillText("Jobs: " + stats.jobsDelivered, x, y);

  if (window.getGameState && window.getGameState() === "DRIVING") {
    y += 22;
    ctx.fillStyle = "#A9FFBF";
    const miles = Math.max(0, Math.round(window.getMilesRemaining ? window.getMilesRemaining() : 0));
    ctx.fillText("Miles left: " + miles, x, y);

    y += 18;
    const pct = window.getProgressPercent ? window.getProgressPercent() : 0;
    ctx.strokeStyle = "#FFFFFF";
    ctx.strokeRect(x, y, barW, 10);
    ctx.fillStyle = "#53FF88";
    ctx.fillRect(x, y, (barW * pct) / 100, 10);
    y += 18;
  }

  drawBar(x, y, barW, "Truck", stats.truckHealth, "#53FF88"); y += 22;
  drawBar(x, y, barW, "Engine", stats.engineHealth, "#FFE066"); y += 22;
  drawBar(x, y, barW, "Tires", stats.tireHealth, "#FF6B6B"); y += 22;
  drawBar(x, y, barW, "DOT", stats.dotReputation, "#4DA6FF"); y += 22;

  const fuelPct = Math.round(window.getFuelPercent ? window.getFuelPercent() : 0);
  ctx.fillStyle = "#FFD6A5";
  ctx.fillText("Fuel: " + fuelPct + "%", x, y);
  y += 22;

  ctx.fillStyle = "#FFD6A5";
  ctx.fillText("Weather: " + stats.activeWeather, x, y);
  y += 22;

  if (msg) {
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "14px monospace";
    ctx.fillText(msg, x, y);
  }
}

function drawBar(x, y, w, label, value, color) {
  const clamped = Math.max(0, Math.min(100, value || 0));
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "14px monospace";
  ctx.fillText(label, x, y);

  const bx = x + 64;
  const by = y - 12;
  const bw = w - 64;

  ctx.strokeStyle = "#FFFFFF";
  ctx.strokeRect(bx, by, bw, 12);
  ctx.fillStyle = color;
  ctx.fillRect(bx, by, (bw * clamped) / 100, 12);
}

function drawGarageMenu() {
  const upgrades = window.getUpgrades ? window.getUpgrades() : null;
  const costMap = window.GameData ? window.GameData.upgradeCosts : null;
  if (!upgrades || !costMap) return;

  const names = Object.keys(costMap);
  if (!names.length) return;

  const menuW = 230;
  const menuX = Math.max(16, hudPanel.x - menuW - 10);
  const menuY = hudPanel.y;
  const itemH = 30;
  const menuH = 44 + names.length * itemH;
  upgradeMenuRects = [];

  ctx.fillStyle = "rgba(0,0,0,0.78)";
  ctx.fillRect(menuX, menuY, menuW, menuH);
  ctx.strokeStyle = "#FFFFFF";
  ctx.strokeRect(menuX, menuY, menuW, menuH);

  ctx.fillStyle = "#C8E6FF";
  ctx.font = "16px monospace";
  ctx.fillText("Garage", menuX + 12, menuY + 22);

  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    const level = upgrades[name] || 1;
    const costs = costMap[name] || [];
    const nextCost = costs[level - 1];
    const status = nextCost ? "$" + nextCost : "MAX";
    const isMax = !nextCost;
    const lineY = menuY + 44 + i * itemH;

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "14px monospace";
    ctx.fillText(name + " L" + level, menuX + 12, lineY);

    ctx.fillStyle = isMax ? "#999999" : "#A9FFBF";
    ctx.fillText(status, menuX + menuW - 90, lineY);

    // small level indicator bar
    const totalLevels = costs.length + 1;
    const pct = Math.min(1, level / totalLevels);
    ctx.strokeStyle = "#FFFFFF";
    ctx.strokeRect(menuX + 12, lineY + 6, menuW - 24, 8);
    ctx.fillStyle = "#4DA6FF";
    ctx.fillRect(menuX + 12, lineY + 6, (menuW - 24) * pct, 8);

    if (!isMax) {
      upgradeMenuRects.push({
        name,
        x: menuX + 8,
        y: lineY - 16,
        w: menuW - 16,
        h: itemH - 6
      });
    }
  }
}

// ===========================================================
// CITY & DOT RENDERING
// ===========================================================

function drawCityLayer() {
  const cities = window.getCities ? window.getCities() : null;
  const cid = window.getCurrentCityId ? window.getCurrentCityId() : 0;
  const city = cities && cities[cid] ? cities[cid] : null;
  const jobs = window.getCurrentJobs ? window.getCurrentJobs() : [];

  const w = canvas.width;
  const h = canvas.height;

  // left city/job panel
  ctx.fillStyle = "rgba(0,0,0,0.8)";
  ctx.fillRect(50, 50, w * 0.55, h * 0.55);
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 2;
  ctx.strokeRect(50, 50, w * 0.55, h * 0.55);

  ctx.fillStyle = "#C8E6FF";
  ctx.font = "20px monospace";
  const cityName = city ? city.name : "Unknown";
  ctx.fillText("City: " + cityName, 70, 80);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "16px monospace";
  ctx.fillText("Jobs (press 1-4):", 70, 115);

  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    if (!job) continue;
    const destName =
      cities && cities[job.destId] ? cities[job.destId].name : "???";
    const line = `${i + 1}) To ${destName} | ${job.distanceTotal} mi | ${job.weight} | $${job.payout}`;
    ctx.fillText(line, 70, 145 + i * 28);
  }

  ctx.fillStyle = "#A9FFBF";
  ctx.font = "14px monospace";
  ctx.fillText("Press R to refuel while in city.", 70, 145 + jobs.length * 28 + 40);
}

// ===========================================================
// START SCREEN
// ===========================================================

function drawStartScreen() {
  const w = canvas.width;
  const h = canvas.height;

  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "32px monospace";
  ctx.fillText("TRUCK GAME", w * 0.33, h * 0.40);

  ctx.font = "18px monospace";
  ctx.fillText("Press any key to start", w * 0.30, h * 0.50);
}
