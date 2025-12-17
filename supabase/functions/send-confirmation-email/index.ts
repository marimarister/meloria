import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConfirmationEmailRequest {
  email: string;
  name: string;
  confirmationUrl: string;
}

// Allowed domains for confirmation URLs
const ALLOWED_ORIGINS = [
  "https://mjycqdtvrymajcgbtgfu.lovableproject.com",
  "https://meloria.lovable.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Validate input parameters
function validateInput(email: string, name: string, confirmationUrl: string): string | null {
  // Validate email format
  if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
    return "Invalid email format";
  }
  
  // Validate email length
  if (email.length > 255) {
    return "Email address too long";
  }

  // Validate name
  if (!name || typeof name !== "string") {
    return "Name is required";
  }
  
  // Validate name length and characters (alphanumeric, spaces, hyphens, apostrophes)
  const trimmedName = name.trim();
  if (trimmedName.length < 1 || trimmedName.length > 100) {
    return "Name must be between 1 and 100 characters";
  }
  
  if (!/^[a-zA-Z\s\-']+$/.test(trimmedName)) {
    return "Name contains invalid characters";
  }

  // Validate confirmation URL
  if (!confirmationUrl || typeof confirmationUrl !== "string") {
    return "Confirmation URL is required";
  }

  // Validate URL domain against allowed origins
  const isAllowedOrigin = ALLOWED_ORIGINS.some(origin => 
    confirmationUrl.startsWith(origin)
  );
  
  if (!isAllowedOrigin) {
    console.error("Invalid confirmation URL origin:", confirmationUrl);
    return "Invalid confirmation URL domain";
  }

  return null;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-confirmation-email function called");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { email, name, confirmationUrl } = body as ConfirmationEmailRequest;
    
    // Validate all inputs
    const validationError = validateInput(email, name, confirmationUrl);
    if (validationError) {
      console.error("Validation error:", validationError);
      return new Response(
        JSON.stringify({ success: false, error: validationError }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedName = name.trim();
    
    console.log("Sending confirmation email to:", sanitizedEmail);

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #282828; font-size: 28px; margin: 0;">Meloria</h1>
        </div>
        
        <div style="background-color: #f8f9fa; border-radius: 12px; padding: 30px; margin-bottom: 20px;">
          <h2 style="color: #282828; margin-top: 0;">Welcome, ${sanitizedName}! 👋</h2>
          <p style="font-size: 16px; color: #555;">
            Thank you for registering with Meloria. We're excited to have you on board!
          </p>
          <p style="font-size: 16px; color: #555;">
            To complete your registration and start using our platform, please confirm your email address by clicking the button below:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmationUrl}" 
               style="display: inline-block; background-color: #282828; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Confirm My Email
            </a>
          </div>
          
          <p style="font-size: 14px; color: #777; margin-bottom: 0;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          <p style="font-size: 12px; color: #999; word-break: break-all;">
            ${confirmationUrl}
          </p>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #888; font-size: 12px;">
          <p>If you didn't create an account with Meloria, you can safely ignore this email.</p>
          <p style="margin-top: 20px;">© ${new Date().getFullYear()} Meloria. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Meloria <onboarding@resend.dev>",
        to: [sanitizedEmail],
        subject: "Welcome to Meloria - Please Confirm Your Email",
        html: emailHtml,
      }),
    });

    if (!res.ok) {
      const errorData = await res.text();
      console.error("Resend API error:", errorData);
      throw new Error(`Failed to send email`);
    }

    const data = await res.json();
    console.log("Email sent successfully");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending confirmation email:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Failed to send email" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
