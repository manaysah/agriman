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

## Email on register (Resend free tier)

Registration can email **FarmerID** + password via [Resend](https://resend.com).

1. Create a Resend API key.
2. Set Worker secrets:

```bash
npx wrangler secret put RESEND_API_KEY
```

3. Optional: set a verified sender (default uses Resend onboarding address):

```bash
# In wrangler.toml [vars] or as secret:
# EMAIL_FROM = "AgriMan <onboarding@resend.dev>"
```

If email fails, registration still succeeds and credentials are shown on screen.

## API overview

| Route | Purpose |
|-------|---------|
| `GET /api/farm/health` | D1 health check |
| `POST /api/farmer/register` | email/phone + password → `AgriBakMan-*` |
| `POST /api/farmer/login` | FarmerID + password |
| `POST /api/farms/list` | farms for session |
| `POST /api/farms/create` | new crop farm |
| `POST /api/farms/load` / `save` | per-farm ledger JSON |

Legacy `POST /api/farm/login|load|save` still work for older clients.

## After deploy

1. Open https://agriman.agribakr.workers.dev/
2. Check https://agriman.agribakr.workers.dev/api/farm/health → `{"ok":true,...}`
3. **Register** or **Log in** with FarmerID (`AgriBakMan-*`; legacy `AM-*` maps after migration)
