const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

let skipped = false;
const logotype = document.querySelector(".logotype");

function fittedFontSize() {
  const probe = document.createElement("span");
  probe.textContent = logotype.textContent;
  probe.style.cssText = [
    "position:absolute",
    "left:0",
    "top:0",
    "visibility:hidden",
    "pointer-events:none",
    "white-space:nowrap",
    "font-family:Switzer,system-ui,sans-serif",
    "font-weight:400",
    "font-size:100px",
    "letter-spacing:-0.03em",
    "font-kerning:normal",
    "line-height:0.85",
  ].join(";");
  document.body.appendChild(probe);
  const widthAt100 = probe.getBoundingClientRect().width;
  probe.remove();

  const inset = Math.max(window.innerWidth * 0.04, 12);
  const available = Math.max(
    window.innerWidth - inset * 2 - (window.visualViewport?.offsetLeft || 0),
    80
  );

  if (widthAt100 <= 0) {
    return null;
  }

  return (available / widthAt100) * 100;
}

function applyFittedSize() {
  const size = fittedFontSize();
  if (size) {
    logotype.style.setProperty("--logotype-size", `${size}px`);
  }
}

function settle() {
  skipped = true;
  applyFittedSize();
  document.body.classList.remove("is-intro", "is-off", "is-invert");
  document.body.classList.add("is-settled");
}

async function playIntro() {
  const body = document.body;

  await wait(520);
  if (skipped) return;
  body.classList.add("is-off");
  await wait(140);
  if (skipped) return;
  body.classList.remove("is-off");

  await wait(220);
  if (skipped) return;
  body.classList.add("is-off");
  await wait(120);
  if (skipped) return;
  body.classList.remove("is-off");

  await wait(260);
  if (skipped) return;
  body.classList.add("is-invert");
  await wait(200);
  if (skipped) return;
  body.classList.remove("is-invert");

  await wait(720);
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
  if (document.body.classList.contains("is-settled")) {
    applyFittedSize();
  }
});

window.visualViewport?.addEventListener("resize", () => {
  if (document.body.classList.contains("is-settled")) {
    applyFittedSize();
  }
});

async function start() {
  if (prefersReducedMotion) {
    settle();
    return;
  }

  if (document.fonts && document.fonts.ready) {
    await Promise.race([document.fonts.ready, wait(1500)]);
  }

  if (!skipped) {
    playIntro();
  }
}

start();
