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
    created_at: string;
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

    if (resendApiKey && notificationEmail) {
      try {
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: "The Lab <notifications@yourdomain.com>",
            to: [notificationEmail],
            subject: "New Newsletter Subscriber",
            html: `
              <h2>New Newsletter Subscriber</h2>
              <p><strong>Email:</strong> ${record.email}</p>
              <p><strong>Subscribed at:</strong> ${new Date(record.created_at).toLocaleString()}</p>
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
    const googleSheetsApiKey = Deno.env.get("GOOGLE_SHEETS_API_KEY");
    const spreadsheetId = Deno.env.get("GOOGLE_SPREADSHEET_ID");

    if (googleSheetsApiKey && spreadsheetId) {
      try {
        const range = "Sheet1!A:C";
        const values = [[
          record.email,
          new Date(record.created_at).toLocaleString(),
          record.status,
        ]];

        const sheetsResponse = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED&key=${googleSheetsApiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
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
      } catch (error) {
        results.sheets.error = `Sheets error: ${error.message}`;
      }
    } else {
      results.sheets.error = "Google Sheets API key or spreadsheet ID not configured";
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
