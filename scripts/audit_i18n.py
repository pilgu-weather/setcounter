import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
HANGUL = re.compile(r"[가-힣]")
MOJIBAKE = re.compile(r"(?:\ufffd|Ã.|Â.)")


def require(condition, message):
    if not condition:
        raise AssertionError(message)


def main():
    exercise_path = ROOT / "static" / "data" / "free-exercise-db" / "exercises.json"
    exercises = json.loads(exercise_path.read_text(encoding="utf-8"))
    require(len(exercises) >= 800, f"exercise dataset is unexpectedly small: {len(exercises)}")

    invalid_names = []
    invalid_instructions = []
    missing_instructions = 0
    instruction_count = 0
    for exercise in exercises:
        source_id = exercise.get("sourceId") or exercise.get("id") or "unknown"
        name = str(exercise.get("name") or "").strip()
        if not name or HANGUL.search(name) or MOJIBAKE.search(name):
            invalid_names.append((source_id, name))
        for instruction in exercise.get("instructions") or []:
            instruction_count += 1
            text = str(instruction).strip()
            if not text:
                missing_instructions += 1
                continue
            if HANGUL.search(text) or MOJIBAKE.search(text):
                invalid_instructions.append((source_id, text))

    require(not invalid_names, f"invalid English exercise names: {invalid_names[:5]}")
    require(not invalid_instructions, f"invalid English instructions: {invalid_instructions[:5]}")

    i18n_source = (ROOT / "static" / "js" / "i18n.js").read_text(encoding="utf-8")
    app_source = (ROOT / "static" / "js" / "app.js").read_text(encoding="utf-8")
    main_template = (ROOT / "templates" / "main.html").read_text(encoding="utf-8")
    legal_template = (ROOT / "templates" / "legal.html").read_text(encoding="utf-8")

    require("\ufffd" not in i18n_source + app_source, "replacement characters found in JavaScript")
    require('data-language="ko"' in main_template and 'data-language="en"' in main_template, "language selector is missing")
    require("js/i18n.js" in main_template and "js/i18n.js" in legal_template, "i18n runtime is not loaded everywhere")
    require(app_source.count("titleEn:") == 4, "all four plans must have English titles")
    require(app_source.count("copyEn:") == 4, "all four plans must have English descriptions")
    require(app_source.count("durationEn:") == 4, "all four plans must have English durations")
    require('`${draft} workouts`' in app_source, "weekly goal must use workout terminology in English")

    print(json.dumps({
        "exerciseCount": len(exercises),
        "instructionCount": instruction_count,
        "invalidEnglishNames": len(invalid_names),
        "invalidEnglishInstructions": len(invalid_instructions),
        "emptySourceInstructionsSkipped": missing_instructions,
        "plansWithEnglishCopy": 4,
        "languageSelector": True,
        "legalPagesLocalized": True,
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
