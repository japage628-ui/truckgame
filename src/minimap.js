// minimap.js - lightweight mini-map overlay for truck position
const usaMap = new Image();
usaMap.src = "assets/maps/usa_map.png";

(function () {
  function init() {
    const canvas = document.getElementById("mini-map-canvas");
    if (!canvas) {
      return false;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.warn("[MINIMAP] Canvas context missing; minimap disabled.");
      return true;
    }

  const MIN_LON = -125;
  const MAX_LON = -66;
  const MIN_LAT = 24;
  const MAX_LAT = 50;
  let mapReady = usaMap.complete && usaMap.naturalWidth > 0;
  usaMap.onload = () => {
    mapReady = true;
    redraw();
  };
  usaMap.onerror = () => {
    mapReady = false;
    redraw();
  };

  let lastLat = null;
  let lastLon = null;

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function project(lat, lon) {
    const xNorm = (clamp(lon, MIN_LON, MAX_LON) - MIN_LON) / (MAX_LON - MIN_LON);
    const yNorm = (clamp(lat, MIN_LAT, MAX_LAT) - MIN_LAT) / (MAX_LAT - MIN_LAT);

    const x = xNorm * canvas.width;
    const y = (1 - yNorm) * canvas.height;

    return { x, y };
  }

  function drawMapBase() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (mapReady) {
      const scale = Math.min(canvas.width / usaMap.width, canvas.height / usaMap.height);
      const drawW = usaMap.width * scale;
      const drawH = usaMap.height * scale;
      const dx = (canvas.width - drawW) / 2;
      const dy = (canvas.height - drawH) / 2;
      ctx.globalAlpha = 0.9;
      ctx.drawImage(usaMap, dx, dy, drawW, drawH);
      ctx.globalAlpha = 1;
    }
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);
  }

  function drawDot() {
    if (lastLat == null || lastLon == null) return;
    const pos = project(lastLat, lastLon);
    ctx.save();
    ctx.fillStyle = "#2fa36a";
    ctx.strokeStyle = "rgba(0,0,0,0.65)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  function redraw() {
    drawMapBase();
    drawDot();
  }

  window.updateMiniMap = function updateMiniMap(lat, lon) {
    if (typeof lat !== "number" || typeof lon !== "number") return;
    lastLat = lat;
    lastLon = lon;
    redraw();
  };

    // Initialize with current city if available
    if (typeof window.getCities === "function" && typeof window.getCurrentCityId === "function") {
      const cities = window.getCities();
      const cid = window.getCurrentCityId();
      if (cities && cities[cid]) {
        lastLat = cities[cid].lat;
        lastLon = cities[cid].lon;
        redraw();
      }
    }
    return true;
  }

  if (!init()) {
    window.addEventListener("templates:loaded", () => {
      init();
    }, { once: true });
  }
})();
