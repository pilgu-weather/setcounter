const exercises = [
  { name: "숄더 프레스", area: "덤벨 어깨", image: "shoulderpress.webp" },
  { name: "사이드 레터럴 레이즈", area: "덤벨 어깨", image: "sarere.webp" },
  { name: "중량가방 푸쉬업", area: "맨몸/가방", image: "pushup.webp" },
  { name: "덤벨 컬", area: "덤벨 팔", image: "dumbelcurl.webp" },
  { name: "해머 컬", area: "덤벨 팔", image: "hammercurl.webp" },
  { name: "고블릿 스쿼트", area: "덤벨 하체", image: "gblitsquate.webp" },
  { name: "덤벨 로우", area: "덤벨 등", image: "dumbellow.webp" },
  { name: "벤치프레스", area: "덤벨 가슴", image: "benchpress.webp" },
  { name: "덤벨 힙", area: "덤벨 둔근", image: "dumbelhip.webp" },
  { name: "무게판 추감기", area: "전완", image: "wristroller.webp" },
];

const USER_KEY_STORAGE = "healthUserKey";
const USER_KEY_PATTERN = /^[A-Za-z0-9._:-]{16,128}$/;

function createUserKey() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  const random = new Uint8Array(24);
  window.crypto.getRandomValues(random);
  return Array.from(random, (value) => value.toString(16).padStart(2, "0")).join("");
}

function loadUserKey() {
  const url = new URL(window.location.href);
  const recoveryKey = url.searchParams.get("user_key");
  if (recoveryKey && USER_KEY_PATTERN.test(recoveryKey)) {
    window.localStorage.setItem(USER_KEY_STORAGE, recoveryKey);
    url.searchParams.delete("user_key");
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
    return recoveryKey;
  }
  const stored = window.localStorage.getItem(USER_KEY_STORAGE);
  if (stored && USER_KEY_PATTERN.test(stored)) return stored;
  const generated = createUserKey();
  window.localStorage.setItem(USER_KEY_STORAGE, generated);
  return generated;
}

const healthUserKey = loadUserKey();

function pad(value) {
  return String(value).padStart(2, "0");
}

function toDateKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function toMonthKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

function dateFromKey(key) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

const todayKey = toDateKey(new Date());

const state = {
  currentMonth: new Date(),
  chartMode: "volume",
  excuses: [],
  lastRecord: null,
  logs: [],
  selectedDate: todayKey,
  selectedExercise: exercises[0],
  serviceWorkerReady: null,
  setRows: [],
  stats: null,
};

const els = {
  exerciseGrid: document.querySelector("#exerciseGrid"),
  counterTitle: document.querySelector("#counterTitle"),
  workoutDateInput: document.querySelector("#workoutDateInput"),
  weightInput: document.querySelector("#weightInput"),
  currentRepsInput: document.querySelector("#currentRepsInput"),
  setsInput: document.querySelector("#setsInput"),
  notesInput: document.querySelector("#notesInput"),
  plannedRecord: document.querySelector("#plannedRecord"),
  setTableBody: document.querySelector("#setTableBody"),
  lastRecord: document.querySelector("#lastRecord"),
  completedSets: document.querySelector("#completedSets"),
  targetSets: document.querySelector("#targetSets"),
  progressBar: document.querySelector("#progressBar"),
  countSetButton: document.querySelector("#countSetButton"),
  undoSetButton: document.querySelector("#undoSetButton"),
  confirmWorkoutButton: document.querySelector("#confirmWorkoutButton"),
  resetSessionButton: document.querySelector("#resetSessionButton"),
  recordCompare: document.querySelector("#recordCompare"),
  sosReasonInput: document.querySelector("#sosReasonInput"),
  sosButton: document.querySelector("#sosButton"),
  levelValue: document.querySelector("#levelValue"),
  totalVolumeValue: document.querySelector("#totalVolumeValue"),
  levelProgressBar: document.querySelector("#levelProgressBar"),
  levelCopy: document.querySelector("#levelCopy"),
  reminderStatus: document.querySelector("#reminderStatus"),
  enableReminderButton: document.querySelector("#enableReminderButton"),
  chartSummary: document.querySelector("#chartSummary"),
  progressChart: document.querySelector("#progressChart"),
  volumeChartButton: document.querySelector("#volumeChartButton"),
  setsChartButton: document.querySelector("#setsChartButton"),
  calendarTitle: document.querySelector("#calendarTitle"),
  calendarGrid: document.querySelector("#calendarGrid"),
  calendarDayDetail: document.querySelector("#calendarDayDetail"),
  calendarExcuseList: document.querySelector("#calendarExcuseList"),
  prevMonthButton: document.querySelector("#prevMonthButton"),
  nextMonthButton: document.querySelector("#nextMonthButton"),
  historyList: document.querySelector("#historyList"),
  monthSummary: document.querySelector("#monthSummary"),
  toast: document.querySelector("#toast"),
};

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("is-visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => els.toast.classList.remove("is-visible"), 1800);
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-User-Key": healthUserKey,
      ...(options.headers || {}),
    },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || "요청에 실패했습니다.");
  }
  return response.status === 204 ? null : response.json();
}

function reminderEnabled() {
  return window.localStorage.getItem("workoutReminderEnabled") === "1";
}

function pushSupported() {
  return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

function syncReminderUi() {
  if (!pushSupported()) {
    els.reminderStatus.textContent = "홈 화면 앱에서 알림을 켤 수 있습니다.";
    els.enableReminderButton.disabled = true;
    return;
  }
  const isOn = reminderEnabled() && Notification.permission === "granted";
  els.enableReminderButton.classList.toggle("is-on", isOn);
  els.enableReminderButton.textContent = isOn ? "알림 끄기" : "알림 켜기";
  if (isOn) els.reminderStatus.textContent = "매일 오전 11시에 운동 알림을 보냅니다.";
  else if (Notification.permission === "denied") els.reminderStatus.textContent = "브라우저 설정에서 알림 허용이 필요합니다.";
  else els.reminderStatus.textContent = "운동 기록 알림을 켜주세요.";
}

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    syncReminderUi();
    return null;
  }
  const registration = await navigator.serviceWorker.register("/service-worker.js");
  state.serviceWorkerReady = navigator.serviceWorker.ready;
  syncReminderUi();
  return registration;
}

function urlBase64ToUint8Array(value) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  return Uint8Array.from(raw, (character) => character.charCodeAt(0));
}

async function syncPushReminderState(registration = null) {
  if (!pushSupported()) {
    syncReminderUi();
    return;
  }
  registration = registration || await registerServiceWorker();
  const subscription = await registration.pushManager.getSubscription();
  if (subscription && Notification.permission === "granted") {
    window.localStorage.setItem("workoutReminderEnabled", "1");
  } else {
    window.localStorage.removeItem("workoutReminderEnabled");
  }
  syncReminderUi();
}

async function disableReminder(subscription) {
  if (subscription) {
    await api("/api/push/unsubscribe", {
      method: "POST",
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    });
    await subscription.unsubscribe();
  }
  window.localStorage.removeItem("workoutReminderEnabled");
  syncReminderUi();
  showToast("오전 11시 알림을 껐습니다.");
}

async function enableReminder() {
  if (!pushSupported()) {
    showToast("홈 화면 앱에서 알림을 켜주세요.");
    syncReminderUi();
    return;
  }
  const registration = await registerServiceWorker();
  const existing = await registration.pushManager.getSubscription();
  if (existing && reminderEnabled()) {
    await disableReminder(existing);
    return;
  }
  const permission = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
  if (permission !== "granted") {
    window.localStorage.removeItem("workoutReminderEnabled");
    syncReminderUi();
    showToast("알림 권한이 필요합니다.");
    return;
  }
  const keyData = await api("/api/push/vapid-public-key");
  const subscription = existing || await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(keyData.publicKey),
  });
  await api("/api/push/subscribe", {
    method: "POST",
    body: JSON.stringify(subscription.toJSON()),
  });
  window.localStorage.setItem("workoutReminderEnabled", "1");
  syncReminderUi();
  const testResult = await api("/api/push/test", { method: "POST" });
  showToast(testResult.sent ? "알림을 켰습니다. 테스트 알림을 확인하세요." : "알림 구독 저장에 실패했습니다.");
}

function weightStepForExercise(exercise = state.selectedExercise) {
  return exercise?.name === "중량가방 푸쉬업" ? 4 : 8;
}

function cleanNumber(value) {
  const number = Number.parseFloat(value) || 0;
  return Number.isInteger(number) ? String(number) : number.toFixed(1);
}

function normalizedWeight(commit = false) {
  const raw = Number.parseFloat(els.weightInput.value);
  const step = weightStepForExercise();
  const next = Math.max(Math.round((Number.isFinite(raw) ? raw : step) / step) * step, step);
  if (commit) els.weightInput.value = String(next);
  return next;
}

function targetSets() {
  return Math.max(Number.parseInt(els.setsInput.value, 10) || 1, 1);
}

function currentReps() {
  return Math.max(Number.parseInt(els.currentRepsInput.value, 10) || 1, 1);
}

function totalReps(rows) {
  return (rows || []).reduce((sum, row) => sum + row.reps, 0);
}

function totalVolume(rows) {
  return (rows || []).reduce((sum, row) => sum + row.weightKg * row.reps, 0);
}

function rowsFromLog(log) {
  if (log?.setRows?.length) {
    return log.setRows.map((row) => ({ weightKg: row.weightKg, reps: row.reps }));
  }
  return (log?.setReps || []).map((reps, index) => ({
    weightKg: (log.setWeights && log.setWeights[index]) || log.weightKg || 0,
    reps,
  }));
}

function applyInputsFromLatestRecord(log) {
  const rows = rowsFromLog(log);
  if (!rows.length) return;
  const lastRow = rows[rows.length - 1];
  const step = weightStepForExercise();
  els.weightInput.value = String(Math.max(Math.round((lastRow.weightKg || step) / step) * step, step));
  els.currentRepsInput.value = String(Math.max(lastRow.reps || 1, 1));
  els.setsInput.value = String(Math.max(log.targetSets || rows.length || 1, 1));
  syncCounter();
}

function syncWeightControls() {
  const step = weightStepForExercise();
  els.weightInput.min = String(step);
  els.weightInput.step = String(step);
  document.querySelectorAll("[data-step-for='weightInput']").forEach((button) => {
    const direction = Math.sign(Number.parseFloat(button.dataset.step) || 0) || 1;
    button.dataset.step = String(direction * step);
  });
}

function stepNumberInput(input, delta) {
  const min = Number.parseFloat(input.min);
  const max = Number.parseFloat(input.max);
  const current = Number.parseFloat(input.value);
  const fallback = Number.parseFloat(input.defaultValue) || 0;
  const adjustedDelta = input === els.weightInput ? weightStepForExercise() * Math.sign(delta || 0) : delta;
  const next = Math.max(Number.isFinite(min) ? min : 0, (Number.isFinite(current) ? current : fallback) + adjustedDelta);
  input.value = String(Number.isFinite(max) ? Math.min(next, max) : next);
  if (input === els.weightInput) normalizedWeight(true);
  syncCounter();
}

function buildRecordTable(rows) {
  const table = document.createElement("table");
  table.className = "record-table";
  table.innerHTML = `
    <thead><tr><th>세트</th><th>무게</th><th>횟수</th><th>볼륨</th></tr></thead>
  `;
  const body = document.createElement("tbody");
  rows.forEach((row, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${cleanNumber(row.weightKg)}kg</td>
      <td>${row.reps}회</td>
      <td>${Math.round(row.weightKg * row.reps)}kg</td>
    `;
    body.append(tr);
  });
  table.append(body);
  const foot = document.createElement("tfoot");
  foot.innerHTML = `
    <tr><td>합계</td><td>-</td><td>${totalReps(rows)}회</td><td>${Math.round(totalVolume(rows))}kg</td></tr>
  `;
  table.append(foot);
  return table;
}

function syncRecordCompare() {
  const completed = state.setRows.length;
  const target = targetSets();
  const lastVolume = state.lastRecord?.volume || 0;
  els.recordCompare.textContent = "";
  els.recordCompare.classList.remove("is-visible", "is-cleared");
  if (!lastVolume || completed !== Math.max(target - 1, 0)) return;

  const currentWeight = normalizedWeight(false);
  const afterNextSetVolume = totalVolume(state.setRows) + currentWeight * currentReps();
  const remainingVolume = Math.max(lastVolume - afterNextSetVolume, 0);
  const remainingReps = Math.ceil(remainingVolume / currentWeight);
  els.recordCompare.classList.add("is-visible");
  if (remainingReps === 0) {
    els.recordCompare.classList.add("is-cleared");
    els.recordCompare.textContent = "지난 볼륨을 넘길 수 있습니다.";
  } else {
    els.recordCompare.textContent = `지난 볼륨까지 현재 무게 기준 ${remainingReps}회 남았습니다`;
  }
}

function syncPlannedRecord() {
  const dateLabel = state.selectedDate === todayKey ? "오늘" : state.selectedDate;
  const weight = cleanNumber(normalizedWeight(false));
  const nextSet = state.setRows.length + 1;
  const doneReps = totalReps(state.setRows);
  const doneVolume = Math.round(totalVolume(state.setRows));
  els.plannedRecord.textContent = `${dateLabel}: ${weight}kg · ${doneReps}회 완료 · 볼륨 ${doneVolume}kg · ${nextSet}세트는 ${currentReps()}회`;
  syncRecordCompare();
}

function renderSetTable() {
  els.setTableBody.replaceChildren();
  if (!state.setRows.length) {
    const tr = document.createElement("tr");
    tr.className = "empty-row";
    tr.innerHTML = `<td colspan="4">아직 완료한 세트 없음</td>`;
    els.setTableBody.append(tr);
    return;
  }
  state.setRows.forEach((row, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${cleanNumber(row.weightKg)}kg</td>
      <td>${row.reps}회</td>
      <td>${Math.round(row.weightKg * row.reps)}kg</td>
    `;
    els.setTableBody.append(tr);
  });
}

function syncCounter() {
  const target = targetSets();
  const completed = state.setRows.length;
  els.completedSets.textContent = completed;
  els.targetSets.textContent = target;
  els.progressBar.style.width = `${Math.round((Math.min(completed, target) / target) * 100)}%`;
  els.confirmWorkoutButton.disabled = completed === 0;
  els.countSetButton.disabled = completed >= target;
  renderSetTable();
  syncPlannedRecord();
}

function resetSession(keepInputs = true) {
  state.setRows = [];
  syncWeightControls();
  if (!keepInputs) {
    els.weightInput.value = String(weightStepForExercise());
    els.currentRepsInput.value = "12";
    els.setsInput.value = "3";
    els.notesInput.value = "";
  }
  syncCounter();
}

function renderStats(stats) {
  state.stats = stats;
  els.levelValue.textContent = stats.level;
  els.totalVolumeValue.textContent = `${Math.round(stats.totalVolume)}kg`;
  els.levelProgressBar.style.width = `${stats.progressPercent}%`;
  els.levelCopy.textContent = `레벨업 ${stats.levelUps}회 · 레벨다운 ${stats.levelDowns}회 · 일일 페널티 ${stats.dailyPenalty}회`;
}

function announceLevelChange(previousLevel, nextLevel) {
  if (!previousLevel || previousLevel === nextLevel) return;
  showToast(nextLevel > previousLevel ? `레벨업: LV.${nextLevel}` : `레벨다운: LV.${nextLevel}`);
}

function makeExerciseArt(exercise) {
  const imageBox = document.createElement("span");
  imageBox.className = "exercise-art";
  imageBox.setAttribute("aria-hidden", "true");
  const image = document.createElement("img");
  image.src = `/static/assets/${exercise.image}?v=6`;
  image.alt = "";
  image.loading = "lazy";
  imageBox.append(image);
  return imageBox;
}

function renderExerciseCards() {
  els.exerciseGrid.replaceChildren();
  exercises.forEach((exercise) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "exercise-card";
    card.setAttribute("aria-pressed", exercise.name === state.selectedExercise.name);
    const name = document.createElement("strong");
    name.textContent = exercise.name;
    const area = document.createElement("small");
    area.textContent = exercise.area;
    card.append(makeExerciseArt(exercise), name, area);
    card.addEventListener("click", () => selectExercise(exercise));
    els.exerciseGrid.append(card);
  });
}

async function selectExercise(exercise) {
  state.selectedExercise = exercise;
  els.counterTitle.textContent = exercise.name;
  syncWeightControls();
  resetSession(true);
  renderExerciseCards();
  await loadLatestRecord();
  renderChart();
}

function renderLatestRecord(latest) {
  state.lastRecord = latest;
  els.lastRecord.replaceChildren();
  if (!latest) {
    els.lastRecord.textContent = "지난 기록: 아직 없음";
    syncRecordCompare();
    return;
  }
  const rows = rowsFromLog(latest);
  applyInputsFromLatestRecord(latest);
  const title = document.createElement("div");
  title.className = "record-title";
  title.textContent = `지난 기록: ${latest.date} · 총 ${latest.totalReps}회 · 볼륨 ${Math.round(latest.volume)}kg`;
  const chips = document.createElement("div");
  chips.className = "record-chips";
  rows.forEach((row, index) => {
    const chip = document.createElement("span");
    chip.textContent = `${index + 1}세트 ${cleanNumber(row.weightKg)}kg ${row.reps}회`;
    chips.append(chip);
  });
  els.lastRecord.append(title, chips);
  syncRecordCompare();
}

async function loadLatestRecord() {
  els.lastRecord.textContent = "지난 기록을 불러오는 중...";
  const query = new URLSearchParams({
    exercise: state.selectedExercise.name,
    before: state.selectedDate,
  });
  renderLatestRecord(await api(`/api/logs/latest?${query.toString()}`));
}

async function loadBootstrap() {
  const month = toMonthKey(state.currentMonth);
  const data = await api(`/api/bootstrap?month=${month}`);
  state.logs = data.logs;
  state.excuses = data.excuses;
  renderStats(data.stats);
  await loadLatestRecord();
  renderCalendar();
  renderHistory();
  renderChart();
  if (data.claimedLegacy) showToast(`기존 운동 기록 ${data.stats.totalRecords}건을 연결했습니다.`);
  return data;
}

async function loadStatsOnly() {
  const stats = await api("/api/stats");
  renderStats(stats);
  return stats;
}

function logsForDate(dateKey) {
  return state.logs.filter((log) => log.date === dateKey);
}

function excuseForDate(dateKey) {
  return state.excuses.find((excuse) => excuse.date === dateKey) || null;
}

function renderCalendar() {
  const monthDate = state.currentMonth;
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDate = new Date(year, month + 1, 0).getDate();
  const daily = new Map();
  state.logs.forEach((log) => {
    const row = daily.get(log.date) || { volume: 0, count: 0 };
    row.volume += log.volume || 0;
    row.count += 1;
    daily.set(log.date, row);
  });
  const excusesByDate = new Map(state.excuses.map((excuse) => [excuse.date, excuse]));

  els.calendarTitle.textContent = `${year}년 ${month + 1}월`;
  els.calendarGrid.replaceChildren();

  for (let i = 0; i < firstDay.getDay(); i += 1) {
    const empty = document.createElement("div");
    empty.className = "day-cell is-empty";
    els.calendarGrid.append(empty);
  }

  for (let day = 1; day <= lastDate; day += 1) {
    const key = `${year}-${pad(month + 1)}-${pad(day)}`;
    const summary = daily.get(key);
    const excuse = excusesByDate.get(key);
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "day-cell";
    cell.innerHTML = `<strong>${day}</strong>`;
    if (summary) {
      const meta = document.createElement("small");
      meta.textContent = `${Math.round(summary.volume)}kg`;
      cell.append(meta);
    }
    cell.setAttribute("aria-label", `${key} 기록 입력`);
    if (key === todayKey) cell.classList.add("is-today");
    if (key === state.selectedDate) cell.classList.add("is-selected");
    if (summary) cell.classList.add("has-workout");
    if (excuse) {
      cell.classList.add("has-sos");
      cell.title = `SOS: ${excuse.reason}`;
    }
    cell.addEventListener("click", () => chooseDate(key));
    els.calendarGrid.append(cell);
  }
  renderDayDetail();
  renderExcuses();
}

function renderDayDetail() {
  const logs = logsForDate(state.selectedDate);
  const excuse = excuseForDate(state.selectedDate);
  els.calendarDayDetail.replaceChildren();

  const head = document.createElement("div");
  head.className = "day-detail-head";
  const title = document.createElement("strong");
  title.textContent = `${state.selectedDate} 기록`;
  const summary = document.createElement("span");
  const total = logs.reduce((sum, log) => sum + (log.volume || 0), 0);
  summary.textContent = logs.length ? `${logs.length}종목 · ${Math.round(total)}kg` : "기록 없음";
  head.append(title, summary);
  els.calendarDayDetail.append(head);

  if (excuse) {
    const sos = document.createElement("p");
    sos.className = "day-sos-reason";
    sos.textContent = `SOS: ${excuse.reason}`;
    els.calendarDayDetail.append(sos);
  }

  if (!logs.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "이 날짜를 선택한 상태로 아래에서 운동을 저장하면 여기에 들어옵니다.";
    els.calendarDayDetail.append(empty);
    return;
  }

  logs.forEach((log) => {
    const item = document.createElement("article");
    item.className = "day-log-item";
    const top = document.createElement("div");
    top.className = "day-log-top";
    const label = document.createElement("strong");
    label.textContent = log.exercise;
    const remove = document.createElement("button");
    remove.className = "delete-button";
    remove.type = "button";
    remove.textContent = "×";
    remove.setAttribute("aria-label", `${log.exercise} 기록 삭제`);
    remove.addEventListener("click", async () => {
      const previousLevel = state.stats?.level;
      await api(`/api/logs/${log.id}`, { method: "DELETE" });
      const data = await loadBootstrap();
      showToast("기록을 삭제했습니다.");
      announceLevelChange(previousLevel, data.stats.level);
    });
    top.append(label, remove);
    const meta = document.createElement("p");
    meta.textContent = `총 ${log.totalReps}회 · 볼륨 ${Math.round(log.volume)}kg${log.notes ? ` · ${log.notes}` : ""}`;
    item.append(top, meta, buildRecordTable(rowsFromLog(log)));
    els.calendarDayDetail.append(item);
  });
}

function renderExcuses() {
  els.calendarExcuseList.replaceChildren();
  const monthExcuses = [...state.excuses].sort((a, b) => b.date.localeCompare(a.date));
  if (!monthExcuses.length) return;
  const heading = document.createElement("h3");
  heading.textContent = "SOS 사유";
  els.calendarExcuseList.append(heading);
  monthExcuses.forEach((excuse) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "calendar-excuse-item";
    item.dataset.excuseDate = excuse.date;
    item.innerHTML = `<strong>${excuse.date}</strong><p>${excuse.reason}</p>`;
    item.addEventListener("click", () => chooseDate(excuse.date));
    els.calendarExcuseList.append(item);
  });
}

async function chooseDate(dateKey) {
  state.selectedDate = dateKey;
  els.workoutDateInput.value = dateKey;
  const selectedMonth = dateFromKey(dateKey);
  const monthChanged = toMonthKey(selectedMonth) !== toMonthKey(state.currentMonth);
  if (monthChanged) {
    state.currentMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
    await loadBootstrap();
  } else {
    renderCalendar();
    await loadLatestRecord();
  }
  syncCounter();
}

function groupedLogsForChart() {
  const daily = new Map();
  state.logs
    .filter((log) => log.exercise === state.selectedExercise.name)
    .forEach((log) => {
      const existing = daily.get(log.date) || { date: log.date, volume: 0, sets: 0 };
      existing.volume += log.volume || 0;
      existing.sets += log.completedSets || 0;
      daily.set(log.date, existing);
    });
  return Array.from(daily.values()).sort((a, b) => a.date.localeCompare(b.date));
}

function renderChart() {
  const canvas = els.progressChart;
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const points = groupedLogsForChart();
  const metric = state.chartMode;
  const label = metric === "volume" ? "볼륨" : "세트";
  const unit = metric === "volume" ? "kg" : "세트";

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#fffdf2";
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "#e3d48d";
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i += 1) {
    const y = 34 + i * 52;
    ctx.beginPath();
    ctx.moveTo(46, y);
    ctx.lineTo(width - 18, y);
    ctx.stroke();
  }
  if (!points.length) {
    els.chartSummary.textContent = `${state.selectedExercise.name} 이번 달 기록 없음`;
    ctx.fillStyle = "#5d5330";
    ctx.font = "24px Arial";
    ctx.textAlign = "center";
    ctx.fillText("기록하면 그래프가 생깁니다", width / 2, height / 2);
    return;
  }

  const values = points.map((point) => point[metric]);
  const maxValue = Math.max(...values, 1);
  const chartLeft = 46;
  const chartRight = width - 18;
  const chartTop = 24;
  const chartBottom = height - 46;
  const step = points.length === 1 ? 0 : (chartRight - chartLeft) / (points.length - 1);

  ctx.strokeStyle = "#111111";
  ctx.lineWidth = 5;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.beginPath();
  points.forEach((point, index) => {
    const x = points.length === 1 ? (chartLeft + chartRight) / 2 : chartLeft + index * step;
    const y = chartBottom - (point[metric] / maxValue) * (chartBottom - chartTop);
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  ctx.fillStyle = "#ffd21f";
  points.forEach((point, index) => {
    const x = points.length === 1 ? (chartLeft + chartRight) / 2 : chartLeft + index * step;
    const y = chartBottom - (point[metric] / maxValue) * (chartBottom - chartTop);
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#111111";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.fillText(`${Math.round(point[metric])}${unit}`, x, y - 14);
    ctx.fillStyle = "#5d5330";
    ctx.font = "15px Arial";
    ctx.fillText(point.date.slice(5), x, chartBottom + 28);
    ctx.fillStyle = "#ffd21f";
  });

  const total = values.reduce((sum, value) => sum + value, 0);
  els.chartSummary.textContent = `${state.selectedExercise.name} 이번 달 ${label}: 총 ${Math.round(total)}${unit}`;
}

function renderHistory() {
  const totalSets = state.logs.reduce((sum, log) => sum + log.completedSets, 0);
  const volume = state.logs.reduce((sum, log) => sum + (log.volume || 0), 0);
  els.monthSummary.textContent = `${state.logs.length}회 · ${totalSets}세트 · ${Math.round(volume)}kg`;
  els.historyList.replaceChildren();
  if (!state.logs.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "이번 달 기록이 아직 없습니다.";
    els.historyList.append(empty);
    return;
  }

  const daily = new Map();
  state.logs.forEach((log) => {
    const row = daily.get(log.date) || { date: log.date, volume: 0, count: 0, names: [] };
    row.volume += log.volume || 0;
    row.count += 1;
    row.names.push(log.exercise);
    daily.set(log.date, row);
  });
  Array.from(daily.values())
    .sort((a, b) => b.date.localeCompare(a.date))
    .forEach((day) => {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "history-item history-day-button";
      item.innerHTML = `
        <span>
          <strong class="history-title">${day.date}</strong>
          <span class="history-meta">${day.count}종목 · ${Math.round(day.volume)}kg · ${day.names.join(", ")}</span>
        </span>
        <span class="history-open">보기</span>
      `;
      item.addEventListener("click", () => chooseDate(day.date));
      els.historyList.append(item);
    });
}

async function saveSosExcuse() {
  const previousLevel = state.stats?.level;
  const reason = els.sosReasonInput.value.trim();
  if (!reason) {
    showToast("SOS 사유를 입력해주세요.");
    return;
  }
  await api("/api/excuses", {
    method: "POST",
    body: JSON.stringify({ date: state.selectedDate, reason }),
  });
  els.sosReasonInput.value = "";
  const data = await loadBootstrap();
  showToast(`${state.selectedDate} SOS를 저장했습니다.`);
  announceLevelChange(previousLevel, data.stats.level);
}

async function saveWorkout() {
  const previousLevel = state.stats?.level;
  const log = {
    date: state.selectedDate,
    exercise: state.selectedExercise.name,
    weightKg: state.setRows[state.setRows.length - 1]?.weightKg || normalizedWeight(true),
    setWeights: state.setRows.map((row) => row.weightKg),
    setReps: state.setRows.map((row) => row.reps),
    targetSets: targetSets(),
    completedSets: state.setRows.length,
    notes: els.notesInput.value.trim(),
  };
  await api("/api/logs", {
    method: "POST",
    body: JSON.stringify(log),
  });
  showToast(`${state.selectedDate} 운동 기록을 저장했습니다.`);
  resetSession(true);
  const data = await loadBootstrap();
  announceLevelChange(previousLevel, data.stats.level);
}

function countSet() {
  const weightKg = normalizedWeight(true);
  if (state.setRows.length >= targetSets()) {
    showToast("목표 세트를 이미 채웠습니다.");
    return;
  }
  state.setRows.push({ weightKg, reps: currentReps() });
  syncCounter();
  if (state.setRows.length >= targetSets()) showToast("목표 세트 완료. 확인을 눌러 저장하세요.");
}

function changeMonth(offset) {
  state.currentMonth = new Date(
    state.currentMonth.getFullYear(),
    state.currentMonth.getMonth() + offset,
    1
  );
  loadBootstrap().catch((error) => showToast(error.message));
}

function setChartMode(mode) {
  state.chartMode = mode;
  els.volumeChartButton.classList.toggle("is-active", mode === "volume");
  els.setsChartButton.classList.toggle("is-active", mode === "sets");
  renderChart();
}

function bindEvents() {
  els.countSetButton.addEventListener("click", countSet);
  els.undoSetButton.addEventListener("click", () => {
    state.setRows.pop();
    syncCounter();
  });
  els.confirmWorkoutButton.addEventListener("click", () => saveWorkout().catch((error) => showToast(error.message)));
  els.resetSessionButton.addEventListener("click", () => resetSession(false));
  els.workoutDateInput.addEventListener("change", () => {
    if (els.workoutDateInput.value) chooseDate(els.workoutDateInput.value).catch((error) => showToast(error.message));
  });
  els.weightInput.addEventListener("change", () => {
    normalizedWeight(true);
    syncCounter();
  });
  [els.weightInput, els.currentRepsInput, els.setsInput].forEach((input) => {
    input.addEventListener("input", syncCounter);
  });
  document.querySelectorAll("[data-step-for]").forEach((button) => {
    button.addEventListener("click", () => {
      const input = document.querySelector(`#${button.dataset.stepFor}`);
      const delta = Number.parseFloat(button.dataset.step) || 0;
      if (input) stepNumberInput(input, delta);
    });
  });
  els.enableReminderButton.addEventListener("click", () => enableReminder().catch((error) => showToast(error.message)));
  els.sosButton.addEventListener("click", () => saveSosExcuse().catch((error) => showToast(error.message)));
  els.volumeChartButton.addEventListener("click", () => setChartMode("volume"));
  els.setsChartButton.addEventListener("click", () => setChartMode("sets"));
  els.prevMonthButton.addEventListener("click", () => changeMonth(-1));
  els.nextMonthButton.addEventListener("click", () => changeMonth(1));
}

async function init() {
  els.workoutDateInput.value = state.selectedDate;
  els.counterTitle.textContent = state.selectedExercise.name;
  renderExerciseCards();
  bindEvents();
  syncWeightControls();
  normalizedWeight(true);
  syncCounter();
  syncReminderUi();
  registerServiceWorker()
    .then((registration) => syncPushReminderState(registration))
    .catch(() => syncReminderUi());
  await loadBootstrap();
}

init().catch((error) => showToast(error.message));
