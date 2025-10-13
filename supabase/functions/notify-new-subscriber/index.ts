import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SubscriberPayload {
  type: string;
  table: string;
  record: {
    id: string;
    email: string;
    status: string;
    subscribed_at: string;
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const payload: SubscriberPayload = await req.json();
    const { record } = payload;

    // Only process active subscriptions
    if (record.status !== "active") {
      return new Response(
        JSON.stringify({ message: "Subscription not active, skipping" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    const results = {
      email: { success: false, error: null as string | null },
      sheets: { success: false, error: null as string | null },
    };

    // Send email notification via Resend
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const notificationEmail = Deno.env.get("NOTIFICATION_EMAIL");
    // Default to resend test email which works without domain verification
    const fromEmail = Deno.env.get("FROM_EMAIL");
    const finalFromEmail = fromEmail || "onboarding@resend.dev";

    if (resendApiKey && notificationEmail) {
      try {
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: finalFromEmail,
            to: [notificationEmail],
            subject: "New Newsletter Subscriber",
            html: `
              <h2>New Newsletter Subscriber</h2>
              <p><strong>Email:</strong> ${record.email}</p>
              <p><strong>Subscribed at:</strong> ${new Date(record.subscribed_at).toLocaleString()}</p>
              <p><strong>Status:</strong> ${record.status}</p>
            `,
          }),
        });

        if (emailResponse.ok) {
          results.email.success = true;
        } else {
          const error = await emailResponse.text();
          results.email.error = `Resend API error: ${error}`;
        }
      } catch (error) {
        results.email.error = `Email error: ${error.message}`;
      }
    } else {
      results.email.error = "Resend API key or notification email not configured";
    }

    // Add to Google Sheets
    const googleServiceAccount = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_JSON");
    const spreadsheetId = Deno.env.get("GOOGLE_SPREADSHEET_ID");
    const sheetName = Deno.env.get("GOOGLE_SHEET_NAME") || "Sheet1";

    if (googleServiceAccount && spreadsheetId) {
      try {
        const serviceAccount = JSON.parse(googleServiceAccount);

        // Helper function for base64url encoding
        const base64url = (data: string | ArrayBuffer): string => {
          let base64;
          if (typeof data === 'string') {
            base64 = btoa(data);
          } else {
            base64 = btoa(String.fromCharCode(...new Uint8Array(data)));
          }
          return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
        };

        // Create JWT for Google OAuth
        const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
        const now = Math.floor(Date.now() / 1000);
        const claim = base64url(JSON.stringify({
          iss: serviceAccount.client_email,
          scope: "https://www.googleapis.com/auth/spreadsheets",
          aud: "https://oauth2.googleapis.com/token",
          exp: now + 3600,
          iat: now,
        }));

        const signatureInput = `${header}.${claim}`;

        // Import private key
        const privateKeyPem = serviceAccount.private_key;
        const pemContents = privateKeyPem
          .replace(/-----BEGIN PRIVATE KEY-----/, '')
          .replace(/-----END PRIVATE KEY-----/, '')
          .replace(/\s/g, '');
        const binaryKey = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));

        const key = await crypto.subtle.importKey(
          "pkcs8",
          binaryKey,
          { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
          false,
          ["sign"]
        );

        const signature = await crypto.subtle.sign(
          "RSASSA-PKCS1-v1_5",
          key,
          new TextEncoder().encode(signatureInput)
        );

        const jwt = `${signatureInput}.${base64url(signature)}`;

        // Get access token
        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
        });

        const tokenData = await tokenResponse.json();

        if (!tokenData.access_token) {
          results.sheets.error = `Failed to get access token: ${JSON.stringify(tokenData)}`;
        } else {
          // Append to sheet
          const range = `${sheetName}!A:C`;
          const values = [[
            record.email,
            new Date(record.subscribed_at).toLocaleString(),
            record.status,
          ]];

          const sheetsResponse = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${tokenData.access_token}`,
              },
              body: JSON.stringify({
                values: values,
              }),
            }
          );

          if (sheetsResponse.ok) {
            results.sheets.success = true;
          } else {
            const error = await sheetsResponse.text();
            results.sheets.error = `Google Sheets API error: ${error}`;
          }
        }
      } catch (error) {
        results.sheets.error = `Sheets error: ${error.message}`;
      }
    } else {
      results.sheets.error = "Google Service Account JSON or spreadsheet ID not configured";
    }

    return new Response(
      JSON.stringify({
        message: "Notification processing complete",
        results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
