const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const faces = [
  "Clash Display",
  "Boska",
  "Panchang",
  "Satoshi",
  "Zodiak",
  "Melodrama",
  "Cabinet Grotesk",
  "Gambarino",
  "General Sans",
  "Switzer",
];

const finalFace = "Switzer";
const logotype = document.querySelector(".logotype");
const fadeMs = prefersReducedMotion ? 0 : 550;

let skipped = false;
let rotating = false;
let currentFace = faces[0];

function fittedFontSize(family) {
  const probe = document.createElement("span");
  probe.textContent = logotype.textContent;
  probe.style.cssText = [
    "position:absolute",
    "left:0",
    "top:0",
    "visibility:hidden",
    "pointer-events:none",
    "white-space:nowrap",
    `font-family:${family},system-ui,sans-serif`,
    "font-weight:400",
    "font-size:100px",
    "letter-spacing:-0.03em",
    "font-kerning:normal",
    "line-height:0.85",
  ].join(";");
  document.body.appendChild(probe);
  const widthAt100 = probe.getBoundingClientRect().width;
  probe.remove();

  const inset = Math.max(window.innerWidth * 0.08, 24);
  const available = Math.max(window.innerWidth - inset, 80);

  if (widthAt100 <= 0) {
    return null;
  }

  return (available / widthAt100) * 100;
}

function applyFittedSize(family) {
  const size = fittedFontSize(family);
  if (size) {
    logotype.style.setProperty("--logotype-size", `${size}px`);
  }
}

async function setFace(family) {
  if (document.fonts?.load) {
    await Promise.race([
      document.fonts.load(`400 80px "${family}"`),
      wait(400),
    ]);
  }

  currentFace = family;
  logotype.style.fontFamily = `"${family}", system-ui, sans-serif`;
  applyFittedSize(family);
}

async function fadeToFace(family) {
  document.body.classList.add("is-off");
  await wait(fadeMs);
  if (skipped && !rotating) return;

  await setFace(family);
  document.body.classList.remove("is-off");
  await wait(fadeMs);
}

function settle() {
  skipped = true;
  document.body.classList.remove("is-intro", "is-off");
  document.body.classList.add("is-settled");
  setFace(finalFace);
  startRotation();
}

async function playIntro() {
  await setFace(faces[0]);
  await wait(700);
  if (skipped) return;

  for (let i = 1; i < faces.length; i += 1) {
    await fadeToFace(faces[i]);
    if (skipped) return;
    await wait(280);
    if (skipped) return;
  }

  await wait(400);
  if (skipped) return;
  settle();
}

function startRotation() {
  if (rotating || prefersReducedMotion) {
    return;
  }

  rotating = true;

  const loop = async () => {
    let index = faces.indexOf(finalFace);
    if (index < 0) {
      index = 0;
    }

    while (rotating) {
      await wait(2400);
      if (!rotating) return;

      index = (index + 1) % faces.length;
      document.body.classList.add("is-off");
      await wait(fadeMs);
      if (!rotating) return;

      await setFace(faces[index]);
      document.body.classList.remove("is-off");
      await wait(fadeMs);
    }
  };

  loop();
}

function skipIntro() {
  settle();
}

document.addEventListener("click", skipIntro, { once: true });
document.addEventListener(
  "keydown",
  (event) => {
    if (event.key === "Escape" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      skipIntro();
    }
  },
  { once: true }
);

window.addEventListener("resize", () => {
  applyFittedSize(currentFace);
});

window.visualViewport?.addEventListener("resize", () => {
  applyFittedSize(currentFace);
});

async function start() {
  if (prefersReducedMotion) {
    settle();
    return;
  }

  if (document.fonts && document.fonts.ready) {
    await Promise.race([document.fonts.ready, wait(1800)]);
  }

  if (!skipped) {
    playIntro();
  }
}

start();
