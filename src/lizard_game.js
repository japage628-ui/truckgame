// SIMPLE BACKGROUND LIZARD APPEARANCE

const bgLizard = () => document.getElementById("bg-lizard");

function showLizard() {
  const liz = bgLizard();
  if (!liz) return;
  liz.classList.remove("hidden");
  setTimeout(hideLizard, 4000);
}

function hideLizard() {
  const liz = bgLizard();
  if (!liz) return;
  liz.classList.add("hidden");
}

function scheduleLizard() {
  const next = Math.random() * 20000 + 15000; // 15–35 sec
  setTimeout(() => {
    showLizard();
    scheduleLizard();
  }, next);
}

// Start after page loads
document.addEventListener("DOMContentLoaded", scheduleLizard);
