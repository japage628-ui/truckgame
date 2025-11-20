async function loadTemplate(targetId, filePath) {
  const html = await fetch(filePath).then(r => r.text());
  const target = document.getElementById(targetId);
  if (target) {
    target.innerHTML = html;
  }
}

(async function () {
  await Promise.all([
    loadTemplate("hud-container", "src/templates/hud.html"),
    loadTemplate("job_board_container", "src/templates/job_board.html"),
    loadTemplate("minimap-container", "src/templates/minimap.html"),
    loadTemplate("mobile-ui-container", "src/templates/mobile_ui.html"),
    loadTemplate("challenges-container", "src/templates/challenges.html"),
    loadTemplate("start-screen-container", "src/templates/start_screen.html")
  ]);
  window.dispatchEvent(new Event("templates:loaded"));
})();
