(function () {
  "use strict";

  const STORAGE_KEY = "setcounterLanguage";
  const SUPPORTED = new Set(["ko", "en", "ja", "es", "zh", "ru"]);
  const saved = window.localStorage.getItem(STORAGE_KEY);
  const browserLanguage = (navigator.language || "ko").toLowerCase().split("-")[0];
  let current = SUPPORTED.has(saved) ? saved : (SUPPORTED.has(browserLanguage) ? browserLanguage : "en");

  const EN = {
    "앱 데이터를 불러오는 중입니다.": "Loading your workout data.",
    "Set Counter를 불러오는 중": "Loading Set Counter",
    "닉네임": "Nickname", "닉네임 변경": "Change nickname", "닉네임 만들기": "Create nickname",
    "· 누적": "· Total", "누적 운동 볼륨": "Total training volume", "운영자": "Admin",
    "운동을 묶어서 시작하세요": "Start with a workout plan", "오늘": "Today", "오늘의 진행": "Today's progress",
    "오늘 저장한 운동": "Today's workouts", "한계돌파 계산 중": "Calculating progress",
    "알림": "Notifications", "매일 오전 11시": "Every day at 11 AM", "운동 기록 알림을 켜주세요.": "Turn on workout reminders.", "알림 켜기": "Enable notifications",
    "운동 플랜": "Workout plan", "추천 운동 플랜": "Recommended plans", "운동 구성": "Workout lineup",
    "3종목 · 덤벨 중심": "3 exercises · Dumbbell focused", "상체 밀기 볼륨": "Upper-Body Push Volume",
    "플랜 세부 내용": "Plan details", "이 플랜으로 얻는 것": "What you'll gain", "플랜 일정": "Plan schedule", "지금 시작": "Start now",
    "운동 기록하기": "Log workout", "운동 종목 선택": "Choose exercises", "오늘 할 운동을 고르세요.": "Choose today's exercises.",
    "삭제하기": "Remove", "기록 날짜": "Workout date", "선택한 운동": "Selected exercise", "오늘의 추천": "Today's pick",
    "운동 상세": "Exercise details", "운동을 선택하면 상세 정보가 여기에 표시됩니다.": "Select an exercise to view its details.",
    "지난 기록을 불러오는 중...": "Loading previous workout...", "무게 kg": "Weight (kg)", "이번 세트 횟수": "Reps this set",
    "목표 세트": "Target sets", "이전": "Undo", "이번 세트 완료": "Complete set", "기록 저장": "Save workout",
    "세트": "Sets", "무게": "Weight", "횟수": "Reps", "볼륨": "Volume", "맨몸": "Bodyweight",
    "달력": "Calendar", "일": "Sun", "월": "Mon", "화": "Tue", "수": "Wed", "목": "Thu", "금": "Fri", "토": "Sat",
    "이번 달 요약": "Monthly summary", "근육 사용 분포": "Muscle distribution", "완료 세트 기준": "Based on completed sets", "상세 기록": "Workout details", "세트 상세": "Set details", "보기": "View", "보기 ›": "View ›", "최고": "Best", "총": "Total",
    "커뮤니티": "Community", "운동 기록을 함께 나누세요": "Share your training journey", "인증된 운동 레벨": "Verified training level",
    "게시글 내용": "Post", "운동 기록은 본문에 자동으로 추가되지 않습니다.": "Workout data is not added to your post automatically.",
    "작성하기": "Post", "최신": "Latest", "인기순": "Popular", "게시판": "Community", "홈": "Home", "기록": "Log", "메뉴": "Menu",
    "내 정보": "Profile", "7일에 한 번 변경": "Change once every 7 days", "주간 운동 목표": "Weekly workout goal",
    "일주일 목표": "Weekly target", "적용": "Apply", "목표까지 3회": "3 workouts to go",
    "월요일부터 일요일 사이 원하는 3일에 운동하면 됩니다. 주간 목표는 운동 계획과 진행 상황을 확인하는 용도로만 사용됩니다.": "Complete your target on any days from Monday through Sunday. The weekly goal is only used to track your plan and progress.",
    "앱 설정 및 고객지원": "App settings & support",
    "피드백 보내기": "Send feedback", "불편한 점이나 제안을 운영자에게 보냅니다.": "Send an issue or suggestion to the admin.",
    "진동 피드백": "Haptic feedback", "세트 완료와 휴식 종료를 진동으로 알려줍니다.": "Vibrate when a set is completed or rest ends.",
    "진동 피드백을 켰습니다.": "Haptic feedback enabled.", "진동 피드백을 껐습니다.": "Haptic feedback disabled.",
    "언어": "Language", "앱 표시 언어": "App language", "한국어": "Korean",
    "자주 묻는 질문": "FAQ", "기록과 레벨 사용법을 확인합니다.": "Learn about logging and levels.",
    "개인정보 처리방침": "Privacy Policy", "수집 및 보관되는 정보를 확인합니다.": "Review what data is collected and stored.",
    "이용약관": "Terms of Service", "서비스 이용 기준과 커뮤니티 원칙을 확인합니다.": "Review service terms and community rules.",
    "차단 사용자 관리": "Blocked users", "커뮤니티에서 숨긴 사용자를 확인합니다.": "Manage users hidden from your community feed.",
    "기록을 안전하게 보관하기": "Keep your records safe", "계정을 연결하면 휴대폰을 바꾸거나 앱을 다시 설치해도 운동 기록을 이어서 볼 수 있어요.": "Link an account to keep your workout history when you change phones or reinstall the app.",
    "계정 연결": "Link account", "이미 계정이 있어요": "I already have an account", "로그아웃": "Log out", "계정 삭제": "Delete account",
    "한계를 넘어섰습니다": "New personal best", "이전 기록을 뛰어넘어 새로운 레벨에 도달했습니다.": "You beat your previous best and reached a new level.", "달성": "Unlocked", "계속 운동하기": "Keep training",
    "휴식 끝": "Rest complete", "다음 세트를 시작하세요": "Start your next set.", "이번 달도 완료.": "Month complete.", "기록은 그대로 쌓였습니다.": "Your progress is saved.", "확인": "OK",
    "레벨·경험치 기록": "Level & XP history", "다음 레벨까지": "To next level", "레벨 및 경험치 내역": "Level and XP history",
    "운동 라이브러리": "Exercise library", "운동 추가 선택": "Add exercises", "검색": "Search", "부위": "Body part", "도구": "Equipment",
    "닉네임은 7일에 한 번 변경할 수 있습니다.": "You can change your nickname once every 7 days.",
    "커뮤니티와 레벨 표시에 사용할 닉네임을 정하세요.": "Choose the nickname shown in the community and level screens.",
    "2~12자 · 비속어와 차별 표현은 사용할 수 없음": "2–12 characters · Profanity and discriminatory language are not allowed",
    "성별": "Gender", "남성": "Male", "여성": "Female", "저장": "Save", "닫기": "Close", "보내기": "Send", "취소": "Cancel",
    "묶음 운동의 시작 중량을 맞추는 데 사용합니다. 바벨은 봉 포함, 덤벨은 한 손 기준이며 운동 중 언제든 조절할 수 있습니다.": "Used to set starting weights for workout plans. Barbell weights include the bar; dumbbell weights are per hand. You can adjust them at any time.",
    "Set Counter에 바라는 점이나 불편한 점을 남겨주세요. 운영자 Discord로 전송됩니다.": "Tell us what could be better. Your message is sent to the admin's Discord.",
    "내용": "Message", "운영자에게 직접 전달됩니다.": "Sent directly to the admin.", "신고하기": "Report",
    "커뮤니티 운영 원칙에 맞지 않는 내용을 알려주세요.": "Tell us about content that violates the community rules.", "신고 사유": "Reason",
    "욕설 또는 비방": "Abuse or harassment", "광고 또는 홍보": "Spam or advertising", "음란하거나 불쾌한 내용": "Sexual or disturbing content",
    "운동 커뮤니티와 무관한 내용": "Off-topic content", "기타": "Other", "직접 입력": "Enter a reason", "신고 보내기": "Submit report",
    "현재 기록을 계정에 연결하기": "Link current records to an account", "계정을 연결하면 다른 기기에서도 운동 기록을 이어서 볼 수 있어요.": "Link an account to continue your workout history on other devices.",
    "이메일": "Email", "비밀번호": "Password", "비밀번호는 8자 이상 입력해주세요.": "Use at least 8 characters.", "비밀번호 확인": "Confirm password",
    "[필수]": "[Required]", "에 동의합니다.": "I agree.", "을 확인하고 동의합니다.": "I have reviewed and agree.",
    "개인정보 수집·이용 및 처리방침": "Privacy collection and processing terms", "동의를 거부하면 계정 연결은 할 수 없지만 게스트로 이용할 수 있습니다.": "You can decline, but you will only be able to continue as a guest.",
    "계정에 기록 연결": "Link records", "기존 기록 불러오기": "Load existing records", "다른 기기에서 연결한 기록을 불러옵니다.": "Load records linked on another device.", "로그인": "Log in",
    "게스트 입장": "Continue as guest", "기존 기록을 불러오려면 다시 로그인해 주세요.": "Please sign in again to load your existing records.",
    "계정과 기록을 삭제할까요?": "Delete your account and records?", "운동·세트 기록, 레벨, 게시글, 댓글, 좋아요와 푸시 구독이 모두 삭제되며 복구할 수 없습니다.": "Workouts, sets, levels, posts, comments, likes, and push subscriptions will be permanently deleted.",
    "확인을 위해 비밀번호 입력": "Enter your password to confirm", "계정과 연결 데이터의 영구 삭제를 확인했습니다.": "I understand that my account and linked data will be permanently deleted.", "영구 삭제": "Delete permanently",
    "이 기기에 저장된 기록이 있습니다": "This device has local records", "현재 기기의 익명 기록과 로그인하려는 계정의 기록이 모두 존재합니다. 기록이 사라지지 않도록 자동으로 합치지 않았습니다.": "Both this device and the account you are signing in to contain workout records. They were not merged automatically to prevent data loss.",
    "현재 기기 기록": "Records on this device", "계정 기록": "Account records", "현재 기록 유지": "Keep device records", "계정 기록 불러오기": "Load account records",
    "지속시간": "Duration", "설명": "Description", "집중 영역": "Target muscles", "근육 자극": "Muscle activation", "주요": "Primary", "보조": "Secondary",
    "추천 업데이트": "Up next", "다음 추천 운동": "Next exercise", "나중에": "Later", "지금 하기": "Do it now", "진행 중인 루틴": "Workout in progress", "처음부터": "Start over", "이어 하기": "Resume",
    "입력 확인": "Check your details", "가입 정보를 확인해주세요": "Please review your sign-up details.", "삭제": "Delete",
    "주요 근육": "Primary muscles", "보조 근육": "Secondary muscles", "기구": "Equipment", "난이도": "Difficulty", "힘 방향": "Force", "동작 유형": "Mechanics", "운동 방법": "Instructions",
    "초급": "Beginner", "중급": "Intermediate", "상급": "Advanced", "초중급": "Beginner–Intermediate",
    "당기는 동작": "Pull", "미는 동작": "Push", "정적 동작": "Static", "복합 관절": "Compound", "단일 관절": "Isolation",
    "전면": "Front", "후면": "Back", "전체": "All", "펼치기": "Expand", "접기": "Collapse", "상세보기": "Details",
    "운동 데이터": "Exercise data", "내 기본 운동": "Built-in exercise", "직접 추가 운동": "Custom exercise", "운동 정보": "Exercise info",
    "가슴": "Chest", "등": "Back", "어깨": "Shoulders", "팔": "Arms", "하체": "Lower body", "코어": "Core", "전완그립": "Forearms & grip", "전신컨디셔닝": "Full-body conditioning",
    "덤벨": "Dumbbell", "바벨": "Barbell", "머신": "Machine", "케이블": "Cable", "자유운동": "Other", "맨몸/가방": "Bodyweight / backpack",
    "덤벨 가슴": "Chest · Dumbbell", "덤벨 둔근": "Glutes · Dumbbell", "덤벨 등": "Back · Dumbbell", "덤벨 어깨": "Shoulders · Dumbbell", "덤벨 팔": "Arms · Dumbbell", "덤벨 하체": "Lower body · Dumbbell",
    "넓고 탄탄한 상체 만들기": "Build a Broad, Strong Upper Body", "등과 팔 라인 채우기": "Build Your Back and Arms", "하체 힘 꽉 채우기": "Build Lower-Body Strength", "25분 전신 깨우기": "25-Minute Full-Body Reset",
    "가슴 · 어깨 · 삼두": "Chest · Shoulders · Triceps", "등 · 후면 어깨 · 이두": "Back · Rear Delts · Biceps", "허벅지 · 둔근 · 햄스트링": "Quads · Glutes · Hamstrings", "하체 · 밀기 · 당기기": "Lower Body · Push · Pull",
    "가슴의 두께부터 어깨 너비, 삼두 마무리까지 한 번에 채웁니다.": "Build chest thickness, shoulder width, and finish with triceps in one focused session.",
    "등 너비와 두께를 먼저 만들고 후면 어깨와 팔까지 단단히 마칩니다.": "Build back width and thickness first, then finish with rear delts and arms.",
    "스쿼트, 힌지, 런지를 중심으로 하체 앞뒤와 둔근을 고르게 단련합니다.": "Train the front and back of your legs and your glutes with squats, hinges, and lunges.",
    "큰 근육을 쓰는 네 동작으로 짧지만 빠짐없는 전신 루틴을 완성합니다.": "Four big movements create a short but complete full-body session.",
    "약 50분": "About 50 min", "약 45분": "About 45 min", "약 25분": "About 25 min",
    "암 서클": "Arm Circles", "다이내믹 가슴 스트레칭": "Dynamic Chest Stretch", "가벼운 푸쉬업": "Easy Push-Up", "가슴 스트레칭": "Chest Stretch", "삼두근 스트레칭": "Triceps Stretch",
    "밴드 풀 어파트": "Band Pull-Apart", "스캡 풀업": "Scapular Pull-Up", "등 스트레칭": "Upper-Back Stretch", "이두근 스트레칭": "Biceps Stretch", "가벼운 걷기": "Easy Walk",
    "월드 그레이티스트 스트레칭": "World's Greatest Stretch", "맨몸 스쿼트": "Bodyweight Squat", "느린 걷기": "Slow Walk", "햄스트링 스트레칭": "Hamstring Stretch", "빠른 걷기": "Brisk Walk",
    "추천 업데이트": "Recommendation update", "다음 · 준비 운동": "Next · Warm-up", "준비 운동": "Warm-up", "본 운동": "Main workout", "쿨다운": "Cooldown", "루틴": "Routine",
    "브론즈 레벨 1": "Bronze level 1", "홈으로": "Back to Home", "운동종목 빼기 모드": "Remove exercise mode", "운동 라이브러리 열기": "Open exercise library", "운동 종목 펼치기": "Expand exercise list",
    "무게 내리기": "Decrease weight", "무게, 0은 맨몸": "Weight; zero means bodyweight", "무게 올리기": "Increase weight", "횟수 내리기": "Decrease reps", "횟수 올리기": "Increase reps",
    "세트 내리기": "Decrease sets", "세트 올리기": "Increase sets", "휴식 타이머": "Rest timer", "남은 휴식 시간": "Rest time remaining", "휴식 시간 설정": "Set rest duration",
    "휴식 시간 10초 늘리기": "Add 10 seconds", "휴식 시간 10초 줄이기": "Subtract 10 seconds", "휴식 시작": "Start rest", "현재 세트 기록": "Current sets",
    "이전 달": "Previous month", "다음 달": "Next month", "오늘 운동 인증, 한 줄 다짐": "Share today's workout or a short note", "게시글 정렬": "Sort posts",
    "이번 주 운동 목표 진행률": "Weekly workout goal progress", "주간 운동 목표 줄이기": "Decrease weekly goal", "주간 운동 목표 늘리기": "Increase weekly goal", "빠른 사유 선택": "Quick reasons",
    "직접 사유를 입력하거나 위 항목을 선택하세요.": "Enter a reason or choose one above.", "고객 지원": "Customer support", "레벨업 진행": "Level-up progress", "주요 메뉴": "Main navigation", "레벨 경험치": "Level XP",
    "한국어 운동 정보": "Exercise information", "아직 완료한 세트 없음": "No completed sets yet", "전신": "Full body", "둔근": "Glutes", "전완": "Forearms",
    "위 플랜을 고르면 여러 운동을 순서대로 기록할 수 있습니다.": "Choose a plan above to log several exercises in sequence.",
    "검색 결과가 없습니다": "No results found", "검색어를 바꾸거나 다른 부위와 도구를 선택해보세요.": "Try another search term, body part, or equipment filter.",
    "운동 정보를 불러오는 중...": "Loading exercise details...", "이미지 없음": "No image", "운동 정보 접힘": "Exercise details collapsed",
    "운동을 선택하면 카운터로 바로 이동합니다.": "Select an exercise to open its set counter.", "이미 추가된 운동입니다.": "This exercise is already added.",
    "운동은 최소 1개는 남겨야 합니다.": "Keep at least one exercise.", "진행 중": "In progress", "지난 기록: 아직 없음": "Previous: None",
    "기록 없음": "No workouts", "이번 달 기록이 아직 없습니다.": "No workouts logged this month.",
    "이 날짜를 선택한 상태로 아래에서 운동을 저장하면 여기에 들어옵니다.": "Workouts saved with this date selected will appear here.",
    "아직 게시글이 없습니다.": "No posts yet.", "첫 운동 인증을 남겨보세요.": "Share the first workout update.", "첫 글 작성하기": "Create first post",
    "댓글": "Comment", "신고": "Report", "차단": "Block", "차단 해제": "Unblock", "커뮤니티에서 숨김": "Hidden from Community",
    "차단 목록 확인 중": "Loading blocked users", "목록을 불러오지 못했습니다": "Could not load the list", "차단 목록이 비어 있습니다": "No blocked users",
    "사용자를 차단했습니다.": "User blocked.", "차단을 해제했습니다.": "User unblocked.", "댓글을 입력해주세요.": "Enter a comment.",
    "댓글은 120자까지 입력할 수 있습니다.": "Comments can be up to 120 characters.", "댓글 신고": "Report comment", "게시글 신고": "Report post",
    "이 댓글이 커뮤니티 운영 원칙에 맞지 않는 이유를 선택해주세요.": "Choose why this comment violates the Community rules.",
    "이 게시글이 커뮤니티 운영 원칙에 맞지 않는 이유를 선택해주세요.": "Choose why this post violates the Community rules.",
    "신고 사유를 선택하거나 입력해주세요.": "Choose or enter a reason.", "신고 사유는 500자까지 입력할 수 있습니다.": "Reports can be up to 500 characters.",
    "보내는 중...": "Sending...", "신고를 보냈습니다.": "Report sent.", "게시글 내용을 입력해주세요.": "Enter your post.",
    "게시글은 180자까지 입력할 수 있습니다.": "Posts can be up to 180 characters.", "게시글을 올렸습니다.": "Post published.",
    "목표 세트를 이미 채웠습니다.": "You have already completed the target sets.",
    "목표 세트 완료. 확인을 눌러 저장하세요.": "Target sets complete. Tap Save Workout to finish.", "휴식 완료": "Rest complete",
    "휴식 일시정지": "Pause rest timer", "휴식 다시 시작": "Restart rest timer", "휴식 계속": "Resume rest timer", "휴식 시작": "Start rest timer",
    "휴식 완료. 다음 세트를 시작하세요.": "Rest complete. Start your next set.",
    "닉네임을 저장했습니다.": "Nickname saved.", "닉네임은 7일에 한 번만 변경할 수 있습니다.": "You can change your nickname once every 7 days.",
    "피드백 내용을 입력해주세요.": "Enter your feedback.", "이의제기 내용을 입력해주세요.": "Enter your appeal.", "이의제기 보내기": "Submit appeal",
    "피드백을 보냈습니다.": "Feedback sent.", "이의제기를 보냈습니다.": "Appeal sent.",
    "올해도 수고하셨습니다.": "Year complete.", "마지막 기록까지 잘 마무리했습니다.": "Your final workout is logged.",
    "새해가 시작됐습니다.": "A new year begins.", "올해의 첫 기록을 깨봅시다.": "Set your first mark of the year.",
    "이번 달도 수고하셨습니다.": "Month complete.", "기록은 다음 달에도 이어집니다.": "Your progress carries into next month.",
    "새로운 달이 시작됐습니다.": "A new month begins.", "이번 달도 기록을 깨봅시다.": "Set a new mark this month.",
    "첫 기록을 완료했습니다": "First workout complete", "첫 운동 보상으로 레벨 2에 도달했습니다. 다음부터는 새로운 기록을 세울 때 경험치를 얻습니다.": "Your first-workout bonus brought you to Level 2. From now on, earn XP by setting new personal bests.",
    "레벨업": "Level up", "레벨 유지": "Level maintained",
    "아직 레벨·경험치 변동이 없습니다.": "No level or XP changes yet.", "같은 운동의 이전 볼륨을 넘으면 첫 레벨업이 기록됩니다.": "Beat your previous volume in the same exercise to record your first level-up.",
    "레벨 기록 불러오는 중...": "Loading level history...", "기록을 확인하고 있습니다.": "Checking your history.", "레벨 기록을 불러오지 못했습니다.": "Could not load level history.", "잠시 후 다시 열어주세요.": "Please try again shortly.",
    "운동 레벨에 표시할 닉네임과 시작 중량에 사용할 성별을 정하세요.": "Choose the nickname shown with your level and the gender used for suggested starting weights.",
    "닉네임 변경은 7일에 한 번만 가능합니다.": "You can change your nickname once every 7 days.",
    "운동 데이터셋을 불러오지 못했습니다.": "Could not load the exercise dataset.", "요청에 실패했습니다.": "Request failed.",
    "저장 중": "Saving", "저장 중...": "Saving...", "처리 중...": "Processing...", "작성 중...": "Posting...", "등록 중": "Posting",
    "계정에 안전하게 연결됨": "Safely linked to your account", "연결된 계정": "Linked account",
    "운동 기록이 계정에 안전하게 연결되어 있습니다. 다른 기기에서도 이어서 볼 수 있어요.": "Your workout history is safely linked and available on your other devices.",
    "로그인 후 설정할 수 있습니다.": "Sign in to change this setting.", "주간 운동 목표를 저장하지 못했습니다.": "Could not save the weekly workout goal.",
    "유효한 이메일을 입력해주세요.": "Enter a valid email address.", "비밀번호 확인이 일치하지 않습니다.": "Passwords do not match.",
    "이용약관에 동의해주세요.": "Agree to the Terms of Service.", "개인정보 처리방침에 동의해주세요.": "Agree to the Privacy Policy.",
    "기록이 계정에 안전하게 연결되었습니다.": "Your records are safely linked to your account.", "이미 등록된 이메일입니다.": "This email is already registered.",
    "계정 연결에 실패했습니다. 잠시 후 다시 시도해주세요.": "Could not link the account. Please try again.", "이메일과 비밀번호를 입력해주세요.": "Enter your email and password.",
    "계정 기록을 불러왔습니다.": "Account records loaded.", "로그인했습니다.": "Signed in.", "이메일 또는 비밀번호가 올바르지 않습니다.": "Incorrect email or password.",
    "로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.": "Too many sign-in attempts. Please try again later.",
    "새 사용자로 시작합니다. 기존 기록은 로그인하면 다시 불러올 수 있습니다.": "Starting as a new guest. Sign in again to retrieve your existing records.",
    "앱 데이터를 불러오지 못했습니다. 다시 시도해 주세요.": "Could not load app data. Please try again.",
    "성별을 선택해 주세요": "Choose a gender.", "닉네임에는 공백을 넣을 수 없습니다": "Nicknames cannot contain spaces.",
    "닉네임은 한글, 영문, 숫자, _ 조합 2~12자로 입력하세요": "Use 2–12 Korean or English letters, numbers, or underscores.",
    "비속어, 차별 표현 또는 사용할 수 없는 이름이 포함되어 있습니다": "This nickname contains prohibited, abusive, or discriminatory language.",
    "요청이 만료되었습니다. 페이지를 새로고침한 뒤 다시 시도해주세요.": "This request expired. Refresh the page and try again.",
    "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.": "Too many requests. Please try again later.",
    "비밀번호가 올바르지 않습니다.": "Incorrect password.", "계정 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.": "Could not delete the account. Please try again.",
    "계정과 연결 데이터가 삭제되었습니다.": "Your account and linked data were deleted.", "테스트 푸시 전송에 실패했습니다.": "Could not send the test notification.",
    "홈 화면 앱에서 알림을 켤 수 있습니다.": "Notifications are available from the installed app.", "알림 끄기": "Disable notifications",
    "매일 오전 11시에 운동 알림을 보냅니다.": "Workout reminders are sent every day at 11 AM.", "브라우저 설정에서 알림 허용이 필요합니다.": "Allow notifications in your browser settings.",
    "계정을 연결하면 기기를 바꿔도 운동 기록을 안전하게 이어갈 수 있습니다.": "Link an account to safely continue your workout history on another device.",
    "벤치, 로우, 스쿼트, 컬...": "Bench, row, squat, curl...", "예: 테스트": "e.g. Athlete", "의견을 자유롭게 적어주세요.": "Write your feedback.", "신고 사유를 적어주세요.": "Describe the issue.",
    "근육 강조 범례": "Muscle highlight legend", "근육 강조 전면": "Front muscle highlights", "근육 강조 후면": "Back muscle highlights", "이전 운동": "Previous exercise", "다음 운동": "Next exercise", "이 운동 건너뛰기": "Skip this exercise",
    "운동 기록을 삭제할까요?": "Delete this workout?", "삭제한 기록은 복구할 수 없습니다.": "Deleted workout data cannot be restored.",
    "Set Counter는 무료인가요?": "Is Set Counter free?", "네. 현재 Set Counter의 운동 기록, 달력, 레벨, 게시판 기능은 무료로 사용할 수 있습니다.": "Yes. Workout logging, Calendar, Levels, and Community are currently free to use.",
    "어떤 기기에서 사용할 수 있나요?": "Which devices are supported?", "최신 웹 브라우저가 설치된 휴대폰과 PC에서 사용할 수 있습니다. iPhone에서는 홈 화면에 추가하면 앱처럼 이용할 수 있습니다.": "You can use Set Counter on phones and computers with a modern web browser. On iPhone, add it to your Home Screen for an app-like experience.",
    "오프라인에서도 작동하나요?": "Does it work offline?", "이미 열어 본 화면 일부는 표시될 수 있지만, 운동 기록 저장과 게시판 등 주요 기능에는 인터넷 연결이 필요합니다.": "Some previously opened screens may remain visible, but saving workouts and using Community require an internet connection.",
    "어떤 운동을 기록할 수 있나요?": "Which exercises can I log?", "기본 운동을 선택하거나 운동 라이브러리에서 원하는 종목을 추가해 무게, 횟수와 세트를 기록할 수 있습니다.": "Choose a built-in exercise or add one from the library, then log weight, reps, and sets.",
    "세트는 어떻게 기록하나요?": "How do I log a set?", "무게와 이번 세트 횟수, 목표 세트를 정한 뒤 ‘이번 세트 완료’를 누르세요. 모든 세트가 끝나면 ‘기록 저장’을 누르면 됩니다.": "Set the weight, reps, and target sets, then tap Complete Set. Tap Save Workout when you are finished.",
    "레벨은 어떻게 올라가나요?": "How do levels work?", "이전 운동 기록을 경신하거나 누적 운동 볼륨 10,000kg 단위 목표를 달성하면 경험치를 얻습니다. 누적 경험치가 기준에 도달하면 레벨이 올라갑니다.": "Earn XP by beating a previous workout or reaching each 10,000 kg total-volume milestone. Your level increases when your total XP reaches the next threshold.",
    "지난 기록은 어디에서 확인하나요?": "Where can I see previous workouts?", "달력에서 날짜를 선택하면 해당 날짜의 운동 종목, 세트, 횟수와 볼륨을 확인할 수 있습니다.": "Select a date in Calendar to view exercises, sets, reps, and volume for that day.",
    "운동 알림을 설정할 수 있나요?": "Can I set workout reminders?", "홈 화면의 운동 알림에서 알림을 켤 수 있습니다. iPhone은 홈 화면에 추가한 앱에서 알림 권한을 허용해야 합니다.": "Enable reminders from the notification section on Home. On iPhone, add the app to your Home Screen and allow notifications.",
    "운동 데이터는 어디에 저장되나요?": "Where is my workout data stored?", "운동 기록과 프로필은 서버 데이터베이스에 저장되며, 이 브라우저에 보관된 사용자 키로 내 기록을 불러옵니다.": "Workout history and profile data are stored in the server database. A user key stored in this browser is used to retrieve your records.",
    "기록이 부정행위로 감지되면 어떻게 하나요?": "What if a record is flagged?", "갑작스러운 큰 폭의 기록 증가 등 의심 패턴이 감지될 수 있습니다. 잘못 감지됐다면 표시되는 이의제기 창으로 운영자에게 알려주세요.": "Unusual patterns, such as a sudden large increase, may be flagged. If this happens by mistake, use the appeal dialog to contact the admin.",
    "어떤 경우에 이용이 제한되나요?": "When can access be restricted?",
    "시행일: 2026년 8월 8일": "Effective: August 8, 2026", "시행일: 2026년 8월 12일": "Effective: August 12, 2026", "수집하는 정보": "Information we collect", "이용 목적": "How we use information", "동의 거부": "Declining consent", "보관 및 보호": "Retention and protection", "외부 전송": "External processing", "쿠키와 기기 저장소": "Cookies and device storage", "문의": "Contact",
    "이용약관 및 커뮤니티 운영원칙": "Terms of Service and Community Guidelines", "에 동의합니다.": "I agree.",
    "게시글과 댓글을 작성하려면 이용약관 및 커뮤니티 운영원칙에 동의해주세요.": "Agree to the Terms of Service and Community Guidelines before posting or commenting.",
    "내 커뮤니티 피드 보호": "Protect your community feed", "차단한 사용자의 게시글과 댓글은 숨겨집니다. 신고 내역은 별도로 처리됩니다.": "Posts and comments from blocked users are hidden. Reports are handled separately.",
    "공개 개인정보 처리방침": "public Privacy Policy",
    "로그인 사용자는 앱의 내 정보에서 계정과 연계 데이터를 직접 삭제할 수 있습니다. 앱을 설치하지 않은 경우에도": "Signed-in users can delete their account and linked data from Profile. Without installing the app, you can also use the",
    "에서 삭제할 수 있습니다. 익명 사용자는 앱의 피드백 기능으로 열람·정정·삭제를 요청할 수 있습니다.": "to delete your data. Guests may request access, correction, or deletion through in-app feedback.",
    "에서 삭제할 수 있습니다. 익명 사용자는 앱의 피드백 기능으로 열람·정정·삭제·처리정지 또는 동의 철회를 요청할 수 있습니다. 적용되는 법률이 허용하는 경우 거주 지역의 개인정보 감독기관에 진정을 제기할 수 있습니다.": "to delete your data. Guests may request access, correction, deletion, restriction of processing, or withdrawal of consent through in-app feedback. Where applicable law provides, you may lodge a complaint with your local data protection authority.",
    "개인정보 열람·정정·삭제·처리정지 및 기타 문의는 앱의 ‘피드백 보내기’를 이용해 주세요. 이메일 문의:": "For requests to access, correct, delete, or restrict processing of personal information, and for other privacy questions, use Send Feedback in the app or email:",
    "욕설·괴롭힘·혐오 또는 차별 표현, 음란물, 광고·도배, 사칭, 개인정보 침해, 기록 조작, 서비스 방해나 제재 회피가 확인되면 위반 정도와 반복 여부에 따라 경고, 콘텐츠 삭제, 7일·14일·30일 이용정지 또는 계정 해지 조치가 적용될 수 있습니다. 중대한 위반은 즉시 제한될 수 있으며, 조치에 이의가 있으면 고객지원으로 재검토를 요청할 수 있습니다.": "Abuse, harassment, hate or discriminatory language, sexual content, spam, impersonation, privacy violations, record manipulation, service disruption, or evasion of enforcement may result in a warning, content removal, a 7-, 14-, or 30-day suspension, or account termination depending on severity and repetition. Serious violations may be restricted immediately. You may request a review through customer support.",
    "사용자 식별 키, 닉네임, 묶음 운동 시작 중량 설정을 위한 성별, 계정 이메일과 비밀번호 해시, 운동 날짜·종목·세트·무게·횟수·휴식시간, 주간 운동 목표, 레벨·경험치 이력과 통계, 게시글·댓글·좋아요·신고·차단 관계, 운영 조치 내역, 보안용 해시 식별값 및 알림 구독 정보를 처리합니다.": "We process your user key, nickname, gender used to set workout-plan starting weights, account email and password hash, workout dates, exercises, sets, weights, reps and rest times, weekly goals, level and XP history and statistics, posts, comments, likes, reports, blocked-user relationships, moderation actions, security hashes, and notification subscriptions.",
    "운동 기록 저장과 조회, 휴식 설정 복원, 주간 목표 확인, 레벨·경험치 계산, 게시판 운영, 신고 처리와 이용 제한, 운동 알림 제공, 부정 이용 방지 및 사용자 문의 처리를 위해 사용합니다.": "We use this information to save and retrieve workouts, restore rest settings, track weekly goals, calculate levels and XP, operate Community, handle reports and restrictions, deliver workout reminders, prevent abuse, and respond to support requests.",
    "계정 연결을 위한 개인정보 수집·이용 동의를 거부할 수 있습니다. 동의하지 않으면 이메일 계정 생성과 다른 기기에서의 계정 기록 불러오기는 이용할 수 없지만, 게스트로 운동 기록 기능을 이용할 수 있습니다.": "You may decline consent required to link an account. If you decline, you cannot create an email account or load account records on another device, but you can continue logging workouts as a guest.",
    "계정 데이터는 계정 삭제 시까지 보관하며, 삭제 요청이 완료되면 연계 데이터를 함께 삭제합니다. 사용자 식별 키는 브라우저에 저장되므로 브라우저 데이터를 지우면 기존 익명 기록 연결이 어려울 수 있습니다. 익명 기록 삭제는 피드백 보내기로 요청할 수 있습니다.": "Account data is retained until account deletion. Linked data is deleted when the request is completed. Because the user key is stored in your browser, clearing browser data may make existing guest records difficult to recover. Guests can request record deletion through Send Feedback.",
    "피드백이나 게시판 신고를 보내면 닉네임, 레벨, 사용자 ID, 신고 대상 정보와 작성 내용이 운영자 Discord 채널로 전송됩니다. 알림을 켜면 Web Push 서비스가 구독 정보를 처리하며, Render와 싱가포르 리전의 Neon 등 서버·데이터베이스 제공자가 암호화된 통신으로 서비스 데이터를 처리할 수 있습니다.": "When you submit feedback or a Community report, your nickname, level, user ID, reported-item details, and message are sent to the admin's Discord channel. If you enable notifications, a Web Push provider processes subscription details. Hosting and database providers, including Render and Neon in the Singapore region, may process Service data over encrypted connections.",
    "로그인 상태 유지를 위해 HttpOnly 세션 쿠키를 사용합니다. 기기에는 익명 사용자 식별 키, 화면 설정, 작성 중인 기록과 묶음 운동 진행 상태가 저장될 수 있으며 비밀번호는 저장하지 않습니다.": "We use an HttpOnly session cookie to keep you signed in. Your device may store a guest user key, display settings, draft workout data, and workout-plan progress. Passwords are not stored on the device.",
    "앱으로 돌아가기": "Back to app", "Set Counter로 돌아가기": "Back to Set Counter", "계정 삭제 페이지": "account deletion page",
    "Set Counter(North Star Labs, 이하 “서비스”)는 운동 기록 서비스 제공에 필요한 범위에서만 정보를 처리하며, 광고 SDK나 행동 추적용 분석 SDK를 사용하지 않습니다.": "Set Counter (North Star Labs, the “Service”) processes only the information needed to provide workout logging and does not use advertising SDKs or behavioral-tracking analytics SDKs.",
    "Set Counter(North Star Labs, 이하 “서비스”)는 운동 기록 서비스 제공에 필요한 범위에서만 정보를 처리하며, 광고 SDK나 행동 추적용 분석 SDK를 사용하지 않습니다. 개인정보를 판매하지 않으며 맞춤형 광고를 위한 제3자 제공이나 프로파일링을 하지 않습니다.": "Set Counter (North Star Labs, the “Service”) processes only the information needed to provide workout logging. We do not use advertising or behavioral-tracking SDKs, sell personal information, share it for targeted advertising, or profile users for advertising.",
    "1. 처리하는 정보": "1. Information we process", "2. 이용 목적": "2. Purposes of processing", "3. 동의 거부 권리와 영향": "3. Right to decline and its effects", "4. 보관 기간과 삭제": "4. Retention and deletion", "5. 처리 위탁과 국외 처리": "5. Service providers and international processing", "6. 이용자의 권리": "6. Your rights", "7. 쿠키와 기기 저장소": "7. Cookies and device storage", "8. 안전조치": "8. Security measures", "9. 개인정보 보호 문의": "9. Privacy contact", "10. 방침 변경": "10. Policy changes",
    "익명 사용 시: 브라우저에서 생성한 사용자 식별 키, 닉네임, 묶음 운동 시작 중량 설정을 위한 성별": "Guest use: a browser-generated user key, nickname, and gender used to set starting weights for workout plans",
    "계정 연결 시: 이메일 주소, 안전하게 해시 처리된 비밀번호, 로그인 세션 정보": "Account linking: email address, securely hashed password, and login session information",
    "서비스 이용 시: 운동 날짜, 종목, 세트, 무게, 횟수, 세트 간 휴식시간, 주간 운동 목표, 레벨·경험치 이력과 통계": "Service use: workout dates, exercises, sets, weights, reps, rest times, weekly goals, level and XP history, and statistics",
    "커뮤니티 이용 시: 게시글, 댓글, 좋아요, 신고 사유, 사용자 차단 관계 및 운영 조치 내역": "Community use: posts, comments, likes, report reasons, blocked-user relationships, and moderation actions",
    "알림 사용 시: Web Push 구독 주소와 암호화 키": "Notifications: Web Push subscription endpoints and encryption keys",
    "피드백 전송 시: 닉네임, 레벨, 사용자 ID 및 작성 내용": "Feedback: nickname, level, user ID, and submitted message",
    "보안 처리 시: 마지막 접속·로그인 시각, 로그인 시도 제한을 위해 IP 주소·이메일을 HMAC 해시 처리한 식별값과 제한 상태": "Security: last access and login times, HMAC-hashed identifiers derived from IP addresses and emails for rate limiting, and restriction status",
    "운동 기록 저장과 조회, 세트 간 휴식 설정 복원, 주간 목표 진행 확인, 통계·레벨·경험치 계산, 기기 간 기록 연결, 커뮤니티 운영과 안전 기능, 신고 처리와 이용 제한, 부정 이용 방지, 운동 알림 제공 및 사용자 문의 처리에 사용합니다.": "We use this information to store and retrieve workouts, restore rest settings, track weekly goals, calculate statistics, levels and XP, link records across devices, operate community safety features, handle reports and restrictions, prevent abuse, deliver workout reminders, and respond to support requests.",
    "이용자는 계정 연결에 필요한 개인정보 수집·이용 동의를 거부할 수 있습니다. 다만 동의하지 않으면 이메일 계정을 만들거나 다른 기기에서 계정 기록을 불러올 수 없습니다. 계정을 연결하지 않고 익명 사용자로 운동 기록 기능을 이용할 수 있습니다.": "You may decline consent to the collection and use of information required to link an account. If you decline, you cannot create an email account or load account records on another device, but you may continue logging workouts as a guest.",
    "계정 데이터는 사용자가 계정을 삭제할 때까지 보관합니다. 계정 삭제가 완료되면 운동 기록을 포함한 계정 연계 데이터가 삭제됩니다. 법령상 보존 의무나 보안상 정당한 사유가 있는 정보는 해당 목적과 기간을 별도로 안내한 뒤 제한적으로 보관할 수 있습니다.": "Account data is retained until you delete your account. When deletion is complete, linked data, including workout history, is deleted. Information subject to a legal retention duty or a legitimate security need may be retained on a limited basis after the purpose and period are disclosed.",
    "로그인 시도 제한을 위한 해시 식별값은 마지막 갱신 후 최대 7일 동안 보관하고 정리합니다. 계정 삭제 처리 과정에서 생성되는 최소한의 보안 기록은 부정 이용 방지와 분쟁 대응에 필요한 범위에서만 분리 보관한 뒤 파기합니다.": "Hashed identifiers used for login rate limiting are retained for up to seven days after their last update. Minimal security records created during account deletion are kept separately only as necessary to prevent abuse and resolve disputes, then destroyed.",
    "익명 기록은 사용자 식별 키와 연결됩니다. 브라우저 데이터를 지우면 해당 키를 다시 확인할 수 없어 기존 익명 기록에 접근하기 어려울 수 있습니다.": "Guest records are linked to a user key. Clearing browser data may remove that key and make existing guest records difficult to access.",
    "익명 사용자는 앱의 ‘피드백 보내기’를 통해 익명 기록 삭제를 요청할 수 있습니다. 요청을 보낼 때 앱이 함께 전달하는 사용자 ID를 기준으로 본인 기록을 확인하고 처리합니다.": "Guests may request deletion of guest records through Send Feedback. We identify and process the request using the user ID submitted by the app.",
    "국외 처리를 원하지 않으면 계정을 연결하지 않고 익명으로 이용하거나, 선택 기능인 피드백·신고·알림을 사용하지 않을 수 있습니다. 다만 서버와 데이터베이스 처리를 거부하면 계정 연결 및 서버 기록 기능을 제공할 수 없습니다.": "If you do not want optional international processing, you may remain a guest and avoid feedback, reporting, and notification features. Refusing server and database processing means account linking and server-backed records cannot be provided.",
    "국외 전송은 사용자가 계정 연결, 서버 기록, 피드백, 신고 또는 알림 기능을 사용할 때 암호화된 네트워크를 통해 이루어집니다. 국외 처리를 원하지 않으면 계정을 연결하지 않고 익명으로 이용하거나, 선택 기능인 피드백·신고·알림을 사용하지 않을 수 있습니다. 다만 서버와 데이터베이스 처리를 거부하면 계정 연결 및 서버 기록 기능을 제공할 수 없습니다.": "International transfers occur over encrypted connections when you use account linking, server-backed records, feedback, reporting, or notifications. You may remain a guest and avoid optional feedback, reporting, and notification features. Refusing server and database processing means account linking and server-backed records cannot be provided.",
    "Render Services, Inc.: 미국 등 국외 서버에서 웹 서비스 요청과 계정·운동 기록을 호스팅합니다. 서비스 이용 중 암호화된 네트워크를 통해 전송되며, 계정 삭제 또는 위탁 계약 종료 시까지 처리됩니다.": "Render Services, Inc.: Hosts web requests and account and workout records on servers outside Korea, including in the United States. Data is transmitted over encrypted connections while you use the Service and processed until account deletion or termination of the service-provider agreement.",
    "Neon, Inc.: 싱가포르 리전의 국외 데이터베이스에서 계정·운동·커뮤니티 데이터를 저장합니다. 서비스 이용 중 암호화된 네트워크를 통해 전송되며, 계정 삭제 또는 위탁 계약 종료 시까지 처리됩니다.": "Neon, Inc.: Stores account, workout, and Community data in a database hosted in the Singapore region. Data is transmitted over encrypted connections while you use the Service and processed until account deletion or termination of the service-provider agreement.",
    "Discord Inc.: 사용자가 피드백 또는 게시판 신고를 직접 전송할 때 닉네임, 레벨, 사용자 ID, 신고 대상 정보와 작성 내용이 미국 등 국외의 운영자 채널로 전송됩니다. 접수 내용은 처리 완료 후 운영상 필요한 기간 동안 보관한 뒤 삭제합니다.": "Discord Inc.: When you submit feedback or a Community report, your nickname, level, user ID, reported-item details, and message are sent to the operator's channel outside Korea, including in the United States. Submissions are retained only for the operational period needed after handling, then deleted.",
    "브라우저 푸시 서비스 제공자: 사용자가 알림을 켠 경우 구독 주소와 암호화 키를 알림 전달에 사용하며, 구독 해제 또는 계정 삭제 시까지 처리합니다.": "Browser push providers: If you enable notifications, subscription endpoints and encryption keys are used to deliver them until you unsubscribe or delete your account.",
    "로그인 사용자는 앱의 내 정보에서 계정과 연계 데이터를 직접 삭제할 수 있습니다. 앱을 설치하지 않은 경우에도 계정 삭제 페이지에서 삭제할 수 있습니다. 익명 사용자는 앱의 피드백 기능으로 열람·정정·삭제를 요청할 수 있습니다.": "Signed-in users can delete their account and linked data from Profile. You can also use the account deletion page without installing the app. Guests may request access, correction, or deletion through in-app feedback.",
    "로그인 사용자는 앱의 내 정보에서 계정과 연계 데이터를 직접 삭제할 수 있습니다. 앱을 설치하지 않은 경우에도 계정 삭제 페이지에서 삭제할 수 있습니다. 익명 사용자는 앱의 피드백 기능으로 열람·정정·삭제·처리정지 또는 동의 철회를 요청할 수 있습니다. 적용되는 법률이 허용하는 경우 거주 지역의 개인정보 감독기관에 진정을 제기할 수 있습니다.": "Signed-in users can delete their account and linked data from Profile or the public account deletion page. Guests may request access, correction, deletion, restriction of processing, or withdrawal of consent through in-app feedback. Where applicable law provides, you may lodge a complaint with your local data protection authority.",
    "로그인 상태 유지를 위해 HttpOnly 세션 쿠키를 사용합니다. 브라우저 또는 앱의 로컬 저장소에는 익명 사용자 식별 키, 화면 설정, 작성 중인 운동 기록과 묶음 운동 진행 상태가 저장될 수 있습니다. 비밀번호는 로컬 저장소에 저장하지 않습니다.": "We use an HttpOnly session cookie to keep you signed in. Browser or app storage may contain a guest user key, display settings, draft workout data, and workout-plan progress. Passwords are never stored in local storage.",
    "비밀번호 원문을 저장하지 않으며, HTTPS 통신, HttpOnly 세션 쿠키, CSRF 검증, 접근 제한 및 로그인 시도 제한을 적용합니다.": "We do not store plaintext passwords. We use HTTPS, HttpOnly session cookies, CSRF validation, access controls, and login rate limiting.",
    "처리자 및 개인정보 보호 담당자: North Star Labs · 서비스: Set Counter": "Controller and privacy contact: North Star Labs · Service: Set Counter",
    "10. 언어, 적용 지역 및 방침 변경": "10. Language, regional availability, and policy changes",
    "번역본은 이용자의 이해를 돕기 위해 제공합니다. 번역본과 한국어 원문이 다르면 한국어 원문을 기준으로 하되, 이용자의 거주 지역에 강제로 적용되는 개인정보 보호법과 소비자 보호 권리는 우선합니다. 특정 언어를 제공한다는 사실만으로 해당 언어가 사용되는 모든 국가에서 서비스를 제공하거나 현지 출시 요건을 충족했다는 뜻은 아닙니다.": "Translations are provided for convenience. If a translation differs from the Korean original, the Korean version controls, except where mandatory privacy or consumer-protection rights in your region apply. Offering a language does not mean the Service is offered in every country where that language is used or that local launch requirements have been met.",
    "처리 항목, 목적 또는 외부 처리 방식이 중요한 수준으로 변경되면 시행 전에 앱 또는 공개 정책 페이지를 통해 알립니다. 계정 연결 시 동의한 약관·처리방침의 버전과 동의 시각을 계정 기록에 저장합니다.": "We will provide notice in the app or on the public policy page before material changes to processed information, purposes, or external processing take effect. When an account is linked, we store the accepted Terms and Privacy Policy versions and the acceptance time in the account record.",
    "1. 서비스의 목적": "1. Purpose of the Service", "2. 계정과 기록": "2. Accounts and records", "3. 운동 정보 안내": "3. Workout information", "4. 금지 행위와 커뮤니티 이용": "4. Prohibited conduct and Community", "5. 이용 제한과 계약 해지": "5. Restrictions and termination", "6. 서비스 변경과 중단": "6. Service changes and interruption", "7. 계정 삭제": "7. Account deletion", "8. 책임의 범위": "8. Scope of responsibility", "9. 약관 변경과 준거": "9. Changes and governing law",
    "Set Counter는 운동 세트 기록, 통계, 달력 및 운동 커뮤니티 기능을 제공하는 개인 운동 기록 서비스입니다.": "Set Counter is a personal workout log that provides set tracking, statistics, a calendar, and Community features.",
    "서비스는 만 18세 이상 사용자를 대상으로 합니다. 사용자는 익명으로 서비스를 이용하거나 이메일 계정을 연결할 수 있습니다. 사용자는 정확한 정보를 입력하고 계정 비밀번호를 안전하게 관리해야 합니다. 타인의 계정이나 사용자 식별 키를 허가 없이 사용해서는 안 됩니다.": "The Service is intended for users aged 18 or older. You may use it as a guest or link an email account. You must provide accurate information, keep your password secure, and never use another person's account or user key without permission.",
    "앱의 운동 설명과 추천은 일반적인 기록 보조 정보이며 의료 진단이나 전문적인 운동 처방이 아닙니다. 통증, 질환 또는 부상 우려가 있는 경우 운동을 중단하고 적절한 전문가의 도움을 받아야 합니다.": "Exercise descriptions and recommendations are general logging aids, not medical advice or professional exercise prescriptions. Stop exercising and seek appropriate professional help if you have pain, a medical condition, or an injury concern.",
    "사용자는 욕설·모욕·괴롭힘·혐오 또는 차별 표현, 성적·폭력적 콘텐츠, 불법 정보, 광고·도배, 사칭, 개인정보 침해, 타인의 권리 침해, 기록 조작, 서비스 운영 방해, 비정상적인 접근이나 보안 우회 및 제재 회피 행위를 해서는 안 됩니다.": "You must not engage in abuse, insults, harassment, hate or discrimination; sexual or violent content; illegal information; spam or advertising; impersonation; privacy or rights violations; record manipulation; service disruption; unauthorized access; security bypasses; or evasion of enforcement.",
    "게시글이나 댓글을 작성하기 전에 이용약관과 커뮤니티 운영원칙에 동의해야 합니다. 사용자는 욕설·모욕·괴롭힘·혐오 또는 차별 표현, 성적·폭력적 콘텐츠, 아동 착취 또는 학대 콘텐츠, 불법 정보, 광고·도배, 사칭, 개인정보 침해, 타인의 권리 침해, 기록 조작, 서비스 운영 방해, 비정상적인 접근이나 보안 우회 및 제재 회피 행위를 해서는 안 됩니다.": "Before posting or commenting, you must accept the Terms of Service and Community Guidelines. You must not post abuse, harassment, hate or discrimination; sexual or violent content; child exploitation or abuse material; illegal content; spam or advertising; impersonation; privacy or rights violations; manipulated records; service disruption; unauthorized access; security bypasses; or evasion of enforcement.",
    "사용자는 신고와 사용자 차단 기능을 이용할 수 있습니다. 운영자는 신고 내용, 게시물의 맥락, 반복 여부와 피해 정도를 확인하여 콘텐츠의 노출을 제한하거나 삭제할 수 있습니다.": "You may use reporting and blocking tools. The operator may limit visibility or remove content after reviewing the report, context, repetition, and severity of harm.",
    "금지 행위가 확인되면 위반의 내용, 횟수 및 피해 정도에 따라 경고, 콘텐츠 삭제, 커뮤니티 기능 제한, 계정 이용정지 또는 이용계약 해지 조치를 할 수 있습니다. 일시적인 이용정지는 원칙적으로 7일, 14일 또는 30일 단위로 적용하며, 반복 위반 시 기간을 늘리거나 이용계약을 해지할 수 있습니다.": "If prohibited conduct is confirmed, we may issue a warning, remove content, restrict Community features, suspend an account, or terminate the agreement based on the nature, frequency, and severity of the violation. Temporary suspensions are generally applied for 7, 14, or 30 days and may be extended, or the agreement terminated, for repeated violations.",
    "불법행위, 타인에 대한 중대한 위협, 개인정보 침해, 계정 탈취, 시스템 공격, 반복적인 제재 회피처럼 긴급하거나 중대한 사유가 있으면 사전 경고 없이 즉시 이용을 제한하거나 계약을 해지할 수 있습니다.": "Access may be restricted or the agreement terminated immediately without prior warning for urgent or serious conduct, including illegal activity, serious threats, privacy violations, account theft, system attacks, or repeated evasion of enforcement.",
    "운영자는 원칙적으로 조치 사유, 범위 및 기간을 앱 알림이나 계정에 연결된 연락 수단으로 안내합니다. 긴급 조치를 먼저 한 경우에는 가능한 범위에서 사후 안내합니다. 사용자는 고객지원 이메일 또는 앱의 피드백 기능으로 이의를 제기할 수 있으며, 운영자는 관련 자료를 다시 검토합니다.": "As a rule, the operator will explain the reason, scope, and duration of an action through an in-app notice or an account-linked contact method. If urgent action must be taken first, notice will be provided afterward where possible. You may appeal by support email or in-app feedback, and the operator will review the relevant information again.",
    "보안, 장애 대응, 기능 개선 또는 운영상 필요한 경우 서비스 일부를 변경하거나 일시 중단할 수 있습니다. 중요한 변경은 앱 또는 공개 정책 페이지를 통해 안내합니다.": "Parts of the Service may be changed or temporarily suspended for security, incident response, improvements, or operational needs. Material changes will be announced in the app or on the public policy page.",
    "사용자는 언제든 앱의 내 정보 또는 계정 삭제 페이지에서 계정 삭제를 요청할 수 있습니다. 삭제가 완료되면 복구할 수 없습니다.": "You may request account deletion at any time from Profile or the account deletion page. Deleted data cannot be recovered.",
    "사용자의 운동 수행, 기기 또는 네트워크 문제, 사용자의 계정 관리 부주의로 발생한 손해에 대해 서비스가 통제할 수 없는 범위까지 책임을 부담하지 않습니다. 관련 법령상 배제할 수 없는 책임은 제외됩니다.": "The Service is not responsible beyond its reasonable control for harm arising from exercise performance, device or network issues, or inadequate account security. This does not exclude liability that cannot legally be excluded.",
    "약관이 중요한 수준으로 변경되면 시행 전에 앱 또는 공개 정책 페이지를 통해 알립니다. 서비스와 관련된 사항에는 대한민국 법령을 적용하며, 분쟁은 관련 법령이 정한 절차와 관할에 따릅니다.": "Material changes to these Terms will be announced in the app or on the public policy page before taking effect. The laws of the Republic of Korea govern the Service, and disputes follow the procedures and jurisdiction provided by applicable law.",
    "10. 언어와 지역별 적용": "10. Language and regional application",
    "번역본은 이용자의 이해를 돕기 위해 제공합니다. 번역본과 한국어 원문이 다르면 한국어 원문을 기준으로 하되, 이용자의 거주 지역에 강제로 적용되는 소비자 보호법과 개인정보 보호법은 우선합니다. 서비스는 관련 법령과 스토어 배포 요건을 충족한 국가 또는 지역에서만 제공될 수 있습니다.": "Translations are provided for convenience. If a translation differs from the Korean original, the Korean version controls, except where mandatory consumer or privacy law in your region applies. The Service may be offered only in countries or regions where applicable law and store-distribution requirements are met.",
    "사용자는 언제든 앱의 내 정보 또는": "You may request account deletion at any time from Profile or the",
    "에서 계정 삭제를 요청할 수 있습니다. 삭제가 완료되면 복구할 수 없습니다.": ". Deleted data cannot be recovered.",
    "Set Counter 계정 삭제": "Delete Set Counter account", "계정 삭제가 완료되었습니다": "Account deleted", "새 익명 기록으로 시작": "Start fresh as a guest", "삭제되는 정보": "Data that will be deleted", "계정 이메일": "Account email", "삭제 후 데이터를 복구할 수 없음을 확인했습니다.": "I understand that deleted data cannot be recovered.", "계정과 데이터 영구 삭제": "Permanently delete account and data",
    "앱을 설치하지 않은 상태에서도 이 페이지에서 계정과 연결 데이터를 직접 삭제할 수 있습니다.": "You can delete your account and linked data directly from this page without installing the app.",
    "이메일 계정, 닉네임, 운동·세트 기록, 레벨·통계, 게시글·댓글·좋아요·신고·차단 관계 및 푸시 구독": "Email account, nickname, workout and set history, levels and statistics, posts, comments, likes, reports, blocks, and push subscriptions",
    "이메일 계정과 연결된 운동 기록, 커뮤니티 활동 및 푸시 구독을 삭제했습니다. 삭제된 데이터는 복구할 수 없습니다.": "Workout records, Community activity, and push subscriptions linked to the email account have been deleted. Deleted data cannot be recovered."
  };

  const EXERCISES = {
    "숄더 프레스": "Shoulder Press", "사이드 레터럴 레이즈": "Side Lateral Raise", "중량가방 푸쉬업": "Weighted Backpack Push-Up",
    "덤벨 컬": "Dumbbell Curl", "해머 컬": "Hammer Curl", "고블릿 스쿼트": "Goblet Squat", "덤벨 로우": "Dumbbell Row",
    "벤치프레스": "Bench Press", "덤벨 힙": "Dumbbell Hip Thrust", "무게판 추감기": "Wrist Roller", "추감기(리버스)": "Reverse Wrist Roller",
    "덤벨 루마니안 데드리프트": "Dumbbell Romanian Deadlift", "푸쉬업": "Push-Up", "원암 덤벨 로우": "One-Arm Dumbbell Row",
    "덤벨 숄더 프레스": "Dumbbell Shoulder Press", "바벨 벤치프레스": "Barbell Bench Press", "인클라인 바벨 벤치프레스": "Incline Barbell Bench Press",
    "로프 트라이셉스 푸쉬다운": "Rope Triceps Pushdown", "와이드 그립 랫풀다운": "Wide-Grip Lat Pulldown", "벤트오버 바벨 로우": "Bent-Over Barbell Row",
    "시티드 케이블 로우": "Seated Cable Row", "페이스 풀": "Face Pull", "바벨 백 스쿼트": "Barbell Back Squat",
    "루마니안 데드리프트": "Romanian Deadlift", "바벨 힙 쓰러스트": "Barbell Hip Thrust", "바벨 워킹 런지": "Barbell Walking Lunge",
    "덤벨 카프 레이즈": "Dumbbell Calf Raise", "암 서클": "Arm Circles", "다이내믹 가슴 스트레칭": "Dynamic Chest Stretch",
    "가벼운 푸쉬업": "Easy Push-Up", "가슴 스트레칭": "Chest Stretch", "삼두근 스트레칭": "Triceps Stretch", "밴드 풀 어파트": "Band Pull-Apart",
    "스캡 풀업": "Scapular Pull-Up", "등 스트레칭": "Upper-Back Stretch", "이두근 스트레칭": "Biceps Stretch", "가벼운 걷기": "Easy Walk",
    "월드 그레이티스트 스트레칭": "World's Greatest Stretch", "맨몸 스쿼트": "Bodyweight Squat", "느린 걷기": "Slow Walk",
    "햄스트링 스트레칭": "Hamstring Stretch", "빠른 걷기": "Brisk Walk"
  };

  const PATTERNS = [
    [/^(\d+)개 완료$/, "$1 complete"], [/^(\d+)개 선택$/, "$1 selected"], [/^(\d+)개 운동$/, "$1 exercises"],
    [/^(\d+)세트$/, "$1 sets"], [/^(\d+)회$/, "$1 reps"], [/^주 (\d+)회$/, "$1 workouts/week"],
    [/^이번 주 (\d+)회 운동$/, "$1 workouts this week"], [/^목표까지 (\d+)회$/, "$1 workouts to go"],
    [/^휴식 (\d+)초$/, "Rest $1 sec"], [/^누적 경험치 ([\d,]+)$/, "$1 total XP"], [/^(\d+)건$/, "$1 entries"],
    [/^휴식 시간 (\d+)초 남음$/, "$1 seconds of rest remaining"], [/^이번 세트 완료, (\d+)\/(\d+)세트 완료$/, "Complete set, $1 of $2 sets complete"],
    [/^오늘: ([^·]+) · (\d+)회 완료 · 볼륨 ([^·]+) · (\d+)세트는 (\d+)회$/, "Today: $1 · $2 reps complete · $3 volume · Set $4: $5 reps"],
    [/^(\d+)회 완료$/, "$1 reps completed"], [/^(\d+)세트는 (\d+)회$/, "Set $1: $2 reps"], [/^볼륨 (.+)$/, "Volume $1"],
    [/^(\d+)세트\s+(.+?)\s+(\d+)회$/, "Set $1 · $2 · $3 reps"],
    [/^(\d+)세트 · 최고 ([\d,.]+)kg × ([\d,]+)회$/, "$1 sets · Best $2kg × $3 reps"],
    [/^(\d+)세트 · 총 ([\d,]+)회$/, "$1 sets · $2 total reps"],
    [/^지난 기록: (.+)$/, "Previous: $1"], [/^오늘: (.+)$/, "Today: $1"], [/^(\d+)세트 · (.+)$/, "$1 sets · $2"],
    [/^(.+) 레벨 (\d+)$/, "$1 level $2"], [/^레벨 (\d+)$/, "Level $1"], [/^LV\.(\d+) 달성$/, "LV.$1 unlocked"],
    [/^(.+)부터 이어 할 수 있습니다\. 지난 진행을 이어 하시겠습니까\?$/, "Resume from $1?"],
    [/^(.+) 시작$/, "Start $1"], [/^(\d+)월$/, "$1"], [/^(\d+)일$/, "$1"],
    [/^(.+) 추가$/, "Add $1"], [/^추가 완료 · (.+)$/, "$1 added"], [/^더 보기 \((\d+)개 남음\)$/, "Show more ($1 remaining)"],
    [/^좌우 (.+)$/, "$1 each side"], [/^(\d+)세트 · (\d+)-(\d+)회$/, "$1 sets · $2–$3 reps"]
    ,[/^(\d+)분 전$/, "$1 min ago"], [/^(\d+)시간 전$/, "$1 hr ago"], [/^(\d+)일 전$/, "$1 days ago"], [/^방금 전$/, "Just now"],
    [/^누적 ([\d,]+) XP · 신기록 (\d+)회 · 레벨다운 (\d+)회$/, "$1 total XP · $2 personal bests · $3 level-downs"],
    [/^최고 레벨 달성 · 누적 ([\d,]+) XP$/, "Max level reached · $1 total XP"],
    [/^신기록 달성 · \+([\d,]+) XP$/, "Personal best · +$1 XP"], [/^([\d,]+) XP 차감 · 레벨 하락$/, "$1 XP deducted · Level decreased"],
    [/^([\d,]+) XP 차감 · 레벨 유지$/, "$1 XP deducted · Level maintained"], [/^(\d+)건$/, "$1 entries"],
    [/^(\d+)회 · (\d+)세트 · (.+)$/, "$1 workouts · $2 sets · $3"], [/^(\d+)종목 · (.+)$/, "$1 exercises · $2"],
    [/^(.+) 기록 삭제$/, "Delete $1 workout"], [/^(.+) 기록을 삭제하면 세트와 통계에서도 사라집니다\.$/, "Deleting $1 will also remove its sets and statistics."],
    [/^(\d{4}-\d{2}-\d{2}) 기록 날짜로 선택했습니다\.$/, "$1 selected as the workout date."],
    [/^(\d{4}-\d{2}-\d{2}) 운동 기록을 저장했습니다\.$/, "Workout saved for $1."], [/^(\d{4}-\d{2}-\d{2}) SOS를 저장했습니다\.$/, "SOS saved for $1."],
    [/^주 (\d+)회 운동 목표를 저장했습니다\.$/, "Weekly goal set to $1 workouts."], [/^현재 경험치 (\d+)% · 누적 ([\d,]+) XP$/, "Current XP $1% · $2 total XP"]
  ];

  const SKIP_SELECTOR = [
    "script", "style", "code", "pre", "[data-i18n-skip]",
    ".board-post-content", ".board-comment-body", ".nickname-text", ".account-email", ".calendar-excuse-item p", "#sosStatus", "[data-user-content]"
  ].join(",");

  const TARGET_LOCALE = window.SetCounterLocaleData?.[current] || { strings: {}, patterns: {} };
  const patternRegexCache = new Map();

  function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function translatedPatternRegex(template) {
    if (patternRegexCache.has(template)) return patternRegexCache.get(template);
    let cursor = 0;
    let source = "^";
    for (const match of template.matchAll(/\$(\d+)/g)) {
      source += escapeRegex(template.slice(cursor, match.index));
      source += "(.+?)";
      cursor = match.index + match[0].length;
    }
    source += `${escapeRegex(template.slice(cursor))}$`;
    const regex = new RegExp(source);
    patternRegexCache.set(template, regex);
    return regex;
  }

  function translateTarget(value) {
    if (current === "en") return value;
    const direct = TARGET_LOCALE.strings?.[value];
    if (direct) return direct;
    if (value.includes(" · ")) {
      const parts = value.split(" · ");
      const translated = parts.map((part) => translateTarget(part));
      if (translated.some((part, index) => part !== parts[index])) return translated.join(" · ");
    }
    const patterns = Object.entries(TARGET_LOCALE.patterns || {}).sort((left, right) => right[0].length - left[0].length);
    for (const [template, replacement] of patterns) {
      const pattern = translatedPatternRegex(template);
      const match = value.match(pattern);
      if (!match) continue;
      const translated = replacement.replace(/\$(\d+)/g, (token, index) => {
        const captured = match[Number(index)];
        if (captured == null || captured === value) return captured ?? token;
        return translateTarget(captured);
      });
      if (translated !== value) return translated;
    }
    if (value.includes(", ")) {
      const parts = value.split(", ");
      const translated = parts.map((part) => translateTarget(part));
      if (translated.every((part, index) => part !== parts[index])) return translated.join(", ");
    }
    return value;
  }

  function translateText(value) {
    const text = String(value ?? "");
    if (current === "ko" || !text) return text;
    if (EN[text]) return translateTarget(EN[text]);
    if (EXERCISES[text]) return translateTarget(EXERCISES[text]);
    for (const [pattern, replacement] of PATTERNS) {
      if (pattern.test(text)) return translateTarget(text.replace(pattern, replacement));
    }
    if (text.includes(" · ")) {
      const translatedParts = text.split(" · ").map((part) => EN[part] || EXERCISES[part] || part);
      if (translatedParts.some((part, index) => part !== text.split(" · ")[index])) return translateTarget(translatedParts.join(" · "));
    }
    return translateTarget(text);
  }

  function translateTextNode(node) {
    if (!node?.parentElement || node.parentElement.closest(SKIP_SELECTOR)) return;
    const raw = node.nodeValue;
    const trimmed = raw.trim();
    if (!trimmed) return;
    const translated = translateText(trimmed);
    if (translated === trimmed) return;
    const start = raw.match(/^\s*/)?.[0] || "";
    const end = raw.match(/\s*$/)?.[0] || "";
    node.nodeValue = `${start}${translated}${end}`;
  }

  function translateElement(element) {
    if (!(element instanceof Element) || element.matches(SKIP_SELECTOR)) return;
    for (const target of [element, ...element.querySelectorAll("*")]) {
      if (target.matches(SKIP_SELECTOR)) continue;
      for (const attr of ["placeholder", "aria-label", "title"]) {
        if (!target.hasAttribute(attr)) continue;
        const value = target.getAttribute(attr);
        const translated = translateText(value);
        if (translated !== value) target.setAttribute(attr, translated);
      }
    }
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) translateTextNode(node);
  }

  function translateTree(root = document.body) {
    if (current === "ko" || !root) return;
    if (root.nodeType === Node.TEXT_NODE) translateTextNode(root);
    else translateElement(root);
  }

  function setLocale(locale) {
    if (!SUPPORTED.has(locale) || locale === current) return;
    window.localStorage.setItem(STORAGE_KEY, locale);
    window.location.reload();
  }

  function bindControls() {
    document.querySelectorAll("[data-language]").forEach((button) => {
      const active = button.dataset.language === current;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
      button.addEventListener("click", () => setLocale(button.dataset.language));
    });
  }

  function init() {
    document.documentElement.lang = current;
    document.title = translateText(document.title);
    bindControls();
    translateTree(document.body);
    if (current === "ko") return;
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "characterData") translateTextNode(mutation.target);
        if (mutation.type === "attributes") {
          const attr = mutation.attributeName;
          const value = mutation.target.getAttribute(attr);
          const translated = translateText(value);
          if (translated !== value) mutation.target.setAttribute(attr, translated);
        }
        mutation.addedNodes.forEach((node) => translateTree(node));
      }
    });
    observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["placeholder", "aria-label", "title"] });
  }

  window.SetCounterI18n = {
    locale: () => current,
    // Dynamic renderers use their complete English copy as the source for every
    // non-Korean locale; the DOM translator then applies the selected language.
    isEnglish: () => current !== "ko",
    isKorean: () => current === "ko",
    isInternational: () => current !== "ko",
    dateLocale: () => ({ ko: "ko-KR", en: "en-US", ja: "ja-JP", es: "es-ES", zh: "zh-CN", ru: "ru-RU" }[current] || "en-US"),
    t: translateText,
    exerciseName: (value) => current === "ko" ? value : translateText(EXERCISES[value] || value),
    setLocale,
    translateTree,
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
}());
