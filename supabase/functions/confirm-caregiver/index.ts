import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Simple in-memory rate limiter per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 5; // max 5 attempts per minute per IP

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limit by IP
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                     req.headers.get("x-real-ip") || 
                     "unknown";
    if (isRateLimited(clientIP)) {
      return new Response(JSON.stringify({ error: "Too many requests" }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { token } = await req.json();

    // Validate token: must be a valid UUID v4 format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!token || typeof token !== "string" || !uuidRegex.test(token)) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find the link by confirmation token
    const { data: link, error: findError } = await supabase
      .from("caregiver_links")
      .select("*")
      .eq("confirmation_token", token)
      .eq("status", "pending_confirmation")
      .single();

    if (findError || !link) {
      return new Response(JSON.stringify({ error: "Invalid or expired confirmation link" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check expiration
    if (link.confirmation_expires_at && new Date(link.confirmation_expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: "Confirmation link has expired" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Activate the link
    const { error: updateError } = await supabase
      .from("caregiver_links")
      .update({
        status: "active",
        confirmation_token: null,
        confirmation_expires_at: null,
        invite_code: null,
      })
      .eq("id", link.id);

    if (updateError) throw updateError;

    // Create default permissions
    const { error: permError } = await supabase
      .from("caregiver_permissions")
      .insert({
        patient_user_id: link.patient_user_id,
        caregiver_user_id: link.caregiver_user_id,
        can_view_calendar: true,
        can_view_stats: true,
        can_view_medications: true,
        can_receive_missed_alerts: true,
        can_receive_late_alerts: false,
        can_receive_refill_alerts: false,
        can_receive_low_battery_alerts: false,
        can_receive_dose_taken: false,
      });

    if (permError) {
      console.error("Permission creation error:", permError);
      // Non-fatal - link is already active
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Confirm caregiver error:", error);
    return new Response(JSON.stringify({ error: "Confirmation failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
