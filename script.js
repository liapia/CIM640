const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

let skipped = false;

function settle() {
  skipped = true;
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
