// @ts-ignore Supabase Edge Functions resolve Deno remote imports at runtime.
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
// @ts-ignore Supabase Edge Functions resolve Deno remote imports at runtime.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

declare const Deno: {
  env: {
    get(name: string): string | undefined;
  };
};

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const mlServiceUrl = Deno.env.get("ML_SERVICE_URL");
const mlServiceToken = Deno.env.get("ML_SERVICE_TOKEN");
const reportImageBucket = Deno.env.get("REPORT_IMAGE_BUCKET") ?? "waste-report-images";

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

if (!mlServiceUrl) {
  throw new Error("Missing ML_SERVICE_URL");
}

const supAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const jsonHeaders = {
  "Content-Type": "application/json",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: jsonHeaders,
  });
}

function getImageUrl(images: unknown) {
  if (!Array.isArray(images)) {
    return null;
  }

  const firstImage = images.find((item) => typeof item === "string" && item.length > 0);
  return typeof firstImage === "string" ? firstImage : null;
}

function deriveMlStatus(metadataStatus: unknown, detected: unknown, executed: unknown) {
  if (metadataStatus !== "verified") {
    return "rejected";
  }

  if (executed !== true) {
    return "pending";
  }

  return detected === true ? "verified" : "rejected";
}

function decodeBase64ToBytes(value: string) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

async function uploadAnnotatedImage(
  reportId: string,
  base64Image: string | null,
  mediaType: string | null,
) {
  if (!base64Image) {
    return null;
  }

  const uploadPath = `ml-annotated/${reportId}/verified-overlay.jpg`;
  const imageBytes = decodeBase64ToBytes(base64Image);
  const { error } = await supAdmin.storage
    .from(reportImageBucket)
    .upload(uploadPath, imageBytes, {
      upsert: true,
      contentType: mediaType ?? "image/jpeg",
    });

  if (error) {
    throw new Error(`Unable to upload annotated image: ${error.message}`);
  }

  const { data } = supAdmin.storage.from(reportImageBucket).getPublicUrl(uploadPath);
  return data.publicUrl;
}

serve(async (req: { method: string; json: () => Promise<Record<string, unknown>>; }) => {
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const payload = await req.json();
    const reportId = typeof payload.reportId === "string" ? payload.reportId : null;
    const runDetectionWhenMetadataRejected =
      payload.runDetectionWhenMetadataRejected === true;

    if (!reportId) {
      return jsonResponse({ error: "Missing reportId" }, 400);
    }

    const { data: report, error: reportError } = await supAdmin
      .from("garbage_reports")
      .select("id, images, reported_latitude, reported_longitude")
      .eq("id", reportId)
      .single();

    if (reportError || !report) {
      return jsonResponse({ error: reportError?.message ?? "Report not found" }, 404);
    }

    const imageUrl = getImageUrl(report.images);

    if (!imageUrl) {
      return jsonResponse({ error: "Report does not contain an uploaded image" }, 400);
    }

    const browserLat = report.reported_latitude;
    const browserLng = report.reported_longitude;

    if (typeof browserLat !== "number" || typeof browserLng !== "number") {
      return jsonResponse({ error: "Report does not contain browser coordinates" }, 400);
    }

    const imageResponse = await fetch(imageUrl);

    if (!imageResponse.ok) {
      return jsonResponse(
        {
          error: `Unable to download report image from storage (${imageResponse.status})`,
        },
        502,
      );
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const imageContentType = imageResponse.headers.get("content-type") ?? "image/jpeg";
    const fileName = imageUrl.split("/").pop() ?? `${reportId}.jpg`;

    const formData = new FormData();
    formData.append(
      "image",
      new Blob([imageBuffer], { type: imageContentType }),
      fileName,
    );
    formData.append("browser_lat", String(browserLat));
    formData.append("browser_lng", String(browserLng));
    formData.append(
      "run_detection_when_metadata_rejected",
      String(runDetectionWhenMetadataRejected),
    );

    const headers = new Headers();
    if (mlServiceToken) {
      headers.set("Authorization", `Bearer ${mlServiceToken}`);
    }

    const mlResponse = await fetch(`${mlServiceUrl.replace(/\/$/, "")}/verify-report`, {
      method: "POST",
      headers,
      body: formData,
    });

    const verification = await mlResponse.json();

    if (!mlResponse.ok) {
      return jsonResponse(
        {
          error: "ML service verification failed",
          details: verification,
        },
        502,
      );
    }

    const metadata = verification.metadata ?? {};
    const detection = verification.detection ?? {};
    const priority = verification.priority ?? {};
    const annotatedImageUrl = await uploadAnnotatedImage(
      reportId,
      typeof detection.annotated_image_base64 === "string"
        ? detection.annotated_image_base64
        : null,
      typeof detection.annotated_image_media_type === "string"
        ? detection.annotated_image_media_type
        : null,
    );

    const updatePayload = {
      metadata_latitude: metadata.metadata_location?.lat ?? null,
      metadata_longitude: metadata.metadata_location?.lng ?? null,
      metadata_distance_m: metadata.distance_meters ?? null,
      metadata_status: metadata.status ?? "pending",
      verification_notes: verification.verification_message ?? metadata.note ?? null,
      status: verification.final_status ?? "pending",
      priority_level: priority.level ?? null,
      priority_score: priority.score ?? null,
      ml_status: deriveMlStatus(metadata.status, detection.has_garbage, detection.executed),
      ml_detected: detection.has_garbage ?? false,
      ml_total_coverage: detection.total_coverage_ratio ?? null,
      ml_box_count: detection.box_count ?? 0,
      ml_confidence: detection.average_confidence ?? null,
      ml_detected_types: detection.waste_types ?? [],
      ml_detections: detection.boxes ?? [],
      ml_model_version: verification.model_version ?? null,
      ml_processed_at: new Date().toISOString(),
      ml_notes: detection.note ?? null,
      ml_annotated_image_url: annotatedImageUrl,
    };

    const { error: updateError } = await supAdmin
      .from("garbage_reports")
      .update(updatePayload)
      .eq("id", reportId);

    if (updateError) {
      return jsonResponse({ error: updateError.message }, 500);
    }

    return jsonResponse({
      success: true,
      reportId,
      verification,
    });
  } catch (error) {
    console.error("verify-report error:", error);

    return jsonResponse(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      500,
    );
  }
});
