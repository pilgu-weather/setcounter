# Third Party Licenses

## Free Exercise DB

- Project: `yuhonas/free-exercise-db`
- Repository: https://github.com/yuhonas/free-exercise-db
- License: Unlicense
- Local files:
  - `static/data/free-exercise-db/exercises.json`
  - `static/data/free-exercise-db/images/`
  - `static/data/free-exercise-db/metadata.json`
  - `static/data/free-exercise-db/ko_exercise_map.json`

Free Exercise DB is described by its project as an open public-domain exercise dataset in JSON format. Its `LICENSE.md` states that the software is released into the public domain and can be copied, modified, published, used, compiled, sold, or distributed for commercial or non-commercial purposes.

SetCounter embeds a transformed local copy of the dataset and images. The app does not call the GitHub repository or any external exercise API at runtime.

## React Native Body Highlighter

- Project: `HichamELBSI/react-native-body-highlighter`
- Repository: https://github.com/HichamELBSI/react-native-body-highlighter
- Copyright: Copyright (c) 2022 ELABBASSI Hicham
- License: MIT
- Local source and license:
  - `vendor/react-native-body-highlighter/`
- Generated web assets:
  - `static/data/body-highlighter/male-front.json`
  - `static/data/body-highlighter/male-back.json`

SetCounter converts the project's male front and back SVG path data into local web assets. The app does not load these assets from GitHub at runtime. The complete MIT license text is preserved in `vendor/react-native-body-highlighter/LICENSE`.
