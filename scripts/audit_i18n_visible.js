const { chromium } = require("playwright");

const baseUrl = process.env.SETCOUNTER_QA_URL || "http://127.0.0.1:5068";
const chromePath = process.env.CHROME_PATH || "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
const language = process.env.SETCOUNTER_QA_LANG || "ja";
const locale = { ja: "ja-JP", zh: "zh-CN", ru: "ru-RU" }[language] || "en-US";

async function collectLatin(page, selector = "body") {
  return page.locator(selector).evaluate((root) => {
    const found = new Set();
    const visible = (element) => {
      const style = getComputedStyle(element);
      return style.display !== "none" && style.visibility !== "hidden" && !element.hidden;
    };
    for (const element of [root, ...root.querySelectorAll("*")]) {
      if (!visible(element) || element.closest("[data-i18n-skip], script, style")) continue;
      if (element.children.length === 0) {
        const text = (element.textContent || "").replace(/\s+/g, " ").trim();
        if (/[A-Za-z]{2,}/.test(text)) found.add(text);
      }
      for (const attribute of ["placeholder", "aria-label", "title"]) {
        const value = element.getAttribute?.(attribute);
        if (/[A-Za-z]{2,}/.test(value || "")) found.add(`${attribute}: ${value}`);
      }
    }
    return [...found];
  });
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: chromePath });
  const context = await browser.newContext({ locale, viewport: { width: 390, height: 844 } });
  const userKey = `i18n-latin-audit-${language}-20260811`;
  await context.addInitScript(({ key, selectedLanguage }) => {
    localStorage.setItem("setcounterLanguage", selectedLanguage);
    localStorage.setItem("healthUserKey", key);
  }, { key: userKey, selectedLanguage: language });
  await context.request.get(`${baseUrl}/api/auth/status`, { headers: { "X-User-Key": userKey } });
  const page = await context.newPage();
  await page.goto(`${baseUrl}/main`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1200);
  await page.evaluate(() => {
    document.querySelector("#profileModal")?.setAttribute("hidden", "");
    document.body.classList.remove("modal-open", "menu-overlay-open");
  });

  const report = {};
  report.probes = await page.evaluate(() => ({
    patternCount: Object.keys(window.SetCounterLocaleData[document.documentElement.lang].patterns).length,
    warmPattern: window.SetCounterLocaleData[document.documentElement.lang].patterns["Warm-up $1"],
    addPattern: window.SetCounterLocaleData[document.documentElement.lang].patterns["Add $1"],
    translations: Object.fromEntries([
      "Warm-up 3",
      "Add test",
      "Show more (844 remaining)",
      "5 exercises",
      "Reach 1 more personal best for Level 2",
      "Complete set, 0 of 3 sets complete",
    ].map((value) => [value, window.SetCounterI18n.t(value)])),
  }));
  for (const screen of ["home", "record", "calendar", "board", "menu"]) {
    await page.evaluate((name) => document.querySelector(`[data-tab="${name}"]`)?.click(), screen);
    await page.waitForTimeout(250);
    report[screen] = await collectLatin(page, `[data-screen="${screen}"]`);
  }

  await page.evaluate(() => {
    document.querySelector("[data-tab=home]")?.click();
    document.querySelector(".workout-plan-card")?.click();
  });
  await page.waitForTimeout(350);
  report.plan = await collectLatin(page, '[data-screen="plan"]');
  await page.evaluate(() => document.querySelector(".plan-workout-row.is-selectable")?.click());
  await page.waitForTimeout(200);
  report.planExercise = await collectLatin(page, "#planExerciseDetailModal");
  await page.evaluate(() => {
    document.querySelector("#closePlanExerciseDetailButton")?.click();
    document.querySelector("[data-tab=record]")?.click();
    document.querySelector("#openExerciseLibraryButton")?.click();
  });
  await page.waitForTimeout(600);
  report.library = await collectLatin(page, "#exerciseLibraryModal");

  for (const route of ["privacy", "terms", "account-deletion"]) {
    await page.goto(`${baseUrl}/${route}`, { waitUntil: "domcontentloaded" });
    report[route] = await collectLatin(page);
  }

  const allowedLatin = new Set([
    "SET", "COUNTER", "Set", "Counter", "SetCounter", "North", "Star", "Labs",
    "SOS", "XP", "FAQ", "kg", "KO", "EN", "JA", "ES", "ZH", "RU", "English", "Español", "EZ", "SMR",
    "SDK", "Web", "ID", "IP", "HMAC", "Render", "Services", "Inc", "Discord",
    "HttpOnly", "HTTPS", "CSRF", "Neon", "Cookie", "cookie", "gmail", "com", "v", "aria", "label",
    "Espa", "ol", "northstarlabshelp",
  ]);
  const visibleStrings = Object.entries(report)
    .filter(([key, value]) => key !== "probes" && Array.isArray(value))
    .flatMap(([, value]) => value);
  const unexpectedLatinTokens = [...new Set(visibleStrings.flatMap((value) => value.match(/[A-Za-z]+/g) || []))]
    .filter((token) => !allowedLatin.has(token));
  report.unexpectedLatinTokens = unexpectedLatinTokens;
  report.unexpectedTargetScript = visibleStrings.filter((value) => {
    if (language === "zh") return /[\u0400-\u04ff]/.test(value);
    if (language === "ru") return /[\u3400-\u9fff]/.test(value);
    return false;
  });
  console.log(JSON.stringify(report, null, 2));
  await browser.close();
  if (unexpectedLatinTokens.length || report.unexpectedTargetScript.length) process.exitCode = 1;
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
