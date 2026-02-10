import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    // Verify the calling user
    const supabaseAuth = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { linkId } = await req.json();
    if (!linkId || typeof linkId !== "string") {
      throw new Error("Missing linkId");
    }

    // Use service role to read/update the link and get patient email
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the caregiver link
    const { data: link, error: linkError } = await supabase
      .from("caregiver_links")
      .select("*")
      .eq("id", linkId)
      .single();

    if (linkError || !link) {
      throw new Error("Caregiver link not found");
    }

    if (link.status !== "pending_confirmation") {
      throw new Error("Link is not pending confirmation");
    }

    // Get patient email from auth
    const { data: patientAuth, error: patientAuthError } = await supabase.auth.admin.getUserById(
      link.patient_user_id
    );

    if (patientAuthError || !patientAuth?.user?.email) {
      throw new Error("Could not find patient email");
    }

    // Get caregiver profile name
    const { data: caregiverProfile } = await supabase
      .from("user_profiles")
      .select("full_name")
      .eq("user_id", link.caregiver_user_id)
      .single();

    const caregiverName = caregiverProfile?.full_name || "Someone";

    // Generate confirmation token
    const confirmationToken = crypto.randomUUID();
    const confirmationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    // Store token on the link
    const { error: updateError } = await supabase
      .from("caregiver_links")
      .update({
        confirmation_token: confirmationToken,
        confirmation_expires_at: confirmationExpiresAt,
      })
      .eq("id", linkId);

    if (updateError) throw updateError;

    // Build confirmation URL
    const appUrl = req.headers.get("origin") || "https://tarvahealth.lovable.app";
    const confirmUrl = `${appUrl}/confirm-caregiver?token=${confirmationToken}`;

    // Send email
    const resend = new Resend(resendApiKey);
    const { error: emailError } = await resend.emails.send({
      from: "TARVA Health <noreply@tarvahealth.com>",
      to: [patientAuth.user.email],
      subject: `${caregiverName} wants to be your caregiver`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 16px;">
          <h2 style="color: #1a1a1a; margin-bottom: 8px;">New Caregiver Request</h2>
          <p style="color: #555; line-height: 1.6;">
            <strong>${caregiverName}</strong> has entered your invite code and is requesting access to your medication data and notifications.
          </p>
          <p style="color: #555; line-height: 1.6;">
            If you approve, they will be able to view your calendar, stats, and receive alerts based on the permissions you set.
          </p>
          <a href="${confirmUrl}" style="display: inline-block; background: #6366f1; color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 24px 0;">
            Approve Caregiver Access
          </a>
          <p style="color: #999; font-size: 13px; margin-top: 24px;">
            If you didn't create this invite, you can safely ignore this email. This link expires in 24 hours.
          </p>
        </div>
      `,
    });

    if (emailError) {
      console.error("Email send error:", emailError);
      throw new Error("Failed to send confirmation email");
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
