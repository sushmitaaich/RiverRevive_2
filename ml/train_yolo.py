from __future__ import annotations

import argparse
from pathlib import Path

from ultralytics import YOLO


def resolve_dataset_yaml(explicit_path: str | None) -> Path:
  if explicit_path:
    dataset_yaml = Path(explicit_path).resolve()
    if not dataset_yaml.exists():
      raise FileNotFoundError(f"Dataset YAML not found: {dataset_yaml}")
    return dataset_yaml

  ml_root = Path(__file__).resolve().parent
  candidates = sorted((ml_root / "datasets" / "roboflow").glob("**/data.yaml"))
  if not candidates:
    raise FileNotFoundError(
      "No Roboflow dataset export was found. Download one into ml/datasets/roboflow first."
    )
  return candidates[-1].resolve()


def parse_args() -> argparse.Namespace:
  parser = argparse.ArgumentParser(
    description="Train a YOLO11 garbage detector for RiverRevive."
  )
  parser.add_argument("--data", default=None, help="Path to the Roboflow-exported data.yaml")
  parser.add_argument("--model", default="yolo11s.pt", help="Base Ultralytics checkpoint")
  parser.add_argument("--epochs", type=int, default=80, help="Number of training epochs")
  parser.add_argument("--imgsz", type=int, default=640, help="Training image size")
  parser.add_argument("--batch", type=int, default=16, help="Batch size")
  parser.add_argument("--workers", type=int, default=8, help="Dataloader worker count")
  parser.add_argument("--patience", type=int, default=20, help="Early-stopping patience")
  parser.add_argument("--seed", type=int, default=42, help="Training seed")
  parser.add_argument(
    "--device",
    default="0",
    help="Training device. Defaults to GPU 0. Use cpu only if you explicitly want CPU training.",
  )
  parser.add_argument(
    "--name",
    default="garbage-detection-yolo11",
    help="Run name inside ml/runs",
  )
  parser.add_argument(
    "--project",
    default=None,
    help="Directory for training outputs. Defaults to ml/runs",
  )
  parser.add_argument(
    "--cache",
    action="store_true",
    help="Enable dataset caching during training",
  )
  parser.add_argument(
    "--run-test-eval",
    action="store_true",
    help="Run test-split evaluation after training finishes",
  )
  parser.add_argument(
    "--exist-ok",
    action="store_true",
    help="Allow reuse of an existing run directory",
  )
  return parser.parse_args()


def main() -> None:
  args = parse_args()
  dataset_yaml = resolve_dataset_yaml(args.data)
  ml_root = Path(__file__).resolve().parent
  project_dir = Path(args.project).resolve() if args.project else (ml_root / "runs").resolve()
  project_dir.mkdir(parents=True, exist_ok=True)

  model = YOLO(args.model)
  train_kwargs = {
    "data": str(dataset_yaml),
    "epochs": args.epochs,
    "imgsz": args.imgsz,
    "batch": args.batch,
    "workers": args.workers,
    "patience": args.patience,
    "project": str(project_dir),
    "name": args.name,
    "seed": args.seed,
    "cache": args.cache,
    "exist_ok": args.exist_ok,
    "plots": True,
  }
  if args.device:
    train_kwargs["device"] = args.device

  print(f"Using dataset YAML: {dataset_yaml}")
  print(f"Training outputs will be written to: {project_dir / args.name}")
  print(f"Starting training with base model: {args.model}")
  print(f"Training device: {args.device}")

  model.train(**train_kwargs)

  best_weights = project_dir / args.name / "weights" / "best.pt"
  print(f"Best checkpoint should be available at: {best_weights}")

  if args.run_test_eval:
    print("Running test split evaluation...")
    model = YOLO(str(best_weights if best_weights.exists() else args.model))
    model.val(data=str(dataset_yaml), split="test", imgsz=args.imgsz)


if __name__ == "__main__":
  main()
