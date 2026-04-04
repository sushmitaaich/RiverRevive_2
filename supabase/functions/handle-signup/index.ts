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

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
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

const allowedRoles = new Set(["citizen", "collector", "admin"]);

function isMissingColumnError(message: string) {
  return /column|schema cache/i.test(message);
}

async function upsertProfile(profile: Record<string, unknown>) {
  return supAdmin.from("profiles").upsert(profile, {
    onConflict: "id",
  });
}

serve(async (req: { method: string; json: () => any; }) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: jsonHeaders,
    });
  }

  try {
    const payload = await req.json();
    const record = payload.record ?? payload.user ?? payload;
    const rawUserMetaData =
      record.raw_user_meta_data ?? record.user_metadata ?? {};

    if (!record?.id) {
      return new Response(JSON.stringify({ error: "Missing user id" }), {
        status: 400,
        headers: jsonHeaders,
      });
    }

    const role = allowedRoles.has(rawUserMetaData.role)
      ? rawUserMetaData.role
      : "citizen";
    const phone =
      rawUserMetaData.phone_number ?? rawUserMetaData.phone ?? null;

    const profilePayloads = [
      {
        id: record.id,
        email: record.email ?? null,
        full_name: rawUserMetaData.full_name ?? null,
        role,
        phone_number: phone,
        location: rawUserMetaData.location ?? null,
        organization: rawUserMetaData.organization ?? null,
        approved: false,
        status: "pending_approval",
        points: 0,
      },
      {
        id: record.id,
        full_name: rawUserMetaData.full_name ?? null,
        role,
        location: rawUserMetaData.location ?? null,
        phone,
      },
    ];

    for (const profile of profilePayloads) {
      const { error } = await upsertProfile(profile);

      if (!error) {
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: jsonHeaders,
        });
      }

      if (!isMissingColumnError(error.message)) {
        console.error("Failed to upsert profile:", error);

        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: jsonHeaders,
        });
      }
    }

    return new Response(JSON.stringify({ error: "Profiles schema mismatch" }), {
      status: 500,
      headers: jsonHeaders,
    });
  } catch (error) {
    console.error("handle-signup error:", error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal Server Error",
      }),
      {
        status: 500,
        headers: jsonHeaders,
      },
    );
  }
});