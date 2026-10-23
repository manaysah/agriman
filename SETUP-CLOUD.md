# AgriMan cloud sync

## Important

`agriman` is a **Cloudflare Worker** (not Pages).

- Live app: https://agriman.agribakr.workers.dev/
- D1 database: `agriman-db` bound as `DB`
- Health: https://agriman.agribakr.workers.dev/api/farm/health

## Build settings (Workers / Git)

If Git auto-deploy fails:

- Do **not** use Pages-only settings
- `wrangler.toml` must include `main = "src/worker.js"` and `[assets]`
- Build/deploy should use **Workers** (`wrangler deploy`), not `wrangler pages deploy`

## Use the app

1. Open https://agriman.agribakr.workers.dev/
2. **Create farm** → password
3. Share **Farm ID + password** → partner uses **Join farm**
