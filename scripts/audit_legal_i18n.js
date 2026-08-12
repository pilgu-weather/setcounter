const fs = require("fs");
const vm = require("vm");
const path = require("path");

const root = path.resolve(__dirname, "..");
const context = { window: {} };
vm.createContext(context);
for (const file of ["static/js/i18n-locales.js", "static/js/i18n-legal-locales.js"]) {
  vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), context, { filename: file });
}

const required = [
  "Effective: August 12, 2026",
  "Terms of Service and Community Guidelines",
  "Agree to the Terms of Service and Community Guidelines before posting or commenting.",
  "Set Counter (North Star Labs, the “Service”) processes only the information needed to provide workout logging. We do not use advertising or behavioral-tracking SDKs, sell personal information, share it for targeted advertising, or profile users for advertising.",
  "5. Service providers and international processing",
  "6. Your rights",
  "10. Language, regional availability, and policy changes",
  "International transfers occur over encrypted connections when you use account linking, server-backed records, feedback, reporting, or notifications. You may remain a guest and avoid optional feedback, reporting, and notification features. Refusing server and database processing means account linking and server-backed records cannot be provided.",
  "Signed-in users can delete their account and linked data from Profile or the public account deletion page. Guests may request access, correction, deletion, restriction of processing, or withdrawal of consent through in-app feedback. Where applicable law provides, you may lodge a complaint with your local data protection authority.",
  "Render Services, Inc.: Hosts web requests and account and workout records on servers outside Korea, including in the United States. Data is transmitted over encrypted connections while you use the Service and processed until account deletion or termination of the service-provider agreement.",
  "Neon, Inc.: Stores account, workout, and Community data in a database hosted in the Singapore region. Data is transmitted over encrypted connections while you use the Service and processed until account deletion or termination of the service-provider agreement.",
  "Discord Inc.: When you submit feedback or a Community report, your nickname, level, user ID, reported-item details, and message are sent to the operator's channel outside Korea, including in the United States. Submissions are retained only for the operational period needed after handling, then deleted.",
  "7. Account deletion",
  "9. Changes and governing law",
  "10. Language and regional application",
  "Before posting or commenting, you must accept the Terms of Service and Community Guidelines. You must not post abuse, harassment, hate or discrimination; sexual or violent content; child exploitation or abuse material; illegal content; spam or advertising; impersonation; privacy or rights violations; manipulated records; service disruption; unauthorized access; security bypasses; or evasion of enforcement.",
  "You may request account deletion at any time from Profile or the account deletion page. Deleted data cannot be recovered.",
  "Guest use: a browser-generated user key, nickname, and gender used to set starting weights for workout plans",
  "Account linking: email address, securely hashed password, and login session information",
  "Service use: workout dates, exercises, sets, weights, reps, rest times, SOS reasons, weekly goals, level and XP history, and statistics",
  "Community use: posts, comments, likes, report reasons, blocked-user relationships, and moderation actions",
  "Notifications: Web Push subscription endpoints and encryption keys",
  "Feedback: nickname, level, user ID, and submitted message",
  "Security: last access and login times, HMAC-hashed identifiers derived from IP addresses and emails for rate limiting, and restriction status",
  "Hashed identifiers used for login rate limiting are retained for up to seven days after their last update. Minimal security records created during account deletion are kept separately only as necessary to prevent abuse and resolve disputes, then destroyed.",
  "Guest records are linked to a user key. Clearing browser data may remove that key and make existing guest records difficult to access.",
  "Guests may request deletion of guest records through Send Feedback. We identify and process the request using the user ID submitted by the app.",
  "For requests to access, correct, delete, or restrict processing of personal information, and for other privacy questions, use Send Feedback in the app or email:",
  "We will provide notice in the app or on the public policy page before material changes to processed information, purposes, or external processing take effect. When an account is linked, we store the accepted Terms and Privacy Policy versions and the acceptance time in the account record.",
  "Access may be restricted or the agreement terminated immediately without prior warning for urgent or serious conduct, including illegal activity, serious threats, privacy violations, account theft, system attacks, or repeated evasion of enforcement.",
  "As a rule, the operator will explain the reason, scope, and duration of an action through an in-app notice or an account-linked contact method. If urgent action must be taken first, notice will be provided afterward where possible. You may appeal by support email or in-app feedback, and the operator will review the relevant information again.",
  "Parts of the Service may be changed or temporarily suspended for security, incident response, improvements, or operational needs. Material changes will be announced in the app or on the public policy page.",
  "Delete Set Counter account",
  "Account deleted",
  "The email account and its linked workout records, SOS entries, Community activity, and push subscriptions have been deleted. Deleted data cannot be recovered.",
  "Start fresh as a guest",
  "You can delete your account and linked data directly from this page without installing the app.",
  "Data that will be deleted",
  "Email account, nickname, workout and set history, SOS entries, levels and statistics, posts, comments, likes, reports, blocks, and push subscriptions",
  "Account email",
  "Password",
  "I understand that deleted data cannot be recovered.",
  "Permanently delete account and data",
  "Signed-in users can delete their account and linked data from Profile. Without installing the app, you can also use the",
  "to delete your data. Guests may request access, correction, deletion, restriction of processing, or withdrawal of consent through in-app feedback. Where applicable law provides, you may lodge a complaint with your local data protection authority.",
  "You may request account deletion at any time from Profile or the",
  ". Deleted data cannot be recovered.",
  "ACCOUNT & DATA",
];

const failures = [];
for (const locale of ["ja", "es", "zh", "ru"]) {
  const strings = context.window.SetCounterLocaleData?.[locale]?.strings || {};
  for (const source of required) {
    const translated = strings[source];
    if (!translated || translated === source) failures.push(`${locale}: missing translation for ${source}`);
  }
  const legalText = required.map((source) => strings[source] || "").join("\n");
  if (/\b(?:United Nations|Korean language|logging aids)\b/i.test(legalText) || /联合国|韩语|лесозаготов|счета\b/.test(legalText)) {
    failures.push(`${locale}: suspicious machine-translation residue`);
  }
  for (const brand of ["Set Counter", "North Star Labs", "Render Services, Inc.", "Neon, Inc.", "Discord Inc."]) {
    const relevant = required.filter((source) => source.includes(brand)).map((source) => [source, strings[source]]);
    if (relevant.some(([, translated]) => !translated.includes(brand))) failures.push(`${locale}: brand changed: ${brand}`);
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(`Legal localization audit passed: ${required.length} critical strings x 4 locales.`);
