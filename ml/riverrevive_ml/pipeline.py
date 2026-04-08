from __future__ import annotations

import base64
import io
import math
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any

import numpy as np
from PIL import ExifTags, Image
from ultralytics import YOLO

from .settings import (
  DEFAULT_CLASS_SEVERITY,
  DEFAULT_CONFIDENCE_THRESHOLD,
  DEFAULT_IMAGE_SIZE,
  DEFAULT_IOU_THRESHOLD,
  DEFAULT_METADATA_THRESHOLD_METERS,
)

GPS_INFO_TAG = next((tag for tag, name in ExifTags.TAGS.items() if name == "GPSInfo"), None)


@dataclass(frozen=True)
class Coordinates:
  lat: float
  lng: float


@dataclass(frozen=True)
class BoundingBox:
  class_name: str
  confidence: float
  x1: float
  y1: float
  x2: float
  y2: float
  width: float
  height: float
  area_ratio: float


@dataclass(frozen=True)
class TypeSummary:
  label: str
  count: int
  coverage_ratio: float
  average_confidence: float


@dataclass(frozen=True)
class MetadataVerification:
  status: str
  browser_location: Coordinates
  metadata_location: Coordinates | None
  distance_meters: int | None
  threshold_meters: int
  note: str


@dataclass(frozen=True)
class DetectionSummary:
  executed: bool
  has_garbage: bool
  waste_types: list[str]
  dominant_type: str | None
  box_count: int
  average_confidence: float
  total_coverage_ratio: float
  boxes: list[BoundingBox] = field(default_factory=list)
  type_summaries: list[TypeSummary] = field(default_factory=list)
  note: str = ""
  annotated_image_base64: str | None = None
  annotated_image_media_type: str | None = None


@dataclass(frozen=True)
class PriorityAssessment:
  level: str | None
  score: int
  reasons: list[str] = field(default_factory=list)


@dataclass(frozen=True)
class ReportVerificationResult:
  metadata: MetadataVerification
  detection: DetectionSummary
  priority: PriorityAssessment
  final_status: str
  should_route_to_admin: bool
  verification_message: str
  model_version: str


def normalize_class_name(label: str) -> str:
  return label.strip().lower()


def _to_float(value: Any) -> float:
  if hasattr(value, "numerator") and hasattr(value, "denominator"):
    denominator = float(value.denominator or 1)
    return float(value.numerator) / denominator

  if isinstance(value, (tuple, list)):
    if len(value) == 2:
      numerator, denominator = value
      return float(numerator) / float(denominator or 1)
    if len(value) == 1:
      return float(value[0])

  return float(value)


def _dms_to_decimal(values: Any, reference: str | bytes | None) -> float:
  degrees = _to_float(values[0])
  minutes = _to_float(values[1])
  seconds = _to_float(values[2])
  decimal = degrees + minutes / 60 + seconds / 3600

  if reference in {"S", "W", b"S", b"W"}:
    return -decimal

  return decimal


def extract_exif_location(image_path: str | Path) -> Coordinates | None:
  if GPS_INFO_TAG is None:
    return None

  with Image.open(image_path) as image:
    exif = image.getexif()

  if not exif:
    return None

  gps_info = exif.get(GPS_INFO_TAG)
  if not gps_info:
    return None

  gps_map = {ExifTags.GPSTAGS.get(key, key): value for key, value in gps_info.items()}
  latitude_values = gps_map.get("GPSLatitude")
  longitude_values = gps_map.get("GPSLongitude")
  latitude_ref = gps_map.get("GPSLatitudeRef")
  longitude_ref = gps_map.get("GPSLongitudeRef")

  if not latitude_values or not longitude_values:
    return None

  try:
    return Coordinates(
      lat=_dms_to_decimal(latitude_values, latitude_ref),
      lng=_dms_to_decimal(longitude_values, longitude_ref),
    )
  except (TypeError, ValueError, ZeroDivisionError, IndexError):
    return None


def distance_meters(a: Coordinates, b: Coordinates) -> float:
  earth_radius = 6371000
  lat_delta = math.radians(b.lat - a.lat)
  lng_delta = math.radians(b.lng - a.lng)
  lat1 = math.radians(a.lat)
  lat2 = math.radians(b.lat)

  haversine = (
    math.sin(lat_delta / 2) ** 2
    + math.cos(lat1) * math.cos(lat2) * math.sin(lng_delta / 2) ** 2
  )

  return 2 * earth_radius * math.atan2(math.sqrt(haversine), math.sqrt(1 - haversine))


class ReportVerificationPipeline:
  def __init__(
    self,
    weights_path: str | Path,
    confidence_threshold: float = DEFAULT_CONFIDENCE_THRESHOLD,
    iou_threshold: float = DEFAULT_IOU_THRESHOLD,
    image_size: int = DEFAULT_IMAGE_SIZE,
    class_severity: dict[str, float] | None = None,
  ) -> None:
    self.weights_path = Path(weights_path)
    self.model_version = self.weights_path.name
    self.confidence_threshold = confidence_threshold
    self.iou_threshold = iou_threshold
    self.image_size = image_size
    self.class_severity = class_severity or DEFAULT_CLASS_SEVERITY
    self.model = YOLO(str(self.weights_path))

  def _build_annotated_image(self, result: Any) -> tuple[str | None, str | None]:
    plotted = result.plot()
    if plotted is None:
      return None, None

    image = Image.fromarray(plotted[..., ::-1])
    buffer = io.BytesIO()
    image.save(buffer, format="JPEG", quality=90)
    encoded = base64.b64encode(buffer.getvalue()).decode("ascii")
    return encoded, "image/jpeg"

  def verify_metadata(
    self,
    browser_location: Coordinates,
    metadata_location: Coordinates | None,
    threshold_meters: int = DEFAULT_METADATA_THRESHOLD_METERS,
  ) -> MetadataVerification:
    distance = (
      round(distance_meters(browser_location, metadata_location))
      if metadata_location is not None
      else None
    )

    if metadata_location is None:
      return MetadataVerification(
        status="rejected",
        browser_location=browser_location,
        metadata_location=None,
        distance_meters=None,
        threshold_meters=threshold_meters,
        note="Photo metadata is missing GPS coordinates.",
      )

    if distance is not None and distance <= threshold_meters:
      return MetadataVerification(
        status="verified",
        browser_location=browser_location,
        metadata_location=metadata_location,
        distance_meters=distance,
        threshold_meters=threshold_meters,
        note="Photo metadata matched the browser location.",
      )

    return MetadataVerification(
      status="rejected",
      browser_location=browser_location,
      metadata_location=metadata_location,
      distance_meters=distance,
      threshold_meters=threshold_meters,
      note="Photo metadata did not match the browser location closely enough.",
    )

  def _empty_detection(self, note: str, executed: bool) -> DetectionSummary:
    return DetectionSummary(
      executed=executed,
      has_garbage=False,
      waste_types=[],
      dominant_type=None,
      box_count=0,
      average_confidence=0.0,
      total_coverage_ratio=0.0,
      boxes=[],
      type_summaries=[],
      note=note,
      annotated_image_base64=None,
      annotated_image_media_type=None,
    )

  def detect_garbage(self, image_path: str | Path) -> DetectionSummary:
    results = self.model.predict(
      source=str(image_path),
      conf=self.confidence_threshold,
      iou=self.iou_threshold,
      imgsz=self.image_size,
      verbose=False,
    )

    result = results[0]
    boxes = result.boxes
    annotated_image_base64, annotated_image_media_type = self._build_annotated_image(result)

    if boxes is None or len(boxes) == 0:
      return self._empty_detection(
        note="No garbage classes were detected by the model.",
        executed=True,
      )

    image_height, image_width = result.orig_shape
    image_area = float(max(image_height * image_width, 1))
    total_mask = np.zeros((image_height, image_width), dtype=np.uint8)
    class_masks: dict[str, np.ndarray] = {}
    class_counts: dict[str, int] = {}
    class_confidences: dict[str, list[float]] = {}
    class_display_names: dict[str, str] = {}
    parsed_boxes: list[BoundingBox] = []

    coordinates = boxes.xyxy.tolist()
    classes = boxes.cls.tolist()
    confidences = boxes.conf.tolist()

    for xyxy, class_index, confidence in zip(coordinates, classes, confidences):
      if isinstance(result.names, dict):
        class_label = str(result.names.get(int(class_index), int(class_index)))
      else:
        class_label = str(result.names[int(class_index)])

      normalized_label = normalize_class_name(class_label)
      x1, y1, x2, y2 = [float(value) for value in xyxy]
      clipped_x1 = max(0, min(image_width, int(math.floor(x1))))
      clipped_y1 = max(0, min(image_height, int(math.floor(y1))))
      clipped_x2 = max(0, min(image_width, int(math.ceil(x2))))
      clipped_y2 = max(0, min(image_height, int(math.ceil(y2))))

      if clipped_x2 <= clipped_x1 or clipped_y2 <= clipped_y1:
        continue

      total_mask[clipped_y1:clipped_y2, clipped_x1:clipped_x2] = 1
      if normalized_label not in class_masks:
        class_masks[normalized_label] = np.zeros((image_height, image_width), dtype=np.uint8)
      class_masks[normalized_label][clipped_y1:clipped_y2, clipped_x1:clipped_x2] = 1

      class_display_names[normalized_label] = class_label
      class_counts[normalized_label] = class_counts.get(normalized_label, 0) + 1
      class_confidences.setdefault(normalized_label, []).append(float(confidence))

      box_width = float(clipped_x2 - clipped_x1)
      box_height = float(clipped_y2 - clipped_y1)
      area_ratio = (box_width * box_height) / image_area
      parsed_boxes.append(
        BoundingBox(
          class_name=class_label,
          confidence=float(confidence),
          x1=float(clipped_x1),
          y1=float(clipped_y1),
          x2=float(clipped_x2),
          y2=float(clipped_y2),
          width=box_width,
          height=box_height,
          area_ratio=float(area_ratio),
        )
      )

    if not parsed_boxes:
      return self._empty_detection(
        note="The model returned invalid boxes after clipping.",
        executed=True,
      )

    type_summaries = [
      TypeSummary(
        label=class_display_names[class_name],
        count=class_counts[class_name],
        coverage_ratio=float(class_masks[class_name].mean()),
        average_confidence=float(sum(class_confidences[class_name]) / len(class_confidences[class_name])),
      )
      for class_name in class_counts
    ]
    type_summaries.sort(
      key=lambda item: (item.coverage_ratio, item.count, item.average_confidence),
      reverse=True,
    )

    average_confidence = float(sum(box.confidence for box in parsed_boxes) / len(parsed_boxes))
    dominant_type = type_summaries[0].label if type_summaries else None

    return DetectionSummary(
      executed=True,
      has_garbage=True,
      waste_types=[summary.label for summary in type_summaries],
      dominant_type=dominant_type,
      box_count=len(parsed_boxes),
      average_confidence=average_confidence,
      total_coverage_ratio=float(total_mask.mean()),
      boxes=parsed_boxes,
      type_summaries=type_summaries,
      note="Garbage detected by the model.",
      annotated_image_base64=annotated_image_base64,
      annotated_image_media_type=annotated_image_media_type,
    )

  def assess_priority(self, detection: DetectionSummary) -> PriorityAssessment:
    if not detection.executed:
      return PriorityAssessment(level=None, score=0, reasons=[detection.note])

    if not detection.has_garbage:
      return PriorityAssessment(level=None, score=0, reasons=["No garbage detected by the model."])

    weighted_coverage = sum(
      summary.coverage_ratio * self.class_severity.get(normalize_class_name(summary.label), 1.0)
      for summary in detection.type_summaries
    )
    highest_severity = max(
      self.class_severity.get(normalize_class_name(summary.label), 1.0)
      for summary in detection.type_summaries
    )
    score = int(
      round(
        min(
          100,
          weighted_coverage * 160
          + min(detection.box_count, 10) * 2.5
          + highest_severity * 12
          + detection.average_confidence * 8,
        )
      )
    )

    if score >= 75 or (
      highest_severity >= 1.35 and detection.total_coverage_ratio >= 0.10
    ):
      level = "critical"
    elif score >= 55 or (
      highest_severity >= 1.15 and detection.total_coverage_ratio >= 0.08
    ):
      level = "high"
    elif score >= 30:
      level = "medium"
    else:
      level = "low"

    reasons = [
      f"Coverage ratio is {detection.total_coverage_ratio:.1%}.",
      f"Detected {detection.box_count} object(s).",
      f"Dominant type is {detection.dominant_type}.",
    ]

    if highest_severity >= 1.25:
      reasons.append("Detected waste includes a hazardous or sensitive category.")

    return PriorityAssessment(level=level, score=score, reasons=reasons)

  def verify_report(
    self,
    image_path: str | Path,
    browser_location: Coordinates,
    metadata_threshold_meters: int = DEFAULT_METADATA_THRESHOLD_METERS,
    run_detection_when_metadata_rejected: bool = False,
  ) -> ReportVerificationResult:
    metadata_location = extract_exif_location(image_path)
    metadata = self.verify_metadata(
      browser_location=browser_location,
      metadata_location=metadata_location,
      threshold_meters=metadata_threshold_meters,
    )

    if metadata.status != "verified" and not run_detection_when_metadata_rejected:
      detection = self._empty_detection(
        note="Detection skipped because location verification failed.",
        executed=False,
      )
    else:
      detection = self.detect_garbage(image_path)

    priority = self.assess_priority(detection)
    should_route_to_admin = metadata.status == "verified" and detection.has_garbage
    final_status = "pending" if should_route_to_admin else "rejected"

    if metadata.status != "verified":
      verification_message = metadata.note
    elif detection.has_garbage:
      verification_message = (
        f"Metadata verified and garbage detected. Assigned {priority.level} priority."
      )
    else:
      verification_message = "Metadata verified, but the model did not detect garbage in the image."

    return ReportVerificationResult(
      metadata=metadata,
      detection=detection,
      priority=priority,
      final_status=final_status,
      should_route_to_admin=should_route_to_admin,
      verification_message=verification_message,
      model_version=self.model_version,
    )


def serialize_verification_result(result: ReportVerificationResult) -> dict[str, Any]:
  return asdict(result)
