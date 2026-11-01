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

### 2. Sender address (`EMAIL_FROM`)

Configured in [wrangler.toml](wrangler.toml) and deployed with the Worker.

**Important:** In **Cloudflare → agriman → Settings → Variables**, remove any old **`EMAIL_FROM`** that points at an **unverified** domain (e.g. `@agribak.com` before DNS is done). Otherwise sends fail with “domain is not verified.”

After deploy, health shows the active sender:

https://agriman.agribakr.workers.dev/api/farm/health → `"email_ready": true`, `"email_from": "..."`

The Worker tries **`EMAIL_FROM`**, then falls back to **`onboarding@resend.dev`** if the primary domain is not verified yet.

### 3. Testing vs production recipients

**Testing (current):** [wrangler.toml](wrangler.toml) sets `EMAIL_TEST_TO` to your Resend login Gmail. Welcome mail is **delivered there** even if the farmer registers with another address; the registered email is stored in D1 and noted in the message body.

Remove `EMAIL_TEST_TO` (or clear it in Cloudflare Variables) before go-live.

**Production:** In [resend.com/domains](https://resend.com/domains), add e.g. **`mail.agribak.com`**, add DNS records at your provider, wait for **Verified**, then:

```toml
# Remove or comment out EMAIL_TEST_TO
EMAIL_FROM = "AgriMan <noreply@mail.agribak.com>"
```

Redeploy. Farmers receive mail at the address they register with.

### 4. Verify `agribak.com` (send to any farmer email)

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

## API overview

| Route | Purpose |
|-------|---------|
| `GET /api/farm/health` | D1 + `email_ready` + `email_from` |
| `POST /api/farmer/register` | email + password → welcome email |
| `POST /api/farmer/login` | FarmerID + password |
| `POST /api/farms/*` | multi-farm ledger |
