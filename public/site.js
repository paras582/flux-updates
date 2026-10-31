"use strict";

const examples = {
  ui: {
    prompt: "Recreate this dashboard.\nKeep the cards, chart and text editable.",
    reply: "Built with shape and text layers.\nEach part stays editable.",
    description: "Reference image → editable AE layout. Illustrative example.",
    reference: "/examples/dashboard-reference.svg", referenceAlt: "Reference image of a dashboard with cards and an orange chart", filename: "dashboard.png",
    result: "/examples/dashboard-reference.svg", resultAlt: "Dashboard layout recreated as editable After Effects layers", layers: ["Heading", "Cards", "Chart"]
  },
  speaker: {
    prompt: "Turn this 2D speaker into a 3D-style scene using native AE shape layers.",
    reply: "Layered faces for depth.\nAnimated with an AE camera.",
    description: "A flat reference → a dimensional shape-layer scene. Illustrative example.",
    reference: "/examples/speaker-reference.svg", referenceAlt: "Flat front-view reference image of an orange speaker", filename: "speaker-2d.png",
    result: "/examples/speaker-scene.svg", resultAlt: "Dimensional orange speaker scene built from layered faces with an AE camera", layers: ["Front face", "Side faces", "Camera"]
  }
};
const workbench = document.querySelector(".workbench");
const options = Array.from(document.querySelectorAll("[data-example]"));
const prompt = document.getElementById("demo-prompt");
const reply = document.getElementById("demo-reply");
const description = document.getElementById("demo-description");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let frame;
function replay() {
  cancelAnimationFrame(frame);
  workbench.classList.remove("is-playing");
  if (reducedMotion.matches) return;
  // A fresh frame restarts the short example; it never loops on its own.
  frame = requestAnimationFrame(() => {
    void workbench.offsetWidth;
    workbench.classList.add("is-playing");
  });
}
options.forEach(button => button.addEventListener("click", () => {
  const name = button.dataset.example;
  if (!examples[name]) return;
  workbench.dataset.scene = name;
  prompt.textContent = examples[name].prompt;
  reply.textContent = examples[name].reply;
  description.textContent = examples[name].description;
  const reference = document.getElementById("demo-reference-image");
  const result = document.getElementById("demo-result-image");
  reference.src = examples[name].reference;
  reference.alt = examples[name].referenceAlt;
  result.src = examples[name].result;
  result.alt = examples[name].resultAlt;
  document.getElementById("demo-reference-name").textContent = examples[name].filename;
  document.querySelectorAll("[data-layer-label]").forEach((label, index) => { label.textContent = examples[name].layers[index]; });
  options.forEach(option => {
    const active = option === button;
    option.classList.toggle("active", active);
    option.setAttribute("aria-pressed", String(active));
  });
  replay();
}));
document.getElementById("replay").addEventListener("click", replay);
replay();

// Downloads come from the same public release channel as the extension.
// GitHub Releases remains a usable fallback if this request is unavailable.
const releaseFallback = "https://github.com/paras582/flux-updates/releases/latest";
const releasePrefix = "/paras582/flux-updates/releases/download/";
async function loadRelease() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch("https://api.github.com/repos/paras582/flux-updates/releases/latest", {
      headers: { Accept: "application/vnd.github+json" }, signal: controller.signal
    });
    if (!response.ok) return;
    const release = await response.json();
    const asset = Array.isArray(release.assets) ? release.assets.find(item => typeof item.name === "string" && item.name.endsWith(".zxp")) : null;
    if (!asset || typeof asset.browser_download_url !== "string") return;
    const url = new URL(asset.browser_download_url);
    if (url.protocol !== "https:" || url.hostname !== "github.com" || url.username || url.password || !url.pathname.startsWith(releasePrefix) || !url.pathname.endsWith(".zxp")) return;
    document.querySelectorAll(".download-link").forEach(link => { link.href = url.href; });
    if (typeof release.tag_name === "string" && /^v?\d+\.\d+\.\d+$/.test(release.tag_name)) {
      document.querySelectorAll("[data-release]").forEach(label => { label.textContent = release.tag_name; });
    }
  } catch (_) {
    document.querySelectorAll(".download-link").forEach(link => { link.href = releaseFallback; });
  } finally { clearTimeout(timeout); }
}
loadRelease();
