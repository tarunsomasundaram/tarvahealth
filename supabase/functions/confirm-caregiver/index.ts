import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token } = await req.json();

    if (!token || typeof token !== "string" || token.length > 100) {
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
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
