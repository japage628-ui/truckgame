// backgrounds.js - background metadata and loader

(function () {
  const makeImage = (src) => {
    const img = new Image();
    img.onload = () => { img.ready = true; };
    img.onerror = () => { img.ready = false; };
    img.src = src;
    return img;
  };

  const BACKGROUNDS = [
    {
      name: "coast_city",
      region: "coast",
      layers: {
        background: "assets/Backgrounds/oceanside.png",
        midground: "assets/Backgrounds/cityskyline.png",
        foreground: "assets/Backgrounds/cityskyline.png"
      }
    },
    {
      name: "plains_field",
      region: "plains",
      layers: {
        background: "assets/Backgrounds/dessert.jpg",
        midground: "assets/Backgrounds/dessert.jpg",
        foreground: "assets/Backgrounds/cityskyline.png"
      }
    },
    {
      name: "hills_default",
      region: "hills",
      layers: {
        background: "assets/Backgrounds/oceanside.png",
        midground: "assets/Backgrounds/cityskyline.png",
        foreground: "assets/Backgrounds/cityskyline.png"
      }
    },
    {
      name: "desert_default",
      region: "desert",
      layers: {
        background: "assets/Backgrounds/dessert.jpg",
        midground: "assets/Backgrounds/dessert.jpg",
        foreground: "assets/Backgrounds/cityskyline.png"
      }
    }
  ];

  const loadedBackgrounds = BACKGROUNDS.map((bg) => {
    return {
      ...bg,
      images: {
        background: makeImage(bg.layers.background),
        midground: makeImage(bg.layers.midground),
        foreground: makeImage(bg.layers.foreground)
      }
    };
  });

  function getBackgroundForRegion(region) {
    if (!region) return loadedBackgrounds[0];
    const match = loadedBackgrounds.find(b => b.region === region);
    return match || loadedBackgrounds[0];
  }

  window.Backgrounds = {
    list: loadedBackgrounds,
    getForRegion: getBackgroundForRegion
  };
})();
