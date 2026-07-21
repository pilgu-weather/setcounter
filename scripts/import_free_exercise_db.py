import argparse
import json
import shutil
from pathlib import Path


SOURCE_NAME = "free-exercise-db"


def normalize_exercise(item):
    source_id = item["id"]
    images = item.get("images") or []
    return {
        "source": SOURCE_NAME,
        "sourceId": source_id,
        "id": f"{SOURCE_NAME}:{source_id}",
        "name": item.get("name") or source_id.replace("_", " "),
        "displayName": item.get("name") or source_id.replace("_", " "),
        "category": item.get("category"),
        "equipment": item.get("equipment"),
        "level": item.get("level"),
        "force": item.get("force"),
        "mechanic": item.get("mechanic"),
        "primaryMuscles": item.get("primaryMuscles") or [],
        "secondaryMuscles": item.get("secondaryMuscles") or [],
        "instructions": item.get("instructions") or [],
        "images": [f"images/{image}" for image in images],
        "rawImages": images,
    }


def copy_images(source_exercises_dir, output_images_dir, exercises):
    output_images_dir.mkdir(parents=True, exist_ok=True)
    copied = 0
    for exercise in exercises:
        for raw_image in exercise["rawImages"]:
            source = source_exercises_dir / raw_image
            target = output_images_dir / raw_image
            if not source.exists():
                continue
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source, target)
            copied += 1
        exercise.pop("rawImages", None)
    return copied


def write_json(path, payload):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main():
    parser = argparse.ArgumentParser(description="Import yuhonas/free-exercise-db into SetCounter static assets.")
    parser.add_argument("--source", required=True, help="Path to cloned free-exercise-db repository")
    parser.add_argument("--output", default="static/data/free-exercise-db", help="SetCounter static data output directory")
    args = parser.parse_args()

    source_root = Path(args.source)
    output_root = Path(args.output)
    source_json = source_root / "dist" / "exercises.json"
    source_exercises_dir = source_root / "exercises"
    if not source_json.exists():
        raise FileNotFoundError(f"Missing {source_json}")
    if not source_exercises_dir.exists():
        raise FileNotFoundError(f"Missing {source_exercises_dir}")

    raw_exercises = json.loads(source_json.read_text(encoding="utf-8"))
    exercises = [normalize_exercise(item) for item in raw_exercises]
    copied = copy_images(source_exercises_dir, output_root / "images", exercises)
    write_json(output_root / "exercises.json", exercises)
    write_json(
        output_root / "ko_exercise_map.json",
        {
            "source": SOURCE_NAME,
            "description": "Korean display-name and alias overrides. Keep empty until manual curation.",
            "items": {},
        },
    )
    write_json(
        output_root / "metadata.json",
        {
            "source": SOURCE_NAME,
            "repository": "https://github.com/yuhonas/free-exercise-db",
            "license": "Unlicense",
            "exerciseCount": len(exercises),
            "imageCount": copied,
            "fields": [
                "source",
                "sourceId",
                "id",
                "name",
                "displayName",
                "category",
                "equipment",
                "level",
                "force",
                "mechanic",
                "primaryMuscles",
                "secondaryMuscles",
                "instructions",
                "images",
            ],
        },
    )
    print(f"Imported {len(exercises)} exercises and {copied} images into {output_root}")


if __name__ == "__main__":
    main()
