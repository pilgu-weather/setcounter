(() => {
  "use strict";

  const SVG_NS = "http://www.w3.org/2000/svg";
  const assetUrls = {
    front: "/static/data/body-highlighter/male-front.json?v=1",
    back: "/static/data/body-highlighter/male-back.json?v=1",
  };
  const viewBoxes = { front: "0 0 724 1448", back: "724 0 724 1448" };
  const bodyPromises = new Map();

  const aliases = new Map(Object.entries({
    abdominals: ["abs"], abs: ["abs"], core: ["abs", "obliques"], obliques: ["obliques"],
    abductors: ["abductors"], adductors: ["adductors"], biceps: ["biceps"], calves: ["calves"],
    chest: ["chest"], forearms: ["forearm"], forearm: ["forearm"], glutes: ["gluteal"],
    gluteal: ["gluteal"], hamstrings: ["hamstring"], hamstring: ["hamstring"], lats: ["upper-back"],
    "lower back": ["lower-back"], "middle back": ["upper-back"], "upper back": ["upper-back"],
    neck: ["neck"], quadriceps: ["quadriceps"], shoulders: ["deltoids"], deltoids: ["deltoids"],
    traps: ["trapezius"], trapezius: ["trapezius"], triceps: ["triceps"], tibialis: ["tibialis"],
    "\ubcf5\uadfc": ["abs"], "\ucf54\uc5b4": ["abs", "obliques"], "\uc606\uad6c\ub9ac": ["obliques"],
    "\uc678\uc804\uadfc": ["abductors"], "\ub0b4\uc804\uadfc": ["adductors"],
    "\uc774\ub450": ["biceps"], "\uc774\ub450\uadfc": ["biceps"], "\uc885\uc544\ub9ac": ["calves"],
    "\uac00\uc2b4": ["chest"], "\uc804\uc644\uadfc": ["forearm"], "\ub454\uadfc": ["gluteal"],
    "\ub454\ubd80": ["gluteal"], "\uc5c9\ub369\uc774": ["gluteal"], "\ud584\uc2a4\ud2b8\ub9c1": ["hamstring"],
    "\uad11\ubc30\uadfc": ["upper-back"], "\ud5c8\ub9ac": ["lower-back"], "\ub4f1": ["upper-back", "lower-back"],
    "\uc2b9\ubaa8\uadfc": ["upper-back", "trapezius"], "\ubaa9": ["neck"],
    "\ub300\ud1f4\uc0ac\ub450\uadfc": ["quadriceps"], "\ud5c8\ubc85\uc9c0": ["quadriceps", "hamstring"],
    "\uc5b4\uae68": ["deltoids"], "\uc804\uba74 \uc5b4\uae68": ["deltoids"], "\uc0bc\uac01\uadfc": ["deltoids"],
    "\uc0bc\ub450": ["triceps"], "\uc0bc\ub450\uadfc": ["triceps"], "\uc815\uac15\uc774": ["tibialis"],
    "\ud558\uccb4": ["quadriceps", "hamstring", "gluteal", "calves"],
    "\uace0\uad00\uc808": ["abductors", "adductors"], "\uc804\uc2e0": [],
    "\uac00\ub3d9\uc131": [], "\ud68c\ubcf5": [], "\uc720\uc5f0\uc131": [],
  }));

  function normalize(value) {
    return String(value || "").trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
  }

  function slugsFor(values) {
    const output = new Set();
    (values || []).forEach((value) => {
      const exact = aliases.get(normalize(value));
      if (exact) exact.forEach((slug) => output.add(slug));
    });
    return output;
  }

  function loadBody(side) {
    if (!bodyPromises.has(side)) {
      bodyPromises.set(side, fetch(assetUrls[side]).then((response) => {
        if (!response.ok) throw new Error(`body highlighter ${side} load failed`);
        return response.json();
      }));
    }
    return bodyPromises.get(side);
  }

  function makeSvg(side, parts, primary, secondary) {
    const figure = document.createElement("figure");
    figure.className = "muscle-map-figure";
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", viewBoxes[side]);
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", `\uadfc\uc721 \uac15\uc870 ${side === "front" ? "\uc804\uba74" : "\ud6c4\uba74"}`);
    svg.classList.add("muscle-map-svg");

    parts.forEach((part) => {
      const group = document.createElementNS(SVG_NS, "g");
      const slug = part.slug || "unknown";
      group.dataset.muscle = slug;
      group.classList.add(primary.has(slug) ? "is-primary" : secondary.has(slug) ? "is-secondary" : "is-inactive");
      ["common", "left", "right"].forEach((position) => {
        (part.path?.[position] || []).forEach((definition) => {
          const path = document.createElementNS(SVG_NS, "path");
          path.setAttribute("d", definition);
          path.setAttribute("vector-effect", "non-scaling-stroke");
          group.append(path);
        });
      });
      svg.append(group);
    });

    const caption = document.createElement("figcaption");
    caption.textContent = side === "front" ? "\uc804\uba74" : "\ud6c4\uba74";
    figure.append(svg, caption);
    return figure;
  }

  async function render(target, options = {}) {
    if (!target) return;
    const requestId = String(Number(target.dataset.renderRequest || 0) + 1);
    target.dataset.renderRequest = requestId;
    target.classList.add("is-loading");
    target.replaceChildren();
    try {
      const [front, back] = await Promise.all([loadBody("front"), loadBody("back")]);
      if (target.dataset.renderRequest !== requestId) return;
      const primary = slugsFor(options.primary);
      const secondary = slugsFor(options.secondary);
      primary.forEach((slug) => secondary.delete(slug));
      target.append(makeSvg("front", front, primary, secondary), makeSvg("back", back, primary, secondary));
      target.classList.toggle("has-highlight", primary.size + secondary.size > 0);
    } catch (error) {
      target.innerHTML = '<p class="muscle-map-unavailable">\uadfc\uc721 \uac15\uc870 \uc774\ubbf8\uc9c0\ub97c \ubd88\ub7ec\uc624\uc9c0 \ubabb\ud588\uc2b5\ub2c8\ub2e4.</p>';
    } finally {
      if (target.dataset.renderRequest === requestId) target.classList.remove("is-loading");
    }
  }

  function preload() {
    return Promise.all([loadBody("front"), loadBody("back")]);
  }

  window.SetCounterBodyHighlighter = { render, preload };
})();
