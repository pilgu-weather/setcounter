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
    const recordAction = element.matches?.(".record-action-button");
    gsap.to(element, {
      y: recordAction && pressed ? 3 : 0,
      scale: pressed ? (recordAction ? 0.988 : 0.97) : 1,
      duration: pressed ? (recordAction ? 0.065 : 0.09) : (recordAction ? 0.2 : 0.14),
      ease: pressed ? "power1.out" : (recordAction ? "back.out(2.2)" : "power2.out"),
      overwrite: "auto",
    });
    const face = recordAction ? element.querySelector(".record-action-face") : null;
    if (face) {
      gsap.to(face, {
        y: pressed ? 1 : 0,
        scale: pressed ? 0.995 : 1,
        duration: pressed ? 0.065 : 0.18,
        ease: pressed ? "power1.out" : "back.out(2)",
        overwrite: "auto",
      });
    }
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

  function planArrowOwner(target) {
    return target instanceof Element
      ? target.closest(".workout-plan-card, .plan-workout-row.is-selectable, .plan-detail-cta button")
      : null;
  }

  function animatePlanArrow(owner, active) {
    const arrow = owner?.querySelector(".plan-arrow");
    if (!arrow || !canAnimate()) return;
    gsap.to(arrow, {
      x: active ? 3 : 0,
      scale: active ? 1.08 : 1,
      duration: active ? 0.2 : 0.24,
      ease: active ? "back.out(1.8)" : "power2.out",
      overwrite: "auto",
    });
  }

  function bindPlanArrowFeedback() {
    document.addEventListener("pointerover", (event) => {
      const owner = planArrowOwner(event.target);
      if (!owner || (event.relatedTarget instanceof Node && owner.contains(event.relatedTarget))) return;
      animatePlanArrow(owner, true);
    }, { passive: true });
    document.addEventListener("pointerout", (event) => {
      const owner = planArrowOwner(event.target);
      if (!owner || (event.relatedTarget instanceof Node && owner.contains(event.relatedTarget))) return;
      animatePlanArrow(owner, false);
    }, { passive: true });
    document.addEventListener("focusin", (event) => animatePlanArrow(planArrowOwner(event.target), true));
    document.addEventListener("focusout", (event) => animatePlanArrow(planArrowOwner(event.target), false));
  }

  function animatePlanArrows(root = document) {
    const arrows = Array.from(root?.querySelectorAll?.(".plan-arrow") || []).filter((arrow) => {
      if (arrow.dataset.motionArrowReady === "1") return false;
      arrow.dataset.motionArrowReady = "1";
      return true;
    });
    if (!arrows.length || !canAnimate()) return;
    gsap.fromTo(arrows, {
      autoAlpha: 0,
      x: -7,
      scale: 0.72,
    }, {
      autoAlpha: 1,
      x: 0,
      scale: 1,
      duration: 0.34,
      stagger: 0.035,
      ease: "back.out(1.7)",
      clearProps: "transform,opacity,visibility",
      overwrite: "auto",
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
    if (next?.dataset.screen === "home" && !document.querySelector("#appLaunchSplash")) {
      animateHomeBrand(next);
    }
  }

  function animateHomeBrand(screen = document.querySelector('[data-screen="home"]')) {
    const title = screen?.querySelector("#homeTitle");
    const letterGroup = title?.querySelector(".home-brand-letters");
    const letters = title?.querySelectorAll(".home-brand-word i");
    if (!title || !letterGroup || !letters?.length) return;
    if (!canAnimate()) {
      resetElement(title);
      letters.forEach((letter) => resetElement(letter));
      return;
    }
    gsap.killTweensOf([title, letterGroup, letters]);
    gsap.timeline({ defaults: { overwrite: "auto" } })
      .fromTo(letters, {
        autoAlpha: 0,
        y: 13,
        rotateX: -24,
        filter: "blur(4px)",
      }, {
        autoAlpha: 1,
        y: 0,
        rotateX: 0,
        filter: "blur(0px)",
        duration: 0.42,
        stagger: 0.028,
        ease: "power3.out",
        clearProps: "transform,opacity,visibility,filter",
      })
      .fromTo(letterGroup, {
        backgroundPosition: "110% 50%",
      }, {
        backgroundPosition: "24% 50%",
        duration: 0.62,
        ease: "power2.inOut",
      }, 0.13)
      .fromTo(title, {
        textShadow: "0 0 0 rgba(46,124,255,0)",
      }, {
        textShadow: "0 0 24px rgba(46,124,255,0.24)",
        duration: 0.26,
        yoyo: true,
        repeat: 1,
        ease: "power1.inOut",
        clearProps: "textShadow",
      }, 0.24);
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
    if (button?.matches?.(".record-save-button")) animateRecordSaveComplete(button);
    else animateButtonComplete(button);
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

  function createRecordActionBurst(button, count = 8) {
    const burst = document.createElement("span");
    burst.className = "record-action-burst";
    const particles = Array.from({ length: count }, () => {
      const particle = document.createElement("i");
      burst.append(particle);
      return particle;
    });
    button.append(burst);
    return { burst, particles };
  }

  function animateRecordSetComplete(button, completed, target) {
    if (!button || !canAnimate()) return;
    const face = button.querySelector(".record-action-face");
    const icon = button.querySelector(".record-action-icon");
    const glow = button.querySelector(".record-action-glow");
    const { burst, particles } = createRecordActionBurst(button, 8);
    gsap.killTweensOf([button, face, icon, glow]);
    gsap.timeline({
      defaults: { overwrite: "auto" },
      onComplete: () => {
        burst.remove();
        gsap.set([button, face, icon, glow], { clearProps: "transform,opacity,filter" });
      },
    })
      .fromTo(button, { y: 3, scale: 0.985 }, { y: 0, scale: 1.018, duration: 0.13, ease: "power2.out" }, 0)
      .to(button, { scale: 1, duration: 0.2, ease: "back.out(2.4)" }, 0.13)
      .fromTo(face, { y: 1 }, { y: 0, duration: 0.2, ease: "back.out(2)" }, 0.04)
      .fromTo(icon, { scale: 0.55, rotate: -16 }, { scale: 1.16, rotate: 0, duration: 0.2, ease: "back.out(2.8)" }, 0.04)
      .to(icon, { scale: 1, duration: 0.14, ease: "power2.out" }, 0.23)
      .fromTo(glow, { autoAlpha: 0.72, scaleX: 0.35 }, { autoAlpha: 0, scaleX: 1.1, duration: 0.42, ease: "power2.out" }, 0.02);
    particles.forEach((particle, index) => {
      const angle = Math.PI * (0.1 + (0.8 * index) / Math.max(1, particles.length - 1));
      const distance = 20 + (index % 3) * 5;
      gsap.fromTo(particle, { x: 0, y: 0, scale: 0.4, autoAlpha: 0.95 }, {
        x: Math.cos(angle) * distance,
        y: -Math.sin(angle) * distance,
        scale: 0.9,
        autoAlpha: 0,
        duration: 0.38,
        delay: index * 0.012,
        ease: "power2.out",
      });
    });
    button.setAttribute("aria-label", `이번 세트 완료, ${completed}/${target}세트`);
  }

  function animateRecordSaveReady(button) {
    if (!button || !canAnimate()) return;
    const face = button.querySelector(".record-action-face");
    const icon = button.querySelector(".record-action-icon");
    const sheen = button.querySelector(".record-action-sheen");
    gsap.killTweensOf([button, face, icon, sheen]);
    gsap.timeline({ defaults: { overwrite: "auto" } })
      .fromTo(button, { scale: 0.985 }, { scale: 1.012, duration: 0.2, ease: "back.out(2)" }, 0)
      .to(button, { scale: 1, duration: 0.2, ease: "power2.out", clearProps: "transform" }, 0.2)
      .fromTo(icon, { y: 3, autoAlpha: 0.4 }, { y: 0, autoAlpha: 1, duration: 0.24, ease: "back.out(2.4)", clearProps: "transform,opacity,visibility" }, 0.05)
      .fromTo(sheen, { xPercent: -160, autoAlpha: 0 }, { xPercent: 180, autoAlpha: 0.7, duration: 0.52, ease: "power2.inOut", clearProps: "transform,opacity,visibility" }, 0.08);
  }

  function animateRecordSaveComplete(button) {
    if (!button || !canAnimate()) return;
    const face = button.querySelector(".record-action-face");
    const icon = button.querySelector(".record-action-icon");
    const glow = button.querySelector(".record-action-glow");
    const sheen = button.querySelector(".record-action-sheen");
    gsap.killTweensOf([button, face, icon, glow, sheen]);
    gsap.timeline({ defaults: { overwrite: "auto" } })
      .fromTo(button, { y: 3, scale: 0.985 }, { y: 0, scale: 1.018, duration: 0.15, ease: "power2.out" }, 0)
      .to(button, { scale: 1, duration: 0.24, ease: "back.out(2.2)", clearProps: "transform" }, 0.15)
      .fromTo(glow, { autoAlpha: 0.9, scaleX: 0.25 }, { autoAlpha: 0, scaleX: 1.2, duration: 0.58, ease: "power2.out", clearProps: "transform,opacity,visibility" }, 0.02)
      .fromTo(icon, { scale: 0.72, rotate: -12 }, { scale: 1.12, rotate: 0, duration: 0.25, ease: "back.out(2.6)" }, 0.04)
      .to(icon, { scale: 1, duration: 0.16, ease: "power2.out", clearProps: "transform" }, 0.27)
      .fromTo(sheen, { xPercent: -160, autoAlpha: 0 }, { xPercent: 180, autoAlpha: 0.86, duration: 0.58, ease: "power2.inOut", clearProps: "transform,opacity,visibility" }, 0.08);
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

  function animateSeasonMoment(element) {
    if (!element) return;
    const panel = element.querySelector(".season-moment-panel");
    const frames = element.querySelectorAll(".season-moment-frame");
    const bars = element.querySelectorAll(".season-moment-bars i");
    const sweep = element.querySelector(".season-moment-sweep");
    const copy = element.querySelectorAll(".season-moment-kicker, h2, p, button");
    if (!canAnimate() || !panel) {
      element.classList.add("is-visible");
      return;
    }
    gsap.killTweensOf([element, panel, frames, bars, sweep, copy]);
    gsap.timeline({ defaults: { overwrite: "auto" } })
      .fromTo(element, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2, ease: "power1.out" }, 0)
      .fromTo(frames, { autoAlpha: 0, scale: 0.62, rotation: -8 }, { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.72, stagger: 0.07, ease: "expo.out" }, 0.04)
      .fromTo(panel, { autoAlpha: 0, y: 30, scale: 0.82 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.58, ease: "back.out(1.65)" }, 0.08)
      .fromTo(bars, { autoAlpha: 0, scaleY: 0.1 }, { autoAlpha: 1, scaleY: 1, duration: 0.34, stagger: 0.035, ease: "back.out(2.2)" }, 0.3)
      .fromTo(copy, { autoAlpha: 0, y: 11 }, { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.055, ease: "power2.out" }, 0.34)
      .fromTo(sweep, { xPercent: -180, autoAlpha: 0 }, { xPercent: 180, autoAlpha: 0.9, duration: 0.7, ease: "power2.inOut" }, 0.5)
      .to(frames, { scale: 1.025, duration: 0.18, yoyo: true, repeat: 1, ease: "power1.inOut" }, 0.76);
  }

  function closeSeasonMoment(element, onComplete) {
    if (!element) return;
    const targets = [element.querySelector(".season-moment-panel"), ...element.querySelectorAll(".season-moment-frame")].filter(Boolean);
    if (!canAnimate()) {
      element.classList.remove("is-visible");
      onComplete?.();
      return;
    }
    gsap.to(targets, { autoAlpha: 0, y: 10, scale: 0.96, duration: 0.18, ease: "power2.in" });
    gsap.to(element, { autoAlpha: 0, duration: 0.2, delay: 0.06, ease: "power1.in", onComplete });
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
    bindPlanArrowFeedback();
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
    animateHomeBrand,
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
    animatePlanArrows,
    animateWorkoutSuccess,
    animateRecordSetComplete,
    animateRecordSaveReady,
    animateToast,
    animateRestComplete,
    animateSeasonMoment,
    closeSeasonMoment,
    animateBottomNavIndicator,
    cleanupScreenAnimations,
    reduced: () => reducedQuery.matches,
  };
})();
