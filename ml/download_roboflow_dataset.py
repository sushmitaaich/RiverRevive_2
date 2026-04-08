from __future__ import annotations

import argparse
import os
from pathlib import Path

from roboflow import Roboflow # type: ignore


def parse_args() -> argparse.Namespace:
  parser = argparse.ArgumentParser(
    description="Download a versioned Roboflow dataset export into the local ml/datasets folder."
  )
  parser.add_argument("--workspace", required=True, help="Roboflow workspace slug")
  parser.add_argument("--project", required=True, help="Roboflow project slug")
  parser.add_argument("--version", required=True, type=int, help="Roboflow dataset version number")
  parser.add_argument(
    "--format",
    default="yolov8",
    help="Roboflow export format. Use yolov8 or an Ultralytics-compatible format.",
  )
  parser.add_argument(
    "--output-dir",
    default=None,
    help="Directory where the dataset version should be downloaded.",
  )
  return parser.parse_args()


def main() -> None:
  args = parse_args()
  api_key = os.environ.get("ROBOFLOW_API_KEY")

  if not api_key:
    raise RuntimeError("Missing ROBOFLOW_API_KEY")

  project_root = Path(__file__).resolve().parent
  default_output_dir = project_root / "datasets" / "roboflow" / f"{args.project}-v{args.version}"
  output_dir = Path(args.output_dir) if args.output_dir else default_output_dir
  output_dir.parent.mkdir(parents=True, exist_ok=True)

  rf = Roboflow(api_key=api_key)
  version = rf.workspace(args.workspace).project(args.project).version(args.version)
  version.download(args.format, location=str(output_dir))

  print(f"Dataset downloaded to: {output_dir}")
  print(f"Training YAML should now be available at: {output_dir / 'data.yaml'}")


if __name__ == "__main__":
  main()
