// ==============================================
// ui.js — HUD + Panels (v1.0.0 REALISM PATCH)
// ==============================================

console.log("%c[UI] Loaded.", "color:#5F5;");

let hoveredUpgrade = null;

function drawUILayer() {
    return; // HUD handled in render.js; avoid duplicate labels
    const state = window.getGameState();

    if (state === "START") {
        drawStartScreen();
        return;
    }

    drawHudPanel();
    drawHudStats();
}

// HUD PANEL
function drawHudPanel() {
    const boxW = 320;
    const boxH = 300;
    const x = canvas.width - boxW - 20;
    const y = 20;

    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(x, y, boxW, boxH);
    ctx.strokeStyle = "#FFFFFF";
    ctx.strokeRect(x, y, boxW, boxH);
}

function drawHudStats() {
    const stats = window.getPlayerStats();
    const cities = window.getCities();
    const city = cities[window.getCurrentCityId()];
    const msg = window.getMessage?.();

    const x = canvas.width - 300;
    let y = 50;

    ctx.fillStyle = "#C8E6FF";
    ctx.font = "20px monospace";
    ctx.fillText("City: " + city.name, x, y);

    y += 28;
    ctx.fillText("Money: $" + stats.money, x, y);

    y += 28;
    ctx.fillText("Jobs: " + stats.jobsDelivered, x, y);

    y += 28;
    const milesLeft = Math.max(0, Math.floor(window.getMilesRemaining?.() || 0));
    ctx.fillText("Next stop: " + milesLeft + " mi", x, y);

    y += 25;
    drawBar(x, y, 220, "Truck", stats.truckHealth, "#53FF88"); y += 25;
    drawBar(x, y, 220, "Engine", stats.engineHealth, "#FFE066"); y += 25;
    drawBar(x, y, 220, "Tires", stats.tireHealth, "#FF6B6B"); y += 25;

    const fuelPct = Math.round(window.getFuelPercent());
    drawBar(x, y, 220, "Fuel", fuelPct, "#6CD2FF"); 
    y += 30;

    drawBar(x, y, 220, "DOT rep", stats.dotReputation, "#4DA6FF");
    y += 30;

    ctx.fillStyle = "#FFD6A5";
    ctx.fillText("Weather: " + stats.activeWeather, x, y);

    // SHOW REFUEL OPTION
    if (window.getGameState() === "CITY" && fuelPct < 100) 
    {
        y += 30;
        ctx.fillStyle = "#A9FFBF";
        ctx.font = "18px monospace";
        ctx.fillText("[R] Refuel", x, y);
    }

    if (msg) {
        y += 30;
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "14px monospace";
        ctx.fillText(msg, x, y);
    }
}

function drawBar(x, y, w, label, value, color) {
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "16px monospace";
    ctx.fillText(label, x, y);

    const bx = x + 80;
    const by = y - 12;
    const bw = w - 80;

    ctx.strokeStyle = "#FFFFFF";
    ctx.strokeRect(bx, by, bw, 14);

    ctx.fillStyle = color;
    ctx.fillRect(bx, by, (bw * value) / 100, 14);
}

// DOT OVERLAY RETURNS UNCHANGED

// START SCREEN
function drawStartScreen() {
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "32px monospace";
    ctx.fillText("TRUCK GAME", w * 0.33, h * 0.4);

    ctx.font = "18px monospace";
    ctx.fillText("Press any key to start", w * 0.32, h * 0.5);
}
