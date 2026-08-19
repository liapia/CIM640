const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const products = [
  "products/product-01.webp",
  "products/product-02.webp",
  "products/product-03.webp",
  "products/product-05.webp",
  "products/product-06.webp",
  "products/product-07.webp",
  "products/product-08.webp",
  "products/product-09.webp",
  "products/product-10.webp",
  "products/product-11.webp",
  "products/product-12.webp",
];

const logotype = document.querySelector(".logotype");
const tagline = document.querySelector(".tagline");
const sky = document.querySelector("#sky");

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function shuffle(list) {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function fitLogotype() {
  const probe = document.createElement("span");
  probe.textContent = logotype.textContent;
  probe.style.cssText = [
    "position:absolute",
    "visibility:hidden",
    "white-space:nowrap",
    "font-family:Switzer,system-ui,sans-serif",
    "font-weight:400",
    "font-size:100px",
    "letter-spacing:-0.045em",
    "line-height:0.85",
  ].join(";");
  document.body.appendChild(probe);
  const widthAt100 = probe.getBoundingClientRect().width;
  probe.remove();

  const inset = Math.max(window.innerWidth * 0.08, 24);
  const available = Math.max(window.innerWidth - inset, 80);
  if (widthAt100 > 0) {
    logotype.style.setProperty(
      "--logotype-size",
      `${(available / widthAt100) * 60}px`
    );
  }
}

function fitTagline() {
  const maxPx = window.innerWidth <= 720 ? 16 : 24;
  const inset = Math.max(window.innerWidth * 0.06, 20);
  const available = Math.max(window.innerWidth - inset * 2, 80);

  tagline.style.fontSize = `${maxPx}px`;
  const width = tagline.scrollWidth;
  if (width > available) {
    tagline.style.fontSize = `${maxPx * (available / width)}px`;
  }
}

function landingSpot(index, mobile) {
  const band = index % 4;
  if (band === 0) {
    return {
      x: Math.random() < 0.5 ? rand(5, 26) : rand(74, 95),
      y: rand(3, 18),
    };
  }
  if (band === 1) {
    return { x: rand(3, mobile ? 20 : 22), y: rand(22, 72) };
  }
  if (band === 2) {
    return { x: rand(mobile ? 80 : 78, 97), y: rand(22, 72) };
  }
  return {
    x: Math.random() < 0.5 ? rand(6, 30) : rand(70, 94),
    y: rand(mobile ? 72 : 74, 90),
  };
}

function spawnCutouts() {
  sky.replaceChildren();
  const mobile = window.innerWidth <= 720;
  const extras = mobile ? 1 : 7;
  const pack = [
    ...shuffle(products),
    ...shuffle(products).slice(0, extras),
  ];

  let longestDropMs = 0;

  pack.forEach((src, index) => {
    const img = document.createElement("img");
    img.className = "cutout";
    img.src = src;
    img.alt = "";

    const spot = landingSpot(index, mobile);

    img.style.setProperty("--x", `${spot.x}vw`);
    img.style.setProperty("--y", `${spot.y}vh`);
    img.style.setProperty(
      "--w",
      `${rand(mobile ? 52 : 64, mobile ? 98 : 140)}px`
    );
    img.style.setProperty("--r0", `${rand(-48, 48)}deg`);
    img.style.setProperty("--r1", `${rand(-28, 28)}deg`);
    const delaySec = Number((index * 0.09 + rand(0, 0.35)).toFixed(2));
    const durSec = Number(rand(1.8, 3.1).toFixed(2));
    img.style.setProperty("--delay", `${delaySec}s`);
    img.style.setProperty("--dur", `${durSec}s`);
    longestDropMs = Math.max(longestDropMs, (delaySec + durSec) * 1000);
    sky.appendChild(img);
  });

  return longestDropMs;
}

function fit() {
  fitLogotype();
  fitTagline();
}

async function play() {
  const longestDropMs = spawnCutouts();
  fit();

  if (prefersReducedMotion) {
    document.body.classList.add("is-ready");
    return;
  }

  if (document.fonts?.ready) {
    await Promise.race([document.fonts.ready, wait(1500)]);
  }

  document.body.classList.add("is-logo");
  await wait(700);
  // Keep the catch phrase hidden until all cutouts have landed.
  await wait(longestDropMs);
  document.body.classList.add("is-tagline");
  await wait(550);
  document.body.classList.add("is-ready");
}

window.addEventListener("resize", fit);

play();
