import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
HANGUL = re.compile(r"[가-힣]")
MOJIBAKE = re.compile(r"(?:\ufffd|Ã.|Â.)")
CJK = re.compile(r"[\u3400-\u9fff]")
CYRILLIC = re.compile(r"[\u0400-\u04ff]")


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

    source_names = {
        str(exercise.get("sourceId") or exercise.get("id")): str(exercise.get("name") or "").strip()
        for exercise in exercises
    }
    pronunciation_payload = json.loads(
        (exercise_path.parent / "ko_exercise_pronunciation_map.json").read_text(encoding="utf-8")
    )
    pronunciation_items = pronunciation_payload.get("items") or {}
    common_items = json.loads(
        (exercise_path.parent / "ko_exercise_common_map.json").read_text(encoding="utf-8")
    )
    missing_pronunciation_sources = sorted(set(pronunciation_items) - set(source_names))
    missing_common_sources = sorted(set(common_items) - set(source_names))
    require(
        not missing_pronunciation_sources,
        f"pronunciation aliases without source exercises: {missing_pronunciation_sources[:5]}",
    )
    require(
        not missing_common_sources,
        f"common aliases without source exercises: {missing_common_sources[:5]}",
    )
    require(
        source_names.get("Tricep_Dumbbell_Kickback") == "Tricep Dumbbell Kickback",
        "legacy Tricep Dumbbell Kickback mapping is missing",
    )
    require(
        source_names.get("Seated_Triceps_Press") == "Seated Triceps Press",
        "legacy Seated Triceps Press mapping is missing",
    )

    i18n_source = (ROOT / "static" / "js" / "i18n.js").read_text(encoding="utf-8")
    app_source = (ROOT / "static" / "js" / "app.js").read_text(encoding="utf-8")
    main_template = (ROOT / "templates" / "main.html").read_text(encoding="utf-8")
    legal_template = (ROOT / "templates" / "legal.html").read_text(encoding="utf-8")
    locale_source = (ROOT / "static" / "js" / "i18n-locales.js").read_text(encoding="utf-8")
    locale_prefix = "window.SetCounterLocaleData = "
    require(locale_source.startswith(locale_prefix), "invalid locale data wrapper")
    locale_json = locale_source[len(locale_prefix):].rstrip()
    if locale_json.endswith(";"):
        locale_json = locale_json[:-1]
    locale_data = json.loads(locale_json)

    require("\ufffd" not in i18n_source + app_source, "replacement characters found in JavaScript")
    supported_locales = ("ko", "en", "ja", "es", "zh", "ru")
    for locale in supported_locales:
        require(f'data-language="{locale}"' in main_template, f"{locale} language selector is missing")
    require(
        all("js/i18n-locales.js" in template and "js/i18n.js" in template for template in (main_template, legal_template)),
        "locale data and i18n runtime are not loaded everywhere",
    )
    require(app_source.count("titleEn:") == 4, "all four plans must have English titles")
    require(app_source.count("copyEn:") == 4, "all four plans must have English descriptions")
    require(app_source.count("durationEn:") == 4, "all four plans must have English durations")
    require('`${draft} workouts`' in app_source, "weekly goal must use workout terminology in English")

    locale_report = {}
    expected_core = {
        "ja": {"View": "表示", "Reps": "回数", "Sets": "セット"},
        "es": {"View": "Ver", "Reps": "Repeticiones", "Sets": "Series"},
        "zh": {"View": "查看", "Reps": "次数", "Sets": "组数"},
        "ru": {"View": "Просмотр", "Reps": "Повторения", "Sets": "Подходы"},
    }
    for locale in ("ja", "es", "zh", "ru"):
        require(locale in locale_data, f"missing {locale} UI locale")
        strings = locale_data[locale].get("strings") or {}
        patterns = locale_data[locale].get("patterns") or {}
        require(len(strings) >= 600, f"{locale} UI dictionary is incomplete: {len(strings)}")
        require(len(patterns) >= 50, f"{locale} pattern dictionary is incomplete: {len(patterns)}")
        require(not any(HANGUL.search(str(value)) for value in (*strings.values(), *patterns.values())), f"Hangul remains in {locale} UI translations")
        if locale == "zh":
            require(not any(CYRILLIC.search(str(value)) for value in (*strings.values(), *patterns.values())), "Cyrillic remains in zh UI translations")
        if locale == "ru":
            require(not any(CJK.search(str(value)) for value in (*strings.values(), *patterns.values())), "CJK remains in ru UI translations")
        require(not any(not str(value).strip() for value in (*strings.values(), *patterns.values())), f"blank {locale} UI translation")

        localized_payload = json.loads(
            (exercise_path.parent / f"localized_exercises_{locale}.json").read_text(encoding="utf-8")
        )
        localized = localized_payload.get("items") or {}
        require(localized_payload.get("count") == len(exercises), f"{locale} exercise count mismatch")
        require(set(localized) == set(source_names), f"{locale} exercise source IDs mismatch")
        localized_instruction_count = 0
        untranslated_names = []
        for exercise in exercises:
            source_id = exercise["sourceId"]
            item = localized[source_id]
            name = str(item.get("name") or "").strip()
            instructions = item.get("instructions") or []
            require(name and not HANGUL.search(name), f"invalid {locale} exercise name: {source_id}")
            require(len(instructions) == len(exercise.get("instructions") or []), f"{locale} instruction count mismatch: {source_id}")
            require(not any(HANGUL.search(str(value)) for value in instructions), f"Hangul remains in {locale} exercise instructions: {source_id}")
            if locale == "zh":
                require(not CYRILLIC.search(name), f"Cyrillic remains in zh exercise name: {source_id}")
                require(not any(CYRILLIC.search(str(value)) for value in instructions), f"Cyrillic remains in zh exercise instructions: {source_id}")
            if locale == "ru":
                require(not CJK.search(name), f"CJK remains in ru exercise name: {source_id}")
                require(not any(CJK.search(str(value)) for value in instructions), f"CJK remains in ru exercise instructions: {source_id}")
            localized_instruction_count += len(instructions)
            if name == exercise["name"]:
                untranslated_names.append(source_id)
        allowed_unchanged = 4 if locale == "es" else 0
        require(len(untranslated_names) <= allowed_unchanged, f"too many untranslated {locale} exercise names: {untranslated_names[:10]}")
        for key, expected in expected_core[locale].items():
            require(strings[key] == expected, f"{locale} {key} translation regressed: {strings[key]}")
        locale_report[locale] = {
            "uiStrings": len(strings),
            "patterns": len(patterns),
            "exerciseNames": len(localized),
            "instructions": localized_instruction_count,
            "unchangedProperNames": len(untranslated_names),
        }

    print(json.dumps({
        "exerciseCount": len(exercises),
        "instructionCount": instruction_count,
        "invalidEnglishNames": len(invalid_names),
        "invalidEnglishInstructions": len(invalid_instructions),
        "emptySourceInstructionsSkipped": missing_instructions,
        "pronunciationAliases": len(pronunciation_items),
        "commonExerciseAliases": len(common_items),
        "unresolvedExerciseAliasSources": 0,
        "legacyExerciseNameChecks": 2,
        "plansWithEnglishCopy": 4,
        "languageSelector": list(supported_locales),
        "legalPagesLocalized": True,
        "locales": locale_report,
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
