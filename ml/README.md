# RiverRevive ML Workspace

This folder contains the training and backend verification code for report-image garbage detection.

## Recommended starting point

Use YOLO11 for this project.

- Recommended baseline: `yolo11s.pt`
- Lower-compute fallback: `yolo11n.pt`

YOLO11 is the better default here because the project needs one detector to do three jobs at once:

- detect whether garbage is present
- classify the garbage type
- return bounding boxes that can be stored and shown later

## Dataset recommendation

Download the Roboflow dataset locally instead of training against a hosted link.

Local export is better because it gives you:

- a fixed dataset version for reproducible experiments
- offline training after download
- direct control over `data.yaml`, labels, and future retraining
- a stable path for the scripts in this repo

## Download location

Save the Roboflow export under:

`E:\RiverRevive_2\ml\datasets\roboflow\<project-slug>-v<version>\`

Example:

`E:\RiverRevive_2\ml\datasets\roboflow\garbage-detector-v3\`

The training script looks for the exported `data.yaml` inside that folder.

## Export format

Choose the Ultralytics-style dataset export from Roboflow.

- `YOLOv8`
- or `Ultralytics YOLO`

That format works for YOLO11 training as well because the training script only needs the standard Ultralytics `data.yaml` plus the image and label directories.

## Quick start

1. Create a Python virtual environment inside `ml/.venv`.
2. Install `ml/requirements.txt`.
3. Download the Roboflow dataset locally.
4. Run `python ml/train_yolo.py --data ml/datasets/roboflow/<dataset-folder>/data.yaml`
5. Start the verification API with `.\ml\start_verify_service.ps1`

## Environment variables

- `ROBOFLOW_API_KEY`: required for scripted dataset download
- `RIVERREVIVE_YOLO_WEIGHTS`: path to the trained weights used by the verification API
- `ML_SERVICE_URL`: URL used by the Supabase edge function, for example `http://localhost:8000`
- `ML_SERVICE_TOKEN`: optional shared secret forwarded to the ML service

## Using The Trained Land-Waste Model

If your trained checkpoint is saved as:

`E:\RiverRevive_2\ml\best.pt`

the verification API will now pick it up automatically even without setting `RIVERREVIVE_YOLO_WEIGHTS`.

For the full report-verification flow:

1. Run the SQL in `supabase/land_cleanup_schema.sql`, `supabase/ml_report_verification_schema.sql`, and `supabase/report_access_policies.sql`.
2. Deploy the `supabase/functions/verify-report` edge function.
3. Set `ML_SERVICE_URL` in the edge-function environment.
4. Set `VITE_ENABLE_BACKEND_REPORT_VERIFICATION=true` in your app environment.
5. Start the local verification API with `.\ml\start_verify_service.ps1`.

## Public ML Service URL

If your Supabase Edge Function is running in the cloud, `http://localhost:8000` will not work because it points to the Supabase runtime itself, not your laptop.

Use one of these approaches instead:

- Production: host the FastAPI service on a real server and set `ML_SERVICE_URL` to that public HTTPS URL.
- Development: start the API locally with `.\ml\start_verify_service.ps1`, expose it with `.\ml\start_verify_tunnel.ps1`, and then set the tunnel URL as `ML_SERVICE_URL`.

You can update the Supabase secret with:

`.\supabase\set_verify_report_secrets.ps1 -MlServiceUrl https://your-public-url`
