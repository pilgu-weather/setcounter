"""Generate Korean-pronunciation display names for free-exercise-db.

This is a build-time helper only. The generated JSON is consumed by the app.
Every source token must be reviewed in WORD_OVERRIDES so regeneration stays
deterministic and does not require a network service or pronunciation package.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "static" / "data" / "free-exercise-db"
SOURCE_PATH = DATA_DIR / "exercises.json"
OUTPUT_PATH = DATA_DIR / "ko_exercise_pronunciation_map.json"


WORD_OVERRIDES = {
    "a": "어", "ab": "앱", "above": "어버브", "acceleration": "액셀러레이션",
    "achilles": "아킬레스", "across": "어크로스", "adduction": "어덕션",
    "adductions": "어덕션", "adductor": "어덕터", "advanced": "어드밴스드",
    "against": "어게인스트", "air": "에어", "all": "올", "alternate": "얼터네이트",
    "alternating": "얼터네이팅", "and": "앤드", "ankle": "앵클", "anterior": "앤티리어",
    "anti": "안티", "apart": "어파트", "arm": "암", "arms": "암", "arnold": "아놀드",
    "around": "어라운드", "assisted": "어시스트", "atlas": "아틀라스", "attachment": "어태치먼트",
    "axle": "액슬", "back": "백", "backward": "백워드", "bag": "백", "balance": "밸런스",
    "ball": "볼", "band": "밴드", "bands": "밴드", "bar": "바", "barbell": "바벨",
    "battle": "배틀", "battling": "배틀링", "bear": "베어", "behind": "비하인드",
    "bell": "벨", "bench": "벤치", "bend": "벤드", "bends": "벤드", "bent": "벤트",
    "between": "비트윈", "biceps": "바이셉스", "bicycling": "바이시클링", "bike": "바이크",
    "block": "블록", "blocks": "블록", "board": "보드", "body": "바디", "bodyweight": "바디웨이트",
    "bosu": "보수", "bottoms": "바텀스", "bound": "바운드", "box": "박스",
    "brachialis": "브라키알리스", "bradford": "브래드포드", "bridge": "브리지",
    "bug": "버그", "butt": "버트", "butterfly": "버터플라이", "cable": "케이블",
    "calf": "카프", "calves": "카브스", "cambered": "캠버드", "car": "카",
    "carioca": "카리오카", "carry": "캐리", "cat": "캣", "catch": "캐치",
    "chain": "체인", "chains": "체인", "chair": "체어", "chest": "체스트",
    "childs": "차일즈", "chin": "친", "circle": "서클", "circles": "서클",
    "circus": "서커스", "clean": "클린", "climber": "클라이머", "climbers": "클라이머",
    "close": "클로즈", "cocoons": "코쿤", "concentration": "컨센트레이션",
    "cross": "크로스", "crossover": "크로스오버", "crunch": "크런치", "crunches": "크런치",
    "crusher": "크러셔", "cuban": "쿠반", "curl": "컬", "curls": "컬",
    "deadlift": "데드리프트", "deadlifts": "데드리프트", "decline": "디클라인",
    "diagonal": "다이애거널", "dip": "딥", "dips": "딥스", "drag": "드래그", "drags": "드래그",
    "driver": "드라이버", "drivers": "드라이버", "dumbbell": "덤벨", "dumbbells": "덤벨",
    "elbow": "엘보", "elbows": "엘보", "elevated": "엘리베이티드", "exercise": "엑서사이즈",
    "extended": "익스텐디드", "extension": "익스텐션", "extensions": "익스텐션",
    "external": "익스터널", "ez": "이지", "face": "페이스", "farmer": "파머", "farmers": "파머스",
    "feet": "피트", "finger": "핑거", "floor": "플로어", "fly": "플라이", "flyes": "플라이",
    "forward": "포워드", "four": "포어", "fours": "포어즈", "freehand": "프리핸드",
    "front": "프런트", "full": "풀", "glute": "글루트", "good": "굿", "goblet": "고블릿",
    "gravity": "그래비티", "grip": "그립", "groin": "그로인", "guillotine": "기요틴",
    "hack": "핵", "hammer": "해머", "hamstring": "햄스트링", "hand": "핸드", "hands": "핸즈",
    "hang": "행", "hanging": "행잉", "head": "헤드", "heel": "힐", "heels": "힐",
    "high": "하이", "hip": "힙", "hips": "힙", "hold": "홀드", "hop": "홉", "hops": "홉",
    "incline": "인클라인", "inner": "이너", "internal": "인터널", "iron": "아이언",
    "isometric": "아이소메트릭", "jackknife": "잭나이프", "jammer": "재머", "jerk": "저크",
    "judo": "유도", "jump": "점프", "jumping": "점핑", "keg": "케그", "kettlebell": "케틀벨",
    "kettlebells": "케틀벨", "kick": "킥", "kickback": "킥백", "kicks": "킥", "kipping": "키핑",
    "knee": "니", "kneeling": "닐링", "knees": "니즈", "landmine": "랜드마인", "lat": "랫",
    "lateral": "레터럴", "laterals": "레터럴", "leg": "레그", "legs": "레그", "lift": "리프트",
    "linear": "리니어", "locust": "로커스트", "log": "로그", "long": "롱", "low": "로우",
    "lower": "로어", "lunge": "런지", "lunges": "런지", "lying": "라잉", "machine": "머신",
    "manual": "매뉴얼", "medicine": "메디신", "medium": "미디엄", "military": "밀리터리",
    "mixed": "믹스드", "monster": "몬스터", "morning": "모닝", "mountain": "마운틴",
    "multiple": "멀티플", "muscle": "머슬", "neck": "넥", "oblique": "오블리크",
    "olympic": "올림픽", "on": "온", "one": "원", "over": "오버", "overhead": "오버헤드",
    "palms": "팜스", "pec": "펙", "plate": "플레이트", "plank": "플랭크", "pose": "포즈",
    "position": "포지션", "power": "파워", "powerlifting": "파워리프팅", "preacher": "프리처",
    "press": "프레스", "presses": "프레스", "pulldown": "풀다운", "pulldowns": "풀다운",
    "pulley": "풀리", "pull": "풀", "pullup": "풀업", "pullups": "풀업", "pullover": "풀오버",
    "push": "푸시", "pushdown": "푸시다운", "pushup": "푸시업", "pushups": "푸시업",
    "quad": "쿼드", "quick": "퀵", "raise": "레이즈", "raises": "레이즈", "rear": "리어",
    "release": "릴리스", "renegade": "레니게이드", "response": "리스폰스", "reverse": "리버스",
    "rocky": "로키", "rollout": "롤아웃", "roller": "롤러", "romanian": "루마니안",
    "rope": "로프", "ropes": "로프", "rotation": "로테이션", "rotations": "로테이션",
    "row": "로우", "rowing": "로잉", "rows": "로우", "run": "런", "runner": "러너",
    "running": "러닝", "russian": "러시안", "sandbag": "샌드백", "scaption": "스캡션",
    "scissor": "시저", "seated": "시티드", "single": "싱글", "sit": "싯", "skater": "스케이터",
    "skating": "스케이팅", "skip": "스킵", "skipping": "스키핑", "skull": "스컬", "slam": "슬램",
    "sled": "슬레드", "smith": "스미스", "snatch": "스내치", "soleus": "솔레우스",
    "speed": "스피드", "spider": "스파이더", "split": "스플릿", "sprint": "스프린트",
    "squats": "스쿼트", "squat": "스쿼트", "stability": "스태빌리티", "stairmaster": "스테어마스터",
    "standing": "스탠딩", "stationary": "스테이셔너리", "step": "스텝", "steps": "스텝",
    "stiff": "스티프", "stone": "스톤", "stones": "스톤", "straight": "스트레이트",
    "stretch": "스트레치", "stride": "스트라이드", "sumo": "스모", "superman": "슈퍼맨",
    "supinated": "수피네이티드", "supination": "수피네이션", "supine": "수파인",
    "suspended": "서스펜디드", "swing": "스윙", "swings": "스윙", "t": "티", "tbar": "티바",
    "the": "더", "thigh": "사이", "through": "스루", "throw": "스로", "tibialis": "티비알리스",
    "to": "투", "toe": "토", "touch": "터치", "touchers": "터처스", "trainer": "트레이너",
    "triceps": "트라이셉스", "twist": "트위스트", "twists": "트위스트", "two": "투",
    "up": "업", "upper": "어퍼", "upright": "업라이트", "v": "브이", "walk": "워크",
    "walking": "워킹", "wall": "월", "weighted": "웨이티드", "wide": "와이드", "windmill": "윈드밀",
    "with": "위드", "world": "월드", "worlds": "월즈", "wrist": "리스트", "yoke": "요크",
    "zercher": "저처", "zottman": "조트만",
    "abductor": "앱덕터", "an": "언", "at": "앳", "bars": "바", "below": "빌로",
    "bicep": "바이셉", "bridges": "브리지", "caster": "캐스터", "ceiling": "실링",
    "child's": "차일즈", "chins": "친즈", "chop": "찹", "claw": "클로", "climb": "클라임",
    "clock": "클락", "conan's": "코난스", "cone": "콘", "crawl": "크롤", "crosses": "크로스",
    "crucifix": "크루시픽스", "dancer's": "댄서스", "db": "디비", "dead": "데드",
    "deficit": "데피싯", "delivery": "딜리버리", "delt": "델트", "deltoid": "델토이드",
    "depth": "뎁스", "donkey": "동키", "dorsi": "도르시", "double": "더블", "down": "다운",
    "downward": "다운워드", "drill": "드릴", "drop": "드롭", "dynamic": "다이내믹",
    "elliptical": "일립티컬", "facing": "페이싱", "fallout": "폴아웃", "farmer's": "파머스",
    "fast": "패스트", "figure": "피겨", "flat": "플랫", "flexion": "플렉션",
    "flexor": "플렉서", "flexors": "플렉서", "flip": "플립", "flutter": "플러터",
    "flye": "플라이", "foot": "풋", "forearm": "포어암", "frankenstein": "프랑켄슈타인",
    "frog": "프로그", "from": "프롬", "gastrocnemius": "가스트로크니미어스", "get": "겟",
    "gironda": "지론다", "gorilla": "고릴라", "grab": "그랩", "greatest": "그레이티스트",
    "groiners": "그로이너", "half": "하프", "ham": "햄", "handed": "핸디드",
    "handle": "핸들", "handstand": "핸드스탠드", "harness": "하네스", "heaving": "히빙",
    "heavy": "헤비", "hug": "허그", "hurdle": "허들", "hyperextension": "하이퍼익스텐션",
    "hyperextensions": "하이퍼익스텐션", "iliotibial": "일리오티비얼", "in": "인",
    "inchworm": "인치웜", "intermediate": "인터미디어트", "into": "인투", "inverted": "인버티드",
    "iso": "아이소", "it": "잇", "janda": "잔다", "jefferson": "제퍼슨", "jm": "제이엠",
    "jogging": "조깅", "latissimus": "라티시무스", "leap": "리프", "legged": "레그드",
    "leverage": "레버리지", "load": "로드", "london": "런던", "looking": "루킹",
    "mid": "미드", "middle": "미들", "mill": "밀", "mornings": "모닝", "motion": "모션",
    "movers": "무버", "moving": "무빙", "narrow": "내로우", "natural": "내추럴",
    "neutral": "뉴트럴", "no": "노", "of": "오브", "off": "오프", "open": "오픈",
    "or": "오어", "otis": "오티스", "pallof": "팔로프", "palm": "팜", "para": "파라",
    "parallel": "패럴렐", "part": "파트", "partials": "파셜", "pass": "패스",
    "pelvic": "펠빅", "peroneals": "페로니얼", "physioball": "피지오볼", "pike": "파이크",
    "pin": "핀", "pinch": "핀치", "pins": "핀", "pirate": "파이럿",
    "piriformis": "피리포미스", "pistol": "피스톨", "platform": "플랫폼", "plie": "플리에",
    "plyo": "플라이오", "point": "포인트", "positions": "포지션", "posterior": "포스테리어",
    "progression": "프로그레션", "pronated": "프로네이티드", "pronation": "프로네이션",
    "prone": "프론", "prowler": "프라울러", "pulls": "풀", "pyramid": "피라미드",
    "quadriceps": "쿼드리셉스", "rack": "랙", "range": "레인지", "recumbent": "리컴번트",
    "resistance": "리지스턴스", "return": "리턴", "rhomboids": "롬보이드", "rickshaw": "릭쇼",
    "ring": "링", "rocket": "로켓", "rocking": "로킹", "round": "라운드",
    "runner's": "러너스", "s": "에스", "saw": "소", "scapular": "스캐퓰러",
    "scissors": "시저", "scoop": "스쿠프", "see": "시", "seesaw": "시소", "series": "시리즈",
    "ships": "쉽스", "shotgun": "샷건", "shoulder": "숄더", "shrug": "슈러그",
    "shrugs": "슈러그", "shuffle": "셔플", "side": "사이드", "sides": "사이드",
    "sissy": "시시", "skullcrusher": "스컬크러셔", "sledgehammer": "슬레지해머",
    "slides": "슬라이드", "smr": "에스엠알", "spell": "스펠", "spinal": "스파이널",
    "sprints": "스프린트", "squeeze": "스퀴즈", "squeezes": "스퀴즈", "stairs": "스테어",
    "stance": "스탠스", "star": "스타", "start": "스타트", "sternum": "스터넘",
    "stomach": "스토머크", "straddle": "스트래들", "straps": "스트랩", "style": "스타일",
    "svend": "스벤드", "tate": "테이트", "technique": "테크닉", "thrust": "스러스트",
    "thruster": "스러스터", "tilt": "틸트", "tire": "타이어", "torso": "토르소",
    "touches": "터치", "towel": "타월", "tract": "트랙트", "trail": "트레일",
    "trap": "트랩", "treadmill": "트레드밀", "tricep": "트라이셉", "tuck": "턱",
    "tucks": "턱", "turkish": "터키시", "underhand": "언더핸드", "ups": "업",
    "upward": "업워드", "vacuum": "배큠", "version": "버전", "vertical": "버티컬",
    "wheel": "휠", "wind": "윈드", "windmills": "윈드밀", "wipers": "와이퍼",
    "wood": "우드", "world's": "월즈", "your": "유어",
}


PHRASE_OVERRIDES = {
    "3/4 Sit-Up": "3/4 싯업",
    "90/90 Hamstring": "90/90 햄스트링",
    "Ab Roller": "앱 롤러",
    "Adductor": "어덕터",
    "Adductor/Groin": "어덕터/그로인",
    "Advanced Kettlebell Windmill": "어드밴스드 케틀벨 윈드밀",
    "Air Bike": "에어 바이크",
    "All Fours Quad Stretch": "올 포어즈 쿼드 스트레치",
    "Alternate Heel Touchers": "얼터네이트 힐 터처스",
    "Alternate Leg Diagonal Bound": "얼터네이트 레그 다이애거널 바운드",
    "Alternating Floor Press": "얼터네이팅 플로어 프레스",
    "Alternating Hang Clean": "얼터네이팅 행 클린",
    "Alternating Kettlebell Press": "얼터네이팅 케틀벨 프레스",
    "Alternating Kettlebell Row": "얼터네이팅 케틀벨 로우",
    "Alternating Renegade Row": "얼터네이팅 레니게이드 로우",
    "Ankle Circles": "앵클 서클",
    "Ankle On The Knee": "앵클 온 더 니",
    "Anterior Tibialis-SMR": "앤티리어 티비알리스 에스엠알",
    "Anti-Gravity Press": "안티 그래비티 프레스",
    "Arm Circles": "암 서클",
    "Around The Worlds": "어라운드 더 월즈",
    "Atlas Stone Trainer": "아틀라스 스톤 트레이너",
    "Atlas Stones": "아틀라스 스톤",
    "Axle Deadlift": "액슬 데드리프트",
    "Backward Drag": "백워드 드래그",
    "Backward Medicine Ball Throw": "백워드 메디신 볼 스로",
    "Balance Board": "밸런스 보드",
    "Band Good Morning": "밴드 굿모닝",
    "Band Good Morning (Pull Through)": "밴드 굿모닝 (풀 스루)",
    "Band Hip Adductions": "밴드 힙 어덕션",
    "Band Pull Apart": "밴드 풀 어파트",
    "Band Skull Crusher": "밴드 스컬 크러셔",
    "Barbell Ab Rollout": "바벨 앱 롤아웃",
    "Barbell Ab Rollout - On Knees": "바벨 앱 롤아웃 - 온 니즈",
    "Barbell Curls Lying Against An Incline": "바벨 컬스 라잉 어게인스트 언 인클라인",
    "Barbell Glute Bridge": "바벨 글루트 브리지",
    "Barbell Incline Shoulder Raise": "바벨 인클라인 숄더 레이즈",
    "Barbell Rollout from Bench": "바벨 롤아웃 프롬 벤치",
    "Barbell Side Bend": "바벨 사이드 벤드",
    "Barbell Side Split Squat": "바벨 사이드 스플릿 스쿼트",
    "Barbell Step Ups": "바벨 스텝 업",
    "Battling Ropes": "배틀링 로프",
    "Bear Crawl Sled Drags": "베어 크롤 슬레드 드래그",
    "Behind Head Chest Stretch": "비하인드 헤드 체스트 스트레치",
    "Bench Jump": "벤치 점프",
    "Bench Press - Powerlifting": "벤치 프레스 - 파워리프팅",
    "Bench Press with Chains": "벤치 프레스 위드 체인",
    "Bench Sprint": "벤치 스프린트",
    "Bent Over Low-Pulley Side Lateral": "벤트 오버 로우 풀리 사이드 레터럴",
    "Bent Press": "벤트 프레스",
    "Bent-Arm Barbell Pullover": "벤트 암 바벨 풀오버",
    "Bent-Arm Dumbbell Pullover": "벤트 암 덤벨 풀오버",
    "Bicycling": "바이시클링",
    "Bicycling, Stationary": "바이시클링, 스테이셔너리",
    "Board Press": "보드 프레스",
    "Body-Up": "바디 업",
    "Bosu Ball Cable Crunch With Side Bends": "보수 볼 케이블 크런치 위드 사이드 벤드",
    "Bottoms Up": "바텀스 업",
    "Bottoms-Up Clean From The Hang Position": "바텀스 업 클린 프롬 더 행 포지션",
    "Box Jump (Multiple Response)": "박스 점프 (멀티플 리스폰스)",
    "Box Skip": "박스 스킵",
    "Box Squat": "박스 스쿼트",
    "Box Squat with Bands": "박스 스쿼트 위드 밴드",
    "Box Squat with Chains": "박스 스쿼트 위드 체인",
    "Brachialis-SMR": "브라키알리스 에스엠알",
    "Bradford/Rocky Presses": "브래드포드/로키 프레스",
    "Butt Lift (Bridge)": "버트 리프트 (브리지)",
    "Butt-Ups": "버트 업",
    "Cable Hip Adduction": "케이블 힙 어덕션",
    "Cable Incline Pushdown": "케이블 인클라인 푸시다운",
    "Cable Internal Rotation": "케이블 인터널 로테이션",
}


ONSET = {
    "B": "ㅂ", "CH": "ㅊ", "D": "ㄷ", "DH": "ㄷ", "F": "ㅍ", "G": "ㄱ", "HH": "ㅎ",
    "JH": "ㅈ", "K": "ㅋ", "L": "ㄹ", "M": "ㅁ", "N": "ㄴ", "P": "ㅍ", "R": "ㄹ",
    "S": "ㅅ", "SH": "ㅅ", "T": "ㅌ", "TH": "ㅅ", "V": "ㅂ", "Z": "ㅈ", "ZH": "ㅈ",
}
VOWEL = {
    "AA": "ㅏ", "AE": "ㅐ", "AH": "ㅓ", "AO": "ㅗ", "EH": "ㅔ", "ER": "ㅓ",
    "IH": "ㅣ", "IY": "ㅣ", "UH": "ㅜ", "UW": "ㅜ",
}
CODA = {"K": "ㄱ", "G": "ㄱ", "N": "ㄴ", "M": "ㅁ", "NG": "ㅇ", "L": "ㄹ", "P": "ㅂ", "B": "ㅂ", "T": "ㅅ", "D": "ㅅ"}
COMPLEX_VOWEL = {"AW": ("ㅏ", "ㅜ"), "AY": ("ㅏ", "ㅣ"), "EY": ("ㅔ", "ㅣ"), "OW": ("ㅗ", "ㅜ"), "OY": ("ㅗ", "ㅣ")}
CHO = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ"
JUNG = "ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ"
JONG = "\0ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ"


def compose(onset: str, vowel: str, coda: str = "") -> str:
    return chr(0xAC00 + CHO.index(onset) * 588 + JUNG.index(vowel) * 28 + JONG.index(coda or "\0"))


def consonant_syllable(phone: str) -> str:
    onset = ONSET.get(phone, "ㅇ")
    return compose(onset, "ㅡ")


def phonemes_to_hangul(phones: list[str]) -> str:
    phones = [re.sub(r"\d", "", phone) for phone in phones]
    output: list[str] = []
    index = 0
    while index < len(phones):
        onset_phones: list[str] = []
        while index < len(phones) and phones[index] not in VOWEL and phones[index] not in COMPLEX_VOWEL:
            onset_phones.append(phones[index])
            index += 1
        if index >= len(phones):
            output.extend(consonant_syllable(phone) for phone in onset_phones)
            break
        for phone in onset_phones[:-1]:
            output.append(consonant_syllable(phone))
        onset_phone = onset_phones[-1] if onset_phones else ""
        vowel_phone = phones[index]
        index += 1
        if vowel_phone in COMPLEX_VOWEL:
            first, second = COMPLEX_VOWEL[vowel_phone]
            onset = ONSET.get(onset_phone, "ㅇ") if onset_phone not in {"W", "Y"} else "ㅇ"
            output.append(compose(onset, first))
            output.append(compose("ㅇ", second))
            continue
        vowel = VOWEL[vowel_phone]
        if onset_phone == "W":
            vowel = {"ㅏ": "ㅘ", "ㅓ": "ㅝ", "ㅔ": "ㅞ", "ㅣ": "ㅟ", "ㅜ": "ㅜ"}.get(vowel, vowel)
            onset = "ㅇ"
        elif onset_phone == "Y":
            vowel = {"ㅏ": "ㅑ", "ㅓ": "ㅕ", "ㅔ": "ㅖ", "ㅣ": "ㅣ", "ㅜ": "ㅠ"}.get(vowel, vowel)
            onset = "ㅇ"
        else:
            onset = ONSET.get(onset_phone, "ㅇ")
        coda = ""
        if index == len(phones) - 1 and phones[index] in CODA:
            coda = CODA[phones[index]]
            index += 1
        output.append(compose(onset, vowel, coda))
    return "".join(output)


def fallback_word(word: str, pronunciations: dict[str, list[list[str]]]) -> str:
    lower = word.lower().replace("’", "'")
    if lower in WORD_OVERRIDES:
        return WORD_OVERRIDES[lower]
    lookup = re.sub(r"[^a-z']", "", lower)
    phones = pronunciations.get(lookup)
    if phones:
        return phonemes_to_hangul(phones[0])
    return word.upper() if len(word) <= 4 else word


def transliterate_name(name: str, pronunciations: dict[str, list[list[str]]]) -> str:
    if name in PHRASE_OVERRIDES:
        return PHRASE_OVERRIDES[name]
    name = re.sub(r"\s+-\s+", " | ", name)
    name = name.replace("-", " ")
    tokens = re.findall(r"[A-Za-z]+(?:'[A-Za-z]+)?|\d+(?:/\d+)?|[^A-Za-z\d\s]+", name)
    converted: list[str] = []
    for token in tokens:
        if re.fullmatch(r"[A-Za-z]+(?:'[A-Za-z]+)?", token):
            converted.append(fallback_word(token, pronunciations))
        else:
            converted.append(token)
    text = " ".join(converted)
    text = re.sub(r"\s+([,.)/])", r"\1", text)
    text = re.sub(r"([(\/])\s+", r"\1", text)
    text = re.sub(r"\s*\|\s*", " - ", text)
    text = text.replace("푸시 업", "푸시업").replace("풀 업", "풀업").replace("싯 업", "싯업")
    text = text.replace("티 바", "티바").replace("브이 바", "브이바").replace("이지 바", "이지바")
    return text.strip()


def main() -> None:
    exercises = json.loads(SOURCE_PATH.read_text(encoding="utf-8"))
    source_words = {
        token.lower().replace("’", "'")
        for item in exercises
        for token in re.findall(r"[A-Za-z]+(?:'[A-Za-z]+)?", item["name"])
    }
    missing_words = sorted(word for word in source_words if word not in WORD_OVERRIDES)
    if missing_words:
        raise RuntimeError(f"Review Korean pronunciations for: {', '.join(missing_words)}")
    pronunciations: dict[str, list[list[str]]] = {}
    items = {
        item["sourceId"]: transliterate_name(item["name"], pronunciations)
        for item in exercises
    }
    payload = {
        "source": "free-exercise-db",
        "description": "Korean pronunciation display names for all free-exercise-db exercises.",
        "count": len(items),
        "items": items,
    }
    OUTPUT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"wrote {len(items)} names to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
