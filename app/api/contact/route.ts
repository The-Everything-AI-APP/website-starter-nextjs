/**
 * Contact form server-side proxy.
 *
 * Customer's site posts JSON to /api/contact. THIS Route Handler runs on
 * Vercel (server-only) and forwards to api.the-everything-app.com with the
 * webhook secret pulled from process.env. The secret is NEVER exposed to
 * the browser — never use NEXT_PUBLIC_ for it.
 *
 * Required Vercel env vars (set during provisioning):
 *   BB_TENANT_ID         — tenant uuid
 *   BB_WEBHOOK_SECRET    — per-site secret (unique index on tenant_websites.webhook_secret)
 *
 * If the env vars are missing, the form returns a clear error rather than
 * silently dropping submissions.
 */

const BACKEND_URL = "https://api.the-everything-app.com/api/contact-form";

interface ContactBody {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  pageUrl?: string;
  website?: string; // honeypot — should be empty for real submissions
}

export async function POST(req: Request) {
  // Reject content-types that aren't JSON. Form posts must be fetch()'ed
  // with Content-Type: application/json by the page's submit handler.
  const ct = req.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    return Response.json({ error: "expected application/json" }, { status: 415 });
  }

  let data: ContactBody;
  try {
    data = await req.json();
  } catch {
    return Response.json({ error: "invalid json" }, { status: 400 });
  }

  // Honeypot — bots fill all visible+invisible fields. Drop silently with 200
  // so the bot thinks it succeeded.
  if (data.website && data.website.trim().length > 0) {
    return Response.json({ status: "received", message: "Thank you!" });
  }

  if (!data.name || !data.email || !data.message) {
    return Response.json({ error: "name, email and message required" }, { status: 400 });
  }

  const tenantId = process.env.BB_TENANT_ID;
  const webhookSecret = process.env.BB_WEBHOOK_SECRET;
  if (!tenantId || !webhookSecret) {
    // Fail loud — site owner needs to know provisioning is incomplete
    return Response.json({ error: "site not fully provisioned (BB env vars missing)" }, { status: 500 });
  }

  try {
    const r = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenantId,
        webhookSecret,
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message,
        pageUrl: data.pageUrl,
      }),
    });
    const json = await r.json().catch(() => ({}));
    return Response.json(json, { status: r.status });
  } catch {
    return Response.json({ error: "upstream unavailable" }, { status: 502 });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
