"use strict";

const examples = {
  type: { prompt: "Bring the title in.\nStagger the two lines.", reply: "Added the motion.\nBoth lines stay editable.", description: "A small edit. Still your timeline." },
  motion: { prompt: "Make the entrance softer.\nGive it a little room to settle.", reply: "Eased the keyframes.\nKept the timing in place.", description: "Adjust the motion, without leaving the comp." },
  layout: { prompt: "Move the title to the right.\nKeep both lines aligned.", reply: "Aligned both layers.\nYour layout stays editable.", description: "Work with the layers you already have." }
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
