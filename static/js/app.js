const exercises = [
  { name: "숄더 프레스", area: "덤벨 어깨", image: "shoulderpress.PNG" },
  { name: "사이드 레터럴 레이즈", area: "덤벨 어깨", image: "sarere.PNG" },
  { name: "중량가방 푸쉬업", area: "맨몸/가방", image: "pushup.PNG" },
  { name: "덤벨 컬", area: "덤벨 팔", image: "dumbelcurl.PNG" },
  { name: "해머 컬", area: "덤벨 팔", image: "hammercurl.PNG" },
  { name: "고블릿 스쿼트", area: "덤벨 하체", image: "gblitsquate.PNG" },
  { name: "덤벨 로우", area: "덤벨 등", image: "dumbellow.PNG" },
  { name: "벤치프레스", area: "덤벨 가슴", image: "benchpress.PNG" },
  { name: "덤벨 힙", area: "덤벨 둔근", image: "dumbelhip.PNG" },
  { name: "무게판 추감기", area: "전완", image: "wristroller.PNG" },
];

const state = {
  currentMonth: new Date(),
  chartMode: "volume",
  excuses: [],
  lastRecord: null,
  logs: [],
  reminderTimer: null,
  serviceWorkerReady: null,
  selectedExercise: exercises[0],
  setRows: [],
  stats: null,
};

const els = {
  exerciseGrid: document.querySelector("#exerciseGrid"),
  counterTitle: document.querySelector("#counterTitle"),
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
  calendarExcuseList: document.querySelector("#calendarExcuseList"),
  prevMonthButton: document.querySelector("#prevMonthButton"),
  nextMonthButton: document.querySelector("#nextMonthButton"),
  historyList: document.querySelector("#historyList"),
  monthSummary: document.querySelector("#monthSummary"),
  toast: document.querySelector("#toast"),
};

function pad(value) {
  return String(value).padStart(2, "0");
}

function toDateKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function toMonthKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("is-visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    els.toast.classList.remove("is-visible");
  }, 1800);
}

function reminderEnabled() {
  return window.localStorage.getItem("workoutReminderEnabled") === "1";
}

function nextReminderDelay() {
  const now = new Date();
  const next = new Date(now);
  next.setHours(11, 0, 0, 0);
  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }
  return next.getTime() - now.getTime();
}

function syncReminderUi() {
  if (!("Notification" in window)) {
    els.reminderStatus.textContent = "이 브라우저는 알림을 지원하지 않습니다.";
    els.enableReminderButton.disabled = true;
    return;
  }

  const isOn = reminderEnabled() && Notification.permission === "granted";
  els.enableReminderButton.classList.toggle("is-on", isOn);
  els.enableReminderButton.textContent = isOn ? "알림 켜짐" : "알림 켜기";

  if (isOn) {
    els.reminderStatus.textContent = "매일 오전 11시에 운동 알림이 울립니다.";
  } else if (Notification.permission === "denied") {
    els.reminderStatus.textContent = "브라우저 설정에서 알림 허용이 필요합니다.";
  } else {
    els.reminderStatus.textContent = "운동 기록 알림을 켜주세요.";
  }
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

async function showWorkoutReminder() {
  if (!reminderEnabled() || Notification.permission !== "granted") {
    return;
  }

  const registration = await state.serviceWorkerReady;
  if (registration?.active) {
    registration.active.postMessage({
      type: "SHOW_WORKOUT_REMINDER",
      title: "흐엇?!",
      body: "오전 11시입니다. 오늘 운동 기록하러 갑시다.",
    });
  } else if (registration?.showNotification) {
    registration.showNotification("흐엇?!", {
      body: "오전 11시입니다. 오늘 운동 기록하러 갑시다.",
      icon: "/static/assets/newlogo_icon_v3.png?v=4",
      tag: "daily-workout-reminder",
    });
  }
}

function scheduleWorkoutReminder() {
  window.clearTimeout(state.reminderTimer);
  if (!reminderEnabled() || Notification.permission !== "granted") {
    return;
  }

  state.reminderTimer = window.setTimeout(async () => {
    await showWorkoutReminder();
    scheduleWorkoutReminder();
  }, nextReminderDelay());
}

async function enableReminder() {
  if (!("Notification" in window)) {
    showToast("이 브라우저는 알림을 지원하지 않습니다.");
    syncReminderUi();
    return;
  }

  await registerServiceWorker();
  const permission = Notification.permission === "granted"
    ? "granted"
    : await Notification.requestPermission();

  if (permission === "granted") {
    window.localStorage.setItem("workoutReminderEnabled", "1");
    syncReminderUi();
    scheduleWorkoutReminder();
    await showWorkoutReminder();
    showToast("매일 오전 11시 알림을 켰습니다.");
  } else {
    window.localStorage.removeItem("workoutReminderEnabled");
    syncReminderUi();
    showToast("알림 권한이 필요합니다.");
  }
}

function cleanNumber(value) {
  const number = Number.parseFloat(value) || 0;
  return Number.isInteger(number) ? String(number) : number.toFixed(1);
}

function normalizedWeight(commit = false) {
  const raw = Number.parseFloat(els.weightInput.value);
  const next = Math.max(Math.round((Number.isFinite(raw) ? raw : 8) / 8) * 8, 8);
  if (commit) {
    els.weightInput.value = String(next);
  }
  return next;
}

function targetSets() {
  return Math.max(Number.parseInt(els.setsInput.value, 10) || 1, 1);
}

function currentReps() {
  return Math.max(Number.parseInt(els.currentRepsInput.value, 10) || 1, 1);
}

function clampNumber(value, min, max) {
  const next = Math.max(value, min);
  return Number.isFinite(max) ? Math.min(next, max) : next;
}

function stepNumberInput(input, delta) {
  const min = Number.parseFloat(input.min);
  const max = Number.parseFloat(input.max);
  const current = Number.parseFloat(input.value);
  const fallback = Number.parseFloat(input.defaultValue) || 0;
  const next = clampNumber(
    (Number.isFinite(current) ? current : fallback) + delta,
    Number.isFinite(min) ? min : 0,
    Number.isFinite(max) ? max : Infinity
  );
  input.value = String(next);
  if (input === els.weightInput) {
    normalizedWeight(true);
  }
  syncCounter();
}

function totalReps(rows) {
  return (rows || []).reduce((sum, row) => sum + row.reps, 0);
}

function totalVolume(rows) {
  return (rows || []).reduce((sum, row) => sum + row.weightKg * row.reps, 0);
}

function rowsFromLog(log) {
  if (log?.setRows?.length) {
    return log.setRows.map((row) => ({
      weightKg: row.weightKg,
      reps: row.reps,
    }));
  }
  return (log?.setReps || []).map((reps, index) => ({
    weightKg: (log.setWeights && log.setWeights[index]) || log.weightKg || 0,
    reps,
  }));
}

function applyInputsFromLatestRecord(log) {
  const rows = rowsFromLog(log);
  if (rows.length === 0) {
    return;
  }

  const lastRow = rows[rows.length - 1];
  els.weightInput.value = String(Math.max(Math.round((lastRow.weightKg || 8) / 8) * 8, 8));
  els.currentRepsInput.value = String(Math.max(lastRow.reps || 1, 1));
  els.setsInput.value = String(Math.max(log.targetSets || rows.length || 1, 1));
  syncCounter();
}

function buildRecordTable(rows) {
  const repsSum = totalReps(rows);
  const volumeSum = totalVolume(rows);
  const table = document.createElement("table");
  table.className = "record-table";
  table.innerHTML = `
    <thead>
      <tr>
        <th>세트</th>
        <th>무게</th>
        <th>횟수</th>
        <th>볼륨</th>
      </tr>
    </thead>
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
    <tr>
      <td>합계</td>
      <td>-</td>
      <td>${repsSum}회</td>
      <td>${Math.round(volumeSum)}kg</td>
    </tr>
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

  if (!lastVolume || completed !== Math.max(target - 1, 0)) {
    return;
  }

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
  const weight = cleanNumber(normalizedWeight(false));
  const nextSet = state.setRows.length + 1;
  const reps = currentReps();
  const doneReps = totalReps(state.setRows);
  const doneVolume = Math.round(totalVolume(state.setRows));
  els.plannedRecord.textContent = `오늘: ${weight}kg · ${doneReps}회 완료 · 볼륨 ${doneVolume}kg · ${nextSet}세트는 ${reps}회`;
  syncRecordCompare();
}

function renderSetTable() {
  els.setTableBody.replaceChildren();
  if (state.setRows.length === 0) {
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
  if (!keepInputs) {
    els.weightInput.value = "8";
    els.currentRepsInput.value = "12";
    els.setsInput.value = "3";
    els.notesInput.value = "";
  }
  syncCounter();
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || "요청에 실패했습니다.");
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function renderStats(stats) {
  state.stats = stats;
  els.levelValue.textContent = stats.level;
  els.totalVolumeValue.textContent = `${Math.round(stats.totalVolume)}kg`;
  els.levelProgressBar.style.width = `${stats.progressPercent}%`;
  els.levelCopy.textContent = `레벨업 ${stats.levelUps}회 · 레벨다운 ${stats.levelDowns}회 · 일일 페널티 ${stats.dailyPenalty}회`;
}

async function loadStats() {
  const stats = await api("/api/stats");
  renderStats(stats);
  return stats;
}

function announceLevelChange(previousLevel, nextLevel) {
  if (!previousLevel || previousLevel === nextLevel) {
    return;
  }
  if (nextLevel > previousLevel) {
    showToast(`레벨업! LV.${nextLevel}`);
  } else {
    showToast(`레벨다운: LV.${nextLevel}`);
  }
}

function makeExerciseArt(exercise) {
  const imageBox = document.createElement("span");
  imageBox.className = "exercise-art";
  imageBox.setAttribute("aria-hidden", "true");

  const image = document.createElement("img");
  image.src = `/static/assets/${exercise.image}?v=7`;
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
  resetSession(true);
  renderExerciseCards();
  await loadLatestRecord();
  renderChart();
}

async function loadLatestRecord() {
  els.lastRecord.textContent = "지난 기록을 불러오는 중...";
  const latest = await api(`/api/logs/latest?exercise=${encodeURIComponent(state.selectedExercise.name)}`);
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
  els.lastRecord.append(title, buildRecordTable(rows));
  syncRecordCompare();
}

async function loadLogs() {
  const month = toMonthKey(state.currentMonth);
  const [logs, excuses] = await Promise.all([
    api(`/api/logs?month=${month}`),
    api(`/api/excuses?month=${month}`),
  ]);
  state.logs = logs;
  state.excuses = excuses;
  renderCalendar();
  renderHistory();
  renderChart();
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
    body: JSON.stringify({
      date: toDateKey(new Date()),
      reason,
    }),
  });

  els.sosReasonInput.value = "";
  state.currentMonth = new Date();
  const [, stats] = await Promise.all([loadLogs(), loadStats()]);
  showToast("오늘 SOS를 저장했습니다.");
  announceLevelChange(previousLevel, stats.level);
}

async function saveWorkout() {
  const previousLevel = state.stats?.level;
  const log = {
    date: toDateKey(new Date()),
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

  showToast("운동 기록을 저장했어요.");
  resetSession(true);
  state.currentMonth = new Date();
  const [, , stats] = await Promise.all([loadLogs(), loadLatestRecord(), loadStats()]);
  announceLevelChange(previousLevel, stats.level);
}

function countSet() {
  const weightKg = normalizedWeight(true);
  if (state.setRows.length >= targetSets()) {
    showToast("목표 세트를 이미 채웠어요.");
    return;
  }
  state.setRows.push({ weightKg, reps: currentReps() });
  syncCounter();

  if (state.setRows.length >= targetSets()) {
    showToast("목표 세트 완료. 확인을 눌러 저장하세요.");
  }
}

function renderCalendar() {
  const monthDate = state.currentMonth;
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDate = new Date(year, month + 1, 0).getDate();
  const workoutDays = new Set(state.logs.map((log) => log.date));
  const excusesByDate = new Map(state.excuses.map((excuse) => [excuse.date, excuse]));
  const todayKey = toDateKey(new Date());

  els.calendarTitle.textContent = `${year}년 ${month + 1}월`;
  els.calendarGrid.replaceChildren();
  els.calendarExcuseList.replaceChildren();

  for (let i = 0; i < firstDay.getDay(); i += 1) {
    const empty = document.createElement("div");
    empty.className = "day-cell is-empty";
    els.calendarGrid.append(empty);
  }

  for (let day = 1; day <= lastDate; day += 1) {
    const cellDate = new Date(year, month, day);
    const key = toDateKey(cellDate);
    const excuse = excusesByDate.get(key);
    const cell = document.createElement("div");
    cell.className = "day-cell";
    cell.textContent = day;
    cell.setAttribute(
      "aria-label",
      `${key} 운동 ${workoutDays.has(key) ? "있음" : "없음"}${excuse ? `, SOS: ${excuse.reason}` : ""}`
    );

    if (excuse) {
      cell.title = `SOS: ${excuse.reason}`;
      cell.tabIndex = 0;
      cell.setAttribute("role", "button");
      const revealReason = () => {
        const reasonItem = els.calendarExcuseList.querySelector(`[data-excuse-date="${key}"]`);
        if (!reasonItem) return;
        reasonItem.scrollIntoView({ behavior: "smooth", block: "nearest" });
        reasonItem.classList.add("is-highlighted");
        window.setTimeout(() => reasonItem.classList.remove("is-highlighted"), 1400);
      };
      cell.addEventListener("click", revealReason);
      cell.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          revealReason();
        }
      });
    }
    if (key === todayKey) cell.classList.add("is-today");
    if (workoutDays.has(key)) cell.classList.add("has-workout");
    if (excuse) cell.classList.add("has-sos");

    els.calendarGrid.append(cell);
  }

  const monthExcuses = [...state.excuses].sort((a, b) => b.date.localeCompare(a.date));
  if (monthExcuses.length === 0) {
    const empty = document.createElement("p");
    empty.className = "calendar-excuses-empty";
    empty.textContent = "이번 달 SOS 기록이 없습니다.";
    els.calendarExcuseList.append(empty);
    return;
  }

  const heading = document.createElement("h3");
  heading.textContent = "SOS 사유";
  els.calendarExcuseList.append(heading);
  monthExcuses.forEach((excuse) => {
    const item = document.createElement("div");
    item.className = "calendar-excuse-item";
    item.dataset.excuseDate = excuse.date;

    const dateLabel = document.createElement("strong");
    dateLabel.textContent = excuse.date;
    const reason = document.createElement("p");
    reason.textContent = excuse.reason;
    item.append(dateLabel, reason);
    els.calendarExcuseList.append(item);
  });
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
  ctx.fillStyle = "#fbfdfb";
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "#dce4dd";
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i += 1) {
    const y = 34 + i * 52;
    ctx.beginPath();
    ctx.moveTo(46, y);
    ctx.lineTo(width - 18, y);
    ctx.stroke();
  }

  if (points.length === 0) {
    els.chartSummary.textContent = `${state.selectedExercise.name} 이번 달 기록이 아직 없어요.`;
    ctx.fillStyle = "#627066";
    ctx.font = "24px Arial";
    ctx.textAlign = "center";
    ctx.fillText("기록하면 여기에 그래프가 생겨요", width / 2, height / 2);
    return;
  }

  const values = points.map((point) => point[metric]);
  const maxValue = Math.max(...values, 1);
  const chartLeft = 46;
  const chartRight = width - 18;
  const chartTop = 24;
  const chartBottom = height - 46;
  const step = points.length === 1 ? 0 : (chartRight - chartLeft) / (points.length - 1);

  ctx.strokeStyle = "#1f8f63";
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

  ctx.fillStyle = "#17211b";
  ctx.font = "20px Arial";
  ctx.textAlign = "center";
  points.forEach((point, index) => {
    const x = points.length === 1 ? (chartLeft + chartRight) / 2 : chartLeft + index * step;
    const y = chartBottom - (point[metric] / maxValue) * (chartBottom - chartTop);
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = "16px Arial";
    ctx.fillText(`${Math.round(point[metric])}${unit}`, x, y - 14);
    ctx.fillStyle = "#627066";
    ctx.font = "15px Arial";
    ctx.fillText(point.date.slice(5), x, chartBottom + 28);
    ctx.fillStyle = "#17211b";
  });

  const total = values.reduce((sum, value) => sum + value, 0);
  els.chartSummary.textContent = `${state.selectedExercise.name} 이번 달 ${label}: 총 ${Math.round(total)}${unit}`;
}

function renderHistory() {
  const totalSets = state.logs.reduce((sum, log) => sum + log.completedSets, 0);
  const volume = state.logs.reduce((sum, log) => sum + (log.volume || 0), 0);
  els.monthSummary.textContent = `${state.logs.length}회 · ${totalSets}세트 · ${Math.round(volume)}kg`;
  els.historyList.replaceChildren();

  if (state.logs.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "이번 달 기록이 아직 없어요.";
    els.historyList.append(empty);
    return;
  }

  state.logs.forEach((log) => {
    const item = document.createElement("article");
    item.className = "history-item";

    const title = document.createElement("div");
    title.className = "history-title";
    title.textContent = `${log.exercise} · ${log.date}`;

    const summary = document.createElement("div");
    summary.className = "history-meta";
    summary.textContent = `총 ${log.totalReps}회 · 볼륨 ${Math.round(log.volume)}kg`;
    if (log.notes) summary.textContent += ` · ${log.notes}`;

    const remove = document.createElement("button");
    remove.className = "delete-button";
    remove.type = "button";
    remove.textContent = "×";
    remove.setAttribute("aria-label", `${log.exercise} 기록 삭제`);
    remove.addEventListener("click", async () => {
      const previousLevel = state.stats?.level;
      await api(`/api/logs/${log.id}`, { method: "DELETE" });
      const [, , stats] = await Promise.all([loadLogs(), loadLatestRecord(), loadStats()]);
      showToast("기록을 삭제했어요.");
      announceLevelChange(previousLevel, stats.level);
    });

    const content = document.createElement("div");
    content.append(title, summary, buildRecordTable(rowsFromLog(log)));
    item.append(content, remove);
    els.historyList.append(item);
  });
}

function changeMonth(offset) {
  state.currentMonth = new Date(
    state.currentMonth.getFullYear(),
    state.currentMonth.getMonth() + offset,
    1
  );
  loadLogs().catch((error) => showToast(error.message));
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
  els.confirmWorkoutButton.addEventListener("click", () => {
    saveWorkout().catch((error) => showToast(error.message));
  });
  els.resetSessionButton.addEventListener("click", () => resetSession(false));
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
      if (input) {
        stepNumberInput(input, delta);
      }
    });
  });
  els.enableReminderButton.addEventListener("click", () => {
    enableReminder().catch((error) => showToast(error.message));
  });
  els.sosButton.addEventListener("click", () => {
    saveSosExcuse().catch((error) => showToast(error.message));
  });
  els.volumeChartButton.addEventListener("click", () => setChartMode("volume"));
  els.setsChartButton.addEventListener("click", () => setChartMode("sets"));
  els.prevMonthButton.addEventListener("click", () => changeMonth(-1));
  els.nextMonthButton.addEventListener("click", () => changeMonth(1));
}

async function init() {
  els.counterTitle.textContent = state.selectedExercise.name;
  renderExerciseCards();
  bindEvents();
  normalizedWeight(true);
  syncCounter();
  syncReminderUi();
  registerServiceWorker()
    .then(() => scheduleWorkoutReminder())
    .catch(() => syncReminderUi());
  await Promise.all([loadLogs(), loadLatestRecord(), loadStats()]);
}

init().catch((error) => showToast(error.message));
