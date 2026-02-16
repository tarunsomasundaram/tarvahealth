import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const now = new Date();

    // Find all schedules that have escalation enabled
    const { data: schedulesWithEscalation, error: schedError } = await supabase
      .from("medication_schedules")
      .select("*, medications!inner(id, generic_name, user_id, is_active)")
      .not("escalation_delay_minutes", "is", null)
      .eq("medications.is_active", true);

    if (schedError) {
      console.error("Error fetching schedules:", schedError);
      return new Response(JSON.stringify({ error: schedError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!schedulesWithEscalation || schedulesWithEscalation.length === 0) {
      return new Response(JSON.stringify({ message: "No escalation schedules found", alerted: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let alertsSent = 0;

    for (const schedule of schedulesWithEscalation) {
      const med = schedule.medications;
      const userId = med.user_id;
      const escalationMinutes = schedule.escalation_delay_minutes;
      const timesOfDay: string[] = schedule.times_of_day || [];

      // Check each scheduled time for today
      for (const timeStr of timesOfDay) {
        const [hours, minutes] = timeStr.split(":").map(Number);
        const scheduledAt = new Date(now);
        scheduledAt.setHours(hours, minutes, 0, 0);

        // Only check if escalation window has passed
        const escalationThreshold = new Date(scheduledAt.getTime() + escalationMinutes * 60 * 1000);
        if (now < escalationThreshold) continue;

        // Don't check doses more than 4 hours past escalation (avoid old alerts)
        const maxAge = new Date(escalationThreshold.getTime() + 4 * 60 * 60 * 1000);
        if (now > maxAge) continue;

        // Check if dose was taken
        const { data: logs } = await supabase
          .from("dose_logs")
          .select("id, event_type, caregiver_alert_sent_at")
          .eq("medication_id", med.id)
          .eq("user_id", userId)
          .gte("scheduled_datetime", scheduledAt.toISOString())
          .lt("scheduled_datetime", new Date(scheduledAt.getTime() + 60000).toISOString());

        const takenLog = logs?.find((l: any) => l.event_type === "taken");
        if (takenLog) continue; // Dose was taken, no escalation needed

        // Check if alert was already sent (dedup)
        const existingAlert = logs?.find((l: any) => l.caregiver_alert_sent_at != null);
        if (existingAlert) continue;

        // Find active caregivers for this patient
        const { data: caregiverLinks } = await supabase
          .from("caregiver_links")
          .select("caregiver_user_id")
          .eq("patient_user_id", userId)
          .eq("status", "active");

        if (!caregiverLinks || caregiverLinks.length === 0) continue;

        // Check caregiver permissions for missed alerts
        for (const link of caregiverLinks) {
          const { data: perms } = await supabase
            .from("caregiver_permissions")
            .select("can_receive_missed_alerts")
            .eq("patient_user_id", userId)
            .eq("caregiver_user_id", link.caregiver_user_id)
            .maybeSingle();

          if (!perms?.can_receive_missed_alerts) continue;

          // Send notification to caregiver
          await supabase.from("notification_events").insert({
            user_id: link.caregiver_user_id,
            type: "caregiver_escalation",
            medication_id: med.id,
            scheduled_datetime: scheduledAt.toISOString(),
            event_datetime: now.toISOString(),
            metadata: {
              patient_user_id: userId,
              medication_name: med.generic_name,
              scheduled_time: timeStr,
              escalation_delay_minutes: escalationMinutes,
              message: `${med.generic_name} was not taken. Scheduled at ${timeStr}, now ${escalationMinutes} min overdue.`,
            },
            is_read: false,
          });

          alertsSent++;
        }

        // Mark the dose log with caregiver_alert_sent_at to prevent duplicate alerts
        // If there's an existing log (e.g., snoozed), update it; otherwise insert a placeholder
        if (logs && logs.length > 0) {
          await supabase
            .from("dose_logs")
            .update({ caregiver_alert_sent_at: now.toISOString() })
            .eq("id", logs[0].id);
        } else {
          // Insert a pending log so we can track the alert
          await supabase.from("dose_logs").insert({
            user_id: userId,
            medication_id: med.id,
            scheduled_datetime: scheduledAt.toISOString(),
            event_type: "missed",
            event_datetime: now.toISOString(),
            status: null,
            source: "manual",
            caregiver_alert_sent_at: now.toISOString(),
            notes: "Auto-escalated to caregiver",
          });
        }

        // Also notify the patient
        await supabase.from("notification_events").insert({
          user_id: userId,
          type: "escalation_sent",
          medication_id: med.id,
          scheduled_datetime: scheduledAt.toISOString(),
          event_datetime: now.toISOString(),
          metadata: {
            medication_name: med.generic_name,
            escalation_delay_minutes: escalationMinutes,
            message: `Your caregiver was notified that ${med.generic_name} was not taken.`,
          },
          is_read: false,
        });
      }
    }

    return new Response(
      JSON.stringify({ message: "Escalation check complete", alerted: alertsSent }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Escalation check error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
