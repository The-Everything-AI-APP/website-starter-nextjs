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

/**
 * Google Ads click id, captured into the `bb_click` cookie by app/layout.tsx
 * when the visitor landed from an ad. Same-origin fetch() sends it with the
 * form post, so no hidden fields are needed however the form is built. Shape
 * is re-checked here and again by the backend; anything odd is dropped.
 */
function readClick(req: Request): { clickId: string; clickIdKind: string; clickAt?: string; landingUrl?: string } | null {
  try {
    const cookie = req.headers.get("cookie") || "";
    const m = cookie.match(/(?:^|;\s*)bb_click=([^;]+)/);
    if (!m) return null;
    const r = JSON.parse(decodeURIComponent(m[1])) as { id?: unknown; kind?: unknown; ts?: unknown; landing?: unknown };
    if (typeof r.id !== "string" || !/^[A-Za-z0-9_-]{8,200}$/.test(r.id)) return null;
    if (r.kind !== "gclid" && r.kind !== "gbraid" && r.kind !== "wbraid") return null;
    return {
      clickId: r.id,
      clickIdKind: r.kind,
      clickAt: typeof r.ts === "string" ? r.ts : undefined,
      landingUrl: typeof r.landing === "string" ? r.landing.slice(0, 500) : undefined,
    };
  } catch {
    return null;
  }
}

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
        ...(readClick(req) ?? {}),
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
