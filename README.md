# Website starter (Business Brain)

Canonical Next.js 15 + Tailwind CSS 4 starter template. **Cloned to every new customer website at provision time.**

## Environment

- `NEXT_PUBLIC_GA_MEASUREMENT_ID` — optional. Unset on draft sites (no analytics). Set automatically at go-live via `manage_website action=go_live`.

## Google Ads attribution

`app/layout.tsx` stores `gclid` / `gbraid` / `wbraid` from an ad landing in a 90-day first-party cookie (`bb_click`); `app/api/contact/route.ts` forwards it with every lead. Business Brain reports the deal back to Google when it is won. Nothing to configure per site. Details: `docs/website/click-capture.md` in business_brain.

## Branches

- `main` — the upstream template. Updates here flow to future new sites, not existing ones.

## Local dev

```bash
npm install
npm run dev
```
