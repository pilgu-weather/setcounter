(() => {
  "use strict";

  const gsap = window.gsap;
  const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const animatedKeys = new Set();
  const counterValues = new WeakMap();
  const overlayTweens = new WeakMap();
  const pressSelector = [
    "button:not([disabled])",
    "[role='button']",
    ".workout-plan-card",
    ".today-item",
    ".day-cell:not(.is-empty)",
    ".board-post",
    ".menu-action-row",
  ].join(",");

  let initialized = false;
  let navIndicator = null;
  let viewportHandler = null;

  const canAnimate = () => Boolean(gsap) && !reducedQuery.matches;

  function completeImmediately(callback) {
    if (typeof callback === "function") callback();
  }

  function resetElement(element) {
    if (!element || !gsap) return;
    gsap.killTweensOf(element);
    gsap.set(element, { clearProps: "transform,opacity,visibility,willChange" });
  }

  function animatePress(element, pressed) {
    if (!element || !canAnimate()) return;
    gsap.to(element, {
      scale: pressed ? 0.97 : 1,
      duration: pressed ? 0.09 : 0.14,
      ease: pressed ? "power1.out" : "power2.out",
      overwrite: "auto",
    });
  }

  function pressTarget(event) {
    const target = event.target instanceof Element ? event.target.closest(pressSelector) : null;
    if (!target || target.matches(":disabled") || target.getAttribute("aria-disabled") === "true") return null;
    return target;
  }

  function bindTouchFeedback() {
    document.addEventListener("pointerdown", (event) => {
      const target = pressTarget(event);
      if (!target) return;
      target.dataset.motionPressed = "1";
      animatePress(target, true);
    }, { passive: true });

    ["pointerup", "pointercancel", "pointerleave"].forEach((type) => {
      document.addEventListener(type, (event) => {
        const target = event.target instanceof Element ? event.target.closest("[data-motion-pressed='1']") : null;
        if (!target) return;
        delete target.dataset.motionPressed;
        animatePress(target, false);
      }, { passive: true });
    });
  }

  function ensureNavIndicator() {
    const nav = document.querySelector(".bottom-nav");
    if (!nav) return;
    navIndicator = nav.querySelector(".bottom-nav-indicator");
    if (!navIndicator) {
      navIndicator = document.createElement("span");
      navIndicator.className = "bottom-nav-indicator";
      navIndicator.setAttribute("aria-hidden", "true");
      nav.prepend(navIndicator);
    }
  }

  function animateBottomNavIndicator(button, immediate = false) {
    if (!button) return;
    ensureNavIndicator();
    if (!navIndicator) return;
    const nav = button.closest(".bottom-nav");
    const navRect = nav.getBoundingClientRect();
    const rect = button.getBoundingClientRect();
    const x = rect.left - navRect.left;
    const width = rect.width;
    if (!canAnimate() || immediate) {
      navIndicator.style.transform = `translateX(${x}px)`;
      navIndicator.style.width = `${width}px`;
    } else {
      gsap.to(navIndicator, { x, width, duration: 0.26, ease: "power2.out", overwrite: "auto" });
      gsap.fromTo(button.querySelector(".lucide"), { scale: 0.92, y: 1 }, { scale: 1, y: 0, duration: 0.24, ease: "power2.out", overwrite: "auto" });
    }
  }

  function animateScreenEnter(screen, options = {}) {
    if (!screen) return;
    if (!canAnimate()) {
      resetElement(screen);
      return;
    }
    gsap.killTweensOf(screen);
    gsap.fromTo(screen, {
      autoAlpha: 0,
      x: options.x || 0,
      y: options.y ?? 12,
    }, {
      autoAlpha: 1,
      x: 0,
      y: 0,
      duration: 0.29,
      ease: "power2.out",
      clearProps: "transform,opacity,visibility",
      overwrite: "auto",
    });
  }

  function animateScreenExit(screen) {
    if (!screen || !canAnimate()) return;
    gsap.killTweensOf(screen);
    gsap.to(screen, { autoAlpha: 0, y: -6, duration: 0.14, ease: "power1.out", overwrite: "auto" });
  }

  function transitionScreen(previous, next, direction = 0) {
    if (previous === next) {
      animateBottomNavIndicator(document.querySelector(`.bottom-nav [data-tab="${next?.dataset.screen || ""}"]`));
      return;
    }
    cleanupScreenAnimations(previous);
    if (previous && previous !== next) animateScreenExit(previous);
    animateScreenEnter(next, { x: direction * 8, y: direction ? 0 : 12 });
    const activeButton = document.querySelector(`.bottom-nav [data-tab="${next?.dataset.screen || ""}"]`);
    animateBottomNavIndicator(activeButton);
  }

  function animateListEnter(elements, options = {}) {
    const rows = Array.from(elements || []).filter((element, index) => {
      const key = element.dataset.motionKey || `${options.scope || "list"}:${index}:${element.textContent?.trim().slice(0, 32)}`;
      if (animatedKeys.has(key)) return false;
      animatedKeys.add(key);
      if (animatedKeys.size > 1200) {
        Array.from(animatedKeys).slice(0, 300).forEach((oldKey) => animatedKeys.delete(oldKey));
      }
      return true;
    }).slice(0, options.limit || 12);
    if (!rows.length || !canAnimate()) return;
    gsap.fromTo(rows, { autoAlpha: 0, y: options.y ?? 12 }, {
      autoAlpha: 1,
      y: 0,
      duration: options.duration || 0.28,
      stagger: options.stagger || 0.035,
      ease: "power2.out",
      clearProps: "transform,opacity,visibility",
      overwrite: "auto",
    });
  }

  function overlayPanel(modal, sheet) {
    if (!modal) return null;
    if (sheet) return modal.querySelector(".exercise-library-dialog, .exercise-step-dialog, .support-dialog, .board-report-dialog, [data-sheet-panel]") || modal.firstElementChild;
    return modal.querySelector(".profile-dialog, .complaint-dialog, .board-report-dialog, .auth-dialog, [role='document']") || modal.firstElementChild;
  }

  function openOverlay(modal, options = {}) {
    if (!modal) return;
    const panel = overlayPanel(modal, options.sheet);
    const previous = overlayTweens.get(modal);
    previous?.kill?.();
    if (!canAnimate() || !panel) {
      modal.style.removeProperty("opacity");
      resetElement(panel);
      completeImmediately(options.onComplete);
      return;
    }
    const timeline = gsap.timeline({ onComplete: options.onComplete });
    overlayTweens.set(modal, timeline);
    timeline.fromTo(modal, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.22, ease: "power1.out" }, 0);
    timeline.fromTo(panel,
      options.sheet ? { yPercent: 100 } : { autoAlpha: 0, y: 14, scale: 0.965 },
      options.sheet
        ? { yPercent: 0, duration: 0.34, ease: "power3.out", clearProps: "transform" }
        : { autoAlpha: 1, y: 0, scale: 1, duration: 0.25, ease: "power2.out", clearProps: "transform,opacity,visibility" },
      0
    );
  }

  function closeOverlay(modal, options = {}) {
    if (!modal) return completeImmediately(options.onComplete);
    const panel = overlayPanel(modal, options.sheet);
    const previous = overlayTweens.get(modal);
    previous?.kill?.();
    if (!canAnimate() || !panel) return completeImmediately(options.onComplete);
    const timeline = gsap.timeline({ onComplete: options.onComplete });
    overlayTweens.set(modal, timeline);
    timeline.to(panel, options.sheet
      ? { yPercent: 100, duration: 0.27, ease: "power2.in" }
      : { autoAlpha: 0, y: 8, scale: 0.98, duration: 0.18, ease: "power1.in" }, 0);
    timeline.to(modal, { autoAlpha: 0, duration: 0.18, ease: "power1.in" }, 0.06);
  }

  function animateCounter(element, target, formatter = String, options = {}) {
    if (!element) return;
    const next = Number(target) || 0;
    const previous = counterValues.has(element) ? counterValues.get(element) : next;
    counterValues.set(element, next);
    if (!canAnimate() || previous === next) {
      element.textContent = formatter(next);
      return;
    }
    const value = { current: previous };
    gsap.to(value, {
      current: next,
      duration: options.duration || 0.56,
      ease: "power2.out",
      overwrite: "auto",
      onUpdate: () => { element.textContent = formatter(value.current); },
      onComplete: () => { element.textContent = formatter(next); },
    });
  }

  function animateProgress(element, ratio, options = {}) {
    if (!element) return;
    const value = Math.max(0, Math.min(1, Number(ratio) || 0));
    element.style.width = "100%";
    element.style.transformOrigin = "left center";
    if (!canAnimate()) {
      element.style.transform = `scaleX(${value})`;
      return;
    }
    gsap.to(element, { scaleX: value, duration: options.duration || 0.58, ease: "power2.out", overwrite: "auto" });
  }

  function animateSuccess(element) {
    if (!element || !canAnimate()) return;
    gsap.timeline().to(element, { scale: 1.025, duration: 0.12, ease: "power1.out" }).to(element, { scale: 1, duration: 0.18, ease: "power2.out", clearProps: "transform" });
  }

  function animateError(element) {
    if (!element || !canAnimate()) return;
    gsap.fromTo(element, { x: -3 }, { x: 0, duration: 0.24, ease: "power2.out", clearProps: "transform" });
  }

  function animateSwap(element, direction = 1) {
    if (!element || !canAnimate()) return;
    gsap.fromTo(element, { autoAlpha: 0, x: direction * 10 }, { autoAlpha: 1, x: 0, duration: 0.25, ease: "power2.out", clearProps: "transform,opacity,visibility", overwrite: "auto" });
  }

  function animateContentChange(element, direction = 1) {
    if (!element || !canAnimate()) return;
    gsap.killTweensOf(element);
    gsap.fromTo(element, { autoAlpha: 0.35, x: direction * 10 }, {
      autoAlpha: 1,
      x: 0,
      duration: 0.22,
      ease: "power2.out",
      clearProps: "transform,opacity,visibility",
      overwrite: "auto",
    });
  }

  function animateSelection(element) {
    if (!element || !canAnimate()) return;
    gsap.killTweensOf(element);
    gsap.fromTo(element, { scale: 0.985 }, {
      scale: 1,
      duration: 0.2,
      ease: "power2.out",
      clearProps: "transform",
      overwrite: "auto",
    });
  }

  function revealImage(image) {
    if (!image || image.dataset.motionLoaded === "1") return;
    image.dataset.motionLoaded = "1";
    image.classList.add("is-motion-loaded");
    if (!canAnimate()) return;
    gsap.fromTo(image, { autoAlpha: 0, scale: 1.025 }, {
      autoAlpha: 1,
      scale: 1,
      duration: 0.24,
      ease: "power2.out",
      clearProps: "transform,opacity,visibility",
      overwrite: "auto",
    });
  }

  function animateButtonComplete(button) {
    if (!button || !canAnimate()) return;
    gsap.killTweensOf(button);
    gsap.timeline({ defaults: { overwrite: "auto" } })
      .to(button, { scale: 0.985, duration: 0.08, ease: "power1.out" })
      .to(button, { scale: 1.015, boxShadow: "0 0 0 1px rgba(102,201,135,.35), 0 10px 28px rgba(102,201,135,.18)", duration: 0.16, ease: "power2.out" })
      .to(button, { scale: 1, boxShadow: "", duration: 0.24, ease: "power2.out", clearProps: "transform,boxShadow" });
  }

  function animateWorkoutSuccess(button, elements = []) {
    if (!canAnimate()) return;
    const targets = Array.from(elements || []).filter(Boolean);
    animateButtonComplete(button);
    if (targets.length) {
      gsap.fromTo(targets, { autoAlpha: 0.4, y: 8 }, {
        autoAlpha: 1,
        y: 0,
        duration: 0.28,
        stagger: 0.04,
        ease: "power2.out",
        clearProps: "transform,opacity,visibility",
        overwrite: "auto",
      });
    }
  }

  function animateSetChipComplete(chip) {
    if (!chip || !canAnimate()) return;
    const burst = document.createElement("span");
    burst.className = "record-chip-burst";
    const particles = Array.from({ length: 7 }, (_, index) => {
      const particle = document.createElement("i");
      burst.append(particle);
      return particle;
    });
    chip.append(burst);
    gsap.killTweensOf(chip);
    gsap.timeline({
      defaults: { overwrite: "auto" },
      onComplete: () => {
        burst.remove();
        gsap.set(chip, { clearProps: "transform,filter" });
      },
    })
      .fromTo(chip, { scale: 0.94 }, { scale: 1.08, filter: "brightness(1.25)", duration: 0.13, ease: "power2.out" })
      .to(chip, { scale: 1, filter: "brightness(1)", duration: 0.22, ease: "back.out(1.7)" });
    particles.forEach((particle, index) => {
      const angle = (Math.PI * 2 * index) / particles.length;
      const distance = 15 + (index % 2) * 4;
      gsap.fromTo(particle, {
        x: 0,
        y: 0,
        scale: 0.35,
        autoAlpha: 1,
      }, {
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        scale: 1,
        autoAlpha: 0,
        duration: 0.36,
        delay: index * 0.012,
        ease: "power2.out",
      });
    });
  }

  function animateToast(element) {
    if (!element || !canAnimate()) return;
    gsap.fromTo(element, { autoAlpha: 0, y: 12, scale: 0.98 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.22, ease: "power2.out", clearProps: "transform,opacity,visibility", overwrite: "auto" });
  }

  function animateRestComplete(element) {
    if (!element) return;
    const panel = element.querySelector(".rest-complete-alert-panel");
    const glow = element.querySelector(".rest-complete-alert-glow");
    element.hidden = false;
    if (!canAnimate() || !panel) {
      element.classList.add("is-visible");
      window.setTimeout(() => {
        element.classList.remove("is-visible");
        element.hidden = true;
      }, 2200);
      return;
    }
    gsap.killTweensOf([element, panel, glow]);
    const timeline = gsap.timeline({
      onComplete: () => {
        element.hidden = true;
        gsap.set([element, panel, glow], { clearProps: "all" });
      },
    });
    timeline
      .fromTo(element, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.16, ease: "power1.out" }, 0)
      .fromTo(panel, { autoAlpha: 0, y: 26, scale: 0.78 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.42, ease: "back.out(1.8)" }, 0.02)
      .fromTo(glow, { autoAlpha: 0.8, scale: 0.35 }, { autoAlpha: 0, scale: 1.7, duration: 0.68, ease: "power2.out" }, 0.08)
      .fromTo(panel.querySelector("strong"), { scale: 0.8 }, { scale: 1, duration: 0.34, ease: "back.out(2.4)" }, 0.12)
      .to(panel, { scale: 1.025, duration: 0.14, ease: "power1.inOut" }, 0.7)
      .to(panel, { scale: 1, duration: 0.18, ease: "power2.out" }, 0.84)
      .to(element, { autoAlpha: 0, duration: 0.24, ease: "power1.in" }, 2.05);
  }

  function cleanupScreenAnimations(screen) {
    if (!screen || !gsap) return;
    gsap.killTweensOf([screen, ...screen.querySelectorAll("[data-motion-key]")]);
  }

  function syncVisualViewport() {
    const viewport = window.visualViewport;
    const height = viewport?.height || window.innerHeight;
    document.documentElement.style.setProperty("--visual-viewport-height", `${height}px`);
    document.body.classList.toggle("keyboard-open", height < window.innerHeight * 0.78);
  }

  function init() {
    if (initialized) return;
    initialized = true;
    document.documentElement.classList.toggle("has-gsap", Boolean(gsap));
    document.documentElement.classList.add("motion-ready");
    bindTouchFeedback();
    ensureNavIndicator();
    animateBottomNavIndicator(document.querySelector(".bottom-nav [data-tab].is-active"), true);
    viewportHandler = () => window.requestAnimationFrame(() => {
      syncVisualViewport();
      animateBottomNavIndicator(document.querySelector(".bottom-nav [data-tab].is-active"), true);
    });
    window.visualViewport?.addEventListener("resize", viewportHandler, { passive: true });
    window.addEventListener("resize", viewportHandler, { passive: true });
    syncVisualViewport();
  }

  window.SetCounterMotion = {
    init,
    animatePress,
    animateScreenEnter,
    animateScreenExit,
    transitionScreen,
    animateListEnter,
    openOverlay,
    closeOverlay,
    animateCounter,
    animateProgress,
    animateSuccess,
    animateError,
    animateSwap,
    animateContentChange,
    animateSelection,
    revealImage,
    animateButtonComplete,
    animateSetChipComplete,
    animateWorkoutSuccess,
    animateToast,
    animateRestComplete,
    animateBottomNavIndicator,
    cleanupScreenAnimations,
    reduced: () => reducedQuery.matches,
  };
})();
