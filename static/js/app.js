const primaryExercises = [
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
  { name: "추감기(리버스)", area: "전완", image: "wristroller.webp" },
  { name: "덤벨 루마니안 데드리프트", area: "덤벨 둔근", image: "dumbbell-rdl.webp" },
];

const exerciseLibraryGroups = {
  가슴: [
    "벤치프레스", "인클라인 벤치프레스", "디클라인 벤치프레스", "덤벨 벤치프레스", "인클라인 덤벨 프레스",
    "디클라인 덤벨 프레스", "덤벨 플라이", "인클라인 덤벨 플라이", "케이블 크로스오버", "로우 케이블 플라이",
    "펙덱 플라이", "체스트 프레스 머신", "인클라인 체스트 프레스", "스미스 벤치프레스", "스미스 인클라인 프레스",
    "푸쉬업", "중량가방 푸쉬업", "디클라인 푸쉬업", "인클라인 푸쉬업", "딥스", "체스트 딥스", "플레이트 프레스",
    "덤벨 풀오버", "랜드마인 체스트 프레스", "싱글암 케이블 프레스",
  ],
  등: [
    "랫풀다운", "와이드그립 랫풀다운", "클로즈그립 랫풀다운", "언더그립 랫풀다운", "풀업", "친업", "어시스트 풀업",
    "바벨 로우", "덤벨 로우", "원암 덤벨 로우", "시티드 케이블 로우", "체스트 서포티드 로우", "티바 로우",
    "머신 로우", "하이 로우 머신", "펜들레이 로우", "인버티드 로우", "케이블 풀오버", "스트레이트암 풀다운",
    "덤벨 풀오버", "랙풀", "슈러그", "덤벨 슈러그", "바벨 슈러그", "페이스풀", "리어델트 로우",
  ],
  어깨: [
    "숄더 프레스", "덤벨 숄더 프레스", "바벨 오버헤드 프레스", "스미스 숄더 프레스", "머신 숄더 프레스",
    "아놀드 프레스", "시티드 덤벨 프레스", "푸쉬 프레스", "사이드 레터럴 레이즈", "케이블 레터럴 레이즈",
    "원암 레터럴 레이즈", "프론트 레이즈", "덤벨 프론트 레이즈", "바벨 프론트 레이즈", "리어델트 플라이",
    "벤트오버 레터럴 레이즈", "페이스풀", "업라이트 로우", "덤벨 업라이트 로우", "랜드마인 프레스",
    "플레이트 프론트 레이즈", "Y 레이즈", "스캡션 레이즈", "케이블 리어델트 플라이",
  ],
  팔: [
    "덤벨 컬", "바벨 컬", "이지바 컬", "해머 컬", "인클라인 덤벨 컬", "프리처 컬", "머신 프리처 컬",
    "케이블 컬", "원암 케이블 컬", "컨센트레이션 컬", "스파이더 컬", "리버스 컬", "조트맨 컬",
    "트라이셉스 푸쉬다운", "로프 푸쉬다운", "오버헤드 트라이셉스 익스텐션", "덤벨 오버헤드 익스텐션",
    "스컬크러셔", "클로즈그립 벤치프레스", "벤치 딥스", "딥스", "킥백", "케이블 킥백", "원암 트라이셉스 익스텐션",
    "리버스그립 푸쉬다운", "덤벨 트라이셉스 익스텐션",
  ],
  하체: [
    "스쿼트", "백 스쿼트", "프론트 스쿼트", "고블릿 스쿼트", "스미스 스쿼트", "핵 스쿼트", "레그 프레스",
    "런지", "워킹 런지", "리버스 런지", "덤벨 런지", "불가리안 스플릿 스쿼트", "스텝업", "레그 익스텐션",
    "레그 컬", "라잉 레그 컬", "시티드 레그 컬", "루마니안 데드리프트", "덤벨 루마니안 데드리프트",
    "스티프 레그 데드리프트", "데드리프트", "스모 데드리프트", "힙 쓰러스트", "덤벨 힙", "글루트 브릿지",
    "케이블 킥백", "힙 어브덕션", "힙 어덕션", "카프 레이즈", "시티드 카프 레이즈", "스탠딩 카프 레이즈",
    "티비아 레이즈", "박스 스쿼트", "점프 스쿼트",
  ],
  코어: [
    "크런치", "케이블 크런치", "디클라인 크런치", "싯업", "레그 레이즈", "행잉 레그 레이즈", "니 레이즈",
    "플랭크", "사이드 플랭크", "데드버그", "버드독", "러시안 트위스트", "바이시클 크런치", "마운틴 클라이머",
    "AB 롤아웃", "케이블 우드찹", "팔로프 프레스", "토투바", "힐터치", "리버스 크런치", "브이업",
  ],
  전완그립: [
    "무게판 추감기", "추감기(리버스)", "리스트 컬", "리버스 리스트 컬", "덤벨 리스트 컬", "바벨 리스트 컬",
    "파머스 워크", "덤벨 파머스 워크", "플레이트 핀치", "데드행", "그립퍼", "타월 풀업", "해머 리스트 컬",
    "프로나션", "수피네이션", "리버스 바벨 컬",
  ],
  전신컨디셔닝: [
    "버피", "덤벨 쓰러스터", "케틀벨 스윙", "덤벨 스내치", "케틀벨 클린", "케틀벨 클린앤프레스",
    "덤벨 클린앤프레스", "배틀로프", "슬레드 푸쉬", "슬레드 풀", "메디신볼 슬램", "월볼", "박스 점프",
    "점핑잭", "로잉머신", "어썰트 바이크", "스텝밀", "트레드밀 걷기", "트레드밀 달리기", "사이클",
  ],
  머신케이블: [
    "스미스 머신 벤치프레스", "스미스 머신 스쿼트", "스미스 머신 로우", "스미스 머신 런지", "케이블 로우",
    "케이블 플라이", "케이블 레터럴 레이즈", "케이블 컬", "케이블 푸쉬다운", "케이블 킥백", "케이블 풀오버",
    "케이블 크런치", "레그 프레스 머신", "핵 스쿼트 머신", "체스트 프레스 머신", "숄더 프레스 머신",
    "랫풀다운 머신", "로우 머신", "펙덱 머신", "리어델트 머신", "어브덕션 머신", "어덕션 머신",
  ],
  맨몸: [
    "푸쉬업", "다이아몬드 푸쉬업", "파이크 푸쉬업", "핸드릴리즈 푸쉬업", "딥스", "풀업", "친업",
    "스쿼트", "런지", "점프 런지", "월싯", "힙 브릿지", "싱글레그 브릿지", "노르딕 컬", "백 익스텐션",
    "슈퍼맨", "버피", "플랭크", "사이드 플랭크", "마운틴 클라이머", "레그 레이즈", "브이업",
  ],
};

const USER_KEY_STORAGE = "healthUserKey";
const BOARD_STORAGE = "setCounterBoardPosts";
const BOARD_MIGRATED_STORAGE = "setCounterBoardPostsMigrated";
const MY_EXERCISES_STORAGE = "setCounterMyExercises";
const HIDDEN_EXERCISES_STORAGE = "setCounterHiddenExercises";
const EXERCISE_DETAIL_COLLAPSED_STORAGE = "setCounterExerciseDetailCollapsed";
const REST_TIMER_DURATION_STORAGE = "setCounterRestTimerSeconds";
const SEASON_MOMENT_STORAGE_PREFIX = "setCounterSeasonMoment";
const XP_DISPLAY_SCALE = 100;
const USER_KEY_PATTERN = /^[A-Za-z0-9._:-]{16,128}$/;
const LOCAL_RECOVERY_USER_KEY = "1e0bb65e-47d7-4f5b-ace1-03f0809b952e";
const bodyFilters = ["전체", "가슴", "등", "어깨", "팔", "하체", "코어", "전완그립", "전신컨디셔닝"];
const equipmentFilters = ["전체", "덤벨", "바벨", "머신", "케이블", "맨몸", "자유운동"];

function equipmentForExercise(name, area = "") {
  const value = `${name} ${area}`;
  if (/덤벨/.test(value)) return "덤벨";
  if (/바벨|이지바|스미스/.test(value)) return "바벨";
  if (/머신|펙덱|레그 프레스|핵 스쿼트|어브덕션|어덕션|랫풀다운/.test(value)) return "머신";
  if (/케이블|로프|푸쉬다운/.test(value)) return "케이블";
  if (/푸쉬업|풀업|친업|딥스|버피|플랭크|크런치|싯업|런지|스쿼트|브릿지|데드행|월싯|마운틴/.test(value)) return "맨몸";
  return "자유운동";
}

function bodyForExercise(name, area = "") {
  const value = `${name} ${area}`;
  if (/가슴|벤치|체스트|플라이|푸쉬업|딥스|크로스오버/.test(value)) return "가슴";
  if (/등|로우|랫|풀업|친업|풀다운|풀오버|랙풀|슈러그|데드행/.test(value)) return "등";
  if (/어깨|숄더|오버헤드|레터럴|프론트|리어델트|페이스풀|업라이트|랜드마인|Y 레이즈|스캡션/.test(value)) return "어깨";
  if (/팔|컬|트라이셉스|스컬|킥백|푸쉬다운|익스텐션|그립|리스트|전완|프로나션|수피네이션/.test(value)) return "팔";
  if (/코어|크런치|싯업|레그 레이즈|플랭크|데드버그|버드독|트위스트|마운틴|롤아웃|우드찹|팔로프|브이업|힐터치/.test(value)) return "코어";
  if (/하체|스쿼트|런지|레그|데드리프트|힙|글루트|카프|브릿지|어브덕션|어덕션|스텝업|노르딕|월싯/.test(value)) return "하체";
  if (/버피|스윙|스내치|클린|배틀로프|슬레드|월볼|박스 점프|점핑잭|로잉|바이크|스텝밀|트레드밀|사이클/.test(value)) return "전신컨디셔닝";
  return area || "기타";
}

function uniqueExercises(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = exerciseKey(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function exerciseKey(exercise) {
  return `${exercise.source || "custom"}:${exercise.sourceId || exercise.name}`;
}

function isExerciseDetailCollapsed() {
  return window.localStorage.getItem(EXERCISE_DETAIL_COLLAPSED_STORAGE) === "1";
}

function setExerciseDetailCollapsed(collapsed) {
  window.localStorage.setItem(EXERCISE_DETAIL_COLLAPSED_STORAGE, collapsed ? "1" : "0");
}

const builtInLibraryExercises = uniqueExercises(
  Object.entries(exerciseLibraryGroups).flatMap(([area, names]) =>
    names.map((name) => ({
      source: "setcounter",
      sourceId: name,
      name,
      displayName: name,
      area: bodyForExercise(name, area),
      equipment: equipmentForExercise(name, area),
      image: "",
    }))
  )
);

function loadStoredJson(key, fallback) {
  try {
    const value = JSON.parse(window.localStorage.getItem(key) || "null");
    return value ?? fallback;
  } catch (error) {
    window.localStorage.removeItem(key);
    return fallback;
  }
}

function loadMyExercises() {
  const hidden = new Set(loadStoredJson(HIDDEN_EXERCISES_STORAGE, []));
  const custom = loadStoredJson(MY_EXERCISES_STORAGE, []).map((exercise) => ({
    source: exercise.source || "custom",
    sourceId: exercise.sourceId || exercise.name,
    name: exercise.name,
    displayName: exercise.displayName || exercise.name,
    area: exercise.area || bodyForExercise(exercise.name, ""),
    equipment: exercise.equipment || equipmentForExercise(exercise.name, exercise.area || ""),
    image: exercise.image || "",
    images: exercise.images || [],
    category: exercise.category || null,
    level: exercise.level || null,
    force: exercise.force || null,
    mechanic: exercise.mechanic || null,
    primaryMuscles: exercise.primaryMuscles || [],
    secondaryMuscles: exercise.secondaryMuscles || [],
    instructions: exercise.instructions || [],
  }));
  const merged = uniqueExercises([...primaryExercises, ...custom]).filter((exercise) => !hidden.has(exercise.name));
  return merged.length ? merged : [primaryExercises[0]];
}

function saveMyExerciseSettings() {
  const primaryNames = new Set(primaryExercises.map((exercise) => exercise.name));
  const custom = exercises.filter((exercise) => !primaryNames.has(exercise.name) || exercise.source);
  const hidden = primaryExercises
    .filter((exercise) => !exercises.some((item) => item.name === exercise.name))
    .map((exercise) => exercise.name);
  window.localStorage.setItem(MY_EXERCISES_STORAGE, JSON.stringify(custom));
  window.localStorage.setItem(HIDDEN_EXERCISES_STORAGE, JSON.stringify(hidden));
}

let libraryExercises = builtInLibraryExercises;
let exercises = loadMyExercises();
let koExerciseMap = {};
let koCommonExerciseMap = {};
let koMuscleMap = {};
let koEquipmentMap = {};
let koInstructionsMap = {};
let koInstructionsLoadPromise = null;
let setCounterDefaultExercises = [];
const defaultApiNameOverrides = {
  Barbell_Hip_Thrust: "바벨 힙 쓰러스트",
  Romanian_Deadlift: "루마니안 데드리프트",
};
const LIBRARY_PAGE_SIZE = 40;
const libraryState = { body: "전체", equipment: "전체", visible: LIBRARY_PAGE_SIZE };

function isLocalAccess() {
  return window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("172.30.1.") || window.location.hostname.startsWith("192.168.");
}

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
  if (isLocalAccess() && USER_KEY_PATTERN.test(LOCAL_RECOVERY_USER_KEY)) {
    window.localStorage.setItem(USER_KEY_STORAGE, LOCAL_RECOVERY_USER_KEY);
    return LOCAL_RECOVERY_USER_KEY;
  }
  const generated = createUserKey();
  window.localStorage.setItem(USER_KEY_STORAGE, generated);
  return generated;
}

let healthUserKey = loadUserKey();

function replaceHealthUserKey() {
  const nextKey = createUserKey();
  window.localStorage.setItem(USER_KEY_STORAGE, nextKey);
  healthUserKey = nextKey;
  return nextKey;
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function formatNumber(value) {
  return Math.round(Number(value) || 0).toLocaleString("en-US");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

const levelTiers = [
  { minimum: 95, className: "champion", label: "PRISM", labelKo: "프리즘", image: "/static/assets/level-badges/rank-11.webp?v=3" },
  { minimum: 90, className: "crown", label: "OBSIDIAN", labelKo: "옵시디언", image: "/static/assets/level-badges/rank-10.webp?v=3" },
  { minimum: 80, className: "crimson", label: "CRIMSON", labelKo: "크림슨", image: "/static/assets/level-badges/rank-09.webp?v=3" },
  { minimum: 70, className: "black-diamond", label: "AMETHYST", labelKo: "아메시스트", image: "/static/assets/level-badges/rank-08.webp?v=3" },
  { minimum: 60, className: "diamond", label: "SAPPHIRE", labelKo: "사파이어", image: "/static/assets/level-badges/rank-07.webp?v=3" },
  { minimum: 50, className: "platinum", label: "FROST", labelKo: "프로스트", image: "/static/assets/level-badges/rank-06.webp?v=3" },
  { minimum: 40, className: "red-gold", label: "GOLD", labelKo: "골드", image: "/static/assets/level-badges/rank-05.webp?v=3" },
  { minimum: 30, className: "gold", label: "SILVER", labelKo: "실버", image: "/static/assets/level-badges/rank-04.webp?v=3" },
  { minimum: 20, className: "silver", label: "ROSE", labelKo: "로즈", image: "/static/assets/level-badges/rank-03.webp?v=3" },
  { minimum: 10, className: "bronze", label: "STEEL", labelKo: "스틸", image: "/static/assets/level-badges/rank-02.webp?v=3" },
  { minimum: 1, className: "iron", label: "BRONZE", labelKo: "브론즈", image: "/static/assets/level-badges/rank-01.webp?v=3" },
];

function levelTier(level) {
  const numericLevel = Math.max(1, Number(level) || 1);
  return levelTiers.find((tier) => numericLevel >= tier.minimum) || levelTiers[levelTiers.length - 1];
}

function levelBadgeClass(level) {
  const tier = levelTier(level);
  return `level-badge ${tier.className}`;
}

function levelBadgeMarkup(level) {
  const tier = levelTier(level);
  return `
    <span class="${levelBadgeClass(level)}" aria-label="${tier.labelKo} 레벨 ${level}" data-rank="${tier.label}">
      <img class="level-badge-image" src="${tier.image}" alt="" aria-hidden="true" decoding="async">
      <span class="level-badge-number">${level}</span>
    </span>
  `;
}

function displayNickname(value) {
  const nickname = String(value || "").trim();
  return !nickname || nickname === "???" ? "운영자" : nickname;
}

function freeDbImageUrl(path) {
  return `/static/data/free-exercise-db/${path}`;
}

function mappedExerciseEntry(exercise) {
  if (!exercise) return {};
  return koExerciseMap[exercise.sourceId] || koExerciseMap[exercise.name] || {};
}

function exerciseDisplayName(exercise) {
  if (!exercise) return "";
  return mappedExerciseEntry(exercise).displayName || exercise.displayName || exercise.name || "";
}

function storedExerciseDisplayName(name) {
  const exercise = exercises.find((item) => item.name === name);
  return exercise ? exerciseDisplayName(exercise) : name;
}

function exerciseEnglishName(exercise) {
  if (!exercise) return "";
  return exercise.englishName || exercise.freeDbName || exercise.originalName || exercise.name || "";
}

function translateMuscle(value) {
  return koMuscleMap[value] || value || "-";
}

function translateEquipment(value) {
  return koEquipmentMap[value] || value || "-";
}

function translateLevel(value) {
  return {
    beginner: "초급",
    intermediate: "중급",
    expert: "상급",
  }[value] || value || "-";
}

function translateCategory(value) {
  return {
    cardio: "유산소",
    olympic_weightlifting: "올림픽 리프팅",
    "olympic weightlifting": "올림픽 리프팅",
    plyometrics: "플라이오메트릭",
    powerlifting: "파워리프팅",
    strength: "근력",
    stretching: "스트레칭",
    strongman: "스트롱맨",
  }[value] || value || "-";
}

function translateForce(value) {
  return {
    pull: "당기는 동작",
    push: "미는 동작",
    static: "정적 동작",
  }[value] || value || "-";
}

function translateMechanic(value) {
  return {
    compound: "복합 관절",
    isolation: "단일 관절",
  }[value] || value || "-";
}

function sourceLabel(value) {
  return {
    "free-exercise-db": "운동 데이터",
    "setcounter-free-db": "내 기본 운동",
    setcounter: "직접 추가 운동",
    custom: "직접 추가 운동",
  }[value] || "운동 정보";
}

function translateMuscleList(values, fallback = "-") {
  const list = (values || []).map(translateMuscle).filter(Boolean);
  return list.length ? list.join(", ") : fallback;
}

const koreanExerciseInstructions = {
  Dumbbell_Shoulder_Press: [
    "등받이가 있는 벤치에 앉아 양손에 덤벨을 들고, 덤벨을 허벅지 위에 세워 둡니다.",
    "허벅지로 가볍게 밀어 올리며 덤벨을 한쪽씩 어깨 높이로 가져옵니다.",
    "손바닥이 앞을 향하도록 손목을 돌리고, 가슴을 편 상태에서 등과 머리를 등받이에 안정적으로 붙입니다.",
    "숨을 내쉬며 덤벨을 머리 위로 밀어 올립니다. 팔꿈치를 과하게 잠그거나 허리를 젖히지 않습니다.",
    "정점에서 잠시 어깨의 수축을 느낀 뒤, 숨을 들이마시며 덤벨을 천천히 어깨 높이까지 내립니다.",
  ],
  Side_Lateral_Raise: [
    "양손에 덤벨을 들고 몸통을 곧게 세웁니다. 팔은 몸 옆에 두고 손바닥은 몸을 향하게 합니다.",
    "몸을 흔들지 않은 채 팔꿈치를 살짝 굽히고, 숨을 내쉬며 양팔을 옆으로 들어 올립니다.",
    "팔이 바닥과 평행해지는 어깨 높이에서 잠시 멈춥니다. 손목이 팔꿈치보다 지나치게 높아지지 않게 합니다.",
    "숨을 들이마시며 덤벨을 시작 자세로 천천히 내립니다.",
  ],
  Pushups: [
    "바닥을 보고 엎드린 뒤 손을 어깨보다 약간 넓게 짚고, 머리부터 발뒤꿈치까지 몸을 곧게 만듭니다.",
    "코어와 엉덩이에 힘을 준 채 숨을 들이마시며 가슴이 바닥 가까이 올 때까지 몸을 내립니다.",
    "팔꿈치가 몸통에서 과하게 벌어지지 않도록 유지하고, 숨을 내쉬며 바닥을 밀어 시작 자세로 돌아옵니다.",
    "몸통이 처지거나 허리가 꺾이지 않는 범위에서 같은 동작을 반복합니다.",
  ],
  Seated_Dumbbell_Curl: [
    "플랫 벤치에 앉아 양손에 덤벨을 들고 팔을 아래로 편 뒤, 팔꿈치를 몸통 가까이에 고정합니다.",
    "처음에는 손바닥이 몸을 향하게 하고, 덤벨을 올리면서 손바닥이 앞을 향하도록 손목을 천천히 돌립니다.",
    "상완을 움직이지 않은 채 숨을 내쉬며 덤벨을 어깨 쪽으로 들어 올리고, 이두근을 끝까지 수축합니다.",
    "정점에서 잠시 멈춘 뒤 숨을 들이마시며 손목을 중립으로 되돌리고 덤벨을 천천히 내립니다.",
  ],
  Hammer_Curls: [
    "양손에 덤벨을 들고 곧게 서서 팔꿈치를 몸통 가까이에 둡니다. 손바닥은 서로 마주 보게 합니다.",
    "상완과 팔꿈치를 고정한 채 숨을 내쉬며 덤벨을 어깨 쪽으로 들어 올립니다.",
    "이두근과 전완의 수축을 느끼며 잠시 멈춥니다. 반동을 쓰거나 팔꿈치가 앞으로 밀리지 않게 합니다.",
    "숨을 들이마시며 덤벨을 시작 자세까지 천천히 내립니다.",
  ],
  Goblet_Squat: [
    "케틀벨이나 덤벨을 가슴 가까이 세워 들고, 발을 어깨너비 정도로 벌립니다.",
    "가슴을 편 채 엉덩이를 뒤로 보내고 무릎을 굽혀 두 다리 사이로 앉습니다.",
    "발바닥 전체를 바닥에 붙이고 무릎이 발끝 방향을 따라가도록 유지합니다.",
    "가동 범위의 가장 아래에서 잠시 멈춘 뒤, 발바닥으로 바닥을 밀며 일어나 시작 자세로 돌아옵니다.",
  ],
  "One-Arm_Dumbbell_Row": [
    "벤치 한쪽에 같은 쪽 무릎과 손을 짚고, 반대쪽 손으로 덤벨을 듭니다.",
    "등을 곧게 펴고 몸통을 바닥과 거의 평행하게 유지합니다. 덤벨을 든 팔은 어깨 아래로 자연스럽게 늘어뜨립니다.",
    "몸통을 돌리지 않은 채 숨을 내쉬며 팔꿈치를 몸통 가까이 붙여 덤벨을 옆구리 쪽으로 당깁니다.",
    "정점에서 견갑골을 뒤로 모아 등 근육을 수축하고, 팔 힘만으로 끌어올리지 않도록 합니다.",
    "숨을 들이마시며 덤벨을 천천히 아래로 내린 뒤, 정해진 횟수를 마치고 반대쪽도 반복합니다.",
  ],
  "Barbell_Bench_Press_-_Medium_Grip": [
    "플랫 벤치에 누워 눈이 바벨 바로 아래에 오도록 자리 잡습니다. 발바닥은 바닥에 단단히 고정합니다.",
    "바를 어깨너비보다 약간 넓게 잡고 견갑골을 뒤로 모아 벤치에 고정한 뒤, 바를 랙에서 들어 가슴 위로 옮깁니다.",
    "숨을 들이마시며 팔꿈치를 몸통에서 약 45~70도 벌린 상태로 바를 가슴 중앙까지 통제하며 내립니다.",
    "바가 가슴에 가볍게 닿으면 발과 등을 안정적으로 유지한 채 숨을 내쉬며 바를 위로 밀어 올립니다.",
    "팔꿈치를 과하게 잠그지 말고 시작 위치에서 균형을 잡습니다. 하강 동작은 밀어 올리는 동작보다 천천히 수행합니다.",
    "세트를 마치면 바가 랙 위에 정확히 놓였는지 확인한 뒤 손을 놓습니다.",
  ],
  Barbell_Hip_Thrust: [
    "벤치 앞 바닥에 앉아 견갑골 아래쪽을 벤치 모서리에 대고, 패드를 댄 바벨을 골반 위에 놓습니다.",
    "발은 골반 너비로 두고 무릎을 굽힙니다. 턱을 살짝 당기고 갈비뼈가 들리지 않도록 코어에 힘을 줍니다.",
    "발뒤꿈치로 바닥을 밀며 엉덩이를 들어 올려 어깨부터 무릎까지 일직선이 되게 합니다.",
    "정점에서 허리를 꺾지 말고 엉덩이를 강하게 수축한 뒤, 통제하며 골반을 내려 시작 자세로 돌아옵니다.",
  ],
  Wrist_Roller: [
    "양발을 어깨너비로 벌리고 서서 손바닥이 아래를 향하도록 추감기 손잡이를 잡습니다.",
    "팔을 앞으로 뻗어 바닥과 평행하게 유지합니다. 어깨를 으쓱하거나 몸통을 흔들지 않습니다.",
    "양쪽 손목을 번갈아 위로 감아 로프와 무게판을 손잡이 가까이 끌어올립니다.",
    "무게가 끝까지 올라오면 손목을 반대 방향으로 천천히 돌려 무게를 통제하며 내립니다.",
  ],
  Romanian_Deadlift: [
    "바벨이나 덤벨을 허벅지 앞에 들고 발을 골반 너비로 둡니다. 무릎은 살짝 굽히고 가슴과 등을 곧게 유지합니다.",
    "정강이를 거의 수직으로 유지한 채 엉덩이를 뒤로 밀어 중량을 다리 가까이 따라 내립니다.",
    "등이 굽지 않는 범위에서 햄스트링이 충분히 늘어나는 지점까지 내려갑니다.",
    "발바닥으로 바닥을 밀고 엉덩이를 앞으로 보내며 일어섭니다. 허리를 뒤로 과하게 젖히지 말고 둔근을 수축합니다.",
    "동작 내내 중량을 몸 가까이에 두고, 반동 없이 일정한 속도로 반복합니다.",
  ],
};

function exerciseInstructionsForDetail(exercise) {
  const sourceId = exercise.freeDbSourceId || exercise.sourceId;
  if (koreanExerciseInstructions[sourceId]) return koreanExerciseInstructions[sourceId];
  if (koInstructionsMap[sourceId]?.length) return koInstructionsMap[sourceId];
  if (exercise.instructionsKo?.length) return exercise.instructionsKo;
  return [];
}

async function loadKoreanInstructions() {
  if (Object.keys(koInstructionsMap).length) return koInstructionsMap;
  if (!koInstructionsLoadPromise) {
    koInstructionsLoadPromise = fetch("/static/data/free-exercise-db/ko_instructions.json?v=1")
      .then((response) => {
        if (!response.ok) throw new Error("exercise instructions load failed");
        return response.json();
      })
      .then((payload) => {
        koInstructionsMap = payload || {};
        return koInstructionsMap;
      })
      .catch((error) => {
        koInstructionsLoadPromise = null;
        throw error;
      });
  }
  return koInstructionsLoadPromise;
}
function exerciseSearchTerms(exercise) {
  const mapped = mappedExerciseEntry(exercise);
  return [
    exercise.name,
    exerciseDisplayName(exercise),
    exerciseEnglishName(exercise),
    exercise.area,
    exercise.equipment,
    translateEquipment(exercise.equipment),
    exercise.level,
    translateLevel(exercise.level),
    exercise.force,
    translateForce(exercise.force),
    exercise.mechanic,
    translateMechanic(exercise.mechanic),
    exercise.category,
    translateCategory(exercise.category),
    ...(mapped.aliases || []),
    ...(exercise.primaryMuscles || []),
    ...(exercise.secondaryMuscles || []),
    ...(exercise.primaryMuscles || []).map(translateMuscle),
    ...(exercise.secondaryMuscles || []).map(translateMuscle),
  ].filter(Boolean);
}

function normalizeFreeDbExercise(item, koMap = {}) {
  const mapped = koMap[item.sourceId] || koMap[item.id] || {};
  return {
    source: item.source || "free-exercise-db",
    sourceId: item.sourceId,
    name: mapped.displayName || item.displayName || item.name,
    englishName: item.name,
    freeDbName: item.name,
    displayName: mapped.displayName || item.displayName || item.name,
    area: translateMuscle((item.primaryMuscles && item.primaryMuscles[0]) || item.category || "free-db"),
    equipment: item.equipment || "other",
    image: "",
    images: item.images || [],
    category: item.category,
    level: item.level,
    force: item.force,
    mechanic: item.mechanic,
    primaryMuscles: item.primaryMuscles || [],
    secondaryMuscles: item.secondaryMuscles || [],
    instructions: item.instructions || [],
    instructionsKo: koInstructionsMap[item.sourceId] || [],
  };
}

function mergeSetCounterDefaults(freeExercises) {
  const bySourceId = new Map(freeExercises.map((exercise) => [exercise.sourceId, exercise]));
  const seenSourceIds = new Set();
  return setCounterDefaultExercises.filter((preset) => {
    if (seenSourceIds.has(preset.sourceId)) return false;
    seenSourceIds.add(preset.sourceId);
    return true;
  }).map((preset) => {
    const base = bySourceId.get(preset.sourceId) || {};
    const apiDisplayName = defaultApiNameOverrides[preset.sourceId]
      || koCommonExerciseMap[preset.sourceId]?.displayName
      || base.englishName
      || base.freeDbName
      || preset.sourceId;
    return {
      ...base,
      source: "setcounter-free-db",
      sourceId: `setcounter:${preset.name}`,
      freeDbSourceId: preset.sourceId,
      name: preset.name,
      displayName: apiDisplayName,
      englishName: base.englishName || base.name || preset.sourceId,
      area: preset.area || base.area || "-",
      equipment: base.equipment || "other",
      image: "",
      images: base.images || [],
      category: base.category,
      level: base.level,
      force: base.force,
      mechanic: base.mechanic,
      primaryMuscles: base.primaryMuscles || [],
      secondaryMuscles: base.secondaryMuscles || [],
      instructions: base.instructions || [],
      instructionsKo: base.instructionsKo || [],
      aliases: preset.aliases || [],
    };
  });
}

function replacePrimaryExercises(defaultExercises) {
  if (!defaultExercises.length) return;
  const hidden = new Set(loadStoredJson(HIDDEN_EXERCISES_STORAGE, []));
  const visibleDefaults = defaultExercises.filter((exercise) => !hidden.has(exercise.name));
  const primaryKeys = new Set(primaryExercises.map((exercise) => exerciseKey(exercise)));
  const primaryNames = new Set(primaryExercises.map((exercise) => exercise.name));
  const kept = exercises.filter((exercise) => {
    if (exercise.source === "setcounter-free-db") return false;
    if (primaryKeys.has(exerciseKey(exercise))) return false;
    if (!exercise.source && primaryNames.has(exercise.name)) return false;
    return true;
  });
  exercises = uniqueExercises([...visibleDefaults, ...kept]);
  state.selectedExercise = exercises[0];
}

async function loadFreeExerciseDb() {
  try {
    const [exerciseResponse, mapResponse, commonMapResponse, muscleResponse, equipmentResponse] = await Promise.all([
      fetch("/static/data/free-exercise-db/exercises.json"),
      fetch("/static/data/free-exercise-db/ko_exercise_map.json?v=4"),
      fetch("/static/data/free-exercise-db/ko_exercise_common_map.json?v=1"),
      fetch("/static/data/free-exercise-db/ko_muscle_map.json"),
      fetch("/static/data/free-exercise-db/ko_equipment_map.json"),
    ]);
    if (!exerciseResponse.ok) throw new Error("free exercise db load failed");
    const rawExercises = await exerciseResponse.json();
    const koMapPayload = mapResponse.ok ? await mapResponse.json() : { items: {} };
    const commonMapPayload = commonMapResponse.ok ? await commonMapResponse.json() : {};
    const commonItems = Object.fromEntries(
      Object.entries(commonMapPayload).map(([sourceId, displayName]) => [sourceId, { displayName, aliases: [displayName] }]),
    );
    koCommonExerciseMap = commonItems;
    koExerciseMap = { ...commonItems, ...(koMapPayload.items || {}) };
    koMuscleMap = muscleResponse.ok ? await muscleResponse.json() : {};
    koEquipmentMap = equipmentResponse.ok ? await equipmentResponse.json() : {};
    setCounterDefaultExercises = koMapPayload.setCounterDefaults || [];
    const freeExercises = rawExercises.map((item) => normalizeFreeDbExercise(item, koExerciseMap));
    const defaultExercises = mergeSetCounterDefaults(freeExercises);
    libraryExercises = uniqueExercises([...defaultExercises, ...freeExercises]);
    replacePrimaryExercises(defaultExercises);
  } catch (error) {
    libraryExercises = builtInLibraryExercises;
    showToast("운동 데이터셋을 불러오지 못했습니다.");
  }
}

function loadLocalBoardPosts() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(BOARD_STORAGE) || "[]");
    if (Array.isArray(stored)) return stored;
  } catch (error) {
    window.localStorage.removeItem(BOARD_STORAGE);
  }
  return [];
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
  activeRoutine: null,
  planExerciseDetailIndex: 0,
  planExerciseDetailSteps: [],
  selectedPlan: null,
  currentMonth: new Date(),
  boardPosts: [],
  boardSort: "latest",
  boardExpandedPosts: new Set(),
  boardPendingLikes: new Set(),
  boardPendingComments: new Set(),
  boardPosting: false,
  boardReportSubmitting: false,
  boardReportTarget: null,
  boardSortLoading: false,
  complaintSubmitting: false,
  editingExercises: false,
  exercisePickerExpanded: false,
  excuses: [],
  lastRecord: null,
  logs: [],
  pendingNextRecommendation: null,
  initialEntryRouted: false,
  recommendationInitialized: false,
  recommendedExerciseKey: null,
  recordDateFromCalendar: false,
  selectedDate: todayKey,
  selectedExercise: exercises[0],
  selectedExercisesForDelete: new Set(),
  serviceWorkerReady: null,
  sosSubmitting: false,
  menuOverlayTrigger: null,
  levelUpContinuation: null,
  setRows: [],
  stats: null,
  profile: null,
  auth: { loaded: false, authenticated: false, anonymous: true, accountLinked: false, emailMasked: null, hasAnonymousData: false, csrfToken: null },
  weeklyGoalDraft: null,
};

const storedRestTimerDuration = Number.parseInt(window.localStorage.getItem(REST_TIMER_DURATION_STORAGE), 10);
const initialRestTimerDuration = Number.isFinite(storedRestTimerDuration)
  ? Math.min(Math.max(Math.round(storedRestTimerDuration / 10) * 10, 10), 600)
  : 90;
const restTimerState = {
  duration: initialRestTimerDuration,
  remaining: initialRestTimerDuration,
  deadline: 0,
  intervalId: null,
  running: false,
  paused: false,
  finished: false,
};

const els = {
  exerciseGrid: document.querySelector("#exerciseGrid"),
  toggleExerciseEditButton: document.querySelector("#toggleExerciseEditButton"),
  toggleExerciseGridButton: document.querySelector("#toggleExerciseGridButton"),
  exerciseEditBar: document.querySelector("#exerciseEditBar"),
  exerciseEditCount: document.querySelector("#exerciseEditCount"),
  deleteSelectedExercisesButton: document.querySelector("#deleteSelectedExercisesButton"),
  openExerciseLibraryButton: document.querySelector("#openExerciseLibraryButton"),
  exerciseLibraryModal: document.querySelector("#exerciseLibraryModal"),
  closeExerciseLibraryButton: document.querySelector("#closeExerciseLibraryButton"),
  exerciseLibrarySearch: document.querySelector("#exerciseLibrarySearch"),
  bodyFilterRow: document.querySelector("#bodyFilterRow"),
  equipmentFilterRow: document.querySelector("#equipmentFilterRow"),
  exerciseLibraryCount: document.querySelector("#exerciseLibraryCount"),
  exerciseLibraryList: document.querySelector("#exerciseLibraryList"),
  exerciseDetailCard: document.querySelector("#exerciseDetailCard"),
  screens: document.querySelectorAll(".app-screen"),
  navButtons: document.querySelectorAll(".bottom-nav [data-tab]"),
  goScreenButtons: document.querySelectorAll("[data-go-screen]"),
  menuButton: document.querySelector("#menuButton"),
  menuPopover: document.querySelector("#menuPopover"),
  changeNicknameButton: document.querySelector("#changeNicknameButton"),
  menuNicknameButton: document.querySelector("#menuNicknameButton"),
  userBadgeLabel: document.querySelector("#userBadgeLabel"),
  levelHistoryModal: document.querySelector("#levelHistoryModal"),
  closeLevelHistoryButton: document.querySelector("#closeLevelHistoryButton"),
  levelHistoryAthlete: document.querySelector("#levelHistoryAthlete"),
  levelHistoryXpText: document.querySelector("#levelHistoryXpText"),
  levelHistoryXpBar: document.querySelector("#levelHistoryXpBar"),
  levelHistoryXpTrack: document.querySelector(".level-history-xp-track"),
  levelHistoryXpDetail: document.querySelector("#levelHistoryXpDetail"),
  levelHistoryCount: document.querySelector("#levelHistoryCount"),
  levelHistoryList: document.querySelector("#levelHistoryList"),
  menuUserBadge: document.querySelector("#menuUserBadge"),
  menuExpCopy: document.querySelector("#menuExpCopy"),
  menuNicknameAvailability: document.querySelector("#menuNicknameAvailability"),
  homeDateLabel: document.querySelector("#homeDateLabel"),
  homeExerciseCount: document.querySelector("#homeExerciseCount"),
  homeSetCount: document.querySelector("#homeSetCount"),
  homeVolume: document.querySelector("#homeVolume"),
  homeReps: document.querySelector("#homeReps"),
  homeCompareVolume: document.querySelector("#homeCompareVolume"),
  homeCompareReps: document.querySelector("#homeCompareReps"),
  homeCompareExercises: document.querySelector("#homeCompareExercises"),
  homeTodayList: document.querySelector("#homeTodayList"),
  workoutPlanRail: document.querySelector("#workoutPlanRail"),
  closePlanDetailButton: document.querySelector("#closePlanDetailButton"),
  planDetailTitle: document.querySelector("#planDetailTitle"),
  planDetailHero: document.querySelector("#planDetailHero"),
  planDetailLabel: document.querySelector("#planDetailLabel"),
  planDetailHeroTitle: document.querySelector("#planDetailHeroTitle"),
  planDetailDifficulty: document.querySelector("#planDetailDifficulty"),
  planDetailIntro: document.querySelector("#planDetailIntro"),
  planDetailTags: document.querySelector("#planDetailTags"),
  planWorkoutSections: document.querySelector("#planWorkoutSections"),
  planInfoGrid: document.querySelector("#planInfoGrid"),
  planBenefitList: document.querySelector("#planBenefitList"),
  planSchedule: document.querySelector("#planSchedule"),
  startPlanDetailButton: document.querySelector("#startPlanDetailButton"),
  planExerciseDetailModal: document.querySelector("#planExerciseDetailModal"),
  planExerciseDetailTitle: document.querySelector("#planExerciseDetailTitle"),
  planExerciseDetailImage: document.querySelector("#planExerciseDetailImage"),
  planExerciseDetailMetaLabel: document.querySelector("#planExerciseDetailMetaLabel"),
  planExerciseDetailMeta: document.querySelector("#planExerciseDetailMeta"),
  planExerciseDetailDescription: document.querySelector("#planExerciseDetailDescription"),
  planExerciseDetailMuscles: document.querySelector("#planExerciseDetailMuscles"),
  planExerciseDetailPage: document.querySelector("#planExerciseDetailPage"),
  previousPlanExerciseButton: document.querySelector("#previousPlanExerciseButton"),
  nextPlanExerciseButton: document.querySelector("#nextPlanExerciseButton"),
  closePlanExerciseDetailButton: document.querySelector("#closePlanExerciseDetailButton"),
  confirmPlanExerciseDetailButton: document.querySelector("#confirmPlanExerciseDetailButton"),
  profileModal: document.querySelector("#profileModal"),
  profileForm: document.querySelector("#profileForm"),
  profileModalTitle: document.querySelector("#profileModalTitle"),
  profileModalCopy: document.querySelector("#profileModalCopy"),
  closeProfileButton: document.querySelector("#closeProfileButton"),
  nicknameInput: document.querySelector("#nicknameInput"),
  nicknameCounter: document.querySelector("#nicknameCounter"),
  nicknameAvailabilityNote: document.querySelector("#nicknameAvailabilityNote"),
  saveNicknameButton: document.querySelector("#saveNicknameButton"),
  profileLoginButton: document.querySelector("#profileLoginButton"),
  profileError: document.querySelector("#profileError"),
  complaintModal: document.querySelector("#complaintModal"),
  complaintForm: document.querySelector("#complaintForm"),
  complaintModalTitle: document.querySelector("#complaintModalTitle"),
  complaintModalCopy: document.querySelector("#complaintModalCopy"),
  complaintInput: document.querySelector("#complaintInput"),
  complaintCounter: document.querySelector("#complaintCounter"),
  complaintSubmitButton: document.querySelector("#complaintSubmitButton"),
  complaintError: document.querySelector("#complaintError"),
  closeComplaintButton: document.querySelector("#closeComplaintButton"),
  closeComplaintTopButton: document.querySelector("#closeComplaintTopButton"),
  openFeedbackButton: document.querySelector("#openFeedbackButton"),
  openFaqButton: document.querySelector("#openFaqButton"),
  faqModal: document.querySelector("#faqModal"),
  closeFaqButton: document.querySelector("#closeFaqButton"),
  openPrivacyButton: document.querySelector("#openPrivacyButton"),
  openTermsButton: document.querySelector("#openTermsButton"),
  privacyModal: document.querySelector("#privacyModal"),
  closePrivacyButton: document.querySelector("#closePrivacyButton"),
  versionButton: document.querySelector("#versionButton"),
  levelUpStage: document.querySelector("#levelUpStage"),
  levelUpEmblem: document.querySelector("#levelUpEmblem"),
  levelUpCrest: document.querySelector("#levelUpCrest"),
  levelUpBadgeImage: document.querySelector("#levelUpBadgeImage"),
  levelUpBurst: document.querySelector("#levelUpBurst"),
  levelUpOrbitOuter: document.querySelector("#levelUpOrbitOuter"),
  levelUpOrbitInner: document.querySelector("#levelUpOrbitInner"),
  levelUpSheen: document.querySelector("#levelUpSheen"),
  levelUpRankName: document.querySelector("#levelUpRankName"),
  levelUpNumber: document.querySelector("#levelUpNumber"),
  levelUpPrevious: document.querySelector("#levelUpPrevious"),
  levelUpNext: document.querySelector("#levelUpNext"),
  levelUpProgressBar: document.querySelector("#levelUpProgressBar"),
  levelUpResult: document.querySelector("#levelUpResult"),
  levelUpResultRank: document.querySelector("#levelUpResultRank"),
  levelUpResultNumber: document.querySelector("#levelUpResultNumber"),
  levelUpContinueButton: document.querySelector("#levelUpContinueButton"),
  seasonMoment: document.querySelector("#seasonMoment"),
  seasonMomentKicker: document.querySelector("#seasonMomentKicker"),
  seasonMomentTitle: document.querySelector("#seasonMomentTitle"),
  seasonMomentCopy: document.querySelector("#seasonMomentCopy"),
  seasonMomentButton: document.querySelector("#seasonMomentButton"),
  accountPanel: document.querySelector("#accountPanel"),
  accountPanelTitle: document.querySelector("#accountPanelTitle"),
  accountPanelCopy: document.querySelector("#accountPanelCopy"),
  accountEmail: document.querySelector("#accountEmail"),
  anonymousAccountActions: document.querySelector("#anonymousAccountActions"),
  authenticatedAccountActions: document.querySelector("#authenticatedAccountActions"),
  openRegisterButton: document.querySelector("#openRegisterButton"),
  openLoginButton: document.querySelector("#openLoginButton"),
  logoutButton: document.querySelector("#logoutButton"),
  openDeleteAccountButton: document.querySelector("#openDeleteAccountButton"),
  weeklyGoalPanel: document.querySelector("#weeklyGoalPanel"),
  weeklyGoalForm: document.querySelector("#weeklyGoalForm"),
  weeklyGoalBadge: document.querySelector("#weeklyGoalBadge"),
  weeklyGoalProgress: document.querySelector("#weeklyGoalProgress"),
  weeklyGoalRemaining: document.querySelector("#weeklyGoalRemaining"),
  weeklyGoalTrack: document.querySelector(".weekly-goal-track"),
  weeklyGoalBar: document.querySelector("#weeklyGoalBar"),
  weeklyGoalValue: document.querySelector("#weeklyGoalValue"),
  weeklyGoalDecrease: document.querySelector("#weeklyGoalDecrease"),
  weeklyGoalIncrease: document.querySelector("#weeklyGoalIncrease"),
  weeklyGoalSaveButton: document.querySelector("#weeklyGoalSaveButton"),
  weeklyGoalHelp: document.querySelector("#weeklyGoalHelp"),
  registerModal: document.querySelector("#registerModal"),
  registerForm: document.querySelector("#registerForm"),
  registerEmailInput: document.querySelector("#registerEmailInput"),
  registerPasswordInput: document.querySelector("#registerPasswordInput"),
  registerPasswordConfirmInput: document.querySelector("#registerPasswordConfirmInput"),
  registerTermsInput: document.querySelector("#registerTermsInput"),
  registerError: document.querySelector("#registerError"),
  registerSubmitButton: document.querySelector("#registerSubmitButton"),
  closeRegisterButton: document.querySelector("#closeRegisterButton"),
  loginModal: document.querySelector("#loginModal"),
  loginForm: document.querySelector("#loginForm"),
  loginEmailInput: document.querySelector("#loginEmailInput"),
  loginPasswordInput: document.querySelector("#loginPasswordInput"),
  loginError: document.querySelector("#loginError"),
  loginSubmitButton: document.querySelector("#loginSubmitButton"),
  closeLoginButton: document.querySelector("#closeLoginButton"),
  deleteAccountModal: document.querySelector("#deleteAccountModal"),
  deleteAccountForm: document.querySelector("#deleteAccountForm"),
  deleteAccountPasswordInput: document.querySelector("#deleteAccountPasswordInput"),
  deleteAccountConfirmInput: document.querySelector("#deleteAccountConfirmInput"),
  deleteAccountError: document.querySelector("#deleteAccountError"),
  deleteAccountSubmitButton: document.querySelector("#deleteAccountSubmitButton"),
  closeDeleteAccountButton: document.querySelector("#closeDeleteAccountButton"),
  authConflictModal: document.querySelector("#authConflictModal"),
  anonymousConflictSummary: document.querySelector("#anonymousConflictSummary"),
  accountConflictSummary: document.querySelector("#accountConflictSummary"),
  closeAuthConflictButton: document.querySelector("#closeAuthConflictButton"),
  authAlertModal: document.querySelector("#authAlertModal"),
  authAlertMessage: document.querySelector("#authAlertMessage"),
  closeAuthAlertButton: document.querySelector("#closeAuthAlertButton"),
  nextRecommendationModal: document.querySelector("#nextRecommendationModal"),
  nextRecommendationTitle: document.querySelector("#nextRecommendationTitle"),
  nextRecommendationName: document.querySelector("#nextRecommendationName"),
  nextRecommendationReason: document.querySelector("#nextRecommendationReason"),
  closeNextRecommendationButton: document.querySelector("#closeNextRecommendationButton"),
  startNextRecommendationButton: document.querySelector("#startNextRecommendationButton"),
  counterTitle: document.querySelector("#counterTitle"),
  selectedDateBanner: document.querySelector("#selectedDateBanner"),
  selectedDateLabel: document.querySelector("#selectedDateLabel"),
  workoutDateField: document.querySelector("#workoutDateField"),
  workoutDateInput: document.querySelector("#workoutDateInput"),
  weightInput: document.querySelector("#weightInput"),
  currentRepsInput: document.querySelector("#currentRepsInput"),
  setsInput: document.querySelector("#setsInput"),
  restTimer: document.querySelector("#restTimer"),
  restTimerProgress: document.querySelector("#restTimerProgress"),
  restTimerA11y: document.querySelector("#restTimerA11y"),
  restDurationValue: document.querySelector("#restDurationValue"),
  restTimerToggleButton: document.querySelector("#restTimerToggleButton"),
  restTimeStepButtons: document.querySelectorAll("[data-rest-step]"),
  plannedRecord: document.querySelector("#plannedRecord"),
  setTableBody: document.querySelector("#setTableBody"),
  lastRecord: document.querySelector("#lastRecord"),
  countSetButton: document.querySelector("#countSetButton"),
  undoSetButton: document.querySelector("#undoSetButton"),
  confirmWorkoutButton: document.querySelector("#confirmWorkoutButton"),
  resetSessionButton: document.querySelector("#resetSessionButton"),
  recordCompare: document.querySelector("#recordCompare"),
  sosReasonInput: document.querySelector("#sosReasonInput"),
  sosReasonCounter: document.querySelector("#sosReasonCounter"),
  sosReasonButtons: document.querySelectorAll("[data-sos-reason]"),
  sosSelectedDate: document.querySelector("#sosSelectedDate"),
  sosStatus: document.querySelector("#sosStatus"),
  sosButton: document.querySelector("#sosButton"),
  levelValue: document.querySelector("#levelValue"),
  totalVolumeValue: document.querySelector("#totalVolumeValue"),
  levelProgressBar: document.querySelector("#levelProgressBar"),
  levelCopy: document.querySelector("#levelCopy"),
  reminderStatus: document.querySelector("#reminderStatus"),
  enableReminderButton: document.querySelector("#enableReminderButton"),
  boardForm: document.querySelector("#boardForm"),
  boardInput: document.querySelector("#boardInput"),
  boardPostCounter: document.querySelector("#boardPostCounter"),
  boardSubmitButton: document.querySelector("#boardSubmitButton"),
  boardAuthor: document.querySelector("#boardAuthor"),
  boardWorkoutSummary: document.querySelector("#boardWorkoutSummary"),
  boardTodayPostCount: document.querySelector("#boardTodayPostCount"),
  boardLoadedPostCount: document.querySelector("#boardLoadedPostCount"),
  boardTodayWorkoutMetric: document.querySelector("#boardTodayWorkoutMetric"),
  boardTodayWorkoutCount: document.querySelector("#boardTodayWorkoutCount"),
  boardList: document.querySelector("#boardList"),
  boardSortButtons: document.querySelectorAll("[data-board-sort]"),
  boardReportModal: document.querySelector("#boardReportModal"),
  boardReportForm: document.querySelector("#boardReportForm"),
  boardReportTitle: document.querySelector("#boardReportTitle"),
  boardReportTargetCopy: document.querySelector("#boardReportTargetCopy"),
  boardReportOtherField: document.querySelector("#boardReportOtherField"),
  boardReportOtherInput: document.querySelector("#boardReportOtherInput"),
  boardReportCounter: document.querySelector("#boardReportCounter"),
  boardReportError: document.querySelector("#boardReportError"),
  closeBoardReportButton: document.querySelector("#closeBoardReportButton"),
  cancelBoardReportButton: document.querySelector("#cancelBoardReportButton"),
  submitBoardReportButton: document.querySelector("#submitBoardReportButton"),
  calendarTitle: document.querySelector("#calendarTitle"),
  calendarGrid: document.querySelector("#calendarGrid"),
  calendarDayDetail: document.querySelector("#calendarDayDetail"),
  calendarExcuseList: document.querySelector("#calendarExcuseList"),
  prevMonthButton: document.querySelector("#prevMonthButton"),
  nextMonthButton: document.querySelector("#nextMonthButton"),
  historyList: document.querySelector("#historyList"),
  monthSummary: document.querySelector("#monthSummary"),
  toast: document.querySelector("#toast"),
  restCompleteAlert: document.querySelector("#restCompleteAlert"),
};

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("is-visible");
  window.SetCounterMotion?.animateToast(els.toast);
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => els.toast.classList.remove("is-visible"), 1800);
}

function setActiveScreen(screenName) {
  const previousScreen = Array.from(els.screens).find((screen) => screen.classList.contains("is-active"));
  const nextScreen = Array.from(els.screens).find((screen) => screen.dataset.screen === screenName);
  const previousNavIndex = Array.from(els.navButtons).findIndex((button) => button.classList.contains("is-active"));
  const nextNavIndex = Array.from(els.navButtons).findIndex((button) => button.dataset.tab === screenName);
  els.screens.forEach((screen) => {
    screen.classList.toggle("is-active", screen.dataset.screen === screenName);
  });
  els.navButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.tab === screenName);
  });
  if (screenName === "record") syncCounter();
  if (screenName === "menu") renderMenuSos();
  const direction = previousNavIndex >= 0 && nextNavIndex >= 0 ? Math.sign(nextNavIndex - previousNavIndex) : 0;
  window.SetCounterMotion?.transitionScreen(previousScreen, nextScreen, direction);
  window.scrollTo({ top: 0, behavior: reducedMotionPreferred() ? "auto" : "smooth" });
}

function openRecordScreen({ fromCalendar = false } = {}) {
  state.recordDateFromCalendar = fromCalendar;
  if (!fromCalendar && state.selectedDate !== todayKey) {
    state.selectedDate = todayKey;
    loadLatestRecord().catch((error) => showToast(error.message));
  }
  syncSelectedDateUi();
  setActiveScreen("record");
}

async function api(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    "X-User-Key": healthUserKey,
    ...(state.auth.csrfToken && path !== "/api/auth/status" ? { "X-CSRF-Token": state.auth.csrfToken } : {}),
    ...(options.headers || {}),
  };
  const response = await fetch(path, {
    ...options,
    cache: "no-store",
    credentials: "same-origin",
    headers,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const error = new Error(body.error || "요청에 실패했습니다.");
    error.status = response.status;
    error.body = body;
    throw error;
  }
  return response.status === 204 ? null : response.json();
}

async function loadAuthStatus() {
  try {
    const auth = await api("/api/auth/status");
    state.auth = { ...state.auth, ...auth, loaded: true };
  } catch (error) {
    console.error("Unable to load auth status", error);
    state.auth = { ...state.auth, loaded: true, authenticated: false, anonymous: true, accountLinked: false, emailMasked: null, hasAnonymousData: false };
  }
  renderAuthPanel();
  return state.auth;
}

function renderAuthPanel() {
  const authenticated = state.auth.authenticated;
  const previousAuthState = els.accountPanel.dataset.authState;
  els.accountPanel.classList.toggle("authenticated-account-panel", authenticated);
  els.accountPanel.classList.toggle("anonymous-account-panel", !authenticated);
  els.accountPanelTitle.textContent = authenticated ? "계정에 안전하게 연결됨" : "기록을 안전하게 보관하기";
  els.accountPanelCopy.textContent = authenticated ? "운동 기록이 계정에 안전하게 연결되어 있습니다. 다른 기기에서도 이어서 볼 수 있어요." : "계정을 연결하면 기기를 바꿔도 운동 기록을 안전하게 이어갈 수 있습니다.";
  els.accountEmail.hidden = !authenticated;
  els.accountEmail.textContent = authenticated ? state.auth.emailMasked || "연결된 계정" : "";
  els.anonymousAccountActions.hidden = authenticated;
  els.authenticatedAccountActions.hidden = !authenticated;
  els.accountPanel.dataset.authState = authenticated ? "authenticated" : "anonymous";
  if (previousAuthState && previousAuthState !== els.accountPanel.dataset.authState) {
    window.SetCounterMotion?.animateContentChange(els.accountPanel, authenticated ? 1 : -1);
  }
  renderWeeklyGoal();
}

function weeklyGoalTarget() {
  const target = Number(state.profile?.weeklyWorkoutTarget || state.stats?.weeklyWorkoutTarget || 3);
  return Math.min(Math.max(Math.round(target), 1), 7);
}

function renderWeeklyGoal(resetDraft = false) {
  if (!els.weeklyGoalPanel) return;
  const enabled = Boolean(state.auth.authenticated && state.profile?.weeklyGoalEnabled);
  els.weeklyGoalPanel.hidden = !enabled;
  if (!enabled) {
    state.weeklyGoalDraft = null;
    return;
  }
  const target = weeklyGoalTarget();
  if (resetDraft || state.weeklyGoalDraft === null) state.weeklyGoalDraft = target;
  const draft = Math.min(Math.max(Number(state.weeklyGoalDraft) || target, 1), 7);
  const completed = Math.max(Number(state.stats?.weeklyWorkoutCompleted) || 0, 0);
  const remaining = Math.max(target - completed, 0);
  const ratio = target > 0 ? Math.min(completed / target, 1) : 0;
  els.weeklyGoalBadge.textContent = `주 ${target}회`;
  els.weeklyGoalProgress.textContent = `${completed} / ${target}회`;
  els.weeklyGoalRemaining.textContent = remaining > 0 ? `이번 주 ${remaining}회 남음` : "이번 주 목표 완료";
  els.weeklyGoalBar.style.transform = `scaleX(${ratio})`;
  els.weeklyGoalTrack.setAttribute("aria-valuemax", String(target));
  els.weeklyGoalTrack.setAttribute("aria-valuenow", String(Math.min(completed, target)));
  els.weeklyGoalValue.textContent = `${draft}회`;
  els.weeklyGoalDecrease.disabled = draft <= 1;
  els.weeklyGoalIncrease.disabled = draft >= 7;
  els.weeklyGoalSaveButton.disabled = draft === target;
  els.weeklyGoalHelp.textContent = `월요일부터 일요일 사이 원하는 ${draft}일에 운동하면 됩니다. 나머지 ${7 - draft}일은 쉬어도 경험치가 차감되지 않습니다. 설정한 주는 안내 기간이며 다음 완료 주부터 판정합니다.`;
}

function changeWeeklyGoalDraft(offset) {
  state.weeklyGoalDraft = Math.min(Math.max((Number(state.weeklyGoalDraft) || weeklyGoalTarget()) + offset, 1), 7);
  renderWeeklyGoal();
}

async function saveWeeklyGoal(event) {
  event.preventDefault();
  if (!state.auth.authenticated) return;
  const target = Math.min(Math.max(Number(state.weeklyGoalDraft) || 3, 1), 7);
  els.weeklyGoalSaveButton.disabled = true;
  els.weeklyGoalSaveButton.textContent = "저장 중";
  try {
    const result = await api("/api/profile/weekly-goal", {
      method: "POST",
      body: JSON.stringify({ target }),
    });
    state.profile = result.profile;
    state.stats = result.stats;
    state.weeklyGoalDraft = result.profile.weeklyWorkoutTarget;
    renderStats(result.stats);
    renderProfile(result.profile);
    showToast(`주 ${target}회 운동 목표를 저장했습니다.`);
  } catch (error) {
    showToast(error.status === 401 ? "로그인 후 설정할 수 있습니다." : "주간 운동 목표를 저장하지 못했습니다.");
  } finally {
    els.weeklyGoalSaveButton.textContent = "적용";
    renderWeeklyGoal();
  }
}

function rememberMenuOverlayTrigger() {
  if (document.activeElement && typeof document.activeElement.focus === "function") {
    state.menuOverlayTrigger = document.activeElement;
  }
}

function syncMenuOverlayLock() {
  const overlays = [els.profileModal, els.levelHistoryModal, els.complaintModal, els.registerModal, els.loginModal, els.deleteAccountModal, els.authConflictModal, els.authAlertModal, els.faqModal, els.privacyModal];
  document.body.classList.toggle("has-modal-open", overlays.some((overlay) => overlay && !overlay.hidden));
}

function restoreMenuOverlayFocus() {
  const trigger = state.menuOverlayTrigger;
  state.menuOverlayTrigger = null;
  if (trigger && trigger.isConnected) window.setTimeout(() => trigger.focus(), 0);
}

function clearAuthForm(form, errorElement) { form.reset(); errorElement.textContent = ""; }
function setAuthSubmitting(button, submitting, label) { button.disabled = submitting; button.textContent = submitting ? "처리 중..." : label; }
function showAuthAlert(message, focusTarget = null) {
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  els.authAlertMessage.textContent = message;
  els.authAlertModal.hidden = false;
  els.authAlertModal._focusTarget = focusTarget;
  syncMenuOverlayLock();
  window.SetCounterMotion?.openOverlay(els.authAlertModal, {
    onComplete: () => els.closeAuthAlertButton.focus(),
  });
}
function closeAuthAlert() {
  const focusTarget = els.authAlertModal._focusTarget;
  window.SetCounterMotion?.closeOverlay(els.authAlertModal, { onComplete: () => {
    els.authAlertModal.hidden = true;
    els.authAlertModal._focusTarget = null;
    syncMenuOverlayLock();
    if (focusTarget?.isConnected) focusTarget.focus();
  } });
}
function openAuthModal(kind) {
  const modal = kind === "register" ? els.registerModal : els.loginModal;
  rememberMenuOverlayTrigger();
  clearAuthForm(kind === "register" ? els.registerForm : els.loginForm, kind === "register" ? els.registerError : els.loginError);
  modal.hidden = false;
  syncMenuOverlayLock();
  window.SetCounterMotion?.openOverlay(modal, {
    onComplete: () => (kind === "register" ? els.registerEmailInput : els.loginEmailInput).focus(),
  });
}
function closeAuthModal(kind) {
  const modal = kind === "register" ? els.registerModal : els.loginModal;
  window.SetCounterMotion?.closeOverlay(modal, { onComplete: () => {
    modal.hidden = true;
    syncMenuOverlayLock();
    restoreMenuOverlayFocus();
  } });
}
function renderConflictSummary(element, summary) { element.textContent = `운동 ${summary.workoutCount || 0}회 · 세트 ${summary.setCount || 0}개`; }
async function refreshAuthenticatedApp() { await loadAuthStatus(); await loadBootstrap(); }

async function submitRegister(event) {
  event.preventDefault();
  const email = els.registerEmailInput.value.trim(), password = els.registerPasswordInput.value, passwordConfirm = els.registerPasswordConfirmInput.value;
  if (!/^\S+@\S+\.\S+$/.test(email)) return showAuthAlert("유효한 이메일을 입력해주세요.", els.registerEmailInput);
  if (password.length < 8) return showAuthAlert("비밀번호는 8자 이상 입력해주세요.", els.registerPasswordInput);
  if (password !== passwordConfirm) return showAuthAlert("비밀번호 확인이 일치하지 않습니다.", els.registerPasswordConfirmInput);
  if (!els.registerTermsInput.checked) return showAuthAlert("이용약관 및 개인정보 처리방침에 동의해주세요.", els.registerTermsInput);
  els.registerError.textContent = ""; setAuthSubmitting(els.registerSubmitButton, true, "계정에 기록 연결");
  try {
    await api("/api/auth/register", { method: "POST", body: JSON.stringify({ email, password, passwordConfirm, termsAccepted: true }) });
    clearAuthForm(els.registerForm, els.registerError); closeAuthModal("register"); await refreshAuthenticatedApp(); showToast("기록이 계정에 안전하게 연결되었습니다.");
  } catch (error) {
    showAuthAlert(
      error.body?.error === "email_already_registered" ? "이미 등록된 이메일입니다." : "계정 연결에 실패했습니다. 입력 내용을 확인해주세요.",
      error.body?.error === "email_already_registered" ? els.registerEmailInput : null,
    );
  } finally { setAuthSubmitting(els.registerSubmitButton, false, "계정에 기록 연결"); }
}

async function submitLogin(event) {
  event.preventDefault();
  const email = els.loginEmailInput.value.trim(), password = els.loginPasswordInput.value;
  if (!/^\S+@\S+\.\S+$/.test(email) || !password) return (els.loginError.textContent = "이메일과 비밀번호를 입력해주세요.");
  els.loginError.textContent = ""; setAuthSubmitting(els.loginSubmitButton, true, "로그인");
  try {
    await api("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
    clearAuthForm(els.loginForm, els.loginError); closeAuthModal("login"); await refreshAuthenticatedApp(); showToast("로그인했습니다.");
  } catch (error) {
    if (error.status === 409 && error.body?.error === "anonymous_data_conflict") {
      renderConflictSummary(els.anonymousConflictSummary, error.body.anonymousSummary || {});
      renderConflictSummary(els.accountConflictSummary, error.body.accountSummary || {});
      els.authConflictModal.hidden = false;
      syncMenuOverlayLock();
      window.SetCounterMotion?.openOverlay(els.authConflictModal);
      return;
    }
    els.loginError.textContent = error.status === 429 ? "로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요." : "이메일 또는 비밀번호가 올바르지 않습니다.";
  } finally { setAuthSubmitting(els.loginSubmitButton, false, "로그인"); }
}

async function logoutAccount() {
  try {
    const result = await api("/api/auth/logout", { method: "POST", body: "{}" });
    if (!result?.requiresNewAnonymousKey) throw new Error("logout_failed");
    await resetToAnonymousUser();
    showToast("로그아웃했습니다. 새 익명 기록으로 시작합니다.");
  } catch (error) { showToast("로그아웃에 실패했습니다. 다시 시도해주세요."); }
}

async function resetToAnonymousUser() {
  window.localStorage.removeItem(USER_KEY_STORAGE);
  replaceHealthUserKey();
  state.logs = [];
  state.excuses = [];
  state.boardPosts = [];
  state.profile = null;
  state.stats = null;
  state.recommendationInitialized = false;
  state.boardExpandedPosts.clear();
  state.boardPendingLikes.clear();
  state.boardPendingComments.clear();
  state.boardReportTarget = null;
  await loadAuthStatus();
  await loadBootstrap();
}

function openDeleteAccountModal() {
  rememberMenuOverlayTrigger();
  els.deleteAccountForm.reset();
  els.deleteAccountError.textContent = "";
  els.deleteAccountModal.hidden = false;
  syncMenuOverlayLock();
  window.SetCounterMotion?.openOverlay(els.deleteAccountModal, {
    onComplete: () => els.deleteAccountPasswordInput.focus(),
  });
}

function closeDeleteAccountModal() {
  window.SetCounterMotion?.closeOverlay(els.deleteAccountModal, { onComplete: () => {
    els.deleteAccountModal.hidden = true;
    syncMenuOverlayLock();
    restoreMenuOverlayFocus();
  } });
}

async function submitDeleteAccount(event) {
  event.preventDefault();
  const password = els.deleteAccountPasswordInput.value;
  if (!password || !els.deleteAccountConfirmInput.checked) {
    els.deleteAccountError.textContent = "비밀번호와 삭제 확인을 입력해주세요.";
    return;
  }
  els.deleteAccountError.textContent = "";
  setAuthSubmitting(els.deleteAccountSubmitButton, true, "영구 삭제");
  try {
    const result = await api("/api/auth/delete-account", {
      method: "POST",
      body: JSON.stringify({ password }),
    });
    if (!result?.requiresNewAnonymousKey) throw new Error("delete_failed");
    closeDeleteAccountModal();
    await resetToAnonymousUser();
    showToast("계정과 연결 데이터가 삭제되었습니다.");
  } catch (error) {
    els.deleteAccountError.textContent = error.status === 401
      ? "비밀번호가 올바르지 않습니다."
      : "계정 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.";
  } finally {
    setAuthSubmitting(els.deleteAccountSubmitButton, false, "영구 삭제");
  }
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
  return 1;
}

function isBodyweightExercise(exercise = state.selectedExercise) {
  if (!exercise) return false;
  const rawEquipment = String(exercise.equipment || "").trim().toLowerCase();
  const translatedEquipment = String(translateEquipment(exercise.equipment) || "").trim();
  const inferredEquipment = equipmentForExercise(exerciseDisplayName(exercise), exercise.area || "");
  return rawEquipment === "body only" || translatedEquipment === "맨몸" || inferredEquipment === "맨몸";
}

function defaultWeightForExercise(exercise = state.selectedExercise) {
  return isBodyweightExercise(exercise) ? 0 : 8;
}

function cleanNumber(value) {
  const number = Number.parseFloat(value) || 0;
  return Number.isInteger(number) ? String(number) : number.toFixed(1);
}

function displayExperience(value) {
  return formatNumber(Math.round((Number(value) || 0) * XP_DISPLAY_SCALE));
}

function weightLabel(value) {
  const number = Number.parseFloat(value) || 0;
  return number === 0 ? "맨몸" : `${cleanNumber(number)}kg`;
}

function readWeightInput() {
  const value = String(els.weightInput.value || "").trim();
  if (value === "맨몸" || value === "0") return 0;
  return Number.parseFloat(value.replace(/kg$/i, ""));
}

function writeWeightInput(value) {
  const number = Math.max(Number.parseFloat(value) || 0, 0);
  els.weightInput.value = number === 0 ? "맨몸" : cleanNumber(number);
}

function normalizedWeight(commit = false) {
  const raw = readWeightInput();
  const step = weightStepForExercise();
  const fallback = defaultWeightForExercise();
  const next = Math.max(Math.round((Number.isFinite(raw) ? raw : fallback) / step) * step, 0);
  if (commit) writeWeightInput(next);
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
    weightKg: (log.setWeights && log.setWeights[index]) ?? log.weightKg ?? 0,
    reps,
  }));
}

function applyInputsFromLatestRecord(log) {
  const rows = rowsFromLog(log);
  if (!rows.length) return;
  const firstRow = rows[0];
  const step = weightStepForExercise();
  writeWeightInput(Math.max(Math.round((Number(firstRow.weightKg) || 0) / step) * step, 0));
  els.currentRepsInput.value = String(Math.max(firstRow.reps || 1, 1));
  els.setsInput.value = String(Math.max(log.targetSets || rows.length || 1, 1));
  syncCounter();
}

function applyNextSetFromLatestRecord() {
  const rows = rowsFromLog(state.lastRecord);
  const nextRow = rows[state.setRows.length];
  if (!nextRow || state.setRows.length >= targetSets()) {
    return false;
  }
  const step = weightStepForExercise();
  writeWeightInput(Math.max(Math.round((Number(nextRow.weightKg) || 0) / step) * step, 0));
  els.currentRepsInput.value = String(Math.max(nextRow.reps || 1, 1));
  return true;
}

function syncWeightControls() {
  const step = weightStepForExercise();
  document.querySelectorAll("[data-step-for='weightInput']").forEach((button) => {
    const direction = Math.sign(Number.parseFloat(button.dataset.step) || 0) || 1;
    button.dataset.step = String(direction * step);
  });
}

function stepNumberInput(input, delta) {
  const min = Number.parseFloat(input.min);
  const max = Number.parseFloat(input.max);
  const current = input === els.weightInput ? readWeightInput() : Number.parseFloat(input.value);
  const fallback = input === els.weightInput ? defaultWeightForExercise() : Number.parseFloat(input.defaultValue) || 0;
  const adjustedDelta = input === els.weightInput ? weightStepForExercise() * Math.sign(delta || 0) : delta;
  const next = Math.max(Number.isFinite(min) ? min : 0, (Number.isFinite(current) ? current : fallback) + adjustedDelta);
  const limited = Number.isFinite(max) ? Math.min(next, max) : next;
  if (input === els.weightInput) writeWeightInput(limited);
  else input.value = String(limited);
  syncCounter();
}

function buildRecordTable(rows, options = {}) {
  const repsOnly = Boolean(options.repsOnly);
  const table = document.createElement("table");
  table.className = "record-table";
  table.classList.toggle("is-reps-only", repsOnly);
  table.innerHTML = repsOnly
    ? `<thead><tr><th>세트</th><th>횟수</th></tr></thead>`
    : `<thead><tr><th>세트</th><th>무게</th><th>횟수</th><th>볼륨</th></tr></thead>`;
  const body = document.createElement("tbody");
  rows.forEach((row, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = repsOnly
      ? `<td>${index + 1}</td><td>${row.reps}회</td>`
      : `<td>${index + 1}</td><td>${weightLabel(row.weightKg)}</td><td>${row.reps}회</td><td>${Math.round(row.weightKg * row.reps)}kg</td>`;
    body.append(tr);
  });
  table.append(body);
  const foot = document.createElement("tfoot");
  foot.innerHTML = repsOnly
    ? `<tr><td>합계</td><td>${totalReps(rows)}회</td></tr>`
    : `<tr><td>합계</td><td>-</td><td>${totalReps(rows)}회</td><td>${Math.round(totalVolume(rows))}kg</td></tr>`;
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
  if (currentWeight <= 0) return;
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
  const weight = weightLabel(normalizedWeight(false));
  const nextSet = state.setRows.length + 1;
  const doneReps = totalReps(state.setRows);
  const doneVolume = Math.round(totalVolume(state.setRows));
  els.plannedRecord.textContent = `${dateLabel}: ${weight} · ${doneReps}회 완료 · 볼륨 ${doneVolume}kg · ${nextSet}세트는 ${currentReps()}회`;
  syncRecordCompare();
}

function syncLastRecordChips() {
  const completed = state.setRows.length;
  els.lastRecord.querySelectorAll(".record-chip").forEach((chip, index) => {
    const isComplete = index < completed;
    const isCurrent = index === completed && completed < targetSets();
    chip.classList.toggle("is-complete", isComplete);
    chip.classList.toggle("is-current", isCurrent);
    if (isCurrent) chip.setAttribute("aria-current", "step");
    else chip.removeAttribute("aria-current");
  });
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
    tr.dataset.motionKey = `set-${state.selectedDate}-${exerciseKey(state.selectedExercise)}-${index}`;
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${weightLabel(row.weightKg)}</td>
      <td>${row.reps}회</td>
      <td>${Math.round(row.weightKg * row.reps)}kg</td>
    `;
    els.setTableBody.append(tr);
  });
  window.SetCounterMotion?.animateListEnter(els.setTableBody.querySelectorAll("tr"), { scope: "sets", limit: 1, y: 10 });
}

function syncCounter() {
  const target = targetSets();
  const completed = state.setRows.length;
  els.confirmWorkoutButton.disabled = completed === 0;
  els.confirmWorkoutButton.classList.toggle("is-target-complete", completed >= target);
  els.countSetButton.disabled = completed >= target;
  renderSetTable();
  syncPlannedRecord();
  syncLastRecordChips();
}

function resetSession(keepInputs = true) {
  state.setRows = [];
  resetRestTimer();
  syncWeightControls();
  if (!keepInputs) {
    writeWeightInput(defaultWeightForExercise());
    els.currentRepsInput.value = "12";
    els.setsInput.value = "3";
  }
  syncCounter();
}

function renderStats(stats) {
  state.stats = stats;
  window.SetCounterMotion?.animateCounter(els.levelValue, stats.level, (value) => String(Math.round(value)));
  window.SetCounterMotion?.animateCounter(els.totalVolumeValue, stats.totalVolume, (value) => `${formatNumber(Math.round(value))}kg`);
  window.SetCounterMotion?.animateProgress(els.levelProgressBar, (stats.progressPercent || 0) / 100);
  const level = Math.max(Math.round(Number(stats.level) || 1), 1);
  if (level >= 99) {
    els.levelCopy.innerHTML = `<span>MAX LEVEL</span><strong>한계돌파의 정점에 도달했습니다</strong>`;
    els.levelCopy.setAttribute("aria-label", "최고 레벨에 도달했습니다");
  } else {
    const progress = Math.min(Math.max((Number(stats.experiencePercent) || 0) / 100, 0), 1);
    const breakthroughRate = Math.max(Number(stats.nextBreakthroughRate) || 1, 0.01);
    const breakthroughsRemaining = Math.max(Math.ceil((1 - progress - 0.000001) / breakthroughRate), 1);
    const nextLevel = level + 1;
    els.levelCopy.innerHTML = `<span>NEXT LEVEL ${nextLevel}</span><strong>한계돌파 ${breakthroughsRemaining}회 남음</strong>`;
    els.levelCopy.setAttribute(
      "aria-label",
      `한계돌파 ${breakthroughsRemaining}회 더 달성하면 레벨 ${nextLevel}`,
    );
  }
  renderProfile();
  renderHomeDashboard();
}

function renderProfile(profile = state.profile) {
  const previousWeeklyTarget = state.profile?.weeklyWorkoutTarget;
  if (profile) {
    state.profile = profile;
  }
  const nickname = displayNickname(state.profile?.nickname);
  const level = state.stats?.level || state.profile?.level || 1;
  if (els.userBadgeLabel) {
    els.userBadgeLabel.innerHTML = `
      ${levelBadgeMarkup(level)}
      <span class="nickname-text">${escapeHtml(nickname)}</span>
    `;
  }
  if (els.menuUserBadge) {
    els.menuUserBadge.innerHTML = `
      ${levelBadgeMarkup(level)}
      <span class="menu-athlete-copy"><small>LEVEL ${level}</small><strong class="nickname-text" id="menuProfileTitle">${escapeHtml(nickname)}</strong></span>
    `;
  }
  if (els.menuExpCopy) {
    const total = state.stats?.totalVolume || 0;
    els.menuExpCopy.innerHTML = `<span>누적 운동 볼륨</span><strong>${formatNumber(total)}<small>kg</small></strong>`;
  }
  if (els.menuNicknameAvailability) {
    const availableAt = state.profile?.nextNicknameChangeAt ? new Date(state.profile.nextNicknameChangeAt) : null;
    const availableLabel = availableAt && !Number.isNaN(availableAt.getTime())
      ? `${availableAt.toLocaleDateString("ko-KR", { month: "long", day: "numeric" })} 변경 가능`
      : "7일에 한 번 변경";
    els.menuNicknameAvailability.textContent = state.profile?.canChangeNickname === false ? availableLabel : "지금 변경 가능";
    els.menuNicknameButton.disabled = state.profile?.canChangeNickname === false;
  }
  renderWeeklyGoal(previousWeeklyTarget !== state.profile?.weeklyWorkoutTarget);
  renderMenuSos();
  renderBoard();
  renderLevelHistory();
  if (state.profile?.nicknameRequired) {
    openNicknameModal(true);
  }
}

function openNicknameModal(required = false) {
  rememberMenuOverlayTrigger();
  els.profileError.textContent = "";
  els.profileModalTitle.textContent = required ? "닉네임 만들기" : "닉네임 변경";
  els.profileModalCopy.textContent = required
    ? "운동 레벨과 커뮤니티에 표시할 닉네임을 먼저 정하세요."
    : "닉네임 변경은 7일에 한 번만 가능합니다.";
  els.nicknameInput.value = state.profile?.nickname || "";
  els.closeProfileButton.hidden = required;
  els.profileLoginButton.hidden = !required;
  const availableAt = state.profile?.nextNicknameChangeAt ? new Date(state.profile.nextNicknameChangeAt) : null;
  els.nicknameAvailabilityNote.textContent = state.profile?.canChangeNickname === false && availableAt
    ? `${availableAt.toLocaleString("ko-KR", { month: "long", day: "numeric", hour: "numeric", minute: "2-digit" })}부터 다시 변경할 수 있습니다.`
    : "닉네임은 7일에 한 번 변경할 수 있습니다.";
  syncNicknameInput();
  els.profileModal.hidden = false;
  syncMenuOverlayLock();
  window.SetCounterMotion?.openOverlay(els.profileModal, { onComplete: () => els.nicknameInput.focus() });
}

function formatLevelHistoryDate(value) {
  const date = dateFromKey(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("ko-KR", { year: "numeric", month: "short", day: "numeric" });
}

function renderLevelHistory() {
  if (!els.levelHistoryAthlete || !els.levelHistoryList) return;
  const stats = state.stats || {};
  const level = stats.level || state.profile?.level || 1;
  const nickname = displayNickname(state.profile?.nickname);
  const percent = Math.min(Math.max(Number(stats.experiencePercent) || 0, 0), 100);
  const history = Array.isArray(stats.levelHistory) ? stats.levelHistory : [];
  const historyLevelDowns = history.reduce((total, event) => {
    if (event.type !== "level_down") return total;
    return total + Math.max((Number(event.levelBefore) || 0) - (Number(event.levelAfter) || 0), 1);
  }, 0);
  const levelDowns = Math.max(
    Number(stats.levelDowns) || 0,
    Number(stats.recordedLevelDowns) || 0,
    historyLevelDowns,
  );
  els.levelHistoryAthlete.innerHTML = `
    ${levelBadgeMarkup(level)}
    <span><small>LEVEL ${level}</small><strong>${escapeHtml(nickname)}</strong></span>
  `;
  els.levelHistoryXpText.textContent = level >= 99 ? "MAX" : `${cleanNumber(percent)}%`;
  els.levelHistoryXpBar.style.transform = `scaleX(${level >= 99 ? 1 : percent / 100})`;
  els.levelHistoryXpTrack.setAttribute("aria-valuenow", String(level >= 99 ? 100 : percent));
  els.levelHistoryXpDetail.textContent = level >= 99
    ? `최고 레벨 달성 · 누적 ${displayExperience(stats.experience)} XP`
    : `누적 ${displayExperience(stats.experience)} XP · 신기록 ${stats.levelUps || 0}회 · 레벨다운 ${levelDowns}회`;
  els.levelHistoryCount.textContent = `${history.length}건`;
  els.levelHistoryList.replaceChildren();
  if (!history.length) {
    const empty = document.createElement("div");
    empty.className = "level-history-empty";
    empty.innerHTML = `<strong>아직 레벨·경험치 변동이 없습니다.</strong><span>같은 운동의 이전 볼륨을 넘으면 첫 레벨업이 기록됩니다.</span>`;
    els.levelHistoryList.append(empty);
    return;
  }
  history.forEach((event) => {
    const up = event.type === "level_up";
    const down = event.type === "level_down";
    const experienceDelta = Math.abs(Number(event.experienceDelta) || 0);
    const displayedExperienceDelta = displayExperience(experienceDelta);
    const resultMarkup = up
      ? `<small>LV.${event.levelBefore}</small><svg class="lucide" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m9 18 6-6-6-6"/></svg><strong>LV.${event.levelAfter}</strong>`
      : down
        ? `<small>LV.${event.levelBefore}</small><svg class="lucide" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m9 6 6 6-6 6"/></svg><strong>LV.${event.levelAfter}</strong>`
        : `<strong>-${displayedExperienceDelta} XP</strong>`;
    const item = document.createElement("article");
    item.className = `level-history-item ${up ? "is-up" : "is-down"}`;
    item.innerHTML = `
      <span class="level-history-direction" aria-hidden="true"><svg class="lucide" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="${up ? "m18 15-6-6-6 6" : "m6 9 6 6 6-6"}"/></svg></span>
      <span class="level-history-copy"><small>${escapeHtml(formatLevelHistoryDate(event.date))}</small><strong>${escapeHtml(event.exercise || (up ? "레벨업" : down ? "레벨다운" : "경험치 차감"))}</strong><em>${up ? `신기록 달성 · +${displayedExperienceDelta} XP` : down ? `${displayedExperienceDelta} XP 차감 · 레벨 하락` : `${displayedExperienceDelta} XP 차감 · 레벨 유지`}</em></span>
      <span class="level-history-level">${resultMarkup}</span>
    `;
    els.levelHistoryList.append(item);
  });
}

async function openLevelHistory() {
  rememberMenuOverlayTrigger();
  renderLevelHistory();
  els.levelHistoryModal.hidden = false;
  syncMenuOverlayLock();
  window.SetCounterMotion?.openOverlay(els.levelHistoryModal, { sheet: true, onComplete: () => els.closeLevelHistoryButton.focus() });
  try {
    await loadStatsOnly();
    renderLevelHistory();
  } catch (error) {
    showToast(error.message);
  }
}

function closeLevelHistory() {
  window.SetCounterMotion?.closeOverlay(els.levelHistoryModal, { sheet: true, onComplete: () => {
    els.levelHistoryModal.hidden = true;
    syncMenuOverlayLock();
    restoreMenuOverlayFocus();
  } });
}

function closeNicknameModal(force = false) {
  if (force || !state.profile?.nicknameRequired) {
    window.SetCounterMotion?.closeOverlay(els.profileModal, { onComplete: () => {
      els.profileModal.hidden = true;
      syncMenuOverlayLock();
      restoreMenuOverlayFocus();
    } });
  }
}

function syncNicknameInput() {
  if (!els.nicknameInput || !els.nicknameCounter) return;
  const value = els.nicknameInput.value;
  els.nicknameCounter.textContent = `${value.length} / 12`;
  const valid = /^[가-힣A-Za-z0-9_]{2,12}$/.test(value);
  els.saveNicknameButton.disabled = !valid || state.profile?.canChangeNickname === false;
}

function percentChange(current, previous) {
  if (!previous && !current) return "±0%";
  if (!previous) return current ? "+100%" : "±0%";
  const value = Math.round(((current - previous) / previous) * 100);
  return `${value > 0 ? "+" : ""}${value}%`;
}

function exerciseImage(name) {
  const exercise = exercises.find((item) => item.name === name) || exercises[0];
  const firstImage = exercise?.images?.[0];
  if (firstImage) return freeDbImageUrl(firstImage);
  if (exercise?.image) return `/static/assets/${exercise.image}?v=6`;
  return "/static/assets/app-icon-192.png?v=8";
}

const workoutPlans = [
  {
    id: "upper-push", focus: "가슴 · 어깨 · 삼두", title: "넓고 탄탄한 상체 만들기",
    copy: "가슴의 두께부터 어깨 너비, 삼두 마무리까지 한 번에 채웁니다.", duration: "약 50분", theme: "gold", image: "plan-upper-push.webp",
    exercises: [
      { sourceId: "Barbell_Bench_Press_-_Medium_Grip", name: "바벨 벤치프레스", fallbackName: "벤치프레스", sets: 3, reps: "6-10", defaultReps: 8, rest: 90 },
      { sourceId: "Barbell_Incline_Bench_Press_-_Medium_Grip", name: "인클라인 바벨 벤치프레스", sets: 3, reps: "8-12", defaultReps: 10, rest: 75 },
      { sourceId: "Dumbbell_Shoulder_Press", name: "덤벨 숄더 프레스", fallbackName: "숄더 프레스", sets: 3, reps: "8-12", defaultReps: 10, rest: 75 },
      { sourceId: "Side_Lateral_Raise", name: "사이드 레터럴 레이즈", fallbackName: "사이드 레터럴 레이즈", sets: 3, reps: "12-15", defaultReps: 12, rest: 45 },
      { sourceId: "Triceps_Pushdown_-_Rope_Attachment", name: "로프 트라이셉스 푸쉬다운", sets: 3, reps: "10-15", defaultReps: 12, rest: 45 },
    ],
  },
  {
    id: "upper-pull", focus: "등 · 후면 어깨 · 이두", title: "등과 팔 라인 채우기",
    copy: "등 너비와 두께를 먼저 만들고 후면 어깨와 팔까지 단단히 마칩니다.", duration: "약 45분", theme: "cyan", image: "plan-upper-pull.webp",
    exercises: [
      { sourceId: "Wide-Grip_Lat_Pulldown", name: "와이드 그립 랫풀다운", sets: 3, reps: "8-12", defaultReps: 10, rest: 75 },
      { sourceId: "Bent_Over_Barbell_Row", name: "벤트오버 바벨 로우", sets: 3, reps: "6-10", defaultReps: 8, rest: 90 },
      { sourceId: "Seated_Cable_Rows", name: "시티드 케이블 로우", sets: 3, reps: "8-12", defaultReps: 10, rest: 75 },
      { sourceId: "Face_Pull", name: "페이스 풀", sets: 3, reps: "12-15", defaultReps: 12, rest: 45 },
      { sourceId: "Hammer_Curls", name: "해머 컬", fallbackName: "해머 컬", sets: 3, reps: "10-12", defaultReps: 10, rest: 45 },
    ],
  },
  {
    id: "lower-body", focus: "허벅지 · 둔근 · 햄스트링", title: "하체 힘 꽉 채우기",
    copy: "스쿼트, 힌지, 런지를 중심으로 하체 앞뒤와 둔근을 고르게 단련합니다.", duration: "약 50분", theme: "coral", image: "plan-lower-body.webp",
    exercises: [
      { sourceId: "Barbell_Full_Squat", name: "바벨 백 스쿼트", sets: 3, reps: "6-10", defaultReps: 8, rest: 90 },
      { sourceId: "Romanian_Deadlift", name: "루마니안 데드리프트", fallbackName: "덤벨 루마니안 데드리프트", sets: 3, reps: "8-12", defaultReps: 10, rest: 90 },
      { sourceId: "Barbell_Hip_Thrust", name: "바벨 힙 쓰러스트", fallbackName: "덤벨 힙", sets: 3, reps: "8-12", defaultReps: 10, rest: 75 },
      { sourceId: "Barbell_Walking_Lunge", name: "바벨 워킹 런지", sets: 3, reps: "좌우 8-10", defaultReps: 8, rest: 75 },
      { sourceId: "Calf_Raise_On_A_Dumbbell", name: "덤벨 카프 레이즈", sets: 3, reps: "12-15", defaultReps: 12, rest: 45 },
    ],
  },
  {
    id: "quick-full-body", focus: "하체 · 밀기 · 당기기", title: "25분 전신 깨우기",
    copy: "큰 근육을 쓰는 네 동작으로 짧지만 빠짐없는 전신 루틴을 완성합니다.", duration: "약 25분", theme: "violet", image: "plan-quick-full-body.webp",
    exercises: [
      { sourceId: "Goblet_Squat", name: "고블릿 스쿼트", fallbackName: "고블릿 스쿼트", sets: 2, reps: "10-12", defaultReps: 10, rest: 30 },
      { sourceId: "Pushups", name: "푸쉬업", fallbackName: "중량가방 푸쉬업", sets: 2, reps: "8-15", defaultReps: 10, rest: 30 },
      { sourceId: "One-Arm_Dumbbell_Row", name: "원암 덤벨 로우", fallbackName: "덤벨 로우", sets: 2, reps: "좌우 10-12", defaultReps: 10, rest: 30 },
      { sourceId: "Dumbbell_Shoulder_Press", name: "덤벨 숄더 프레스", fallbackName: "숄더 프레스", sets: 2, reps: "8-12", defaultReps: 10, rest: 30 },
    ],
  },
];

const planDetailContent = {
  "upper-push": {
    difficulty: "중급", equipment: "덤벨, 벤치", focus: "가슴 · 어깨", intro: "큰 프레스 동작으로 상체 앞라인에 힘을 싣고, 어깨까지 탄탄하게 채우는 루틴입니다.",
    benefits: ["가슴과 어깨의 균형 있는 근력 발달", "프레스 동작의 안정성과 볼륨 향상", "짧은 시간에도 집중도 높은 상체 운동"],
  },
  "upper-pull": {
    difficulty: "초중급", equipment: "덤벨", focus: "등 · 팔", intro: "등을 먼저 깨운 다음 팔까지 차례로 채워, 단단한 등 라인을 만드는 루틴입니다.",
    benefits: ["등과 팔을 함께 쓰는 당기기 패턴 강화", "자세를 지지하는 등 근육 활성화", "덤벨만으로 완성하는 상체 보완 운동"],
  },
  "lower-body": {
    difficulty: "중급", equipment: "덤벨", focus: "하체 · 둔근", intro: "스쿼트와 힙, 힌지 패턴을 한 번에 다루며 다리와 둔근의 기초 힘을 단단하게 쌓습니다.",
    benefits: ["둔근과 햄스트링을 포함한 하체 근력 강화", "일상 움직임에 필요한 안정적인 하체 기반", "세 가지 큰 동작으로 만드는 운동 밀도"],
  },
  "quick-full-body": {
    difficulty: "초중급", equipment: "덤벨, 맨몸", focus: "전신", intro: "시간이 부족한 날에도 밀기, 하체, 당기기를 빠짐없이 담아 몸 전체를 산뜻하게 깨웁니다.",
    benefits: ["짧은 시간에 전신을 고르게 자극", "운동 루틴을 다시 시작하기 좋은 구성", "큰 근육을 쓰는 동작으로 활동량 확보"],
  },
};

function exerciseBySourceId(sourceId, fallbackName = "") {
  const candidates = uniqueExercises([...libraryExercises, ...exercises]);
  return candidates.find((exercise) => exercise.freeDbSourceId === sourceId || exercise.sourceId === sourceId)
    || candidates.find((exercise) => exercise.name === fallbackName || exerciseDisplayName(exercise) === fallbackName)
    || null;
}

function exercisesForPlan(plan) {
  return plan.exercises.map((prescription) => {
    const exercise = exerciseBySourceId(prescription.sourceId, prescription.fallbackName);
    return exercise ? { ...exercise, displayName: prescription.name || exerciseDisplayName(exercise), planPrescription: prescription } : null;
  }).filter(Boolean);
}

function planStepImage(exercise, fallbackImage) {
  const firstImage = exercise?.images?.[0];
  if (firstImage) return freeDbImageUrl(firstImage);
  if (exercise?.image) return `/static/assets/${exercise.image}`;
  return `/static/assets/${fallbackImage}`;
}

function planImageUrl(image) {
  const value = String(image || "");
  return value.startsWith("/") || /^https?:/i.test(value) ? value : `/static/assets/${value || "newlogo.webp"}`;
}

function startWorkoutPlan(plan, startIndex = 0) {
  const routineExercises = exercisesForPlan(plan);
  if (!routineExercises.length) return;
  exercises = uniqueExercises([...exercises, ...routineExercises]);
  saveMyExerciseSettings();
  renderExerciseCards();
  const safeStartIndex = Math.max(0, Math.min(startIndex, routineExercises.length - 1));
  state.activeRoutine = { id: plan.id, title: plan.title, exercises: routineExercises, index: safeStartIndex };
  state.recommendedExerciseKey = exerciseKey(routineExercises[safeStartIndex]);
  openRecordScreen();
  selectExercise(routineExercises[safeStartIndex])
    .then(() => showToast(`${plan.title} ${safeStartIndex + 1}/${routineExercises.length} 시작`))
    .catch((error) => showToast(error.message));
}

const planSupportPrescriptions = {
  "upper-push": {
    warmup: [
      { sourceId: "Arm_Circles", name: "암 서클", meta: "00:45", description: "팔을 작게 돌리기 시작해 천천히 원을 키우며 어깨 관절을 준비합니다.", muscles: ["어깨", "가동성"] },
      { sourceId: "Dynamic_Chest_Stretch", name: "다이내믹 가슴 스트레칭", meta: "00:45", description: "팔을 부드럽게 열고 모으며 가슴과 어깨 앞쪽을 동적으로 준비합니다.", muscles: ["가슴", "어깨"] },
      { sourceId: "Pushups", name: "가벼운 푸쉬업", meta: "1세트 · 8회", description: "본 운동보다 여유 있는 강도로 밀기 동작과 견갑 움직임을 점검합니다.", muscles: ["가슴", "삼두"] },
    ],
    cooldown: [
      { sourceId: "Behind_Head_Chest_Stretch", name: "가슴 스트레칭", meta: "좌우 00:30", description: "어깨가 들리지 않게 유지하며 가슴 앞쪽을 편안한 범위에서 늘립니다.", muscles: ["가슴", "어깨"] },
      { sourceId: "Triceps_Stretch", name: "삼두근 스트레칭", meta: "좌우 00:30", description: "한 팔을 머리 뒤로 접고 반대손으로 가볍게 눌러 삼두근을 이완합니다.", muscles: ["삼두"] },
    ],
  },
  "upper-pull": {
    warmup: [
      { sourceId: "Arm_Circles", name: "암 서클", meta: "00:45", description: "어깨를 긴장시키지 않고 팔의 회전 범위를 천천히 넓힙니다.", muscles: ["어깨", "가동성"] },
      { sourceId: "Band_Pull_Apart", name: "밴드 풀 어파트", meta: "1세트 · 12-15회", description: "갈비뼈가 들리지 않게 밴드를 벌려 등 상부와 후면 어깨를 깨웁니다.", muscles: ["등 상부", "후면 어깨"] },
      { sourceId: "Scapular_Pull-Up", name: "스캡 풀업", meta: "1세트 · 8-10회", description: "팔을 굽히지 않고 견갑만 아래로 당겨 본 운동의 당기기 감각을 준비합니다.", muscles: ["광배근", "견갑"] },
    ],
    cooldown: [
      { sourceId: "Upper_Back_Stretch", name: "등 스트레칭", meta: "00:45", description: "양손을 앞으로 뻗고 등을 둥글게 만들어 등 상부의 긴장을 풉니다.", muscles: ["등 상부"] },
      { sourceId: "Standing_Biceps_Stretch", name: "이두근 스트레칭", meta: "좌우 00:30", description: "팔꿈치를 편 상태에서 손바닥 방향을 조절해 이두근을 천천히 늘립니다.", muscles: ["이두"] },
    ],
  },
  "lower-body": {
    warmup: [
      { sourceId: "Walking_Treadmill", name: "가벼운 걷기", meta: "02:00", description: "편안한 속도로 걸으며 체온을 올리고 하체 움직임을 준비합니다.", muscles: ["전신", "하체"] },
      { sourceId: "Worlds_Greatest_Stretch", name: "월드 그레이티스트 스트레칭", meta: "좌우 5회", description: "런지 자세에서 흉추를 회전해 고관절과 몸통의 가동 범위를 함께 엽니다.", muscles: ["고관절", "흉추"] },
      { sourceId: "Bodyweight_Squat", name: "맨몸 스쿼트", meta: "1세트 · 10회", description: "발바닥을 안정적으로 지지하고 가벼운 스쿼트로 무릎과 엉덩이를 준비합니다.", muscles: ["허벅지", "둔근"] },
    ],
    cooldown: [
      { sourceId: "Walking_Treadmill", name: "느린 걷기", meta: "02:00", description: "속도를 낮춰 걸으며 호흡과 심박을 서서히 안정시킵니다.", muscles: ["전신", "회복"] },
      { sourceId: "Hamstring_Stretch", name: "햄스트링 스트레칭", meta: "좌우 00:30", description: "허리를 과하게 굽히지 않고 엉덩이를 뒤로 보내 허벅지 뒤를 늘립니다.", muscles: ["햄스트링"] },
    ],
  },
  "quick-full-body": {
    warmup: [
      { sourceId: "Walking_Treadmill", name: "빠른 걷기", meta: "02:00", description: "가볍게 숨이 차는 정도로 걸으며 전신 체온을 올립니다.", muscles: ["전신", "심폐"] },
      { sourceId: "Worlds_Greatest_Stretch", name: "월드 그레이티스트 스트레칭", meta: "좌우 5회", description: "고관절과 흉추를 함께 움직여 스쿼트와 밀기, 당기기 동작을 준비합니다.", muscles: ["고관절", "흉추"] },
    ],
    cooldown: [
      { sourceId: "Upper_Back_Stretch", name: "등 스트레칭", meta: "00:30", description: "팔을 앞으로 길게 뻗어 등과 어깨 뒤쪽의 긴장을 천천히 풉니다.", muscles: ["등", "어깨"] },
      { sourceId: "Hamstring_Stretch", name: "햄스트링 스트레칭", meta: "좌우 00:30", description: "무릎을 잠그지 않고 편안한 범위에서 허벅지 뒤를 늘립니다.", muscles: ["햄스트링"] },
    ],
  },
};

function planSupportSteps(plan) {
  const prescription = planSupportPrescriptions[plan.id] || { warmup: [], cooldown: [] };
  const resolve = (step) => ({ ...step, image: planStepImage(exerciseBySourceId(step.sourceId), plan.image) });
  return { warmup: prescription.warmup.map(resolve), cooldown: prescription.cooldown.map(resolve) };
}

function exerciseDetailAsset(image) {
  return planImageUrl(image);
}

function renderPlanExerciseDetail(direction = 0) {
  const steps = state.planExerciseDetailSteps;
  const step = steps[state.planExerciseDetailIndex];
  if (!step) return;
  els.planExerciseDetailTitle.textContent = step.name;
  const nextImageSource = exerciseDetailAsset(step.image);
  if (els.planExerciseDetailImage.getAttribute("src") !== nextImageSource) {
    els.planExerciseDetailImage.classList.remove("is-motion-loaded");
    delete els.planExerciseDetailImage.dataset.motionLoaded;
    els.planExerciseDetailImage.src = nextImageSource;
  }
  els.planExerciseDetailImage.alt = `${step.name} 동작 이미지`;
  els.planExerciseDetailMetaLabel.textContent = step.meta.includes("세트") ? "권장 구성" : "지속시간";
  els.planExerciseDetailMeta.textContent = step.meta;
  els.planExerciseDetailDescription.textContent = step.description || "안정적인 자세로 동작 범위를 조절하며 진행하세요.";
  els.planExerciseDetailMuscles.replaceChildren();
  (step.muscles || ["전신"]).forEach((muscle) => {
    const chip = document.createElement("span");
    chip.textContent = muscle;
    els.planExerciseDetailMuscles.append(chip);
  });
  els.planExerciseDetailPage.textContent = `${state.planExerciseDetailIndex + 1}/${steps.length}`;
  els.previousPlanExerciseButton.disabled = state.planExerciseDetailIndex === 0;
  els.nextPlanExerciseButton.disabled = state.planExerciseDetailIndex === steps.length - 1;
  bindImageReveal(els.planExerciseDetailImage);
  if (direction) window.SetCounterMotion?.animateContentChange(els.planExerciseDetailModal.querySelector(".exercise-step-scroll"), direction);
}

function openPlanExerciseDetail(steps, index) {
  state.planExerciseDetailSteps = steps;
  state.planExerciseDetailIndex = index;
  renderPlanExerciseDetail();
  els.planExerciseDetailModal.hidden = false;
  window.SetCounterMotion?.openOverlay(els.planExerciseDetailModal, { sheet: true });
}

function closePlanExerciseDetail() {
  window.SetCounterMotion?.closeOverlay(els.planExerciseDetailModal, { sheet: true, onComplete: () => {
    els.planExerciseDetailModal.hidden = true;
  } });
}

function renderPlanWorkoutGroup(title, rows, options = {}) {
  const group = document.createElement("section");
  group.className = "plan-workout-group";
  const heading = document.createElement("h3");
  heading.textContent = `${title} (${rows.length})`;
  group.append(heading);
  rows.forEach((row, index) => {
    const item = document.createElement(options.onSelect ? "button" : "article");
    if (options.onSelect) item.type = "button";
    item.className = `plan-workout-row${options.onSelect ? " is-selectable" : ""}`;
    item.innerHTML = `
      <img src="${escapeHtml(planImageUrl(row.image))}" alt="">
      <span><strong>${escapeHtml(row.name)}</strong><small>${escapeHtml(row.meta)}</small></span>
      ${options.onSelect ? '<b aria-hidden="true">→</b>' : ""}
    `;
    if (options.onSelect) item.addEventListener("click", () => options.onSelect(row, index));
    group.append(item);
  });
  els.planWorkoutSections.append(group);
}

function openPlanDetail(plan) {
  const content = planDetailContent[plan.id];
  const routineExercises = exercisesForPlan(plan);
  if (!content || !routineExercises.length) return;
  state.selectedPlan = plan;
  els.planDetailTitle.textContent = plan.title;
  els.planDetailHero.style.setProperty("--plan-image", `url('/static/assets/${plan.image}')`);
  els.planDetailHero.className = `plan-detail-hero ${plan.theme}`;
  els.planDetailLabel.textContent = `${routineExercises.length}종목 · ${plan.duration}`;
  els.planDetailHeroTitle.textContent = plan.title;
  els.planDetailDifficulty.textContent = content.difficulty;
  els.planDetailIntro.textContent = content.intro;
  els.planDetailTags.replaceChildren();
  ["근력 강화", "꾸준한 기록", content.focus].forEach((tag) => {
    const item = document.createElement("span");
    item.textContent = tag;
    els.planDetailTags.append(item);
  });
  els.planWorkoutSections.replaceChildren();
  const supportSteps = planSupportSteps(plan);
  const mainSteps = routineExercises.map((exercise) => {
    const prescription = exercise.planPrescription;
    const muscleNames = translateMuscleList(exercise.primaryMuscles, "").split(", ").filter(Boolean);
    return {
      name: exerciseDisplayName(exercise),
      meta: `${prescription.sets}세트 · ${prescription.reps}회 · 휴식 ${prescription.rest}초`,
      image: planStepImage(exercise, plan.image),
      description: muscleNames.length
        ? `${muscleNames.join(", ")}을 중심으로 사용합니다. 정해진 반복 범위의 상단을 안정적으로 채우면 다음 운동에서 무게를 조금 높여보세요.`
        : `정해진 반복 범위를 안정적으로 채운 뒤 다음 운동에서 무게를 조금 높여보세요.`,
      muscles: muscleNames.length
        ? muscleNames
        : [exercise.area || "전신"],
    };
  });
  const detailSteps = [...supportSteps.warmup, ...mainSteps, ...supportSteps.cooldown];
  const openStep = (step) => openPlanExerciseDetail(detailSteps, detailSteps.indexOf(step));
  renderPlanWorkoutGroup("준비 운동", supportSteps.warmup, { onSelect: openStep });
  renderPlanWorkoutGroup("본 운동", mainSteps, { onSelect: openStep });
  renderPlanWorkoutGroup("쿨다운", supportSteps.cooldown, { onSelect: openStep });
  const info = [
    ["기간", plan.duration],
    ["난이도", content.difficulty],
    ["장비", content.equipment],
    ["목표", content.focus],
  ];
  els.planInfoGrid.replaceChildren();
  info.forEach(([label, value], index) => {
    const item = document.createElement("article");
    item.innerHTML = `<span class="plan-info-icon">0${index + 1}</span><div><strong>${escapeHtml(value)}</strong><small>${escapeHtml(label)}</small></div>`;
    els.planInfoGrid.append(item);
  });
  els.planBenefitList.replaceChildren();
  content.benefits.forEach((benefit) => {
    const item = document.createElement("li");
    item.textContent = benefit;
    els.planBenefitList.append(item);
  });
  const schedule = [
    ["01", "준비 운동", `${supportSteps.warmup.length}가지 동적 준비 운동으로 체온과 관절 가동 범위를 먼저 올립니다.`],
    ["02", "본 운동", `${mainSteps.length}가지 본 운동을 큰 복합 동작부터 진행하고, 정해진 휴식 시간을 지킵니다.`],
    ["03", "쿨다운", `${supportSteps.cooldown.length}가지 마무리 동작으로 호흡을 낮추고 사용한 부위를 천천히 이완합니다.`],
  ];
  els.planSchedule.replaceChildren();
  schedule.forEach(([range, title, copy]) => {
    const item = document.createElement("article");
    item.innerHTML = `<strong>${range}</strong><h3>${title}</h3><p>${copy}</p>`;
    els.planSchedule.append(item);
  });
  setActiveScreen("plan");
}

function renderWorkoutPlans() {
  if (!els.workoutPlanRail) return;
  els.workoutPlanRail.replaceChildren();
  workoutPlans.forEach((plan) => {
    const routineExercises = exercisesForPlan(plan);
    const card = document.createElement("article");
    card.className = `workout-plan-card ${plan.theme}`;
    card.dataset.motionKey = `plan-${plan.id || plan.title}`;
    card.style.setProperty("--plan-image", `url('/static/assets/${plan.image}')`);
    card.innerHTML = `
      <div class="workout-plan-card-copy"><p>${routineExercises.length}종목 · ${escapeHtml(plan.focus)}</p><h3>${escapeHtml(plan.title)}</h3><span>${escapeHtml(plan.copy)}</span></div>
      <div class="workout-plan-sequence" aria-label="플랜 구성"><span>준비 ${planSupportSteps(plan).warmup.length}</span><i></i><span>본 운동 ${routineExercises.length}</span><i></i><span>마무리 ${planSupportSteps(plan).cooldown.length}</span></div>
      <div class="workout-plan-meta"><span>${plan.duration}</span><span>${routineExercises.reduce((total, exercise) => total + exercise.planPrescription.sets, 0)}세트</span></div>
      <span class="workout-plan-open">상세 보기 <b aria-hidden="true">→</b></span>
    `;
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `${plan.title} 상세 보기`);
    card.addEventListener("click", () => openPlanDetail(plan));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openPlanDetail(plan);
      }
    });
    els.workoutPlanRail.append(card);
  });
  window.SetCounterMotion?.animateListEnter(els.workoutPlanRail.children, { scope: "plans", limit: 8, y: 12 });
}

function renderHomeDashboard() {
  if (!els.homeTodayList) return;
  const dateKey = state.selectedDate || todayKey;
  const logs = logsForDate(dateKey);
  const totalSets = logs.reduce((sum, log) => sum + (log.completedSets || 0), 0);
  const totalVolume = logs.reduce((sum, log) => sum + (log.volume || 0), 0);
  const totalReps = logs.reduce((sum, log) => sum + (log.totalReps || 0), 0);

  els.homeDateLabel.textContent = dateKey === todayKey ? "오늘" : dateKey;
  window.SetCounterMotion?.animateCounter(els.homeExerciseCount, logs.length, (value) => `${Math.round(value)}개 완료`);
  window.SetCounterMotion?.animateCounter(els.homeSetCount, totalSets, (value) => `${Math.round(value)}세트`);
  window.SetCounterMotion?.animateCounter(els.homeVolume, totalVolume, (value) => `${formatNumber(Math.round(value))}kg`);
  window.SetCounterMotion?.animateCounter(els.homeReps, totalReps, (value) => `${formatNumber(Math.round(value))}회`);
  renderWorkoutPlans();
  els.homeTodayList.replaceChildren();

  if (!logs.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "위 플랜을 고르면 여러 운동을 순서대로 기록할 수 있습니다.";
    els.homeTodayList.append(empty);
    return;
  }

  logs.forEach((log) => {
    const item = document.createElement("article");
    item.className = "today-item";
    item.dataset.motionKey = `today-${log.id || `${log.date}-${log.exercise}`}`;
    item.innerHTML = `
      <span class="today-thumb"><img src="${escapeHtml(exerciseImage(log.exercise))}" alt=""></span>
      <span>
        <strong>${escapeHtml(storedExerciseDisplayName(log.exercise))}</strong>
        <small>${log.completedSets}세트 · ${formatNumber(log.volume)}kg · ${formatNumber(log.totalReps)}회</small>
      </span>
      <span class="today-check">✓</span>
    `;
    els.homeTodayList.append(item);
  });
  window.SetCounterMotion?.animateListEnter(els.homeTodayList.children, { scope: "today", limit: 10, y: 10 });
}

async function saveNickname(event) {
  event.preventDefault();
  const nickname = els.nicknameInput.value.trim();
  els.profileError.textContent = "";
  if (els.saveNicknameButton.disabled) return;
  setAuthSubmitting(els.saveNicknameButton, true, "저장");
  try {
    const profile = await api("/api/profile", {
      method: "POST",
      body: JSON.stringify({ nickname }),
    });
    renderProfile(profile);
    closeNicknameModal(true);
    els.menuPopover.hidden = true;
    els.menuButton.setAttribute("aria-expanded", "false");
    showToast("닉네임을 저장했습니다.");
  } catch (error) {
    els.profileError.textContent = error.message;
  } finally {
    setAuthSubmitting(els.saveNicknameButton, false, "저장");
    syncNicknameInput();
  }
}

function selectedDateText() {
  return state.selectedDate === todayKey ? "오늘" : state.selectedDate;
}

function menuSelectedDateText() {
  if (state.selectedDate === todayKey) return "오늘";
  const date = new Date(`${state.selectedDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return state.selectedDate;
  return date.toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" });
}

function syncSosReasonInput() {
  if (!els.sosReasonInput) return;
  const length = els.sosReasonInput.value.length;
  if (els.sosReasonCounter) els.sosReasonCounter.textContent = `${length} / 500`;
  if (els.sosButton) els.sosButton.disabled = state.sosSubmitting || !els.sosReasonInput.value.trim() || length > 500;
  els.sosReasonButtons.forEach((button) => {
    button.classList.toggle("is-selected", button.dataset.sosReason === els.sosReasonInput.value.trim());
  });
}

function renderMenuSos() {
  if (!els.sosSelectedDate || !els.sosStatus) return;
  const excuse = excuseForDate(state.selectedDate);
  els.sosSelectedDate.textContent = menuSelectedDateText();
  els.sosStatus.classList.toggle("has-record", Boolean(excuse));
  els.sosStatus.textContent = excuse
    ? `저장된 회복 사유 · ${excuse.reason}`
    : "선택한 날짜에 저장된 회복 기록이 없습니다.";
  if (excuse && document.activeElement !== els.sosReasonInput) {
    els.sosReasonInput.value = excuse.reason || "";
  }
  if (!excuse && document.activeElement !== els.sosReasonInput) els.sosReasonInput.value = "";
  const buttonLabel = els.sosButton?.querySelector("span");
  if (buttonLabel && !state.sosSubmitting) buttonLabel.textContent = excuse ? "SOS 업데이트" : "SOS 저장";
  syncSosReasonInput();
}

function syncSelectedDateUi() {
  els.workoutDateInput.value = state.selectedDate;
  const showRecordDate = state.recordDateFromCalendar;
  els.workoutDateField.hidden = !showRecordDate;
  els.selectedDateBanner.hidden = !showRecordDate;
  if (els.selectedDateLabel) {
    els.selectedDateLabel.textContent = selectedDateText();
  }
  if (els.selectedDateBanner) {
    els.selectedDateBanner.classList.toggle("is-past", state.selectedDate !== todayKey);
  }
  renderMenuSos();
}

function announceLevelChange(previousLevel, nextLevel) {
  if (!previousLevel || nextLevel === previousLevel) return;
  showToast(nextLevel > previousLevel ? `레벨업: LV.${nextLevel}` : `레벨다운: LV.${nextLevel}`);
}

function reducedMotionPreferred() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function seasonMomentForDate(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  if (month === 11 && day === 31) {
    return { type: "year-end", kicker: "YEAR COMPLETE", title: `${year}년, 완료.`, copy: "올해 기록도 여기까지 잘 쌓았습니다." };
  }
  if (month === 0 && day === 1) {
    return { type: "year-start", kicker: "NEW YEAR", title: "새해 첫 세트.", copy: "다시 하나씩 쌓아가면 됩니다." };
  }
  if (day === new Date(year, month + 1, 0).getDate()) {
    return { type: "month-end", kicker: "MONTH COMPLETE", title: `${month + 1}월, 완료.`, copy: "이번 달 기록도 잘 쌓았습니다." };
  }
  if (day === 1) {
    return { type: "month-start", kicker: "NEW MONTH", title: `${month + 1}월 시작.`, copy: "이번 달도 한 세트씩 갑니다." };
  }
  return null;
}

function closeSeasonMoment() {
  if (!els.seasonMoment || els.seasonMoment.hidden) return;
  const finish = () => {
    els.seasonMoment.hidden = true;
    document.body.classList.remove("season-moment-open");
  };
  if (window.SetCounterMotion?.closeSeasonMoment) {
    window.SetCounterMotion.closeSeasonMoment(els.seasonMoment, finish);
  } else {
    finish();
  }
}

function maybeOpenSeasonMoment(now = new Date()) {
  if (!els.seasonMoment) return;
  const moment = seasonMomentForDate(now);
  if (!moment) return;
  const storageKey = `${SEASON_MOMENT_STORAGE_PREFIX}:${moment.type}:${toDateKey(now)}`;
  if (window.localStorage.getItem(storageKey)) return;
  window.localStorage.setItem(storageKey, "shown");
  els.seasonMoment.dataset.moment = moment.type;
  els.seasonMomentKicker.textContent = moment.kicker;
  els.seasonMomentTitle.textContent = moment.title;
  els.seasonMomentCopy.textContent = moment.copy;
  els.seasonMoment.hidden = false;
  document.body.classList.add("season-moment-open");
  window.SetCounterMotion?.animateSeasonMoment(els.seasonMoment);
  window.setTimeout(() => els.seasonMomentButton.focus(), 260);
}

function initMotion() {
  window.SetCounterMotion?.init();
}

function applyLevelUpTier(level) {
  const tier = levelTier(level);
  els.levelUpStage.className = `level-up-stage ${tier.className}`;
  els.levelUpEmblem.className = `level-up-emblem ${tier.className}`;
  els.levelUpBadgeImage.src = tier.image;
  els.levelUpRankName.textContent = tier.label;
  if (els.levelUpResultRank) els.levelUpResultRank.textContent = tier.label;
}

function finishLevelUp(nextStats, nextProfile) {
  applyLevelUpTier(nextStats.level);
  renderStats(nextStats);
  renderProfile(nextProfile);
  els.levelUpNumber.textContent = nextStats.level;
  els.levelUpResultNumber.textContent = nextStats.level;
  els.levelUpResult.classList.add("is-visible");
  els.levelUpContinueButton.disabled = false;
  els.levelUpContinueButton.classList.add("is-ready");
}

function openLevelUpScreen(previousStats, nextStats, nextProfile, onContinue) {
  const previousLevel = previousStats?.level || Math.max(nextStats.level - 1, 1);
  const nextLevel = nextStats.level;
  const gsapApi = window.gsap;

  state.levelUpContinuation = typeof onContinue === "function" ? onContinue : null;
  els.levelUpPrevious.textContent = previousLevel;
  els.levelUpNext.textContent = nextLevel;
  els.levelUpNumber.textContent = previousLevel;
  els.levelUpResultNumber.textContent = nextLevel;
  applyLevelUpTier(previousLevel);
  els.levelUpProgressBar.style.transform = "scaleX(0)";
  els.levelUpResult.classList.remove("is-visible");
  els.levelUpContinueButton.disabled = true;
  els.levelUpContinueButton.classList.remove("is-ready");
  setActiveScreen("level-up");

  if (!gsapApi || reducedMotionPreferred()) {
    applyLevelUpTier(nextLevel);
    els.levelUpProgressBar.style.transform = "scaleX(1)";
    finishLevelUp(nextStats, nextProfile);
    return;
  }

  const introCopy = els.levelUpStage.querySelectorAll(".level-up-kicker, h1, .level-up-copy");
  const particles = els.levelUpStage.querySelectorAll(".level-up-particle");
  const animatedElements = [
    ...introCopy,
    els.levelUpEmblem,
    els.levelUpCrest,
    els.levelUpBurst,
    els.levelUpOrbitOuter,
    els.levelUpOrbitInner,
    els.levelUpSheen,
    els.levelUpNumber,
    els.levelUpProgressBar,
    els.levelUpResult,
    els.levelUpContinueButton,
    ...particles,
  ];
  gsapApi.killTweensOf(animatedElements);
  gsapApi.set(introCopy, { autoAlpha: 0, y: 10 });
  gsapApi.set(els.levelUpEmblem, { autoAlpha: 0, scale: 0.68, y: 20, rotation: -5 });
  gsapApi.set(els.levelUpCrest, { scale: 0.9 });
  gsapApi.set(els.levelUpBurst, { autoAlpha: 0, scale: 0.3 });
  gsapApi.set(els.levelUpOrbitOuter, { rotation: -35, scale: 0.72 });
  gsapApi.set(els.levelUpOrbitInner, { rotation: 28, scale: 1.14 });
  gsapApi.set(els.levelUpSheen, { xPercent: -220, autoAlpha: 0 });
  gsapApi.set(particles, { autoAlpha: 0, scale: 0, x: 0, y: 0 });
  gsapApi.set(els.levelUpResult, { autoAlpha: 0, y: 10 });
  gsapApi.set(els.levelUpContinueButton, { autoAlpha: 0, y: 8 });

  gsapApi.timeline({ defaults: { overwrite: "auto" } })
    .to(introCopy, { autoAlpha: 1, y: 0, duration: 0.34, stagger: 0.055, ease: "power2.out" })
    .to(els.levelUpEmblem, { autoAlpha: 1, scale: 1, y: 0, rotation: 0, duration: 0.56, ease: "back.out(1.55)" }, "-=0.12")
    .to([els.levelUpOrbitOuter, els.levelUpOrbitInner], { scale: 1, rotation: 0, duration: 0.48, ease: "power3.out" }, "-=0.42")
    .to(els.levelUpProgressBar, { scaleX: 1, duration: 0.76, ease: "power2.inOut" }, "-=0.1")
    .to(els.levelUpSheen, { xPercent: 220, autoAlpha: 1, duration: 0.55, ease: "power2.inOut" }, "-=0.44")
    .call(() => applyLevelUpTier(nextLevel))
    .to(els.levelUpCrest, { scale: 1.09, duration: 0.13, ease: "power2.out" })
    .to(els.levelUpCrest, { scale: 1, duration: 0.28, ease: "back.out(2)" })
    .to(els.levelUpBurst, { autoAlpha: 0.9, scale: 1.35, duration: 0.34, ease: "power3.out" }, "-=0.4")
    .to(els.levelUpBurst, { autoAlpha: 0, scale: 1.65, duration: 0.3, ease: "power2.in" })
    .to(particles, {
      autoAlpha: 1,
      scale: 1,
      x: (index, particle) => Number(particle.dataset.x || 0),
      y: (index, particle) => Number(particle.dataset.y || 0),
      duration: 0.38,
      stagger: 0.018,
      ease: "power3.out",
    }, "-=0.62")
    .to(particles, { autoAlpha: 0, scale: 0.35, duration: 0.28, stagger: 0.012, ease: "power1.in" }, "-=0.2")
    .call(() => finishLevelUp(nextStats, nextProfile), null, "-=0.38")
    .fromTo(els.levelUpNumber, { scale: 0.58, y: 8, autoAlpha: 0 }, { scale: 1, y: 0, autoAlpha: 1, duration: 0.42, ease: "back.out(1.9)" }, "-=0.38")
    .to(els.levelUpResult, { autoAlpha: 1, y: 0, duration: 0.28, ease: "power2.out" }, "-=0.14")
    .to(els.levelUpContinueButton, { autoAlpha: 1, y: 0, duration: 0.24, ease: "power2.out" }, "-=0.12")
    .call(() => {
      gsapApi.to(els.levelUpOrbitOuter, { rotation: 360, duration: 18, repeat: -1, ease: "none" });
      gsapApi.to(els.levelUpOrbitInner, { rotation: -360, duration: 13, repeat: -1, ease: "none" });
    });
}

function closeLevelUpScreen() {
  const continuation = state.levelUpContinuation;
  state.levelUpContinuation = null;
  window.gsap?.killTweensOf(els.levelUpStage.querySelectorAll("*"));
  setActiveScreen("record");
  if (continuation) continuation();
}

function announceCheatGuard(previousStats, nextStats) {
  if (!previousStats || !nextStats) return false;
  const previousPenalty = previousStats.cheatPenalty || 0;
  const nextPenalty = nextStats.cheatPenalty || 0;
  const previousCount = previousStats.cheatSuspicionCount || 0;
  const nextCount = nextStats.cheatSuspicionCount || 0;
  if (nextPenalty > previousPenalty) {
    const email = nextStats.complaintEmail || "";
    showToast(`부정행위 판정으로 경험치가 차감되었습니다. 컴플레인 이메일: ${email}`);
    openComplaintModal();
    return true;
  }
  if (nextCount > previousCount) {
    showToast("비정상 기록이 반복되면 부정행위로 제한을 받을 수 있습니다.");
    return true;
  }
  return false;
}

function openComplaintModal(category = "complaint") {
  if (!els.complaintModal) return;
  rememberMenuOverlayTrigger();
  const isFeedback = category === "feedback";
  els.complaintForm.dataset.category = category;
  els.complaintModalTitle.textContent = isFeedback ? "피드백 보내기" : "이의제기 보내기";
  els.complaintModalCopy.textContent = isFeedback
    ? "Set Counter에 바라는 점이나 불편한 점을 남겨주세요. 운영자 Discord로 전송됩니다."
    : "부정행위 판정이 잘못됐다고 생각하면 사유를 적어주세요. 운영자 Discord로 전송됩니다.";
  els.complaintInput.placeholder = isFeedback
    ? "의견을 자유롭게 적어주세요."
    : "예: 실제로 기록한 운동이고, 지난 기록이 낮게 저장돼 있었습니다.";
  els.complaintError.textContent = "";
  els.complaintInput.value = "";
  syncComplaintInput();
  els.complaintModal.hidden = false;
  syncMenuOverlayLock();
  window.SetCounterMotion?.openOverlay(els.complaintModal, { onComplete: () => els.complaintInput.focus() });
}

function closeComplaintModal(force = false) {
  if (state.complaintSubmitting && !force) return;
  if (!els.complaintModal) return;
  window.SetCounterMotion?.closeOverlay(els.complaintModal, { onComplete: () => {
    els.complaintModal.hidden = true;
    syncMenuOverlayLock();
    restoreMenuOverlayFocus();
  } });
}

function syncComplaintInput() {
  if (!els.complaintInput || !els.complaintCounter) return;
  const length = els.complaintInput.value.length;
  els.complaintCounter.textContent = `${length} / 1200`;
  els.complaintSubmitButton.disabled = state.complaintSubmitting || !els.complaintInput.value.trim() || length > 1200;
}

function openSupportModal(modal, focusTarget) {
  rememberMenuOverlayTrigger();
  modal.hidden = false;
  syncMenuOverlayLock();
  window.SetCounterMotion?.openOverlay(modal, { sheet: true, onComplete: () => focusTarget?.focus() });
}

function closeSupportModal(modal) {
  window.SetCounterMotion?.closeOverlay(modal, { sheet: true, onComplete: () => {
    modal.hidden = true;
    syncMenuOverlayLock();
    restoreMenuOverlayFocus();
  } });
}

async function submitComplaint(event) {
  event.preventDefault();
  const message = els.complaintInput.value.trim();
  const category = els.complaintForm.dataset.category || "complaint";
  els.complaintError.textContent = "";
  if (!message) {
    els.complaintError.textContent = category === "feedback" ? "피드백 내용을 입력해주세요." : "이의제기 내용을 입력해주세요.";
    return;
  }
  if (state.complaintSubmitting) return;
  state.complaintSubmitting = true;
  setAuthSubmitting(els.complaintSubmitButton, true, "보내기");
  try {
    await api("/api/complaints", {
      method: "POST",
      body: JSON.stringify({ message, category }),
    });
    closeComplaintModal(true);
    showToast(category === "feedback" ? "피드백을 보냈습니다." : "이의제기를 보냈습니다.");
  } catch (error) {
    els.complaintError.textContent = error.message;
  } finally {
    state.complaintSubmitting = false;
    setAuthSubmitting(els.complaintSubmitButton, false, "보내기");
    syncComplaintInput();
  }
}

function bindImageReveal(image) {
  if (!image) return;
  const reveal = () => window.SetCounterMotion?.revealImage(image);
  if (image.complete && image.naturalWidth) {
    window.requestAnimationFrame(reveal);
  } else {
    image.addEventListener("load", reveal, { once: true });
  }
}

function makeExerciseArt(exercise) {
  const imageBox = document.createElement("span");
  imageBox.className = "exercise-art";
  imageBox.setAttribute("aria-hidden", "true");
  const firstImage = exercise.images?.[0];
  if (!exercise.image && !firstImage) {
    imageBox.classList.add("is-empty");
    imageBox.textContent = "+";
    return imageBox;
  }
  const image = document.createElement("img");
  image.src = firstImage ? freeDbImageUrl(firstImage) : `/static/assets/${exercise.image}?v=6`;
  image.alt = "";
  image.loading = "lazy";
  bindImageReveal(image);
  imageBox.append(image);
  return imageBox;
}

function exerciseListMeta(exercise, includeLevel = false) {
  const equipment = translateEquipment(exercise.equipment);
  const area = String(exercise.area || "기타")
    .replace(/^덤벨\s+/, "")
    .replace(/^맨몸\/가방$/, "전신");
  const values = [area, equipment];
  if (includeLevel) values.push(translateLevel(exercise.level));
  return values
    .filter((value, index, items) => value && value !== "-" && items.indexOf(value) === index)
    .join(" · ");
}

function openExerciseLibrary() {
  libraryState.visible = LIBRARY_PAGE_SIZE;
  renderLibraryFilters();
  renderExerciseLibrary();
  els.exerciseLibraryModal.hidden = false;
  window.SetCounterMotion?.openOverlay(els.exerciseLibraryModal, { sheet: true, onComplete: () => els.exerciseLibrarySearch.focus() });
}

function closeExerciseLibrary() {
  window.SetCounterMotion?.closeOverlay(els.exerciseLibraryModal, { sheet: true, onComplete: () => {
    els.exerciseLibraryModal.hidden = true;
  } });
}

function renderFilterRow(target, values, selected, onSelect) {
  target.replaceChildren();
  values.forEach((value) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "library-filter-chip";
    button.classList.toggle("is-active", value === selected);
    button.textContent = value;
    button.addEventListener("click", () => onSelect(value));
    target.append(button);
  });
}

function renderLibraryFilters() {
  const bodyValues = ["전체", ...Array.from(new Set(libraryExercises.map((exercise) => exercise.area).filter(Boolean))).sort()];
  const equipmentValues = ["전체", ...Array.from(new Set(libraryExercises.map((exercise) => translateEquipment(exercise.equipment)).filter(Boolean))).sort()];
  if (!bodyValues.includes(libraryState.body)) libraryState.body = "전체";
  if (!equipmentValues.includes(libraryState.equipment)) libraryState.equipment = "전체";
  renderFilterRow(els.bodyFilterRow, bodyValues, libraryState.body, (value) => {
    libraryState.body = value;
    libraryState.visible = LIBRARY_PAGE_SIZE;
    renderLibraryFilters();
    renderExerciseLibrary();
  });
  renderFilterRow(els.equipmentFilterRow, equipmentValues, libraryState.equipment, (value) => {
    libraryState.equipment = value;
    libraryState.visible = LIBRARY_PAGE_SIZE;
    renderLibraryFilters();
    renderExerciseLibrary();
  });
}

async function renderLibraryExerciseDetail(exercise, panel, toggle) {
  panel.hidden = false;
  toggle.setAttribute("aria-expanded", "true");
  toggle.textContent = "접기";
  panel.innerHTML = `<p class="library-detail-loading">운동 정보를 불러오는 중...</p>`;
  try {
    await loadKoreanInstructions();
  } catch (error) {
    // Images and metadata remain useful when translated instructions are unavailable.
  }

  const displayName = exerciseDisplayName(exercise);
  const englishName = exerciseEnglishName(exercise);
  const images = (exercise.images || []).slice(0, 2);
  const imageMarkup = images.length
    ? `<div class="library-detail-images">${images.map((image, index) => `<img src="${freeDbImageUrl(image)}" alt="${escapeHtml(displayName)} 동작 ${index + 1}" loading="lazy">`).join("")}</div>`
    : "";
  const instructions = exerciseInstructionsForDetail(exercise);
  const instructionsMarkup = instructions.length
    ? `<section class="library-detail-instructions"><h4>운동 방법</h4><ol>${instructions.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ol></section>`
    : "";
  const primary = translateMuscleList(exercise.primaryMuscles, exercise.area || "-");
  const secondary = translateMuscleList(exercise.secondaryMuscles, "");
  panel.innerHTML = `
    <div class="library-detail-title">
      <strong>${escapeHtml(displayName)}</strong>
      ${englishName && englishName !== displayName ? `<small>${escapeHtml(englishName)}</small>` : ""}
    </div>
    ${imageMarkup}
    <dl class="library-detail-meta">
      <div><dt>주요 근육</dt><dd>${escapeHtml(primary)}</dd></div>
      <div><dt>기구</dt><dd>${escapeHtml(translateEquipment(exercise.equipment))}</dd></div>
      ${secondary ? `<div><dt>보조 근육</dt><dd>${escapeHtml(secondary)}</dd></div>` : ""}
      <div><dt>난이도</dt><dd>${escapeHtml(translateLevel(exercise.level))}</dd></div>
    </dl>
    ${instructionsMarkup}
  `;
  panel.querySelectorAll("img").forEach(bindImageReveal);
  window.SetCounterMotion?.animateContentChange(panel, 1);
}

function renderExerciseLibrary() {
  const keyword = els.exerciseLibrarySearch.value.trim().toLowerCase();
  const normalizedKeyword = keyword.replace(/\s+/g, "");
  const seen = new Set();
  const rows = libraryExercises.filter((exercise) => {
    const key = `${exercise.area}-${exercise.name}`;
    if (seen.has(key)) return false;
    seen.add(key);
    if (libraryState.body !== "전체" && exercise.area !== libraryState.body) return false;
    if (libraryState.equipment !== "전체" && translateEquipment(exercise.equipment) !== libraryState.equipment) return false;
    if (!keyword) return true;
    const haystack = exerciseSearchTerms(exercise).join(" ").toLowerCase();
    return haystack.includes(keyword) || haystack.replace(/\s+/g, "").includes(normalizedKeyword);
  });
  els.exerciseLibraryCount.textContent = `${rows.length}개 운동`;
  els.exerciseLibraryList.replaceChildren();
  if (!rows.length) {
    const empty = document.createElement("div");
    empty.className = "library-empty-state";
    empty.innerHTML = `
      <strong>검색 결과가 없습니다</strong>
      <span>검색어를 바꾸거나 다른 부위와 도구를 선택해보세요.</span>
    `;
    els.exerciseLibraryList.append(empty);
    return;
  }

  rows.slice(0, libraryState.visible).forEach((exercise) => {
    const item = document.createElement("article");
    item.className = "library-exercise-card";
    item.dataset.motionKey = `library-${exerciseKey(exercise)}`;

    const addButton = document.createElement("button");
    addButton.type = "button";
    addButton.className = "library-exercise-add";
    addButton.setAttribute("aria-label", `${exerciseDisplayName(exercise)} 추가`);
    addButton.append(makeExerciseArt(exercise));
    const body = document.createElement("span");
    const name = document.createElement("strong");
    name.textContent = exerciseDisplayName(exercise);
    const area = document.createElement("small");
    area.textContent = exerciseListMeta(exercise, true);
    body.append(name, area);
    addButton.append(body);

    const detailButton = document.createElement("button");
    detailButton.type = "button";
    detailButton.className = "library-exercise-detail-button";
    detailButton.textContent = "상세보기";
    detailButton.setAttribute("aria-expanded", "false");
    const detailPanel = document.createElement("div");
    detailPanel.className = "library-exercise-detail";
    detailPanel.hidden = true;

    addButton.addEventListener("click", () => {
      const added = addExerciseToMine(exercise);
      item.classList.add("is-added");
      showToast(added ? `추가 완료 · ${exerciseDisplayName(exercise)}` : "이미 추가된 운동입니다.");
      window.setTimeout(() => item.classList.remove("is-added"), 420);
    });
    detailButton.addEventListener("click", () => {
      if (!detailPanel.hidden) {
        detailPanel.hidden = true;
        detailButton.setAttribute("aria-expanded", "false");
        detailButton.textContent = "상세보기";
        return;
      }
      renderLibraryExerciseDetail(exercise, detailPanel, detailButton);
    });

    item.append(addButton, detailButton, detailPanel);
    els.exerciseLibraryList.append(item);
  });

  if (rows.length > libraryState.visible) {
    const more = document.createElement("button");
    more.type = "button";
    more.className = "library-load-more";
    more.textContent = `더 보기 (${rows.length - libraryState.visible}개 남음)`;
    more.addEventListener("click", () => {
      libraryState.visible += LIBRARY_PAGE_SIZE;
      renderExerciseLibrary();
    });
    els.exerciseLibraryList.append(more);
  }
  window.SetCounterMotion?.animateListEnter(els.exerciseLibraryList.children, { scope: "library", limit: 10, y: 10 });
}

function addExerciseToMine(exercise) {
  if (!exercises.some((item) => exerciseKey(item) === exerciseKey(exercise))) {
    exercises.push({ ...exercise });
    saveMyExerciseSettings();
    renderExerciseCards();
    return true;
  }
  return false;
}

function renderCollapsedExerciseDetail(exercise) {
  els.exerciseDetailCard.innerHTML = `
    <div class="exercise-detail-head">
      <div>
        <p class="eyebrow">운동 정보 접힘</p>
        <h3>${escapeHtml(exerciseDisplayName(exercise))}</h3>
        <small>운동을 선택하면 카운터로 바로 이동합니다.</small>
      </div>
      <button class="exercise-detail-toggle" id="exerciseDetailToggle" type="button">펼치기</button>
    </div>
  `;
  els.exerciseDetailCard.querySelector("#exerciseDetailToggle")?.addEventListener("click", () => {
    setExerciseDetailCollapsed(false);
    renderExerciseDetail(state.selectedExercise);
    els.exerciseDetailCard.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

function renderExerciseDetail(exercise) {
  if (!els.exerciseDetailCard) return;
  els.exerciseDetailCard.hidden = false;
  if (isExerciseDetailCollapsed()) {
    renderCollapsedExerciseDetail(exercise);
    return;
  }
  const primary = translateMuscleList(exercise.primaryMuscles, exercise.area || "-");
  const secondary = translateMuscleList(exercise.secondaryMuscles, "-");
  const displayName = exerciseDisplayName(exercise);
  const instructions = exerciseInstructionsForDetail(exercise);
  const instructionsMarkup = instructions.length
    ? `<ol class="exercise-detail-instructions">
        ${instructions.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}
      </ol>`
    : "";
  const images = (exercise.images || []).slice(0, 2);
  const imageMarkup = images.length
    ? images.map((image) => `<img src="${freeDbImageUrl(image)}" alt="" loading="lazy">`).join("")
    : `<span class="exercise-detail-placeholder">이미지 없음</span>`;
  els.exerciseDetailCard.innerHTML = `
    <div class="exercise-detail-head">
      <div>
        <p class="eyebrow">${escapeHtml(sourceLabel(exercise.source))}</p>
        <h3>${escapeHtml(displayName)}</h3>
        <small>한국어 운동 정보</small>
      </div>
      <button class="exercise-detail-toggle" id="exerciseDetailToggle" type="button">접기</button>
    </div>
    <div class="exercise-detail-images">${imageMarkup}</div>
    <dl class="exercise-detail-meta">
      <div><dt>주요 근육</dt><dd>${escapeHtml(primary)}</dd></div>
      <div><dt>보조 근육</dt><dd>${escapeHtml(secondary)}</dd></div>
      <div><dt>기구</dt><dd>${escapeHtml(translateEquipment(exercise.equipment))}</dd></div>
      <div><dt>난이도</dt><dd>${escapeHtml(translateLevel(exercise.level))}</dd></div>
      <div><dt>힘 방향</dt><dd>${escapeHtml(translateForce(exercise.force))}</dd></div>
      <div><dt>동작 유형</dt><dd>${escapeHtml(translateMechanic(exercise.mechanic))}</dd></div>
    </dl>
    ${instructionsMarkup}
  `;
  els.exerciseDetailCard.querySelector("#exerciseDetailToggle")?.addEventListener("click", () => {
    setExerciseDetailCollapsed(true);
    renderExerciseDetail(state.selectedExercise);
  });
  els.exerciseDetailCard.querySelectorAll("img").forEach(bindImageReveal);
}

async function removeExerciseFromMine(exercise) {
  if (exercises.length <= 1) {
    showToast("운동은 최소 1개는 남겨야 합니다.");
    return;
  }
  exercises = exercises.filter((item) => exerciseKey(item) !== exerciseKey(exercise));
  saveMyExerciseSettings();
  if (exerciseKey(state.selectedExercise) === exerciseKey(exercise)) {
    await selectExercise(exercises[0]);
  } else {
    renderExerciseCards();
  }
  showToast(`${exercise.name}을 내 운동종목에서 뺐습니다.`);
}

function syncExerciseEditUi() {
  const count = state.selectedExercisesForDelete.size;
  els.exerciseEditBar.hidden = !state.editingExercises;
  els.toggleExerciseEditButton.classList.toggle("is-active", state.editingExercises);
  els.exerciseEditCount.textContent = `${count}개 선택`;
  els.deleteSelectedExercisesButton.disabled = count === 0;
}

function syncExercisePickerUi() {
  els.exerciseGrid.hidden = !state.exercisePickerExpanded;
  els.toggleExerciseGridButton.setAttribute("aria-expanded", String(state.exercisePickerExpanded));
  els.toggleExerciseGridButton.setAttribute("aria-label", state.exercisePickerExpanded ? "운동 종목 접기" : "운동 종목 펼치기");
  els.toggleExerciseGridButton.classList.toggle("is-expanded", state.exercisePickerExpanded);
}

function toggleExercisePicker() {
  state.exercisePickerExpanded = !state.exercisePickerExpanded;
  syncExercisePickerUi();
  if (state.exercisePickerExpanded) {
    window.SetCounterMotion?.animateListEnter(els.exerciseGrid.children, { scope: "exercise-grid", limit: 12, y: 8 });
  }
}

function toggleExerciseEditMode(force) {
  state.editingExercises = typeof force === "boolean" ? force : !state.editingExercises;
  if (state.editingExercises) state.exercisePickerExpanded = true;
  if (!state.editingExercises) state.selectedExercisesForDelete.clear();
  syncExerciseEditUi();
  syncExercisePickerUi();
  renderExerciseCards();
}

async function deleteSelectedExercises() {
  const names = Array.from(state.selectedExercisesForDelete);
  if (!names.length) return;
  if (exercises.length - names.length < 1) {
    showToast("운동은 최소 1개는 남겨야 합니다.");
    return;
  }
  exercises = exercises.filter((exercise) => !state.selectedExercisesForDelete.has(exerciseKey(exercise)));
  state.selectedExercisesForDelete.clear();
  saveMyExerciseSettings();
  if (!exercises.some((exercise) => exerciseKey(exercise) === exerciseKey(state.selectedExercise))) {
    await selectExercise(exercises[0]);
  }
  toggleExerciseEditMode(false);
  renderExerciseCards();
  showToast(`${names.length}개 운동을 내 운동종목에서 뺐습니다.`);
}

function renderExerciseCards() {
  els.exerciseGrid.replaceChildren();
  exercises.forEach((exercise) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "exercise-card";
    card.dataset.motionKey = `exercise-${exerciseKey(exercise)}`;
    card.setAttribute("aria-pressed", exerciseKey(exercise) === exerciseKey(state.selectedExercise));
    if (exerciseKey(exercise) === state.recommendedExerciseKey) {
      const badge = document.createElement("span");
      badge.className = "recommend-badge";
      badge.textContent = "오늘의 추천";
      card.append(badge);
    }
    const name = document.createElement("strong");
    name.textContent = exerciseDisplayName(exercise);
    const area = document.createElement("small");
    area.textContent = exerciseListMeta(exercise);
    if (state.editingExercises) {
      const checkbox = document.createElement("span");
      checkbox.className = "exercise-check";
      checkbox.classList.toggle("is-checked", state.selectedExercisesForDelete.has(exerciseKey(exercise)));
      checkbox.setAttribute("aria-hidden", "true");
      card.append(checkbox);
    }
    card.append(makeExerciseArt(exercise), name, area);
    card.addEventListener("click", () => {
      if (state.editingExercises) {
        const key = exerciseKey(exercise);
        if (state.selectedExercisesForDelete.has(key)) {
          state.selectedExercisesForDelete.delete(key);
        } else {
          state.selectedExercisesForDelete.add(key);
        }
        syncExerciseEditUi();
        renderExerciseCards();
        return;
      }
      selectExercise(exercise);
    });
    els.exerciseGrid.append(card);
  });
  if (state.exercisePickerExpanded) {
    window.SetCounterMotion?.animateListEnter(els.exerciseGrid.children, { scope: "exercise-grid", limit: 12, y: 8 });
  }
  syncExercisePickerUi();
  syncExerciseEditUi();
}

async function selectExercise(exercise) {
  state.selectedExercise = exercise;
  writeWeightInput(defaultWeightForExercise(exercise));
  els.counterTitle.textContent = exerciseDisplayName(exercise);
  renderExerciseDetail(exercise);
  document.querySelector(".counter-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
  syncWeightControls();
  resetSession(true);
  renderExerciseCards();
  window.SetCounterMotion?.animateContentChange(els.exerciseDetailCard, 1);
  window.SetCounterMotion?.animateSelection(els.exerciseGrid.querySelector('[aria-pressed="true"]'));
  await loadLatestRecord();
  if (!state.lastRecord && exercise.planPrescription) {
    els.setsInput.value = String(exercise.planPrescription.sets);
    els.currentRepsInput.value = String(exercise.planPrescription.defaultReps);
    syncCounter();
  }
  renderBoard();
}

function renderLatestRecord(latest) {
  state.lastRecord = latest;
  els.lastRecord.replaceChildren();
  if (!latest) {
    els.lastRecord.textContent = "지난 기록: 아직 없음";
    syncRecordCompare();
    return;
  }
  setRestTimerDuration(latest.restSeconds || restTimerState.duration);
  const rows = rowsFromLog(latest);
  applyInputsFromLatestRecord(latest);
  const title = document.createElement("div");
  title.className = "record-title";
  title.textContent = `지난 기록: ${latest.date}`;
  const chips = document.createElement("div");
  chips.className = "record-chips";
  rows.forEach((row, index) => {
    const chip = document.createElement("span");
    chip.className = "record-chip";
    chip.dataset.setIndex = String(index);
    chip.textContent = `${index + 1}세트 ${weightLabel(row.weightKg)} ${row.reps}회`;
    chips.append(chip);
  });
  els.lastRecord.append(title, chips);
  syncLastRecordChips();
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

async function loadBootstrap(options = {}) {
  const month = toMonthKey(state.currentMonth);
  const query = new URLSearchParams({ month, before: state.selectedDate });
  const data = await api(`/api/bootstrap?${query.toString()}`);
  state.logs = data.logs;
  state.excuses = data.excuses;
  state.boardPosts = data.boardPosts || [];
  state.profile = data.profile;
  let appliedRecommendation = null;
  if (!state.recommendationInitialized) {
    appliedRecommendation = applyTodayRecommendation();
    state.recommendationInitialized = true;
  }
  if (!options.deferStats) {
    renderStats(data.stats);
    renderProfile(data.profile);
  }
  renderLatestRecord(data.latestByExercise[state.selectedExercise.name] || null);
  if (appliedRecommendation) renderExerciseCards();
  renderCalendar();
  renderHistory();
  renderBoard();
  if (data.claimedLegacy) showToast(`기존 운동 기록 ${data.stats.totalRecords}건을 연결했습니다.`);
  migrateLocalBoardPosts().catch((error) => showToast(error.message));
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

function exerciseTrainingGroup(exercise) {
  const primaryProfile = [
    exercise?.area,
    ...(exercise?.primaryMuscles || []),
  ].join(" ").toLowerCase();
  const haystack = [
    exercise?.name,
    exerciseDisplayName(exercise),
    exerciseEnglishName(exercise),
    exercise?.area,
    ...(exercise?.primaryMuscles || []),
  ].join(" ").toLowerCase();

  // Primary muscle region decides lower-body/core work. For upper-body work,
  // the API's force field is more reliable than secondary-muscle keywords.
  if (/abdominals|obliques|core|복근|복사근|코어/.test(primaryProfile)) return "core";
  if (/quadriceps|hamstrings|glutes|calves|adductors|abductors|하체|대퇴|둔근|햄스트링|종아리|내전근|외전근/.test(primaryProfile)) return "legs";

  const force = String(exercise?.force || "").toLowerCase();
  if (force === "pull") return "pull";
  if (force === "push") return "push";

  if (/back|middle back|lower back|lats|biceps|forearms|등|광배|이두|전완|로우|풀업|풀다운|친업|컬|추감기|슈러그|페이스풀/.test(haystack)) return "pull";
  if (/chest|triceps|shoulder|가슴|삼두|어깨|프레스|푸쉬업|푸시업|딥스|레이즈/.test(haystack)) return "push";
  if (/스쿼트|런지|데드리프트|힙|leg|squat|lunge|deadlift/.test(haystack)) return "legs";
  if (/크런치|플랭크|싯업|crunch|plank|sit-up/.test(haystack)) return "core";
  return "general";
}

function compatibleTrainingGroups(group) {
  return {
    push: ["push", "core"],
    pull: ["pull", "core"],
    legs: ["legs", "core"],
    core: ["push", "pull", "legs", "core"],
    general: ["push", "pull", "legs", "core", "general"],
  }[group] || ["general"];
}

function lastDateForExercise(exercise) {
  const dates = state.logs
    .filter((log) => log.exercise === exercise.name)
    .map((log) => log.date)
    .sort();
  return dates.at(-1) || "";
}

function lastDateForGroup(group) {
  const names = new Set(exercises.filter((exercise) => exerciseTrainingGroup(exercise) === group).map((exercise) => exercise.name));
  const dates = state.logs
    .filter((log) => names.has(log.exercise))
    .map((log) => log.date)
    .sort();
  return dates.at(-1) || "";
}

function chooseRecommendedExercise(options = {}) {
  if (!exercises.length) return null;
  const completedExercise = options.completedExercise || null;
  const todayLogs = logsForDate(todayKey);
  let targetGroups = [];
  if (completedExercise) {
    targetGroups = compatibleTrainingGroups(exerciseTrainingGroup(completedExercise));
  } else if (todayLogs.length) {
    const lastTodayExercise = exercises.find((exercise) => exercise.name === todayLogs.at(-1).exercise) || { name: todayLogs.at(-1).exercise };
    targetGroups = compatibleTrainingGroups(exerciseTrainingGroup(lastTodayExercise));
  } else {
    const groups = Array.from(new Set(exercises.map(exerciseTrainingGroup)));
    const oldestGroup = groups
      .map((group) => ({ group, lastDate: lastDateForGroup(group) }))
      .sort((a, b) => a.lastDate.localeCompare(b.lastDate))[0]?.group;
    targetGroups = compatibleTrainingGroups(oldestGroup);
  }
  const candidates = exercises.filter((exercise) =>
    targetGroups.includes(exerciseTrainingGroup(exercise)) &&
    (!completedExercise || exerciseKey(exercise) !== exerciseKey(completedExercise))
  );
  if (!candidates.length) return null;
  const pool = candidates;
  return [...pool]
    .map((exercise) => ({ exercise, lastDate: lastDateForExercise(exercise) }))
    .sort((a, b) => a.lastDate.localeCompare(b.lastDate) || exerciseDisplayName(a.exercise).localeCompare(exerciseDisplayName(b.exercise)))[0]?.exercise || exercises[0];
}

function applyTodayRecommendation() {
  const recommended = chooseRecommendedExercise();
  if (!recommended) return null;
  state.recommendedExerciseKey = exerciseKey(recommended);
  state.selectedExercise = recommended;
  writeWeightInput(defaultWeightForExercise(recommended));
  els.counterTitle.textContent = exerciseDisplayName(recommended);
  renderExerciseDetail(recommended);
  syncWeightControls();
  resetSession(true);
  return recommended;
}

function routeInitialEntry() {
  if (state.initialEntryRouted) return;
  state.initialEntryRouted = true;
  if ((state.stats?.totalRecords || 0) > 0) {
    openRecordScreen();
    return;
  }
  setActiveScreen("home");
}

function recommendationReason(exercise) {
  const lastDate = lastDateForExercise(exercise);
  const groupName = {
    push: "미는 운동",
    pull: "당기는 운동",
    legs: "하체 운동",
    core: "코어 운동",
    general: "전신 운동",
  }[exerciseTrainingGroup(exercise)] || "운동";
  return lastDate
    ? `${groupName} 흐름에서 가장 오래 쉬었던 종목입니다. 마지막 기록: ${lastDate}`
    : `${groupName} 흐름에서 아직 기록이 없는 종목입니다.`;
}

function openNextRecommendation(exercise, routineProgress = "") {
  if (!exercise || !els.nextRecommendationModal) return;
  state.recommendedExerciseKey = exerciseKey(exercise);
  state.pendingNextRecommendation = exercise;
  els.nextRecommendationTitle.textContent = routineProgress ? "다음 루틴 종목" : "다음 추천 운동";
  els.nextRecommendationName.textContent = exerciseDisplayName(exercise);
  els.nextRecommendationReason.textContent = routineProgress || recommendationReason(exercise);
  renderExerciseCards();
  els.nextRecommendationModal.hidden = false;
  window.SetCounterMotion?.openOverlay(els.nextRecommendationModal);
}

function closeNextRecommendation() {
  if (!els.nextRecommendationModal) return;
  window.SetCounterMotion?.closeOverlay(els.nextRecommendationModal, { onComplete: () => {
    els.nextRecommendationModal.hidden = true;
  } });
}

async function startNextRecommendation() {
  const exercise = state.pendingNextRecommendation;
  closeNextRecommendation();
  if (!exercise) return;
  setActiveScreen("record");
  await selectExercise(exercise);
}

function excuseForDate(dateKey) {
  return state.excuses.find((excuse) => excuse.date === dateKey) || null;
}

function exercisePartName(exerciseName) {
  const part = bodyForExercise(exerciseName || "", "");
  return part && part !== "기타" ? part : "기타";
}

function volumeBreakdownForLogs(logs) {
  const byPart = new Map();
  (logs || []).forEach((log) => {
    const part = exercisePartName(log.exercise);
    const row = byPart.get(part) || { part, volume: 0, reps: 0 };
    row.volume += log.volume || 0;
    row.reps += log.totalReps || 0;
    byPart.set(part, row);
  });
  return Array.from(byPart.values())
    .sort((a, b) => (b.part === "코어" ? b.reps : b.volume) - (a.part === "코어" ? a.reps : a.volume) || a.part.localeCompare(b.part));
}

function formatBreakdownRow(row) {
  return row.part === "코어"
    ? `${row.part} ${formatNumber(row.reps)}회`
    : `${row.part} ${formatNumber(row.volume)}kg`;
}

function formatBreakdownText(breakdown) {
  return breakdown.map(formatBreakdownRow).join(" · ");
}

function calendarActivitySummary(logs) {
  const breakdown = volumeBreakdownForLogs(logs);
  const nonCoreVolume = breakdown
    .filter((row) => row.part !== "코어")
    .reduce((sum, row) => sum + row.volume, 0);
  const coreReps = breakdown.find((row) => row.part === "코어")?.reps || 0;
  const metrics = [];
  if (nonCoreVolume > 0) metrics.push(`${formatNumber(nonCoreVolume)}kg`);
  if (coreReps > 0) metrics.push(`코어 ${formatNumber(coreReps)}회`);
  if (!metrics.length) metrics.push(`${formatNumber(logs.reduce((sum, log) => sum + (log.totalReps || 0), 0))}회`);
  return `${logs.length}종목 · ${metrics.join(" · ")}`;
}

function renderCalendar() {
  const monthDate = state.currentMonth;
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDate = new Date(year, month + 1, 0).getDate();
  const daily = new Map();
  state.logs.forEach((log) => {
    const row = daily.get(log.date) || { volume: 0, count: 0, logs: [] };
    row.volume += log.volume || 0;
    row.count += 1;
    row.logs.push(log);
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
    cell.dataset.motionKey = `calendar-${key}`;
    cell.innerHTML = `<strong>${day}</strong>`;
    if (summary) {
      const breakdown = volumeBreakdownForLogs(summary.logs);
      const meta = document.createElement("span");
      meta.className = "day-cell-breakdown";
      breakdown.slice(0, 2).forEach((row) => {
        const line = document.createElement("small");
        line.textContent = formatBreakdownRow(row);
        meta.append(line);
      });
      if (breakdown.length > 2) {
        const more = document.createElement("small");
        more.textContent = `+${breakdown.length - 2}`;
        meta.append(more);
      }
      cell.append(meta);
      cell.classList.add("has-volume");
    }
    const breakdownText = summary ? formatBreakdownText(volumeBreakdownForLogs(summary.logs)) : "";
    cell.setAttribute("aria-label", summary ? `${key} 기록 보기 · ${breakdownText}` : `${key} 기록 보기`);
    if (key === todayKey) cell.classList.add("is-today");
    if (key === state.selectedDate) cell.classList.add("is-selected");
    if (summary) cell.classList.add("has-workout");
    if (excuse) {
      if (!summary) cell.classList.add("has-sos");
      cell.title = summary
        ? `운동 기록 ${breakdownText} · SOS: ${excuse.reason}`
        : `SOS: ${excuse.reason}`;
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
  title.textContent = `${selectedDateText()} 기록`;
  const summary = document.createElement("span");
  summary.textContent = logs.length ? calendarActivitySummary(logs) : "기록 없음";
  head.append(title, summary);
  els.calendarDayDetail.append(head);
  if (logs.length) {
    const breakdown = document.createElement("div");
    breakdown.className = "day-volume-breakdown";
    volumeBreakdownForLogs(logs).forEach((row) => {
      const chip = document.createElement("span");
      chip.textContent = formatBreakdownRow(row);
      breakdown.append(chip);
    });
    els.calendarDayDetail.append(breakdown);
  }

  if (!logs.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "이 날짜를 선택한 상태로 아래에서 운동을 저장하면 여기에 들어옵니다.";
    els.calendarDayDetail.append(empty);
  } else {
    logs.forEach((log) => {
    const item = document.createElement("article");
    item.className = "day-log-item";
    const top = document.createElement("div");
    top.className = "day-log-top";
    const label = document.createElement("strong");
    const displayName = storedExerciseDisplayName(log.exercise);
    label.textContent = displayName;
    const remove = document.createElement("button");
    remove.className = "delete-button";
    remove.type = "button";
    remove.textContent = "×";
    remove.setAttribute("aria-label", `${displayName} 기록 삭제`);
    remove.addEventListener("click", async () => {
      const previousLevel = state.stats?.level;
      await api(`/api/logs/${log.id}`, { method: "DELETE" });
      const data = await loadBootstrap();
      showToast("기록을 삭제했습니다.");
      announceLevelChange(previousLevel, data.stats.level);
    });
    top.append(label, remove);
    const meta = document.createElement("p");
    const coreExercise = exercisePartName(log.exercise) === "코어";
    meta.textContent = coreExercise
      ? `총 ${formatNumber(log.totalReps)}회`
      : `총 ${formatNumber(log.totalReps)}회 · 볼륨 ${formatNumber(log.volume)}kg`;
    item.append(top, meta, buildRecordTable(rowsFromLog(log), { repsOnly: coreExercise }));
    els.calendarDayDetail.append(item);
    });
  }

  if (excuse) {
    const sos = document.createElement("p");
    sos.className = "day-sos-reason";
    sos.textContent = logs.length ? `SOS 사유: ${excuse.reason}` : `SOS: ${excuse.reason}`;
    els.calendarDayDetail.append(sos);
  }

  const action = document.createElement("button");
  action.type = "button";
  action.className = "day-add-button";
  action.textContent = `${selectedDateText()} 운동 입력하기`;
  action.addEventListener("click", () => {
    openRecordScreen({ fromCalendar: true });
    document.querySelector(".counter-panel").scrollIntoView({ behavior: "smooth", block: "start" });
    els.weightInput.focus({ preventScroll: true });
  });
  els.calendarDayDetail.append(action);
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
    const dateLabel = document.createElement("strong");
    dateLabel.textContent = excuse.date;
    const reason = document.createElement("p");
    reason.textContent = excuse.reason;
    item.append(dateLabel, reason);
    item.addEventListener("click", () => chooseDate(excuse.date));
    els.calendarExcuseList.append(item);
  });
}

async function chooseDate(dateKey, options = {}) {
  state.selectedDate = dateKey;
  syncSelectedDateUi();
  const selectedMonth = dateFromKey(dateKey);
  const monthChanged = toMonthKey(selectedMonth) !== toMonthKey(state.currentMonth);
  if (monthChanged) {
    state.currentMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
    await loadBootstrap();
  } else {
    renderCalendar();
    await loadLatestRecord();
  }
  window.SetCounterMotion?.animateSwap(els.calendarDayDetail, 1);
  window.SetCounterMotion?.animateSelection(els.calendarGrid.querySelector(".day-cell.is-selected"));
  syncCounter();
  renderHomeDashboard();
  showToast(`${selectedDateText()} 기록 날짜로 선택했습니다.`);
  if (options.scrollToInput) openRecordScreen({ fromCalendar: true });
  const target = options.scrollToInput ? document.querySelector(".counter-panel") : els.calendarDayDetail;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
}

function currentBoardAuthor() {
  const nickname = displayNickname(state.profile?.nickname);
  const level = state.stats?.level || state.profile?.level || 1;
  return { level, nickname };
}

function boardAuthorText(author) {
  return `${author.level} ${author.nickname}`;
}

function authorFromPost(post) {
  if (post.level && post.nickname) return { level: post.level, nickname: displayNickname(post.nickname) };
  const match = String(post.author || "").match(/^(\d+)\s+(.+)$/);
  if (match) return { level: Number(match[1]), nickname: displayNickname(match[2]) };
  return { level: 1, nickname: displayNickname(post.author) };
}

function renderBoardAuthorElement(target, author) {
  target.className = "board-author";
  target.innerHTML = `
    ${levelBadgeMarkup(author.level)}
    <span class="nickname-text">${escapeHtml(author.nickname)}</span>
  `;
}

function boardActionIcon(name) {
  const paths = {
    heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    message: '<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"/>',
    flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1Z"/><path d="M4 22v-7"/>',
    chevron: '<path d="m9 18 6-6-6-6"/>',
  };
  return `<svg class="lucide" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths[name] || ""}</svg>`;
}

function formatBoardTime(value) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value || "";
  const seconds = Math.max(0, Math.floor((Date.now() - parsed.getTime()) / 1000));
  if (seconds < 60) return "방금 전";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}분 전`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}시간 전`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}일 전`;
  return new Intl.DateTimeFormat("ko-KR", { month: "numeric", day: "numeric" }).format(parsed);
}

function syncBoardPostCounter() {
  if (!els.boardInput || !els.boardPostCounter || !els.boardSubmitButton) return;
  const length = els.boardInput.value.length;
  els.boardPostCounter.textContent = `${length} / 180`;
  els.boardPostCounter.classList.toggle("is-limit", length >= 180);
  els.boardSubmitButton.disabled = state.boardPosting || !els.boardInput.value.trim() || length > 180;
  els.boardSubmitButton.textContent = state.boardPosting ? "작성 중..." : "작성하기";
}

function renderBoardCommunitySummary() {
  if (!els.boardTodayPostCount) return;
  const todayPosts = state.boardPosts.filter((post) => {
    const date = new Date(post.createdAt);
    return !Number.isNaN(date.getTime()) && toDateKey(date) === todayKey;
  });
  const todayLogs = logsForDate(todayKey);
  els.boardTodayPostCount.textContent = formatNumber(todayPosts.length);
  els.boardLoadedPostCount.textContent = formatNumber(state.boardPosts.length);
  els.boardTodayWorkoutCount.textContent = formatNumber(todayLogs.length);
  els.boardTodayWorkoutMetric.hidden = !todayLogs.length;
}

function renderBoardWorkoutSummary() {
  if (!els.boardWorkoutSummary) return;
  const logs = logsForDate(state.selectedDate);
  els.boardWorkoutSummary.replaceChildren();
  els.boardWorkoutSummary.hidden = !logs.length;
  if (!logs.length) return;

  const head = document.createElement("div");
  const label = document.createElement("span");
  label.textContent = state.selectedDate === todayKey ? "오늘 운동" : `${state.selectedDate} 운동`;
  const names = document.createElement("strong");
  const parts = Array.from(new Set(logs.map((log) => exercisePartName(log.exercise))));
  names.textContent = parts.join(" · ");
  head.append(label, names);

  const metrics = document.createElement("div");
  const totalSets = logs.reduce((sum, log) => sum + (log.completedSets || 0), 0);
  const totalVolume = logs.reduce((sum, log) => sum + (log.volume || 0), 0);
  [
    `${logs.length}종목`,
    `${formatNumber(totalSets)}세트`,
    `${formatNumber(totalVolume)}kg`,
  ].forEach((text) => {
    const chip = document.createElement("span");
    chip.textContent = text;
    metrics.append(chip);
  });
  els.boardWorkoutSummary.append(head, metrics);
}

function defaultBoardPosts() {
  return [
    {
      id: "sample-1",
      level: 12,
      nickname: "쇠질왕",
      author: "12 쇠질왕",
      content: "오늘 기록 넘긴 사람은 여기 인증.",
      createdAt: "방금 전",
    },
    {
      id: "sample-2",
      level: 7,
      nickname: "꾸준맨",
      author: "7 꾸준맨",
      content: "하루 한 종목이라도 찍으면 레벨은 지킨다.",
      createdAt: "어제",
    },
  ];
}

async function loadBoardPosts() {
  if (state.boardSortLoading) return;
  state.boardSortLoading = true;
  renderBoard();
  try {
    state.boardPosts = await api(`/api/board/posts?sort=${state.boardSort}`);
  } finally {
    state.boardSortLoading = false;
    renderBoard();
  }
}

async function migrateLocalBoardPosts() {
  if (window.localStorage.getItem(BOARD_MIGRATED_STORAGE) === "1") return;
  const localPosts = loadLocalBoardPosts().filter((post) => post.content);
  if (!localPosts.length) {
    window.localStorage.setItem(BOARD_MIGRATED_STORAGE, "1");
    return;
  }
  for (const post of localPosts.slice().reverse()) {
    await api("/api/board/posts", {
      method: "POST",
      body: JSON.stringify({ content: post.content }),
    });
  }
  window.localStorage.setItem(BOARD_MIGRATED_STORAGE, "1");
  window.localStorage.removeItem(BOARD_STORAGE);
  await loadBoardPosts();
}

function renderBoard() {
  if (!els.boardList) return;
  if (els.boardAuthor) renderBoardAuthorElement(els.boardAuthor, currentBoardAuthor());
  renderBoardCommunitySummary();
  renderBoardWorkoutSummary();
  syncBoardPostCounter();
  els.boardSortButtons.forEach((button) => {
    const active = button.dataset.boardSort === state.boardSort;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
    button.disabled = state.boardSortLoading;
  });
  els.boardList.classList.toggle("is-loading", state.boardSortLoading);
  els.boardList.setAttribute("aria-busy", String(state.boardSortLoading));
  els.boardList.replaceChildren();
  if (state.boardSortLoading) {
    for (let index = 0; index < 2; index += 1) {
      const skeleton = document.createElement("div");
      skeleton.className = "board-post-skeleton";
      skeleton.setAttribute("aria-hidden", "true");
      els.boardList.append(skeleton);
    }
    return;
  }
  const posts = state.boardPosts;
  if (!posts.length) {
    const empty = document.createElement("div");
    empty.className = "board-empty-state";
    empty.innerHTML = `${boardActionIcon("message")}<strong>아직 게시글이 없습니다.</strong><p>첫 운동 인증을 남겨보세요.</p>`;
    const action = document.createElement("button");
    action.type = "button";
    action.textContent = "첫 글 작성하기";
    action.addEventListener("click", () => {
      els.boardInput.focus();
      els.boardInput.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    empty.append(action);
    els.boardList.append(empty);
    return;
  }
  posts.forEach((post) => {
    const postKey = String(post.id);
    const expanded = state.boardExpandedPosts.has(postKey);
    const item = document.createElement("article");
    item.className = "board-post";
    item.dataset.postId = postKey;
    item.dataset.motionKey = `board-post-${postKey}`;
    const meta = document.createElement("div");
    meta.className = "board-post-meta";
    const author = document.createElement("strong");
    renderBoardAuthorElement(author, authorFromPost(post));
    const time = document.createElement("span");
    time.textContent = formatBoardTime(post.createdAt);
    time.title = post.createdAt;
    meta.append(author, time);
    const content = document.createElement("p");
    content.className = "board-post-content";
    content.textContent = post.content;
    const actions = document.createElement("div");
    actions.className = "board-actions";
    const like = document.createElement("button");
    like.type = "button";
    like.className = "board-action-button";
    like.classList.toggle("is-liked", Boolean(post.likedByMe));
    like.classList.toggle("is-loading", state.boardPendingLikes.has(postKey));
    like.innerHTML = `${boardActionIcon("heart")}<span>${post.likeCount || 0}</span>`;
    like.setAttribute("aria-label", `좋아요 ${post.likeCount || 0}`);
    like.setAttribute("aria-pressed", String(Boolean(post.likedByMe)));
    like.disabled = state.boardPendingLikes.has(postKey);
    like.addEventListener("click", () => {
      window.SetCounterMotion?.animateSuccess(like);
      toggleBoardLike(post.id).catch((error) => showToast(error.message));
    });
    const commentToggle = document.createElement("button");
    commentToggle.type = "button";
    commentToggle.className = "board-action-button board-comment-toggle";
    commentToggle.innerHTML = `${boardActionIcon("message")}<span>${post.commentCount || 0}</span>`;
    commentToggle.setAttribute("aria-label", expanded ? "댓글 접기" : `댓글 ${post.commentCount || 0}개 보기`);
    commentToggle.setAttribute("aria-expanded", String(expanded));
    commentToggle.addEventListener("click", () => {
      if (expanded) state.boardExpandedPosts.delete(postKey);
      else state.boardExpandedPosts.add(postKey);
      renderBoard();
      if (!expanded) {
        requestAnimationFrame(() => {
          const panel = els.boardList.querySelector(`[data-post-id="${CSS.escape(postKey)}"] .board-comments`);
          window.SetCounterMotion?.animateSwap(panel, 1);
          panel?.querySelector(".board-comment-form input")?.focus();
        });
      }
    });
    const report = document.createElement("button");
    report.type = "button";
    report.className = "board-action-button report";
    report.innerHTML = `${boardActionIcon("flag")}<span>신고</span>`;
    report.addEventListener("click", () => reportBoardContent(post.id, null, report));
    actions.append(like, commentToggle, report);

    const comments = document.createElement("div");
    comments.className = "board-comments";
    comments.hidden = !expanded;
    (post.comments || []).forEach((comment) => {
      const commentItem = document.createElement("div");
      commentItem.className = "board-comment";
      const commentAuthor = document.createElement("strong");
      renderBoardAuthorElement(commentAuthor, authorFromPost(comment));
      const commentBody = document.createElement("div");
      commentBody.className = "board-comment-body";
      const commentText = document.createElement("span");
      commentText.textContent = comment.content;
      const commentTime = document.createElement("small");
      commentTime.textContent = formatBoardTime(comment.createdAt);
      commentBody.append(commentText, commentTime);
      const commentReport = document.createElement("button");
      commentReport.type = "button";
      commentReport.className = "board-comment-report";
      commentReport.innerHTML = boardActionIcon("flag");
      commentReport.setAttribute("aria-label", "댓글 신고");
      commentReport.addEventListener("click", () => reportBoardContent(post.id, comment.id, commentReport));
      commentItem.append(commentAuthor, commentBody, commentReport);
      comments.append(commentItem);
    });

    const commentForm = document.createElement("form");
    commentForm.className = "board-comment-form";
    commentForm.innerHTML = `
      <label><span class="sr-only">댓글 내용</span><input maxlength="120" placeholder="운동 기록에 댓글 남기기"><small class="board-comment-counter">0 / 120</small></label>
      <button type="submit">댓글</button>
    `;
    const commentInput = commentForm.querySelector("input");
    const commentCounter = commentForm.querySelector(".board-comment-counter");
    const commentSubmit = commentForm.querySelector("button");
    const syncComment = () => {
      const length = commentInput.value.length;
      commentCounter.textContent = `${length} / 120`;
      commentCounter.classList.toggle("is-limit", length >= 120);
      commentSubmit.disabled = state.boardPendingComments.has(postKey) || !commentInput.value.trim() || length > 120;
      commentSubmit.textContent = state.boardPendingComments.has(postKey) ? "등록 중" : "댓글";
    };
    commentInput.addEventListener("input", syncComment);
    syncComment();
    commentForm.addEventListener("submit", (event) => submitBoardComment(event, post.id));
    comments.append(commentForm);
    item.append(meta, content, actions, comments);
    els.boardList.append(item);
  });
  window.SetCounterMotion?.animateListEnter(els.boardList.querySelectorAll(".board-post"), { scope: "board", limit: 10, y: 12 });
}

async function refreshBoardPosts(nextPosts = null) {
  state.boardPosts = nextPosts || (await api(`/api/board/posts?sort=${state.boardSort}`));
  renderBoard();
}

async function toggleBoardLike(postId) {
  const postKey = String(postId);
  if (state.boardPendingLikes.has(postKey)) return;
  state.boardPendingLikes.add(postKey);
  renderBoard();
  let succeeded = false;
  try {
    await api(`/api/board/posts/${postId}/like`, { method: "POST" });
    await refreshBoardPosts();
    succeeded = true;
  } finally {
    state.boardPendingLikes.delete(postKey);
    renderBoard();
    if (succeeded) {
      window.requestAnimationFrame(() => {
        const button = els.boardList.querySelector(`[data-post-id="${CSS.escape(postKey)}"] .board-action-button`);
        window.SetCounterMotion?.animateSuccess(button);
      });
    }
  }
}

async function submitBoardComment(event, postId) {
  event.preventDefault();
  const postKey = String(postId);
  if (state.boardPendingComments.has(postKey)) return;
  const input = event.currentTarget.querySelector("input");
  const content = input.value.trim();
  if (!content) {
    showToast("댓글을 입력해주세요.");
    return;
  }
  if (content.length > 120) {
    showToast("댓글은 120자까지 입력할 수 있습니다.");
    return;
  }
  state.boardExpandedPosts.add(postKey);
  state.boardPendingComments.add(postKey);
  renderBoard();
  let failed = false;
  let succeeded = false;
  try {
    await api(`/api/board/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify({ content }),
    });
    await refreshBoardPosts();
    succeeded = true;
  } catch (error) {
    failed = true;
    showToast(error.message);
  } finally {
    state.boardPendingComments.delete(postKey);
    renderBoard();
    if (succeeded) {
      window.requestAnimationFrame(() => {
        const comments = els.boardList.querySelector(`[data-post-id="${CSS.escape(postKey)}"] .board-comments`);
        const renderedComments = comments?.querySelectorAll(".board-comment");
        const newest = renderedComments?.[renderedComments.length - 1];
        window.SetCounterMotion?.animateContentChange(newest, 1);
      });
    }
    if (failed) {
      requestAnimationFrame(() => {
        const restored = els.boardList.querySelector(`[data-post-id="${CSS.escape(postKey)}"] .board-comment-form input`);
        if (!restored) return;
        restored.value = content;
        restored.dispatchEvent(new Event("input", { bubbles: true }));
        restored.focus();
      });
    }
  }
}

function syncBoardReportOther() {
  const selected = els.boardReportForm.querySelector('input[name="boardReportReason"]:checked');
  const isOther = selected?.value === "기타";
  els.boardReportOtherField.hidden = !isOther;
  if (!isOther) els.boardReportOtherInput.value = "";
  const length = els.boardReportOtherInput.value.length;
  els.boardReportCounter.textContent = `${length} / 500`;
  els.boardReportCounter.classList.toggle("is-limit", length >= 500);
}

function openBoardReportModal(postId, commentId = null, trigger = null) {
  state.boardReportTarget = { postId, commentId, trigger };
  els.boardReportModal.dataset.postId = String(postId);
  els.boardReportModal.dataset.commentId = commentId === null ? "" : String(commentId);
  state.boardReportSubmitting = false;
  els.boardReportTitle.textContent = commentId ? "댓글 신고" : "게시글 신고";
  els.boardReportTargetCopy.textContent = commentId
    ? "이 댓글이 커뮤니티 운영 원칙에 맞지 않는 이유를 선택해주세요."
    : "이 게시글이 커뮤니티 운영 원칙에 맞지 않는 이유를 선택해주세요.";
  els.boardReportForm.reset();
  els.boardReportForm.querySelector('input[name="boardReportReason"]')?.click();
  els.boardReportError.textContent = "";
  els.submitBoardReportButton.disabled = false;
  els.submitBoardReportButton.textContent = "신고 보내기";
  syncBoardReportOther();
  els.boardReportModal.hidden = false;
  window.SetCounterMotion?.openOverlay(els.boardReportModal, {
    sheet: true,
    onComplete: () => els.boardReportForm.querySelector('input[name="boardReportReason"]')?.focus(),
  });
}

function closeBoardReportModal() {
  if (els.boardReportModal.hidden || state.boardReportSubmitting) return;
  const trigger = state.boardReportTarget?.trigger;
  window.SetCounterMotion?.closeOverlay(els.boardReportModal, { sheet: true, onComplete: () => {
    els.boardReportModal.hidden = true;
    delete els.boardReportModal.dataset.postId;
    delete els.boardReportModal.dataset.commentId;
    state.boardReportTarget = null;
    trigger?.focus();
  } });
}

function reportBoardContent(postId, commentId = null, trigger = null) {
  openBoardReportModal(postId, commentId, trigger);
}

async function submitBoardReport(event) {
  event.preventDefault();
  if (state.boardReportSubmitting || !state.boardReportTarget) return;
  const selected = els.boardReportForm.querySelector('input[name="boardReportReason"]:checked');
  const reason = selected?.value === "기타" ? els.boardReportOtherInput.value.trim() : selected?.value;
  els.boardReportError.textContent = "";
  if (!reason) {
    els.boardReportError.textContent = "신고 사유를 선택하거나 입력해주세요.";
    return;
  }
  if (reason.length > 500) {
    els.boardReportError.textContent = "신고 사유는 500자까지 입력할 수 있습니다.";
    return;
  }
  state.boardReportSubmitting = true;
  els.submitBoardReportButton.disabled = true;
  els.submitBoardReportButton.textContent = "보내는 중...";
  try {
    await api("/api/board/reports", {
      method: "POST",
      body: JSON.stringify({
        postId: state.boardReportTarget.postId,
        commentId: state.boardReportTarget.commentId,
        reason,
      }),
    });
    els.boardReportModal.hidden = true;
    delete els.boardReportModal.dataset.postId;
    delete els.boardReportModal.dataset.commentId;
    state.boardReportTarget = null;
    showToast("신고를 보냈습니다.");
  } catch (error) {
    els.boardReportError.textContent = error.message;
  } finally {
    state.boardReportSubmitting = false;
    els.submitBoardReportButton.disabled = false;
    els.submitBoardReportButton.textContent = "신고 보내기";
  }
}

async function submitBoardPost(event) {
  event.preventDefault();
  if (state.boardPosting) return;
  const content = els.boardInput.value.trim();
  if (!content) {
    showToast("게시글 내용을 입력해주세요.");
    return;
  }
  if (content.length > 180) {
    showToast("게시글은 180자까지 입력할 수 있습니다.");
    return;
  }
  state.boardPosting = true;
  syncBoardPostCounter();
  try {
    const post = await api("/api/board/posts", {
      method: "POST",
      body: JSON.stringify({ content }),
    });
    state.boardPosts.unshift(post);
    els.boardInput.value = "";
    showToast("게시글을 올렸습니다.");
  } catch (error) {
    showToast(error.message);
  } finally {
    state.boardPosting = false;
    renderBoard();
  }
}

function renderHistory() {
  const totalSets = state.logs.reduce((sum, log) => sum + log.completedSets, 0);
  const monthlyMetrics = state.logs.length ? calendarActivitySummary(state.logs).replace(/^\d+종목 · /, "") : "0kg";
  els.monthSummary.textContent = `${state.logs.length}회 · ${totalSets}세트 · ${monthlyMetrics}`;
  els.historyList.replaceChildren();
  if (!state.logs.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "이번 달 기록이 아직 없습니다.";
    els.historyList.append(empty);
    renderHomeDashboard();
    return;
  }

  const daily = new Map();
  state.logs.forEach((log) => {
    const row = daily.get(log.date) || { date: log.date, volume: 0, count: 0, names: [], logs: [] };
    row.volume += log.volume || 0;
    row.count += 1;
    row.names.push(storedExerciseDisplayName(log.exercise));
    row.logs.push(log);
    daily.set(log.date, row);
  });
  Array.from(daily.values())
    .sort((a, b) => b.date.localeCompare(a.date))
    .forEach((day) => {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "history-item history-day-button";
      item.dataset.motionKey = `history-${day.date}`;
      const body = document.createElement("span");
      const title = document.createElement("strong");
      title.className = "history-title";
      title.textContent = day.date;
      const meta = document.createElement("span");
      meta.className = "history-meta";
      meta.textContent = `${calendarActivitySummary(day.logs)} · ${day.names.join(", ")}`;
      body.append(title, meta);
      const open = document.createElement("span");
      open.className = "history-open";
      open.textContent = "보기";
      item.append(body, open);
      item.addEventListener("click", () => chooseDate(day.date));
      els.historyList.append(item);
    });
  window.SetCounterMotion?.animateListEnter(els.historyList.children, { scope: "history", limit: 10, y: 10 });
  renderHomeDashboard();
}

async function saveSosExcuse() {
  if (state.sosSubmitting) return;
  const previousLevel = state.stats?.level;
  const reason = els.sosReasonInput.value.trim();
  if (!reason) {
    showToast("SOS 사유를 입력해주세요.");
    return;
  }
  state.sosSubmitting = true;
  els.sosButton.classList.add("is-loading");
  els.sosButton.querySelector("span").textContent = "저장 중...";
  syncSosReasonInput();
  let succeeded = false;
  try {
    await api("/api/excuses", {
      method: "POST",
      body: JSON.stringify({ date: state.selectedDate, reason }),
    });
    const data = await loadBootstrap();
    showToast(`${state.selectedDate} SOS를 저장했습니다.`);
    announceLevelChange(previousLevel, data.stats.level);
    succeeded = true;
  } finally {
    state.sosSubmitting = false;
    els.sosButton.classList.remove("is-loading");
    els.sosButton.querySelector("span").textContent = excuseForDate(state.selectedDate) ? "SOS 업데이트" : "SOS 저장";
    renderMenuSos();
    if (succeeded) window.SetCounterMotion?.animateButtonComplete(els.sosButton);
  }
}

async function saveWorkout() {
  const previousLevel = state.stats?.level;
  const previousStats = state.stats ? { ...state.stats } : null;
  const completedExercise = state.selectedExercise;
  const completedRecommendation = state.selectedDate === todayKey &&
    exerciseKey(completedExercise) === state.recommendedExerciseKey;
  const activeRoutine = state.activeRoutine;
  const log = {
    date: state.selectedDate,
    exercise: state.selectedExercise.name,
    weightKg: state.setRows[state.setRows.length - 1]?.weightKg ?? normalizedWeight(true),
    setWeights: state.setRows.map((row) => row.weightKg),
    setReps: state.setRows.map((row) => row.reps),
    targetSets: targetSets(),
    completedSets: state.setRows.length,
    restSeconds: restTimerState.duration,
  };
  const savedLog = await api("/api/logs", {
    method: "POST",
    body: JSON.stringify(log),
  });
  showToast(`${state.selectedDate} 운동 기록을 저장했습니다.`);
  resetSession(true);
  const data = await loadBootstrap({ deferStats: true });
  renderLatestRecord(savedLog);
  window.SetCounterMotion?.animateWorkoutSuccess(els.confirmWorkoutButton, [els.lastRecord]);
  const continueWorkoutFlow = () => {
    if (activeRoutine) {
      const completedIndex = activeRoutine.exercises.findIndex((exercise) => exerciseKey(exercise) === exerciseKey(completedExercise));
      const nextExercise = activeRoutine.exercises[completedIndex + 1];
      if (nextExercise) {
        state.activeRoutine.index = completedIndex + 1;
        state.recommendedExerciseKey = exerciseKey(nextExercise);
        openNextRecommendation(nextExercise, `${activeRoutine.title} ${completedIndex + 2}/${activeRoutine.exercises.length}`);
      } else {
        state.activeRoutine = null;
        showToast(`${activeRoutine.title} 완료. 좋은 운동이었어요.`);
      }
    } else if (completedRecommendation) {
      const nextExercise = chooseRecommendedExercise({ completedExercise });
      if (nextExercise) openNextRecommendation(nextExercise);
    }
  };
  const authoritativePreviousLevel = Number(savedLog.levelBefore) || previousLevel;
  const authoritativeNextLevel = Number(savedLog.levelAfter) || data.stats.level;
  if (previousStats && authoritativeNextLevel > authoritativePreviousLevel) {
    openLevelUpScreen(
      { ...previousStats, level: authoritativePreviousLevel },
      { ...data.stats, level: authoritativeNextLevel },
      data.profile,
      continueWorkoutFlow,
    );
    return;
  }
  renderStats(data.stats);
  renderProfile(data.profile);
  const cheatAlertShown = announceCheatGuard(previousStats, data.stats);
  if (!cheatAlertShown) announceLevelChange(previousLevel, data.stats.level);
  if (!cheatAlertShown) {
    continueWorkoutFlow();
  }
}

function countSet() {
  const weightKg = normalizedWeight(true);
  if (state.setRows.length >= targetSets()) {
    showToast("목표 세트를 이미 채웠습니다.");
    return;
  }
  const completedIndex = state.setRows.length;
  state.setRows.push({ weightKg, reps: currentReps() });
  applyNextSetFromLatestRecord();
  syncCounter();
  const completedChip = els.lastRecord.querySelector(`.record-chip[data-set-index="${completedIndex}"]`);
  window.SetCounterMotion?.animateSetChipComplete(completedChip);
  if (state.setRows.length >= targetSets()) {
    resetRestTimer();
    showToast("목표 세트 완료. 확인을 눌러 저장하세요.");
  } else {
    startRestTimer(true);
  }
}

function undoSet() {
  const revertedSet = state.setRows.pop();
  if (revertedSet) {
    writeWeightInput(revertedSet.weightKg);
    els.currentRepsInput.value = String(Math.max(revertedSet.reps || 1, 1));
  }
  resetRestTimer();
  syncCounter();
}

function syncRestTimerUi() {
  if (!els.restTimer) return;
  if (!els.restTimerProgress.childElementCount) {
    const fragment = document.createDocumentFragment();
    for (let index = 0; index < 30; index += 1) {
      const segment = document.createElement("i");
      segment.setAttribute("aria-hidden", "true");
      fragment.appendChild(segment);
    }
    els.restTimerProgress.appendChild(fragment);
  }
  const remainingRatio = restTimerState.duration > 0 ? restTimerState.remaining / restTimerState.duration : 0;
  const activeSegments = Math.ceil(Math.min(Math.max(remainingRatio, 0), 1) * 30);
  [...els.restTimerProgress.children].forEach((segment, index) => {
    segment.classList.toggle("is-remaining", index < activeSegments);
  });
  els.restDurationValue.textContent = `휴식 ${restTimerState.duration}초`;
  els.restTimerProgress.setAttribute("aria-valuemin", "0");
  els.restTimerProgress.setAttribute("aria-valuemax", String(restTimerState.duration));
  els.restTimerProgress.setAttribute("aria-valuenow", String(restTimerState.remaining));
  els.restTimerA11y.textContent = restTimerState.finished
    ? "휴식 완료"
    : `휴식 시간 ${restTimerState.remaining}초 남음`;
  els.restTimer.classList.toggle("is-running", restTimerState.running);
  els.restTimer.classList.toggle("is-paused", restTimerState.paused);
  els.restTimer.classList.toggle("is-finished", restTimerState.finished);
  if (restTimerState.running) {
    els.restTimerToggleButton.classList.add("is-pause-action");
    els.restTimerToggleButton.setAttribute("aria-label", "휴식 일시정지");
  } else if (restTimerState.finished) {
    els.restTimerToggleButton.classList.remove("is-pause-action");
    els.restTimerToggleButton.setAttribute("aria-label", "휴식 다시 시작");
  } else if (restTimerState.paused) {
    els.restTimerToggleButton.classList.remove("is-pause-action");
    els.restTimerToggleButton.setAttribute("aria-label", "휴식 계속");
  } else {
    els.restTimerToggleButton.classList.remove("is-pause-action");
    els.restTimerToggleButton.setAttribute("aria-label", "휴식 시작");
  }
}

function clearRestTimerInterval() {
  if (restTimerState.intervalId !== null) {
    window.clearInterval(restTimerState.intervalId);
    restTimerState.intervalId = null;
  }
}

function playRestTimerSignal() {
  navigator.vibrate?.([100, 70, 140]);
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.16, context.currentTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.34);
    gain.connect(context.destination);
    [0, 0.16].forEach((offset, index) => {
      const oscillator = context.createOscillator();
      oscillator.type = "sine";
      oscillator.frequency.value = index ? 1046 : 880;
      oscillator.connect(gain);
      oscillator.start(context.currentTime + offset);
      oscillator.stop(context.currentTime + offset + 0.14);
    });
    window.setTimeout(() => context.close(), 600);
  } catch (_error) {
    // 진동과 화면 알림은 오디오를 지원하지 않는 환경에서도 유지됩니다.
  }
}

function finishRestTimer() {
  clearRestTimerInterval();
  restTimerState.remaining = 0;
  restTimerState.running = false;
  restTimerState.paused = false;
  restTimerState.finished = true;
  syncRestTimerUi();
  playRestTimerSignal();
  window.gsap?.fromTo(els.restTimerProgress, { scaleY: 0.72 }, { scaleY: 1, duration: 0.42, ease: "back.out(2)" });
  if (els.restCompleteAlert && window.SetCounterMotion?.animateRestComplete) {
    window.SetCounterMotion.animateRestComplete(els.restCompleteAlert);
  } else {
    showToast("휴식 완료. 다음 세트를 시작하세요.");
  }
}

function updateRestTimer() {
  if (!restTimerState.running) return;
  restTimerState.remaining = Math.max(Math.ceil((restTimerState.deadline - Date.now()) / 1000), 0);
  if (restTimerState.remaining <= 0) {
    finishRestTimer();
    return;
  }
  syncRestTimerUi();
}

function startRestTimer(restart = false) {
  clearRestTimerInterval();
  if (restart || restTimerState.remaining <= 0) restTimerState.remaining = restTimerState.duration;
  restTimerState.deadline = Date.now() + restTimerState.remaining * 1000;
  restTimerState.running = true;
  restTimerState.paused = false;
  restTimerState.finished = false;
  restTimerState.intervalId = window.setInterval(updateRestTimer, 250);
  syncRestTimerUi();
}

function pauseRestTimer() {
  if (!restTimerState.running) return;
  restTimerState.remaining = Math.max(Math.ceil((restTimerState.deadline - Date.now()) / 1000), 0);
  clearRestTimerInterval();
  restTimerState.running = false;
  restTimerState.paused = restTimerState.remaining > 0;
  syncRestTimerUi();
}

function resetRestTimer() {
  clearRestTimerInterval();
  restTimerState.remaining = restTimerState.duration;
  restTimerState.running = false;
  restTimerState.paused = false;
  restTimerState.finished = false;
  syncRestTimerUi();
}

function setRestTimerDuration(value) {
  const parsed = Number.parseInt(value, 10);
  const next = Math.min(Math.max(Math.round((Number.isFinite(parsed) ? parsed : 90) / 10) * 10, 10), 600);
  restTimerState.duration = next;
  window.localStorage.setItem(REST_TIMER_DURATION_STORAGE, String(next));
  resetRestTimer();
}

function changeMonth(offset) {
  state.currentMonth = new Date(
    state.currentMonth.getFullYear(),
    state.currentMonth.getMonth() + offset,
    1
  );
  loadBootstrap()
    .then(() => window.SetCounterMotion?.animateSwap(els.calendarGrid, offset))
    .catch((error) => showToast(error.message));
}

function bindEvents() {
  els.navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.tab === "record") openRecordScreen();
      else setActiveScreen(button.dataset.tab);
    });
  });
  els.goScreenButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.goScreen === "record") openRecordScreen();
      else setActiveScreen(button.dataset.goScreen);
    });
  });
  els.closePlanDetailButton.addEventListener("click", () => setActiveScreen("home"));
  els.startPlanDetailButton.addEventListener("click", () => {
    if (state.selectedPlan) startWorkoutPlan(state.selectedPlan);
  });
  els.closePlanExerciseDetailButton.addEventListener("click", closePlanExerciseDetail);
  els.confirmPlanExerciseDetailButton.addEventListener("click", closePlanExerciseDetail);
  els.previousPlanExerciseButton.addEventListener("click", () => {
    if (state.planExerciseDetailIndex <= 0) return;
    state.planExerciseDetailIndex -= 1;
    renderPlanExerciseDetail(-1);
  });
  els.nextPlanExerciseButton.addEventListener("click", () => {
    if (state.planExerciseDetailIndex >= state.planExerciseDetailSteps.length - 1) return;
    state.planExerciseDetailIndex += 1;
    renderPlanExerciseDetail(1);
  });
  els.planExerciseDetailModal.addEventListener("click", (event) => {
    if (event.target === els.planExerciseDetailModal) closePlanExerciseDetail();
  });
  els.toggleExerciseEditButton.addEventListener("click", () => toggleExerciseEditMode());
  els.toggleExerciseGridButton.addEventListener("click", toggleExercisePicker);
  els.deleteSelectedExercisesButton.addEventListener("click", () => {
    deleteSelectedExercises().catch((error) => showToast(error.message));
  });
  els.levelProgressBar.parentElement.addEventListener("click", () => {
    const stats = state.stats || {};
    showToast(`현재 경험치 ${stats.experiencePercent || 0}% · 누적 ${displayExperience(stats.experience)} XP`);
  });
  els.openExerciseLibraryButton.addEventListener("click", openExerciseLibrary);
  els.closeExerciseLibraryButton.addEventListener("click", closeExerciseLibrary);
  els.exerciseLibrarySearch.addEventListener("input", () => {
    libraryState.visible = LIBRARY_PAGE_SIZE;
    window.clearTimeout(renderExerciseLibrary.searchTimer);
    renderExerciseLibrary.searchTimer = window.setTimeout(renderExerciseLibrary, 90);
  });
  els.exerciseLibraryModal.addEventListener("click", (event) => {
    if (event.target === els.exerciseLibraryModal) closeExerciseLibrary();
  });
  els.menuButton.addEventListener("click", () => {
    const nextHidden = !els.menuPopover.hidden;
    els.menuPopover.hidden = nextHidden;
    els.menuButton.setAttribute("aria-expanded", String(!nextHidden));
  });
  els.changeNicknameButton.addEventListener("click", () => {
    els.menuPopover.hidden = true;
    els.menuButton.setAttribute("aria-expanded", "false");
    if (state.profile && !state.profile.canChangeNickname) {
      showToast("닉네임은 7일에 한 번만 변경할 수 있습니다.");
      return;
    }
    openNicknameModal(false);
  });
  els.menuNicknameButton.addEventListener("click", () => {
    if (state.profile && !state.profile.canChangeNickname) {
      showToast("닉네임은 7일에 한 번만 변경할 수 있습니다.");
      return;
    }
    openNicknameModal(false);
  });
  els.profileForm.addEventListener("submit", saveNickname);
  els.nicknameInput.addEventListener("input", syncNicknameInput);
  els.closeProfileButton.addEventListener("click", closeNicknameModal);
  els.profileLoginButton.addEventListener("click", () => {
    closeNicknameModal(true);
    openAuthModal("login");
  });
  els.userBadgeLabel.addEventListener("click", openLevelHistory);
  els.closeLevelHistoryButton.addEventListener("click", closeLevelHistory);
  els.levelHistoryModal.addEventListener("click", (event) => {
    if (event.target === els.levelHistoryModal) closeLevelHistory();
  });
  els.profileModal.addEventListener("click", (event) => {
    if (event.target === els.profileModal) {
      closeNicknameModal();
    }
  });
  els.complaintForm.addEventListener("submit", submitComplaint);
  els.complaintInput.addEventListener("input", syncComplaintInput);
  els.closeComplaintButton.addEventListener("click", closeComplaintModal);
  els.closeComplaintTopButton.addEventListener("click", closeComplaintModal);
  els.complaintModal.addEventListener("click", (event) => {
    if (event.target === els.complaintModal) {
      closeComplaintModal();
    }
  });
  els.countSetButton.addEventListener("click", countSet);
  els.undoSetButton.addEventListener("click", undoSet);
  els.confirmWorkoutButton.addEventListener("click", () => saveWorkout().catch((error) => showToast(error.message)));
  els.levelUpContinueButton.addEventListener("click", closeLevelUpScreen);
  els.seasonMomentButton?.addEventListener("click", closeSeasonMoment);
  els.seasonMoment?.addEventListener("click", (event) => {
    if (event.target === els.seasonMoment) closeSeasonMoment();
  });
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
  els.restTimeStepButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setRestTimerDuration(restTimerState.duration + Number.parseInt(button.dataset.restStep, 10));
    });
  });
  els.restTimerToggleButton.addEventListener("click", () => {
    if (restTimerState.running) pauseRestTimer();
    else startRestTimer(restTimerState.finished);
  });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && restTimerState.running) updateRestTimer();
  });
  document.querySelectorAll("[data-step-for]").forEach((button) => {
    button.addEventListener("click", () => {
      const input = document.querySelector(`#${button.dataset.stepFor}`);
      const delta = Number.parseFloat(button.dataset.step) || 0;
      if (input) stepNumberInput(input, delta);
    });
  });
  els.enableReminderButton.addEventListener("click", () => enableReminder().catch((error) => showToast(error.message)));
  els.sosReasonInput.addEventListener("input", syncSosReasonInput);
  els.sosReasonButtons.forEach((button) => {
    button.addEventListener("click", () => {
      els.sosReasonInput.value = button.dataset.sosReason || "";
      syncSosReasonInput();
      els.sosReasonInput.focus();
    });
  });
  els.sosButton.addEventListener("click", () => saveSosExcuse().catch((error) => showToast(error.message)));
  els.boardForm.addEventListener("submit", submitBoardPost);
  els.boardInput.addEventListener("input", syncBoardPostCounter);
  els.boardSortButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (state.boardSortLoading || button.dataset.boardSort === state.boardSort) return;
      state.boardSort = button.dataset.boardSort;
      loadBoardPosts().catch((error) => showToast(error.message));
    });
  });
  els.boardReportForm.addEventListener("submit", submitBoardReport);
  els.boardReportForm.querySelectorAll('input[name="boardReportReason"]').forEach((input) => {
    input.addEventListener("change", syncBoardReportOther);
  });
  els.boardReportOtherInput.addEventListener("input", syncBoardReportOther);
  els.closeBoardReportButton.addEventListener("click", closeBoardReportModal);
  els.cancelBoardReportButton.addEventListener("click", closeBoardReportModal);
  els.boardReportModal.addEventListener("click", (event) => {
    if (event.target === els.boardReportModal) closeBoardReportModal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (els.seasonMoment && !els.seasonMoment.hidden) closeSeasonMoment();
    else if (!els.boardReportModal.hidden) closeBoardReportModal();
    else if (!els.levelHistoryModal.hidden) closeLevelHistory();
    else if (!els.profileModal.hidden) closeNicknameModal();
    else if (!els.complaintModal.hidden) closeComplaintModal();
    else if (!els.authAlertModal.hidden) closeAuthAlert();
    else if (!els.registerModal.hidden) closeAuthModal("register");
    else if (!els.loginModal.hidden) closeAuthModal("login");
    else if (!els.deleteAccountModal.hidden) closeDeleteAccountModal();
    else if (!els.faqModal.hidden) closeSupportModal(els.faqModal);
    else if (!els.privacyModal.hidden) closeSupportModal(els.privacyModal);
  });
  els.openFeedbackButton.addEventListener("click", () => openComplaintModal("feedback"));
  els.openFaqButton.addEventListener("click", () => openSupportModal(els.faqModal, els.closeFaqButton));
  els.closeFaqButton.addEventListener("click", () => closeSupportModal(els.faqModal));
  els.faqModal.addEventListener("click", (event) => {
    if (event.target === els.faqModal) closeSupportModal(els.faqModal);
  });
  els.openPrivacyButton.addEventListener("click", () => openSupportModal(els.privacyModal, els.closePrivacyButton));
  els.openTermsButton.addEventListener("click", () => window.open("/terms", "_blank", "noopener"));
  els.closePrivacyButton.addEventListener("click", () => closeSupportModal(els.privacyModal));
  els.privacyModal.addEventListener("click", (event) => {
    if (event.target === els.privacyModal) closeSupportModal(els.privacyModal);
  });
  els.versionButton.addEventListener("click", () => showToast("Set Counter v1.0.0"));
  els.closeNextRecommendationButton.addEventListener("click", closeNextRecommendation);
  els.startNextRecommendationButton.addEventListener("click", () => {
    startNextRecommendation().catch((error) => showToast(error.message));
  });
  els.nextRecommendationModal.addEventListener("click", (event) => {
    if (event.target === els.nextRecommendationModal) closeNextRecommendation();
  });
  els.prevMonthButton.addEventListener("click", () => changeMonth(-1));
  els.nextMonthButton.addEventListener("click", () => changeMonth(1));
}

function bindAuthEvents() {
  els.weeklyGoalDecrease.addEventListener("click", () => changeWeeklyGoalDraft(-1));
  els.weeklyGoalIncrease.addEventListener("click", () => changeWeeklyGoalDraft(1));
  els.weeklyGoalForm.addEventListener("submit", saveWeeklyGoal);
  els.openRegisterButton.addEventListener("click", () => openAuthModal("register"));
  els.openLoginButton.addEventListener("click", () => openAuthModal("login"));
  els.closeRegisterButton.addEventListener("click", () => closeAuthModal("register"));
  els.closeLoginButton.addEventListener("click", () => closeAuthModal("login"));
  els.registerForm.addEventListener("submit", submitRegister);
  els.loginForm.addEventListener("submit", submitLogin);
  els.logoutButton.addEventListener("click", logoutAccount);
  els.openDeleteAccountButton.addEventListener("click", openDeleteAccountModal);
  els.closeDeleteAccountButton.addEventListener("click", closeDeleteAccountModal);
  els.deleteAccountForm.addEventListener("submit", submitDeleteAccount);
  const closeConflict = () => window.SetCounterMotion?.closeOverlay(els.authConflictModal, { onComplete: () => {
    els.authConflictModal.hidden = true;
    syncMenuOverlayLock();
  } });
  els.closeAuthConflictButton.addEventListener("click", closeConflict);
  els.closeAuthAlertButton.addEventListener("click", closeAuthAlert);
  els.registerModal.addEventListener("click", (event) => { if (event.target === els.registerModal) closeAuthModal("register"); });
  els.loginModal.addEventListener("click", (event) => { if (event.target === els.loginModal) closeAuthModal("login"); });
  els.deleteAccountModal.addEventListener("click", (event) => { if (event.target === els.deleteAccountModal) closeDeleteAccountModal(); });
  els.authConflictModal.addEventListener("click", (event) => { if (event.target === els.authConflictModal) closeConflict(); });
}

async function init() {
  initMotion();
  await loadFreeExerciseDb();
  syncSelectedDateUi();
  els.counterTitle.textContent = exerciseDisplayName(state.selectedExercise);
  renderExerciseDetail(state.selectedExercise);
  renderExerciseCards();
  loadKoreanInstructions()
    .then(() => renderExerciseDetail(state.selectedExercise))
    .catch(() => {});
  bindEvents();
  bindAuthEvents();
  syncWeightControls();
  syncRestTimerUi();
  normalizedWeight(true);
  syncCounter();
  setActiveScreen("record");
  await loadAuthStatus();
  window.setTimeout(() => maybeOpenSeasonMoment(), 520);
  await loadBootstrap();
  routeInitialEntry();
}

init().catch((error) => showToast(error.message));
