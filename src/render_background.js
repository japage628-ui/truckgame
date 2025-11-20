// render_background.js - parallax drawing for layered backgrounds

// Speeds for parallax layers
const PARALLAX_SPEEDS = {
  background: 0.2,
  midground: 0.5,
  foreground: 1.0
};

function drawTiledLayer(ctx, canvas, img, speed, scroll) {
  if (!img || !img.complete || !img.naturalWidth) return;
  const w = canvas.width;
  const h = canvas.height;
  const scale = h / img.height;
  const targetW = img.width * scale;
  const targetH = h;
  const offset = ((scroll * speed) % targetW);
  for (let x = offset - targetW; x < w + targetW; x += targetW) {
    ctx.drawImage(img, 0, 0, img.width, img.height, x, 0, targetW, targetH);
  }
}

function drawBackgroundParallax(ctx, canvas, region, scroll, driving) {
  if (!window.Backgrounds) return;
  const bg = window.Backgrounds.getForRegion(region);
  const activeScroll = driving ? scroll : 0;
  drawTiledLayer(ctx, canvas, bg.images.background, PARALLAX_SPEEDS.background, activeScroll);
  drawTiledLayer(ctx, canvas, bg.images.midground, PARALLAX_SPEEDS.midground, activeScroll);
  drawTiledLayer(ctx, canvas, bg.images.foreground, PARALLAX_SPEEDS.foreground, activeScroll);
}

// expose
window.drawBackgroundParallax = drawBackgroundParallax;
