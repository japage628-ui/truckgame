// worldmap.js - distance matrix + helper

(function () {
  const GD = window.GameData;
  if (!GD || !GD.cities) {
    console.error("worldmap.js: GameData.cities not found.");
    return;
  }

  const cities = GD.cities;
  const count = cities.length;
  const distMatrix = [];

  function toRad(deg) {
    return deg * Math.PI / 180;
  }

  function haversineMiles(lat1, lon1, lat2, lon2) {
    const R = 3958.8;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  for (let i = 0; i < count; i++) {
    distMatrix[i] = [];
    const ci = cities[i];
    for (let j = 0; j < count; j++) {
      if (i === j) {
        distMatrix[i][j] = 0;
        continue;
      }
      const cj = cities[j];
      const d = haversineMiles(ci.lat, ci.lon, cj.lat, cj.lon);

      const roadMult = 1.15 + (Math.abs(i - j) % 11) * 0.01;
      let miles = d * roadMult;
      if (miles < 80) miles = 80;
      distMatrix[i][j] = Math.round(miles);
    }
  }

  function getDistanceMiles(cityIdA, cityIdB) {
    if (
      cityIdA == null || cityIdB == null ||
      cityIdA < 0 || cityIdB < 0 ||
      cityIdA >= count || cityIdB >= count
    ) {
      return 300;
    }
    return distMatrix[cityIdA][cityIdB];
  }

  window.getDistanceMiles = getDistanceMiles;
})();
