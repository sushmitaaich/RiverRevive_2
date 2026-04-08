from __future__ import annotations

import os
import tempfile
from pathlib import Path

from fastapi import FastAPI, File, Form, Header, HTTPException, UploadFile

try:
  from .riverrevive_ml.pipeline import Coordinates, ReportVerificationPipeline, serialize_verification_result
except ImportError:
  from riverrevive_ml.pipeline import Coordinates, ReportVerificationPipeline, serialize_verification_result

DEFAULT_WEIGHTS_CANDIDATES = (
  Path(__file__).resolve().parent / "best.pt",
  Path(__file__).resolve().parent / "models" / "best.pt",
)
app = FastAPI(title="RiverRevive ML Verification Service", version="0.1.0")
pipeline: ReportVerificationPipeline | None = None


def require_service_token(authorization: str | None) -> None:
  expected_token = os.environ.get("ML_SERVICE_TOKEN")

  if not expected_token:
    return

  if authorization != f"Bearer {expected_token}":
    raise HTTPException(status_code=401, detail="Unauthorized")


def resolve_weights_path() -> Path:
  configured_path = os.environ.get("RIVERREVIVE_YOLO_WEIGHTS")

  if configured_path:
    return Path(configured_path)

  for candidate in DEFAULT_WEIGHTS_CANDIDATES:
    if candidate.exists():
      return candidate

  return DEFAULT_WEIGHTS_CANDIDATES[0]


def get_pipeline() -> ReportVerificationPipeline:
  global pipeline

  if pipeline is None:
    weights_path = resolve_weights_path()
    pipeline = ReportVerificationPipeline(
      weights_path=weights_path,
      confidence_threshold=float(os.environ.get("RIVERREVIVE_CONFIDENCE_THRESHOLD", "0.25")),
      iou_threshold=float(os.environ.get("RIVERREVIVE_IOU_THRESHOLD", "0.45")),
      image_size=int(os.environ.get("RIVERREVIVE_IMAGE_SIZE", "640")),
    )

  return pipeline


@app.get("/health")
def health() -> dict[str, object]:
  weights_path = resolve_weights_path()
  return {
    "status": "ok",
    "weights_path": str(weights_path),
    "weights_exists": weights_path.exists(),
    "default_candidates": [str(candidate) for candidate in DEFAULT_WEIGHTS_CANDIDATES],
  }


@app.post("/verify-report")
async def verify_report(
  image: UploadFile = File(...),
  browser_lat: float = Form(...),
  browser_lng: float = Form(...),
  metadata_threshold_m: int = Form(250),
  run_detection_when_metadata_rejected: bool = Form(False),
  authorization: str | None = Header(default=None),
) -> dict[str, object]:
  require_service_token(authorization)
  suffix = Path(image.filename or "upload.jpg").suffix or ".jpg"
  file_bytes = await image.read()

  with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
    temp_file.write(file_bytes)
    temp_path = Path(temp_file.name)

  try:
    result = get_pipeline().verify_report(
      image_path=temp_path,
      browser_location=Coordinates(lat=browser_lat, lng=browser_lng),
      metadata_threshold_meters=metadata_threshold_m,
      run_detection_when_metadata_rejected=run_detection_when_metadata_rejected,
    )
    return serialize_verification_result(result)
  finally:
    temp_path.unlink(missing_ok=True)
