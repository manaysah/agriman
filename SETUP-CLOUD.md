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

## After deploy

1. Open https://agriman.agribakr.workers.dev/
2. Check https://agriman.agribakr.workers.dev/api/farm/health → `{"ok":true,...}`
3. **Create farm** / **Join farm**
