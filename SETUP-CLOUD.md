# AgriMan cloud sync

Live app: https://agriman.agribakr.workers.dev/

## Cloudflare Git deploy settings (fix the build error)

Your project is a **Worker**. In **Workers & Pages → agriman → Settings → Build**:

| Setting | Value |
|--------|--------|
| Build command | *(leave empty)* |
| **Deploy command** | `npx wrangler deploy ./src/worker.js --assets=.` |

Do **not** use `wrangler pages deploy`.

We removed the `functions/` folder (that made Cloudflare think this was Pages and then fail with “Missing entry-point”).

## Email on register (required for signup — Resend)

Registration is **email only**. After signup, the Worker sends **FarmerID** + **password** via [Resend](https://resend.com).

### 1. Resend account

1. Sign up at [resend.com](https://resend.com).
2. Create an **API key** (Sending access).

### 2. Cloudflare Worker secret (required)

From your machine (logged into Wrangler for account `33b8081b…`):

```bash
cd /path/to/farm-money-tracker
npx wrangler secret put RESEND_API_KEY
# paste the re_... key when prompted
```

Redeploy (push to `main` or `npx wrangler deploy ./src/worker.js --assets=.`).

### 3. Check it is wired

Open https://agriman.agribakr.workers.dev/api/farm/health

You should see `"email_ready": true`. If `false`, `RESEND_API_KEY` is not set on the Worker.

### 4. Sender address

Default sender is in [wrangler.toml](wrangler.toml):

`EMAIL_FROM = "AgriMan <onboarding@resend.dev>"`

**Resend free tier:** without a verified domain, you can usually only send **to the email address on your Resend account** (for testing). To mail any farmer address, add and verify your domain in Resend, then set e.g.:

```toml
EMAIL_FROM = "AgriMan <hello@yourdomain.com>"
```

### 5. What the user receives

Subject: **Your AgriMan FarmerID and password**

Body includes FarmerID (`AgriBakMan-…`), password, and link to the app.

If sending fails, registration still completes and the app shows FarmerID on screen (`email_not_sent`).

## API overview

| Route | Purpose |
|-------|---------|
| `GET /api/farm/health` | D1 health + `email_ready` |
| `POST /api/farmer/register` | email + password → `AgriBakMan-*` + welcome email |
| `POST /api/farmer/login` | FarmerID + password |
| `POST /api/farms/list` | farms for session |
| `POST /api/farms/create` | new crop farm |
| `POST /api/farms/load` / `save` | per-farm ledger JSON |

## After deploy

1. Open https://agriman.agribakr.workers.dev/
2. Health check shows `email_ready: true` after secret is set
3. **Register** with a real email you can read (or your Resend account email on free tier)
