const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const logotype = document.querySelector(".logotype");
const tagline = document.querySelector(".tagline");

function fitLogotype() {
  const probe = document.createElement("span");
  probe.textContent = logotype.textContent;
  probe.style.cssText = [
    "position:absolute",
    "visibility:hidden",
    "white-space:nowrap",
    "font-family:Satoshi,system-ui,sans-serif",
    "font-weight:400",
    "font-size:100px",
    "letter-spacing:-0.03em",
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
      `${(available / widthAt100) * 100}px`
    );
  }
}

function fitTagline() {
  const maxPx = window.innerWidth <= 720 ? 14 : 17;
  const inset = Math.max(window.innerWidth * 0.06, 20);
  const available = Math.max(window.innerWidth - inset * 2, 80);

  tagline.style.fontSize = `${maxPx}px`;
  const width = tagline.scrollWidth;
  if (width > available) {
    tagline.style.fontSize = `${maxPx * (available / width)}px`;
  }
}

function fit() {
  fitLogotype();
  fitTagline();
}

async function play() {
  fit();

  if (prefersReducedMotion) {
    document.body.classList.add("is-ready");
    return;
  }

  if (document.fonts?.ready) {
    await Promise.race([document.fonts.ready, wait(1500)]);
  }

  document.body.classList.add("is-logo");
  await wait(900);
  document.body.classList.add("is-tagline");
  await wait(800);
  document.body.classList.add("is-ready");
}

window.addEventListener("resize", fit);
window.visualViewport?.addEventListener("resize", fit);

play();
