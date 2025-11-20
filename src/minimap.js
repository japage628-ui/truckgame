// minimap.js - lightweight mini-map overlay for truck position

(function () {
  const svg = document.getElementById("mini-map-svg");
  const dot = document.getElementById("mini-map-dot");

  if (!svg || !dot) {
    console.warn("[MINIMAP] SVG elements missing; minimap disabled.");
    return;
  }

  const viewBox = svg.viewBox.baseVal;
  const MIN_LON = -125;
  const MAX_LON = -66;
  const MIN_LAT = 24;
  const MAX_LAT = 50;

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function project(lat, lon) {
    const xNorm = (clamp(lon, MIN_LON, MAX_LON) - MIN_LON) / (MAX_LON - MIN_LON);
    const yNorm = (clamp(lat, MIN_LAT, MAX_LAT) - MIN_LAT) / (MAX_LAT - MIN_LAT);

    const x = viewBox.x + xNorm * viewBox.width;
    // Invert Y so north is up
    const y = viewBox.y + (1 - yNorm) * viewBox.height;

    return { x, y };
  }

  function setDotPosition(lat, lon) {
    const pos = project(lat, lon);
    dot.setAttribute("cx", pos.x.toFixed(2));
    dot.setAttribute("cy", pos.y.toFixed(2));
  }

  window.updateMiniMap = function updateMiniMap(lat, lon) {
    if (typeof lat !== "number" || typeof lon !== "number") return;
    setDotPosition(lat, lon);
  };

  // Initialize with current city if available
  if (typeof window.getCities === "function" && typeof window.getCurrentCityId === "function") {
    const cities = window.getCities();
    const cid = window.getCurrentCityId();
    if (cities && cities[cid]) {
      setDotPosition(cities[cid].lat, cities[cid].lon);
    }
  }
})();
