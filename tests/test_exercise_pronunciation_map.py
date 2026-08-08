import json
import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "static" / "data" / "free-exercise-db"


class ExercisePronunciationMapTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.exercises = json.loads((DATA_DIR / "exercises.json").read_text(encoding="utf-8"))
        payload = json.loads((DATA_DIR / "ko_exercise_pronunciation_map.json").read_text(encoding="utf-8"))
        cls.names = payload["items"]
        cls.exercise_map = json.loads((DATA_DIR / "ko_exercise_map.json").read_text(encoding="utf-8"))

    def test_every_free_db_exercise_has_a_display_name(self):
        source_ids = {exercise["sourceId"] for exercise in self.exercises}
        self.assertEqual(source_ids, set(self.names))
        self.assertTrue(all(str(value).strip() for value in self.names.values()))

    def test_display_names_do_not_leak_latin_words(self):
        latin_names = [value for value in self.names.values() if re.search(r"[A-Za-z]", value)]
        self.assertEqual([], latin_names)

    def test_representative_pronunciations(self):
        expected = {
            "3_4_Sit-Up": "3/4 싯업",
            "Dumbbell_Seated_Box_Jump": "덤벨 시티드 박스 점프",
            "One-Arm_Dumbbell_Row": "원 암 덤벨 로우",
            "Romanian_Deadlift": "루마니안 데드리프트",
            "T-Bar_Row_with_Handle": "티바 로우 위드 핸들",
        }
        self.assertEqual(expected, {key: self.names[key] for key in expected})

    def test_one_arm_dumbbell_row_keeps_legacy_names_as_aliases(self):
        item = self.exercise_map["items"]["One-Arm_Dumbbell_Row"]
        preset = next(
            entry
            for entry in self.exercise_map["setCounterDefaults"]
            if entry["sourceId"] == "One-Arm_Dumbbell_Row"
        )
        self.assertEqual("원암 덤벨 로우", preset["name"])
        self.assertIn("덤벨로우", item["aliases"])
        self.assertIn("덤벨로우", preset["aliases"])


if __name__ == "__main__":
    unittest.main()
