// AUDIO.JS - Non-module version
// We attach everything to window so it works with normal <script> tags

function playMusic(track) {
    console.log("Play music:", track);
    // later we'll hook real 8-bit trucker music here
}

function stopMusic() {
    console.log("Stop music");
}

// expose to global
window.playMusic = playMusic;
window.stopMusic = stopMusic;
