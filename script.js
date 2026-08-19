const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const faces = [
  "Clash Display",
  "Boska",
  "Satoshi",
  "Cabinet Grotesk",
  "Switzer",
];

const finalFace = "Switzer";
const logotype = document.querySelector(".logotype");

let skipped = false;

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

  logotype.style.fontFamily = `"${family}", system-ui, sans-serif`;
  applyFittedSize(family);
}

function settle() {
  skipped = true;
  document.body.classList.remove("is-intro", "is-off", "is-invert");
  document.body.classList.add("is-settled");
  setFace(finalFace);
}

async function playIntro() {
  const body = document.body;

  await setFace(faces[0]);
  await wait(420);
  if (skipped) return;

  for (let i = 1; i < faces.length; i += 1) {
    body.classList.add("is-off");
    await wait(90);
    if (skipped) return;

    await setFace(faces[i]);

    const isLast = i === faces.length - 1;
    if (isLast) {
      body.classList.add("is-invert");
    }

    body.classList.remove("is-off");
    await wait(isLast ? 280 : 320);
    if (skipped) return;

    if (isLast) {
      body.classList.remove("is-invert");
    }
  }

  await wait(640);
  if (skipped) return;
  settle();
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
  const family =
    logotype.style.fontFamily.replace(/["']/g, "").split(",")[0] || finalFace;
  applyFittedSize(family);
});

window.visualViewport?.addEventListener("resize", () => {
  const family =
    logotype.style.fontFamily.replace(/["']/g, "").split(",")[0] || finalFace;
  applyFittedSize(family);
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
