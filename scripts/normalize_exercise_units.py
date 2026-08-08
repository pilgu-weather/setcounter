"""Normalize imperial units in Korean exercise instructions.

The upstream exercise dataset is US-centric. This script keeps the Korean
instruction copy suitable for the app by converting its remaining imperial
measurements to readable metric approximations.
"""

from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
INSTRUCTIONS_PATH = ROOT / "static/data/free-exercise-db/ko_instructions.json"


REPLACEMENTS = {
    # Inches: rounded to the nearest practical 5 cm as requested.
    "18~24인치": "45~60cm",
    "12~18인치": "30~45cm",
    "18~30인치": "45~75cm",
    "12~16인치": "30~40cm",
    "22~26인치": "55~65cm",
    "16~18인치": "40~45cm",
    "6~8인치": "15~20cm",
    "4~6인치": "10~15cm",
    "3-6인치": "10~15cm",
    "3~4인치": "약 10cm",
    "3-4인치": "약 10cm",
    "2~3인치": "5~10cm",
    "2-3인치": "5~10cm",
    "1~3인치": "5~10cm",
    "41인치": "약 105cm",
    "36인치": "약 90cm",
    "18인치": "약 45cm",
    "15인치": "약 40cm",
    "12인치": "약 30cm",
    "6인치": "약 15cm",
    "4인치": "약 10cm",
    "3.5인치": "약 10cm",
    "3인치": "약 10cm",
    "2인치": "약 5cm",
    "1인치": "약 5cm",
    # Feet and yards: short setup distances use cm, longer travel uses m.
    "75-100피트": "약 25~30m",
    "50~100피트": "약 15~30m",
    "30-50피트": "약 10~15m",
    "15~20피트": "약 5~6m",
    "50피트": "약 15m",
    "2~3피트": "약 60~90cm",
    "1~2피트": "약 30~60cm",
    "8피트": "약 2.5m",
    "2피트": "약 60cm",
    "1피트": "약 30cm",
    "10야드": "약 10m",
    "1~2야드": "약 1~2m",
    # Weight and speed.
    "35~45파운드": "약 16~20kg",
    "5~10파운드": "약 2~5kg",
    "150파운드": "약 68kg",
    "25파운드": "약 11kg",
    "시속 8마일": "시속 약 13km/h",
    "시속 4마일": "시속 약 6.5km/h",
}


PHRASE_REPLACEMENTS = {
    "한 번에 몇 인치만 움직입니다": "한 번에 조금씩 움직입니다",
    "몇 인치 정도 몸을 숙이고": "상체를 조금 숙이고",
    "몇 인치 아래로 스쿼트하고": "무릎을 살짝 굽혔다가",
    "몇 인치 뒤로 물러서세요": "조금 뒤로 물러서세요",
    "몇 인치 간격으로": "좁은 간격으로",
    "몇 인치 벌리고": "조금 벌리고",
    "종아리 아래 몇 인치": "종아리 바로 아래",
    "종아리 바로 아래 몇 인치": "종아리 바로 아래",
    "몇 인치 정도 들어 올리세요": "조금 들어 올리세요",
    "몇 피트": "약 1m",
}


IMPERIAL_PATTERN = re.compile(r"인치|피트|파운드|마일|야드|화씨|온스")


def normalize_text(text: str) -> str:
    for source, target in PHRASE_REPLACEMENTS.items():
        text = text.replace(source, target)
    for source, target in REPLACEMENTS.items():
        text = text.replace(source, target)
    # Keep approximation wording natural when the source already used "약".
    text = text.replace("시속 약 13km", "시속 약 13km/h")
    text = text.replace("시속 약 6.5km", "시속 약 6.5km/h")
    text = text.replace("약 약 ", "약 ")
    text = re.sub(r"(약 [0-9.]+(?:~[0-9.]+)?(?:cm|m)) 정도", r"\1", text)
    text = text.replace("kg가 들어감", "kg이 들어감")
    return text


def main() -> None:
    data = json.loads(INSTRUCTIONS_PATH.read_text(encoding="utf-8"))
    normalized = {
        exercise_id: [normalize_text(step) for step in steps]
        for exercise_id, steps in data.items()
    }

    leftovers = []
    for exercise_id, steps in normalized.items():
        for index, step in enumerate(steps, start=1):
            if IMPERIAL_PATTERN.search(step):
                leftovers.append(f"{exercise_id} step {index}: {step}")
    if leftovers:
        raise RuntimeError("Unconverted imperial units:\n" + "\n".join(leftovers))

    INSTRUCTIONS_PATH.write_text(
        json.dumps(normalized, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
