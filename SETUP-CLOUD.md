# AgriMan cloud sync

Live app: https://agriman.agribakr.workers.dev/

## Cloudflare Git deploy settings

| Setting | Value |
|--------|--------|
| Build command | *(leave empty)* |
| **Deploy command** | `npx wrangler deploy ./src/worker.js --assets=.` |

## Email on register (Resend)

Registration is **email only**. The Worker sends **FarmerID** + **password** via [Resend](https://resend.com).

### 1. API key (Cloudflare secret)

**Workers & Pages → agriman → Settings → Variables and Secrets** → add encrypted secret:

- Name: `RESEND_API_KEY`
- Value: your `re_…` key from Resend

Or: `npx wrangler secret put RESEND_API_KEY`

### 1b. Brevo fallback (send to any farmer email)

Resend needs a **verified domain** (`agribak.com` is not registered yet). To deliver welcome mail to **whatever address farmers enter**, add [Brevo](https://www.brevo.com) (free tier):

1. Brevo → **Settings → Senders** → add **`mhmd.manaysah@gmail.com`** (or your `BREVO_SENDER` in `wrangler.toml`) → verify the 6-digit code in that inbox.
2. Brevo → **SMTP & API → API keys** → create key.
3. Cloudflare → agriman → **Secrets** → `BREVO_API_KEY` = your Brevo key  
   Or: `npx wrangler secret put BREVO_API_KEY`

The Worker tries **Resend first**, then **Brevo** to the farmer’s email. Health: `"email_brevo": true` when the secret is set.

### 2. Sender address (`EMAIL_FROM`)

Configured in [wrangler.toml](wrangler.toml) and deployed with the Worker.

**Important:** In **Cloudflare → agriman → Settings → Variables**, remove any old **`EMAIL_FROM`** that points at an **unverified** domain (e.g. `@agribak.com` before DNS is done). Otherwise sends fail with “domain is not verified.”

After deploy, health shows the active sender:

https://agriman.agribakr.workers.dev/api/farm/health → `"email_ready": true`, `"email_from": "..."`

The Worker tries **`EMAIL_FROM`**, then falls back to **`onboarding@resend.dev`** if the primary domain is not verified yet.

### 403 in Resend logs

| Log message | Cause | Fix |
|-------------|--------|-----|
| **domain is not verified** | `EMAIL_FROM` uses `@mail.agribak.com` but Resend shows that domain **Not verified** | Resend → Domains → `mail.agribak.com` → add all DNS records (DKIM/SPF). On Cloudflare, DNS-only (grey cloud) on Resend CNAMEs. Wait until **Verified**. |
| **only send testing emails to your own email** | Fallback `onboarding@resend.dev` cannot mail arbitrary farmers | Same as above — verify `mail.agribak.com` so sends use `noreply@mail.agribak.com`. |
| **from domain does not match** verified domain | Typo in `EMAIL_FROM` vs domain added in Resend | `wrangler.toml` must use the **exact** subdomain you verified (e.g. `noreply@mail.agribak.com`, not `@agribak.com`). |

After DNS verifies, redeploy is automatic on push to `main`. Register again and check Resend → Logs.

### 3. Production sender (live farmers)

1. [resend.com/domains](https://resend.com/domains) → **Add** → `mail.agribak.com`
2. At your DNS host (often Cloudflare), add **every** record Resend lists (SPF, DKIM, etc.)
3. Wait until Resend shows **Verified**
4. Deploy this repo — `wrangler.toml` uses:
   ```toml
   EMAIL_FROM = "AgriMan <noreply@mail.agribak.com>"
   ```
5. Do **not** set `EMAIL_TEST_TO` in Cloudflare Variables unless you want all mail routed to one inbox for debugging.

If the domain is not verified yet, the Worker falls back to `onboarding@resend.dev` (Resend account email only).

### 4. Temporary testing (optional)

Uncomment in `wrangler.toml`:

```toml
EMAIL_TEST_TO = "your-resend-login@gmail.com"
```

Welcome mail goes there regardless of register email. Remove before go-live.

### 5. Verify delivery

1. [resend.com/domains](https://resend.com/domains) → **Add** → `agribak.com`
2. Add the DNS records Resend shows (SPF, DKIM, etc.) where `agribak.com` DNS is hosted (often Cloudflare DNS).
3. Wait until Resend status is **Verified**.
4. In `wrangler.toml`, set:
   ```toml
   EMAIL_FROM = "AgriMan <hello@agribak.com>"
   ```
5. Push / deploy.

Until then, with `onboarding@resend.dev`, Resend only delivers to **your Resend account email** (and test addresses like `delivered@resend.dev`). Do **not** use `@example.com` — Resend blocks it.

### 4. Test

- Health: `"email_ready": true`
- Register with your **real inbox** (same as Resend login until domain is verified)
- Check spam; Resend **Logs** show accept/reject reasons

## Admin panel

URL: https://agriman.agribakr.workers.dev/admin.html

1. Set Worker secret **`ADMIN_PASSWORD`** (at least 8 characters):
   ```bash
   npx wrangler secret put ADMIN_PASSWORD
   ```
   Or Cloudflare → agriman → Variables → encrypted **`ADMIN_PASSWORD`**.

2. Optional var **`ADMIN_USERNAME`** in [wrangler.toml](wrangler.toml) (default `admin`).

3. Log in → list farmers, **Export JSON**, **Delete** (removes farmer, farms, and sessions).

Health: `"admin_ready": true` when `ADMIN_PASSWORD` is set.

## API overview

| Route | Purpose |
|-------|---------|
| `GET /api/farm/health` | D1 + `email_ready` + `email_from` |
| `POST /api/farmer/register` | email + password → `Agri-####` + welcome email |
| `POST /api/farmer/login` | FarmerID + password |
| `POST /api/admin/login` | admin username + password |
| `POST /api/admin/farmers/list` | all farmers (admin token) |
| `POST /api/admin/farmers/export` | farmers + crop farms JSON |
| `POST /api/admin/farmers/delete` | remove farmer by `farmer_id` |
| `POST /api/admin/farmers/delete-bulk` | `{ farmer_ids: [] }` remove many farmers |
| `POST /api/admin/farmers/reset-password` | set new random password (shown once; old hash not readable) |
| `POST /api/farms/*` | multi-farm ledger |
