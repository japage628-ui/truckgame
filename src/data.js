// data.js — static game data, upgrade costs, tooltip text

window.GameData = {
  // ------------------  CITIES  ------------------
  // Replace this list with your full 100 cities later
  cities: [
    { id: 0, name: "Atlanta, GA",   region: "hills",   lat: 33.749, lon: -84.388 },
    { id: 1, name: "Miami, FL",     region: "coast",   lat: 25.761, lon: -80.191 },
    { id: 2, name: "Nashville, TN", region: "hills",   lat: 36.162, lon: -86.781 },
    { id: 3, name: "Dallas, TX",    region: "plains",  lat: 32.776, lon: -96.797 },
    { id: 4, name: "Phoenix, AZ",   region: "desert",  lat: 33.448, lon: -112.074 },
    { id: 5, name: "Los Angeles, CA", region: "coast", lat: 34.052, lon: -118.244 }
  ],

  baseSpeed: 60,

  weightMult: {
    light: 1.0,
    med: 1.3,
    heavy: 1.6
  },

  upgradeCosts: {
    engine:       [2000, 4000, 7000, 10000],
    transmission: [1500, 3500, 6000],
    tires:        [1000, 2500],
    tank:         [1800, 4000],
    reefer:       [1500, 3000],
    aero:         [1200, 2500, 4500],
    suspension:   [1400, 3000],
    safety:       [2000, 4500],
    comfort:      [1200, 2800]
  }
};

// Tooltip text for upgrades
window.UpgradeDescriptions = {
  engine: [
    "Engine (L1)\nBase performance",
    "Engine (L2)\n+5% speed\n-2% engine wear",
    "Engine (L3)\n+10% speed\n-6% engine wear",
    "Engine (L4)\n+15% speed\n-10% engine wear",
    "Engine (L5)\n+20% speed\n-15% engine wear"
  ],
  transmission: [
    "Transmission (L1)\nBase acceleration",
    "Transmission (L2)\n+5% acceleration",
    "Transmission (L3)\n+10% acceleration",
    "Transmission (L4)\n+15% acceleration"
  ],
  tires: [
    "Tires (L1)\nBase wear",
    "Tires (L2)\n-5% tire wear",
    "Tires (L3)\n-10% tire wear"
  ],
  tank: [
    "Fuel Tank (L1)\n100 fuel capacity",
    "Fuel Tank (L2)\n115 fuel capacity",
    "Fuel Tank (L3)\n130 fuel capacity"
  ],
  reefer: [
    "Reefer (L1)\nBase efficiency",
    "Reefer (L2)\n+5% efficiency",
    "Reefer (L3)\n+10% efficiency"
  ],
  aero: [
    "Aerodynamics (L1)\nBase drag",
    "Aerodynamics (L2)\n-2% fuel use",
    "Aerodynamics (L3)\n-4% fuel use",
    "Aerodynamics (L4)\n-6% fuel use"
  ],
  suspension: [
    "Suspension (L1)\nBase comfort",
    "Suspension (L2)\n-3% breakdown chance",
    "Suspension (L3)\n-6% breakdown chance"
  ],
  safety: [
    "Safety (L1)\nNo DOT bonus",
    "Safety (L2)\n+3% DOT bonus\n-2% DOT fine",
    "Safety (L3)\n+6% DOT bonus\n-4% DOT fine"
  ],
  comfort: [
    "Comfort (L1)\nNo bonus payout",
    "Comfort (L2)\n+2% bonus money",
    "Comfort (L3)\n+4% bonus money"
  ]
};