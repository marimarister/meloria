import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EventInviteRequest {
  eventId: string;
  eventName: string;
  eventDescription: string;
  groupName: string;
  memberEmails: string[];
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { eventId, eventName, eventDescription, groupName, memberEmails }: EventInviteRequest = await req.json();

    console.log(`Sending event invites for event: ${eventName} to ${memberEmails.length} recipients`);

    if (!eventId || !eventName || !memberEmails || memberEmails.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: eventId, eventName, or memberEmails" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Send emails to all members
    const emailPromises = memberEmails.map(async (email) => {
      try {
        const result = await resend.emails.send({
          from: "Meloria <onboarding@resend.dev>",
          to: [email],
          subject: `You're invited: ${eventName}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #4C8D7D 0%, #367265 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
                .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
                .event-name { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
                .group-name { font-size: 14px; opacity: 0.9; }
                .description { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4C8D7D; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <div class="event-name">${eventName}</div>
                  <div class="group-name">From ${groupName}</div>
                </div>
                <div class="content">
                  <p>Hello,</p>
                  <p>You've been invited to a new event!</p>
                  ${eventDescription ? `<div class="description">${eventDescription}</div>` : ''}
                  <p>Check your Meloria Employee Dashboard for more details.</p>
                  <div class="footer">
                    <p>This invitation was sent by Meloria</p>
                  </div>
                </div>
              </div>
            </body>
            </html>
          `,
        });
        console.log(`Email sent to ${email}:`, result);
        return { email, success: true };
      } catch (error: any) {
        console.error(`Failed to send email to ${email}:`, error);
        return { email, success: false, error: error.message };
      }
    });

    const results = await Promise.all(emailPromises);
    const successCount = results.filter(r => r.success).length;
    const failedCount = results.filter(r => !r.success).length;

    console.log(`Event invites sent: ${successCount} successful, ${failedCount} failed`);

    return new Response(
      JSON.stringify({ 
        message: `Sent ${successCount} invitations`, 
        successCount, 
        failedCount,
        results 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-event-invites function:", error);
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
