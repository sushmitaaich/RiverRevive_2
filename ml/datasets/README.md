Place Roboflow dataset exports in this directory.

Recommended structure:

- `ml/datasets/roboflow/<project-slug>-v<version>/data.yaml`
- `ml/datasets/roboflow/<project-slug>-v<version>/train/images`
- `ml/datasets/roboflow/<project-slug>-v<version>/train/labels`
- `ml/datasets/roboflow/<project-slug>-v<version>/valid/images`
- `ml/datasets/roboflow/<project-slug>-v<version>/valid/labels`
- `ml/datasets/roboflow/<project-slug>-v<version>/test/images`
- `ml/datasets/roboflow/<project-slug>-v<version>/test/labels`

Do not commit dataset files to git.
