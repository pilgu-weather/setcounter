const { chromium } = require("playwright");

const BASE_URL = process.env.SETCOUNTER_QA_URL || "http://127.0.0.1:5065";
const CHROME = process.env.CHROME_PATH || "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
const LANG = process.env.SETCOUNTER_QA_LANG || "en";
const EXPECTED = {
  en: { locale: "en-US", home: "Home", view: "View", muscleBasis: "Based on completed sets", sets: /sets/i, reps: /reps/i },
  ja: { locale: "ja-JP", home: "ホーム", view: "表示", muscleBasis: "完了したセットに基づく", sets: /セット/, reps: /回/ },
  es: { locale: "es-ES", home: "Inicio", view: "Ver", muscleBasis: "Basado en series completadas", sets: /series/i, reps: /repeticiones/i },
  zh: { locale: "zh-CN", home: "首页", view: "查看", muscleBasis: "按已完成组数计算", sets: /组/, reps: /次/ },
  ru: { locale: "ru-RU", home: "Главная", view: "Просмотр", muscleBasis: "По завершённым подходам", sets: /подход/i, reps: /повтор/i },
};
const expected = EXPECTED[LANG];
if (!expected) throw new Error(`Unsupported QA language: ${LANG}`);
const hangul = /[\uac00-\ud7a3]/;
const localizedExercises = LANG === "en"
  ? null
  : require(`../static/data/free-exercise-db/localized_exercises_${LANG}.json`).items;

async function visibleKorean(page, selector) {
  return page.locator(selector).evaluateAll((elements) => {
    const found = new Set();
    const hasHangul = (value) => /[\uac00-\ud7a3]/.test(value || "");
    const visible = (element) => {
      const style = getComputedStyle(element);
      return style.display !== "none" && style.visibility !== "hidden" && !element.hidden;
    };
    for (const root of elements) {
      if (!visible(root)) continue;
      for (const element of [root, ...root.querySelectorAll("*")]) {
        if (!visible(element)) continue;
        if (element.closest("[data-i18n-skip], .nickname-text, .board-post-copy, .board-comment-copy")) continue;
        if (element.children.length === 0) {
          const text = (element.textContent || "").trim();
          if (hasHangul(text)) found.add(text);
        }
        for (const attr of ["placeholder", "aria-label", "title"]) {
          const value = element.getAttribute(attr);
          if (hasHangul(value)) found.add(`${attr}: ${value}`);
        }
      }
    }
    return [...found];
  });
}

async function allKorean(page) {
  return page.locator("body").evaluate((root) => {
    const found = new Set();
    for (const element of root.querySelectorAll("*:not(script):not(style)")) {
      if (element.closest("[data-i18n-skip], .nickname-text, .board-post-copy, .board-comment-copy")) continue;
      if (element.children.length === 0 && /[\uac00-\ud7a3]/.test((element.textContent || "").trim())) found.add((element.textContent || "").trim());
      for (const attr of ["placeholder", "aria-label", "title"]) {
        const value = element.getAttribute(attr);
        if (/[\uac00-\ud7a3]/.test(value || "")) found.add(`${attr}: ${value}`);
      }
    }
    return [...found];
  });
}

async function targetKorean(page, selector) {
  return page.locator(selector).evaluate((root) => {
    const found = new Set();
    for (const element of [root, ...root.querySelectorAll("*:not(script):not(style)")]) {
      if (element.closest("[data-i18n-skip], .nickname-text, .board-post-copy, .board-comment-copy")) continue;
      if (element.children.length === 0 && /[\uac00-\ud7a3]/.test((element.textContent || "").trim())) found.add((element.textContent || "").trim());
      for (const attr of ["placeholder", "aria-label", "title"]) {
        const value = element.getAttribute?.(attr);
        if (/[\uac00-\ud7a3]/.test(value || "")) found.add(`${attr}: ${value}`);
      }
    }
    return [...found];
  });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: CHROME });
  const context = await browser.newContext({ locale: expected.locale, viewport: { width: 390, height: 844 } });
  const qaKey = `i18n-qa-${LANG}-20260811-000000000001`;
  await context.addInitScript(({ language, userKey }) => {
    localStorage.setItem("setcounterLanguage", language);
    localStorage.setItem("healthUserKey", userKey);
  }, { language: LANG, userKey: qaKey });
  const authStatus = await context.request.get(`${BASE_URL}/api/auth/status`, { headers: { "X-User-Key": qaKey } });
  assert(authStatus.ok(), `Could not initialize QA guest: ${authStatus.status()}`);
  const csrfToken = (await authStatus.json()).csrfToken;
  for (const [exercise, reps] of [["Tricep Dumbbell Kickback", 7], ["Seated Triceps Press", 10]]) {
    const created = await context.request.post(`${BASE_URL}/api/logs`, {
      headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken, "X-User-Key": qaKey },
      data: { exercise, date: "2026-08-06", weightKg: 8, completedSets: 3, targetSets: 3, setWeights: [8, 8, 8], setReps: [reps, reps, reps], restSeconds: 90 },
    });
    assert(created.ok(), `Could not seed ${exercise}: ${created.status()}`);
  }
  const page = await context.newPage();
  page.setDefaultTimeout(3000);
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error" && !message.text().startsWith("Failed to load resource:")) consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));

  await page.goto(`${BASE_URL}/main`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1200);
  await page.evaluate(() => {
    const profile = document.querySelector("#profileModal");
    if (profile) profile.hidden = true;
  });
  await page.locator(".workout-plan-card").first().waitFor({ state: "attached", timeout: 12000 });
  await page.evaluate(() => {
    const profile = document.querySelector("#profileModal");
    if (profile) profile.hidden = true;
    document.body.classList.remove("modal-open", "menu-overlay-open");
  });

  const report = {};
  for (const screen of ["home", "record", "calendar", "board", "menu"]) {
    await page.evaluate((name) => {
      document.querySelector(`[data-tab="${name}"]`)?.click();
      document.querySelectorAll("[data-screen]").forEach((item) => item.classList.toggle("is-active", item.dataset.screen === name));
    }, screen);
    await page.waitForTimeout(350);
    assert(await page.locator(`[data-screen="${screen}"]`).evaluate((element) => element.classList.contains("is-active")), `${screen} did not activate`);
    report[screen] = await targetKorean(page, `[data-screen="${screen}"]`);
  }

  await page.evaluate(() => {
    document.querySelector('[data-tab="calendar"]')?.click();
    document.querySelector(".history-day-button")?.click();
  });
  await page.waitForTimeout(350);
  report.calendarSelectedDay = await targetKorean(page, '[data-screen="calendar"]');
  const calendarSemantics = await page.evaluate(() => ({
    historyAction: document.querySelector(".history-open")?.textContent?.trim(),
    details: [...document.querySelectorAll(".day-log-item")].map((item) => item.innerText),
    muscleBasis: document.querySelector(".day-muscle-summary-head small")?.textContent?.trim(),
  }));
  const kickbackName = LANG === "en" ? "Tricep Dumbbell Kickback" : localizedExercises.Tricep_Dumbbell_Kickback.name;
  const seatedPressName = LANG === "en" ? "Seated Triceps Press" : localizedExercises.Seated_Triceps_Press.name;
  assert(calendarSemantics.historyAction === expected.view, `Unexpected calendar action: ${calendarSemantics.historyAction}`);
  assert(calendarSemantics.details.some((text) => text.includes(kickbackName)), `Kickback name was not localized: ${JSON.stringify(calendarSemantics)}`);
  assert(calendarSemantics.details.some((text) => text.includes(seatedPressName)), `Seated Triceps Press was not localized: ${JSON.stringify(calendarSemantics)}`);
  assert(calendarSemantics.details.every((text) => expected.sets.test(text) && expected.reps.test(text)), `Calendar metadata was not fully translated: ${calendarSemantics.details.join(" | ")}`);
  assert(calendarSemantics.muscleBasis === expected.muscleBasis, `Unexpected muscle basis: ${calendarSemantics.muscleBasis}`);

  const planCardCount = await page.locator(".workout-plan-card").count();
  assert(planCardCount > 0, "No workout plan cards rendered");
  await page.evaluate(() => {
    document.querySelector("[data-tab=home]")?.click();
    document.querySelector(".workout-plan-card")?.click();
  });
  await page.waitForTimeout(500);
  assert(await page.locator('[data-screen="plan"]').evaluate((element) => element.classList.contains("is-active")), "Plan detail did not open");
  report.planDetail = await targetKorean(page, '[data-screen="plan"]');
  const planRows = page.locator(".plan-workout-row.is-selectable");
  assert(await planRows.count() > 0, "Plan exercise rows did not render");
  await page.evaluate(() => document.querySelector(".plan-workout-row.is-selectable")?.click());
  await page.waitForTimeout(250);
  assert(!(await page.locator("#planExerciseDetailModal").evaluate((element) => element.hidden)), "Plan exercise detail did not open");
  report.planExerciseDetail = await targetKorean(page, "#planExerciseDetailModal");
  await page.evaluate(() => document.querySelector("#closePlanExerciseDetailButton")?.click());

  await page.evaluate(() => {
    document.querySelector("[data-tab=record]")?.click();
    document.querySelector("#exerciseGrid button")?.click();
  });
  await page.waitForTimeout(400);
  await page.evaluate(() => document.querySelector("#exerciseDetailToggle")?.click());
  await page.waitForTimeout(200);
  report.exerciseDetail = await targetKorean(page, "#exerciseDetailCard");
  await page.evaluate(() => {
    document.querySelector("#openExerciseLibraryButton")?.click();
  });
  await page.waitForTimeout(700);
  assert(await page.locator(".library-exercise-card").count() > 0, "Exercise library did not render rows");
  report.exerciseLibrary = await targetKorean(page, "#exerciseLibraryModal");
  await page.evaluate(() => document.querySelector(".library-exercise-detail-button")?.click());
  await page.waitForTimeout(200);
  report.exerciseLibraryExpanded = await targetKorean(page, "#exerciseLibraryModal");
  await page.evaluate(() => document.querySelector("#closeExerciseLibraryButton")?.click());
  report.allAppDom = await allKorean(page);

  const semantics = await page.evaluate(() => ({
    lang: document.documentElement.lang,
    homeNav: document.querySelector('[data-tab="home"] span')?.textContent?.trim(),
    planHeading: document.querySelector("#planDetailTitle")?.textContent?.trim(),
    firstPlanMeta: document.querySelector(".plan-workout-row small")?.textContent?.trim(),
    libraryCount: document.querySelector("#exerciseLibraryCount")?.textContent?.trim(),
  }));
  assert(semantics.lang === LANG, `Unexpected document language: ${semantics.lang}`);
  assert(semantics.homeNav === expected.home, `Unexpected Home label: ${semantics.homeNav}`);
  assert(Boolean(semantics.planHeading) && !hangul.test(semantics.planHeading), `Unexpected plan heading: ${semantics.planHeading}`);
  assert(expected.sets.test(semantics.firstPlanMeta || "") || /\d{2}:\d{2}/i.test(semantics.firstPlanMeta || ""), `Unclear plan metadata: ${semantics.firstPlanMeta}`);
  report.semanticAssertions = [];

  for (const route of ["privacy", "terms", "account-deletion"]) {
    await page.goto(`${BASE_URL}/${route}`, { waitUntil: "domcontentloaded" });
    report[route] = await targetKorean(page, "body");
  }

  report.responsive = {};
  for (const viewport of [{ width: 360, height: 800 }, { width: 390, height: 844 }, { width: 430, height: 932 }]) {
    await page.setViewportSize(viewport);
    await page.goto(`${BASE_URL}/main`, { waitUntil: "domcontentloaded" });
    await page.locator(".workout-plan-card").first().waitFor({ state: "attached", timeout: 12000 });
    await page.evaluate(() => {
      const profile = document.querySelector("#profileModal");
      if (profile) profile.hidden = true;
      document.body.classList.remove("modal-open", "menu-overlay-open");
    });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    assert(overflow <= 1, `${viewport.width}px viewport has ${overflow}px horizontal overflow`);
    await page.evaluate(() => document.querySelector('[data-tab="record"]')?.click());
    const timerLayout = await page.evaluate(() => {
      const output = document.querySelector("#restDurationValue");
      const timer = document.querySelector("#restTimer");
      const outputRect = output?.getBoundingClientRect();
      return {
        timerWidth: timer?.getBoundingClientRect().width || 0,
        outputWidth: outputRect?.width || 0,
        outputHeight: outputRect?.height || 0,
        lineHeight: Number.parseFloat(getComputedStyle(output).lineHeight),
        whiteSpace: getComputedStyle(output).whiteSpace,
        clipped: output ? output.scrollWidth > output.clientWidth + 1 : true,
      };
    });
    assert(timerLayout.whiteSpace === "nowrap" && !timerLayout.clipped, `${viewport.width}px timer label wrapped or clipped: ${JSON.stringify(timerLayout)}`);
    await page.evaluate(() => document.querySelector('[data-tab="menu"]')?.click());
    const languageLayout = await page.evaluate(() => {
      const row = document.querySelector(".menu-language-row");
      const buttons = [...document.querySelectorAll(".language-segmented button")];
      return {
        rowOverflow: row ? row.scrollWidth - row.clientWidth : 999,
        buttonHeights: buttons.map((button) => button.getBoundingClientRect().height),
        buttonWidths: buttons.map((button) => button.getBoundingClientRect().width),
      };
    });
    assert(languageLayout.rowOverflow <= 1, `${viewport.width}px language selector overflows: ${JSON.stringify(languageLayout)}`);
    assert(languageLayout.buttonHeights.every((height) => height >= 44), `${viewport.width}px language touch target is too short: ${JSON.stringify(languageLayout)}`);
    assert(languageLayout.buttonWidths.every((width) => width >= 88), `${viewport.width}px language label is clipped: ${JSON.stringify(languageLayout)}`);
    report.responsive[`${viewport.width}x${viewport.height}`] = await allKorean(page);
  }

  const flatten = (value) => Array.isArray(value)
    ? value.flatMap(flatten)
    : (value && typeof value === "object" ? Object.values(value).flatMap(flatten) : [value]);
  const remaining = flatten(report).filter((value) => hangul.test(String(value || "")));
  console.log(JSON.stringify({ language: LANG, report, remainingCount: remaining.length, consoleErrors }, null, 2));
  await browser.close();
  if (remaining.length || consoleErrors.length) process.exitCode = 1;
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
