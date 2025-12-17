import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TestResult {
  user_id: string;
  test_type: string;
  completed_at: string;
}

interface Profile {
  id: string;
  email: string | null;
  name: string;
  surname: string;
  preferred_language: string | null;
}

const getTestName = (testType: string, language: string) => {
  const names: Record<string, Record<string, string>> = {
    burnout: { en: "Burnout Test", lv: "Izdegšanas tests" },
    perception: { en: "Channel Perception Test", lv: "Uztveres kanālu tests" },
    preference: { en: "Work Preferences Test", lv: "Darba preferenču tests" },
  };
  return names[testType]?.[language] || names[testType]?.en || testType;
};

const getEmailContent = (
  name: string,
  overdueTests: { testType: string; daysOverdue: number }[],
  dueSoonTests: { testType: string; daysUntilDue: number }[],
  language: string
) => {
  const isLatvian = language === "lv";

  const subject = isLatvian
    ? "Meloria: Atgādinājums par testiem"
    : "Meloria: Test Reminder";

  let html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #4C8D7D;">${isLatvian ? "Sveiki" : "Hello"}, ${name}!</h1>
  `;

  if (overdueTests.length > 0) {
    html += `
      <div style="background-color: #FEE2E2; border: 1px solid #FECACA; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
        <h2 style="color: #DC2626; margin-top: 0;">${isLatvian ? "Nokavēti testi" : "Overdue Tests"}</h2>
        <ul style="margin: 0; padding-left: 20px;">
          ${overdueTests
            .map(
              (t) =>
                `<li style="margin-bottom: 8px;"><strong>${getTestName(t.testType, language)}</strong> - ${Math.abs(t.daysOverdue)} ${isLatvian ? "dienas nokavēts" : "days overdue"}</li>`
            )
            .join("")}
        </ul>
      </div>
    `;
  }

  if (dueSoonTests.length > 0) {
    html += `
      <div style="background-color: #FEF3C7; border: 1px solid #FDE68A; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
        <h2 style="color: #D97706; margin-top: 0;">${isLatvian ? "Drīz jāveic testi" : "Tests Due Soon"}</h2>
        <ul style="margin: 0; padding-left: 20px;">
          ${dueSoonTests
            .map(
              (t) =>
                `<li style="margin-bottom: 8px;"><strong>${getTestName(t.testType, language)}</strong> - ${isLatvian ? "jāveic pēc" : "due in"} ${t.daysUntilDue} ${t.daysUntilDue === 1 ? (isLatvian ? "dienas" : "day") : (isLatvian ? "dienām" : "days")}</li>`
            )
            .join("")}
        </ul>
      </div>
    `;
  }

  html += `
      <p style="color: #666; margin-top: 24px;">
        ${isLatvian 
          ? "Lūdzu, apmeklējiet savu Meloria paneli, lai veiktu testus." 
          : "Please visit your Meloria dashboard to complete your tests."}
      </p>
      <p style="color: #999; font-size: 12px; margin-top: 32px;">
        ${isLatvian 
          ? "Šis ir automātisks atgādinājums no Meloria." 
          : "This is an automated reminder from Meloria."}
      </p>
    </div>
  `;

  return { subject, html };
};

const handler = async (req: Request): Promise<Response> => {
  console.log("send-test-reminders function invoked");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Verify this is an authorized internal call (from pg_cron or admin)
  // Check for service role key in authorization header OR valid admin JWT
  const authHeader = req.headers.get("Authorization");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  
  // Allow calls with service role key (from pg_cron)
  const isServiceCall = authHeader?.includes(serviceRoleKey || "INVALID");
  
  if (!isServiceCall && authHeader) {
    // If not service call, verify it's a Meloria admin
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
    if (userError || !user) {
      console.error("Unauthorized call attempt");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if user is Meloria admin
    const { data: adminData } = await supabaseAuth
      .from("meloria_admins")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!adminData) {
      console.error("Non-admin call attempt");
      return new Response(
        JSON.stringify({ error: "Forbidden: Admin access required" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    console.log(`Admin ${user.id} manually triggered test reminders`);
  } else if (!isServiceCall) {
    console.error("No authorization provided");
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } else {
    console.log("Service role call (pg_cron) authorized");
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all test results
    const { data: testResults, error: testError } = await supabase
      .from("test_results")
      .select("user_id, test_type, completed_at");

    if (testError) {
      console.error("Error fetching test results:", testError);
      throw testError;
    }

    console.log(`Found ${testResults?.length || 0} test results`);

    // Group results by user
    const userTestsMap = new Map<string, TestResult[]>();
    (testResults || []).forEach((result: TestResult) => {
      const existing = userTestsMap.get(result.user_id) || [];
      existing.push(result);
      userTestsMap.set(result.user_id, existing);
    });

    const now = new Date();
    const emailsSent: string[] = [];
    const errors: string[] = [];

    // Process each user
    for (const [userId, tests] of userTestsMap) {
      const overdueTests: { testType: string; daysOverdue: number }[] = [];
      const dueSoonTests: { testType: string; daysUntilDue: number }[] = [];

      tests.forEach((test) => {
        const completedAt = new Date(test.completed_at);
        const nextDue = new Date(completedAt);
        nextDue.setMonth(nextDue.getMonth() + 1);

        const diffTime = nextDue.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
          overdueTests.push({ testType: test.test_type, daysOverdue: diffDays });
        } else if (diffDays <= 7) {
          dueSoonTests.push({ testType: test.test_type, daysUntilDue: diffDays });
        }
      });

      // Only send email if there are tests due or overdue
      if (overdueTests.length === 0 && dueSoonTests.length === 0) {
        continue;
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, email, name, surname, preferred_language")
        .eq("id", userId)
        .single();

      if (profileError || !profile?.email) {
        console.error(`Error fetching profile for user ${userId}:`, profileError);
        errors.push(`User ${userId}: ${profileError?.message || "No email"}`);
        continue;
      }

      const language = profile.preferred_language || "en";
      const { subject, html } = getEmailContent(
        profile.name,
        overdueTests,
        dueSoonTests,
        language
      );

      try {
        const emailResponse = await resend.emails.send({
          from: "Meloria <onboarding@resend.dev>",
          to: [profile.email],
          subject,
          html,
        });

        console.log(`Email sent to ${profile.email}:`, emailResponse);
        emailsSent.push(profile.email);
      } catch (emailError: any) {
        console.error(`Error sending email to ${profile.email}:`, emailError);
        errors.push(`${profile.email}: ${emailError.message}`);
      }
    }

    console.log(`Emails sent: ${emailsSent.length}, Errors: ${errors.length}`);

    return new Response(
      JSON.stringify({
        success: true,
        emailsSent: emailsSent.length,
        emails: emailsSent,
        errors: errors.length > 0 ? errors : undefined,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-test-reminders function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
