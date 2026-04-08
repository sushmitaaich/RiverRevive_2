DEFAULT_METADATA_THRESHOLD_METERS = 250
DEFAULT_CONFIDENCE_THRESHOLD = 0.25
DEFAULT_IOU_THRESHOLD = 0.45
DEFAULT_IMAGE_SIZE = 640

# Higher weights push hazardous or hard-to-clean waste upward in priority scoring.
DEFAULT_CLASS_SEVERITY = {
  "battery": 1.45,
  "remote": 1.25,
  "glassbottle": 1.15,
  "can": 1.0,
  "bottle": 0.95,
  "tetrapack": 0.9,
  "wrapper": 0.75,
}
